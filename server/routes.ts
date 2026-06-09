import type { Express } from "express";
import { type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { stripe } from "./stripe";
import type Stripe from "stripe";
import { registerRouteModules } from "./routes/index";
import { sendEmail, orderPaidBuyerEmail, orderPaidTrainerEmail } from "./email";
import { isR2Active, R2_PUBLIC_URL } from "./upload";
import { isRedisActive, redisClient, IoRedisSessionStore } from "./lib/cache";

const PgSession = connectPgSimple(session);

declare module "express-session" {
  interface SessionData {
    userId: string;
    stripeOAuthState?: string;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ========== HEALTH CHECK (before session middleware) ==========
  app.get("/api/health", async (_req, res) => {
    try {
      await pool.query("SELECT 1");
      return res.json({
        status: "ok",
        db: "connected",
        timestamp: new Date().toISOString(),
        environment: process.env.RAILWAY_ENVIRONMENT ?? process.env.NODE_ENV ?? "unknown",
      });
    } catch {
      return res.status(503).json({ status: "error", db: "disconnected" });
    }
  });

  // ========== STORAGE HEALTH (before session middleware) ==========
  app.get("/api/health/storage", (_req, res) => {
    const storageMode = isR2Active ? "r2" : "base64";
    const cacheMode = isRedisActive ? "redis" : "memory-fallback";
    res.json({
      storage: storageMode,
      r2Active: isR2Active,
      r2Bucket: isR2Active ? (process.env.R2_BUCKET ?? "fitfinder-uploads") : null,
      r2PublicUrl: isR2Active ? R2_PUBLIC_URL : null,
      cache: cacheMode,
      redisActive: isRedisActive,
      warning: isR2Active
        ? null
        : "R2 is not configured — images are stored as base64 in PostgreSQL. This is only suitable for development.",
    });
  });

  // ========== DYNAMIC SITEMAP (before session middleware) ==========
  app.get("/sitemap.xml", async (_req, res) => {
    const baseUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 5000}`;
    const staticPages = [
      { loc: "/", priority: "1.0" },
      { loc: "/explore", priority: "0.9" },
      { loc: "/auth", priority: "0.5" },
      { loc: "/how-it-works", priority: "0.6" },
      { loc: "/legal/privacy", priority: "0.3" },
      { loc: "/legal/terms", priority: "0.3" },
    ];

    let trainerUrls: { loc: string; priority: string }[] = [];
    try {
      const result = await pool.query(
        `SELECT u.id FROM users u
         JOIN trainer_profiles tp ON tp."userId" = u.id
         WHERE u."onboardingComplete" = true`
      );
      trainerUrls = result.rows.map((row: { id: string }) => ({
        loc: `/profile/${row.id}`,
        priority: "0.7",
      }));
    } catch {
      // If query fails, just serve static pages
    }

    const allPages = [...staticPages, ...trainerUrls];
    const today = new Date().toISOString().split("T")[0];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (p) => `  <url>
    <loc>${baseUrl}${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <priority>${p.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    res.set("Content-Type", "application/xml");
    return res.send(xml);
  });

  // ========== DYNAMIC OG IMAGES (before session middleware) ==========
  app.get("/api/og/:trainerId.png", async (req, res) => {
    try {
      const { generateTrainerOgImage } = await import("./og-image");
      const image = await generateTrainerOgImage(req.params.trainerId);
      if (!image) return res.status(404).send("Not found");
      res.set({
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=604800",
      });
      return res.send(image);
    } catch (e) {
      console.error("[og-image]:", e);
      return res.status(500).send("Error generating image");
    }
  });

  // ========== STRIPE WEBHOOK (must be before session middleware) ==========
  app.post("/api/stripe/webhook", async (req: any, res) => {
    if (!stripe) {
      return res.status(400).json({ message: "Stripe not configured" });
    }
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!sig || !webhookSecret) {
      return res.status(400).json({ message: "Missing stripe signature or webhook secret" });
    }
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } catch (e: any) {
      console.error("[webhook] Signature verification failed:", e.message);
      return res.status(400).json({ message: `Webhook error: ${e.message}` });
    }
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        try {
          // Idempotency guard — Stripe retries webhooks on failure
          const existingOrder = await storage.getOrder(orderId);
          if (existingOrder?.status === "PAID") {
            return res.json({ received: true }); // already processed
          }
          await storage.updateOrderStatus(orderId, "PAID");
          console.log(`[webhook] Order ${orderId} marked as PAID`);
          // Send payment confirmation emails (fire-and-forget)
          const order = await storage.getOrder(orderId);
          if (order) {
            const buyer = await storage.getUser(order.buyerId);
            const trainer = await storage.getUser(order.trainerId);
            const plan = order.planId ? await storage.getPlan(order.planId) : null;
            if (buyer && trainer && plan) {
              const currency = (order.currency || "usd").toUpperCase();
              const fmt = (cents: number) =>
                new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
              const amount = fmt(order.amountCents);
              const trainerAmount = fmt(order.amountCents * 0.872);
              const buyerEmail = orderPaidBuyerEmail(buyer.name, trainer.name, plan.title, amount);
              const trainerEmail = orderPaidTrainerEmail(trainer.name, buyer.name, plan.title, amount, trainerAmount);
              sendEmail(buyer.email, buyerEmail.subject, buyerEmail.html);
              sendEmail(trainer.email, trainerEmail.subject, trainerEmail.html);
            }
          }
        } catch (e) {
          console.error("[webhook] Failed to update order:", e);
          return res.status(500).json({ message: "Failed to update order" });
        }
      }
    }
    // TODO(refunds): when a charge is refunded/disputed, add a REFUNDED status to
    // orderStatusEnum, handle `charge.refunded` here to flip order status, and
    // update the avg-rating queries to exclude REFUNDED orders. Reviews remain
    // visible but stop counting toward the trainer's average.
    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        // Guard: never cancel an order that was already PAID (race with completed event)
        const order = await storage.getOrder(orderId).catch(() => null);
        if (order && order.status !== "PAID") {
          await storage.updateOrderStatus(orderId, "CANCELED").catch(console.error);
        }
      }
    }
    return res.json({ received: true });
  });

  // Session secret must not fallback in production
  const sessionSecret = process.env.SESSION_SECRET || (
    process.env.NODE_ENV === "production"
      ? (() => { throw new Error("FATAL: SESSION_SECRET environment variable is required in production"); })()
      : "fit-finder-dev-secret-change-in-production"
  );

  // Use Redis session store when REDIS_URL is configured; fall back to PostgreSQL.
  const sessionStore =
    isRedisActive && redisClient
      ? new IoRedisSessionStore(redisClient)
      : new PgSession({
          pool: pool as any,
          tableName: "session",
          createTableIfMissing: true,
        });

  app.use(
    session({
      store: sessionStore,
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: process.env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
        domain: undefined, // Let the browser set this automatically
      },
    })
  );

  // Register all route modules
  registerRouteModules(app);

  return httpServer;
}
