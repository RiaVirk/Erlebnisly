import createMollieClient, { type MollieClient } from "@mollie/api-client";
import { randomUUID } from "crypto";
import { env } from "./env";
import { prisma } from "./prisma";
import { decrypt } from "./crypto";
import { refreshMollieAccessToken } from "./mollie-oauth";

/** Platform-level client — dev / sanity checks only. Real payments use getHostMollieClient(). */
export const mollie = createMollieClient({ apiKey: env.MOLLIE_API_KEY });

export interface HostClient {
  client: MollieClient;
  profileId: string;
  platformFeeBps: number;
}

/**
 * Returns a per-host Mollie client with a fresh access token.
 * Throws HostNotConnectedError or HostNotOnboardedError on misconfiguration.
 */
export async function getHostMollieClient(userId: string): Promise<HostClient> {
  if (env.DEMO_MODE) {
    return {
      client: createDemoMollieClient() as unknown as MollieClient,
      profileId: "pfl_demo",
      platformFeeBps: 1500,
    };
  }

  const conn = await prisma.mollieConnect.findUnique({ where: { userId } });
  if (!conn) throw new HostNotConnectedError("Host has not connected Mollie");
  if (!conn.isOnboarded || !conn.chargesEnabled) {
    throw new HostNotOnboardedError("Host onboarding incomplete");
  }
  if (!conn.mollieProfileId) {
    throw new HostNotOnboardedError("Host has no Mollie profile");
  }

  let accessToken: string;
  if (conn.expiresAt.getTime() - Date.now() < 90_000) {
    accessToken = await refreshMollieAccessToken(userId);
  } else {
    accessToken = decrypt(conn.accessTokenEnc);
  }

  return {
    client: createMollieClient({ accessToken }),
    profileId: conn.mollieProfileId,
    platformFeeBps: conn.platformFeeBps,
  };
}

export class HostNotConnectedError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "HostNotConnectedError";
  }
}

export class HostNotOnboardedError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "HostNotOnboardedError";
  }
}

function createDemoMollieClient() {
  return {
    payments: {
      create: async (input: {
        amount: { currency: string; value: string };
        metadata?: { bookingId?: string };
      }) => {
        const id = `tr_demo_${randomUUID().slice(0, 12)}`;
        const bookingId = input.metadata?.bookingId;
        const checkoutUrl = `${env.APP_URL}/demo/checkout/${bookingId}?paymentId=${id}`;
        return {
          id,
          status: "open" as const,
          amount: input.amount,
          metadata: input.metadata,
          getCheckoutUrl: () => checkoutUrl,
        };
      },
      get: async (id: string) => {
        return {
          id,
          status: "open" as const,
          amountRefunded: undefined,
          metadata: {},
        };
      },
    },
    paymentRefunds: {
      create: async (input: {
        paymentId: string;
        amount: { currency: string; value: string };
      }) => {
        return {
          id: `re_demo_${randomUUID().slice(0, 12)}`,
          paymentId: input.paymentId,
          amount: input.amount,
          status: "refunded" as const,
        };
      },
    },
  };
}
