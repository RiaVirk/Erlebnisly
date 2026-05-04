import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.publicMetadata as { role?: string } | undefined)?.role;
    if (role === "HOST") redirect("/host/dashboard");
    if (role === "CUSTOMER") redirect("/dashboard");
    redirect("/onboarding");
  }

  return (
    <main className="min-h-screen bg-ds-background flex flex-col">
      {/* Nav */}
      <nav className="h-16 border-b border-ds-outline-variant bg-white flex items-center justify-between px-8">
        <img src="/logo.png" alt="Erlebnisly" className="h-8 w-auto" />
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="type-body-sm text-ds-on-surface-variant hover:text-ds-on-surface transition-colors px-4 py-2">
            Sign in
          </Link>
          <Link href="/sign-up" className="type-body-sm font-semibold bg-ds-primary text-ds-on-primary px-4 py-2 rounded-ds hover:opacity-90 transition-opacity">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ds-secondary-container/30 type-label-caps text-ds-secondary mb-6">
            <span className="material-symbols-outlined text-label-caps" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            B2B Activity Management
          </span>
          <h1 className="type-display-lg text-ds-on-surface mb-4">
            Discover unique<br />experiences near you
          </h1>
          <p className="type-body-md text-ds-on-surface-variant mb-10 max-w-lg mx-auto">
            Browse and book professional tours, workshops, and adventures. Hosts get powerful tools to manage bookings and time slots.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/sign-up" className="flex items-center gap-2 bg-ds-primary text-ds-on-primary px-6 py-3 rounded-ds type-body-md font-semibold hover:opacity-90 transition-opacity shadow-[0_4px_20px_rgba(255,77,0,0.15)]">
              <span className="material-symbols-outlined text-title-sm">rocket_launch</span>
              Get started free
            </Link>
            <Link href="/experiences" className="flex items-center gap-2 border-2 border-ds-primary text-ds-primary px-6 py-3 rounded-ds type-body-md font-semibold hover:bg-ds-primary hover:text-ds-on-primary transition-all">
              <span className="material-symbols-outlined text-title-sm">search</span>
              Browse experiences
            </Link>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-t border-ds-outline-variant bg-white px-8 py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { icon: "travel_explore", title: "Browse & Book", desc: "Search hundreds of experiences with real-time availability." },
            { icon: "confirmation_number", title: "Instant Hold", desc: "Secure your spot with a 15-minute payment hold." },
            { icon: "payments", title: "Safe Payments", desc: "Powered by Mollie with full refund support." },
          ].map(({ icon, title, desc }) => (
            <div key={title}>
              <span className="material-symbols-outlined text-ds-secondary text-5xl mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
              <p className="type-title-sm text-ds-on-surface mb-1">{title}</p>
              <p className="type-body-sm text-ds-on-surface-variant">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ds-outline-variant bg-ds-surface-container-low px-8 py-6 flex items-center justify-between">
        <span className="type-body-sm text-ds-on-surface-variant">© 2026 Erlebnisly</span>
        <div className="flex gap-6">
          {[["Impressum", "/impressum"], ["Datenschutz", "/datenschutz"], ["AGB", "/agb"]].map(([label, href]) => (
            <Link key={href} href={href} className="type-body-sm text-ds-on-surface-variant hover:text-ds-on-surface transition-colors">
              {label}
            </Link>
          ))}
        </div>
      </footer>
    </main>
  );
}
