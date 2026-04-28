import { describe, it, expect } from "vitest";
import { decideRefund } from "@/lib/refund-policy";

const SLOT = new Date("2026-06-01T14:00:00Z");

function now(hoursBeforeSlot: number): Date {
  return new Date(SLOT.getTime() - hoursBeforeSlot * 3_600_000);
}

describe("decideRefund — customer cancellation", () => {
  it(">48 h notice → full refund", () => {
    const d = decideRefund({ totalPriceCents: 10_000, slotStartTime: SLOT, cancelledBy: "customer", now: now(72) });
    expect(d.kind).toBe("full");
    if (d.kind !== "none") expect(d.refundCents).toBe(10_000);
  });

  it("exactly 48 h notice → full refund", () => {
    const d = decideRefund({ totalPriceCents: 10_000, slotStartTime: SLOT, cancelledBy: "customer", now: now(48) });
    expect(d.kind).toBe("full");
  });

  it("24–48 h notice → 50 % refund", () => {
    const d = decideRefund({ totalPriceCents: 10_000, slotStartTime: SLOT, cancelledBy: "customer", now: now(36) });
    expect(d.kind).toBe("partial");
    if (d.kind !== "none") expect(d.refundCents).toBe(5_000);
  });

  it("exactly 24 h notice → 50 % refund", () => {
    const d = decideRefund({ totalPriceCents: 10_000, slotStartTime: SLOT, cancelledBy: "customer", now: now(24) });
    expect(d.kind).toBe("partial");
  });

  it("<24 h notice → no refund", () => {
    const d = decideRefund({ totalPriceCents: 10_000, slotStartTime: SLOT, cancelledBy: "customer", now: now(12) });
    expect(d.kind).toBe("none");
  });
});

describe("decideRefund — host / admin cancellation", () => {
  it("host always gets full refund", () => {
    const d = decideRefund({ totalPriceCents: 8_000, slotStartTime: SLOT, cancelledBy: "host", now: now(1) });
    expect(d.kind).toBe("full");
    if (d.kind !== "none") expect(d.refundCents).toBe(8_000);
  });

  it("admin always gets full refund", () => {
    const d = decideRefund({ totalPriceCents: 8_000, slotStartTime: SLOT, cancelledBy: "admin", now: now(1) });
    expect(d.kind).toBe("full");
    if (d.kind !== "none") expect(d.refundCents).toBe(8_000);
  });
});
