import { prisma } from "./prisma";
import { decrypt } from "./crypto";
import { refreshMollieAccessToken } from "./mollie-oauth";

interface OnboardingResponse {
  name: string;
  signedUpAt: string;
  status: "needs-data" | "in-review" | "completed";
  canReceivePayments: boolean;
  canReceiveSettlements: boolean;
  _links?: {
    dashboard?: { href: string; type: string };
  };
}

interface ProfilesResponse {
  count: number;
  _embedded?: {
    profiles?: Array<{ id: string; name: string; mode: "test" | "live" }>;
  };
}

/**
 * Fetches onboarding status + primary profile from Mollie, then writes the
 * derived state (chargesEnabled, payoutsEnabled, mollieProfileId, isOnboarded)
 * to the MollieConnect row.
 *
 * Refreshes the access token if it's within 90 seconds of expiry.
 * Returns the raw onboarding payload for UI messaging.
 */
export async function refreshMollieOnboarding(userId: string): Promise<OnboardingResponse> {
  const conn = await prisma.mollieConnect.findUnique({ where: { userId } });
  if (!conn) throw new Error("No Mollie connection for user");

  let accessToken: string;
  if (conn.expiresAt.getTime() - Date.now() < 90_000) {
    accessToken = await refreshMollieAccessToken(userId);
  } else {
    accessToken = decrypt(conn.accessTokenEnc);
  }

  const headers = { Authorization: `Bearer ${accessToken}` };
  const signal = AbortSignal.timeout(15_000);

  const [onbRes, profRes] = await Promise.all([
    fetch("https://api.mollie.com/v2/onboarding/me", { headers, signal }),
    fetch("https://api.mollie.com/v2/profiles", { headers, signal }),
  ]);

  if (!onbRes.ok) {
    throw new Error(`Mollie onboarding fetch failed: ${onbRes.status} ${await onbRes.text()}`);
  }
  if (!profRes.ok) {
    throw new Error(`Mollie profiles fetch failed: ${profRes.status}`);
  }

  const onboarding = (await onbRes.json()) as OnboardingResponse;
  const profiles = (await profRes.json()) as ProfilesResponse;

  const allProfiles = profiles._embedded?.profiles ?? [];
  const liveProfile = allProfiles.find((p) => p.mode === "live");
  const chosenProfile = liveProfile ?? allProfiles[0];

  await prisma.mollieConnect.update({
    where: { userId },
    data: {
      mollieProfileId: chosenProfile?.id ?? null,
      chargesEnabled: onboarding.canReceivePayments,
      payoutsEnabled: onboarding.canReceiveSettlements,
      isOnboarded: Boolean(chosenProfile?.id && onboarding.canReceivePayments),
    },
  });

  return onboarding;
}
