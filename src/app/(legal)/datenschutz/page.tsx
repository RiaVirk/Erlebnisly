export const metadata = {
  title: "Datenschutzerklärung — Erlebnisly",
};

// SKELETON — fill in with ~5,000 words of German legalese.
// Use eRecht24 or a DSGVO lawyer. Each third-party processor needs an AVV in place:
// Clerk, Mollie, Resend, Sentry, Vercel, Neon.
export default function DatenschutzPage() {
  return (
    <main className="prose prose-slate mx-auto max-w-3xl px-6 py-12">
      <h1>Datenschutzerklärung</h1>
      <p className="text-muted-foreground">Stand: [Datum]</p>

      <h2>1. Verantwortlicher</h2>
      <p>[Firmenname, Adresse, Kontakt wie im Impressum]</p>

      <h2>2. Allgemeine Hinweise zur Datenverarbeitung</h2>
      <p>[Rechtsgrundlagen, Weitergabe an Dritte, Ihre Rechte als Übersicht]</p>

      <h2>3. Bereitstellung der Website / Erstellung von Logfiles</h2>
      <p>
        Hosting: Vercel Inc., 340 Pine Street, San Francisco, CA 94104, USA.
        Auftragsverarbeitungsvertrag (AVV) gemäß Art. 28 DSGVO abgeschlossen.
        [Beschreibung der Logfile-Daten, Speicherdauer]
      </p>

      <h2>4. Cookies und ähnliche Technologien</h2>
      <p>
        Technisch notwendige Cookies (Session-Management via Clerk) werden ohne Einwilligung gesetzt
        (Art. 6 Abs. 1 lit. f DSGVO). Analyse-Cookies nur nach Einwilligung (Art. 6 Abs. 1 lit. a DSGVO).
      </p>

      <h2>5. Registrierung und Nutzerkonto</h2>
      <p>
        Authentifizierung: Clerk, Inc. AVV abgeschlossen.{" "}
        <a href="https://clerk.com/legal/privacy" rel="noopener noreferrer" target="_blank">
          Datenschutzrichtlinie Clerk
        </a>.
      </p>

      <h2>6. Buchungsabwicklung</h2>
      <p>
        Zahlungsabwicklung: Mollie B.V., Amsterdam. AVV abgeschlossen.{" "}
        <a href="https://www.mollie.com/de/privacy" rel="noopener noreferrer" target="_blank">
          Datenschutzrichtlinie Mollie
        </a>.
        [Welche Daten gespeichert werden, warum, wie lange]
      </p>

      <h2>7. E-Mail-Kommunikation</h2>
      <p>E-Mail-Versand: Resend, Inc. AVV abgeschlossen. Server-Standort: [Region].</p>

      <h2>8. Bewertungen</h2>
      <p>Nur nach abgeschlossener und verifizierter Buchung möglich.</p>

      <h2>9. Wishlist / Benachrichtigungen</h2>
      <p>[Zweck, Rechtsgrundlage, Speicherdauer]</p>

      <h2>10. Fehleraufzeichnung (Sentry)</h2>
      <p>
        Sentry, Inc. AVV abgeschlossen. IP-Scrubbing aktiviert (sendDefaultPii: false).
        [Weitere Details]
      </p>

      <h2>11. Server-Standort und Datenübertragung</h2>
      <p>
        Datenbank: Neon, Inc. Region: [EU/US]. AVV und Standardvertragsklauseln (SCC) vorhanden.
      </p>

      <h2>12. Rechte der Betroffenen</h2>
      <p>
        Sie haben das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17),
        Einschränkung (Art. 18), Datenübertragbarkeit (Art. 20), Widerspruch (Art. 21) sowie das
        Recht, eine Beschwerde bei einer Aufsichtsbehörde einzureichen (Art. 77).
      </p>

      <h2>13. Speicherdauer</h2>
      <p>
        Buchungs- und Zahlungsdaten: 10 Jahre (§ 257 HGB). Alle anderen Daten: bis zur
        Account-Löschung bzw. bis zum Widerruf der Einwilligung.
      </p>

      <h2>14. Datensicherheit</h2>
      <p>[TLS, Verschlüsselung at rest, Zugriffskontrollen]</p>

      <h2>15. Änderungen dieser Datenschutzerklärung</h2>
      <p>Wir behalten uns vor, diese Datenschutzerklärung anzupassen. Stand siehe oben.</p>
    </main>
  );
}
