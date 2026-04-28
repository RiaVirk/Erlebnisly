import { describe, it } from "vitest";

// Webhook handler unit tests.
// These will mock prisma and the Mollie client and assert that:
//   - paid     → CONFIRMED + BookingEvent
//   - canceled → EXPIRED_HOLD + BookingEvent
//   - refund confirmed (amountRefunded set) → REFUNDED / PARTIALLY_REFUNDED + BookingEvent
//   - idempotent second call returns 200 without duplicate event
// Implementation added in the webhook test step.
describe("mollie webhook", () => {
  it.todo("paid payment → CONFIRMED booking + BookingEvent");
  it.todo("canceled payment → EXPIRED_HOLD booking + BookingEvent");
  it.todo("refund confirmed → REFUNDED booking + BookingEvent");
  it.todo("partial refund confirmed → PARTIALLY_REFUNDED + BookingEvent");
  it.todo("idempotent: same status twice is a no-op");
  it.todo("unknown molliePaymentId returns 200 silently");
  it.todo("metadata bookingId mismatch returns 400");
});
