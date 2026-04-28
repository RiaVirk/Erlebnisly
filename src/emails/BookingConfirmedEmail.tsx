import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./BaseLayout";

interface Props {
  customerName: string;
  experienceTitle: string;
  slotStartLabel: string;
  hostName: string;
  participantCount: number;
  totalEuro: string;
  bookingUrl: string;
  hostMessage?: string;
}

export default function BookingConfirmedEmail({
  customerName,
  experienceTitle,
  slotStartLabel,
  hostName,
  participantCount,
  totalEuro,
  bookingUrl,
  hostMessage,
}: Props) {
  return (
    <BaseLayout preview={`Buchung bestätigt — ${experienceTitle} am ${slotStartLabel}`}>
      <Heading className="text-[22px] font-bold text-brand">
        Du bist gebucht, {customerName}!
      </Heading>

      <Text className="text-[16px] leading-[24px] text-gray-700">
        Deine Zahlung ist eingegangen und {hostName} wurde benachrichtigt. Hier ist deine Zusammenfassung:
      </Text>

      <Section className="my-6 rounded-md border border-solid border-gray-200 p-5">
        <Text className="m-0 mb-2 text-[14px] text-muted">Erlebnis</Text>
        <Text className="m-0 text-[16px] font-semibold text-brand">{experienceTitle}</Text>

        <Text className="mb-2 mt-4 text-[14px] text-muted">Datum &amp; Uhrzeit</Text>
        <Text className="m-0 text-[16px] text-brand">{slotStartLabel}</Text>

        <Text className="mb-2 mt-4 text-[14px] text-muted">Teilnehmer</Text>
        <Text className="m-0 text-[16px] text-brand">{participantCount}</Text>

        <Text className="mb-2 mt-4 text-[14px] text-muted">Gesamtbetrag</Text>
        <Text className="m-0 text-[16px] text-brand">€{totalEuro}</Text>
      </Section>

      {hostMessage && (
        <Section className="my-6 rounded-md bg-gray-50 p-5">
          <Text className="m-0 mb-1 text-[14px] font-semibold text-brand">
            Eine Nachricht von deinem Host
          </Text>
          <Text className="m-0 text-[15px] italic leading-[22px] text-gray-700">
            „{hostMessage}"
          </Text>
        </Section>
      )}

      <Section className="my-8 text-center">
        <Button
          href={bookingUrl}
          className="rounded-md bg-accent px-6 py-3 text-[14px] font-semibold text-white no-underline"
        >
          Buchung ansehen
        </Button>
      </Section>

      <Text className="text-[14px] text-muted">
        Stornierung nötig? Unsere Stornierungsrichtlinie findest du auf deiner Buchungsseite und in den AGB.
      </Text>
    </BaseLayout>
  );
}

BookingConfirmedEmail.PreviewProps = {
  customerName: "Maria Muster",
  experienceTitle: "Kajak-Tour auf der Spree",
  slotStartLabel: "Sa., 14. Jun 2026, 10:00 Uhr (Europe/Berlin)",
  hostName: "Thomas",
  participantCount: 2,
  totalEuro: "78.00",
  bookingUrl: "https://erlebnisly.de/bookings/bk_preview",
  hostMessage: "Bitte bring wasserfeste Kleidung mit!",
} satisfies Props;
