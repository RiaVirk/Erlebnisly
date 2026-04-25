import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtected = createRouteMatcher([
  "/dashboard(.*)",
  "/host(.*)",
  "/admin(.*)",
  "/bookings(.*)",
  "/api/mollie/callback(.*)",
]);

const isAdmin = createRouteMatcher(["/admin(.*)"]);
const isHost  = createRouteMatcher(["/host(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) {
    const { userId, sessionClaims, redirectToSignIn } = await auth();
    if (!userId) return redirectToSignIn();

    const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
    if (isAdmin(req) && role !== "ADMIN") return Response.redirect(new URL("/", req.url));
    if (isHost(req)  && role !== "HOST" && role !== "ADMIN") return Response.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/"],
};
