import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// Renders a plain <img> — Recharts and avatar tests need this
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element, @typescript-eslint/no-explicit-any
  default: (props: Record<string, unknown>) =>
    require("react").createElement("img", props as any),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: async () => ({
    userId: "test_clerk_user",
    sessionClaims: { metadata: { role: "CUSTOMER" } },
  }),
  currentUser: async () => ({
    id: "test_clerk_user",
    firstName: "Test",
  }),
}));
