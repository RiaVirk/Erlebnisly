import { BaseLayout } from "./BaseLayout";

interface Props {
  guestName: string;
  experienceTitle: string;
  bookingId: string;
  appUrl: string;
}

export function ReviewPromptEmail({ guestName, experienceTitle, bookingId, appUrl }: Props) {
  return (
    <BaseLayout preview={`Wie war ${experienceTitle}?`}>
      <h1>Wie hat es dir gefallen?</h1>
      <p>Hallo {guestName},</p>
      <p>wir hoffen, du hattest ein tolles Erlebnis bei <strong>{experienceTitle}</strong>!</p>
      <p>Teile deine Erfahrung und hilf anderen Gästen.</p>
      <a href={`${appUrl}/bookings/${bookingId}#review`}>Jetzt bewerten</a>
    </BaseLayout>
  );
}
