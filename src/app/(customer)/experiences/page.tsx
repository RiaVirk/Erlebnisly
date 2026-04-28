import { prisma } from "@/lib/prisma";
import { getPublishedExperiences } from "@/lib/queries/experiences";
import { formatCentsEUR } from "@/lib/pricing/utils";
import Link from "next/link";

export default async function ExperiencesPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    q?: string;
    difficulty?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}) {
  const sp = await searchParams;

  const [{ experiences, total, page, pageSize }, categories] = await Promise.all([
    getPublishedExperiences(sp),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / pageSize);
  const q = sp.q ?? "";
  const activeCategory = sp.category ?? "";
  const activeDifficulty = sp.difficulty?.toUpperCase() ?? "";

  const headingText = q
    ? `Results for "${q}"`
    : activeCategory
    ? (categories.find((c) => c.slug === activeCategory)?.name ?? "Experiences")
    : "All Experiences";

  const resultSub = q
    ? `${total} result${total !== 1 ? "s" : ""} found`
    : `${total} experience${total !== 1 ? "s" : ""} available`;

  function filterHref(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { q, category: activeCategory, difficulty: sp.difficulty, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v);
    }
    params.delete("page");
    const qs = params.toString();
    return `/experiences${qs ? `?${qs}` : ""}`;
  }

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 h-16 border-b border-ds-outline-variant bg-white/80 backdrop-blur-md flex justify-between items-center px-8 z-40">
        <form method="GET" className="flex items-center bg-ds-surface-container-low rounded-full px-4 py-1.5 w-96">
          <span className="material-symbols-outlined text-ds-outline mr-2 text-title-sm">search</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search activities..."
            className="bg-transparent border-none focus:ring-0 type-body-sm w-full outline-none"
          />
          {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
          {activeDifficulty && <input type="hidden" name="difficulty" value={activeDifficulty} />}
        </form>

        <div className="flex items-center gap-6">
          <button className="text-ds-on-surface-variant hover:text-ds-on-surface transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="text-ds-on-surface-variant hover:text-ds-on-surface transition-colors">
            <span className="material-symbols-outlined">history</span>
          </button>
          <div className="flex items-center gap-3 border-l border-ds-outline-variant pl-6">
            <span className="material-symbols-outlined text-ds-on-surface-variant">account_circle</span>
            <span className="type-body-sm font-semibold text-ds-on-surface">My Account</span>
          </div>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto p-8">
        {/* ── Page header ─────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <nav className="flex type-label-caps text-ds-on-surface-variant mb-2 gap-2">
              <span>ACTIVITIES</span>
              <span>/</span>
              <span>SEARCH RESULTS</span>
            </nav>
            <h2 className="type-display-lg text-ds-on-surface">{headingText}</h2>
            <p className="type-body-md text-ds-on-surface-variant mt-1">{resultSub}</p>
          </div>

          <div className="flex items-center bg-white p-1 rounded-ds-lg border border-ds-outline-variant shadow-sm">
            <button className="flex items-center gap-2 px-4 py-2 bg-ds-secondary text-ds-on-secondary rounded-ds type-body-sm font-medium">
              <span className="material-symbols-outlined text-title-sm">grid_view</span>
              Grid
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-ds-on-surface-variant type-body-sm font-medium rounded-ds">
              <span className="material-symbols-outlined text-title-sm">map</span>
              Map View
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* ── Filter sidebar ───────────────────────────────────── */}
          <aside className="w-72 shrink-0 space-y-6">
            <div className="bg-white p-4 rounded-ds-lg border border-ds-outline-variant shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="type-title-sm text-ds-on-surface">Filters</h3>
                <Link href="/experiences" className="type-label-caps text-ds-secondary hover:underline">
                  RESET
                </Link>
              </div>

              {/* Activity Type — checkboxes matching design */}
              <div className="mb-6">
                <p className="type-label-caps text-ds-on-surface-variant mb-3">ACTIVITY TYPE</p>
                <div className="space-y-1">
                  {categories.map((cat) => {
                    const checked = activeCategory === cat.slug;
                    return (
                      <label
                        key={cat.id}
                        className={`flex items-center gap-3 p-2 rounded cursor-pointer group transition-colors ${
                          checked ? "bg-ds-secondary-container/20" : "hover:bg-ds-surface-container-low"
                        }`}
                      >
                        <Link
                          href={filterHref({ category: checked ? "" : cat.slug })}
                          className="contents"
                        >
                          <span
                            className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                              checked
                                ? "bg-ds-secondary border-ds-secondary"
                                : "border-ds-outline-variant group-hover:border-ds-secondary"
                            }`}
                          >
                            {checked && (
                              <span className="material-symbols-outlined text-white text-label-caps" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>
                                check
                              </span>
                            )}
                          </span>
                          <span className={`type-body-sm ${checked ? "text-ds-secondary font-semibold" : "text-ds-on-surface group-hover:text-ds-on-surface"}`}>
                            {cat.name}
                          </span>
                        </Link>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Price Range — visual only, phase 1 */}
              <div className="mb-6">
                <p className="type-label-caps text-ds-on-surface-variant mb-3">PRICE RANGE</p>
                <div className="px-2">
                  <input
                    type="range"
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-ds-secondary"
                    style={{ background: "linear-gradient(to right, #006c49 50%, #e0e3e5 50%)" }}
                    defaultValue={50}
                  />
                  <div className="flex justify-between mt-2 type-data-tabular text-ds-on-surface-variant">
                    <span>€0</span>
                    <span>€500+</span>
                  </div>
                </div>
              </div>

              {/* Difficulty */}
              <div className="mb-6">
                <p className="type-label-caps text-ds-on-surface-variant mb-3">DIFFICULTY LEVEL</p>
                <div className="grid gap-2">
                  {(["EASY", "MEDIUM", "HARD"] as const).map((d) => (
                    <Link
                      key={d}
                      href={filterHref({ difficulty: activeDifficulty === d ? "" : d })}
                      className={`text-left px-4 py-2 rounded-ds border type-body-sm transition-colors ${
                        activeDifficulty === d
                          ? "border-2 border-ds-secondary bg-ds-secondary-container/20 text-ds-secondary font-semibold"
                          : "border-ds-outline-variant text-ds-on-surface hover:border-ds-secondary"
                      }`}
                    >
                      {d === "EASY" ? "Beginner" : d === "MEDIUM" ? "Intermediate" : "Advanced"}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Group Size */}
              <div>
                <p className="type-label-caps text-ds-on-surface-variant mb-3">GROUP SIZE</p>
                <select className="w-full bg-ds-surface-container-low border border-ds-outline-variant rounded-ds p-2.5 type-body-sm text-ds-on-surface focus:border-ds-secondary focus:outline-none">
                  <option>Any size</option>
                  <option>1–4 people</option>
                  <option>5–10 people</option>
                  <option>10+ people</option>
                </select>
              </div>
            </div>

            {/* Promo card */}
            <div className="bg-ds-primary-container p-6 rounded-ds-xl text-white">
              <span className="material-symbols-outlined text-ds-secondary-fixed-dim text-4xl mb-4 block"
                style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
              <h4 className="type-title-sm mb-2">Need a custom plan?</h4>
              <p className="type-body-sm text-ds-on-primary-container mb-4">
                Contact our concierge for large corporate event bookings.
              </p>
              <button className="w-full py-2 bg-white text-ds-primary font-bold rounded-ds hover:bg-ds-surface-container-low transition-colors type-body-sm">
                Talk to Sales
              </button>
            </div>
          </aside>

          {/* ── Card grid ─────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {experiences.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center text-ds-on-surface-variant">
                <span className="material-symbols-outlined text-5xl mb-4">sentiment_dissatisfied</span>
                <p className="type-title-sm text-ds-on-surface">No experiences found</p>
                <p className="type-body-sm mt-1">Try adjusting your filters or search term.</p>
                <Link
                  href="/experiences"
                  className="mt-6 px-5 py-2 bg-ds-secondary text-ds-on-secondary rounded-ds type-body-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Clear filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {experiences.map((exp) => (
                  <ExperienceCard key={exp.id} exp={exp} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-between border-t border-ds-outline-variant pt-8">
                <p className="type-body-sm text-ds-on-surface-variant">
                  Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total} results
                </p>
                <div className="flex items-center gap-2">
                  {page > 1 ? (
                    <Link
                      href={filterHref({ page: String(page - 1) })}
                      className="w-10 h-10 flex items-center justify-center rounded-ds border border-ds-outline-variant text-ds-on-surface hover:bg-ds-surface-container-low transition-colors"
                    >
                      <span className="material-symbols-outlined text-title-sm">chevron_left</span>
                    </Link>
                  ) : (
                    <span className="w-10 h-10 flex items-center justify-center rounded-ds border border-ds-outline-variant text-ds-outline cursor-not-allowed">
                      <span className="material-symbols-outlined text-title-sm">chevron_left</span>
                    </span>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={filterHref({ page: String(p) })}
                      className={`w-10 h-10 flex items-center justify-center rounded-ds type-data-tabular transition-colors ${
                        p === page
                          ? "bg-ds-secondary text-ds-on-secondary font-bold"
                          : "border border-ds-outline-variant text-ds-on-surface hover:bg-ds-surface-container-low"
                      }`}
                    >
                      {p}
                    </Link>
                  ))}

                  {page < totalPages ? (
                    <Link
                      href={filterHref({ page: String(page + 1) })}
                      className="w-10 h-10 flex items-center justify-center rounded-ds border border-ds-outline-variant text-ds-on-surface hover:bg-ds-surface-container-low transition-colors"
                    >
                      <span className="material-symbols-outlined text-title-sm">chevron_right</span>
                    </Link>
                  ) : (
                    <span className="w-10 h-10 flex items-center justify-center rounded-ds border border-ds-outline-variant text-ds-outline cursor-not-allowed">
                      <span className="material-symbols-outlined text-title-sm">chevron_right</span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Sub-components ──────────────────────────────────────────────

type ExperienceWithRelations = Awaited<
  ReturnType<typeof getPublishedExperiences>
>["experiences"][number];

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

function ExperienceCard({ exp }: { exp: ExperienceWithRelations }) {
  const durationHours = Math.round(exp.durationMinutes / 60);
  const durationLabel =
    exp.durationMinutes >= 480
      ? "Full Day"
      : exp.durationMinutes >= 60
      ? `${durationHours} Hour${durationHours !== 1 ? "s" : ""}`
      : `${exp.durationMinutes} min`;

  const difficulty = DIFFICULTY_LABELS[exp.difficulty] ?? exp.difficulty;
  const gradientClass = GRADIENTS[exp.category.name.length % GRADIENTS.length];

  return (
    <div className="bg-white rounded-ds-md border border-ds-outline-variant overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      {/* Image / placeholder — real images Phase 2 */}
      <div className={`relative h-48 ${gradientClass} flex items-center justify-center`}>
        <span className="material-symbols-outlined text-[64px] text-white/60 group-hover:scale-110 transition-transform duration-500" style={{ fontVariationSettings: "'FILL' 1" }}>
          travel_explore
        </span>

        {/* Rating badge top-right (placeholder until reviews exist) */}
        <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur rounded-full flex items-center gap-1 shadow-sm">
          <span
            className="material-symbols-outlined text-amber-500 text-title-sm"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
          <span className="type-data-tabular text-ds-on-surface">—</span>
        </div>

        {/* Category label bottom-left */}
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
            <span className="type-body-sm">Up to {exp.maxParticipants}</span>
          </div>
          <div className="flex items-center gap-1.5 text-ds-on-surface-variant">
            <span className="material-symbols-outlined text-title-sm">location_on</span>
            <span className="type-body-sm truncate max-w-20">{exp.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-ds-outline-variant pt-4">
          <div>
            <span className="type-label-caps text-ds-on-surface-variant block">FROM</span>
            <span className="type-headline-md text-ds-on-surface">
              {formatCentsEUR(exp.basePriceCents)}
              <span className="type-body-sm font-normal text-ds-on-surface-variant">/pp</span>
            </span>
          </div>
          <Link
            href={`/experiences/${exp.id}`}
            className="px-6 py-2.5 border-2 border-ds-primary text-ds-primary font-bold rounded-ds type-body-sm hover:bg-ds-primary hover:text-ds-on-primary transition-all"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
