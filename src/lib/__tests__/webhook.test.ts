// Mocks must be declared before the route import so Vitest hoists them before
// module initialization — env.ts validates at import time via Zod.
import { vi, describe, it, expect } from "vitest";

vi.mock("@/lib/env", () => ({
  env: {
    DATABASE_URL: "postgresql://localhost/test",
    NODE_ENV: "test",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_fake",
    CLERK_SECRET_KEY: "sk_test_fake",
    CLERK_WEBHOOK_SIGNING_SECRET: "fake_signing_secret",
    MOLLIE_API_KEY: "test_fake",
    MOLLIE_CLIENT_ID: "fake_client_id",
    MOLLIE_CLIENT_SECRET: "fake_client_secret",
    MOLLIE_REDIRECT_URI: "https://example.com/callback",
    APP_URL: "https://example.com",
    ENCRYPTION_KEY: "x".repeat(44),
    RESEND_API_KEY: "re_fake",
    EMAIL_FROM: "test@example.com",
    CRON_SECRET: "x".repeat(32),
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: {} }));
vi.mock("@/lib/mollie", () => ({ getHostMollieClient: vi.fn() }));
vi.mock("@/lib/waitlist-promotion", () => ({ promoteNextWaitlistEntry: vi.fn() }));
vi.mock("@/lib/ratelimit", () => ({
  rateLimit: vi.fn().mockResolvedValue({ success: true, remaining: 60, reset: 0, limit: 60 }),
  getIp: vi.fn().mockReturnValue("127.0.0.1"),
}));

import { decideNextStatus } from "@/app/api/mollie/webhook/route";

describe("webhook decision matrix", () => {
  it("RESERVED_HOLD + paid + spot ok → CONFIRMED", () => {
    const r = decideNextStatus("RESERVED_HOLD", "paid", 0, 5000, true);
    expect(r.newStatus).toBe("CONFIRMED");
  });

  it("RESERVED_HOLD + paid + no spot → NEEDS_REVIEW", () => {
    const r = decideNextStatus("RESERVED_HOLD", "paid", 0, 5000, false);
    expect(r.newStatus).toBe("NEEDS_REVIEW");
  });

  it("RESERVED_HOLD + canceled → EXPIRED_HOLD", () => {
    const r = decideNextStatus("RESERVED_HOLD", "canceled", 0, 5000, true);
    expect(r.newStatus).toBe("EXPIRED_HOLD");
  });

  it("CONFIRMED + canceled → no transition (already paid)", () => {
    const r = decideNextStatus("CONFIRMED", "canceled", 0, 5000, true);
    expect(r.newStatus).toBeNull();
  });

  it("CONFIRMED + full refund → REFUNDED", () => {
    const r = decideNextStatus("CONFIRMED", "paid", 5000, 5000, true);
    expect(r.newStatus).toBe("REFUNDED");
  });

  it("CONFIRMED + partial refund → PARTIALLY_REFUNDED", () => {
    const r = decideNextStatus("CONFIRMED", "paid", 2500, 5000, true);
    expect(r.newStatus).toBe("PARTIALLY_REFUNDED");
  });

  it("EXPIRED_HOLD + expired → no transition (already expired)", () => {
    const r = decideNextStatus("EXPIRED_HOLD", "expired", 0, 5000, true);
    expect(r.newStatus).toBeNull();
  });
});
