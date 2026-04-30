import { prisma } from "@/lib/prisma";
import { Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

export async function ReviewList({ experienceId }: { experienceId: string }) {
  const [reviews, agg] = await Promise.all([
    prisma.review.findMany({
      where: { experienceId },
      include: { user: { select: { name: true, imageUrl: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.review.aggregate({
      where: { experienceId },
      _avg: { rating: true },
      _count: true,
    }),
  ]);

  if (reviews.length === 0) {
    return <p className="text-sm text-muted-foreground">Noch keine Bewertungen.</p>;
  }

  return (
    <div className="space-y-6">
      <header className="flex items-baseline gap-2">
        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        <span className="text-lg font-semibold">
          {(agg._avg.rating ?? 0).toFixed(1)}
        </span>
        <span className="text-sm text-muted-foreground">
          ({agg._count} Bewertung{agg._count === 1 ? "" : "en"})
        </span>
      </header>

      <ul className="space-y-5">
        {reviews.map((r) => (
          <li key={r.id} className="border-t pt-4">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {r.user.imageUrl && (
                <img
                  src={r.user.imageUrl}
                  alt=""
                  className="h-9 w-9 rounded-full object-cover"
                />
              )}
              <div>
                <p className="text-sm font-medium">{r.user.name ?? "Gast"}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(r.createdAt, { addSuffix: true, locale: de })}
                </p>
              </div>
              <div className="ml-auto flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < r.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            {r.comment && (
              <p className="mt-3 text-sm leading-relaxed">{r.comment}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
