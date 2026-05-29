import type { Request, Response, NextFunction } from "express";

// Built once at module load — Railway must have FRONTEND_URL set to the live
// Vercel URL (e.g. https://fitfinder.co) so that cross-origin POST requests
// from the frontend are not blocked.
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  process.env.APP_URL,
  "http://localhost:5173",
  "http://localhost:5000",
].filter(Boolean) as string[];

// Log at startup so Railway logs show exactly what is (and isn't) allowed.
console.log(`[csrf] Allowed origins: ${ALLOWED_ORIGINS.join(", ") || "(none — FRONTEND_URL / APP_URL not set!)"}`);

/**
 * Origin-based CSRF protection for state-changing requests.
 * SameSite=None cookies give us the first layer; this is a second layer that
 * explicitly rejects POST/PATCH/PUT/DELETE requests coming from unknown origins.
 *
 * Stripe webhooks are exempt because they carry their own HMAC signature.
 * Requests with no Origin header (same-origin, server-to-server, curl) are
 * also allowed — a missing Origin is not a CSRF vector.
 *
 * IMPORTANT: Set FRONTEND_URL in Railway environment variables to the live
 * frontend URL (e.g. https://fitfinder.co) or ALL POST requests from the
 * production frontend will be blocked with 403 Forbidden.
 */
export function csrfCheck(req: Request, res: Response, next: NextFunction) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();

  if (req.path === "/api/stripe/webhook") return next();

  const origin = req.headers.origin;
  if (!origin) return next();

  if (!ALLOWED_ORIGINS.includes(origin)) {
    console.warn(`[csrf] Blocked ${req.method} ${req.path} from origin: ${origin} (allowed: ${ALLOWED_ORIGINS.join(", ")})`);
    return res.status(403).json({ message: "Forbidden" });
  }

  next();
}
