import { BaseLayout } from "./BaseLayout";

interface Props {
  guestName: string;
  experienceTitle: string;
  slotLabel: string;
  bookingUrl: string;
}

export function WaitlistPromotedEmail({ guestName, experienceTitle, slotLabel, bookingUrl }: Props) {
  return (
    <BaseLayout preview={`Platz frei: ${experienceTitle}`}>
      <h1>Ein Platz ist frei geworden!</h1>
      <p>Hallo {guestName},</p>
      <p>für <strong>{experienceTitle}</strong> am {slotLabel} ist ein Platz frei geworden.</p>
      <p>Bitte schließe deine Buchung jetzt ab — der Platz wird nur kurz für dich reserviert.</p>
      <a href={bookingUrl}>Jetzt buchen</a>
    </BaseLayout>
  );
}
