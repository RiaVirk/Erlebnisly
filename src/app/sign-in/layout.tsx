import { ClerkProvider } from "@clerk/nextjs";

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return <ClerkProvider afterSignOutUrl="/">{children}</ClerkProvider>;
}
