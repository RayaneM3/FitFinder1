import { Router } from "express";
import { storage } from "../storage";
import { requireAuth, requireEmailVerified } from "../middleware";
import { stripe, calculatePlatformFee } from "../stripe";
import crypto from "crypto";
import { z } from "zod";

const checkoutSchema = z.object({
  planId: z.string().min(1),
});

const router = Router();

router.get("/api/stripe/connect", requireAuth, async (req, res) => {
  try {
    if (!stripe || !process.env.STRIPE_CLIENT_ID) {
      return res.status(400).json({ message: "Stripe Connect not configured" });
    }
    const user = req.user!;
    if (user.role !== "TRAINER" && user.role !== "BOTH") {
      return res.status(403).json({ message: "Only trainers can connect Stripe" });
    }
    const appUrl = process.env.APP_URL || `https://${req.headers.host}`;
    // Generate a CSRF token and store it in the session for verification on callback
    const csrfToken = crypto.randomBytes(24).toString("hex");
    req.session.stripeOAuthState = csrfToken;
    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.STRIPE_CLIENT_ID,
      scope: "read_write",
      redirect_uri: `${appUrl}/api/stripe/callback`,
      state: csrfToken,
    });
    return res.json({ url: `https://connect.stripe.com/oauth/authorize?${params.toString()}` });
  } catch (e) {
    console.error("[GET /api/stripe/connect]:", e);
    return res.status(500).json({ message: "Failed to initialize Stripe Connect" });
  }
});

router.get("/api/stripe/callback", async (req, res) => {
  const appUrl = process.env.FRONTEND_URL || process.env.APP_URL || `https://${req.headers.host}`;
  try {
    if (!stripe) return res.redirect(`${appUrl}/dashboard?stripe=error`);
    const { code, state } = req.query as { code: string; state: string };
    if (!code || !state) return res.redirect(`${appUrl}/dashboard?stripe=error`);
    // Verify CSRF token stored when the OAuth flow was initiated
    const expectedState = req.session.stripeOAuthState;
    if (!expectedState || state !== expectedState) {
      console.warn("[stripe/callback] CSRF state mismatch — possible CSRF attack");
      return res.redirect(`${appUrl}/dashboard?stripe=error`);
    }
    delete req.session.stripeOAuthState;
    const userId = req.session.userId;
    if (!userId) return res.redirect(`${appUrl}/auth`);

    // Re-verify the user is still a trainer (role may have changed since OAuth was initiated)
    const user = await storage.getUser(userId);
    if (!user || (user.role !== "TRAINER" && user.role !== "BOTH")) {
      console.warn(`[stripe/callback] userId ${userId} is not a trainer — rejecting Stripe link`);
      return res.redirect(`${appUrl}/dashboard?stripe=error`);
    }

    const response = await (stripe as any).oauth.token({ grant_type: "authorization_code", code });
    const stripeAccountId = response.stripe_user_id;
    if (!stripeAccountId) return res.redirect(`${appUrl}/dashboard?stripe=error`);
    await storage.updateTrainerStripeAccount(userId, stripeAccountId);
    return res.redirect(`${appUrl}/dashboard?stripe=connected`);
  } catch (e) {
    console.error("[stripe/callback]:", e);
    return res.redirect(`${appUrl}/dashboard?stripe=error`);
  }
});

router.get("/api/stripe/status", requireAuth, async (req, res) => {
  try {
    const tp = await storage.getTrainerProfile(req.user!.id);
    return res.json({ connected: tp?.stripeAccountConnected ?? false });
  } catch (e) {
    console.error("[GET /api/stripe/status]:", e);
    return res.status(500).json({ message: "Failed to load Stripe status" });
  }
});

router.post("/api/checkout", requireAuth, requireEmailVerified, async (req, res) => {
  try {
    const bodyParsed = checkoutSchema.safeParse(req.body);
    if (!bodyParsed.success) {
      return res.status(400).json({ message: "planId is required" });
    }
    const { planId } = bodyParsed.data;

    const plan = await storage.getPlan(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ message: "Plan not found or inactive" });
    }

    // Prevent trainers from purchasing their own plans
    if (plan.trainerId === req.user!.id) {
      return res.status(400).json({ message: "You cannot purchase your own training plan" });
    }

    const appUrl = process.env.FRONTEND_URL || process.env.APP_URL || `https://${req.headers.host}`;

    if (!stripe) {
      // Fake checkout is only allowed in non-production environments
      if (process.env.NODE_ENV === "production") {
        return res.status(503).json({ message: "Payment processing is not configured" });
      }
      const order = await storage.createOrder({
        buyerId: req.user!.id,
        trainerId: plan.trainerId,
        planId: plan.id,
        amountCents: plan.priceCents,
        currency: plan.currency,
        stripeCheckoutSessionId: `sim_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      });
      await storage.updateOrderStatus(order.id, "PAID");
      return res.json({ checkoutUrl: `${appUrl}/dashboard?payment=success&orderId=${order.id}` });
    }

    const trainerProfile = await storage.getTrainerProfile(plan.trainerId);
    if (!trainerProfile?.stripeAccountId || !trainerProfile.stripeAccountConnected) {
      return res.status(400).json({
        message: "This trainer has not connected their payment account yet. Please contact them to set up payments.",
      });
    }

    const platformFee = calculatePlatformFee(plan.priceCents);

    const order = await storage.createOrder({
      buyerId: req.user!.id,
      trainerId: plan.trainerId,
      planId: plan.id,
      amountCents: plan.priceCents,
      currency: plan.currency,
      stripeCheckoutSessionId: null,
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: plan.currency,
          product_data: {
            name: plan.title,
            description: plan.description || undefined,
          },
          unit_amount: plan.priceCents,
        },
        quantity: 1,
      }],
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: { destination: trainerProfile.stripeAccountId },
      },
      success_url: `${appUrl}/dashboard?payment=success&orderId=${order.id}`,
      cancel_url: `${appUrl}/profile/${plan.trainerId}?payment=cancelled`,
      metadata: {
        orderId: order.id,
        buyerId: req.user!.id,
        trainerId: plan.trainerId,
        planId: plan.id,
      },
    });

    await storage.updateOrderStripeSession(order.id, session.id);
    return res.json({ checkoutUrl: session.url });
  } catch (e: any) {
    console.error("[POST /api/checkout]:", e);
    return res.status(500).json({ message: "Failed to create checkout session" });
  }
});

export default router;
