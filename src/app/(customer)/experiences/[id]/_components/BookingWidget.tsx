"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import TimeSlotPicker from "@/components/TimeSlotPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCentsEUR } from "@/lib/pricing/utils";
import { createReservationHold } from "@/lib/actions/booking";

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
  };
  slots: Slot[];
};

export default function BookingWidget({ experience, slots }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>();
  const [participants, setParticipants] = useState(1);

  const selectedSlot = slots.find((s) => s.id === selectedSlotId);
  const totalCents = experience.basePriceCents * participants;

  function handleBook() {
    if (!selectedSlotId) { toast.error("Please select a time slot"); return; }
    startTransition(async () => {
      const result = await createReservationHold({
        experienceId: experience.id,
        timeSlotId: selectedSlotId,
        participantCount: participants,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      // Redirect to Mollie checkout
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    });
  }

  return (
    <div className="space-y-4">
      <TimeSlotPicker
        slots={slots}
        timezone={experience.timezone}
        onSelect={setSelectedSlotId}
        selectedSlotId={selectedSlotId}
      />

      {selectedSlot && (
        <div>
          <label className="text-sm font-medium">Participants</label>
          <Input
            type="number"
            min={experience.minParticipants}
            max={Math.min(experience.maxParticipants, selectedSlot.available)}
            value={participants}
            onChange={(e) => setParticipants(Number(e.target.value))}
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Max {selectedSlot.available} spots available
          </p>
        </div>
      )}

      {selectedSlotId && (
        <div className="border-t pt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>{formatCentsEUR(experience.basePriceCents)} × {participants}</span>
            <span>{formatCentsEUR(totalCents)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>{formatCentsEUR(totalCents)}</span>
          </div>
        </div>
      )}

      <Button
        className="w-full"
        disabled={!selectedSlotId || isPending}
        onClick={handleBook}
      >
        {isPending ? "Reserving..." : "Book Now"}
      </Button>
    </div>
  );
}