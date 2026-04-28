import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { buildAuthorizeUrl } from "@/lib/mollie-oauth";
import { disconnectMollie } from "@/lib/actions/mollie-connect";
import { redirect as serverRedirect } from "next/navigation";
import { ConnectMollieButton } from "@/components/host/ConnectMollieButton";
import { MollieConnectionStatus } from "@/components/host/MollieConnectionStatus";
import { Button } from "@/components/ui/button";

export default async function ConnectMolliePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; mollie?: string }>;
}) {
  const { userId: clerkUserId, sessionClaims } = await auth();
  if (!clerkUserId) redirect("/sign-in");

  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  if (role !== "HOST" && role !== "ADMIN") redirect("/");

  const sp = await searchParams;

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    include: { mollieConnect: true },
  });
  if (!dbUser) redirect("/onboarding");

  async function startConnect() {
    "use server";
    const state = randomBytes(32).toString("hex");
    const cookieStore = await cookies();
    cookieStore.set("mollie_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
    redirect(buildAuthorizeUrl(state));
  }

  return (
    <div className="mx-auto max-w-2xl p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Connect your payouts</h1>
        <p className="mt-2 text-muted-foreground">
          We process customer payments through Mollie. Connect your Mollie account to accept
          bookings and receive payouts. No Mollie account yet? You can create one during the flow.
        </p>
      </header>

      {sp.error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
          {sp.error === "csrf_state_mismatch"
            ? "Security check failed. Please try again."
            : sp.error === "token_exchange_failed"
            ? "Mollie authentication failed. Please try again."
            : `Error: ${sp.error}`}
        </div>
      )}

      {sp.mollie === "connected" && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          Mollie connected successfully!
        </div>
      )}

      {dbUser.mollieConnect && (
        <MollieConnectionStatus connection={dbUser.mollieConnect} />
      )}

      <ConnectMollieButton
        startConnect={startConnect}
        isAlreadyConnected={Boolean(dbUser.mollieConnect?.isOnboarded)}
      />

      {dbUser.mollieConnect && (
        <form
          action={async () => {
            "use server";
            await disconnectMollie();
            serverRedirect("/host/connect-mollie");
          }}
        >
          <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:text-destructive">
            Disconnect Mollie
          </Button>
        </form>
      )}

      <details className="text-sm text-muted-foreground">
        <summary className="cursor-pointer">What permissions does Erlebnisly request?</summary>
        <ul className="mt-2 list-disc pl-6 space-y-1">
          <li>Read your organization details (to display your business name)</li>
          <li>Create and read payments on your behalf (booking checkout)</li>
          <li>Create and read refunds (cancellations)</li>
          <li>Read your onboarding status (to know when you can accept payments)</li>
          <li>Read your balance and settlements (for your payouts dashboard)</li>
        </ul>
        <p className="mt-2">You can revoke access at any time from your Mollie dashboard.</p>
      </details>
    </div>
  );
}
