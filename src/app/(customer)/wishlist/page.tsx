import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ExperienceCard } from "@/components/customer/search/ExperienceCard";
import Link from "next/link";

export const metadata = { title: "Merkliste | Erlebnisly" };

export default async function WishlistPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId } });
  if (!dbUser) redirect("/onboarding");

  const items = await prisma.wishlistItem.findMany({
    where: { userId: dbUser.id },
    include: {
      experience: {
        include: {
          category: true,
          _count: { select: { reviews: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const experiences = items
    .map((i) => i.experience)
    .filter((e) => e.isPublished && !e.deletedAt);

  const expIds = experiences.map((e) => e.id);
  const ratingAggs = expIds.length > 0
    ? await prisma.review.groupBy({
        by: ["experienceId"],
        where: { experienceId: { in: expIds } },
        _avg: { rating: true },
      })
    : [];
  const avgRatingMap = new Map(ratingAggs.map((r) => [r.experienceId, r._avg.rating]));

  return (
    <main className="max-w-360 mx-auto p-8">
      <header className="mb-8">
        <h1 className="type-display-lg text-ds-on-surface">Meine Merkliste</h1>
        <p className="type-body-sm text-ds-on-surface-variant mt-1">
          {experiences.length} gespeicherte{" "}
          {experiences.length === 1 ? "Erlebnis" : "Erlebnisse"}
        </p>
      </header>

      {experiences.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="material-symbols-outlined text-5xl text-ds-outline mb-4">
            favorite_border
          </span>
          <p className="type-title-sm text-ds-on-surface">Noch keine Erlebnisse gespeichert</p>
          <p className="type-body-sm text-ds-on-surface-variant mt-1">
            Klicke auf das Herz-Symbol, um Erlebnisse zu speichern.
          </p>
          <Link
            href="/experiences"
            className="mt-6 px-5 py-2 bg-ds-primary text-ds-on-primary rounded-ds type-body-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Erlebnisse entdecken
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {experiences.map((exp) => (
            <ExperienceCard
              key={exp.id}
              experience={{ ...exp, avgRating: avgRatingMap.get(exp.id) ?? null }}
              initialIsInWishlist={true}
            />
          ))}
        </div>
      )}
    </main>
  );
}
