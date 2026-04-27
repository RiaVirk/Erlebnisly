"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const NAV = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Experiences", href: "/experiences", icon: "search" },
  { label: "My Bookings", href: "/bookings", icon: "confirmation_number" },
] as const;

export default function CustomerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-60 border-r bg-white border-slate-200 flex flex-col py-6 z-50">
      <div className="px-6 mb-8">
        <h1 className="type-title-sm text-ds-on-surface">Erlebnisly</h1>
        <p className="type-body-sm text-ds-on-surface-variant mt-0.5">Discover experiences</p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map(({ label, href, icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
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
              <span className="material-symbols-outlined mr-3 text-[20px]">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-3 space-y-1 border-t border-ds-outline-variant pt-6">
        <div className="mb-4 px-3 py-3 flex items-center gap-3">
          <UserButton />
          <span className="type-body-sm text-ds-on-surface-variant truncate">My Account</span>
        </div>
      </div>
    </aside>
  );
}
