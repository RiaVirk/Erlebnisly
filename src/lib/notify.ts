"server-only";

// Central notification dispatcher — sends email and creates in-app notification.
// Email templates live in src/emails/. In-app notifications use the Notification model.
// Implementation filled in when email step is reached.

export type NotifyPayload =
  | { type: "booking_confirmed"; bookingId: string; userId: string }
  | { type: "booking_cancelled"; bookingId: string; userId: string }
  | { type: "hold_expired"; bookingId: string; userId: string }
  | { type: "refund_completed"; bookingId: string; userId: string }
  | { type: "review_prompt"; bookingId: string; userId: string }
  | { type: "waitlist_promoted"; bookingId: string; userId: string };

export async function notify(_payload: NotifyPayload): Promise<void> {
  // TODO: implement in email step
}
