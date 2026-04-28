export const metadata = {
  title: "Widerrufsbelehrung | Erlebnisly",
  robots: { index: false, follow: true },
};

export default function WiderrufsbelehrungPage() {
  return (
    <main className="max-w-4xl mx-auto py-16 px-6">
      <h1 className="text-4xl font-extrabold tracking-tight mb-6">Widerrufsbelehrung</h1>
      <div className="prose prose-slate dark:prose-invert space-y-6">
        <p className="text-muted-foreground">Stand: April 2026</p>
        {/* Legal copy implemented in the legal content step */}
        <section>
          <h2 className="text-2xl font-bold">Kein Widerrufsrecht für zeitgebundene Freizeitveranstaltungen</h2>
          <p>
            Gemäß § 312g Abs. 2 Nr. 9 BGB besteht kein Widerrufsrecht für Verträge über die Erbringung von
            Dienstleistungen im Zusammenhang mit Freizeitbetätigungen, wenn der Vertrag für einen spezifischen
            Termin oder Zeitraum geschlossen wird. Erlebnisly vermittelt zeitgebundene Erlebnisse, die unter
            diese Ausnahmeregelung fallen.
          </p>
          <p>
            Stattdessen gilt die Stornierungsrichtlinie des jeweiligen Hosts. Details findest du in den
            Allgemeinen Geschäftsbedingungen.
          </p>
        </section>
      </div>
    </main>
  );
}
