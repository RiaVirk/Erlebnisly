import { BaseLayout } from "./BaseLayout";

interface Props {
  guestName: string;
  experienceTitle: string;
  slotLabel: string;
  refundCents: number;
  currency: string;
}

export function CancellationEmail({ guestName, experienceTitle, slotLabel, refundCents, currency }: Props) {
  const refundLabel = refundCents > 0
    ? `Eine Erstattung von ${(refundCents / 100).toFixed(2)} ${currency} wird in Kürze bearbeitet.`
    : "Gemäß unserer Stornierungsrichtlinie erfolgt keine Erstattung.";

  return (
    <BaseLayout preview={`Stornierung: ${experienceTitle}`}>
      <h1>Deine Buchung wurde storniert</h1>
      <p>Hallo {guestName},</p>
      <p>deine Buchung für <strong>{experienceTitle}</strong> am {slotLabel} wurde storniert.</p>
      <p>{refundLabel}</p>
    </BaseLayout>
  );
}
