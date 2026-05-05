import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes that never require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/impressum(.*)",
  "/datenschutz(.*)",
  "/agb(.*)",
  "/widerrufsbelehrung(.*)",
  "/api/webhooks(.*)",
  "/api/mollie(.*)",
  "/sentry-tunnel(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  // Public routes pass through with no auth check
  if (isPublicRoute(request)) return NextResponse.next();

  // All other routes require a logged-in user.
  // auth.protect() redirects to /sign-in automatically if not authenticated.
  await auth.protect();

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
