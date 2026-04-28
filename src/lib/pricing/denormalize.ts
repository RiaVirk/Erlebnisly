// src/lib/pricing/denormalize.ts
import { calculateTotalCents } from "./calculator";

interface ExperienceForPricing {
  basePriceCents: number;
  minParticipants: number;
  maxParticipants: number;
  pricingRules: unknown; // JSON from DB
}

/**
 * Computes the cheapest and most expensive possible price for browse filters.
 * min: 1 participant, far future (no surge/peak), no add-ons.
 * max: maxParticipants, 1 hour from now (triggers surge if configured), no add-ons.
 * This is intentionally approximate — good enough for range filtering.
 */
export function computeMinMaxPrice(exp: ExperienceForPricing): {
  minPriceCents: number;
  maxPriceCents: number;
} {
  const farFuture = new Date(Date.now() + 365 * 24 * 3_600_000);
  const nearFuture = new Date(Date.now() + 1 * 3_600_000);

  const minPriceCents = calculateTotalCents({
    basePriceCents: exp.basePriceCents,
    participants: exp.minParticipants,
    addOnsCents: 0,
    slotStartTime: farFuture,
    rawRules: exp.pricingRules,
  });

  const maxPriceCents = calculateTotalCents({
    basePriceCents: exp.basePriceCents,
    participants: exp.maxParticipants,
    addOnsCents: 0,
    slotStartTime: nearFuture,
    rawRules: exp.pricingRules,
  });

  return { minPriceCents, maxPriceCents };
}