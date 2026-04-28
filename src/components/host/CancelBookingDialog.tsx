"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cancelBookingAndRefund } from "@/lib/actions/refund";

interface Props {
  bookingId: string;
  /** Euros string for display, e.g. "49.99" */
  totalEur: string;
  slotStartTime: Date;
}

export function CancelBookingDialog({ bookingId, totalEur, slotStartTime }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const hoursUntil = Math.floor(
    (slotStartTime.getTime() - Date.now()) / 3_600_000
  );
  const policyLabel =
    hoursUntil >= 48
      ? "Full refund (>48h notice)"
      : hoursUntil >= 24
      ? "50% refund (24–48h notice)"
      : "No refund (<24h notice)";

  function handleConfirm() {
    startTransition(async () => {
      const result = await cancelBookingAndRefund({ bookingId, reason: reason || "Customer cancelled" });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Booking cancelled.");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        Cancel booking
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel booking</DialogTitle>
            <DialogDescription>
              Total paid: <strong>€{totalEur}</strong> — Policy: <strong>{policyLabel}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Reason (optional)</Label>
            <Textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Change of plans"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Keep booking
            </Button>
            <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
              {isPending ? "Cancelling…" : "Confirm cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
