export const metadata = {
  title: 'Impressum | Erlebnisly',
  robots: { index: false, follow: true }, // Tells Google "read it, but don't show it in search"
}

export default function AgbPage() {
  return (
    <main className="max-w-4xl mx-auto py-16 px-6">
      <h1 className="text-4xl font-extrabold tracking-tight mb-6">Allgemeine Geschäftsbedingungen</h1>
      <div className="prose prose-slate dark:prose-invert space-y-6">
        <p className="text-muted-foreground">Stand: April 2026</p>
        
        <section>
          <h2 className="text-2xl font-bold">§ 1 Geltungsbereich</h2>
          <p>
            Diese AGB regeln die Nutzung der Plattform "Erlebnisly" und die Vermittlung von Erlebnissen zwischen Hosts und Gästen.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold">§ 2 Vertragsschluss</h2>
          <p>
            Der Vertrag über die Buchung eines Erlebnisses kommt direkt zwischen dem Gast und dem Host zustande. Erlebnisly tritt lediglich als Vermittler auf.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold">§ 3 Zahlungsbedingungen</h2>
          <p>
            Die Zahlungsabwicklung erfolgt über den Dienstleister Mollie. Die Auszahlung an den Host erfolgt nach Abzug der Vermittlungsprovision.
          </p>
        </section>
      </div>
    </main>
  );
}