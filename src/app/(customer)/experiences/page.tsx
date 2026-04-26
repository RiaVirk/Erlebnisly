import { prisma } from "@/lib/prisma";
import { getPublishedExperiences } from "@/lib/queries/experiences";
import { formatCentsEUR } from "@/lib/pricing/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// Next.js 15+: searchParams is a Promise
export default async function ExperiencesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;

  const [experiences, categories] = await Promise.all([
    getPublishedExperiences(sp),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Experiences</h1>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <Link href="/experiences">
          <Badge variant={!sp.category ? "default" : "secondary"}>All</Badge>
        </Link>
        {categories.map((cat) => (
          <Link key={cat.id} href={`/experiences?category=${cat.slug}`}>
            <Badge variant={sp.category === cat.slug ? "default" : "secondary"}>
              {cat.icon} {cat.name}
            </Badge>
          </Link>
        ))}
      </div>

      {/* Search — simple form submission, client-side enhancement in Phase 2 */}
      <form method="GET">
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Search experiences..."
          className="border rounded-lg px-4 py-2 w-full max-w-sm text-sm"
        />
      </form>

      {experiences.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          No experiences found.
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {experiences.map((exp) => (
          <Link key={exp.id} href={`/experiences/${exp.id}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
              {/* Image placeholder — real images in Phase 2 */}
              <div className="h-48 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                <span className="text-4xl">{exp.category.icon}</span>
              </div>
              <div className="p-4 space-y-2">
                <Badge variant="secondary" className="text-xs">
                  {exp.category.name}
                </Badge>
                <h2 className="font-semibold leading-tight">{exp.title}</h2>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {exp.shortDescription}
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="font-bold">{formatCentsEUR(exp.basePriceCents)}</span>
                  <span className="text-xs text-muted-foreground">per person</span>
                </div>
                <p className="text-xs text-muted-foreground">📍 {exp.location}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}