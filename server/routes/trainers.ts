import { Router } from "express";
import { storage } from "../storage";
import { exploreFiltersSchema } from "@shared/schema";
import { z } from "zod";
import rateLimit from "express-rate-limit";

const router = Router();

const trainersLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60, // 60 requests per minute per IP
  message: { message: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/api/trainers", trainersLimiter, async (req, res) => {
  try {
    const specialtiesParam = req.query.specialties as string | undefined;
    const filters = exploreFiltersSchema.parse({
      search: req.query.search as string | undefined,
      city: req.query.city as string | undefined,
      country: req.query.country as string | undefined,
      coachingMode: req.query.coachingMode as string | undefined,
      specialties: specialtiesParam ? specialtiesParam.split(",").filter(Boolean) : undefined,
      priceMin: req.query.priceMin ? Number(req.query.priceMin) : undefined,
      priceMax: req.query.priceMax ? Number(req.query.priceMax) : undefined,
      language: req.query.language as string | undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : 12,
      sort: req.query.sort as string | undefined,
    });
    const result = await storage.getTrainers(filters);
    return res.json(result);
  } catch (e: any) {
    if (e instanceof z.ZodError) return res.status(400).json({ message: "Invalid filters" });
    console.error("[GET /api/trainers]:", e);
    return res.status(500).json({ message: "Failed to load trainers" });
  }
});

router.get("/api/trainers/:id", async (req, res) => {
  try {
    const trainer = await storage.getTrainerDetails(req.params.id);
    if (!trainer) return res.status(404).json({ message: "Trainer not found" });

    const trainerPlans = await storage.getPlans(req.params.id);

    let isFavorited = false;
    if (req.session.userId) {
      isFavorited = await storage.isFavorited(req.session.userId, req.params.id);
    }

    const reviewData = await storage.getTrainerReviews(req.params.id);
    return res.json({ ...trainer, plans: trainerPlans.filter(p => p.isActive), isFavorited, ...reviewData });
  } catch (e) {
    console.error("[GET /api/trainers/:id]:", e);
    return res.status(500).json({ message: "Failed to load trainer details" });
  }
});

export default router;
