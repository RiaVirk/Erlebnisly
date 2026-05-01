import { ClerkProvider } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import { ProvidersTanstack } from "@/components/shared/ProvidersTanstack";
import "./globals.css";

// Client-only — excluded from the SSR bundle to avoid null-React crashes
// during static prerendering of server-only pages (legal pages, etc.)
const Toaster = dynamic(
  () => import("sonner").then((m) => ({ default: m.Toaster })),
  { ssr: false }
);
const CookieBanner = dynamic(
  () => import("@/components/legal/CookieBanner").then((m) => ({ default: m.CookieBanner })),
  { ssr: false }
);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="de">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          />
        </head>
        <body suppressHydrationWarning>
          <ProvidersTanstack>
            {children}
          </ProvidersTanstack>
          <Toaster />
          <CookieBanner />
        </body>
      </html>
    </ClerkProvider>
  );
}
