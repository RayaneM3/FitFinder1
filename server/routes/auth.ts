import { Router } from "express";
import { storage } from "../storage";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { signupSchema, signinSchema } from "@shared/schema";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { db, pool } from "../db";
import { passwordResetTokens, emailVerificationTokens } from "@shared/schema";
import { eq, and, gt, isNull } from "drizzle-orm";
import { sendEmail, passwordResetEmail, emailVerificationEmail } from "../email";
import { sanitizeString } from "../utils/sanitize";
import { safeOwnUserResponse } from "../utils/safe-user";
import { cfAwareKeyGenerator } from "../utils/rate-limit";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: cfAwareKeyGenerator,
});

const meLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: { message: "Too many requests" },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: cfAwareKeyGenerator,
});

// ========== ACCOUNT LOCKOUT CONSTANTS ==========
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 30;

router.post("/api/auth/signup", authLimiter, async (req, res) => {
  try {
    const data = signupSchema.parse(req.body);
    const normalizedEmail = data.email.toLowerCase().trim();
    const cleanName = sanitizeString(data.name.trim());

    const existing = await storage.getUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }
    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await storage.createUser({
      email: normalizedEmail,
      passwordHash,
      name: cleanName,
    });

    // Send email verification (fire-and-forget — don't block signup on email failure)
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    db.insert(emailVerificationTokens)
      .values({ userId: user.id, token: verifyToken, expiresAt: verifyExpiresAt })
      .then(() => {
        const FRONTEND_URL = process.env.FRONTEND_URL || process.env.APP_URL || "https://fitfinder.co";
        const verifyUrl = `${FRONTEND_URL}/verify-email/${verifyToken}`;
        const { subject, html } = emailVerificationEmail(verifyUrl);
        return sendEmail(user.email, subject, html);
      })
      .catch((e) => console.error("[auth/signup] Failed to send verification email:", e));

    // Regenerate session to prevent session fixation
    const userId = user.id;
    req.session.regenerate((regenErr) => {
      if (regenErr) {
        console.error("[auth/signup] Session regeneration failed:", regenErr);
        return res.status(500).json({ message: "Server error" });
      }
      req.session.userId = userId;
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error("[auth/signup] Session save failed:", saveErr);
          return res.status(500).json({ message: "Server error" });
        }
        return res.json({ user: safeOwnUserResponse(user) });
      });
    });
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

    // Account lockout check
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return res.status(423).json({ message: "Account temporarily locked due to too many failed attempts. Please try again later." });
    }

    if (user.bannedAt) {
      return res.status(403).json({ message: "Account suspended. Please contact support." });
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      // Increment failed attempts
      const newAttempts = (user.failedLoginAttempts ?? 0) + 1;
      const lockout = newAttempts >= MAX_FAILED_ATTEMPTS
        ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
        : undefined;
      await storage.updateUser(user.id, {
        failedLoginAttempts: newAttempts,
        ...(lockout ? { lockedUntil: lockout } : {}),
      });
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Successful login — reset lockout state
    if ((user.failedLoginAttempts ?? 0) > 0 || user.lockedUntil) {
      await storage.updateUser(user.id, { failedLoginAttempts: 0, lockedUntil: null });
    }

    // Regenerate session to prevent session fixation
    const userId = user.id;
    req.session.regenerate((regenErr) => {
      if (regenErr) {
        console.error("[auth/signin] Session regeneration failed:", regenErr);
        return res.status(500).json({ message: "Server error" });
      }
      req.session.userId = userId;
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error("[auth/signin] Session save failed:", saveErr);
          return res.status(500).json({ message: "Server error" });
        }
        return res.json({ user: safeOwnUserResponse(user) });
      });
    });
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
    user: safeOwnUserResponse(user),
    profile: profile || null,
  });
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  // Key by email when present (rate-limits per account, not per IP) with IP fallback.
  keyGenerator: (req) => {
    const email = req.body?.email;
    if (typeof email === "string" && email) return email.toLowerCase().trim();
    return req.ip ?? "unknown";
  },
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
  keyGenerator: cfAwareKeyGenerator,
});

router.post("/api/auth/reset-password", resetPasswordLimiter, async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || typeof token !== "string" || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: "This reset link is invalid or has expired" });
    }
    if (newPassword.length > 72) {
      return res.status(400).json({ message: "Password must be 72 characters or less" });
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
    await storage.updateUser(resetToken.userId, {
      passwordHash: hash,
      failedLoginAttempts: 0,
      lockedUntil: null,
    });

    // Mark token as used
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, resetToken.id));

    // Invalidate all sessions for this user (JSONB operator — safe, no full table scan)
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

router.get("/api/auth/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;
    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Invalid verification link" });
    }

    const [record] = await db
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.token, token),
          isNull(emailVerificationTokens.usedAt),
          gt(emailVerificationTokens.expiresAt, new Date()),
        )
      )
      .limit(1);

    if (!record) {
      return res.status(400).json({ message: "This verification link is invalid or has expired" });
    }

    await storage.updateUser(record.userId, { emailVerified: true });
    await db
      .update(emailVerificationTokens)
      .set({ usedAt: new Date() })
      .where(eq(emailVerificationTokens.id, record.id));

    return res.json({ message: "Email verified successfully" });
  } catch (e) {
    console.error("[GET /api/auth/verify-email]:", e);
    return res.status(500).json({ message: "Failed to verify email" });
  }
});

const resendVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { message: "Too many requests. Please wait 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: cfAwareKeyGenerator,
});

router.post("/api/auth/resend-verification", resendVerificationLimiter, async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  try {
    const user = await storage.getUser(req.session.userId);
    if (!user) return res.status(401).json({ message: "User not found" });
    if (user.emailVerified) return res.json({ message: "Email already verified" });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await db.insert(emailVerificationTokens).values({ userId: user.id, token, expiresAt });

    const FRONTEND_URL = process.env.FRONTEND_URL || process.env.APP_URL || "https://fitfinder.co";
    const verifyUrl = `${FRONTEND_URL}/verify-email/${token}`;
    const { subject, html } = emailVerificationEmail(verifyUrl);
    await sendEmail(user.email, subject, html);

    return res.json({ message: "Verification email sent" });
  } catch (e) {
    console.error("[POST /api/auth/resend-verification]:", e);
    return res.status(500).json({ message: "Failed to send verification email" });
  }
});

export default router;
