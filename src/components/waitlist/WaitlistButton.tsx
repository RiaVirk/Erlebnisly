"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { joinWaitlist, leaveWaitlist } from "@/lib/actions/waitlist";
import { Clock } from "lucide-react";
import { toast } from "sonner";

interface WaitlistButtonProps {
  timeSlotId: string;
  isOnWaitlist: boolean;
  currentPosition?: number;
}

export function WaitlistButton({
  timeSlotId,
  isOnWaitlist,
  currentPosition,
}: WaitlistButtonProps) {
  const [loading, setLoading] = useState(false);
  const [onList, setOnList] = useState(isOnWaitlist);
  const [position, setPosition] = useState(currentPosition);

  async function handleJoin() {
    setLoading(true);
    const result = await joinWaitlist(timeSlotId);
    setLoading(false);

    if ("error" in result) {
      toast.error(result.error);
    } else {
      setOnList(true);
      setPosition(result.position);
      toast.success(`You're #${result.position} on the waitlist!`);
    }
  }

  async function handleLeave() {
    setLoading(true);
    const result = await leaveWaitlist(timeSlotId);
    setLoading(false);

    if ("error" in result) {
      toast.error(result.error);
    } else {
      setOnList(false);
      setPosition(undefined);
      toast.success("Removed from waitlist.");
    }
  }

  if (onList) {
    return (
      <div className="space-y-2">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            You&apos;re <strong>#{position}</strong> on the waitlist. We&apos;ll email you if a
            spot opens.
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={handleLeave} disabled={loading}>
          {loading ? "Leaving…" : "Leave waitlist"}
        </Button>
      </div>
    );
  }

  return (
    <Button variant="secondary" className="w-full" onClick={handleJoin} disabled={loading}>
      <Clock className="h-4 w-4 mr-2" />
      {loading ? "Joining…" : "Join waitlist — this slot is full"}
    </Button>
  );
}
