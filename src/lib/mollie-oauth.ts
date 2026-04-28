import { env } from "./env";
import { prisma } from "./prisma";
import { encrypt, decrypt } from "./crypto";

const AUTHORIZE_URL = "https://my.mollie.com/oauth2/authorize";
const TOKEN_URL = "https://api.mollie.com/oauth2/tokens";

export const REQUIRED_SCOPES = [
  "organizations.read",
  "profiles.read",
  "profiles.write",
  "payments.read",
  "payments.write",
  "refunds.read",
  "refunds.write",
  "onboarding.read",
  "onboarding.write",
  "balances.read",
  "settlements.read",
] as const;

export function buildAuthorizeUrl(state: string): string {
  const url = new URL(AUTHORIZE_URL);
  url.searchParams.set("client_id", env.MOLLIE_CLIENT_ID);
  url.searchParams.set("redirect_uri", env.MOLLIE_REDIRECT_URI);
  url.searchParams.set("state", state);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("approval_prompt", "auto");
  url.searchParams.set("scope", REQUIRED_SCOPES.join(" "));
  return url.toString();
}

interface MollieTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: "bearer";
  scope: string;
}

function basicAuthHeader(): string {
  const creds = `${env.MOLLIE_CLIENT_ID}:${env.MOLLIE_CLIENT_SECRET}`;
  return `Basic ${Buffer.from(creds).toString("base64")}`;
}

export async function exchangeCodeForTokens(code: string): Promise<MollieTokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: basicAuthHeader(),
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: env.MOLLIE_REDIRECT_URI,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new MollieOAuthError(`Token exchange failed: ${res.status} ${body}`, res.status);
  }

  const json = (await res.json()) as MollieTokenResponse;
  if (!json.access_token || !json.refresh_token || !json.expires_in) {
    throw new MollieOAuthError("Token response missing required fields", 502);
  }
  return json;
}

/**
 * Refreshes the access token for the given DB user.
 * On `invalid_grant` (host revoked access in Mollie dashboard), marks the
 * connection as disabled and throws with mustReconnect=true.
 */
export async function refreshMollieAccessToken(userId: string): Promise<string> {
  const conn = await prisma.mollieConnect.findUnique({ where: { userId } });
  if (!conn) throw new MollieOAuthError("No Mollie connection for user", 404);

  const refreshToken = decrypt(conn.refreshTokenEnc);

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: basicAuthHeader(),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 400 && body.includes("invalid_grant")) {
      await prisma.mollieConnect.update({
        where: { userId },
        data: { isOnboarded: false, chargesEnabled: false, payoutsEnabled: false },
      });
      throw new MollieOAuthError("Host has revoked Mollie access", 401, true);
    }
    throw new MollieOAuthError(`Token refresh failed: ${res.status} ${body}`, res.status);
  }

  const json = (await res.json()) as MollieTokenResponse;

  await prisma.mollieConnect.update({
    where: { userId },
    data: {
      accessTokenEnc: encrypt(json.access_token),
      refreshTokenEnc: encrypt(json.refresh_token),
      expiresAt: new Date(Date.now() + json.expires_in * 1000),
    },
  });

  return json.access_token;
}

export class MollieOAuthError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly mustReconnect: boolean = false,
  ) {
    super(message);
    this.name = "MollieOAuthError";
  }
}
