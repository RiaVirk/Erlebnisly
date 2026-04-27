import { prisma } from "@/lib/prisma";
import { getPublishedExperiences } from "@/lib/queries/experiences";
import { formatCentsEUR } from "@/lib/pricing/utils";
import Link from "next/link";
import type { Category } from "@prisma/client";

export default async function ExperiencesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; difficulty?: string; page?: string }>;
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
    ? categories.find((c) => c.slug === activeCategory)?.name ?? "Experiences"
    : "All Experiences";

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
      {/* Top bar */}
      <header className="sticky top-0 right-0 h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex justify-between items-center px-8 z-40">
        <form method="GET" className="flex items-center bg-slate-100 rounded-full px-4 py-1.5 w-96">
          <span className="material-symbols-outlined text-slate-400 mr-2 text-[20px]">search</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search experiences..."
            className="bg-transparent border-none focus:ring-0 text-sm font-[Inter] w-full outline-none"
          />
          {/* preserve other filters */}
          {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
          {activeDifficulty && <input type="hidden" name="difficulty" value={activeDifficulty} />}
        </form>
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <span className="material-symbols-outlined text-slate-500">account_circle</span>
          <span className="text-sm font-semibold text-slate-700">My Account</span>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto p-8">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <nav className="flex text-[11px] font-bold tracking-[0.05em] uppercase text-slate-500 mb-2 gap-2">
              <span>EXPERIENCES</span>
              <span>/</span>
              <span>SEARCH RESULTS</span>
            </nav>
            <h2 className="text-[36px] font-bold leading-[44px] tracking-[-0.02em] text-slate-900">
              {headingText}
            </h2>
            <p className="text-[16px] text-slate-500 mt-1">
              {total} {total === 1 ? "experience" : "experiences"} found
            </p>
          </div>
          {/* View toggle — Grid is only mode in phase 1 */}
          <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#006c49] text-white rounded text-sm font-medium">
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
              Grid
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-slate-500 text-sm font-medium rounded">
              <span className="material-symbols-outlined text-[18px]">map</span>
              Map View
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filter sidebar */}
          <aside className="w-72 flex-shrink-0 space-y-6">
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[18px] font-semibold text-slate-900">Filters</h3>
                <Link
                  href="/experiences"
                  className="text-[#006c49] text-[11px] font-bold uppercase tracking-[0.05em] hover:underline"
                >
                  RESET
                </Link>
              </div>

              {/* Category */}
              <div className="mb-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500 mb-3">
                  CATEGORY
                </p>
                <div className="space-y-1">
                  <CategoryRow
                    label="All"
                    href={filterHref({ category: "" })}
                    active={!activeCategory}
                  />
                  {categories.map((cat) => (
                    <CategoryRow
                      key={cat.id}
                      label={`${cat.icon} ${cat.name}`}
                      href={filterHref({ category: cat.slug })}
                      active={activeCategory === cat.slug}
                    />
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div className="mb-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500 mb-3">
                  DIFFICULTY
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {(["EASY", "MEDIUM", "HARD"] as const).map((d) => (
                    <Link
                      key={d}
                      href={filterHref({ difficulty: activeDifficulty === d ? "" : d })}
                      className={`text-left px-4 py-2 rounded border text-sm transition-colors ${
                        activeDifficulty === d
                          ? "border-2 border-[#006c49] bg-[#006c49]/5 text-[#006c49] font-semibold"
                          : "border-slate-200 text-slate-700 hover:border-[#006c49]"
                      }`}
                    >
                      {d.charAt(0) + d.slice(1).toLowerCase()}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Promo card */}
            <div className="bg-[#131b2e] p-6 rounded-xl text-white">
              <span className="material-symbols-outlined text-[#4edea3] text-4xl mb-4 block">
                auto_awesome
              </span>
              <h4 className="text-[18px] font-semibold mb-2">Group booking?</h4>
              <p className="text-sm text-slate-400 mb-4">
                Contact us for custom corporate or large-group experiences.
              </p>
              <button className="w-full py-2 bg-white text-slate-900 font-bold rounded hover:bg-slate-100 transition-colors text-sm">
                Talk to Us
              </button>
            </div>
          </aside>

          {/* Card grid */}
          <div className="flex-1 min-w-0">
            {experiences.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center text-slate-400">
                <span className="material-symbols-outlined text-5xl mb-4">sentiment_dissatisfied</span>
                <p className="text-lg font-semibold text-slate-700">No experiences found</p>
                <p className="text-sm mt-1">Try adjusting your filters or search term.</p>
                <Link href="/experiences" className="mt-6 px-5 py-2 bg-[#006c49] text-white rounded text-sm font-semibold hover:opacity-90 transition-opacity">
                  Clear filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                {experiences.map((exp) => (
                  <ExperienceCard key={exp.id} exp={exp} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-8">
                <p className="text-sm text-slate-500">
                  Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total} results
                </p>
                <div className="flex items-center gap-2">
                  {page > 1 ? (
                    <Link
                      href={filterHref({ page: String(page - 1) })}
                      className="w-10 h-10 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </Link>
                  ) : (
                    <span className="w-10 h-10 flex items-center justify-center rounded border border-slate-200 text-slate-300 cursor-not-allowed">
                      <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </span>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={filterHref({ page: String(p) })}
                      className={`w-10 h-10 flex items-center justify-center rounded text-sm font-bold transition-colors ${
                        p === page
                          ? "bg-[#006c49] text-white"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </Link>
                  ))}

                  {page < totalPages ? (
                    <Link
                      href={filterHref({ page: String(page + 1) })}
                      className="w-10 h-10 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </Link>
                  ) : (
                    <span className="w-10 h-10 flex items-center justify-center rounded border border-slate-200 text-slate-300 cursor-not-allowed">
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
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

function CategoryRow({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-2 py-2 rounded cursor-pointer text-sm transition-colors ${
        active
          ? "bg-[#006c49]/10 text-[#006c49] font-semibold"
          : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      {label}
    </Link>
  );
}

type ExperienceWithRelations = Awaited<
  ReturnType<typeof getPublishedExperiences>
>["experiences"][number];

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "Beginner",
  MEDIUM: "Intermediate",
  HARD: "Advanced",
};

function ExperienceCard({ exp }: { exp: ExperienceWithRelations }) {
  const durationHours = Math.round(exp.durationMinutes / 60);
  const durationLabel =
    exp.durationMinutes >= 480
      ? "Full Day"
      : exp.durationMinutes >= 60
      ? `${durationHours} Hour${durationHours !== 1 ? "s" : ""}`
      : `${exp.durationMinutes} min`;

  const difficulty = DIFFICULTY_LABELS[exp.difficulty] ?? exp.difficulty;

  // Gradient based on category for phase 1 (no real images yet)
  const gradients: Record<string, string> = {
    "bg-gradient-to-br from-emerald-100 to-teal-200": "0",
    "bg-gradient-to-br from-blue-100 to-indigo-200": "1",
    "bg-gradient-to-br from-amber-100 to-orange-200": "2",
    "bg-gradient-to-br from-pink-100 to-rose-200": "3",
    "bg-gradient-to-br from-violet-100 to-purple-200": "4",
  };
  const gradientKeys = Object.keys(gradients);
  const gradientClass = gradientKeys[exp.category.name.length % gradientKeys.length];

  return (
    <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      {/* Image / placeholder */}
      <div className={`relative h-48 ${gradientClass} flex items-center justify-center`}>
        <span className="text-6xl group-hover:scale-110 transition-transform duration-500">
          {exp.category.icon}
        </span>

        {/* Difficulty badge */}
        <div className="absolute top-4 left-4">
          <span className="px-2 py-1 bg-white/90 backdrop-blur text-[10px] font-bold uppercase rounded text-slate-700 shadow-sm">
            {difficulty}
          </span>
        </div>

        {/* Category badge */}
        <div className="absolute bottom-4 left-4">
          <span className="px-2 py-1 bg-[#006c49] text-white text-[10px] font-bold uppercase rounded">
            {exp.category.name}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-[18px] font-semibold text-slate-900 leading-[28px] mb-2 line-clamp-2">
          {exp.title}
        </h3>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="material-symbols-outlined text-[18px]">schedule</span>
            <span className="text-sm">{durationLabel}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="material-symbols-outlined text-[18px]">group</span>
            <span className="text-sm">Up to {exp.maxParticipants}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="material-symbols-outlined text-[18px]">location_on</span>
            <span className="text-sm truncate max-w-[80px]">{exp.location}</span>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500 block">
              FROM
            </span>
            <span className="text-[24px] font-semibold leading-[32px] text-slate-900">
              {formatCentsEUR(exp.basePriceCents)}
              <span className="text-sm font-normal text-slate-500">/pp</span>
            </span>
          </div>
          <Link
            href={`/experiences/${exp.id}`}
            className="px-6 py-2.5 border-2 border-slate-900 text-slate-900 font-bold rounded text-sm hover:bg-slate-900 hover:text-white transition-all"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
