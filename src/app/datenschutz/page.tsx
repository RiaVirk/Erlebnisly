export const metadata = {
  title: 'Impressum | Erlebnisly',
  robots: { index: false, follow: true }, // Tells Google "read it, but don't show it in search"
}

export default function DatenschutzPage() {
  return (
    <main className="max-w-4xl mx-auto py-16 px-6">
      <h1 className="text-4xl font-extrabold tracking-tight mb-6">Datenschutzerklärung</h1>
      <div className="prose prose-slate dark:prose-invert space-y-8">
        <section>
          <h2 className="text-2xl font-bold">1. Datenschutz auf einen Blick</h2>
          <p>
            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold">2. Datenerfassung auf dieser Website</h2>
          <h3 className="text-xl font-semibold">Authentifizierung (Clerk)</h3>
          <p>
            Wir nutzen Clerk für die Benutzerverwaltung. Wenn Sie sich registrieren, werden Ihre E-Mail-Adresse und Profilinformationen bei Clerk gespeichert.
          </p>
          
          <h3 className="text-xl font-semibold">Zahlungsabwicklung (Mollie)</h3>
          <p>
            Für die Zahlungsabwicklung nutzen wir Mollie. Ihre Zahlungsdaten werden direkt von Mollie verarbeitet.
          </p>
        </section>

        <p className="text-sm text-muted-foreground italic">
          Hinweis: Dies ist ein Platzhalter. Eine vollständige Datenschutzerklärung muss alle genutzten Dienste auflisten.
        </p>
      </div>
    </main>
  );
}