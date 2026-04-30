import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen">
      <nav className="border-b bg-slate-900 text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3 text-sm">
          <span className="font-semibold">Admin</span>
          <Link href="/admin/dashboard" className="opacity-80 hover:opacity-100">Dashboard</Link>
          <Link href="/admin/bookings" className="opacity-80 hover:opacity-100">Bookings</Link>
          <Link href="/admin/experiences" className="opacity-80 hover:opacity-100">Experiences</Link>
          <Link href="/admin/users" className="opacity-80 hover:opacity-100">Users</Link>
        </div>
      </nav>
      <div className="mx-auto max-w-7xl p-6">{children}</div>
    </div>
  );
}
