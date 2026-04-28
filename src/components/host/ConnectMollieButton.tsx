"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  startConnect: () => Promise<void>;
  isAlreadyConnected: boolean;
}

export function ConnectMollieButton({ startConnect, isAlreadyConnected }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <form action={() => startTransition(() => startConnect())}>
      <Button type="submit" disabled={isPending} size="lg">
        {isPending
          ? "Redirecting to Mollie…"
          : isAlreadyConnected
          ? "Reconnect Mollie"
          : "Connect Mollie account"}
      </Button>
    </form>
  );
}
