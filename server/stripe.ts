import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("[stripe] STRIPE_SECRET_KEY not set — payments will be unavailable");
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-03-25.dahlia" })
  : null;

export const PLATFORM_FEE_PERCENT = 0.128;

export function calculatePlatformFee(amountCents: number): number {
  return Math.round(amountCents * PLATFORM_FEE_PERCENT);
}
