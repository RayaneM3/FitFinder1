import type { Request, Response, NextFunction } from "express";

const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  process.env.APP_URL,
  "http://localhost:5173",
  "http://localhost:5000",
].filter(Boolean) as string[];

/**
 * Origin-based CSRF protection for state-changing requests.
 * SameSite=None cookies give us the first layer; this is a second layer that
 * explicitly rejects POST/PATCH/PUT/DELETE requests coming from unknown origins.
 *
 * Stripe webhooks are exempt because they carry their own HMAC signature.
 * Requests with no Origin header (same-origin, server-to-server, curl) are
 * also allowed — a missing Origin is not a CSRF vector.
 */
export function csrfCheck(req: Request, res: Response, next: NextFunction) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();

  if (req.path === "/api/stripe/webhook") return next();

  const origin = req.headers.origin;
  if (!origin) return next();

  if (!ALLOWED_ORIGINS.includes(origin)) {
    console.warn(`[csrf] Blocked state-changing request from origin: ${origin}`);
    return res.status(403).json({ message: "Forbidden" });
  }

  next();
}
