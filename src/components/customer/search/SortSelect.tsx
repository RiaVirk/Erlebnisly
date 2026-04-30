"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RawSearchParams } from "@/lib/actions/search";

const OPTIONS = [
  { value: "newest", label: "Neueste" },
  { value: "price-asc", label: "Preis aufsteigend" },
  { value: "price-desc", label: "Preis absteigend" },
  { value: "rating", label: "Beliebteste" },
];

export function SortSelect({ currentParams }: { currentParams: RawSearchParams }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const current = Array.isArray(currentParams.sort)
    ? currentParams.sort[0]
    : (currentParams.sort ?? "newest");

  function handleChange(value: string) {
    const next = new URLSearchParams(sp.toString());
    if (value === "newest") next.delete("sort");
    else next.set("sort", value);
    router.replace(`${pathname}?${next.toString()}`);
  }

  return (
    <Select value={current} onValueChange={handleChange}>
      <SelectTrigger className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
