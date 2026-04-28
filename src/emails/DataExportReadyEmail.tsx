import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./BaseLayout";

interface Props {
  userName: string;
  downloadUrl: string;
  expiresAt: string;
}

export default function DataExportReadyEmail({ userName, downloadUrl, expiresAt }: Props) {
  return (
    <BaseLayout preview="Dein Datenexport ist bereit — DSGVO Art. 20">
      <Heading className="text-[22px] font-bold text-brand">
        Dein Datenexport ist bereit
      </Heading>

      <Text className="text-[16px] leading-[24px] text-gray-700">
        Hallo {userName}, deine persönliche Datenkopie (DSGVO Art. 20) steht
        zum Download bereit.
      </Text>

      <Section className="my-8 text-center">
        <Button
          href={downloadUrl}
          className="rounded-md bg-accent px-6 py-3 text-[14px] font-semibold text-white no-underline"
        >
          Daten herunterladen
        </Button>
      </Section>

      <Text className="text-[14px] text-muted">
        Der Link ist gültig bis {expiresAt}. Danach musst du den Export erneut
        anfordern.
      </Text>

      <Text className="text-[14px] text-muted">
        Falls du diesen Export nicht angefordert hast, kannst du diese E-Mail
        ignorieren.
      </Text>
    </BaseLayout>
  );
}

DataExportReadyEmail.PreviewProps = {
  userName: "Maria Muster",
  downloadUrl: "https://erlebnisly.de/api/me/export?token=preview",
  expiresAt: "29. Apr 2026, 14:00 Uhr",
} satisfies Props;
