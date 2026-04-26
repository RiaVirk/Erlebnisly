import createMollieClient, { MollieClient } from "@mollie/api-client";
import { env } from "./env";
import { prisma } from "./prisma";
import { decrypt } from "./crypto";
import { refreshMollieAccessToken } from "./mollie-oauth";

// Platform-level client — your API key, for development/testing only
export const mollie = createMollieClient({ apiKey: env.MOLLIE_API_KEY });

// Per-host OAuth client
export async function getHostMollieClient(
  userId: string
): Promise<{ client: MollieClient; profileId: string }> {
  const conn = await prisma.mollieConnect.findUnique({ where: { userId } });
  if (!conn || !conn.isOnboarded) throw new Error("Host not connected to Mollie");
  if (!conn.mollieProfileId) throw new Error("Host has no Mollie profile");

  let accessToken: string;
  // Refresh if within 90 seconds of expiry
  if (conn.expiresAt.getTime() - Date.now() < 90_000) {
    accessToken = await refreshMollieAccessToken(userId);
  } else {
    accessToken = decrypt(conn.accessTokenEnc);
  }

  return {
    client: createMollieClient({ accessToken }),
    profileId: conn.mollieProfileId,
  };
}