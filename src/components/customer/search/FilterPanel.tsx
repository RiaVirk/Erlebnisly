"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RawSearchParams } from "@/lib/actions/search";

interface Category {
  id: string;
  name: string;
}

interface Props {
  currentParams: RawSearchParams;
  categories: Category[];
}

export function FilterPanel({ currentParams, categories }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [q, setQ] = useState(String(currentParams.q ?? ""));
  const debouncedQ = useDebounce(q, 300);

  useEffect(() => {
    const next = new URLSearchParams(sp.toString());
    if (debouncedQ) next.set("q", debouncedQ);
    else next.delete("q");
    next.delete("page");
    router.replace(`${pathname}?${next.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  function setParam(key: string, value: string | undefined) {
    const next = new URLSearchParams(sp.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    next.delete("page");
    router.replace(`${pathname}?${next.toString()}`);
  }

  const minPrice = Number(currentParams.minPrice ?? 0);
  const maxPrice = Number(currentParams.maxPrice ?? 500);

  return (
    <div className="space-y-5 rounded-ds-lg border border-ds-outline-variant bg-white p-5">
      <div>
        <Label>Suche</Label>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Kajak, Keramik, Wandern…"
          className="mt-1"
        />
      </div>

      <div>
        <Label>Kategorie</Label>
        <Select
          value={String(currentParams.category ?? "any")}
          onValueChange={(v) => setParam("category", v === "any" ? undefined : v)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Alle Kategorien" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Alle Kategorien</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Schwierigkeitsgrad</Label>
        <Select
          value={String(currentParams.difficulty ?? "any")}
          onValueChange={(v) => setParam("difficulty", v === "any" ? undefined : v)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Beliebig</SelectItem>
            <SelectItem value="EASY">Einsteiger</SelectItem>
            <SelectItem value="MEDIUM">Mittel</SelectItem>
            <SelectItem value="HARD">Fortgeschritten</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Preis (€)</Label>
        <Slider
          min={0}
          max={500}
          step={10}
          value={[minPrice, maxPrice]}
          onValueCommit={([lo, hi]: [number, number]) => {
            setParam("minPrice", lo > 0 ? String(lo) : undefined);
            setParam("maxPrice", hi < 500 ? String(hi) : undefined);
          }}
          className="mt-3"
        />
        <p className="mt-1 text-sm text-muted-foreground">
          €{minPrice} – €{maxPrice === 500 ? "500+" : maxPrice}
        </p>
      </div>

      <div>
        <Label>Mindestbewertung</Label>
        <Select
          value={String(currentParams.minRating ?? "any")}
          onValueChange={(v) => setParam("minRating", v === "any" ? undefined : v)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Beliebig</SelectItem>
            <SelectItem value="3">★★★ und besser</SelectItem>
            <SelectItem value="4">★★★★ und besser</SelectItem>
            <SelectItem value="5">★★★★★ nur</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
