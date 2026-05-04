import "server-only";

import { prisma } from "@/lib/prisma";

export async function getSimilarExperiences(experienceId: string, limit = 4) {
  const target = await prisma.experience.findUnique({
    where: { id: experienceId },
    select: { categoryId: true, basePriceCents: true },
  });
  if (!target) return [];

  const lo = Math.round(target.basePriceCents * 0.75);
  const hi = Math.round(target.basePriceCents * 1.25);

  const similar = await prisma.experience.findMany({
    where: {
      id: { not: experienceId },
      isPublished: true,
      isActive: true,
      deletedAt: null,
      categoryId: target.categoryId,
      basePriceCents: { gte: lo, lte: hi },
    },
    orderBy: [
      { reviews: { _count: "desc" } },
      { createdAt: "desc" },
    ],
    take: limit,
    include: {
      category: true,
      _count: { select: { reviews: true } },
    },
  });

  if (similar.length === 0) return [];

  const ratingAggs = await prisma.review.groupBy({
    by: ["experienceId"],
    where: { experienceId: { in: similar.map((e) => e.id) } },
    _avg: { rating: true },
  });
  const avgRatingMap = new Map(ratingAggs.map((r) => [r.experienceId, r._avg.rating]));

  return similar.map((e) => ({ ...e, avgRating: avgRatingMap.get(e.id) ?? null }));
}
