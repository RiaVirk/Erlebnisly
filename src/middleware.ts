import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Exclude static files and sentry tunnel from Clerk auth
    "/((?!_next|sentry-tunnel|.*\\..*).*)",
    "/",
  ],
};
