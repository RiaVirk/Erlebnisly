import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./BaseLayout";

interface Props {
  customerName: string;
  experienceTitle: string;
  slotStartLabel: string;
  searchUrl: string;
}

export default function HoldExpiredEmail({
  customerName,
  experienceTitle,
  slotStartLabel,
  searchUrl,
}: Props) {
  return (
    <BaseLayout preview={`Reservierung abgelaufen — ${experienceTitle}`}>
      <Heading className="text-[22px] font-bold text-brand">
        Deine Reservierung ist abgelaufen
      </Heading>

      <Text className="text-[16px] leading-[24px] text-gray-700">
        Hallo {customerName}, leider wurde deine Reservierung für{" "}
        <strong>{experienceTitle}</strong> am {slotStartLabel} nicht rechtzeitig
        bezahlt und ist daher abgelaufen.
      </Text>

      <Text className="text-[16px] leading-[24px] text-gray-700">
        Kein Problem — schau dir ähnliche Erlebnisse an und buche direkt.
      </Text>

      <Section className="my-8 text-center">
        <Button
          href={searchUrl}
          className="rounded-md bg-accent px-6 py-3 text-[14px] font-semibold text-white no-underline"
        >
          Erlebnisse entdecken
        </Button>
      </Section>
    </BaseLayout>
  );
}

HoldExpiredEmail.PreviewProps = {
  customerName: "Maria Muster",
  experienceTitle: "Kajak-Tour auf der Spree",
  slotStartLabel: "Sa., 14. Jun 2026, 10:00 Uhr (Europe/Berlin)",
  searchUrl: "https://erlebnisly.de/experiences",
} satisfies Props;
