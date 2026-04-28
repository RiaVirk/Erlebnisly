"use client";

import { useState } from "react";
import type { AddOn } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

function formatCents(cents: number) {
  return (cents / 100).toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
  });
}

interface AddOnsSelectorProps {
  addOns: AddOn[];
  onSelectionChange: (selectedIds: string[], totalAddOnCents: number) => void;
}

export function AddOnsSelector({ addOns, onSelectionChange }: AddOnsSelectorProps) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(addOns.filter((a) => !a.isOptional).map((a) => a.id))
  );

  function toggle(id: string, isOptional: boolean) {
    if (!isOptional) return;

    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);

      const totalCents = addOns
        .filter((a) => next.has(a.id))
        .reduce((s, a) => s + a.priceCents, 0);

      onSelectionChange([...next], totalCents);
      return next;
    });
  }

  if (addOns.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">Add-ons</p>
      {addOns.map((addon) => {
        const checked = selected.has(addon.id);
        return (
          <Card
            key={addon.id}
            className={`cursor-pointer transition-colors ${checked ? "border-primary" : "border-border"}`}
            onClick={() => toggle(addon.id, addon.isOptional)}
          >
            <CardContent className="py-3 flex items-start gap-3">
              <Checkbox
                checked={checked}
                disabled={!addon.isOptional}
                onCheckedChange={() => toggle(addon.id, addon.isOptional)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{addon.name}</span>
                  {!addon.isOptional && (
                    <Badge variant="outline" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>
                {addon.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{addon.description}</p>
                )}
              </div>
              <span className="text-sm font-semibold shrink-0">+{formatCents(addon.priceCents)}</span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
