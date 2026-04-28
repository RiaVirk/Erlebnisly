import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getMonthlyEarnings } from "@/lib/actions/host-stats";
import { EarningsChart } from "@/components/host/EarningsChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Einnahmen | Host" };

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
    <div className="mx-auto max-w-4xl space-y-6 p-6 md:p-8">
      <header>
        <h1 className="text-2xl font-bold">Einnahmen</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Nach Abzug der Plattformgebühr. Mollie-Gebühren werden nicht abgezogen —
          sieh dein Mollie-Dashboard für Nettoauszahlungen.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Letzte 12 Monate</CardTitle>
        </CardHeader>
        <CardContent>
          <EarningsChart data={earnings} />
          <p className="mt-4 text-sm text-muted-foreground">
            Gesamt: €{(total / 100).toFixed(2)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
