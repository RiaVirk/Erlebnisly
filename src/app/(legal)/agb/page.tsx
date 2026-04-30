export const metadata = {
  title: "Allgemeine Geschäftsbedingungen — Erlebnisly",
};

export default function AgbPage() {
  return (
    <main className="prose prose-slate mx-auto max-w-3xl px-6 py-12">
      <h1>Allgemeine Geschäftsbedingungen</h1>
      <p className="text-muted-foreground">Stand: [Datum]</p>

      <h2>§ 1 Geltungsbereich und Vertragspartner</h2>
      <p>
        Erlebnisly betreibt eine Online-Plattform zur Vermittlung von Erlebnissen zwischen Gästen
        und Gastgebern. Erlebnisly ist dabei <strong>nicht</strong> Vertragspartner des jeweiligen
        Erlebnisses. Der Vertrag über die Durchführung des Erlebnisses kommt ausschließlich zwischen
        dem Gast und dem Gastgeber zustande.
      </p>

      <h2>§ 2 Rolle der Plattform</h2>
      <p>
        Erlebnisly erbringt eine reine Vermittlungsleistung. Es wird keine Garantie für die Qualität
        oder Verfügbarkeit der Erlebnisse übernommen. Die Vermittlungsprovision (Plattformgebühr) ist
        die Vergütung für diese Vermittlungsleistung.
      </p>

      <h2>§ 3 Registrierung als Gast / Gastgeber</h2>
      <p>
        [Anforderungen, Mindestalter 18 Jahre, Pflicht zur wahrheitsgemäßen Angabe, KYC bei Mollie
        für Gastgeber]
      </p>

      <h2>§ 4 Buchungsablauf</h2>
      <p>
        Nach Buchungsanfrage wird ein 15-Minuten-Hold auf den Platz gesetzt. Zahlung erfolgt über
        Mollie. Nach erfolgreicher Zahlung wird die Buchung bestätigt.
      </p>

      <h2>§ 5 Preise und Gebühren</h2>
      <p>
        Alle Preise sind Bruttopreise inkl. der gesetzlichen Umsatzsteuer (i.d.R. 19 % MwSt.). Die
        Plattformgebühr beträgt [X] % des Buchungsbetrags und ist nicht erstattungsfähig.
      </p>

      <h2>§ 6 Zahlungsabwicklung</h2>
      <p>
        Die Zahlungsabwicklung erfolgt durch Mollie B.V. als Payment Service Provider. Es gelten
        zusätzlich die Nutzungsbedingungen von Mollie.
      </p>

      <h2>§ 7 Stornierungsbedingungen</h2>
      <ul>
        <li>Stornierung &gt; 48 Stunden vor Beginn: 100 % Erstattung des Erlebnispreises</li>
        <li>Stornierung 24–48 Stunden vor Beginn: 50 % Erstattung</li>
        <li>Stornierung &lt; 24 Stunden vor Beginn: keine Erstattung</li>
        <li>Stornierung durch Gastgeber: 100 % Erstattung für den Gast</li>
      </ul>
      <p>Die Plattformgebühr (§ 5) ist in keinem Fall erstattungsfähig.</p>

      <h2>§ 8 Widerrufsrecht</h2>
      <p>
        Bei Erlebnissen mit festem Termin (Workshops, Touren, Veranstaltungen) besteht gemäß{" "}
        <strong>§ 312g Abs. 2 Nr. 9 BGB kein gesetzliches Widerrufsrecht</strong>. Es gilt
        ausschließlich die Stornierungsregelung in § 7 dieser AGB.
      </p>

      <h2>§ 9 Pflichten der Gastgeber</h2>
      <p>
        Gastgeber sind verpflichtet, KYC-Verfahren bei Mollie zu durchlaufen, ihre steuerlichen
        Pflichten selbst zu tragen sowie Erlebnisse vollständig und wahrheitsgemäß zu beschreiben.
      </p>

      <h2>§ 10 Bewertungen</h2>
      <p>
        Bewertungen sind ausschließlich nach abgeschlossener und verifizierter Buchung möglich.
        Gefälschte Bewertungen sind verboten und werden entfernt.
      </p>

      <h2>§ 11 Verbotene Inhalte und Notice-and-Action (DSA)</h2>
      <p>
        Das Einstellen rechtswidriger Inhalte ist verboten. Meldungen über mutmaßlich rechtswidrige
        Inhalte können an [E-Mail für DSA-Meldungen] gerichtet werden. Wir bearbeiten Meldungen
        unverzüglich gemäß Art. 16 DSA.
      </p>

      <h2>§ 12 Haftung</h2>
      <p>
        Erlebnisly haftet nur für die Vermittlungsleistung, nicht für die Durchführung der
        Erlebnisse durch Gastgeber. Die Haftungsbeschränkung erfolgt in den Grenzen des § 309
        Nr. 7 BGB.
      </p>

      <h2>§ 13 P2B-Verordnung (EU 2019/1150)</h2>
      <p>
        Gemäß der Plattform-zu-Unternehmen-Verordnung werden Gastgeber mindestens 15 Tage vor
        Inkrafttreten von AGB-Änderungen informiert. Das interne Beschwerdemanagement ist unter
        [E-Mail] erreichbar. Ranking-Kriterien: Buchungsanzahl, Bewertungsdurchschnitt,
        Aktualität der Erstellung.
      </p>

      <h2>§ 14 Datenschutz</h2>
      <p>
        Es gilt die{" "}
        <a href="/datenschutz">Datenschutzerklärung</a> von Erlebnisly.
      </p>

      <h2>§ 15 Schlussbestimmungen</h2>
      <p>
        Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Gerichtsstand ist [Ort], sofern
        gesetzlich zulässig.
      </p>
    </main>
  );
}
