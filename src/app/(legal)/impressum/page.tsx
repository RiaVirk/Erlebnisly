export const metadata = {
  title: "Impressum — Erlebnisly",
};

export default function ImpressumPage() {
  return (
    <main className="prose prose-slate mx-auto max-w-3xl px-6 py-12">
      <h1>Impressum</h1>

      <h2>Angaben gemäß § 5 DDG</h2>
      <p>
        <strong>[Ihre Rechtsform, z.B. Erlebnisly UG (haftungsbeschränkt)]</strong><br />
        [Straße und Hausnummer]<br />
        [PLZ] [Stadt]<br />
        Deutschland
      </p>

      <h2>Vertreten durch</h2>
      <p>Geschäftsführer: [Name(n)]</p>

      <h2>Kontakt</h2>
      <p>
        Telefon: <a href="tel:+49000000000">+49 ...</a><br />
        {/* MUST be a real inbox — forwarding to a contact form is not compliant per Munich 2025 ruling */}
        E-Mail: <a href="mailto:info@erlebnisly.de">info@erlebnisly.de</a>
      </p>

      <h2>Registereintrag</h2>
      <p>
        Eintragung im Handelsregister.<br />
        Registergericht: [Amtsgericht ...]<br />
        Registernummer: [HRB ...]
      </p>

      <h2>Umsatzsteuer-ID</h2>
      <p>
        Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
        [DE...]
      </p>

      <h2>Online-Streitbeilegung</h2>
      <p>
        Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
        <a
          href="https://ec.europa.eu/consumers/odr/"
          rel="noopener noreferrer"
          target="_blank"
        >
          https://ec.europa.eu/consumers/odr/
        </a>.<br />
        Unsere E-Mail-Adresse finden Sie oben im Impressum.
      </p>

      <h2>Verbraucherstreitbeilegung / Universalschlichtungsstelle</h2>
      <p>
        Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle teilzunehmen.
      </p>

      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>
        [Name]<br />
        [Anschrift]
      </p>
    </main>
  );
}
