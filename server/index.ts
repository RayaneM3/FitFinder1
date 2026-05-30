import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import * as Sentry from "@sentry/node";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { runSeedIfNeeded, runMigrationsIfNeeded } from "./seed";
import { setupWebSocket } from "./websocket";
import { botGuard } from "./middleware/bot-guard";
import { csrfCheck } from "./middleware/csrf-check";

// ── Environment detection ─────────────────────────────────────────────────────
// Staging: a second Railway service with RAILWAY_ENVIRONMENT=staging set in its
// Variables tab. The build is identical to production — only runtime behaviour
// changes (rate limiting off, verbose logs, full error stacks in responses).
const isStaging = process.env.RAILWAY_ENVIRONMENT === "staging" || process.env.NODE_ENV === "staging";
const isDev = !isStaging && process.env.NODE_ENV !== "production";

// ── Sentry error tracking ─────────────────────────────────────────────────────
// Initialise only when SENTRY_DSN is present so local dev works without config.
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: isStaging ? "staging" : (process.env.NODE_ENV ?? "development"),
    // Capture 10% of transactions in production; all in staging for full visibility.
    tracesSampleRate: isStaging ? 1.0 : 0.1,
    // Safety net: drop 4xx events that slip through (5xx filter is at the handler).
    beforeSend(event, hint) {
      const err = hint?.originalException as Record<string, unknown> | null;
      if (err && typeof err === "object") {
        const status = (err["status"] ?? err["statusCode"]) as number | undefined;
        if (status !== undefined && status < 500) return null;
      }
      return event;
    },
  });
}

const app = express();
const httpServer = createServer(app);

// ── Trust proxy ───────────────────────────────────────────────────────────────
// Set TRUST_PROXY=true in Railway (production + staging) so that req.ip reflects
// the real client IP forwarded by Cloudflare / Railway's load balancer.
// Leave unset (or set to false) in local dev where there is no proxy.
if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

// ── Bot / scanner guard (before everything else) ─────────────────────────────
app.use(botGuard);

// ── Security headers (helmet) ─────────────────────────────────────────────────
const FRONTEND_URL = process.env.FRONTEND_URL;
const APP_URL = process.env.APP_URL;

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: [
          "'self'",
          APP_URL || "http://localhost:5000",
          "https://api.stripe.com",
          "wss:",
          "ws:",
        ],
        frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Needed for cross-origin images
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Needed for split-deployment
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);

// ── CORS ──────────────────────────────────────────────────────────────────────
const devPort = process.env.PORT ?? "5000";
const allowedOrigins = [
  FRONTEND_URL,
  APP_URL,
  "http://localhost:5173",
  "http://localhost:5000",
  // In dev, the server and Vite share one port — include it so browser-based
  // tools (e.g. Preview) can make same-origin requests without CORS rejection.
  isDev ? `http://localhost:${devPort}` : null,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, health checks, mobile)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400, // Cache preflight for 24 hours
  })
);

// ── Body parsers (with size limits) ──────────────────────────────────────────
declare module "http" {
  interface IncomingMessage {
    rawBody: Buffer;
  }
}

app.use(
  express.json({
    limit: "1mb", // Allows avatar base64 (~5 MB binary → ~7 MB base64, capped in settings route)
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false, limit: "100kb" }));

// ── CSRF origin check ─────────────────────────────────────────────────────────
app.use(csrfCheck);

// ── Vary: Accept-Encoding ─────────────────────────────────────────────────────
// Tells Cloudflare (and any intermediate cache) that the response body differs
// by encoding, preventing compressed and uncompressed responses from colliding.
app.use((_req, res, next) => {
  res.setHeader("Vary", "Accept-Encoding");
  next();
});

// ── Global API rate limiter (disabled in staging for unthrottled testing) ─────
if (!isStaging) {
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    message: { message: "Too many requests. Please slow down." },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) =>
      req.path === "/api/health" || req.path === "/api/stripe/webhook",
    // When behind Cloudflare, use CF-Connecting-IP as the rate-limit key so
    // Cloudflare's own IPs don't get throttled instead of the real client.
    keyGenerator: (req) => {
      const cfIp = req.headers["cf-connecting-ip"];
      if (typeof cfIp === "string" && cfIp) return ipKeyGenerator(cfIp);
      return ipKeyGenerator(req.ip ?? "unknown");
    },
  });
  app.use("/api", apiLimiter);
}

// ── Request logger ────────────────────────────────────────────────────────────
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// Paths whose response bodies should never be logged (contain tokens, hashes, or user data)
const SENSITIVE_PATHS = ["/api/auth/", "/api/settings/", "/api/stripe/"];
const REDACTED_KEYS = ["passwordHash", "password", "token", "secret", "stripeAccountId", "email", "image"];

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

  const isSensitive = SENSITIVE_PATHS.some((p) => path.startsWith(p));

  // Staging verbose logging: log inbound request body (non-sensitive paths only)
  if (isStaging && !isSensitive && req.method !== "GET" && req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body as Record<string, unknown> };
    for (const key of REDACTED_KEYS) {
      if (key in sanitizedBody) sanitizedBody[key] = "[REDACTED]";
    }
    log(`→ ${req.method} ${path} body: ${JSON.stringify(sanitizedBody).slice(0, 300)}`, "staging");
  }

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    if (!isSensitive) capturedJsonResponse = bodyJson as Record<string, unknown>;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        const sanitized = { ...capturedJsonResponse };
        for (const key of REDACTED_KEYS) {
          if (key in sanitized) sanitized[key] = "[REDACTED]";
        }
        logLine += ` :: ${JSON.stringify(sanitized).slice(0, 500)}`;
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  await runMigrationsIfNeeded();
  await runSeedIfNeeded();
  await registerRoutes(httpServer, app);
  setupWebSocket(httpServer);

  // ── Sentry error handler (5xx only — must be before the global handler) ────
  if (process.env.SENTRY_DSN) {
    app.use((err: unknown, _req: Request, _res: Response, next: NextFunction) => {
      const status = (err as Record<string, number>)?.status
        ?? (err as Record<string, number>)?.statusCode
        ?? 500;
      if (status >= 500) Sentry.captureException(err);
      next(err);
    });
  }

  // ── Global error handler ──────────────────────────────────────────────────
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    const typedErr = err as Record<string, unknown>;
    const status = (typedErr?.status ?? typedErr?.statusCode ?? 500) as number;

    // Always log full error server-side
    console.error("Internal Server Error:", err);

    if (res.headersSent) return next(err);

    // Expose full error detail in dev and staging; generic message in production.
    const message = !isDev && !isStaging
      ? "An unexpected error occurred"
      : (typedErr?.message as string | undefined) || "Internal Server Error";

    // Include stack trace in staging responses for easier debugging
    if (isStaging) {
      return res.status(status).json({ message, stack: (typedErr?.stack as string | undefined) });
    }
    return res.status(status).json({ message });
  });

  if (!isDev) {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  // reusePort is only supported on Linux (Railway). macOS silently rejects it.
  httpServer.listen(
    { port, host: "0.0.0.0", reusePort: process.platform === "linux" },
    () => {
      log(`serving on port ${port}`);
      if (isStaging) log("⚠️  Staging mode: rate limiting disabled, verbose logging enabled, full errors in responses", "staging");
    }
  );
})();
