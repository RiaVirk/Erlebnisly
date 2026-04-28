import { describe, it } from "vitest";

// Integration tests — require a real DB (no mocking).
// Run with TEST_DATABASE_URL pointing at a test schema.
// Implementation added in the integration test step.
describe("booking hold (integration)", () => {
  it.todo("creates RESERVED_HOLD with correct price breakdown");
  it.todo("prevents double-booking the same slot");
  it.todo("hold expires after 15 minutes");
  it.todo("expired hold frees slot capacity");
});
