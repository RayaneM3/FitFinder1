import type { Request, Response, NextFunction } from "express";

// Common vulnerability scanner / WordPress / PHP paths that have no legitimate use on this app.
const BLOCKED_PATH_PREFIXES = [
  "/wp-admin",
  "/wp-login",
  "/wp-content",
  "/.env",
  "/.git",
  "/.htaccess",
  "/phpmyadmin",
  "/admin/config",
  "/xmlrpc.php",
  "/wp-json",
  "/actuator",
  "/swagger",
];

export function botGuard(req: Request, res: Response, next: NextFunction) {
  const path = req.path.toLowerCase();

  if (BLOCKED_PATH_PREFIXES.some((blocked) => path.startsWith(blocked))) {
    return res.status(404).end();
  }

  // Block requests with no User-Agent (common automated scanner behaviour).
  // Health checks and Stripe webhooks are exempt so Railway monitoring and
  // Stripe retries continue to work.
  if (
    !req.headers["user-agent"] &&
    !path.startsWith("/api/health") &&
    !path.startsWith("/api/stripe/webhook")
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  next();
}
