import { describe, it, expect } from "vitest";
import { createReviewSchema } from "@shared/schema";

// ---------------------------------------------------------------------------
// Pure business-rule helpers extracted from the review POST route logic.
// These mirror the checks in server/routes/misc.ts POST /api/reviews so that
// the rules are testable without a real database or HTTP server.
// ---------------------------------------------------------------------------

type OrderStatus = "PENDING" | "PAID" | "CANCELED";

interface MockOrder {
  id: string;
  buyerId: string;
  trainerId: string;
  status: OrderStatus;
}

type GuardResult =
  | { ok: true }
  | { ok: false; status: number; code?: string; message: string };

function checkReviewGuard(
  order: MockOrder | undefined,
  requesterId: string,
  existingReview: boolean,
): GuardResult {
  if (!order) return { ok: false, status: 404, message: "Order not found" };
  if (order.buyerId !== requesterId) return { ok: false, status: 403, message: "Not your order" };
  if (order.status !== "PAID") return { ok: false, status: 403, code: "PAYMENT_REQUIRED", message: "A completed payment is required before leaving a review." };
  if (existingReview) return { ok: false, status: 409, message: "You have already reviewed this order" };
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Guard logic tests
// ---------------------------------------------------------------------------

describe("review guard", () => {
  const paidOrder: MockOrder = { id: "order-1", buyerId: "user-1", trainerId: "trainer-1", status: "PAID" };

  it("allows a review when the order is PAID and belongs to the requester", () => {
    const result = checkReviewGuard(paidOrder, "user-1", false);
    expect(result.ok).toBe(true);
  });

  it("blocks with 403 PAYMENT_REQUIRED when order is PENDING", () => {
    const pendingOrder: MockOrder = { ...paidOrder, status: "PENDING" };
    const result = checkReviewGuard(pendingOrder, "user-1", false);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
      expect(result.code).toBe("PAYMENT_REQUIRED");
    }
  });

  it("blocks with 403 PAYMENT_REQUIRED when order is CANCELED", () => {
    const canceledOrder: MockOrder = { ...paidOrder, status: "CANCELED" };
    const result = checkReviewGuard(canceledOrder, "user-1", false);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
      expect(result.code).toBe("PAYMENT_REQUIRED");
    }
  });

  it("blocks with 403 when the requester is not the buyer", () => {
    const result = checkReviewGuard(paidOrder, "other-user", false);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
      expect(result.code).toBeUndefined(); // "Not your order", not PAYMENT_REQUIRED
    }
  });

  it("blocks with 404 when the order does not exist", () => {
    const result = checkReviewGuard(undefined, "user-1", false);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(404);
    }
  });

  it("blocks with 409 when a review already exists for this order", () => {
    const result = checkReviewGuard(paidOrder, "user-1", true);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(409);
    }
  });
});

// ---------------------------------------------------------------------------
// Input validation (createReviewSchema)
// ---------------------------------------------------------------------------

describe("createReviewSchema", () => {
  it("accepts a valid payload", () => {
    const result = createReviewSchema.safeParse({ orderId: "order-1", rating: 4, comment: "Great!" });
    expect(result.success).toBe(true);
  });

  it("accepts a payload without a comment", () => {
    const result = createReviewSchema.safeParse({ orderId: "order-1", rating: 5 });
    expect(result.success).toBe(true);
  });

  it("rejects a rating below 1", () => {
    const result = createReviewSchema.safeParse({ orderId: "order-1", rating: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects a rating above 5", () => {
    const result = createReviewSchema.safeParse({ orderId: "order-1", rating: 6 });
    expect(result.success).toBe(false);
  });

  it("rejects a missing orderId", () => {
    const result = createReviewSchema.safeParse({ rating: 3 });
    expect(result.success).toBe(false);
  });

  it("rejects a non-integer rating", () => {
    const result = createReviewSchema.safeParse({ orderId: "order-1", rating: 3.5 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Average-rating exclusion logic
// Verifies that only PAID-order reviews should be counted toward the average.
// This documents the invariant enforced by the DB queries in storage.ts.
// ---------------------------------------------------------------------------

type ReviewWithOrderStatus = { rating: number; orderStatus: OrderStatus };

function computeVerifiedAverage(rows: ReviewWithOrderStatus[]): number {
  const paid = rows.filter((r) => r.orderStatus === "PAID");
  if (paid.length === 0) return 0;
  return Number((paid.reduce((s, r) => s + r.rating, 0) / paid.length).toFixed(1));
}

describe("verified average rating", () => {
  it("returns 0 when there are no reviews", () => {
    expect(computeVerifiedAverage([])).toBe(0);
  });

  it("averages only PAID-order reviews", () => {
    const rows: ReviewWithOrderStatus[] = [
      { rating: 5, orderStatus: "PAID" },
      { rating: 4, orderStatus: "PAID" },
      { rating: 1, orderStatus: "CANCELED" }, // must be excluded
      { rating: 1, orderStatus: "PENDING" },  // must be excluded
    ];
    expect(computeVerifiedAverage(rows)).toBe(4.5);
  });

  it("returns 0 when all reviews are from non-PAID orders", () => {
    const rows: ReviewWithOrderStatus[] = [
      { rating: 5, orderStatus: "PENDING" },
      { rating: 3, orderStatus: "CANCELED" },
    ];
    expect(computeVerifiedAverage(rows)).toBe(0);
  });

  it("rounds to one decimal place", () => {
    const rows: ReviewWithOrderStatus[] = [
      { rating: 4, orderStatus: "PAID" },
      { rating: 4, orderStatus: "PAID" },
      { rating: 5, orderStatus: "PAID" },
    ];
    // (4 + 4 + 5) / 3 = 4.333... → 4.3
    expect(computeVerifiedAverage(rows)).toBe(4.3);
  });
});
