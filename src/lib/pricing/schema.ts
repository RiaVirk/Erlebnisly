// src/lib/pricing/schema.ts
import { z } from "zod";

export const PricingRulesSchema = z
  .object({
    groupDiscount: z
      .object({
        // Minimum number of participants to trigger the discount
        minParticipants: z.number().int().min(2),
        // In basis points: 1000 = 10%, 5000 = 50%, 10000 = 100%
        discountPercentageBps: z.number().int().min(0).max(10000),
      })
      .optional(),

    lastMinuteSurge: z
      .object({
        // Surge kicks in when slot starts within this many hours
        hoursBeforeStart: z.number().int().min(1).max(720),
        // Multiplier in basis points: 10000 = 1× (no change), 15000 = 1.5×, 20000 = 2×
        multiplierBps: z.number().int().min(10000).max(50000),
      })
      .optional(),

    peakSeasons: z
      .array(
        z.object({
          startDate: z.string().datetime(), // ISO 8601 e.g. "2025-12-20T00:00:00Z"
          endDate: z.string().datetime(),
          multiplierBps: z.number().int().min(10000).max(50000),
          label: z.string().optional(), // shown to customer e.g. "Christmas"
        })
      )
      .optional(),
  })
  .strict(); // rejects unknown keys

export type PricingRules = z.infer<typeof PricingRulesSchema>;

/** Safe parser — returns null instead of throwing for invalid/missing rules */
export function parsePricingRules(raw: unknown): PricingRules | null {
  const result = PricingRulesSchema.safeParse(raw);
  return result.success ? result.data : null;
}