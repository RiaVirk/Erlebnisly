"use client";

// _global-error bypasses the root layout so force-dynamic in layout.tsx
// does not cascade here. Must be declared directly.
export const dynamic = "force-dynamic";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="de">
      <body style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", padding: "2rem", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
          Something went wrong
        </h2>
        {error.digest && (
          <p style={{ fontSize: "0.875rem", color: "#5c4037", marginBottom: "1rem" }}>
            Error ID: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          style={{
            background: "#FF4D00", color: "white", border: "none",
            padding: "0.5rem 1.25rem", borderRadius: "8px",
            fontWeight: 600, cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
