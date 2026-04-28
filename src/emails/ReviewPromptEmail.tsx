import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./BaseLayout";

interface Props {
  customerName: string;
  experienceTitle: string;
  reviewUrl: string;
  hostName?: string;
}

export default function ReviewPromptEmail({
  customerName,
  experienceTitle,
  reviewUrl,
  hostName,
}: Props) {
  return (
    <BaseLayout preview={`Wie war ${experienceTitle}?`}>
      <Heading className="text-[22px] font-bold text-brand">
        Wie hat es dir gefallen?
      </Heading>

      <Text className="text-[16px] leading-[24px] text-gray-700">
        Hallo {customerName}, wir hoffen, du hattest ein großartiges Erlebnis
        bei <strong>{experienceTitle}</strong>
        {hostName ? ` mit ${hostName}` : ""}!
      </Text>

      <Text className="text-[16px] leading-[24px] text-gray-700">
        Deine Bewertung hilft anderen Gästen. Es dauert weniger als eine Minute.
      </Text>

      <Section className="my-8 text-center">
        <Button
          href={reviewUrl}
          className="rounded-md bg-accent px-6 py-3 text-[14px] font-semibold text-white no-underline"
        >
          Jetzt bewerten
        </Button>
      </Section>

      <Text className="text-[14px] text-muted">
        Du hast kein Erlebnis gebucht oder möchtest keine E-Mails erhalten?
        Du kannst deine Präferenzen in den Kontoeinstellungen anpassen.
      </Text>
    </BaseLayout>
  );
}

ReviewPromptEmail.PreviewProps = {
  customerName: "Maria Muster",
  experienceTitle: "Kajak-Tour auf der Spree",
  hostName: "Thomas",
  reviewUrl: "https://erlebnisly.de/bookings/bk_preview#review",
} satisfies Props;
