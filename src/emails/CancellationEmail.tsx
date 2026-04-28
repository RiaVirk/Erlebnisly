import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./BaseLayout";

interface Props {
  customerName: string;
  experienceTitle: string;
  slotStartLabel: string;
  cancelledBy: "customer" | "host" | "admin";
  refundCents: number;
  currency: string;
  searchUrl: string;
}

export default function CancellationEmail({
  customerName,
  experienceTitle,
  slotStartLabel,
  cancelledBy,
  refundCents,
  currency,
  searchUrl,
}: Props) {
  const refundLine =
    refundCents > 0
      ? `Eine Erstattung von ${(refundCents / 100).toFixed(2)} ${currency} wird in Kürze bearbeitet.`
      : "Gemäß unserer Stornierungsrichtlinie erfolgt keine Erstattung.";

  const cancellerLabel =
    cancelledBy === "host" ? "deinen Host" : cancelledBy === "admin" ? "das Erlebnisly-Team" : "dich";

  return (
    <BaseLayout preview={`Stornierung: ${experienceTitle}`}>
      <Heading className="text-[22px] font-bold text-brand">
        Deine Buchung wurde storniert
      </Heading>

      <Text className="text-[16px] leading-[24px] text-gray-700">
        Hallo {customerName}, deine Buchung für{" "}
        <strong>{experienceTitle}</strong> am {slotStartLabel} wurde von{" "}
        {cancellerLabel} storniert.
      </Text>

      <Section className="my-6 rounded-md bg-gray-50 p-5">
        <Text className="m-0 text-[15px] text-gray-700">{refundLine}</Text>
      </Section>

      <Section className="my-8 text-center">
        <Button
          href={searchUrl}
          className="rounded-md bg-accent px-6 py-3 text-[14px] font-semibold text-white no-underline"
        >
          Neues Erlebnis finden
        </Button>
      </Section>
    </BaseLayout>
  );
}

CancellationEmail.PreviewProps = {
  customerName: "Maria Muster",
  experienceTitle: "Kajak-Tour auf der Spree",
  slotStartLabel: "Sa., 14. Jun 2026, 10:00 Uhr (Europe/Berlin)",
  cancelledBy: "customer",
  refundCents: 5000,
  currency: "EUR",
  searchUrl: "https://erlebnisly.de/experiences",
} satisfies Props;
