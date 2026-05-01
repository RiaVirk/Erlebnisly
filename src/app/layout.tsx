import { ClerkProvider } from "@clerk/nextjs";
import { ProvidersTanstack } from "@/components/shared/ProvidersTanstack";
import { ClientOnlyProviders } from "./_components/ClientOnlyProviders";
import "./globals.css";

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
          <ClientOnlyProviders />
        </body>
      </html>
    </ClerkProvider>
  );
}
