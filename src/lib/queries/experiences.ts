import { prisma } from "@/lib/prisma";
import type { Difficulty } from "@prisma/client";

export type GetExperiencesOptions = {
  category?: string;
  q?: string;
  difficulty?: string;
  page?: string;
  minPrice?: string;
  maxPrice?: string;
};

const PAGE_SIZE = 9;

export async function getPublishedExperiences(opts: GetExperiencesOptions) {
  const page = Math.max(1, Number(opts.page ?? "1"));

  const categoryRecord = opts.category
    ? await prisma.category.findUnique({ where: { slug: opts.category } })
    : null;

  const difficulty =
    opts.difficulty && ["EASY", "MEDIUM", "HARD"].includes(opts.difficulty.toUpperCase())
      ? (opts.difficulty.toUpperCase() as Difficulty)
      : undefined;

  const minCents = opts.minPrice ? Math.round(Number(opts.minPrice) * 100) : undefined;
  const maxCents = opts.maxPrice ? Math.round(Number(opts.maxPrice) * 100) : undefined;

  const where = {
    isPublished: true,
    isActive: true,
    deletedAt: null,
    ...(categoryRecord ? { categoryId: categoryRecord.id } : {}),
    ...(difficulty ? { difficulty } : {}),
    ...(opts.q
      ? {
          OR: [
            { title: { contains: opts.q, mode: "insensitive" as const } },
            { shortDescription: { contains: opts.q, mode: "insensitive" as const } },
            { location: { contains: opts.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    // Price range: experience price range overlaps the user's requested range
    ...(minCents !== undefined ? { maxPriceCents: { gte: minCents } } : {}),
    ...(maxCents !== undefined ? { minPriceCents: { lte: maxCents } } : {}),
  };

  const [experiences, total] = await Promise.all([
    prisma.experience.findMany({
      where,
      include: {
        category: true,
        host: { select: { name: true, imageUrl: true } },
        _count: { select: { reviews: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.experience.count({ where }),
  ]);

  return { experiences, total, page, pageSize: PAGE_SIZE };
}
