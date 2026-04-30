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

  return prisma.experience.findMany({
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
      reviews: { select: { rating: true } },
    },
  });
}
