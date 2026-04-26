export const metadata = {
  title: 'Impressum | Erlebnisly',
  robots: { index: false, follow: true }, // Tells Google "read it, but don't show it in search"
}

export default function ImpressumPage() {
  return (
    <main className="max-w-4xl mx-auto py-16 px-6">
      <h1 className="text-4xl font-extrabold tracking-tight mb-6">Impressum</h1>
      <div className="prose prose-slate dark:prose-invert">
        <p className="text-lg text-muted-foreground mb-8">
          Pflichtangaben gemäß § 5 DDG (ehemals TMG).
        </p>
        
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Angaben gemäß § 5 DDG</h2>
            <p>[Dein Name / Firmenname]</p>
            <p>[Straße und Hausnummer]</p>
            <p>[PLZ und Ort]</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Kontakt</h2>
            <p>Telefon: [Deine Telefonnummer]</p>
            <p>E-Mail: [Deine E-Mail-Adresse]</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Redaktionell verantwortlich</h2>
            <p>[Dein Name]</p>
          </div>
        </section>
      </div>
    </main>
  );
}