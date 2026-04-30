"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const CONFIRM_PHRASE = "DELETE MY ACCOUNT";

export default function DeleteAccountPage() {
  const [confirm, setConfirm] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  const armed = confirm === CONFIRM_PHRASE;

  return (
    <main className="mx-auto max-w-xl space-y-6 p-8">
      <h1 className="text-2xl font-bold">Konto löschen</h1>

      <div className="space-y-3 rounded-md border border-red-200 bg-red-50 p-5 text-sm">
        <p className="font-medium">Dies ist permanent und kann nicht rückgängig gemacht werden.</p>
        <ul className="list-disc pl-5 text-red-900">
          <li>Dein Name, deine E-Mail und dein Avatar werden von unseren Servern gelöscht.</li>
          <li>Bewertungen bleiben sichtbar, aber anonymisiert.</li>
          <li>
            Buchungs- und Zahlungsdaten werden gemäß deutschem Handelsrecht (§257 HGB) 10 Jahre
            aufbewahrt — jedoch mit entfernten Personendaten.
          </li>
          <li>Du wirst abgemeldet und kannst dieses Konto nicht wiederherstellen.</li>
        </ul>
      </div>

      <div className="space-y-2">
        <label className="text-sm">
          Gib <strong>{CONFIRM_PHRASE}</strong> ein, um zu bestätigen.
        </label>
        <Input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder={CONFIRM_PHRASE}
        />
      </div>

      <Button
        variant="destructive"
        disabled={!armed || pending}
        onClick={() =>
          start(async () => {
            const res = await fetch("/api/me/anonymize", { method: "POST" });
            if (!res.ok) {
              toast.error("Konto konnte nicht gelöscht werden. Bitte wende dich an den Support.");
              return;
            }
            toast.success("Konto gelöscht.");
            router.push("/");
          })
        }
      >
        {pending ? "Wird gelöscht…" : "Konto dauerhaft löschen"}
      </Button>
    </main>
  );
}
