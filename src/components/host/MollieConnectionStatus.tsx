"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { refreshMollieStatus } from "@/lib/actions/mollie-connect";
import type { MollieConnect } from "@prisma/client";

export function MollieConnectionStatus({ connection }: { connection: MollieConnect }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function handleRefresh() {
    start(async () => {
      const result = await refreshMollieStatus();
      if (!result.ok) {
        toast.error(result.error ?? "Refresh failed");
        return;
      }
      toast.success("Status refreshed.");
      router.refresh();
    });
  }

  if (connection.isOnboarded && connection.chargesEnabled) {
    return (
      <Alert>
        <AlertTitle className="flex items-center gap-2">
          Mollie connected <Badge variant="default">Active</Badge>
        </AlertTitle>
        <AlertDescription>
          You can accept payments and publish experiences.
          {connection.payoutsEnabled
            ? " Payouts are enabled."
            : " Payouts will be enabled once KYC is complete."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert>
      <AlertTitle className="flex items-center gap-2">
        Onboarding incomplete <Badge variant="secondary">Action required</Badge>
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <p>
          Mollie still needs information from you before you can accept payments. Click
          &ldquo;Reconnect&rdquo; below to return to Mollie and finish the missing steps, or
          refresh if you have already completed them.
        </p>
        <Button variant="outline" size="sm" disabled={pending} onClick={handleRefresh}>
          {pending ? "Refreshing…" : "Refresh status"}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
