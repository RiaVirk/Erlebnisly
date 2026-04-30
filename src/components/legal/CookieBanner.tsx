"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const COOKIE_KEY = "erlebnisly_cookie_consent";
type Consent = "accepted" | "rejected" | null;

export function CookieBanner() {
  const [consent, setConsent] = useState<Consent>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const v = (localStorage.getItem(COOKIE_KEY) as Consent) ?? null;
    setConsent(v);
    setHydrated(true);
  }, []);

  function decide(v: "accepted" | "rejected") {
    localStorage.setItem(COOKIE_KEY, v);
    setConsent(v);
    if (v === "accepted") {
      window.dispatchEvent(new Event("cookie-consent-accepted"));
    }
  }

  if (!hydrated || consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-white p-4 shadow-lg md:p-6"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p id="cookie-banner-title" className="font-medium">
            Wir respektieren Ihre Privatsphäre
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Wir setzen technisch notwendige Cookies. Optional helfen uns anonymisierte
            Analyse-Cookies, das Erlebnis zu verbessern. Mehr in der{" "}
            <Link href="/datenschutz" className="underline">
              Datenschutzerklärung
            </Link>
            .
          </p>
        </div>
        {/* Both buttons must have equal prominence — Hannover ruling March 2025 */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => decide("rejected")}>
            Alle ablehnen
          </Button>
          <Button onClick={() => decide("accepted")}>Alle akzeptieren</Button>
        </div>
      </div>
    </div>
  );
}
