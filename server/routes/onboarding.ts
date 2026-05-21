import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware";
import {
  onboardingStep1Schema, onboardingStep2Schema,
  onboardingTrainerSchema, onboardingClientSchema,
} from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/api/onboarding/role", requireAuth, async (req, res) => {
  try {
    const { role } = onboardingStep1Schema.parse(req.body);
    await storage.updateUser(req.session.userId!, { role: role as any });
    return res.json({ success: true });
  } catch (e: any) {
    if (e instanceof z.ZodError) return res.status(400).json({ message: e.errors[0]?.message });
    console.error("[POST /api/onboarding/role]:", e);
    return res.status(500).json({ message: "Failed to update role" });
  }
});

router.post("/api/onboarding/profile", requireAuth, async (req, res) => {
  try {
    const data = onboardingStep2Schema.parse(req.body);
    await storage.updateUser(req.session.userId!, { name: data.name });
    await storage.upsertProfile({
      userId: req.session.userId!,
      bio: data.bio || "",
      city: data.city,
      country: data.country,
      languages: data.languages,
      coachingMode: data.coachingMode as any,
    });
    return res.json({ success: true });
  } catch (e: any) {
    if (e instanceof z.ZodError) return res.status(400).json({ message: e.errors[0]?.message });
    console.error("[POST /api/onboarding/profile]:", e);
    return res.status(500).json({ message: "Failed to save profile" });
  }
});

router.post("/api/onboarding/trainer", requireAuth, async (req, res) => {
  try {
    const user = await storage.getUser(req.session.userId!);
    if (!user || (user.role !== "TRAINER" && user.role !== "BOTH")) {
      return res.status(403).json({ message: "Only trainers can save a trainer profile" });
    }
    const data = onboardingTrainerSchema.parse(req.body);
    await storage.upsertTrainerProfile({
      userId: req.session.userId!,
      specialties: data.specialties,
      yearsExperience: data.yearsExperience,
      certifications: data.certifications,
      priceMin: data.priceMin,
      priceMax: data.priceMax,
      radiusKm: data.radiusKm ?? 50,
      availabilityNotes: data.availabilityNotes ?? "",
    });
    return res.json({ success: true });
  } catch (e: any) {
    if (e instanceof z.ZodError) return res.status(400).json({ message: e.errors[0]?.message });
    console.error("[POST /api/onboarding/trainer]:", e);
    return res.status(500).json({ message: "Failed to save trainer profile" });
  }
});

router.post("/api/onboarding/client", requireAuth, async (req, res) => {
  try {
    const user = await storage.getUser(req.session.userId!);
    if (!user || (user.role !== "CLIENT" && user.role !== "BOTH")) {
      return res.status(403).json({ message: "Only clients can save a client profile" });
    }
    const data = onboardingClientSchema.parse(req.body);
    await storage.upsertClientProfile({
      userId: req.session.userId!,
      goals: data.goals,
      experienceLevel: data.experienceLevel as any,
      budgetMin: data.budgetMin,
      budgetMax: data.budgetMax,
    });
    return res.json({ success: true });
  } catch (e: any) {
    if (e instanceof z.ZodError) return res.status(400).json({ message: e.errors[0]?.message });
    console.error("[POST /api/onboarding/client]:", e);
    return res.status(500).json({ message: "Failed to save client profile" });
  }
});

router.post("/api/onboarding/complete", requireAuth, async (req, res) => {
  try {
    const user = await storage.getUser(req.session.userId!);
    if (!user) return res.status(404).json({ message: "User not found" });
    // Ensure the user has chosen a role before marking onboarding complete
    if (!user.role) {
      return res.status(400).json({ message: "Please select a role before completing onboarding" });
    }
    await storage.updateUser(req.session.userId!, { onboardingComplete: true });
    return res.json({ success: true });
  } catch (e: any) {
    console.error("[POST /api/onboarding/complete]:", e);
    return res.status(500).json({ message: "Failed to complete onboarding" });
  }
});

export default router;
