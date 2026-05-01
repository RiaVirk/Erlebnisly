// Clerk's ClerkProvider causes a null-React crash in Turbopack's SSR
// bundle when statically prerendering pages with no dynamic data.
// Force-dynamic skips static generation for the entire legal route group.
export const dynamic = "force-dynamic";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
