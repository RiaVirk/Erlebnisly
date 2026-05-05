"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AiChatWidget } from "@/components/shared/AiChatWidget";

/* ── Types ──────────────────────────────────────────────────────── */
interface NextBooking {
  id: string; title: string; location: string; category: string;
  image: string | null; lat: number | null; lon: number | null;
  participants: number; totalPriceCents: number;
  daysLeft: number; dateLabel: string; timeLabel: string;
}
interface RecentBooking {
  id: string; title: string; category: string; dateLabel: string;
  status: string; participants: number; totalPriceCents: number;
  points: number | null;
}
interface WishlistItem { id: string; title: string; category: string; image: string | null; priceCents: number; }
interface Recommendation {
  id: string; title: string; category: string; priceCents: number;
  durationMinutes: number; image: string | null; difficulty: string; rating: string | null;
}
interface Props {
  userName: string;
  completedCount: number; upcomingCount: number;
  totalSpentCents: number; favouriteCategory: string; favouriteCategoryCount: number;
  loyaltyPoints: number;
  nextBooking: NextBooking | null;
  recentBookings: RecentBooking[];
  wishlist: WishlistItem[];
  recommendations: Recommendation[];
  mapsApiKey: string;
}

/* ── Helpers ────────────────────────────────────────────────────── */
function eur(cents: number) { return `€${(cents / 100).toFixed(2)}`; }

const STATUS_CHIP: Record<string, { cls: string; label: string }> = {
  CONFIRMED:             { cls: "bg-[#d1fae5] text-[#065f46]",   label: "Confirmed" },
  COMPLETED:             { cls: "bg-[#e2e8f0] text-[#475569]",   label: "Completed" },
  RESERVED_HOLD:         { cls: "bg-[#fef3c7] text-[#92400e]",   label: "Hold" },
  CANCELLED_BY_CUSTOMER: { cls: "bg-[#ffdad6] text-[#93000a]",   label: "Cancelled" },
  CANCELLED_BY_HOST:     { cls: "bg-[#ffdad6] text-[#93000a]",   label: "Cancelled" },
  CANCELLED_BY_ADMIN:    { cls: "bg-[#ffdad6] text-[#93000a]",   label: "Cancelled" },
  REFUND_PENDING:        { cls: "bg-[#ffedd5] text-[#9a3412]",   label: "Refund pending" },
  REFUNDED:              { cls: "bg-[#e2e8f0] text-[#475569]",   label: "Refunded" },
  NEEDS_REVIEW:          { cls: "bg-[#ffedd5] text-[#9a3412]",   label: "Review" },
  EXPIRED_HOLD:          { cls: "bg-[#e2e8f0] text-[#475569]",   label: "Expired" },
};

const DIFF_LABEL: Record<string, string> = { EASY: "Easy", MEDIUM: "Intermediate", HARD: "Advanced" };

const CAT_ICON: Record<string, string> = {
  Adventure: "hiking", "Food & Drink": "restaurant", "Arts & Culture": "palette",
  Wellness: "self_improvement", Professional: "work", Outdoor: "landscape",
  Cycling: "directions_bike", Diving: "scuba_diving", Wellness2: "spa",
};
function catIcon(cat: string) { return CAT_ICON[cat] ?? "travel_explore"; }

// Unsplash fallback images by category (used when no DB image exists)
const CAT_IMG_HERO: Record<string, string> = {
  "Water Sports":   "https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=800&h=400&fit=crop",
  "Food & Drink":   "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=400&fit=crop",
  "Adventure":      "https://images.unsplash.com/photo-1601024445121-e5b82f020549?w=800&h=400&fit=crop",
  "Outdoor":        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=400&fit=crop",
  "Arts & Culture": "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=400&fit=crop",
  "Wellness":       "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=400&fit=crop",
  "Professional":   "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=400&fit=crop",
  "Crafts":         "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=400&fit=crop",
  "Music":          "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=400&fit=crop",
};
const CAT_IMG_REC: Record<string, string> = {
  "Water Sports":   "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=260&fit=crop",
  "Food & Drink":   "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400&h=260&fit=crop",
  "Adventure":      "https://images.unsplash.com/photo-1601024445121-e5b82f020549?w=400&h=260&fit=crop",
  "Outdoor":        "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400&h=260&fit=crop",
  "Arts & Culture": "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=260&fit=crop",
  "Wellness":       "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=260&fit=crop",
  "Professional":   "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=260&fit=crop",
  "Cycling":        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=260&fit=crop",
  "Diving":         "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=400&h=260&fit=crop",
};
const CAT_IMG_THUMB: Record<string, string> = {
  "Water Sports":   "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=88&h=88&fit=crop",
  "Food & Drink":   "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=88&h=88&fit=crop",
  "Adventure":      "https://images.unsplash.com/photo-1601024445121-e5b82f020549?w=88&h=88&fit=crop",
  "Outdoor":        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=88&h=88&fit=crop",
  "Arts & Culture": "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=88&h=88&fit=crop",
  "Wellness":       "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=88&h=88&fit=crop",
  "Professional":   "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=88&h=88&fit=crop",
  "Cycling":        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=88&h=88&fit=crop",
};
function heroImg(img: string | null, cat: string) { return img ?? CAT_IMG_HERO[cat] ?? CAT_IMG_HERO["Outdoor"]!; }
function recImg(img: string | null, cat: string)  { return img ?? CAT_IMG_REC[cat]  ?? CAT_IMG_REC["Outdoor"]!; }
function thumbImg(img: string | null, cat: string){ return img ?? CAT_IMG_THUMB[cat] ?? CAT_IMG_THUMB["Outdoor"]!; }

const MOCK_NOTIFS = [
  { id: 1, text: "Your next booking is confirmed and coming up soon!", time: "2 h ago",  read: false },
  { id: 2, text: "You have an upcoming experience in less than 14 days.", time: "1 d ago", read: false },
  { id: 3, text: "How was your last experience? Leave a review.", time: "3 d ago", read: true },
  { id: 4, text: "New experiences added in your favourite category.", time: "5 d ago", read: true },
];

/* ── Main component ─────────────────────────────────────────────── */
export default function DashboardClient({
  userName, completedCount, upcomingCount, totalSpentCents,
  favouriteCategory, favouriteCategoryCount, loyaltyPoints,
  nextBooking, recentBookings, wishlist, recommendations, mapsApiKey,
}: Props) {
  const router = useRouter();
  const [dark, setDark]             = useState(false);
  const [notifOpen, setNotifOpen]   = useState(false);
  const [notifs, setNotifs]         = useState(MOCK_NOTIFS);
  const [tab, setTab]               = useState<"all" | "upcoming" | "completed">("all");
  const [wishlistItems, setWishlistItems] = useState(wishlist);
  const [searchQuery, setSearchQuery] = useState("");
  const notifRef = useRef<HTMLDivElement>(null);

  // Restore persisted dark preference after hydration (must not run on server)
  useEffect(() => {
    if (localStorage.getItem("erlebnisly-dark") === "true") setDark(true);
  }, []);

  // Sync body class + persist whenever dark changes
  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    localStorage.setItem("erlebnisly-dark", String(dark));
    return () => { document.body.classList.remove("dark"); };
  }, [dark]);

  // Close notification panel on outside click
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  const unread = notifs.filter((n) => !n.read).length;

  const filteredBookings = tab === "upcoming"
    ? recentBookings.filter((b) => b.status === "CONFIRMED" || b.status === "RESERVED_HOLD")
    : tab === "completed"
    ? recentBookings.filter((b) => b.status === "COMPLETED")
    : recentBookings;

  const loyaltyToNext = 1500 - (loyaltyPoints % 1500);

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Topbar ─────────────────────────────────────────────── */}
      <header className="dash-topbar sticky top-0 z-40 h-[60px] bg-white/90 backdrop-blur-[12px] border-b border-ds-outline-variant flex items-center justify-between px-4 lg:px-8 flex-shrink-0 gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Hamburger — mobile only */}
          <button
            className="lg:hidden flex-shrink-0 p-1.5 rounded-ds text-ds-on-surface-variant hover:bg-ds-surface-container-low"
            onClick={() => window.dispatchEvent(new CustomEvent("sidebar:open"))}
          >
            <span className="material-symbols-outlined" style={{fontSize:22}}>menu</span>
          </button>

          <div className="flex-shrink-0 hidden sm:block">
            <p className="text-[12px] text-ds-on-surface-variant" suppressHydrationWarning>
              {(() => { const h = new Date().getHours(); return h < 12 ? "Good morning," : h < 17 ? "Good afternoon," : "Good evening,"; })()}
            </p>
            <p className="text-[15px] font-bold text-ds-on-surface leading-tight">{userName}</p>
          </div>
          {/* Search bar — hidden on small mobile */}
          <div className="dash-search relative flex-1 max-w-[340px] hidden sm:block">
            <span className="material-symbols-outlined absolute left-[11px] top-1/2 -translate-y-1/2 text-ds-outline pointer-events-none" style={{fontSize:16}}>search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  router.push(`/experiences?q=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              placeholder="Search activities..."
              className="w-full bg-ds-surface-container-low border border-ds-outline-variant rounded-full py-[7px] pl-[36px] pr-[14px] text-[13px] text-ds-on-surface placeholder:text-ds-outline outline-none focus:border-ds-primary focus:shadow-[0_0_0_3px_rgba(255,77,0,0.12)] focus:bg-white transition-all font-[inherit]"
            />
          </div>
        </div>

        <div className="flex items-center gap-[8px] flex-shrink-0">
          {/* Dark mode toggle — suppressHydrationWarning because localStorage state
              intentionally differs between server (always false) and client. */}
          <div
            className="dash-theme-toggle hidden sm:block"
            onClick={() => setDark((d) => !d)}
            title={dark ? "Light mode" : "Dark mode"}
            suppressHydrationWarning
          >
            <div className="dash-theme-dot" suppressHydrationWarning>
              <span
                className="material-symbols-outlined"
                suppressHydrationWarning
                style={dark
                  ? {fontSize:15, color:"#818cf8"}
                  : {fontSize:15, color:"#f59e0b", fontVariationSettings:"'FILL' 1"}
                }
              >
                {dark ? "dark_mode" : "light_mode"}
              </span>
            </div>
          </div>

          {/* Bell */}
          <div
            className="dash-icon-btn w-9 h-9 rounded-ds-lg border border-ds-outline-variant bg-white flex items-center justify-center cursor-pointer text-ds-on-surface-variant relative hover:bg-ds-surface-container-low hover:border-ds-outline transition-colors"
            onClick={() => setNotifOpen((o) => !o)}
          >
            <span className="material-symbols-outlined" style={{fontSize:20}}>notifications</span>
            {unread > 0 && <span className="absolute top-[6px] right-[6px] w-[7px] h-[7px] rounded-full bg-ds-secondary border-[1.5px] border-white" />}
          </div>

          {/* Book CTA */}
          <Link
            href="/experiences"
            className="flex items-center gap-1.5 bg-ds-primary text-ds-on-primary text-[13px] font-semibold px-3 lg:px-4 py-2 rounded-ds-md border-none cursor-pointer hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined" style={{fontSize:16}}>add_circle</span>
            <span className="hidden sm:inline">Book Experience</span>
          </Link>
        </div>
      </header>

      {/* ── Notification panel ──────────────────────────────────── */}
      {notifOpen && (
        <div ref={notifRef} className="dash-notif-panel fixed right-6 top-[68px] w-[320px] bg-white rounded-ds-xl border border-ds-outline-variant shadow-[0_8px_32px_rgba(15,23,42,0.14)] z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-[14px] pb-[10px] border-b border-ds-outline-variant">
            <span className="text-[14px] font-bold text-ds-on-surface">Notifications</span>
            <span className="text-[12px] font-semibold text-ds-secondary cursor-pointer" onClick={() => setNotifs((n) => n.map((x) => ({ ...x, read: true })))}>Mark all read</span>
          </div>
          {notifs.map((n) => (
            <div
              key={n.id}
              className={`dash-notif-item flex items-start gap-[10px] px-4 py-3 border-b border-ds-outline-variant last:border-b-0 cursor-pointer hover:bg-ds-surface-container-low transition-colors ${!n.read ? "dash-notif-unread bg-[#fff4f0]" : ""}`}
              onClick={() => setNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
            >
              <span className={`w-[7px] h-[7px] rounded-full flex-shrink-0 mt-[5px] ${n.read ? "opacity-0" : "bg-ds-secondary"}`} />
              <div>
                <p className="text-[13px] text-ds-on-surface leading-snug">{n.text}</p>
                <p className="text-[11px] text-ds-on-surface-variant mt-[2px]">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Page content ───────────────────────────────────────── */}
      <div className="flex-1 px-4 py-5 lg:px-8 lg:py-7 flex flex-col gap-5 lg:gap-7">

        {/* ── 5-card stats row ─────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">

          {/* 1 — Completed trips */}
          <div className="dash-stat-card bg-white rounded-ds-lg border border-ds-outline-variant p-5 shadow-[0_2px_8px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold tracking-[0.07em] uppercase text-ds-on-surface-variant">Completed Trips</span>
              <div className="w-8 h-8 rounded-ds-md flex items-center justify-center bg-[#d1fae5]">
                <span className="material-symbols-outlined text-[#065f46]" style={{fontSize:17,fontVariationSettings:"'FILL' 1"}}>check_circle</span>
              </div>
            </div>
            <div className="text-[32px] font-bold tracking-[-0.03em] text-ds-on-surface leading-none">{completedCount}</div>
            <div className="text-[13px] text-ds-on-surface-variant mt-1">experiences</div>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold mt-2 px-2 py-[2px] rounded-full bg-[#d1fae5] text-[#065f46]">
              <span className="material-symbols-outlined" style={{fontSize:12}}>trending_up</span>Keep it up!
            </div>
          </div>

          {/* 2 — Upcoming */}
          <div className="dash-stat-card bg-white rounded-ds-lg border border-ds-outline-variant p-5 shadow-[0_2px_8px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold tracking-[0.07em] uppercase text-ds-on-surface-variant">Upcoming</span>
              <div className="w-8 h-8 rounded-ds-md flex items-center justify-center bg-[#dbeafe]">
                <span className="material-symbols-outlined text-[#1d4ed8]" style={{fontSize:17,fontVariationSettings:"'FILL' 1"}}>event</span>
              </div>
            </div>
            <div className="text-[32px] font-bold tracking-[-0.03em] text-ds-on-surface leading-none">{upcomingCount}</div>
            <div className="text-[13px] text-ds-on-surface-variant mt-1">confirmed</div>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold mt-2 px-2 py-[2px] rounded-full bg-[#f1f5f9] text-[#475569]">
              <span className="material-symbols-outlined" style={{fontSize:12}}>schedule</span>
              {nextBooking ? `${nextBooking.daysLeft}d away` : "None booked"}
            </div>
          </div>

          {/* 3 — Favourite category */}
          <div className="dash-stat-card bg-white rounded-ds-lg border border-ds-outline-variant p-5 shadow-[0_2px_8px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold tracking-[0.07em] uppercase text-ds-on-surface-variant">Favourite</span>
              <div className="w-8 h-8 rounded-ds-md flex items-center justify-center bg-[#fef3c7]">
                <span className="material-symbols-outlined text-[#b45309]" style={{fontSize:17,fontVariationSettings:"'FILL' 1"}}>star</span>
              </div>
            </div>
            <div className="text-[17px] font-bold tracking-[-0.01em] text-ds-on-surface leading-tight mt-[2px]">{favouriteCategory}</div>
            <div className="text-[13px] text-ds-on-surface-variant mt-1">{favouriteCategoryCount} booking{favouriteCategoryCount !== 1 ? "s" : ""}</div>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold mt-2 px-2 py-[2px] rounded-full bg-[#f1f5f9] text-[#475569]">
              <span className="material-symbols-outlined" style={{fontSize:12}}>auto_awesome</span>Top category
            </div>
          </div>

          {/* 4 — Loyalty points */}
          <div className="dash-stat-card bg-white rounded-ds-lg border border-ds-outline-variant p-5 shadow-[0_2px_8px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold tracking-[0.07em] uppercase text-ds-on-surface-variant">Loyalty Points</span>
              <div className="w-8 h-8 rounded-ds-md flex items-center justify-center bg-[#ede9fe]">
                <span className="material-symbols-outlined text-[#7c3aed]" style={{fontSize:17,fontVariationSettings:"'FILL' 1"}}>workspace_premium</span>
              </div>
            </div>
            <div className="text-[32px] font-bold tracking-[-0.03em] text-ds-secondary leading-none">{loyaltyPoints.toLocaleString("de-DE")}</div>
            <div className="text-[13px] text-ds-on-surface-variant mt-1">{loyaltyToNext} to next tier</div>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold mt-2 px-2 py-[2px] rounded-full bg-[#d1fae5] text-[#065f46]">
              <span className="material-symbols-outlined" style={{fontSize:12}}>trending_up</span>Earning points
            </div>
          </div>

          {/* 5 — Pro member card */}
          <div
            className="rounded-ds-lg p-5 relative overflow-hidden shadow-[0_6px_24px_rgba(255,77,0,0.40)]"
            style={{background:"linear-gradient(135deg,#FF4D00 0%,#b83200 100%)"}}
          >
            {/* Shimmer overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
            {/* Large decorative icon */}
            <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-white/10 pointer-events-none select-none" style={{fontSize:88,fontVariationSettings:"'FILL' 1",lineHeight:1}}>workspace_premium</span>

            <div className="text-[11px] font-bold tracking-[0.08em] uppercase text-white/70 mb-1.5">Status</div>
            <div className="text-[18px] font-extrabold text-white mb-1 tracking-tight drop-shadow-sm">Pro Member</div>
            <div className="text-[12px] text-white/80 leading-snug">Top 5% of active users</div>
            <div className="mt-4">
              <span
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{background:"rgba(255,210,0,0.2)",border:"1px solid rgba(255,210,0,0.55)",color:"#FFD700"}}
              >
                <span className="material-symbols-outlined" style={{fontSize:11,fontVariationSettings:"'FILL' 1"}}>star</span>
                Gold Tier
              </span>
            </div>
          </div>
        </div>

        {/* ── Next Up ──────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[16px] font-bold text-ds-on-surface">Next Up</span>
            <Link href="/bookings" className="text-[13px] font-semibold text-ds-on-surface-variant hover:text-ds-on-surface transition-colors">View all bookings →</Link>
          </div>

          {nextBooking ? (
            <div className="dash-nuc-image-card flex flex-col lg:flex-row rounded-ds-xl border border-ds-outline-variant bg-white overflow-hidden shadow-[0_4px_20px_rgba(15,23,42,0.08)]">
              {/* Photo — full width on mobile, 38% on desktop */}
              <div className="relative shrink-0 overflow-hidden bg-ds-surface-container h-48 lg:h-auto lg:w-[38%]">
                <img src={heroImg(nextBooking.image, nextBooking.category)} alt={nextBooking.title} className="w-full h-full object-cover block" />
                <div className="absolute top-3 left-3 bg-white/92 backdrop-blur-[8px] text-[#065f46] text-[10px] font-extrabold tracking-[0.08em] uppercase px-3 py-[4px] rounded-full">✓ Confirmed</div>
              </div>

              {/* Map + info */}
              <div className="flex-1 relative overflow-hidden min-h-[180px]">
                <iframe
                  title="Activity location"
                  width="100%" height="100%"
                  className="absolute inset-0 border-0 block pointer-events-none"
                  style={{filter:"saturate(0.7) brightness(0.85)", minHeight:180}}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={
                    nextBooking.lat && nextBooking.lon
                      ? `https://www.google.com/maps/embed/v1/place?key=${mapsApiKey}&q=${nextBooking.lat},${nextBooking.lon}&zoom=15`
                      : `https://www.google.com/maps/embed/v1/search?key=${mapsApiKey}&q=${encodeURIComponent(nextBooking.location + ", Germany")}`
                  }
                />
                <div className="absolute inset-0 pointer-events-none" style={{background:"linear-gradient(135deg,rgba(15,23,42,0.72) 0%,rgba(15,23,42,0.55) 100%)"}} />
                <div className="relative z-10 h-full flex flex-col justify-between p-5">
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="material-symbols-outlined text-ds-secondary-fixed" style={{fontSize:13,fontVariationSettings:"'FILL' 1"}}>calendar_month</span>
                      <span className="text-[11px] font-bold tracking-[0.06em] uppercase text-ds-secondary-fixed">{nextBooking.dateLabel} · {nextBooking.timeLabel}</span>
                    </div>
                    <div className="text-[18px] font-bold text-white leading-tight mb-1.5">{nextBooking.title}</div>
                    <div className="flex items-center gap-1 text-[12px] text-white/70 flex-wrap">
                      <span className="material-symbols-outlined" style={{fontSize:13}}>location_on</span>
                      {nextBooking.location} · {nextBooking.participants} pax · {eur(nextBooking.totalPriceCents)}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <a href={nextBooking.lat && nextBooking.lon ? `https://www.google.com/maps?q=${nextBooking.lat},${nextBooking.lon}` : `https://www.google.com/maps/search/${encodeURIComponent(nextBooking.location)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 bg-ds-primary text-ds-on-primary text-[12px] font-semibold py-2 px-3 rounded-ds-md hover:opacity-90 transition-opacity">
                      <span className="material-symbols-outlined" style={{fontSize:14}}>map</span>Get Directions
                    </a>
                    <Link href={`/bookings/${nextBooking.id}/thank-you`} className="flex-1 flex items-center justify-center gap-1.5 text-white text-[12px] font-semibold py-2 px-3 rounded-ds-md border border-white/25 bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-colors">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>

              {/* Countdown — horizontal on mobile, vertical on desktop */}
              <div className="flex lg:flex-col items-center justify-center gap-3 lg:gap-0 px-5 lg:px-7 py-4 lg:py-6 border-t lg:border-t-0 lg:border-l border-ds-outline-variant shrink-0">
                <div className="text-[11px] font-bold tracking-[0.08em] uppercase text-ds-on-surface-variant lg:mb-2">Days to go</div>
                <div className="text-[36px] lg:text-[48px] font-extrabold text-ds-on-surface tracking-[-0.04em] leading-none">{nextBooking.daysLeft}</div>
                <div className="text-[11px] text-ds-on-surface-variant lg:mt-1">days</div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-ds-xl border border-dashed border-ds-outline-variant p-12 text-center">
              <span className="material-symbols-outlined text-ds-outline text-5xl block mb-3">event_busy</span>
              <p className="text-[16px] font-semibold text-ds-on-surface mb-1">No upcoming bookings</p>
              <p className="text-[14px] text-ds-on-surface-variant mb-5">Find your next adventure below</p>
              <Link href="/experiences" className="inline-flex items-center gap-1.5 bg-ds-primary text-ds-on-primary text-[13px] font-semibold px-5 py-2 rounded-ds-md hover:opacity-90 transition-opacity">
                <span className="material-symbols-outlined" style={{fontSize:16}}>search</span>Browse Experiences
              </Link>
            </div>
          )}
        </section>

        {/* ── Recommended for You ──────────────────────────────── */}
        {recommendations.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[16px] font-bold text-ds-on-surface">Recommended for You</span>
              <Link href="/experiences" className="text-[13px] font-semibold text-ds-on-surface-variant hover:text-ds-on-surface transition-colors">View all →</Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-3.5">
              {recommendations.map((r) => (
                <Link key={r.id} href={`/experiences/${r.id}`} className="dash-rec-card bg-white rounded-ds-lg border border-ds-outline-variant overflow-hidden shadow-[0_2px_8px_rgba(15,23,42,0.05)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.1)] hover:-translate-y-0.5 transition-all cursor-pointer block">
                  <div className="dash-rec-img relative h-[130px] bg-ds-surface-container overflow-hidden flex items-center justify-center">
                    <img src={recImg(r.image, r.category)} alt={r.title} className="w-full h-full object-cover block" />
                    <span className="absolute bottom-2 left-2 bg-[rgba(15,23,42,0.65)] backdrop-blur-sm text-white text-[9px] font-extrabold tracking-[0.08em] uppercase px-2 py-[3px] rounded-[4px]">
                      {DIFF_LABEL[r.difficulty] ?? r.difficulty}
                    </span>
                  </div>
                  <div className="p-3.5">
                    <div className="flex items-start justify-between gap-1.5 mb-1.5">
                      <span className="text-[13px] font-bold text-ds-on-surface leading-snug">{r.title}</span>
                      {r.rating && (
                        <div className="flex items-center gap-0.5 text-[11px] font-bold text-[#b45309] flex-shrink-0">
                          <span className="material-symbols-outlined text-[#b45309]" style={{fontSize:12,fontVariationSettings:"'FILL' 1"}}>star</span>
                          {r.rating}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[12px] text-ds-on-surface-variant mb-2.5">
                      <span className="material-symbols-outlined" style={{fontSize:13}}>schedule</span>
                      {r.durationMinutes >= 60 ? `${Math.round(r.durationMinutes / 60 * 10) / 10}h` : `${r.durationMinutes}m`}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-bold text-ds-secondary">{eur(r.priceCents)}</span>
                      <span className="text-[10px] font-extrabold tracking-[0.08em] uppercase text-ds-on-surface hover:text-ds-secondary transition-colors cursor-pointer">Book Now</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Two-col: table + right panel ─────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">

          {/* Recent Activity table */}
          <section>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-3">
                <span className="text-[16px] font-bold text-ds-on-surface">Recent Activity</span>
                {/* Tabs */}
                <div className="dash-tab-bar flex gap-0.5 bg-ds-surface-container-low rounded-ds-md p-[3px]">
                  {(["all","upcoming","completed"] as const).map((t) => (
                    <button key={t} onClick={() => setTab(t)}
                      className={`dash-tab-${t === tab ? "active" : ""} px-4 py-1.5 rounded-[5px] text-[13px] font-semibold cursor-pointer border-none transition-all ${t === tab ? "bg-white text-ds-on-surface shadow-[0_1px_4px_rgba(15,23,42,0.1)]" : "bg-transparent text-ds-on-surface-variant"}`}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <button className="text-[13px] font-semibold text-ds-on-surface-variant hover:text-ds-on-surface transition-colors cursor-pointer border-none bg-none">Export →</button>
            </div>

            <div className="dash-card-white bg-white rounded-ds-lg border border-ds-outline-variant overflow-hidden shadow-[0_2px_8px_rgba(15,23,42,0.05)] overflow-x-auto">
              <table className="w-full border-collapse text-left min-w-[500px]">
                <thead>
                  <tr>
                    {["Experience","Date","Status","Amount","Points"].map((h, i) => (
                      <th key={h} className={`dash-table-thead bg-ds-surface-container-low px-4 py-[10px] text-[11px] font-bold tracking-[0.07em] uppercase text-ds-on-surface-variant border-b border-ds-outline-variant ${i >= 3 ? "text-right" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-[14px] text-ds-on-surface-variant">No bookings in this view.</td></tr>
                  ) : filteredBookings.map((b) => {
                    const chip = STATUS_CHIP[b.status] ?? { cls: "bg-ds-surface-container text-ds-on-surface-variant", label: b.status };
                    return (
                      <tr key={b.id} className="dash-table-row border-b border-ds-outline-variant last:border-b-0 cursor-pointer hover:bg-ds-surface-container-low"
                        onClick={() => window.location.href = `/bookings/${b.id}/thank-you`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-ds-md bg-ds-surface-container-low flex items-center justify-center flex-shrink-0">
                              <span className="material-symbols-outlined text-ds-on-surface-variant" style={{fontSize:16}}>{catIcon(b.category)}</span>
                            </div>
                            <div>
                              <div className="text-[13px] font-semibold text-ds-on-surface">{b.title}</div>
                              <div className="text-[12px] text-ds-on-surface-variant">{b.category} · {b.participants} pax</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[13px] tabular-nums text-ds-on-surface-variant">{b.dateLabel}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-[10px] py-[3px] rounded-full text-[10px] font-bold tracking-[0.05em] uppercase ${chip.cls}`}>{chip.label}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-[13px] font-bold tabular-nums text-ds-on-surface">{eur(b.totalPriceCents)}</td>
                        <td className="px-4 py-3 text-right text-[13px] font-bold tabular-nums">
                          {b.points === null
                            ? <span className="text-ds-outline">—</span>
                            : <span className={b.points > 0 ? "text-ds-secondary" : "text-ds-outline"}>{b.points > 0 ? `+${b.points}` : "0"}</span>
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={5} className="px-4 py-[10px] border-t border-ds-outline-variant text-center">
                      <Link href="/bookings" className="text-[13px] font-semibold text-ds-on-surface-variant hover:text-ds-on-surface transition-colors">View all bookings →</Link>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* Right column */}
          <div className="flex flex-col gap-4">

            {/* Quick actions */}
            <div className="dash-card-white bg-white rounded-ds-lg border border-ds-outline-variant overflow-hidden shadow-[0_2px_8px_rgba(15,23,42,0.05)]">
              <div className="px-[18px] pt-[14px] pb-3 border-b border-ds-outline-variant text-[13px] font-bold text-ds-on-surface">Quick Actions</div>
              <div className="p-2 flex flex-col gap-0.5">
                {[
                  { label: "Book New Experience", sub: "Find your next adventure", icon: "search",     bg: "#d1fae5", color: "#065f46", href: "/experiences" },
                  { label: "Invite a Friend",     sub: "Share & earn credits",     icon: "person_add", bg: "#dbeafe", color: "#1d4ed8", href: "/settings" },
                  { label: "Download Invoice",    sub: "Recent bookings",          icon: "download",   bg: "#fef3c7", color: "#92400e", href: "/bookings" },
                  { label: "Become a Host",       sub: "Share your passion",       icon: "star",       bg: "#fce7f3", color: "#9d174d", href: "/onboarding" },
                ].map(({ label, sub, icon, bg, color, href }) => (
                  <Link key={label} href={href} className="flex items-center gap-3 px-2.5 py-[10px] rounded-ds-md hover:bg-ds-surface-container-low transition-colors">
                    <div className="w-[34px] h-[34px] rounded-ds-md flex items-center justify-center flex-shrink-0" style={{background:bg}}>
                      <span className="material-symbols-outlined" style={{fontSize:18,color}}>{icon}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-ds-on-surface">{label}</div>
                      <div className="text-[12px] text-ds-on-surface-variant">{sub}</div>
                    </div>
                    <span className="material-symbols-outlined text-ds-outline ml-auto" style={{fontSize:16}}>chevron_right</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Saved Experiences */}
            {wishlistItems.length > 0 && (
              <div className="dash-card-white bg-white rounded-ds-lg border border-ds-outline-variant overflow-hidden shadow-[0_2px_8px_rgba(15,23,42,0.05)]">
                <div className="flex items-center justify-between px-[18px] pt-[14px] pb-3 border-b border-ds-outline-variant">
                  <span className="text-[13px] font-bold text-ds-on-surface">Saved Experiences</span>
                  <Link href="/wishlist" className="text-[13px] font-semibold text-ds-on-surface-variant hover:text-ds-on-surface transition-colors">View all</Link>
                </div>
                <div className="p-2 flex flex-col gap-1">
                  {wishlistItems.map((w) => (
                    <div key={w.id} className="flex items-center gap-3 px-2.5 py-[10px] rounded-ds-md hover:bg-ds-surface-container-low transition-colors cursor-pointer">
                      <div className="w-11 h-11 rounded-ds-md overflow-hidden bg-ds-surface-container flex items-center justify-center flex-shrink-0">
                        <img src={thumbImg(w.image, w.category)} alt={w.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold text-ds-on-surface truncate">{w.title}</div>
                        <div className="text-[12px] text-ds-on-surface-variant">{w.category}</div>
                      </div>
                      <div className="text-[13px] font-bold text-ds-on-surface tabular-nums flex-shrink-0">{eur(w.priceCents)}</div>
                      <span className="material-symbols-outlined text-ds-error flex-shrink-0" style={{fontSize:16,fontVariationSettings:"'FILL' 1"}}
                        onClick={(e) => { e.preventDefault(); setWishlistItems((i) => i.filter((x) => x.id !== w.id)); }}>
                        favorite
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── AI Assistant (Gemini-powered) ─────────────────────── */}
      <AiChatWidget label="AI Assistant — Erli" />
    </div>
  );
}
