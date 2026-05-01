"use client";

import dynamic from "next/dynamic";

const Toaster = dynamic(
  () => import("sonner").then((m) => ({ default: m.Toaster })),
  { ssr: false }
);

const CookieBanner = dynamic(
  () => import("@/components/legal/CookieBanner").then((m) => ({ default: m.CookieBanner })),
  { ssr: false }
);

export function ClientOnlyProviders() {
  return (
    <>
      <Toaster />
      <CookieBanner />
    </>
  );
}
