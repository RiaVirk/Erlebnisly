"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import TimeSlotPicker from "@/components/TimeSlotPicker";
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
  const [participants, setParticipants] = useState(experience.minParticipants);

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
      if (result.error) { toast.error(result.error); return; }
      if (result.checkoutUrl) window.location.href = result.checkoutUrl;
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
        <div>
          <label className="type-label-caps text-ds-on-surface-variant block mb-2">PARTICIPANTS</label>
          <input
            type="number"
            min={experience.minParticipants}
            max={Math.min(experience.maxParticipants, selectedSlot.available)}
            value={participants}
            onChange={(e) => setParticipants(Number(e.target.value))}
            className="w-full border border-ds-outline-variant rounded-ds px-3 py-2 type-body-sm text-ds-on-surface bg-white focus:border-ds-secondary focus:outline-none focus:ring-1 focus:ring-ds-secondary transition-colors"
          />
          <p className="type-body-sm text-ds-on-surface-variant mt-1">
            {selectedSlot.available} spot{selectedSlot.available !== 1 ? "s" : ""} available
          </p>
        </div>
      )}

      {selectedSlotId && (
        <div className="border border-ds-outline-variant rounded-ds-lg p-4 space-y-2">
          <div className="flex justify-between type-body-sm text-ds-on-surface-variant">
            <span>{formatCentsEUR(experience.basePriceCents)} × {participants}</span>
            <span>{formatCentsEUR(totalCents)}</span>
          </div>
          <div className="flex justify-between type-body-sm font-semibold text-ds-on-surface border-t border-ds-outline-variant pt-2">
            <span>Total</span>
            <span className="type-data-tabular">{formatCentsEUR(totalCents)}</span>
          </div>
        </div>
      )}

      <button
        disabled={!selectedSlotId || isPending}
        onClick={handleBook}
        className="w-full py-3 bg-ds-secondary text-ds-on-secondary type-body-sm font-semibold rounded-ds hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? "Reserving…" : "Book Now"}
      </button>
    </div>
  );
}
