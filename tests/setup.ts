// Vitest global setup
// Install happy-dom for browser-environment tests: npm i -D happy-dom
// Then set environment: "happy-dom" in vitest.config.ts for those tests.
import { vi } from "vitest";

// Silence expected console.error noise in unit tests
vi.spyOn(console, "error").mockImplementation(() => {});
