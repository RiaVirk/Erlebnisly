import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatCentsEUR } from "@/lib/pricing/utils";
import { getExperienceSlotsWithAvailability } from "@/lib/queries/availability";
import { ReviewList } from "@/components/customer/ReviewList";
import { SimilarExperiences } from "@/components/customer/SimilarExperiences";
import BookingWidget from "./_components/BookingWidget";
import { env } from "@/lib/env";
import Link from "next/link";

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "Beginner",
  MEDIUM: "Intermediate",
  HARD: "Advanced",
};

const DIFFICULTY_BG: Record<string, string> = {
  EASY:   "bg-emerald-50 text-emerald-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  HARD:   "bg-red-50 text-red-700",
};

const CAT_ICON: Record<string, string> = {
  Adventure: "hiking", "Food & Drink": "restaurant", "Arts & Culture": "palette",
  Wellness: "self_improvement", Professional: "work", Outdoor: "landscape",
  Cycling: "directions_bike", Diving: "scuba_diving",
};

export default async function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [experience, addOns, reviewStats] = await Promise.all([
    prisma.experience.findUnique({
      where: { id, isPublished: true, deletedAt: null },
      include: {
        category: true,
        host: { select: { name: true, imageUrl: true } },
      },
    }),
    prisma.addOn.findMany({ where: { experienceId: id }, orderBy: { priceCents: "asc" } }),
    prisma.review.aggregate({
      where: { experienceId: id },
      _avg: { rating: true },
      _count: { rating: true },
    }),
  ]);

  if (!experience) notFound();

  const slots = await getExperienceSlotsWithAvailability(id);

  const avgRating   = reviewStats._avg.rating;
  const reviewCount = reviewStats._count.rating;
  const heroImage   = experience.images[0] ?? null;
  const galleryImgs = experience.images.slice(1, 4);
  const catIcon     = CAT_ICON[experience.category.name] ?? "travel_explore";

  return (
    <div className="min-h-screen bg-ds-background pb-24">

      {/* ── Sticky mini-header ───────────────────────────────── */}
      <header
        className="sticky top-0 z-40 h-14 bg-white/95 backdrop-blur-[16px] flex items-center px-4 lg:px-8 gap-3"
        style={{ boxShadow: "0 2px 20px rgba(255,77,0,0.06), 0 1px 8px rgba(0,0,0,0.05)" }}
      >
        <div className="absolute inset-x-0 bottom-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg,transparent 0%,rgba(255,77,0,0.15) 30%,rgba(255,77,0,0.15) 70%,transparent 100%)" }} />
        <Link href="/experiences" className="w-8 h-8 rounded-xl flex items-center justify-center text-ds-on-surface-variant hover:bg-ds-surface-container-low transition-colors">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-ds-on-surface-variant">{experience.category.name}</p>
          <h1 className="text-[14px] font-bold text-ds-on-surface leading-tight truncate">{experience.title}</h1>
        </div>
        <Link href="#booking"
          className="px-4 py-1.5 bg-ds-primary text-white text-[13px] font-bold rounded-xl hover:brightness-105 transition-all"
          style={{ boxShadow: "0 3px 12px rgba(255,77,0,0.35)" }}>
          Book Now
        </Link>
      </header>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative h-[420px] lg:h-[480px] w-full overflow-hidden">
        {heroImage ? (
          <img src={heroImage} alt={experience.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(255,77,0,0.15) 0%, rgba(0,104,111,0.12) 100%)" }}>
            <span className="material-symbols-outlined text-ds-primary/30" style={{ fontSize: 120, fontVariationSettings: "'FILL' 1" }}>{catIcon}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 px-6 lg:px-10 pb-8 flex flex-col md:flex-row items-end justify-between gap-5">
          <div className="flex items-end gap-5">
            {/* Icon badge */}
            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-white p-2 shadow-2xl shrink-0 border-4 border-white overflow-hidden">
              <div className="w-full h-full rounded-xl flex items-center justify-center"
                style={{ background: "rgba(255,77,0,0.1)" }}>
                <span className="material-symbols-outlined text-ds-primary" style={{ fontSize: 40, fontVariationSettings: "'FILL' 1" }}>{catIcon}</span>
              </div>
            </div>
            <div className="mb-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-sm text-white border border-white/25">
                  {experience.category.name}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${DIFFICULTY_BG[experience.difficulty] ?? "bg-white/20 text-white"}`}>
                  {DIFFICULTY_LABELS[experience.difficulty] ?? experience.difficulty}
                </span>
              </div>
              <h2 className="text-[26px] lg:text-[34px] font-extrabold text-white leading-tight tracking-tight drop-shadow-sm">
                {experience.title}
              </h2>
              <p className="text-slate-200 mt-1 flex items-center gap-1 text-[14px]">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>location_on</span>
                {experience.location}
              </p>
            </div>
          </div>

          <div className="flex gap-2.5 mb-1 shrink-0">
            <Link href="#booking"
              className="px-5 py-2.5 text-white font-bold text-[14px] rounded-xl flex items-center gap-2 hover:brightness-105 transition-all"
              style={{ background: "#FF4D00", boxShadow: "0 4px 20px rgba(255,77,0,0.45)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
              Book Now
            </Link>
            <button className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30 transition-all flex items-center justify-center">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>share</span>
            </button>
            <button className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30 transition-all flex items-center justify-center">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>favorite_border</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────────────── */}
      <section className="bg-white px-6 lg:px-10 py-5 flex flex-wrap gap-6 lg:gap-14"
        style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-amber-500" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>star</span>
          </div>
          <div>
            <p className="text-[14px] font-bold text-ds-on-surface">{avgRating ? `${avgRating.toFixed(1)} Stars` : "New"}</p>
            <p className="text-[12px] text-ds-on-surface-variant">{reviewCount} review{reviewCount !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>schedule</span>
          </div>
          <div>
            <p className="text-[14px] font-bold text-ds-on-surface">
              {experience.durationMinutes >= 60
                ? `${Math.round(experience.durationMinutes / 60 * 10) / 10}h`
                : `${experience.durationMinutes} min`}
            </p>
            <p className="text-[12px] text-ds-on-surface-variant">Duration</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-violet-600" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>group</span>
          </div>
          <div>
            <p className="text-[14px] font-bold text-ds-on-surface">{experience.minParticipants}–{experience.maxParticipants}</p>
            <p className="text-[12px] text-ds-on-surface-variant">Group size</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,77,0,0.1)" }}>
            <span className="material-symbols-outlined text-ds-primary" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>payments</span>
          </div>
          <div>
            <p className="text-[14px] font-bold text-ds-primary">{formatCentsEUR(experience.basePriceCents)}</p>
            <p className="text-[12px] text-ds-on-surface-variant">per person</p>
          </div>
        </div>
      </section>

      {/* ── Content grid ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left column */}
        <div className="lg:col-span-2 space-y-10">

          {/* About */}
          <article>
            <h2 className="text-[22px] font-bold text-ds-on-surface mb-4">About this experience</h2>
            <p className="text-[15px] text-ds-on-surface-variant leading-relaxed">{experience.description}</p>
          </article>

          {/* Photo gallery */}
          {galleryImgs.length > 0 && (
            <section>
              <h2 className="text-[22px] font-bold text-ds-on-surface mb-4">Photos</h2>
              <div className="grid grid-cols-3 gap-3">
                {galleryImgs.map((img, i) => (
                  <div key={i} className="aspect-video rounded-2xl overflow-hidden bg-ds-surface-container">
                    <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* What's included */}
          <section className="p-6 rounded-2xl bg-white border border-ds-outline-variant"
            style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
            <div className="flex items-center gap-3 mb-5">
              <span className="material-symbols-outlined text-ds-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <h2 className="text-[18px] font-bold text-ds-on-surface">What&apos;s included</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { icon: "gpp_good",       text: "Professional guide & safety briefing" },
                { icon: "backpack",       text: "All equipment provided" },
                { icon: "local_drink",    text: "Refreshments & snacks" },
                { icon: "photo_camera",   text: "Souvenir photos" },
                { icon: "help_outline",   text: "First aid on site" },
                { icon: "directions_car", text: "Transport from meeting point" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,77,0,0.08)" }}>
                    <span className="material-symbols-outlined text-ds-primary" style={{ fontSize: 16 }}>{icon}</span>
                  </div>
                  <span className="text-[13px] text-ds-on-surface">{text}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Add-ons */}
          {addOns.length > 0 && (
            <section>
              <h2 className="text-[22px] font-bold text-ds-on-surface mb-4">Optional Add-ons</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {addOns.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-ds-outline-variant"
                    style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                    <div>
                      <p className="text-[14px] font-semibold text-ds-on-surface">{a.name}</p>
                      {a.description && <p className="text-[12px] text-ds-on-surface-variant mt-0.5">{a.description}</p>}
                    </div>
                    <span className="text-[14px] font-bold text-ds-primary ml-4 shrink-0">+{formatCentsEUR(a.priceCents)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Location */}
          <section>
            <h2 className="text-[22px] font-bold text-ds-on-surface mb-4">Location</h2>
            <div className="bg-white rounded-2xl overflow-hidden border border-ds-outline-variant"
              style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
              <div className="h-56 relative">
                <iframe
                  title="Experience location"
                  width="100%" height="100%"
                  className="absolute inset-0 border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={
                    experience.latitude && experience.longitude
                      ? `https://www.google.com/maps/embed/v1/place?key=${env.GOOGLE_MAPS_API_KEY}&q=${experience.latitude},${experience.longitude}&zoom=15`
                      : `https://www.google.com/maps/embed/v1/search?key=${env.GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(experience.location + ", Germany")}`
                  }
                />
              </div>
              <div className="p-5 flex items-center justify-between gap-4">
                <p className="flex items-center gap-2 text-[14px] text-ds-on-surface-variant">
                  <span className="material-symbols-outlined text-ds-primary" style={{ fontSize: 18 }}>place</span>
                  {experience.location}
                </p>
                <a
                  href={
                    experience.latitude && experience.longitude
                      ? `https://www.google.com/maps?q=${experience.latitude},${experience.longitude}`
                      : `https://www.google.com/maps/search/${encodeURIComponent(experience.location)}`
                  }
                  target="_blank" rel="noopener noreferrer"
                  className="shrink-0 px-4 py-2 rounded-xl text-[13px] font-semibold text-ds-primary border border-ds-primary hover:bg-ds-primary hover:text-white transition-all"
                >
                  Open in Maps
                </a>
              </div>
            </div>
          </section>

          {/* Host */}
          {experience.host.name && (
            <section>
              <h2 className="text-[22px] font-bold text-ds-on-surface mb-4">Your Host</h2>
              <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-ds-outline-variant"
                style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
                <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center"
                  style={{ background: "rgba(255,77,0,0.1)" }}>
                  {experience.host.imageUrl ? (
                    <img src={experience.host.imageUrl} alt={experience.host.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-ds-primary" style={{ fontSize: 28 }}>person</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-ds-on-surface-variant">Hosted by</p>
                  <p className="text-[16px] font-bold text-ds-on-surface">{experience.host.name}</p>
                  <p className="text-[13px] text-ds-on-surface-variant">Verified host · {experience.category.name} expert</p>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,77,0,0.1)" }}>
                  <span className="material-symbols-outlined text-ds-primary" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
              </div>
            </section>
          )}

          {/* Reviews */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[22px] font-bold text-ds-on-surface">Reviews</h2>
              {avgRating && (
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-amber-500" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="text-[16px] font-bold text-ds-on-surface">{avgRating.toFixed(1)}</span>
                  <span className="text-[13px] text-ds-on-surface-variant">({reviewCount})</span>
                </div>
              )}
            </div>
            <div className="bg-white rounded-2xl border border-ds-outline-variant p-6"
              style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
              <ReviewList experienceId={experience.id} />
            </div>
          </section>
        </div>

        {/* Right column: booking */}
        <div className="lg:col-span-1" id="booking">
          <div className="sticky top-20">
            <div className="bg-white rounded-2xl border border-ds-outline-variant p-6"
              style={{ boxShadow: "0 8px 40px rgba(255,77,0,0.1), 0 4px 20px rgba(0,0,0,0.07)" }}>
              <div className="flex items-baseline gap-1.5 pb-4 mb-4"
                style={{ borderBottom: "1px solid rgba(255,77,0,0.1)" }}>
                <span className="text-[28px] font-extrabold text-ds-on-surface tracking-tight">
                  {formatCentsEUR(experience.basePriceCents)}
                </span>
                <span className="text-[14px] text-ds-on-surface-variant">/ person</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-5">
                {[
                  { icon: "schedule", label: experience.durationMinutes >= 60 ? `${Math.round(experience.durationMinutes / 60 * 10) / 10}h` : `${experience.durationMinutes}m` },
                  { icon: "group",    label: `${experience.minParticipants}–${experience.maxParticipants} pax` },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-ds-surface-container-low">
                    <span className="material-symbols-outlined text-ds-on-surface-variant" style={{ fontSize: 16 }}>{icon}</span>
                    <span className="text-[13px] font-medium text-ds-on-surface">{label}</span>
                  </div>
                ))}
              </div>

              <BookingWidget
                experience={{
                  id: experience.id,
                  title: experience.title,
                  basePriceCents: experience.basePriceCents,
                  maxParticipants: experience.maxParticipants,
                  minParticipants: experience.minParticipants,
                  timezone: experience.timezone,
                  pricingRules: experience.pricingRules,
                }}
                slots={slots}
                addOns={addOns}
              />
            </div>

            {/* Trust badges */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                { icon: "lock",          text: "Secure booking" },
                { icon: "undo",          text: "Free cancellation" },
                { icon: "support_agent", text: "24/7 support" },
              ].map(({ icon, text }) => (
                <div key={text} className="p-3 bg-white rounded-xl border border-ds-outline-variant">
                  <span className="material-symbols-outlined text-ds-primary block mx-auto mb-1" style={{ fontSize: 18 }}>{icon}</span>
                  <p className="text-[10px] font-semibold text-ds-on-surface-variant leading-tight">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Similar experiences */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 mt-12">
        <SimilarExperiences experienceId={experience.id} />
      </div>
    </div>
  );
}
