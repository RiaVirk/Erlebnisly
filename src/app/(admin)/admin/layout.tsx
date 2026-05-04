import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") redirect("/");

  return (
    <ClerkProvider afterSignOutUrl="/">
    <div className="min-h-screen bg-ds-background">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0F172A]">
        <div className="flex items-center justify-between px-4 sm:px-8 h-14 sm:h-16">
          <div className="flex items-center gap-4 sm:gap-8 min-w-0">
            <div className="flex items-center gap-2 shrink-0">
              <img src="/logo.png" alt="Erlebnisly" className="h-7 sm:h-8 w-auto" />
              <span className="type-body-sm font-bold text-white tracking-wide">Admin</span>
            </div>
            {/* Nav links — scroll horizontally on small screens */}
            <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none">
              {[
                { label: "Dashboard",   href: "/admin/dashboard" },
                { label: "Bookings",    href: "/admin/bookings" },
                { label: "Experiences", href: "/admin/experiences" },
                { label: "Users",       href: "/admin/users" },
              ].map(({ label, href }) => (
                <Link key={href} href={href} className="px-2.5 sm:px-3 py-1.5 rounded-ds type-body-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap">
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <span className="type-label-caps text-white/40 hidden md:block shrink-0">Erlebnisly</span>
        </div>
      </nav>
      <div className="mx-auto max-w-7xl p-4 sm:p-8">{children}</div>
    </div>
    </ClerkProvider>
  );
}
