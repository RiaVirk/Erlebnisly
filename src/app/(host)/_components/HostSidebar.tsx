"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const NAV_MAIN = [
  { label: "Dashboard",       href: "/host/dashboard",     icon: "dashboard" },
  { label: "Experiences",     href: "/host/experiences",   icon: "travel_explore" },
  { label: "Bookings",        href: "/host/bookings",      icon: "confirmation_number" },
  { label: "Calendar",        href: "/host/calendar",      icon: "calendar_month" },
] as const;

const NAV_BOTTOM = [
  { label: "Settings", href: "/host/settings", icon: "settings" },
  { label: "Support",  href: "/support",       icon: "help" },
] as const;

export default function HostSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-60 border-r bg-white border-ds-outline-variant flex flex-col py-6 z-50">
      {/* Brand */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <img src="/logo.svg" alt="Erlebnisly" className="h-9 w-auto shrink-0" />
        <div>
          <h1 className="text-sm font-bold text-ds-on-surface leading-tight">Erlebnisly</h1>
          <p className="type-body-sm text-ds-on-surface-variant">Host Portal</p>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 space-y-0.5 px-3">
        {NAV_MAIN.map(({ label, href, icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center px-3 py-2 type-body-sm rounded transition-colors duration-150 ${
                active
                  ? "bg-ds-surface-container-low text-ds-secondary border-l-4 border-ds-secondary font-semibold"
                  : "text-ds-on-surface-variant hover:bg-ds-surface-container-low hover:text-ds-on-surface"
              }`}
            >
              <span className="material-symbols-outlined mr-3 text-title-sm">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="mt-auto px-3 border-t border-ds-outline-variant pt-4 space-y-0.5">
        {/* New Experience CTA */}
        <Link
          href="/host/experiences/new"
          className="flex items-center justify-center gap-2 w-full mb-4 py-2.5 px-4 bg-ds-primary text-ds-on-primary type-body-sm font-semibold rounded-ds shadow-sm hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-title-sm">add</span>
          New Experience
        </Link>

        {NAV_BOTTOM.map(({ label, href, icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center px-3 py-2 type-body-sm text-ds-on-surface-variant hover:bg-ds-surface-container-low hover:text-ds-on-surface rounded transition-colors"
          >
            <span className="material-symbols-outlined mr-3 text-title-sm">{icon}</span>
            {label}
          </Link>
        ))}

        <div className="pt-3 pb-1 px-3 flex items-center gap-3 border-t border-ds-outline-variant mt-2">
          <UserButton />
          <span className="type-body-sm text-ds-on-surface-variant truncate">My Account</span>
        </div>
      </div>
    </aside>
  );
}
