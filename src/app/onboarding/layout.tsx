import { ClerkProvider } from "@clerk/nextjs";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <ClerkProvider afterSignOutUrl="/">{children}</ClerkProvider>;
}
