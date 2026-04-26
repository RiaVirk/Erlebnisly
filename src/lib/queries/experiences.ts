import { prisma } from "@/lib/prisma";

type GetExperiencesOptions = {
  category?: string;
  q?: string;
  page?: string;
};

export async function getPublishedExperiences(opts: GetExperiencesOptions) {
  const page = Math.max(1, Number(opts.page ?? "1"));
  const pageSize = 12;

  const category = opts.category
    ? await prisma.category.findUnique({ where: { slug: opts.category } })
    : null;

  const experiences = await prisma.experience.findMany({
    where: {
      isPublished: true,
      isActive: true,
      deletedAt: null,
      ...(category ? { categoryId: category.id } : {}),
      ...(opts.q
        ? {
            OR: [
              { title: { contains: opts.q, mode: "insensitive" } },
              { shortDescription: { contains: opts.q, mode: "insensitive" } },
              { location: { contains: opts.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      category: true,
      host: { select: { name: true, imageUrl: true } },
      _count: { select: { reviews: true } },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return experiences;
}