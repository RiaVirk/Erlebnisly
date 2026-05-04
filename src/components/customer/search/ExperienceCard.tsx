import Image from "next/image";
import Link from "next/link";
import { formatCentsEUR } from "@/lib/pricing/utils";
import { WishlistHeart } from "@/components/customer/WishlistHeart";

export interface ExperienceCardData {
  id: string;
  title: string;
  location: string;
  durationMinutes: number;
  maxParticipants: number;
  basePriceCents: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  images: string[];
  category: { name: string };
  _count: { reviews: number };
  avgRating: number | null;
}

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "Beginner",
  MEDIUM: "Intermediate",
  HARD: "Advanced",
};

const CATEGORY_FALLBACK: Record<string, string> = {
  "Adventure":      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop&auto=format&q=80",
  "Food & Drink":   "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&auto=format&q=80",
  "Arts & Culture": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=600&fit=crop&auto=format&q=80",
  "Wellness":       "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop&auto=format&q=80",
  "Professional":   "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop&auto=format&q=80",
};

interface Props {
  experience: ExperienceCardData;
  initialIsInWishlist?: boolean;
}

export function ExperienceCard({ experience: exp, initialIsInWishlist = false }: Props) {
  const durationLabel =
    exp.durationMinutes >= 480
      ? "Full Day"
      : exp.durationMinutes >= 60
      ? `${Math.round(exp.durationMinutes / 60)}h`
      : `${exp.durationMinutes} min`;

  const avgRating = exp.avgRating != null ? exp.avgRating.toFixed(1) : null;

  const imageUrl =
    exp.images?.[0] ??
    CATEGORY_FALLBACK[exp.category.name] ??
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop&auto=format&q=80";

  return (
    <div className="bg-white rounded-ds-md border border-ds-outline-variant overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden shrink-0">
        <Image
          src={imageUrl}
          alt={exp.title}
          fill
          sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Overlay badges */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-ds-primary text-ds-on-primary type-label-caps rounded-full shadow-sm">
            {exp.category.name}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {avgRating && (
            <div className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full flex items-center gap-1 shadow-sm">
              <span className="material-symbols-outlined text-amber-500 text-sm" style={{ fontVariationSettings: "'FILL' 1", fontSize: 14 }}>star</span>
              <span className="type-data-tabular text-ds-on-surface text-xs">{avgRating}</span>
            </div>
          )}
          <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
            <WishlistHeart experienceId={exp.id} initialIsInWishlist={initialIsInWishlist} />
          </div>
        </div>
        {/* Difficulty badge */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2 py-0.5 bg-black/50 backdrop-blur-sm text-white type-label-caps rounded-full text-[10px]">
            {DIFFICULTY_LABELS[exp.difficulty]}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="type-label-bold text-ds-on-surface mb-3 line-clamp-2 leading-snug">{exp.title}</h3>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-4 text-ds-on-surface-variant">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
            <span className="type-body-sm">{durationLabel}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>group</span>
            <span className="type-body-sm">Bis {exp.maxParticipants}</span>
          </div>
          <div className="flex items-center gap-1 min-w-0">
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: 14 }}>location_on</span>
            <span className="type-body-sm truncate">{exp.location}</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-ds-outline-variant pt-4">
          <div>
            <span className="type-label-caps text-ds-on-surface-variant block">AB</span>
            <span className="text-lg font-bold text-ds-on-surface leading-tight">
              {formatCentsEUR(exp.basePriceCents)}
              <span className="text-xs font-normal text-ds-on-surface-variant ml-0.5">/Person</span>
            </span>
          </div>
          <Link
            href={`/experiences/${exp.id}`}
            className="px-5 py-2 bg-ds-primary text-ds-on-primary font-semibold rounded-ds type-body-sm hover:opacity-90 transition-opacity"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
