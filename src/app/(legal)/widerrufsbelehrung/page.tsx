export const metadata = {
  title: "Widerrufsbelehrung — Erlebnisly",
  robots: { index: false, follow: true },
};

export default function WiderrufsbelehrungPage() {
  return (
    <main className="prose prose-slate mx-auto max-w-3xl px-6 py-12">
      <h1>Widerrufsbelehrung</h1>

      <h2>Wichtiger Hinweis</h2>
      <p>
        Bei Erlebnissen mit festem Termin (z.B. Workshops, Touren, Veranstaltungen) besteht gemäß{" "}
        <strong>§ 312g Abs. 2 Nr. 9 BGB</strong> kein gesetzliches Widerrufsrecht. Für solche
        Buchungen gelten ausschließlich unsere Stornierungsregelungen (siehe AGB § 7).
      </p>

      <h2>Widerrufsrecht</h2>
      <p>
        Soweit ein Widerrufsrecht besteht (z.B. bei Gutscheinen ohne festen Termin), haben Sie das
        Recht, binnen 14 Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.
      </p>
      <p>Die Widerrufsfrist beträgt 14 Tage ab dem Tag des Vertragsabschlusses.</p>
      <p>
        Um Ihr Widerrufsrecht auszuüben, müssen Sie uns ([Firmenname], [Anschrift],{" "}
        <a href="mailto:widerruf@erlebnisly.de">widerruf@erlebnisly.de</a>) mittels einer
        eindeutigen Erklärung über Ihren Entschluss informieren.
      </p>

      <h2>Muster-Widerrufsformular</h2>
      <p>
        (Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und
        senden Sie es zurück.)
      </p>
      <ul>
        <li>
          An: [Firmenname], [Anschrift], E-Mail:{" "}
          <a href="mailto:widerruf@erlebnisly.de">widerruf@erlebnisly.de</a>
        </li>
        <li>
          Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den
          Kauf der folgenden Waren (*) / die Erbringung der folgenden Dienstleistung (*)
        </li>
        <li>Bestellt am (*) / erhalten am (*)</li>
        <li>Name des/der Verbraucher(s)</li>
        <li>Anschrift des/der Verbraucher(s)</li>
        <li>Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)</li>
        <li>Datum</li>
      </ul>
      <p>(*) Unzutreffendes streichen.</p>
    </main>
  );
}
