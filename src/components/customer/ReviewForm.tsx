"use client";

// Review submission form shown on booking detail page when status === COMPLETED.
// Implementation added in review step.
export function ReviewForm({ bookingId }: { bookingId: string }) {
  return <div data-booking-id={bookingId} />;
}
