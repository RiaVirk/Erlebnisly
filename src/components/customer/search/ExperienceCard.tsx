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
  category: { name: string };
  _count: { reviews: number };
  reviews: { rating: number }[];
}

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "Beginner",
  MEDIUM: "Intermediate",
  HARD: "Advanced",
};

const GRADIENTS = [
  "bg-gradient-to-br from-emerald-100 to-teal-200",
  "bg-gradient-to-br from-blue-100 to-indigo-200",
  "bg-gradient-to-br from-amber-100 to-orange-200",
  "bg-gradient-to-br from-pink-100 to-rose-200",
  "bg-gradient-to-br from-violet-100 to-purple-200",
];

interface Props {
  experience: ExperienceCardData;
  initialIsInWishlist?: boolean;
}

export function ExperienceCard({ experience: exp, initialIsInWishlist = false }: Props) {
  const durationHours = Math.round(exp.durationMinutes / 60);
  const durationLabel =
    exp.durationMinutes >= 480
      ? "Full Day"
      : exp.durationMinutes >= 60
      ? `${durationHours} Hour${durationHours !== 1 ? "s" : ""}`
      : `${exp.durationMinutes} min`;

  const avgRating =
    exp.reviews.length > 0
      ? (exp.reviews.reduce((s, r) => s + r.rating, 0) / exp.reviews.length).toFixed(1)
      : null;

  const gradientClass = GRADIENTS[exp.category.name.length % GRADIENTS.length];

  return (
    <div className="bg-white rounded-ds-md border border-ds-outline-variant overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      <div className={`relative h-48 ${gradientClass} flex items-center justify-center`}>
        <span
          className="material-symbols-outlined text-[64px] text-white/60 group-hover:scale-110 transition-transform duration-500"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          travel_explore
        </span>

        <div className="absolute top-3 right-3 flex items-center gap-1">
          <div className="px-3 py-1 bg-white/90 backdrop-blur rounded-full flex items-center gap-1 shadow-sm">
            <span
              className="material-symbols-outlined text-amber-500 text-title-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            <span className="type-data-tabular text-ds-on-surface">
              {avgRating ?? "—"}
            </span>
          </div>
          <div className="bg-white/90 backdrop-blur rounded-full shadow-sm">
            <WishlistHeart experienceId={exp.id} initialIsInWishlist={initialIsInWishlist} />
          </div>
        </div>

        <div className="absolute bottom-4 left-4">
          <span className="px-2 py-1 bg-ds-secondary text-ds-on-secondary type-label-caps rounded-ds">
            {exp.category.name}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="type-title-sm text-ds-on-surface mb-2 line-clamp-2">{exp.title}</h3>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-1.5 text-ds-on-surface-variant">
            <span className="material-symbols-outlined text-title-sm">schedule</span>
            <span className="type-body-sm">{durationLabel}</span>
          </div>
          <div className="flex items-center gap-1.5 text-ds-on-surface-variant">
            <span className="material-symbols-outlined text-title-sm">group</span>
            <span className="type-body-sm">Bis zu {exp.maxParticipants}</span>
          </div>
          <div className="flex items-center gap-1.5 text-ds-on-surface-variant">
            <span className="material-symbols-outlined text-title-sm">location_on</span>
            <span className="type-body-sm truncate max-w-20">{exp.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-ds-outline-variant pt-4">
          <div>
            <span className="type-label-caps text-ds-on-surface-variant block">AB</span>
            <span className="type-headline-md text-ds-on-surface">
              {formatCentsEUR(exp.basePriceCents)}
              <span className="type-body-sm font-normal text-ds-on-surface-variant">/Person</span>
            </span>
          </div>
          <Link
            href={`/experiences/${exp.id}`}
            className="px-6 py-2.5 border-2 border-ds-primary text-ds-primary font-bold rounded-ds type-body-sm hover:bg-ds-primary hover:text-ds-on-primary transition-all"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
