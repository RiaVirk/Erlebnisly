"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUserRole } from "@/lib/actions/user";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function OnboardingClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<"CUSTOMER" | "HOST" | null>(null);

  function handleContinue() {
    if (!selected) return;
    startTransition(async () => {
      const result = await setUserRole(selected);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      router.push(selected === "HOST" ? "/host/dashboard" : "/dashboard");
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome to Bookly</h1>
          <p className="text-muted-foreground mt-2">How will you use Bookly?</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card
            className={`p-6 cursor-pointer border-2 transition-colors ${
              selected === "CUSTOMER"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            onClick={() => setSelected("CUSTOMER")}
          >
            <div className="text-3xl mb-3">🗺️</div>
            <h2 className="font-semibold text-lg">I want to explore</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Browse and book unique experiences
            </p>
          </Card>

          <Card
            className={`p-6 cursor-pointer border-2 transition-colors ${
              selected === "HOST"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            onClick={() => setSelected("HOST")}
          >
            <div className="text-3xl mb-3">🎯</div>
            <h2 className="font-semibold text-lg">I want to host</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Create and sell your own experiences
            </p>
          </Card>
        </div>

        <Button
          className="w-full"
          onClick={handleContinue}
          disabled={!selected || isPending}
        >
          {isPending ? "Setting up your account..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}