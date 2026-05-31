import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("[stripe] STRIPE_SECRET_KEY not set — payments will be unavailable");
}

// Pin the API version explicitly so Stripe's behavior (webhook payloads,
// response shapes) stays stable across SDK minor bumps. The SDK types only
// accept its own built-in default version literal, so we cast: Stripe honors
// any valid pinned version at runtime regardless of the SDK's typed default.
type StripeApiVersion = NonNullable<ConstructorParameters<typeof Stripe>[1]>["apiVersion"];

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-03-25.dahlia" as unknown as StripeApiVersion,
    })
  : null;

export const PLATFORM_FEE_PERCENT = 0.128;

export function calculatePlatformFee(amountCents: number): number {
  return Math.round(amountCents * PLATFORM_FEE_PERCENT);
}
