import { Router } from "express";
import { storage } from "../storage";
import { exploreFiltersSchema } from "@shared/schema";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { cfAwareKeyGenerator } from "../utils/rate-limit";
import * as cache from "../lib/cache";

const router = Router();

const trainersLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60, // 60 requests per minute per IP
  message: { message: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: cfAwareKeyGenerator,
});

// ── Cache TTLs ────────────────────────────────────────────────────────────────
const LISTING_TTL_SECONDS = 60;       // explore page listing
const PROFILE_TTL_SECONDS = 5 * 60;  // individual trainer profile

/** Build a deterministic cache key for the trainer listing from all query params. */
function buildListingCacheKey(query: Record<string, unknown>): string {
  const params = new URLSearchParams({
    search:       String(query.search ?? ""),
    city:         String(query.city ?? ""),
    country:      String(query.country ?? ""),
    coachingMode: String(query.coachingMode ?? ""),
    specialties:  String(query.specialties ?? ""),
    priceMin:     String(query.priceMin ?? ""),
    priceMax:     String(query.priceMax ?? ""),
    language:     String(query.language ?? ""),
    page:         String(query.page ?? "1"),
    pageSize:     String(query.pageSize ?? "12"),
    sort:         String(query.sort ?? ""),
  });
  return `trainers:list:${params.toString()}`;
}

router.get("/api/trainers", trainersLimiter, async (req, res) => {
  const cacheKey = buildListingCacheKey(req.query as Record<string, unknown>);

  // ── Cache read ──────────────────────────────────────────────────────────────
  try {
    const hit = await cache.get(cacheKey);
    if (hit) {
      return res.json(JSON.parse(hit) as unknown);
    }
  } catch (e) {
    console.error("[cache] trainers list read failed:", e);
  }

  // ── DB fetch ────────────────────────────────────────────────────────────────
  try {
    const specialtiesParam = req.query.specialties as string | undefined;
    const filters = exploreFiltersSchema.parse({
      search:       req.query.search as string | undefined,
      city:         req.query.city as string | undefined,
      country:      req.query.country as string | undefined,
      coachingMode: req.query.coachingMode as string | undefined,
      specialties:  specialtiesParam ? specialtiesParam.split(",").filter(Boolean) : undefined,
      priceMin:     req.query.priceMin ? Number(req.query.priceMin) : undefined,
      priceMax:     req.query.priceMax ? Number(req.query.priceMax) : undefined,
      language:     req.query.language as string | undefined,
      page:         req.query.page ? Number(req.query.page) : 1,
      pageSize:     req.query.pageSize ? Number(req.query.pageSize) : 12,
      sort:         req.query.sort as string | undefined,
    });

    const result = await storage.getTrainers(filters);

    // ── Cache write ─────────────────────────────────────────────────────────
    try {
      await cache.set(cacheKey, JSON.stringify(result), LISTING_TTL_SECONDS);
    } catch (e) {
      console.error("[cache] trainers list write failed:", e);
    }

    return res.json(result);
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ message: "Invalid filters" });
    console.error("[GET /api/trainers]:", e);
    return res.status(500).json({ message: "Failed to load trainers" });
  }
});

router.get("/api/trainers/:id", async (req, res) => {
  const trainerId = req.params.id;
  const cacheKey = `trainers:profile:${trainerId}`;

  // ── Cache read (trainer data only — isFavorited is always fetched live) ────
  let trainerData: Record<string, unknown> | null = null;
  try {
    const hit = await cache.get(cacheKey);
    if (hit) {
      trainerData = JSON.parse(hit) as Record<string, unknown>;
    }
  } catch (e) {
    console.error("[cache] trainer profile read failed:", e);
  }

  try {
    if (!trainerData) {
      // ── DB fetch ────────────────────────────────────────────────────────────
      const trainer = await storage.getTrainerDetails(trainerId);
      if (!trainer) return res.status(404).json({ message: "Trainer not found" });

      const trainerPlans = await storage.getPlans(trainerId);
      const reviewData = await storage.getTrainerReviews(trainerId);

      trainerData = {
        ...(trainer as Record<string, unknown>),
        plans: trainerPlans.filter((p) => p.isActive),
        ...(reviewData as Record<string, unknown>),
      };

      // ── Cache write ─────────────────────────────────────────────────────────
      try {
        await cache.set(cacheKey, JSON.stringify(trainerData), PROFILE_TTL_SECONDS);
      } catch (e) {
        console.error("[cache] trainer profile write failed:", e);
      }
    }

    // isFavorited is per-user — always read from DB, never cached.
    let isFavorited = false;
    if (req.session.userId) {
      isFavorited = await storage.isFavorited(req.session.userId, trainerId);
    }

    return res.json({ ...trainerData, isFavorited });
  } catch (e) {
    console.error("[GET /api/trainers/:id]:", e);
    return res.status(500).json({ message: "Failed to load trainer details" });
  }
});

export default router;
