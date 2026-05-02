import { ClerkProvider } from "@clerk/nextjs";

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return <ClerkProvider afterSignOutUrl="/">{children}</ClerkProvider>;
}
