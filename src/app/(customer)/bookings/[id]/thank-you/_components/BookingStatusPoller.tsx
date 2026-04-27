"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Polls the server every 2 seconds for up to 30 seconds.
// If the booking is confirmed, refreshes the page to show the confirmed state.
// If not confirmed after 30 seconds, shows a fallback message.

export default function BookingStatusPoller({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);
  const [gaveUp, setGaveUp] = useState(false);
  const MAX_ATTEMPTS = 15; // 15 × 2s = 30 seconds

  useEffect(() => {
    if (attempts >= MAX_ATTEMPTS) {
      setGaveUp(true);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}/status`);
        const data = await res.json();

        if (data.status === "CONFIRMED") {
          router.refresh(); // Re-renders the Server Component with new data
          return;
        }

        if (data.status === "EXPIRED_HOLD" || data.status === "NEEDS_REVIEW") {
          router.refresh();
          return;
        }

        // Still pending — try again
        setAttempts((a) => a + 1);
      } catch {
        setAttempts((a) => a + 1);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [attempts, bookingId, router]);

  if (gaveUp) {
    return (
      <div className="text-center text-sm text-muted-foreground p-4 border rounded-lg">
        We&apos;re waiting for payment confirmation. You&apos;ll receive an email once confirmed.
      </div>
    );
  }

  return (
    <div className="text-center text-sm text-muted-foreground animate-pulse">
      Waiting for payment confirmation...
    </div>
  );
}