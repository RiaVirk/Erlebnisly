import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
  pixelBasedPreset,
} from "@react-email/components";
import * as React from "react";

interface BaseLayoutProps {
  preview: string;
  children: React.ReactNode;
}

const APP_URL = process.env.APP_URL ?? "https://erlebnisly.de";

export function BaseLayout({ preview, children }: BaseLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                brand: "#0F172A",
                accent: "#0284C7",
                muted: "#64748B",
              },
            },
          },
        }}
      >
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto my-10 max-w-[600px] rounded-lg bg-white px-8 py-10 shadow-sm">
            <Section className="mb-8">
              <Img
                src={`${APP_URL}/logo-email.png`}
                alt="Erlebnisly"
                width={140}
                height={32}
              />
            </Section>

            {children}

            <Hr className="my-10 border-gray-200" />

            <Section className="text-center text-xs text-muted">
              <Text className="m-0">
                Erlebnisly · Marketplace for Experiences · Berlin, DE
              </Text>
              <Text className="m-0 mt-2">
                <Link href={`${APP_URL}/impressum`} className="text-muted underline">
                  Impressum
                </Link>
                {" · "}
                <Link href={`${APP_URL}/datenschutz`} className="text-muted underline">
                  Datenschutz
                </Link>
                {" · "}
                <Link href={`${APP_URL}/agb`} className="text-muted underline">
                  AGB
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
