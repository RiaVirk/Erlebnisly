"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createTimeSlot } from "@/lib/actions/timeslot";

export default function TimeSlotForm({ experienceId }: { experienceId: string }) {
  const [isPending, startTransition] = useTransition();
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("12:00");

  function handleAdd() {
    if (!date) { toast.error("Pick a date"); return; }
    startTransition(async () => {
      const result = await createTimeSlot({ experienceId, date, startTime, endTime });
      if (result.error) toast.error(result.error);
      else { toast.success("Slot added!"); setDate(""); }
    });
  }

  return (
    <div className="flex items-end gap-3 p-4 border rounded-lg bg-muted/30">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Date</label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-40" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Start</label>
        <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-28" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">End</label>
        <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-28" />
      </div>
      <Button onClick={handleAdd} disabled={isPending}>
        {isPending ? "Adding..." : "Add Slot"}
      </Button>
    </div>
  );
}