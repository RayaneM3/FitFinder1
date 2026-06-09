import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware";
import { z } from "zod";
import { createReviewSchema } from "@shared/schema";
import { pool } from "../db";
import { deleteImage, R2_PUBLIC_URL } from "../upload";
import rateLimit from "express-rate-limit";
import { cfAwareKeyGenerator } from "../utils/rate-limit";
import { sanitizeObject } from "../utils/sanitize";
import * as cache from "../lib/cache";

const sensitiveOpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: "Rate limit exceeded for this operation. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: cfAwareKeyGenerator,
});

const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { message: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: cfAwareKeyGenerator,
});

const router = Router();

// ========== ACCOUNT DELETION ==========
router.delete("/api/account", sensitiveOpLimiter, requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const avatarUrl = req.user!.image;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      // Tokens
      await client.query(`DELETE FROM email_verification_tokens WHERE user_id = $1`, [userId]);
      await client.query(`DELETE FROM password_reset_tokens WHERE user_id = $1`, [userId]);
      // Messages & conversations (delete messages first to satisfy FK)
      await client.query(
        `DELETE FROM messages WHERE conversation_id IN (
           SELECT id FROM conversations WHERE client_id = $1 OR trainer_id = $1
         )`, [userId]
      );
      await client.query(`DELETE FROM conversations WHERE client_id = $1 OR trainer_id = $1`, [userId]);
      // Reviews (must precede orders to satisfy FK)
      await client.query(`DELETE FROM reviews WHERE reviewer_id = $1 OR trainer_id = $1`, [userId]);
      // Plans — nullify orders.plan_id first, then delete plans
      await client.query(
        `UPDATE orders SET plan_id = NULL WHERE plan_id IN (SELECT id FROM plans WHERE trainer_id = $1)`,
        [userId]
      );
      await client.query(`DELETE FROM plans WHERE trainer_id = $1`, [userId]);
      // Orders (both as buyer and trainer)
      await client.query(`DELETE FROM orders WHERE buyer_id = $1 OR trainer_id = $1`, [userId]);
      // Supporting tables
      await client.query(`DELETE FROM favorites WHERE user_id = $1 OR trainer_id = $1`, [userId]);
      await client.query(`DELETE FROM blocks WHERE blocker_id = $1 OR blocked_id = $1`, [userId]);
      await client.query(`DELETE FROM reports WHERE reporter_id = $1 OR reported_id = $1`, [userId]);
      await client.query(`DELETE FROM legal_acceptances WHERE user_id = $1`, [userId]);
      // Profile tables
      await client.query(`DELETE FROM client_profiles WHERE user_id = $1`, [userId]);
      await client.query(`DELETE FROM trainer_profiles WHERE user_id = $1`, [userId]);
      await client.query(`DELETE FROM profiles WHERE user_id = $1`, [userId]);
      await client.query(`DELETE FROM users WHERE id = $1`, [userId]);
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }

    if (avatarUrl && R2_PUBLIC_URL && avatarUrl.startsWith(R2_PUBLIC_URL)) {
      deleteImage(avatarUrl).catch((e) => console.error("[account] Failed to delete avatar from R2:", e));
    }

    req.session.destroy(() => {
      res.json({ success: true, message: "Account deleted" });
    });
  } catch (e) {
    console.error("[DELETE /api/account]:", e);
    return res.status(500).json({ message: "Failed to delete account" });
  }
});

// ========== REVIEWS ==========
router.post("/api/reviews", requireAuth, async (req, res) => {
  try {
    const parsed = createReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0]?.message || "Validation error" });
    }
    const { orderId, rating, comment } = parsed.data;
    const userId = req.user!.id;

    const order = await storage.getOrder(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.buyerId !== userId) return res.status(403).json({ message: "Not your order" });
    if (order.status !== "PAID") return res.status(403).json({ message: "A completed payment is required before leaving a review.", code: "PAYMENT_REQUIRED" });

    const existing = await storage.getReviewByOrder(orderId);
    if (existing) return res.status(409).json({ message: "You have already reviewed this order" });

    const review = await storage.createReview({
      reviewerId: userId,
      trainerId: order.trainerId,
      orderId,
      rating,
      comment: comment || "",
    });
    return res.json(review);
  } catch (e) {
    console.error("[POST /api/reviews]:", e);
    return res.status(500).json({ message: "Failed to create review" });
  }
});

router.get("/api/reviews/:trainerId", publicLimiter, async (req, res) => {
  try {
    const result = await storage.getTrainerReviews(req.params.trainerId as string);
    return res.json(result);
  } catch (e) {
    console.error("[GET /api/reviews/:trainerId]:", e);
    return res.status(500).json({ message: "Failed to load reviews" });
  }
});

// ========== PLANS ==========
const createPlanSchema = z.object({
  title:       z.string().min(1, "Title is required").max(100),
  description: z.string().max(2000).optional(),
  priceCents:  z.number().int().min(50, "Price must be at least $0.50"),
  currency:    z.enum(["usd", "gbp", "eur"]).default("usd"),
  billingType: z.enum(["ONE_TIME", "MONTHLY"]).default("ONE_TIME"),
});

const updatePlanSchema = z.object({
  title:       z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  priceCents:  z.number().int().min(100).max(100_000_000).optional(),
  billingType: z.enum(["ONE_TIME", "MONTHLY"]).optional(),
  isActive:    z.boolean().optional(),
});

router.get("/api/plans", requireAuth, async (req, res) => {
  try {
    const plans = await storage.getPlans(req.user!.id);
    return res.json(plans);
  } catch (e) {
    console.error("[GET /api/plans]:", e);
    return res.status(500).json({ message: "Failed to load plans" });
  }
});

router.post("/api/plans", requireAuth, async (req, res) => {
  try {
    const user = req.user!;
    if (user.role !== "TRAINER" && user.role !== "BOTH") {
      return res.status(403).json({ message: "Only trainers can create plans" });
    }
    const parsed = createPlanSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0]?.message || "Validation error" });
    }
    const clean = sanitizeObject(parsed.data);
    const plan = await storage.createPlan({
      trainerId:   user.id,
      title:       clean.title,
      description: clean.description || "",
      priceCents:  clean.priceCents,
      currency:    clean.currency,
      billingType: clean.billingType,
    });
    await Promise.allSettled([
      cache.del(`trainers:profile:${user.id}`),
      cache.delPattern("trainers:*"),
    ]);
    return res.json(plan);
  } catch (e) {
    console.error("[POST /api/plans]:", e);
    return res.status(500).json({ message: "Failed to create plan" });
  }
});

router.patch("/api/plans/:id", requireAuth, async (req, res) => {
  try {
    const planId = req.params.id as string;
    const plan = await storage.getPlan(planId);
    if (!plan || plan.trainerId !== req.user!.id) {
      return res.status(403).json({ message: "Not your plan" });
    }
    const parsed = updatePlanSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0]?.message || "Validation error" });
    }
    const updated = await storage.updatePlan(planId, sanitizeObject(parsed.data));
    await Promise.allSettled([
      cache.del(`trainers:profile:${req.user!.id}`),
      cache.delPattern("trainers:*"),
    ]);
    return res.json(updated);
  } catch (e) {
    console.error("[PATCH /api/plans/:id]:", e);
    return res.status(500).json({ message: "Failed to update plan" });
  }
});

router.delete("/api/plans/:id", requireAuth, async (req, res) => {
  try {
    const planId = req.params.id as string;
    const plan = await storage.getPlan(planId);
    if (!plan || plan.trainerId !== req.user!.id) {
      return res.status(403).json({ message: "Not your plan" });
    }
    await storage.deletePlan(planId);
    await Promise.allSettled([
      cache.del(`trainers:profile:${req.user!.id}`),
      cache.delPattern("trainers:*"),
    ]);
    return res.json({ success: true });
  } catch (e) {
    console.error("[DELETE /api/plans/:id]:", e);
    return res.status(500).json({ message: "Failed to delete plan" });
  }
});

// ========== ORDERS ==========
router.post("/api/orders", requireAuth, async (_req, res) => {
  return res.status(410).json({ message: "Use /api/checkout instead" });
});

router.get("/api/orders", requireAuth, async (req, res) => {
  try {
    const orders = await storage.getUserOrders(req.user!.id);
    return res.json(orders);
  } catch (e) {
    console.error("[GET /api/orders]:", e);
    return res.status(500).json({ message: "Failed to load orders" });
  }
});

router.get("/api/orders/trainer", requireAuth, async (req, res) => {
  try {
    const orders = await storage.getTrainerOrders(req.user!.id);
    return res.json(orders);
  } catch (e) {
    console.error("[GET /api/orders/trainer]:", e);
    return res.status(500).json({ message: "Failed to load trainer orders" });
  }
});

router.get("/api/orders/:id", requireAuth, async (req, res) => {
  try {
    const order = await storage.getOrder(req.params.id as string);
    if (!order) return res.status(404).json({ message: "Order not found" });
    const userId = req.user!.id;
    if (order.buyerId !== userId && order.trainerId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return res.json(order);
  } catch (e) {
    console.error("[GET /api/orders/:id]:", e);
    return res.status(500).json({ message: "Failed to load order" });
  }
});

// ========== TRAINER EARNINGS & CLIENTS ==========
router.get("/api/trainer/earnings", requireAuth, async (req, res) => {
  try {
    const user = req.user!;
    if (user.role !== "TRAINER" && user.role !== "BOTH") {
      return res.status(403).json({ message: "Only trainers can view earnings" });
    }
    const earnings = await storage.getTrainerEarnings(user.id);
    return res.json(earnings);
  } catch (e) {
    console.error("[GET /api/trainer/earnings]:", e);
    return res.status(500).json({ message: "Failed to load earnings" });
  }
});

router.get("/api/trainer/clients", requireAuth, async (req, res) => {
  try {
    const user = req.user!;
    if (user.role !== "TRAINER" && user.role !== "BOTH") {
      return res.status(403).json({ message: "Only trainers can view clients" });
    }
    const clients = await storage.getTrainerClients(user.id);
    return res.json(clients);
  } catch (e) {
    console.error("[GET /api/trainer/clients]:", e);
    return res.status(500).json({ message: "Failed to load clients" });
  }
});

// ========== FAVORITES ==========
router.post("/api/favorites/toggle", requireAuth, async (req, res) => {
  try {
    const { trainerId } = req.body;
    if (!trainerId || typeof trainerId !== "string") {
      return res.status(400).json({ message: "trainerId is required" });
    }
    if (trainerId === req.user!.id) {
      return res.status(400).json({ message: "Cannot favorite yourself" });
    }
    const isFav = await storage.toggleFavorite(req.user!.id, trainerId);
    return res.json({ isFavorited: isFav });
  } catch (e) {
    console.error("[POST /api/favorites/toggle]:", e);
    return res.status(500).json({ message: "Failed to toggle favorite" });
  }
});

router.get("/api/favorites", requireAuth, async (req, res) => {
  try {
    const favs = await storage.getFavorites(req.user!.id);
    return res.json(favs);
  } catch (e) {
    console.error("[GET /api/favorites]:", e);
    return res.status(500).json({ message: "Failed to load favorites" });
  }
});

// ========== STATS ==========
router.get("/api/stats", publicLimiter, async (_req, res) => {
  try {
    const stats = await storage.getStats();
    return res.json(stats);
  } catch (e) {
    console.error("[stats]:", e);
    return res.json({ trainerCount: 0, userCount: 0 });
  }
});

// ========== PROFILE GETTERS ==========
router.get("/api/client-profile", requireAuth, async (req, res) => {
  try {
    const cp = await storage.getClientProfile(req.user!.id);
    return res.json(cp ?? null);
  } catch (e) {
    console.error("[GET /api/client-profile]:", e);
    return res.status(500).json({ message: "Failed to load client profile" });
  }
});

router.get("/api/profile", requireAuth, async (req, res) => {
  try {
    const profile = await storage.getProfile(req.user!.id);
    return res.json(profile ?? null);
  } catch (e) {
    console.error("[GET /api/profile]:", e);
    return res.status(500).json({ message: "Failed to load profile" });
  }
});

router.get("/api/trainer-profile", requireAuth, async (req, res) => {
  try {
    const tp = await storage.getTrainerProfile(req.user!.id);
    return res.json(tp ?? null);
  } catch (e) {
    console.error("[GET /api/trainer-profile]:", e);
    return res.status(500).json({ message: "Failed to load trainer profile" });
  }
});

// ========== DASHBOARD ==========
router.get("/api/dashboard/trainer", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const [convos, trainerOrders] = await Promise.all([
      storage.getUserConversations(userId),
      storage.getTrainerOrders(userId),
    ]);
    const paidBuyerIds = new Set(
      trainerOrders.filter((o: any) => o.status === "PAID").map((o: any) => o.buyerId)
    );
    const leads = convos.filter((c: any) => c.otherUser?.id && !paidBuyerIds.has(c.otherUser.id));
    const activeClients = convos.filter((c: any) => c.otherUser?.id && paidBuyerIds.has(c.otherUser.id));
    return res.json({ leads, activeClients, orders: trainerOrders });
  } catch (e) {
    console.error("[GET /api/dashboard/trainer]:", e);
    return res.status(500).json({ message: "Failed to load trainer dashboard" });
  }
});

router.get("/api/dashboard/client", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const [myOrders, favs] = await Promise.all([
      storage.getUserOrders(userId),
      storage.getFavorites(userId),
    ]);
    return res.json({ orders: myOrders, favorites: favs });
  } catch (e) {
    console.error("[GET /api/dashboard/client]:", e);
    return res.status(500).json({ message: "Failed to load client dashboard" });
  }
});

// ========== LEGAL ACCEPTANCES ==========
const legalAcceptSchema = z.object({
  documentType: z.enum(["TERMS", "PRIVACY", "TRAINER_AGREEMENT", "CLIENT_WAIVER", "COMMUNITY_GUIDELINES", "REFUNDS"]),
  version: z.string().min(1),
});

router.post("/api/legal/accept", requireAuth, async (req, res) => {
  try {
    const parsed = legalAcceptSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid documentType or version" });
    }
    const userId = req.user!.id;
    const alreadyAccepted = await storage.hasAccepted(userId, parsed.data.documentType, parsed.data.version);
    if (alreadyAccepted) return res.json({ duplicate: true });

    const acceptance = await storage.createLegalAcceptance({
      userId,
      documentType: parsed.data.documentType,
      version: parsed.data.version,
      ipAddress: req.ip || null,
      userAgent: req.headers["user-agent"] || null,
    });
    return res.json(acceptance);
  } catch (e) {
    console.error("[POST /api/legal/accept]:", e);
    return res.status(500).json({ message: "Failed to save legal acceptance" });
  }
});

router.get("/api/legal/acceptances", requireAuth, async (req, res) => {
  try {
    const acceptances = await storage.getUserAcceptances(req.user!.id);
    return res.json(acceptances);
  } catch (e) {
    console.error("[GET /api/legal/acceptances]:", e);
    return res.status(500).json({ message: "Failed to load legal acceptances" });
  }
});

export default router;
