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
      <nav className="sticky top-0 z-50 h-16 border-b border-white/10 bg-[#0F172A] flex items-center justify-between px-8">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Erlebnisly" className="h-8 w-auto" />
            <span className="type-body-sm font-bold text-white tracking-wide">Admin</span>
          </div>
          <div className="flex items-center gap-1">
            {[
              { label: "Dashboard", href: "/admin/dashboard" },
              { label: "Bookings",  href: "/admin/bookings" },
              { label: "Experiences", href: "/admin/experiences" },
              { label: "Users",     href: "/admin/users" },
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 rounded-ds type-body-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <span className="type-label-caps text-white/40">Erlebnisly Platform</span>
      </nav>
      <div className="mx-auto max-w-7xl p-8">{children}</div>
    </div>
    </ClerkProvider>
  );
}
