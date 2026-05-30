import { db, pool } from "./db";
import { users, profiles, trainerProfiles } from "@shared/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

/**
 * Idempotent schema migrations — runs before seed on every startup.
 * Each statement uses IF NOT EXISTS / IF EXISTS so it's always safe to re-run.
 */
export async function runMigrationsIfNeeded() {
  try {
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP;
    `);
    console.log("[migrate] Schema columns verified/added.");
  } catch (e) {
    console.error("[migrate] Migration failed:", e);
  }
}

const SEED_PASSWORD = process.env.SEED_PASSWORD || "FitFinder2024!";

const seedTrainers = [
  {
    name: "Alex Richardson",
    email: "alex.richardson@fitfinder.demo",
    bio: "Spent my first few years chasing quick fixes before learning that building real strength is about consistency, not intensity. Now I program intelligently for hypertrophy and help clients dial in nutrition so the hard work actually shows up on their frame.",
    city: "London",
    country: "United Kingdom",
    languages: ["English"],
    coachingMode: "HYBRID" as const,
    specialties: ["Strength Training", "Hypertrophy", "Nutrition Coaching"],
    yearsExperience: 8,
    certifications: ["NASM CPT", "Precision Nutrition L1"],
    priceMin: 60,
    priceMax: 120,
    radiusKm: 15,
  },
  {
    name: "Sophie Chen",
    email: "sophie.chen@fitfinder.demo",
    bio: "I get it — your schedule is packed. That's why I design HIIT and nutrition strategies that fit into real life rather than expecting life to fit around fitness. Five years of helping busy professionals lose fat without losing their sanity.",
    city: "Manchester",
    country: "United Kingdom",
    languages: ["English", "Mandarin"],
    coachingMode: "ONLINE" as const,
    specialties: ["Fat Loss", "Nutrition Coaching", "HIIT"],
    yearsExperience: 5,
    certifications: ["ACE CPT", "PN Level 2"],
    priceMin: 40,
    priceMax: 80,
    radiusKm: 0,
  },
  {
    name: "Marcus Williams",
    email: "marcus.williams@fitfinder.demo",
    bio: "Twelve years competing and coaching powerlifting taught me that strength isn't just about what you lift — it's about moving with intention and building durability. I work with competitive lifters and athletes who want real power.",
    city: "Birmingham",
    country: "United Kingdom",
    languages: ["English"],
    coachingMode: "IN_PERSON" as const,
    specialties: ["Powerlifting", "Strength Training", "Sports Performance"],
    yearsExperience: 12,
    certifications: ["NSCA CSCS", "British Weightlifting L2"],
    priceMin: 50,
    priceMax: 90,
    radiusKm: 20,
  },
  {
    name: "Aoife Murphy",
    email: "aoife.murphy@fitfinder.demo",
    bio: "After dealing with my own chronic pain, I became obsessed with movement quality and recovery. Now I help clients get out of pain and rebuild strength through mobility work and yoga-informed coaching that actually sticks.",
    city: "Dublin",
    country: "Ireland",
    languages: ["English", "Irish"],
    coachingMode: "HYBRID" as const,
    specialties: ["Rehab & Mobility", "Yoga", "Nutrition Coaching"],
    yearsExperience: 7,
    certifications: ["REPS Ireland", "FRC Mobility Specialist"],
    priceMin: 55,
    priceMax: 100,
    radiusKm: 10,
  },
  {
    name: "Lucas Moreau",
    email: "lucas.moreau@fitfinder.demo",
    bio: "Ten years competing and coaching taught me that sculpting a physique is part art, part science. Whether you're stepping on stage or just want to feel strong in your body, I craft hypertrophy and fat loss plans that deliver real aesthetic change.",
    city: "Paris",
    country: "France",
    languages: ["French", "English"],
    coachingMode: "ONLINE" as const,
    specialties: ["Bodybuilding", "Hypertrophy", "Fat Loss"],
    yearsExperience: 10,
    certifications: ["IFBB Pro Card", "BEES Certification"],
    priceMin: 70,
    priceMax: 150,
    radiusKm: 0,
  },
  {
    name: "Katrin Bauer",
    email: "katrin.bauer@fitfinder.demo",
    bio: "I work with athletes because I believe speed and agility are trainable. Nine years of building sport-specific conditioning programs for competitive runners, football players, and ambitious weekend warriors who want to perform noticeably better.",
    city: "Berlin",
    country: "Germany",
    languages: ["German", "English"],
    coachingMode: "IN_PERSON" as const,
    specialties: ["Sports Performance", "Strength Training", "HIIT"],
    yearsExperience: 9,
    certifications: ["DOSB Trainer A", "TRX Certified"],
    priceMin: 45,
    priceMax: 85,
    radiusKm: 25,
  },
  {
    name: "Jordan Davis",
    email: "jordan.davis@fitfinder.demo",
    bio: "From New York, coaching clients across the US. I specialize in body recomposition — whether you're cutting fat or building muscle, my detailed nutrition plans and weekly accountability actually keep people consistent long enough to see results.",
    city: "New York",
    country: "United States",
    languages: ["English", "Spanish"],
    coachingMode: "ONLINE" as const,
    specialties: ["Fat Loss", "Hypertrophy", "Nutrition Coaching"],
    yearsExperience: 6,
    certifications: ["NASM CPT", "ISSA Nutritionist"],
    priceMin: 80,
    priceMax: 200,
    radiusKm: 0,
  },
  {
    name: "Emily Tremblay",
    email: "emily.tremblay@fitfinder.demo",
    bio: "Four years in and still the most excited when clients realize strength training and yoga aren't opposites. I blend them to build resilience and ease in the body — because getting stronger should feel good, not punishing.",
    city: "Toronto",
    country: "Canada",
    languages: ["English", "French"],
    coachingMode: "HYBRID" as const,
    specialties: ["Strength Training", "Yoga", "Rehab & Mobility"],
    yearsExperience: 4,
    certifications: ["canfitpro PTS", "Yoga Alliance RYT-200"],
    priceMin: 35,
    priceMax: 70,
    radiusKm: 12,
  },
];

/**
 * Upserts all 8 seed trainers — safe to call on every startup.
 * Uses ON CONFLICT DO UPDATE so it's idempotent.
 */
export async function runSeedIfNeeded() {
  try {
    const existing = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.email, "alex.richardson@fitfinder.demo"));

    const alreadySeeded = existing.length > 0;

    if (alreadySeeded) {
      // Trainers already exist — skip bcrypt and upserts to avoid expensive startup work
      console.log("[seed] Demo trainers already present — skipping seed.");
      return;
    }

    console.log("[seed] Seeding 8 demo trainers for the first time...");
    const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
    for (const trainer of seedTrainers) {
      await upsertTrainer(trainer, passwordHash);
      console.log(`[seed]   ✓ ${trainer.name} (${trainer.city})`);
    }
    console.log("[seed] Done! Login: <email> / FitFinder2024!");
  } catch (e) {
    console.error("[seed] Failed:", e);
  }
}

async function upsertTrainer(trainer: typeof seedTrainers[0], passwordHash: string) {
  const avatarUrl = `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(trainer.name)}`;

  const [user] = await db
    .insert(users)
    .values({
      email: trainer.email,
      passwordHash,
      name: trainer.name,
      role: "TRAINER",
      onboardingComplete: true,
      image: avatarUrl,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        passwordHash,
        name: trainer.name,
        role: "TRAINER",
        onboardingComplete: true,
        image: avatarUrl,
        updatedAt: new Date(),
      },
    })
    .returning();

  await db
    .insert(profiles)
    .values({
      userId: user.id,
      bio: trainer.bio,
      city: trainer.city,
      country: trainer.country,
      languages: trainer.languages,
      coachingMode: trainer.coachingMode,
    })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: {
        bio: trainer.bio,
        city: trainer.city,
        country: trainer.country,
        languages: trainer.languages,
        coachingMode: trainer.coachingMode,
        updatedAt: new Date(),
      },
    });

  await db
    .insert(trainerProfiles)
    .values({
      userId: user.id,
      specialties: trainer.specialties,
      yearsExperience: trainer.yearsExperience,
      certifications: trainer.certifications,
      priceMin: trainer.priceMin,
      priceMax: trainer.priceMax,
      radiusKm: trainer.radiusKm,
    })
    .onConflictDoUpdate({
      target: trainerProfiles.userId,
      set: {
        specialties: trainer.specialties,
        yearsExperience: trainer.yearsExperience,
        certifications: trainer.certifications,
        priceMin: trainer.priceMin,
        priceMax: trainer.priceMax,
        radiusKm: trainer.radiusKm,
        updatedAt: new Date(),
      },
    });
}

// Allow running directly: npx tsx server/seed.ts
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeedIfNeeded().then(() => process.exit(0)).catch(() => process.exit(1));
}
