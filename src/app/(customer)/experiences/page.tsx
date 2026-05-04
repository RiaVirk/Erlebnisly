import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { resolveSearchParams, type RawSearchParams } from "@/lib/actions/search";
import { ExperienceCard } from "@/components/customer/search/ExperienceCard";
import { FilterPanel } from "@/components/customer/search/FilterPanel";
import { SortSelect } from "@/components/customer/search/SortSelect";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default async function ExperiencesPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const sp = await searchParams;

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <>
      <header className="sticky top-0 h-14 sm:h-16 border-b border-ds-outline-variant bg-white/80 backdrop-blur-md flex justify-between items-center px-4 sm:px-8 z-40 gap-3">
        <h1 className="type-title-sm text-ds-on-surface font-bold truncate">Erlebnisse entdecken</h1>
        <SortSelect currentParams={sp} />
      </header>

      <div className="max-w-360 mx-auto p-4 sm:p-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Filter panel — collapsible details on mobile, sticky aside on desktop */}
          <aside className="lg:w-72 lg:shrink-0 lg:sticky lg:top-20 lg:self-start">
            <details className="lg:block" open>
              <summary className="lg:hidden cursor-pointer flex items-center justify-between p-4 bg-white border border-ds-outline-variant rounded-ds mb-2 type-body-sm font-semibold text-ds-on-surface">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>tune</span>
                  Filters
                </span>
                <span className="material-symbols-outlined text-ds-on-surface-variant" style={{ fontSize: 18 }}>expand_more</span>
              </summary>
              <FilterPanel currentParams={sp} categories={categories} />
            </details>
          </aside>

          <main className="flex-1 min-w-0">
            <Suspense key={JSON.stringify(sp)} fallback={<ResultsSkeleton />}>
              <Results sp={sp} />
            </Suspense>
          </main>
        </div>
      </div>
    </>
  );
}

async function Results({ sp }: { sp: RawSearchParams }) {
  const filter = resolveSearchParams(sp);
  const page = Math.max(1, Number(sp.page ?? "1"));
  const PAGE_SIZE = 9;

  // Fetch wishlist for authenticated user to pre-populate hearts.
  const { userId: clerkId } = await auth();
  let wishlistSet = new Set<string>();
  if (clerkId) {
    const dbUser = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
    if (dbUser) {
      const items = await prisma.wishlistItem.findMany({
        where: { userId: dbUser.id },
        select: { experienceId: true },
      });
      wishlistSet = new Set(items.map((i) => i.experienceId));
    }
  }

  const where = {
    isPublished: true,
    isActive: true,
    deletedAt: null,
    ...(filter.categoryId && { categoryId: filter.categoryId }),
    ...(filter.q && {
      OR: [
        { title: { contains: filter.q, mode: "insensitive" as const } },
        { shortDescription: { contains: filter.q, mode: "insensitive" as const } },
        { location: { contains: filter.q, mode: "insensitive" as const } },
      ],
    }),
    ...(filter.minPriceCents !== undefined && {
      maxPriceCents: { gte: filter.minPriceCents },
    }),
    ...(filter.maxPriceCents !== undefined && {
      minPriceCents: { lte: filter.maxPriceCents },
    }),
    ...(filter.difficulty && { difficulty: filter.difficulty }),
    ...(filter.minRating && {
      reviews: { some: { rating: { gte: filter.minRating } } },
    }),
  };

  const [experiences, total] = await Promise.all([
    prisma.experience.findMany({
      where,
      include: {
        category: true,
        _count: { select: { reviews: true } },
      },
      orderBy: filter.orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.experience.count({ where }),
  ]);

  // Compute average ratings in one aggregate query instead of loading all review rows
  const experienceIds = experiences.map((e) => e.id);
  const ratingAggs = experienceIds.length > 0
    ? await prisma.review.groupBy({
        by: ["experienceId"],
        where: { experienceId: { in: experienceIds } },
        _avg: { rating: true },
      })
    : [];
  const avgRatingMap = new Map(ratingAggs.map((r) => [r.experienceId, r._avg.rating]));

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (experiences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center text-ds-on-surface-variant">
        <span className="material-symbols-outlined text-5xl mb-4">sentiment_dissatisfied</span>
        <p className="type-title-sm text-ds-on-surface">Keine Erlebnisse gefunden</p>
        <p className="type-body-sm mt-1">Versuche andere Filter oder Suchbegriffe.</p>
        <Link
          href="/experiences"
          className="mt-6 px-5 py-2 bg-ds-primary text-ds-on-primary rounded-ds type-body-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Filter zurücksetzen
        </Link>
      </div>
    );
  }

  function pageHref(p: number) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (v && k !== "page") params.set(k, String(v));
    }
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/experiences${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-8">
      <p className="type-body-sm text-ds-on-surface-variant">
        {total} Erlebnis{total !== 1 ? "se" : ""}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {experiences.map((exp) => (
          <ExperienceCard
            key={exp.id}
            experience={{ ...exp, avgRating: avgRatingMap.get(exp.id) ?? null }}
            initialIsInWishlist={wishlistSet.has(exp.id)}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 border-t border-ds-outline-variant pt-8">
          {page > 1 && (
            <Link
              href={pageHref(page - 1)}
              className="w-10 h-10 flex items-center justify-center rounded-ds border border-ds-outline-variant text-ds-on-surface hover:bg-ds-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-title-sm">chevron_left</span>
            </Link>
          )}
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={pageHref(p)}
              className={`w-10 h-10 flex items-center justify-center rounded-ds type-data-tabular transition-colors ${
                p === page
                  ? "bg-ds-primary text-ds-on-primary font-bold"
                  : "border border-ds-outline-variant text-ds-on-surface hover:bg-ds-surface-container-low"
              }`}
            >
              {p}
            </Link>
          ))}
          {page < totalPages && (
            <Link
              href={pageHref(page + 1)}
              className="w-10 h-10 flex items-center justify-center rounded-ds border border-ds-outline-variant text-ds-on-surface hover:bg-ds-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-title-sm">chevron_right</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-5 w-32" />
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-72 w-full rounded-ds-md" />
        ))}
      </div>
    </div>
  );
}
