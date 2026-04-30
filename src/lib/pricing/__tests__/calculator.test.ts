// src/lib/pricing/__tests__/calculator.test.ts
import { describe, it, expect } from "vitest";
import { calculatePrice } from "../calculator";

// Helper: a Date N hours from a fixed reference
const REF = new Date("2025-06-01T12:00:00Z");
function hoursFrom(hours: number, base = REF): Date {
  return new Date(base.getTime() + hours * 3_600_000);
}

// ─── No rules ─────────────────────────────────────────────────────────────────
describe("no rules", () => {
  it("returns basePriceCents × participants", () => {
    const r = calculatePrice({
      basePriceCents: 5000,
      participants: 2,
      addOnsCents: 0,
      slotStartTime: hoursFrom(48),
      rawRules: null,
    });
    expect(r.totalCents).toBe(10_000);
    expect(r.appliedRules).toHaveLength(0);
  });

  it("adds addOns on top", () => {
    const r = calculatePrice({
      basePriceCents: 5000,
      participants: 1,
      addOnsCents: 1500,
      slotStartTime: hoursFrom(48),
      rawRules: null,
    });
    expect(r.totalCents).toBe(6_500);
  });

  it("never returns negative total", () => {
    const r = calculatePrice({
      basePriceCents: 0,
      participants: 3,
      addOnsCents: 0,
      slotStartTime: hoursFrom(48),
      rawRules: null,
    });
    expect(r.totalCents).toBe(0);
  });

  it("treats completely broken rules as no rules", () => {
    const r = calculatePrice({
      basePriceCents: 5000,
      participants: 2,
      addOnsCents: 0,
      slotStartTime: hoursFrom(48),
      rawRules: { nonsense: true },
    });
    expect(r.totalCents).toBe(10_000);
  });
});

// ─── Group discount ───────────────────────────────────────────────────────────
describe("groupDiscount", () => {
  const rules = {
    groupDiscount: { minParticipants: 3, discountPercentageBps: 1000 }, // 10%
  };

  it("does NOT apply below minimum", () => {
    const r = calculatePrice({ basePriceCents: 5000, participants: 2, addOnsCents: 0, slotStartTime: hoursFrom(48), rawRules: rules });
    expect(r.totalCents).toBe(10_000);
    expect(r.appliedRules).toHaveLength(0);
  });

  it("applies at exactly the minimum", () => {
    const r = calculatePrice({ basePriceCents: 5000, participants: 3, addOnsCents: 0, slotStartTime: hoursFrom(48), rawRules: rules });
    // 15000 × 90% = 13500
    expect(r.totalCents).toBe(13_500);
    expect(r.appliedRules[0]).toMatch("Group discount");
  });

  it("discount does NOT apply to add-ons", () => {
    const r = calculatePrice({ basePriceCents: 5000, participants: 3, addOnsCents: 2000, slotStartTime: hoursFrom(48), rawRules: rules });
    // (15000 × 0.9) + 2000 = 13500 + 2000 = 15500
    expect(r.totalCents).toBe(15_500);
  });
});

// ─── Last-minute surge ────────────────────────────────────────────────────────
describe("lastMinuteSurge", () => {
  const rules = {
    lastMinuteSurge: { hoursBeforeStart: 24, multiplierBps: 15000 }, // +50%
  };

  it("does NOT surge when slot is far away", () => {
    const r = calculatePrice({
      basePriceCents: 4000, participants: 1, addOnsCents: 0,
      slotStartTime: hoursFrom(48), rawRules: rules, now: REF,
    });
    expect(r.totalCents).toBe(4000);
  });

  it("surges when slot is within threshold", () => {
    const r = calculatePrice({
      basePriceCents: 4000, participants: 1, addOnsCents: 0,
      slotStartTime: hoursFrom(12), rawRules: rules, now: REF,
    });
    expect(r.totalCents).toBe(6000); // 4000 × 1.5
    expect(r.appliedRules[0]).toMatch("surge");
  });

  it("surges at exactly the boundary hour", () => {
    const r = calculatePrice({
      basePriceCents: 4000, participants: 1, addOnsCents: 0,
      slotStartTime: hoursFrom(24), rawRules: rules, now: REF,
    });
    expect(r.totalCents).toBe(6000);
  });
});

// ─── Peak seasons ─────────────────────────────────────────────────────────────
describe("peakSeasons", () => {
  const rules = {
    peakSeasons: [
      { startDate: "2025-12-20T00:00:00Z", endDate: "2026-01-05T23:59:59Z", multiplierBps: 20000, label: "Christmas" },
      { startDate: "2025-07-01T00:00:00Z", endDate: "2025-07-31T23:59:59Z", multiplierBps: 15000, label: "Summer" },
    ],
  };

  it("applies Christmas multiplier (2×)", () => {
    const r = calculatePrice({
      basePriceCents: 3000, participants: 2, addOnsCents: 0,
      slotStartTime: new Date("2025-12-25T10:00:00Z"), rawRules: rules,
    });
    expect(r.totalCents).toBe(12_000); // 3000 × 2 × 2 persons
    expect(r.appliedRules[0]).toContain("Christmas");
  });

  it("applies Summer multiplier (1.5×)", () => {
    const r = calculatePrice({
      basePriceCents: 3000, participants: 1, addOnsCents: 0,
      slotStartTime: new Date("2025-07-15T10:00:00Z"), rawRules: rules,
    });
    expect(r.totalCents).toBe(4500);
  });

  it("applies nothing outside all seasons", () => {
    const r = calculatePrice({
      basePriceCents: 3000, participants: 1, addOnsCents: 0,
      slotStartTime: new Date("2025-09-01T10:00:00Z"), rawRules: rules,
    });
    expect(r.totalCents).toBe(3000);
    expect(r.appliedRules).toHaveLength(0);
  });

  it("only applies the FIRST matching season (no stacking)", () => {
    const overlapping = {
      peakSeasons: [
        { startDate: "2025-07-01T00:00:00Z", endDate: "2025-07-31T23:59:59Z", multiplierBps: 20000, label: "First" },
        { startDate: "2025-07-10T00:00:00Z", endDate: "2025-07-20T23:59:59Z", multiplierBps: 30000, label: "Second" },
      ],
    };
    const r = calculatePrice({
      basePriceCents: 1000, participants: 1, addOnsCents: 0,
      slotStartTime: new Date("2025-07-15T10:00:00Z"), rawRules: overlapping,
    });
    expect(r.totalCents).toBe(2000); // 2× not 3×
    expect(r.appliedRules).toHaveLength(1);
    expect(r.appliedRules[0]).toContain("First");
  });
});

// ─── Combined rules ───────────────────────────────────────────────────────────
describe("combined rules", () => {
  it("peak + group discount", () => {
    const rules = {
      peakSeasons: [{ startDate: "2025-12-20T00:00:00Z", endDate: "2026-01-05T23:59:59Z", multiplierBps: 20000 }],
      groupDiscount: { minParticipants: 4, discountPercentageBps: 500 }, // 5%
    };
    const r = calculatePrice({
      basePriceCents: 5000, participants: 4, addOnsCents: 0,
      slotStartTime: new Date("2025-12-25T10:00:00Z"), rawRules: rules,
    });
    // per-person: 5000 × 2 = 10000 | subtotal: 10000 × 4 = 40000 | -5%: 38000
    expect(r.totalCents).toBe(38_000);
    expect(r.appliedRules).toHaveLength(2);
  });

  it("surge + group discount", () => {
    const rules = {
      lastMinuteSurge: { hoursBeforeStart: 24, multiplierBps: 12000 }, // +20%
      groupDiscount: { minParticipants: 3, discountPercentageBps: 1000 }, // -10%
    };
    const r = calculatePrice({
      basePriceCents: 10000, participants: 3, addOnsCents: 0,
      slotStartTime: hoursFrom(12), rawRules: rules, now: REF,
    });
    // per-person: 10000 × 1.2 = 12000 | subtotal: 12000 × 3 = 36000 | -10%: 32400
    expect(r.totalCents).toBe(32_400);
  });
});

// ─── Compound multipliers ─────────────────────────────────────────────────────
describe("compound multipliers", () => {
  it("peak × surge compound multiplicatively (not additively)", () => {
    // 14 h before slot: surge fires; slot is in summer: peak fires
    const r = calculatePrice({
      basePriceCents: 5000,
      participants: 1,
      addOnsCents: 0,
      slotStartTime: new Date("2026-06-15T10:00:00Z"),
      now: new Date("2026-06-14T20:00:00Z"),          // 14 h before
      rawRules: {
        peakSeasons: [{ startDate: "2026-06-01T00:00:00Z", endDate: "2026-08-31T23:59:59Z", multiplierBps: 15000 }],
        lastMinuteSurge: { hoursBeforeStart: 24, multiplierBps: 12000 },
      },
    });
    // 5000 × 1.5 (peak) = 7500; × 1.2 (surge) = 9000
    expect(r.totalCents).toBe(9000);
    expect(r.appliedRules).toHaveLength(2);
  });

  it("add-ons are NOT discounted by group discount (anti-double-discount)", () => {
    const r = calculatePrice({
      basePriceCents: 5000,
      participants: 5,
      addOnsCents: 1500,
      slotStartTime: hoursFrom(48),
      rawRules: { groupDiscount: { minParticipants: 4, discountPercentageBps: 1000 } },
    });
    // subtotal = 5 × 5000 = 25000, −10% = 22500; + addOns 1500 = 24000
    expect(r.totalCents).toBe(24000);
    expect(r.subtotalCents).toBe(22500);
    expect(r.addOnsCents).toBe(1500);
  });
});

// ─── Rounding ─────────────────────────────────────────────────────────────────
describe("rounding", () => {
  it("always returns an integer (no fractional cents)", () => {
    const rules = { groupDiscount: { minParticipants: 2, discountPercentageBps: 333 } };
    const r = calculatePrice({
      basePriceCents: 1000, participants: 3, addOnsCents: 0,
      slotStartTime: hoursFrom(48), rawRules: rules,
    });
    expect(Number.isInteger(r.totalCents)).toBe(true);
  });

  it("handles 1-cent base price", () => {
    const r = calculatePrice({
      basePriceCents: 1, participants: 100, addOnsCents: 0,
      slotStartTime: hoursFrom(48), rawRules: null,
    });
    expect(r.totalCents).toBe(100);
  });
});