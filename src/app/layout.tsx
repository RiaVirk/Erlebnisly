// src/app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="de">
        <body suppressHydrationWarning>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}