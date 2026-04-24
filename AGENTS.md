# AGENTS.md — ERLEBNISLY

> Read this entire file before writing any code. These rules override your training data.

---

## Rule Zero: Check `node_modules/` First

**This version of every library has breaking changes.** Before writing or modifying any code, you **MUST**:

1. Go to the package inside `node_modules/` and read the relevant docs.
2. Check for deprecation notices, migration guides, and breaking changes.
3. Review existing similar code in this project.
4. Only then write code.

**Documentation paths (check these before touching the relevant code):**

| Package         | Where to look                                               | Watch out for                                                 |
| --------------- | ----------------------------------------------------------- | ------------------------------------------------------------- |
| Next.js 16      | `node_modules/next/dist/docs/` → start at `01-app/index.md` | Async `params`, `cookies()`, caching changes                  |
| React 19        | `node_modules/react/README.md`, `react-dom/README.md`       | `useActionState`/`useOptimistic` from `react`; `useFormStatus` from `react-dom` |
| Prisma          | `node_modules/@prisma/client/README.md` + `prisma/schema.prisma` | Run `npx prisma generate` after any schema change         |
| Clerk           | `node_modules/@clerk/nextjs/README.md`                      | Async `auth()`, always import from `@clerk/nextjs/server`     |
| Mollie          | `node_modules/@mollie/api-client/README.md`                 | OAuth, webhooks, payment status helpers                       |
| date-fns        | `node_modules/date-fns/README.md`                           | Use only for non-timezone date math                           |
| date-fns-tz     | `node_modules/date-fns-tz/README.md`                        | Timezone conversion API                                       |
| react-hook-form | `node_modules/react-hook-form/README.md`                    | `useForm` API changes                                         |
| Zod             | `node_modules/zod/README.md`                                | Validation patterns, `.d.ts` types                            |
| TanStack Query  | `node_modules/@tanstack/react-query/README.md`              | Query/mutation patterns                                       |
| Resend          | `node_modules/resend/README.md`                             | React Email integration                                       |
| shadcn/ui       | Components in `src/components/ui/` + `@radix-ui/*` READMEs  | Always prefer existing shadcn components                      |

For Mollie SDK method verification:

```bash
# PaymentHelper methods (use these for Payment objects):
grep -r "canBeRefunded\|canBePartiallyRefunded\|hasRefunds\|hasChargebacks" node_modules/@mollie/api-client/dist/types/data/payments/PaymentHelper.d.ts

# Payment status is a plain enum — NO isPaid() helper on payments:
# payment.status === 'paid' | 'open' | 'canceled' | 'pending' | 'authorized' | 'expired' | 'failed'

# OrderHelper methods (use these for Order objects only):
grep -r "isPaid\|isCanceled\|isExpired\|isCompleted\|isAuthorized" node_modules/@mollie/api-client/dist/types/data/orders/OrderHelper.d.ts
```

**Never rely solely on pre-trained knowledge. Always verify against the installed version.**

---

## Next.js 16

```ts
// params and searchParams are Promises — MUST await
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ✅
}

// cookies(), headers(), draftMode() — also async
const cookieStore = await cookies(); // ✅

// Redirects require absolute URLs
return NextResponse.redirect(new URL("/error", req.url)); // ✅
return NextResponse.redirect("/error"); // ❌ throws
```

- Caching is **opt-in** (`"use cache"`), not opt-out.
- Turbopack is the default bundler. No webpack-specific config.
- Server-first: default to Server Components and **Server Functions** (`"use server"`). Use `"use client"` sparingly.
- "Server Actions" = a Server Function used in a form `action` context. "Server Functions" is the broader Next.js 16 term.
- Use `loading.tsx`, `error.tsx`, `not-found.tsx` per route segment.

---

## Clerk

```ts
// Server (Server Components, Actions, Route Handlers):
import { auth, currentUser } from "@clerk/nextjs/server"; // ✅
import { auth } from "@clerk/nextjs"; // ❌ wrong path

// auth() is async:
const { userId, sessionClaims } = await auth(); // ✅
const { userId } = auth(); // ❌ returns Promise

// Role check (from session token — free, no API call):
// Requires a Clerk JWT template that maps role into claims under the key you use here.
// Default Clerk field names are publicMetadata / privateMetadata — match your Dashboard template.
const role = (sessionClaims?.publicMetadata as { role?: string })?.role;

// Client Components only:
import { useAuth, useUser } from "@clerk/nextjs"; // ✅ but NEVER in Server Components
```

---

## Prisma & Money

- **Money = `Int` cents.** €50.00 → `5000`. Never `Float` or `Decimal`.
- **Percentages = basis points.** 15% → `1500`. `Math.round(total * bps / 10000)`.
- **Soft delete only** on `User`, `Experience`, `Booking`. Use `deletedAt`, never `prisma.*.delete()`.
- **GDPR**: PII fields are nullable for anonymization. Set to `null` + `anonymizedAt`. Keep financial skeleton (10-year German retention).
- **Lists can't be optional**: `images String[]` ✅ / `images String[]?` ❌ (Prisma rejects).
- **Transaction timeout**: `await prisma.$transaction(async (tx) => { ... }, { timeout: 15000 });`
- **Row lock for availability**: `await tx.$queryRaw\`SELECT id FROM "TimeSlot" WHERE id = ${slotId} FOR UPDATE\``;

---

## Booking State Machine

One-way only. Never backwards. Expired hold → create a **new** booking.

```
RESERVED_HOLD → EXPIRED_HOLD | CONFIRMED | NEEDS_REVIEW
CONFIRMED     → COMPLETED | CANCELLED_BY_CUSTOMER | CANCELLED_BY_HOST | CANCELLED_BY_ADMIN
CANCELLED_*   → REFUND_PENDING → REFUNDED | PARTIALLY_REFUNDED
```

**Every status change** = Prisma `$transaction` containing both the update AND a `BookingEvent` row. No exceptions.

---

## Mollie

- **Amounts are strings**: `{ currency: "EUR", value: "10.50" }` ✅ / `value: 1050` ❌
- **`metadata` is `unknown`** — cast defensively before accessing `bookingId`.
- **Classic webhooks have NO signature.** They POST `id=tr_xxx` as form data. Verify by fetching the payment server-to-server. Don't look for a signing secret.
- **Payment status = plain enum string.** `PaymentHelper` has NO `isPaid()` method. Use `payment.status === 'paid'`. Full enum: `open | canceled | pending | authorized | expired | failed | paid`. (`isPaid()` / `isCanceled()` / `isExpired()` exist only on `OrderHelper`, not `PaymentHelper`.)
- **Prefer `canBeRefunded()` over `isRefundable()`** — `isRefundable()` is deprecated on `PaymentHelper`.
- **Idempotency**: If `newStatus === booking.status`, return 200 immediately. Don't re-process.
- **Partial ≠ full refund**: `amountRefunded` is type `Amount = { currency: string, value: string }` — convert before comparing: `Math.round(parseFloat(payment.amountRefunded!.value) * 100)` vs `totalPriceCents`.
- **OAuth state**: Generate `crypto.randomUUID()` per request, store in httpOnly cookie, verify in callback. Never hardcode.
- **Tokens encrypted at rest**: Always use `encrypt()`/`decrypt()` from `src/lib/crypto.ts` (create if missing — use Node.js `crypto` AES-256-GCM).
- **Token refresh**: Use `getHostMollieClient()` from `src/lib/mollie.ts` (create if missing) — it auto-refreshes. Never use raw DB tokens.

---

## Pricing

- **Server recalculates every price** before payment. Client price = display hint only.
- Order: base → peak season → last-minute surge → × participants → group discount → + add-ons → `Math.max(0, total)`.
- `Math.round()` at every multiplication step.
- 100% branch coverage required in `src/lib/pricing/__tests__/calculator.test.ts`.

---

## Dates & Timezones

- **Store** in UTC. **Display** using `Experience.timezone` with `date-fns-tz`.
- `date-fns` alone has NO timezone support.

```ts
import { formatInTimeZone } from "date-fns-tz"; // ✅
import { format } from "date-fns"; // ❌ for user-facing dates
```

- shadcn `<Calendar>` = date only. Build a separate `<TimeSlotPicker>`.

---

## Security

- **Every Server Action verifies ownership**: `booking.userId === userId || role === "ADMIN"`.
- **Publishing requires** `mollieConnect.chargesEnabled === true`.
- **Env vars**: Import from `@/lib/env` (Zod-validated), never `process.env.X!`.
- **Server-side Zod validation is mandatory** on all form inputs and Server Action parameters.

---

## German Legal (non-negotiable)

- `/impressum` (§5 DDG), `/datenschutz` (GDPR), `/agb` (T&Cs) — must exist.
- Data export (GDPR Art. 20) and anonymization (Art. 17) — must be implemented.
- Prices include 19% MwSt. Tracked via `vatRateBps` on `Experience`.

---

## Never Do

1. Money as `Float`/`Decimal` — use `Int` cents
2. Update `booking.status` without a `BookingEvent` in same transaction
3. `prisma.user.delete()` or `prisma.booking.delete()` — soft delete only
4. Trust a price from the frontend
5. Store Mollie tokens in plaintext
6. `process.env.X!` — use `@/lib/env`
7. Mollie payment without `metadata: { bookingId }`
8. Sync access to `params`/`searchParams`/`cookies()` — always `await`
9. Publish experience without `chargesEnabled === true`
10. `import { auth } from "@clerk/nextjs"` — use `@clerk/nextjs/server`
11. `useAuth()`/`useUser()` in Server Components
12. `NextResponse.redirect("/relative")` — needs absolute URL
13. `date-fns` `format()` for user-facing dates — use `date-fns-tz`
14. Look for Mollie webhook signing secret — classic webhooks have none
15. Hard-delete any record with PII or financial data
16. Bypass server-side Zod validation
17. Ignore timezones in any booking-related code
18. Assume old APIs or patterns still work — check `node_modules/` first
19. Call `payment.isPaid()` — `isPaid()` is `OrderHelper`-only; use `payment.status === 'paid'`
20. Compare `payment.amountRefunded` directly to cents — it's `{ currency, value: string }`, parse first
21. Use `payment.isRefundable()` — deprecated; use `payment.canBeRefunded()`
