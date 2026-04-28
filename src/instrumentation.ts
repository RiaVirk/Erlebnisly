// Next.js 16 instrumentation entry point.
// Sentry server/edge SDK is initialised here once @sentry/nextjs is installed.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}
