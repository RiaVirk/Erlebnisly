import { Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./BaseLayout";

interface Props {
  customerName: string;
  experienceTitle: string;
  refundCents: number;
  currency: string;
}

export default function RefundCompletedEmail({
  customerName,
  experienceTitle,
  refundCents,
  currency,
}: Props) {
  return (
    <BaseLayout preview={`Erstattung abgeschlossen — ${experienceTitle}`}>
      <Heading className="text-[22px] font-bold text-brand">
        Deine Erstattung ist unterwegs
      </Heading>

      <Text className="text-[16px] leading-[24px] text-gray-700">
        Hallo {customerName}, deine Erstattung für{" "}
        <strong>{experienceTitle}</strong> wurde bearbeitet.
      </Text>

      <Section className="my-6 rounded-md border border-solid border-gray-200 p-5">
        <Text className="m-0 mb-2 text-[14px] text-muted">Erstattungsbetrag</Text>
        <Text className="m-0 text-[22px] font-bold text-brand">
          {(refundCents / 100).toFixed(2)} {currency}
        </Text>
      </Section>

      <Text className="text-[14px] text-muted">
        Die Gutschrift erscheint in der Regel innerhalb von 3–5 Werktagen auf
        deinem Konto — je nach Bank kann es etwas länger dauern.
      </Text>
    </BaseLayout>
  );
}

RefundCompletedEmail.PreviewProps = {
  customerName: "Maria Muster",
  experienceTitle: "Kajak-Tour auf der Spree",
  refundCents: 7800,
  currency: "EUR",
} satisfies Props;
