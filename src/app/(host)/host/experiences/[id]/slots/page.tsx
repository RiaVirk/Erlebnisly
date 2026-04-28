"use client";

import { useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { createBulkTimeSlots } from "@/lib/actions/timeslot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const DAYS = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
  { label: "Sun", value: 0 },
];

export default function BulkSlotsPage() {
  const params = useParams<{ id: string }>();
  const experienceId = params.id;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [duration, setDuration] = useState(120);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]);
  const [capacity, setCapacity] = useState("");
  const [blockedDates, setBlockedDates] = useState("");

  function toggleDay(day: number) {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function handleSubmit() {
    if (!startDate || !endDate || daysOfWeek.length === 0) return;

    startTransition(async () => {
      const blocked = blockedDates
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean);

      const result = await createBulkTimeSlots(experienceId, {
        startDate,
        endDate,
        startTime,
        durationMinutes: duration,
        daysOfWeek,
        capacity: capacity ? Number(capacity) : undefined,
        blockedDates: blocked,
      });

      if ("error" in result && result.error) {
        toast.error(result.error);
      } else if (result.success) {
        toast.success(
          `Created ${result.created} slot${result.created !== 1 ? "s" : ""}!` +
            (result.skipped! > 0 ? ` (${result.skipped} already existed, skipped)` : "")
        );
        router.refresh();
      }
    });
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bulk create time slots</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Generates recurring slots for a date range. Duplicates are skipped automatically.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Start date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>End date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Start time (host timezone)</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                min={15}
                max={1440}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Repeat on</Label>
            <div className="flex gap-2 flex-wrap">
              {DAYS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleDay(d.value)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                    daysOfWeek.includes(d.value)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:bg-accent"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label>Capacity override (optional)</Label>
            <Input
              type="number"
              min={1}
              placeholder="Leave blank to use experience default"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label>Dates to skip (optional)</Label>
            <Input
              placeholder="2025-12-25, 2026-01-01"
              value={blockedDates}
              onChange={(e) => setBlockedDates(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated YYYY-MM-DD dates (e.g. holidays).
            </p>
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={isPending || !startDate || !endDate || daysOfWeek.length === 0}
          >
            {isPending ? "Creating slots…" : "Generate slots"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
