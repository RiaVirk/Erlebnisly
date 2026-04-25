// src/app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="de">
        <body>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}