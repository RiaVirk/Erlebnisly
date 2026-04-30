import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { exchangeCodeForTokens } from "@/lib/mollie-oauth";
import { refreshMollieOnboarding } from "@/lib/mollie-onboarding";
import { rateLimit, getIp } from "@/lib/ratelimit";

export async function GET(req: NextRequest) {
  const { success } = await rateLimit("mollie-callback", getIp(req), {
    tokens: 10,
    window: "1 m",
  });
  if (!success) {
    return NextResponse.redirect(
      new URL("/host/connect-mollie?error=rate_limited", req.url),
    );
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(
      new URL(`/host/connect-mollie?error=${encodeURIComponent(oauthError)}`, req.url),
    );
  }

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Delete the state cookie BEFORE any async work to prevent replay
  const cookieStore = await cookies();
  const storedState = cookieStore.get("mollie_oauth_state")?.value;
  cookieStore.delete("mollie_oauth_state");

  if (!code || !returnedState || !storedState || returnedState !== storedState) {
    return NextResponse.redirect(
      new URL("/host/connect-mollie?error=csrf_state_mismatch", req.url),
    );
  }

  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
  if (!dbUser) {
    return NextResponse.redirect(new URL("/host/connect-mollie?error=no_user", req.url));
  }

  let tokens;
  try {
    tokens = await exchangeCodeForTokens(code);
  } catch (err) {
    console.error("[mollie/callback] token exchange failed", err);
    return NextResponse.redirect(
      new URL("/host/connect-mollie?error=token_exchange_failed", req.url),
    );
  }

  await prisma.mollieConnect.upsert({
    where: { userId: dbUser.id },
    create: {
      userId: dbUser.id,
      accessTokenEnc: encrypt(tokens.access_token),
      refreshTokenEnc: encrypt(tokens.refresh_token),
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      chargesEnabled: false,
      payoutsEnabled: false,
      isOnboarded: false,
    },
    update: {
      accessTokenEnc: encrypt(tokens.access_token),
      refreshTokenEnc: encrypt(tokens.refresh_token),
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    },
  });

  // Non-fatal — tokens are saved, worst case status shows needs-data
  try {
    await refreshMollieOnboarding(dbUser.id);
  } catch (err) {
    console.error("[mollie/callback] onboarding refresh failed (non-fatal)", err);
  }

  return NextResponse.redirect(new URL("/host/connect-mollie?mollie=connected", req.url));
}
