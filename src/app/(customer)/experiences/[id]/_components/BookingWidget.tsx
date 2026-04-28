"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import TimeSlotPicker from "@/components/TimeSlotPicker";
import { PriceLiveCalculator } from "@/components/pricing/PriceLiveCalculator";
import { WaitlistButton } from "@/components/waitlist/WaitlistButton";
import { createReservationHold } from "@/lib/actions/booking";
import type { AddOn, Prisma } from "@prisma/client";

type Slot = {
  id: string;
  startTime: Date;
  endTime: Date;
  capacity: number;
  taken: number;
  available: number;
};

type Props = {
  experience: {
    id: string;
    title: string;
    basePriceCents: number;
    maxParticipants: number;
    minParticipants: number;
    timezone: string;
    pricingRules: Prisma.JsonValue | null;
  };
  slots: Slot[];
  addOns: AddOn[];
};

export default function BookingWidget({ experience, slots, addOns }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>();

  const selectedSlot = slots.find((s) => s.id === selectedSlotId);
  const isFull = selectedSlot !== undefined && selectedSlot.available <= 0;

  function handleBook({
    participants,
    selectedAddOnIds,
    expectedTotalCents: _expectedTotalCents,
  }: {
    participants: number;
    selectedAddOnIds: string[];
    totalAddOnCents: number;
    expectedTotalCents: number;
  }) {
    if (!selectedSlotId) { toast.error("Please select a time slot"); return; }
    startTransition(async () => {
      const result = await createReservationHold({
        experienceId: experience.id,
        timeSlotId: selectedSlotId,
        participantCount: participants,
        selectedAddOnIds,
        // expectedTotalCents is a display hint only — server always recalculates
      });
      if (result.error) { toast.error(result.error); return; }
      if (result.checkoutUrl) window.location.href = result.checkoutUrl;
      else router.push(`/bookings/${result.bookingId}/thank-you`);
    });
  }

  return (
    <div className="space-y-5">
      <TimeSlotPicker
        slots={slots}
        timezone={experience.timezone}
        onSelect={setSelectedSlotId}
        selectedSlotId={selectedSlotId}
      />

      {selectedSlot && (
        isFull ? (
          <WaitlistButton timeSlotId={selectedSlot.id} isOnWaitlist={false} />
        ) : (
          <PriceLiveCalculator
            experience={experience}
            slotStartTime={selectedSlot.startTime}
            addOns={addOns}
            isLoading={isPending}
            onBook={handleBook}
          />
        )
      )}
    </div>
  );
}
