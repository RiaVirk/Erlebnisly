"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700 }}>Kritischer Fehler</h2>
          <p style={{ color: "#666" }}>Die Seite konnte nicht geladen werden.</p>
          <button onClick={reset} style={{ marginTop: 16, padding: "8px 16px" }}>
            Erneut versuchen
          </button>
        </div>
      </body>
    </html>
  );
}
