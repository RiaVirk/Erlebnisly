"use client";

import { useState, useCallback } from "react";
import type { AddOn, Experience } from "@prisma/client";
import { calculatePrice } from "@/lib/pricing/calculator";
import { AddOnsSelector } from "@/components/addons/AddOnsSelector";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Tag } from "lucide-react";

function formatCents(cents: number) {
  return (cents / 100).toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
  });
}

interface PriceLiveCalculatorProps {
  experience: Pick<
    Experience,
    "basePriceCents" | "minParticipants" | "maxParticipants" | "pricingRules"
  >;
  slotStartTime: Date;
  addOns: AddOn[];
  isLoading?: boolean;
  onBook: (params: {
    participants: number;
    selectedAddOnIds: string[];
    totalAddOnCents: number;
    expectedTotalCents: number;
  }) => void;
}

export function PriceLiveCalculator({
  experience,
  slotStartTime,
  addOns,
  isLoading = false,
  onBook,
}: PriceLiveCalculatorProps) {
  const [participants, setParticipants] = useState(experience.minParticipants);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>(
    addOns.filter((a) => !a.isOptional).map((a) => a.id)
  );
  const [addOnsCents, setAddOnsCents] = useState(
    addOns.filter((a) => !a.isOptional).reduce((s, a) => s + a.priceCents, 0)
  );

  const breakdown = calculatePrice({
    basePriceCents: experience.basePriceCents,
    participants,
    addOnsCents,
    slotStartTime,
    rawRules: experience.pricingRules,
  });

  const handleAddOnsChange = useCallback((ids: string[], cents: number) => {
    setSelectedAddOnIds(ids);
    setAddOnsCents(cents);
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold mb-2">Participants</p>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setParticipants((p) => Math.max(experience.minParticipants, p - 1))}
            disabled={participants <= experience.minParticipants}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center text-lg font-bold">{participants}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setParticipants((p) => Math.min(experience.maxParticipants, p + 1))}
            disabled={participants >= experience.maxParticipants}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">max {experience.maxParticipants}</span>
        </div>
      </div>

      <AddOnsSelector addOns={addOns} onSelectionChange={handleAddOnsChange} />

      <Separator />

      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            {formatCents(breakdown.perPersonCents)} × {participants} person
            {participants > 1 ? "s" : ""}
          </span>
          <span>{formatCents(breakdown.subtotalCents)}</span>
        </div>
        {addOnsCents > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Add-ons</span>
            <span>+{formatCents(addOnsCents)}</span>
          </div>
        )}
        {breakdown.appliedRules.map((rule) => (
          <div key={rule} className="flex items-center gap-1.5">
            <Tag className="h-3 w-3 text-primary" />
            <span className="text-xs text-primary">{rule}</span>
          </div>
        ))}
      </div>

      <Separator />

      <div className="flex justify-between font-bold">
        <span>Total</span>
        <span>{formatCents(breakdown.totalCents)}</span>
      </div>

      <Button
        className="w-full"
        size="lg"
        disabled={isLoading}
        onClick={() =>
          onBook({
            participants,
            selectedAddOnIds,
            totalAddOnCents: addOnsCents,
            expectedTotalCents: breakdown.totalCents,
          })
        }
      >
        {isLoading ? "Processing…" : "Book now"}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Your spot is held for 15 minutes while you pay.
      </p>
    </div>
  );
}
