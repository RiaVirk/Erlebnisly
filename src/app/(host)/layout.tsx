import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  if (role !== "HOST" && role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="min-h-screen">
      <nav className="border-b px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-lg">Bookly Host</span>
        <div className="flex gap-4 text-sm">
          <a href="/host/dashboard">Dashboard</a>
          <a href="/host/experiences">My Experiences</a>
          <a href="/host/bookings">Bookings</a>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}