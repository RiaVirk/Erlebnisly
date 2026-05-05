"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";

const NAV_MAIN = [
  { label: "Dashboard",   href: "/dashboard",   icon: "dashboard" },
  { label: "Activities",  href: "/experiences", icon: "explore" },
  { label: "Calendar",    href: "/calendar",    icon: "calendar_month" },
  { label: "My Bookings", href: "/bookings",    icon: "confirmation_number" },
  { label: "Inventory",   href: "/inventory",   icon: "inventory_2" },
] as const;

const NAV_BOTTOM = [
  { label: "Settings", href: "/settings", icon: "settings" },
  { label: "Support",  href: "/support",  icon: "help_outline" },
] as const;

export default function CustomerSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("sidebar:open", handler);
    return () => window.removeEventListener("sidebar:open", handler);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <>
      {/* Backdrop — mobile only */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 h-full w-72 lg:w-60
          bg-white
          flex flex-col z-50
          transition-transform duration-300 ease-in-out
          shadow-[6px_0_48px_rgba(255,77,0,0.07),2px_0_20px_rgba(0,0,0,0.06)]
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Ambient top glow */}
        <div className="absolute top-0 left-0 right-0 h-48 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 120% 60% at 50% 0%, rgba(255,77,0,0.07) 0%, transparent 70%)" }}
        />

        {/* Brand */}
        <div className="relative px-5 pt-6 pb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(255,77,0,0.2)] shrink-0">
              <img src="/logo.png" alt="Erlebnisly" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-[14px] font-bold text-ds-on-surface leading-tight tracking-tight">Erlebnisly</h1>
              <p className="text-[11px] text-ds-on-surface-variant font-medium">Customer Portal</p>
            </div>
          </div>
          <button
            className="lg:hidden p-1.5 rounded-lg text-ds-on-surface-variant hover:bg-ds-surface-container-low transition-colors"
            onClick={() => setOpen(false)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
          </button>
        </div>

        {/* Main nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {NAV_MAIN.map(({ label, href, icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`
                  group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl
                  text-[13px] font-medium transition-all duration-200
                  ${active
                    ? "text-ds-primary"
                    : "text-ds-on-surface-variant hover:text-ds-on-surface"
                  }
                `}
              >
                {/* Active pill background */}
                {active && (
                  <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-[rgba(255,77,0,0.12)] to-[rgba(255,77,0,0.04)]" />
                )}
                {/* Hover background */}
                {!active && (
                  <span className="absolute inset-0 rounded-xl bg-ds-surface-container-low opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                )}
                {/* Left accent glow */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-ds-primary"
                    style={{ boxShadow: "0 0 10px 2px rgba(255,77,0,0.55)" }}
                  />
                )}

                <span
                  className="relative material-symbols-outlined shrink-0 transition-all duration-200"
                  style={{
                    fontSize: 19,
                    fontVariationSettings: active ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 400",
                  }}
                >
                  {icon}
                </span>
                <span className="relative">{label}</span>

                {/* Active dot badge */}
                {active && (
                  <span className="relative ml-auto w-1.5 h-1.5 rounded-full bg-ds-primary"
                    style={{ boxShadow: "0 0 6px 2px rgba(255,77,0,0.5)" }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Book CTA */}
        <div className="px-4 mt-4">
          <Link
            href="/experiences"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4
              bg-ds-primary text-white text-[13px] font-semibold rounded-xl
              hover:-translate-y-0.5 hover:brightness-105
              transition-all duration-200"
            style={{ boxShadow: "0 4px 20px rgba(255,77,0,0.35)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 17, fontVariationSettings: "'FILL' 1" }}>add_circle</span>
            Book Experience
          </Link>
        </div>

        {/* Bottom nav */}
        <div className="mt-4 px-3 pt-4 space-y-0.5">
          <p className="px-2.5 mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ds-on-surface-variant/50">
            Account
          </p>
          {NAV_BOTTOM.map(({ label, href, icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`
                  group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl
                  text-[13px] font-medium transition-all duration-200
                  ${active ? "text-ds-primary" : "text-ds-on-surface-variant hover:text-ds-on-surface"}
                `}
              >
                {active && (
                  <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-[rgba(255,77,0,0.12)] to-[rgba(255,77,0,0.04)]" />
                )}
                {!active && (
                  <span className="absolute inset-0 rounded-xl bg-ds-surface-container-low opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                )}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-ds-primary"
                    style={{ boxShadow: "0 0 10px 2px rgba(255,77,0,0.55)" }}
                  />
                )}
                <span
                  className="relative material-symbols-outlined shrink-0"
                  style={{ fontSize: 19, fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {icon}
                </span>
                <span className="relative">{label}</span>
              </Link>
            );
          })}
        </div>

        {/* User account */}
        <div className="mx-3 mb-5 mt-3 px-3.5 py-3 rounded-xl flex items-center gap-3"
          style={{ background: "rgba(255,77,0,0.04)", boxShadow: "inset 0 0 0 1px rgba(255,77,0,0.08)" }}
        >
          <UserButton />
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-ds-on-surface truncate leading-tight">My Account</p>
            <p className="text-[11px] text-ds-on-surface-variant truncate">Manage profile</p>
          </div>
        </div>
      </aside>
    </>
  );
}
