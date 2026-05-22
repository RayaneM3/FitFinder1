import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { runSeedIfNeeded } from "./seed";
import { setupWebSocket } from "./websocket";
import { botGuard } from "./middleware/bot-guard";
import { csrfCheck } from "./middleware/csrf-check";

const app = express();
const httpServer = createServer(app);

// ── Trust proxy (Railway / Render terminate SSL at load balancer) ─────────────
if (process.env.NODE_ENV === "production") {
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
const allowedOrigins = [
  FRONTEND_URL,
  APP_URL,
  "http://localhost:5173",
  "http://localhost:5000",
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

// ── Global API rate limiter ───────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { message: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) =>
    req.path === "/api/health" || req.path === "/api/stripe/webhook",
});
app.use("/api", apiLimiter);

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
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const isSensitive = SENSITIVE_PATHS.some((p) => path.startsWith(p));

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    if (!isSensitive) capturedJsonResponse = bodyJson;
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
  await runSeedIfNeeded();
  await registerRoutes(httpServer, app);
  setupWebSocket(httpServer);

  // ── Global error handler ──────────────────────────────────────────────────
  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;

    // Always log full error server-side
    console.error("Internal Server Error:", err);

    if (res.headersSent) return next(err);

    // Never expose internal details in production
    const message =
      process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : err.message || "Internal Server Error";

    return res.status(status).json({ message });
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    { port, host: "0.0.0.0", reusePort: true },
    () => { log(`serving on port ${port}`); }
  );
})();
