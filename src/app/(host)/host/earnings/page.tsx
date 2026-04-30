import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getMonthlyEarnings } from "@/lib/actions/host-stats";
import { EarningsChart } from "@/components/host/EarningsChart";
import { formatCentsEUR } from "@/lib/pricing/utils";

export const metadata = { title: "Earnings | Host" };

export default async function EarningsPage() {
  const { userId: clerkId, sessionClaims } = await auth();
  if (!clerkId) redirect("/sign-in");

  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  if (role !== "HOST" && role !== "ADMIN") redirect("/");

  const dbUser = await prisma.user.findUnique({ where: { clerkId } });
  if (!dbUser) redirect("/onboarding");

  const earnings = await getMonthlyEarnings(dbUser.id, 12);
  const total = earnings.reduce((sum, m) => sum + m.earningsCents, 0);

  return (
    <>
      <header className="sticky top-0 h-16 border-b border-ds-outline-variant bg-white/80 backdrop-blur-md flex items-center justify-between px-8 z-40">
        <div>
          <p className="type-label-caps text-ds-on-surface-variant">HOST PORTAL</p>
          <h1 className="type-title-sm text-ds-on-surface">Earnings</h1>
        </div>
        <p className="type-body-sm text-ds-on-surface-variant">
          Total: <span className="font-semibold text-ds-on-surface">{formatCentsEUR(total)}</span>
        </p>
      </header>

      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-ds-lg border border-ds-outline-variant shadow-[0_4px_20px_rgba(15,23,42,0.08)] overflow-hidden">
          <div className="px-6 py-4 border-b border-ds-outline-variant">
            <h2 className="type-title-sm text-ds-on-surface">Last 12 months</h2>
            <p className="type-body-sm text-ds-on-surface-variant mt-0.5">
              After platform fee deduction. Mollie transaction fees are not included — see your Mollie dashboard for net payouts.
            </p>
          </div>
          <div className="p-6">
            <EarningsChart data={earnings} />
          </div>
        </div>

        <div className="bg-white rounded-ds-lg border border-ds-outline-variant p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between">
            <p className="type-label-caps text-ds-on-surface-variant">Total earnings (12 months)</p>
            <span className="material-symbols-outlined text-ds-secondary text-title-sm">payments</span>
          </div>
          <p className="type-display-lg text-ds-on-surface mt-2">{formatCentsEUR(total)}</p>
          <p className="type-body-sm text-ds-on-surface-variant mt-1">After 15% platform fee</p>
        </div>
      </div>
    </>
  );
}
