// src/lib/pricing/calculator.ts
import { addHours, isWithinInterval, parseISO } from "date-fns";
import { parsePricingRules } from "./schema";

// ─── What you pass in ────────────────────────────────────────────────────────
export interface CalculatePriceParams {
  basePriceCents: number;   // experience.basePriceCents
  participants: number;     // how many people booking
  addOnsCents: number;      // total cost of selected add-ons (pre-summed)
  slotStartTime: Date;      // UTC date of the time slot
  rawRules: unknown;        // experience.pricingRules (raw JSON from DB)
  now?: Date;               // override current time — only used in tests
}

// ─── What you get back ───────────────────────────────────────────────────────
export interface PriceBreakdown {
  perPersonCents: number;   // price per person AFTER peak season / surge
  subtotalCents: number;    // perPerson × participants AFTER group discount
  addOnsCents: number;      // passed through unchanged
  totalCents: number;       // subtotal + addOns — what the customer pays
  appliedRules: string[];   // human-readable e.g. ["Christmas: +100%", "Group discount: -10%"]
}

export function calculatePrice({
  basePriceCents,
  participants,
  addOnsCents,
  slotStartTime,
  rawRules,
  now = new Date(),
}: CalculatePriceParams): PriceBreakdown {
  const rules = parsePricingRules(rawRules);
  const appliedRules: string[] = [];

  let perPersonCents = basePriceCents;

  // ── 1. Peak season (applies to per-person price) ──────────────────────────
  // Only the FIRST matching season applies — hosts should not create overlaps.
  if (rules?.peakSeasons?.length) {
    for (const season of rules.peakSeasons) {
      if (
        isWithinInterval(slotStartTime, {
          start: parseISO(season.startDate),
          end: parseISO(season.endDate),
        })
      ) {
        perPersonCents = Math.round(
          (perPersonCents * season.multiplierBps) / 10_000
        );
        const pct = (((season.multiplierBps / 10_000) - 1) * 100).toFixed(0);
        appliedRules.push(`${season.label ?? "Peak season"}: +${pct}%`);
        break;
      }
    }
  }

  // ── 2. Last-minute surge (applies to per-person price) ───────────────────
  if (rules?.lastMinuteSurge) {
    const threshold = addHours(now, rules.lastMinuteSurge.hoursBeforeStart);
    if (slotStartTime <= threshold) {
      perPersonCents = Math.round(
        (perPersonCents * rules.lastMinuteSurge.multiplierBps) / 10_000
      );
      const pct = (
        ((rules.lastMinuteSurge.multiplierBps / 10_000) - 1) *
        100
      ).toFixed(0);
      appliedRules.push(`Last-minute surge: +${pct}%`);
    }
  }

  // ── 3. Subtotal = perPerson × participants ────────────────────────────────
  let subtotalCents = perPersonCents * participants;

  // ── 4. Group discount (applies to subtotal — AFTER multiplying by count) ──
  if (
    rules?.groupDiscount &&
    participants >= rules.groupDiscount.minParticipants
  ) {
    const keepFactor = 10_000 - rules.groupDiscount.discountPercentageBps;
    subtotalCents = Math.round((subtotalCents * keepFactor) / 10_000);
    const pct = (rules.groupDiscount.discountPercentageBps / 100).toFixed(0);
    appliedRules.push(
      `Group discount (${participants}+ people): -${pct}%`
    );
  }

  return {
    perPersonCents,
    subtotalCents,
    addOnsCents,
    totalCents: Math.max(0, subtotalCents + addOnsCents),
    appliedRules,
  };
}

/** Convenience wrapper — returns only the total cents */
export function calculateTotalCents(params: CalculatePriceParams): number {
  return calculatePrice(params).totalCents;
}