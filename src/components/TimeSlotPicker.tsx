"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { toZonedTime, format as formatTz } from "date-fns-tz";
import { isSameDay } from "date-fns";

type Slot = {
  id: string;
  startTime: Date;
  endTime: Date;
  capacity: number;
  taken: number;
  available: number;
};

type Props = {
  slots: Slot[];
  timezone: string;
  onSelect: (slotId: string) => void;
  selectedSlotId?: string;
};

export default function TimeSlotPicker({
  slots,
  timezone,
  onSelect,
  selectedSlotId,
}: Props) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  // Dates that have at least one available slot
  const availableDates = slots
    .filter((s) => s.available > 0)
    .map((s) => toZonedTime(s.startTime, timezone));

  // Slots for the selected date
  const slotsForDate = selectedDate
    ? slots.filter((s) =>
        isSameDay(toZonedTime(s.startTime, timezone), selectedDate)
      )
    : [];

  return (
    <div className="space-y-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        disabled={(date) => {
          // Disable past dates and dates with no available slots
          if (date < new Date()) return true;
          return !availableDates.some((d) => isSameDay(d, date));
        }}
      />

      {selectedDate && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Available times:</p>
          {slotsForDate.length === 0 ? (
            <p className="text-sm text-muted-foreground">No slots on this date.</p>
          ) : (
            slotsForDate.map((slot) => {
              const localStart = toZonedTime(slot.startTime, timezone);
              const localEnd = toZonedTime(slot.endTime, timezone);
              const isSelected = slot.id === selectedSlotId;
              const isFull = slot.available === 0;

              return (
                <button
                  key={slot.id}
                  disabled={isFull}
                  onClick={() => onSelect(slot.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border text-sm transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/10 font-medium"
                      : isFull
                      ? "opacity-50 cursor-not-allowed bg-muted"
                      : "hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <span>
                    {formatTz(localStart, "HH:mm", { timeZone: timezone })}
                    {" – "}
                    {formatTz(localEnd, "HH:mm", { timeZone: timezone })}
                  </span>
                  <Badge variant={isFull ? "destructive" : "secondary"}>
                    {isFull ? "Full" : `${slot.available} left`}
                  </Badge>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}