import { differenceInHours } from "date-fns";

export type RefundDecision =
  | { kind: "full"; refundCents: number; reason: string }
  | { kind: "partial"; refundCents: number; reason: string }
  | { kind: "none"; reason: string };

interface PolicyInput {
  totalPriceCents: number;
  slotStartTime: Date;
  cancelledBy: "customer" | "host" | "admin";
  now?: Date;
}

/**
 * Cancellation policy (matches AGB obligations):
 *  - Customer >48h before  → 100% refund
 *  - Customer 24–48h       → 50% refund
 *  - Customer <24h         → no refund
 *  - Host or admin cancels → 100% refund always
 */
export function decideRefund({
  totalPriceCents,
  slotStartTime,
  cancelledBy,
  now = new Date(),
}: PolicyInput): RefundDecision {
  if (cancelledBy === "host" || cancelledBy === "admin") {
    return { kind: "full", refundCents: totalPriceCents, reason: `Cancelled by ${cancelledBy}` };
  }

  const hoursOut = differenceInHours(slotStartTime, now);

  if (hoursOut >= 48) {
    return { kind: "full", refundCents: totalPriceCents, reason: "More than 48h notice" };
  }
  if (hoursOut >= 24) {
    return {
      kind: "partial",
      refundCents: Math.floor(totalPriceCents / 2),
      reason: "24-48h notice (50% policy)",
    };
  }
  return { kind: "none", reason: "Less than 24h notice" };
}
