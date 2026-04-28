import { BaseLayout } from "./BaseLayout";

interface Props {
  guestName: string;
  experienceTitle: string;
  refundCents: number;
  currency: string;
}

export function RefundCompletedEmail({ guestName, experienceTitle, refundCents, currency }: Props) {
  return (
    <BaseLayout preview={`Erstattung erhalten: ${experienceTitle}`}>
      <h1>Erstattung abgeschlossen</h1>
      <p>Hallo {guestName},</p>
      <p>deine Erstattung von <strong>{(refundCents / 100).toFixed(2)} {currency}</strong> für <strong>{experienceTitle}</strong> wurde bearbeitet.</p>
      <p>Die Gutschrift erscheint in wenigen Werktagen auf deinem Konto.</p>
    </BaseLayout>
  );
}
