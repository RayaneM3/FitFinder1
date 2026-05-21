import { Router } from "express";
import { storage } from "../storage";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { signupSchema, signinSchema } from "@shared/schema";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { db, pool } from "../db";
import { passwordResetTokens } from "@shared/schema";
import { eq, and, gt, isNull } from "drizzle-orm";
import { sendEmail, passwordResetEmail } from "../email";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const meLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120, // 2 req/sec — generous for page loads but blocks floods
  message: { message: "Too many requests" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/api/auth/signup", authLimiter, async (req, res) => {
  try {
    const data = signupSchema.parse(req.body);
    const normalizedEmail = data.email.toLowerCase().trim();
    const existing = await storage.getUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }
    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await storage.createUser({
      email: normalizedEmail,
      passwordHash,
      name: data.name.trim(),
    });
    req.session.userId = user.id;
    return res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, onboardingComplete: user.onboardingComplete, isAdmin: user.isAdmin } });
  } catch (e: any) {
    if (e instanceof z.ZodError) return res.status(400).json({ message: e.errors[0]?.message || "Validation error" });
    console.error("[POST /api/auth/signup]:", e);
    return res.status(500).json({ message: "Failed to create account" });
  }
});

router.post("/api/auth/signin", authLimiter, async (req, res) => {
  try {
    const data = signinSchema.parse(req.body);
    const normalizedEmail = data.email.toLowerCase().trim();
    const user = await storage.getUserByEmail(normalizedEmail);
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (user.bannedAt) {
      return res.status(403).json({ message: "Account suspended. Please contact support." });
    }
    req.session.userId = user.id;
    return res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, onboardingComplete: user.onboardingComplete, image: user.image, isAdmin: user.isAdmin } });
  } catch (e: any) {
    if (e instanceof z.ZodError) return res.status(400).json({ message: e.errors[0]?.message || "Validation error" });
    console.error("[POST /api/auth/signin]:", e);
    return res.status(500).json({ message: "Failed to sign in" });
  }
});

router.post("/api/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

router.get("/api/auth/me", meLimiter, async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }
  if (user.bannedAt) {
    req.session.destroy(() => {});
    return res.status(403).json({ message: "Account suspended" });
  }
  const profile = await storage.getProfile(user.id);
  return res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      image: user.image,
      onboardingComplete: user.onboardingComplete,
      isAdmin: user.isAdmin,
    },
    profile: profile || null,
  });
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => String(req.body?.email || req.ip),
  message: { message: "Too many reset requests. Please wait 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/api/auth/forgot-password", forgotPasswordLimiter, async (req, res) => {
  const OK = { message: "If an account exists, a reset link has been sent" };
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") return res.json(OK);

    const user = await storage.getUserByEmail(email.toLowerCase().trim());
    if (!user) return res.json(OK);

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.insert(passwordResetTokens).values({ userId: user.id, token, expiresAt });

    // Use FRONTEND_URL so the link goes to the client app, not the API server
    const FRONTEND_URL = process.env.FRONTEND_URL || process.env.APP_URL || "https://fitfinder.co";
    const resetUrl = `${FRONTEND_URL}/reset-password/${token}`;
    const { subject, html } = passwordResetEmail(resetUrl);
    await sendEmail(user.email, subject, html);

    return res.json(OK);
  } catch (e) {
    console.error("[POST /api/auth/forgot-password]:", e);
    return res.json(OK); // Never reveal errors that expose email existence
  }
});

const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Too many attempts. Please wait 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/api/auth/reset-password", resetPasswordLimiter, async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || typeof token !== "string" || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: "This reset link is invalid or has expired" });
    }

    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, new Date()),
        )
      )
      .limit(1);

    if (!resetToken) {
      return res.status(400).json({ message: "This reset link is invalid or has expired" });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await storage.updateUser(resetToken.userId, { passwordHash: hash });

    // Mark token as used
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, resetToken.id));

    // Destroy all sessions for this user (JSONB operator — safe, no full table scan)
    await pool.query(
      `DELETE FROM session WHERE sess->>'userId' = $1`,
      [resetToken.userId]
    );

    return res.json({ message: "Password reset successful. Please sign in." });
  } catch (e) {
    console.error("[POST /api/auth/reset-password]:", e);
    return res.status(500).json({ message: "Failed to reset password" });
  }
});

export default router;
