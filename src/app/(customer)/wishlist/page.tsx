import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ExperienceCard, type ExperienceCardData } from "@/components/customer/search/ExperienceCard";
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
          reviews: { select: { rating: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const experiences = items
    .map((i) => i.experience)
    .filter((e) => e.isPublished && !e.deletedAt);

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
            className="mt-6 px-5 py-2 bg-ds-secondary text-ds-on-secondary rounded-ds type-body-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Erlebnisse entdecken
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {(experiences as ExperienceCardData[]).map((exp) => (
            <ExperienceCard key={exp.id} experience={exp} initialIsInWishlist={true} />
          ))}
        </div>
      )}
    </main>
  );
}
