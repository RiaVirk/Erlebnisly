import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./BaseLayout";

interface Props {
  customerName: string;
  experienceTitle: string;
  slotStartLabel: string;
  bookingUrl: string;
}

export default function WaitlistPromotedEmail({
  customerName,
  experienceTitle,
  slotStartLabel,
  bookingUrl,
}: Props) {
  return (
    <BaseLayout preview={`Ein Platz ist frei — ${experienceTitle}`}>
      <Heading className="text-[22px] font-bold text-brand">
        Ein Platz ist frei geworden!
      </Heading>

      <Text className="text-[16px] leading-[24px] text-gray-700">
        Hallo {customerName}, gute Neuigkeiten: Für{" "}
        <strong>{experienceTitle}</strong> am {slotStartLabel} ist ein Platz
        frei geworden.
      </Text>

      <Text className="text-[16px] leading-[24px] text-gray-700">
        Der Platz wird kurz für dich reserviert — schließe deine Buchung jetzt ab.
      </Text>

      <Section className="my-8 text-center">
        <Button
          href={bookingUrl}
          className="rounded-md bg-accent px-6 py-3 text-[14px] font-semibold text-white no-underline"
        >
          Jetzt buchen
        </Button>
      </Section>

      <Text className="text-[14px] text-muted">
        Wenn du nicht mehr interessiert bist, kannst du diese E-Mail ignorieren.
      </Text>
    </BaseLayout>
  );
}

WaitlistPromotedEmail.PreviewProps = {
  customerName: "Maria Muster",
  experienceTitle: "Kajak-Tour auf der Spree",
  slotStartLabel: "Sa., 14. Jun 2026, 10:00 Uhr (Europe/Berlin)",
  bookingUrl: "https://erlebnisly.de/bookings/bk_preview",
} satisfies Props;
