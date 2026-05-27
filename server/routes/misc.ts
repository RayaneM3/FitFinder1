import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware";
import { z } from "zod";
import { createReviewSchema } from "@shared/schema";
import { pool } from "../db";
import { deleteImage, R2_PUBLIC_URL } from "../upload";
import rateLimit from "express-rate-limit";
import { sanitizeObject } from "../utils/sanitize";
import * as cache from "../lib/cache";

const sensitiveOpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { message: "Rate limit exceeded for this operation. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

// ========== ACCOUNT DELETION ==========
router.delete("/api/account", sensitiveOpLimiter, requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    // Fetch avatar URL before deletion so we can clean up R2
    const userToDelete = await storage.getUser(userId);
    const avatarUrl = userToDelete?.image;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(`DELETE FROM messages WHERE sender_id = $1`, [userId]);
      await client.query(`DELETE FROM conversations WHERE client_id = $1 OR trainer_id = $1`, [userId]);
      await client.query(`UPDATE orders SET status = 'CANCELED', updated_at = NOW() WHERE buyer_id = $1 AND status = 'PENDING'`, [userId]);
      await client.query(`DELETE FROM orders WHERE buyer_id = $1`, [userId]);
      await client.query(`DELETE FROM reviews WHERE reviewer_id = $1`, [userId]);
      await client.query(`DELETE FROM favorites WHERE user_id = $1`, [userId]);
      await client.query(`DELETE FROM blocks WHERE blocker_id = $1 OR blocked_id = $1`, [userId]);
      await client.query(`DELETE FROM reports WHERE reporter_id = $1`, [userId]);
      await client.query(`DELETE FROM legal_acceptances WHERE user_id = $1`, [userId]);
      await client.query(`DELETE FROM password_reset_tokens WHERE user_id = $1`, [userId]);
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
    // Clean up R2 avatar after DB deletion (best-effort)
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
    const userId = req.session.userId!;

    const order = await storage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.buyerId !== userId) {
      return res.status(403).json({ message: "Not your order" });
    }
    if (order.status !== "PAID") {
      return res.status(400).json({ message: "Can only review paid orders" });
    }

    const existing = await storage.getReviewByOrder(orderId);
    if (existing) {
      return res.status(409).json({ message: "You have already reviewed this order" });
    }

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

router.get("/api/reviews/:trainerId", async (req, res) => {
  try {
    const result = await storage.getTrainerReviews(req.params.trainerId);
    return res.json(result);
  } catch (e) {
    console.error("[GET /api/reviews/:trainerId]:", e);
    return res.status(500).json({ message: "Failed to load reviews" });
  }
});

// ========== PLANS ==========
const createPlanSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
  description: z.string().max(2000, "Description must be 2000 characters or less").optional(),
  priceCents: z.number().int().min(50, "Price must be at least $0.50"),
  currency: z.enum(["usd", "gbp", "eur"]).default("usd"),
  billingType: z.enum(["ONE_TIME", "MONTHLY"]).default("ONE_TIME"),
});

router.get("/api/plans", requireAuth, async (req, res) => {
  try {
    const plans = await storage.getPlans(req.session.userId!);
    return res.json(plans);
  } catch (e) {
    console.error("[GET /api/plans]:", e);
    return res.status(500).json({ message: "Failed to load plans" });
  }
});

router.post("/api/plans", requireAuth, async (req, res) => {
  try {
    const user = await storage.getUser(req.session.userId!);
    if (!user || (user.role !== "TRAINER" && user.role !== "BOTH")) {
      return res.status(403).json({ message: "Only trainers can create plans" });
    }

    const parsed = createPlanSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0]?.message || "Validation error" });
    }

    const clean = sanitizeObject(parsed.data);
    const { title, description, priceCents, currency, billingType } = clean;
    const plan = await storage.createPlan({
      trainerId: req.session.userId!,
      title,
      description: description || "",
      priceCents,
      currency,
      billingType,
    });
    // Invalidate trainer profile (plans are embedded) and all listing pages
    const uid = req.session.userId!;
    await Promise.allSettled([
      cache.del(`trainers:profile:${uid}`),
      cache.delPattern("trainers:list:*"),
    ]);
    return res.json(plan);
  } catch (e) {
    console.error("[POST /api/plans]:", e);
    return res.status(500).json({ message: "Failed to create plan" });
  }
});

const updatePlanSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  priceCents: z.number().int().min(100).max(100_000_000).optional(), // min £1, max £1M
  billingType: z.enum(["ONE_TIME", "MONTHLY"]).optional(),
  isActive: z.boolean().optional(),
});

router.patch("/api/plans/:id", requireAuth, async (req, res) => {
  try {
    const planId = req.params.id as string;
    const plan = await storage.getPlan(planId);
    if (!plan || plan.trainerId !== req.session.userId!) {
      return res.status(403).json({ message: "Not your plan" });
    }
    const parsed = updatePlanSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0]?.message || "Validation error" });
    }
    const updated = await storage.updatePlan(planId, sanitizeObject(parsed.data));
    // Invalidate trainer profile (plans are embedded) and all listing pages.
    // Use the wildcard pattern as specified — catches both listing and profile caches.
    await Promise.allSettled([
      cache.del(`trainers:profile:${req.session.userId!}`),
      cache.delPattern("trainers:*"),
    ]);
    return res.json(updated);
  } catch (e) {
    console.error("[PATCH /api/plans/:id]:", e);
    return res.status(500).json({ message: "Failed to update plan" });
  }
});

// ========== ORDERS ==========
router.post("/api/orders", requireAuth, async (req, res) => {
  return res.status(410).json({ message: "Use /api/checkout instead" });
});

router.get("/api/orders", requireAuth, async (req, res) => {
  try {
    const orders = await storage.getUserOrders(req.session.userId!);
    return res.json(orders);
  } catch (e) {
    console.error("[GET /api/orders]:", e);
    return res.status(500).json({ message: "Failed to load orders" });
  }
});

router.get("/api/orders/trainer", requireAuth, async (req, res) => {
  try {
    const orders = await storage.getTrainerOrders(req.session.userId!);
    return res.json(orders);
  } catch (e) {
    console.error("[GET /api/orders/trainer]:", e);
    return res.status(500).json({ message: "Failed to load trainer orders" });
  }
});

// ========== FAVORITES ==========
router.post("/api/favorites/toggle", requireAuth, async (req, res) => {
  try {
    const { trainerId } = req.body;
    if (!trainerId || typeof trainerId !== "string") {
      return res.status(400).json({ message: "trainerId is required" });
    }
    const isFav = await storage.toggleFavorite(req.session.userId!, trainerId);
    return res.json({ isFavorited: isFav });
  } catch (e) {
    console.error("[POST /api/favorites/toggle]:", e);
    return res.status(500).json({ message: "Failed to toggle favorite" });
  }
});

router.get("/api/favorites", requireAuth, async (req, res) => {
  try {
    const favs = await storage.getFavorites(req.session.userId!);
    return res.json(favs);
  } catch (e) {
    console.error("[GET /api/favorites]:", e);
    return res.status(500).json({ message: "Failed to load favorites" });
  }
});

// ========== STATS ==========
router.get("/api/stats", async (req, res) => {
  try {
    const stats = await storage.getStats();
    return res.json(stats);
  } catch (e) {
    console.error("[stats]:", e);
    return res.json({ trainerCount: 0, userCount: 0 });
  }
});

// ========== DASHBOARD ==========
router.get("/api/client-profile", requireAuth, async (req, res) => {
  try {
    const cp = await storage.getClientProfile(req.session.userId!);
    if (!cp) return res.json(null);
    return res.json(cp);
  } catch (e) {
    console.error("[GET /api/client-profile]:", e);
    return res.status(500).json({ message: "Failed to load client profile" });
  }
});

router.get("/api/profile", requireAuth, async (req, res) => {
  try {
    const profile = await storage.getProfile(req.session.userId!);
    if (!profile) return res.json(null);
    return res.json(profile);
  } catch (e) {
    console.error("[GET /api/profile]:", e);
    return res.status(500).json({ message: "Failed to load profile" });
  }
});

router.get("/api/trainer-profile", requireAuth, async (req, res) => {
  try {
    const tp = await storage.getTrainerProfile(req.session.userId!);
    if (!tp) return res.json(null);
    return res.json(tp);
  } catch (e) {
    console.error("[GET /api/trainer-profile]:", e);
    return res.status(500).json({ message: "Failed to load trainer profile" });
  }
});

router.get("/api/dashboard/trainer", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const convos = await storage.getUserConversations(userId);
    const trainerOrders = await storage.getTrainerOrders(userId);
    const paidBuyerIds = new Set(trainerOrders.filter(o => o.status === "PAID").map(o => o.buyerId));

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
    const userId = req.session.userId!;
    const myOrders = await storage.getUserOrders(userId);
    const favs = await storage.getFavorites(userId);
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
    // Deduplicate: skip insert if user already accepted this document+version
    const alreadyAccepted = await storage.hasAccepted(
      req.session.userId!,
      parsed.data.documentType,
      parsed.data.version,
    );
    if (alreadyAccepted) {
      return res.json({ duplicate: true });
    }
    const acceptance = await storage.createLegalAcceptance({
      userId: req.session.userId!,
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
    const acceptances = await storage.getUserAcceptances(req.session.userId!);
    return res.json(acceptances);
  } catch (e) {
    console.error("[GET /api/legal/acceptances]:", e);
    return res.status(500).json({ message: "Failed to load legal acceptances" });
  }
});

export default router;
