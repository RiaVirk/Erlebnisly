"server-only";

import type { Prisma } from "@prisma/client";

export type RawSearchParams = Record<string, string | string[] | undefined>;

export interface ResolvedFilter {
  q?: string;
  categoryId?: string;
  minPriceCents?: number;
  maxPriceCents?: number;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  minRating?: number;
  orderBy: Prisma.ExperienceOrderByWithRelationInput[];
}

function asString(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export function resolveSearchParams(sp: RawSearchParams): ResolvedFilter {
  const minPrice = Number(asString(sp.minPrice));
  const maxPrice = Number(asString(sp.maxPrice));
  const minRating = Number(asString(sp.minRating));
  const sort = asString(sp.sort);

  let orderBy: Prisma.ExperienceOrderByWithRelationInput[];
  switch (sort) {
    case "price-asc":
      orderBy = [{ minPriceCents: "asc" }];
      break;
    case "price-desc":
      orderBy = [{ minPriceCents: "desc" }];
      break;
    case "rating":
      // Proxy: review count desc, then newest. A denormalized avgRating column
      // (Phase 5 task) would make this sort exact.
      orderBy = [{ reviews: { _count: "desc" } }, { createdAt: "desc" }];
      break;
    case "newest":
    default:
      orderBy = [{ createdAt: "desc" }];
  }

  const difficulty = asString(sp.difficulty);

  return {
    q: asString(sp.q)?.trim() || undefined,
    categoryId: asString(sp.category) || undefined,
    minPriceCents:
      Number.isFinite(minPrice) && minPrice >= 0
        ? Math.round(minPrice * 100)
        : undefined,
    maxPriceCents:
      Number.isFinite(maxPrice) && maxPrice > 0
        ? Math.round(maxPrice * 100)
        : undefined,
    difficulty:
      difficulty === "EASY" || difficulty === "MEDIUM" || difficulty === "HARD"
        ? difficulty
        : undefined,
    minRating:
      Number.isFinite(minRating) && minRating >= 1 && minRating <= 5
        ? minRating
        : undefined,
    orderBy,
  };
}
