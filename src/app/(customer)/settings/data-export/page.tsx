"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function DataExportPage() {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);

  function handleExport() {
    start(async () => {
      const res = await fetch("/api/me/export", { method: "POST" });
      if (!res.ok) {
        toast.error("Export fehlgeschlagen. Bitte versuche es später erneut.");
        return;
      }
      const blob = await res.blob();
      const filename =
        res.headers.get("content-disposition")?.match(/filename="([^"]+)"/)?.[1] ??
        `erlebnisly-export-${new Date().toISOString().slice(0, 10)}.json`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    });
  }

  return (
    <main className="mx-auto max-w-xl space-y-6 p-8">
      <h1 className="text-2xl font-bold">Datenkopie anfordern</h1>
      <p className="text-sm text-muted-foreground">
        Gemäß DSGVO Art. 20 kannst du eine Kopie aller deiner gespeicherten Daten herunterladen.
        Die Datei wird als JSON ausgeliefert und direkt in deinem Browser gespeichert.
      </p>
      {done && (
        <p className="text-sm font-medium text-green-700">
          Download gestartet — prüfe deinen Downloads-Ordner.
        </p>
      )}
      <Button onClick={handleExport} disabled={pending}>
        {pending ? "Wird erstellt…" : "Daten herunterladen"}
      </Button>
    </main>
  );
}
