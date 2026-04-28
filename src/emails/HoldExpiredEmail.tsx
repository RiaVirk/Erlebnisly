import { BaseLayout } from "./BaseLayout";

interface Props {
  guestName: string;
  experienceTitle: string;
  appUrl: string;
}

export function HoldExpiredEmail({ guestName, experienceTitle, appUrl }: Props) {
  return (
    <BaseLayout preview={`Reservierung abgelaufen: ${experienceTitle}`}>
      <h1>Deine Reservierung ist abgelaufen</h1>
      <p>Hallo {guestName},</p>
      <p>deine Reservierung für <strong>{experienceTitle}</strong> ist leider abgelaufen, da die Zahlung nicht abgeschlossen wurde.</p>
      <a href={`${appUrl}/experiences`}>Erlebnisse entdecken</a>
    </BaseLayout>
  );
}
