import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware";
import bcrypt from "bcrypt";
import { z } from "zod";
import { uploadImage, deleteImage, R2_PUBLIC_URL } from "../upload";
import rateLimit from "express-rate-limit";
import { cfAwareKeyGenerator } from "../utils/rate-limit";
import { sanitizeObject } from "../utils/sanitize";
import * as cache from "../lib/cache";

const sensitiveOpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { message: "Rate limit exceeded for this operation. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: cfAwareKeyGenerator,
});

const router = Router();

const profileSettingsSchema = z.object({
  name:         z.string().min(1).max(60).optional(),
  bio:          z.string().max(1000).optional(),
  city:         z.string().max(80).optional(),
  country:      z.string().max(60).optional(),
  languages:    z.array(z.string().max(40)).max(10).optional(),
  coachingMode: z.enum(["ONLINE", "IN_PERSON", "HYBRID"]).optional(),
});

router.patch("/api/settings/profile", requireAuth, async (req, res) => {
  try {
    const parsed = profileSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0]?.message || "Validation error" });
    }
    const clean = sanitizeObject(parsed.data);
    const { name, bio, city, country, languages, coachingMode } = clean;
    if (name) await storage.updateUser(req.session.userId!, { name });
    await storage.upsertProfile({
      userId: req.session.userId!,
      bio, city, country, languages, coachingMode,
    });
    // Invalidate cached trainer profile and all listing pages
    const uid = req.session.userId!;
    await Promise.allSettled([
      cache.del(`trainers:profile:${uid}`),
      cache.delPattern("trainers:list:*"),
    ]);
    return res.json({ success: true });
  } catch (e) {
    console.error("[PATCH /api/settings/profile]:", e);
    return res.status(500).json({ message: "Failed to update profile" });
  }
});

router.patch("/api/settings/password", sensitiveOpLimiter, requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }
    if (newPassword.length > 72) {
      return res.status(400).json({ message: "Password must be 72 characters or less" });
    }
    const user = await storage.getUser(req.session.userId!);
    if (!user || !user.passwordHash) return res.status(400).json({ message: "Cannot change password" });
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Current password is incorrect" });
    const newHash = await bcrypt.hash(newPassword, 12);
    await storage.updateUser(req.session.userId!, { passwordHash: newHash });
    return res.json({ success: true });
  } catch (e) {
    console.error("[PATCH /api/settings/password]:", e);
    return res.status(500).json({ message: "Failed to update password" });
  }
});

router.post("/api/settings/avatar", requireAuth, async (req, res) => {
  try {
    const { image } = req.body;
    if (!image || typeof image !== "string") {
      return res.status(400).json({ message: "image is required" });
    }
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const mimeMatch = image.match(/^data:(image\/[a-z+]+);/);
    if (!mimeMatch || !allowedMimeTypes.includes(mimeMatch[1])) {
      return res.status(400).json({ message: "Unsupported image format. Use JPEG, PNG, WebP, or GIF." });
    }
    // Base64 strings are ~33% larger than binary — 7MB base64 ≈ 5MB actual image data
    if (image.length > 7 * 1024 * 1024) {
      return res.status(400).json({ message: "Image too large (max 5MB)" });
    }
    // Delete old R2 image if present
    const existingUser = await storage.getUser(req.session.userId!);
    if (existingUser?.image && R2_PUBLIC_URL && existingUser.image.startsWith(R2_PUBLIC_URL)) {
      await deleteImage(existingUser.image).catch(console.error);
    }
    // Upload new image (falls back to base64 if R2 not configured)
    const imageUrl = await uploadImage(image);
    const user = await storage.updateUser(req.session.userId!, { image: imageUrl });
    return res.json({ image: user?.image });
  } catch (e) {
    console.error("[POST /api/settings/avatar]:", e);
    return res.status(500).json({ message: "Failed to update avatar" });
  }
});

const trainerProfileSettingsSchema = z.object({
  specialties: z.array(z.string().max(60)).max(30).optional(),
  yearsExperience: z.number().int().min(0).max(60).optional(),
  certifications: z.array(z.string().max(120)).max(30).optional(),
  priceMin: z.number().int().min(0).max(100_000_000).optional(),
  priceMax: z.number().int().min(0).max(100_000_000).optional(),
  availabilityNotes: z.string().max(1000).optional(),
  coachingMode: z.enum(["ONLINE", "IN_PERSON", "HYBRID"]).optional(),
});

router.patch("/api/settings/trainer-profile", requireAuth, async (req, res) => {
  try {
    const user = await storage.getUser(req.session.userId!);
    if (!user || (user.role !== "TRAINER" && user.role !== "BOTH")) {
      return res.status(403).json({ message: "Trainer access required" });
    }
    const parsed = trainerProfileSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0]?.message || "Validation error" });
    }
    // Strip any HTML/script from free-text fields (consistent with /settings/profile)
    const clean = sanitizeObject(parsed.data);
    const existing = await storage.getTrainerProfile(req.session.userId!);
    const tp = await storage.upsertTrainerProfile({
      userId: req.session.userId!,
      specialties: clean.specialties ?? existing?.specialties ?? [],
      yearsExperience: clean.yearsExperience ?? existing?.yearsExperience ?? 0,
      certifications: clean.certifications ?? existing?.certifications ?? [],
      priceMin: clean.priceMin ?? existing?.priceMin ?? 0,
      priceMax: clean.priceMax ?? existing?.priceMax ?? 0,
      availabilityNotes: clean.availabilityNotes ?? existing?.availabilityNotes ?? "",
      radiusKm: existing?.radiusKm ?? 0,
    });
    // Invalidate cached trainer profile and all listing pages
    const uid = req.session.userId!;
    await Promise.allSettled([
      cache.del(`trainers:profile:${uid}`),
      cache.delPattern("trainers:list:*"),
    ]);
    return res.json(tp);
  } catch (e) {
    console.error("[PATCH /api/settings/trainer-profile]:", e);
    return res.status(500).json({ message: "Failed to update trainer profile" });
  }
});

const clientProfileSettingsSchema = z.object({
  goals: z.array(z.string().max(60)).max(20).optional(),
  experienceLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  budgetMin: z.number().int().min(0).max(100_000_000).optional(),
  budgetMax: z.number().int().min(0).max(100_000_000).optional(),
});

router.patch("/api/settings/client-profile", requireAuth, async (req, res) => {
  try {
    const user = await storage.getUser(req.session.userId!);
    if (!user || (user.role !== "CLIENT" && user.role !== "BOTH")) {
      return res.status(403).json({ message: "Client access required" });
    }
    const parsed = clientProfileSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0]?.message || "Validation error" });
    }
    // Strip any HTML/script from free-text fields (consistent with /settings/profile)
    const clean = sanitizeObject(parsed.data);
    const existing = await storage.getClientProfile(req.session.userId!);
    const cp = await storage.upsertClientProfile({
      userId: req.session.userId!,
      goals: clean.goals ?? existing?.goals ?? [],
      experienceLevel: (clean.experienceLevel ?? existing?.experienceLevel ?? "BEGINNER") as any,
      budgetMin: clean.budgetMin ?? existing?.budgetMin ?? 0,
      budgetMax: clean.budgetMax ?? existing?.budgetMax ?? 0,
    });
    return res.json(cp);
  } catch (e) {
    console.error("[PATCH /api/settings/client-profile]:", e);
    return res.status(500).json({ message: "Failed to update client profile" });
  }
});

export default router;
