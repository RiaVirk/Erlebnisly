import { BaseLayout } from "./BaseLayout";

interface Props {
  guestName: string;
  experienceTitle: string;
  slotLabel: string;
  bookingId: string;
  appUrl: string;
}

export function BookingConfirmedEmail({ guestName, experienceTitle, slotLabel, bookingId, appUrl }: Props) {
  return (
    <BaseLayout preview={`Buchungsbestätigung: ${experienceTitle}`}>
      <h1>Deine Buchung ist bestätigt!</h1>
      <p>Hallo {guestName},</p>
      <p>deine Buchung für <strong>{experienceTitle}</strong> am {slotLabel} ist bestätigt.</p>
      <a href={`${appUrl}/bookings/${bookingId}`}>Buchung ansehen</a>
    </BaseLayout>
  );
}
