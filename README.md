# Erlebnisly

A two-sided marketplace for booking hosted experiences in Germany. Guests discover and book experiences; hosts list and manage them. The platform handles payments via Mollie Connect (split-payment OAuth model), sends transactional email via Resend, and enforces German legal requirements (DSGVO, HGB, P2B, DSA).

Built with **Next.js 16 · Prisma + Neon Postgres · Clerk · Mollie Connect · Resend · Upstash Redis · Sentry**.

---

## Highlights — the things worth talking about in an interview

### How I avoided the overbooking trap

Pessimistic row-level locking + Serializable transaction isolation around the "reserve a hold" path:

```ts
await tx.$queryRaw`SELECT id FROM "TimeSlot" WHERE id = ${slotId} FOR UPDATE`;
// count active holds → reject if full → create booking
```

Two concurrent customers competing for the last spot: exactly one wins, the other gets a clean error. Proven by the race-condition integration test in [`src/lib/__tests__/booking-hold.test.ts`](src/lib/__tests__/booking-hold.test.ts).

### How I handled GDPR + soft delete without losing audit trails

Every PII column is nullable. The deletion flow is two-phase:

1. **Soft delete** — `deletedAt` timestamp. Relations stay intact for refund and audit purposes; the row is invisible to queries but recoverable.
2. **Anonymization** — `anonymizedAt` timestamp + PII fields set to `null`. Satisfies GDPR Art. 17 (right to erasure). Booking and BookingEvent rows are kept with PII removed — satisfies §257 HGB's 10-year financial record retention.
3. **Hard delete cron** — runs weekly, permanently removes rows where `anonymizedAt` is older than 10 years and all associated bookings predate the cutoff.

### How I made price computation safe

- All money is `Int` cents — `Float` and `Decimal` are banned everywhere money appears.
- Pricing rules (`peakSeasons`, `lastMinuteSurge`, `groupDiscount`) live in a JSON column validated by Zod at the boundary. Malformed rules fall back to no-rules, never crash.
- The server **recomputes the total price** on every payment creation. The client price is a display hint only.
- `Math.round()` at every multiplication step; `Math.max(0, total)` as the final guard.
- 100% branch coverage on the calculator — see [`src/lib/pricing/__tests__/calculator.test.ts`](src/lib/pricing/__tests__/calculator.test.ts).

### How I handled Mollie Connect's split-payment OAuth model

Hosts onboard through Mollie Connect OAuth. The platform collects an `applicationFee` on each payment — Mollie routes the net amount to the host's balance automatically. Key decisions:

- **Tokens encrypted at rest** with AES-256-GCM (`src/lib/crypto.ts`). Raw tokens never touch the DB.
- **Auto-refresh** — `getHostMollieClient()` checks `expiresAt` and refreshes before use; callers never handle token lifecycle.
- **`chargesEnabled` gate** — experiences can only be published if `mollieConnect.chargesEnabled === true`. Enforced server-side on every publish action.
- **Classic webhook verification** — Mollie's classic webhooks POST `id=tr_xxx` as form data with no signature. We verify by re-fetching the payment server-to-server. No signing secret exists to check.

### Booking state machine

One-way only. Every status change is wrapped in a `$transaction` that also writes a `BookingEvent` row — no exceptions.

```
RESERVED_HOLD → EXPIRED_HOLD | CONFIRMED | NEEDS_REVIEW
CONFIRMED     → COMPLETED | CANCELLED_BY_* 
CANCELLED_*   → REFUND_PENDING → REFUNDED | PARTIALLY_REFUNDED
```

The webhook decision logic is extracted into a pure function (`decideNextStatus`) with 7 tested scenarios — no mocks needed for the pure function tests.

---

## Tech stack

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2 |
| Language | TypeScript | 5.x |
| Database | Neon Postgres via Prisma | Prisma 7.8 |
| Auth | Clerk | 7.x |
| Payments | Mollie Connect | API client 4.5 |
| Email | Resend + React Email | 6.x |
| Rate limiting | Upstash Redis | ratelimit 2.x |
| Error monitoring | Sentry | 10.x |
| Styling | Tailwind CSS v4 + shadcn/ui | — |
| State (client) | TanStack Query v5 + `useOptimistic` | — |
| Forms | react-hook-form + Zod | — |
| Testing | Vitest + Testing Library + happy-dom | 4.x |

---

## Architecture diagram — booking lifecycle

```
Guest                   Platform                         Host
  │                        │                               │
  ├─ Browse /experiences ──►│ Prisma: published + active    │
  │                        │                               │
  ├─ POST /api/booking ────►│ FOR UPDATE lock on TimeSlot   │
  │   (hold 15 min)        │ $transaction → RESERVED_HOLD  │
  │                        │ Mollie: payments.create()      │
  │◄── checkoutUrl ─────────┤                               │
  │                        │                               │
  ├─ Pay at Mollie ────────►│ (Mollie checkout)             │
  │                        │                               │
  │              POST /api/mollie/webhook ◄── Mollie fires  │
  │                        │ re-fetch payment server-side   │
  │                        │ $transaction → CONFIRMED       │
  │                        │ + BookingEvent row             │
  │◄── confirmation email ──┤                               │
  │                        ├─ confirmation email ──────────►│
  │                        │                               │
  ├─ Attend experience ────►│                               │
  │                        │                               │
  │         cron: complete-bookings (slot endTime + 1h)     │
  │                        │ CONFIRMED → COMPLETED          │
  │◄── review prompt email ─┤                               │
```

---

## Local setup

**Prerequisites:** Node 20+, PostgreSQL (local or Neon), a Clerk app, a Mollie test account with Connect enabled.

```bash
git clone https://github.com/your-org/erlebnisly
cd erlebnisly
npm install
```

Copy the environment template and fill in every variable:

```bash
cp .env.example .env.local
```

Required variables:

```ini
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...
MOLLIE_API_KEY=test_...
MOLLIE_CLIENT_ID=app_...
MOLLIE_CLIENT_SECRET=...
MOLLIE_REDIRECT_URI=http://localhost:3000/api/mollie/callback
APP_URL=http://localhost:3000
ENCRYPTION_KEY=<44+ char random string>
RESEND_API_KEY=re_...
EMAIL_FROM=onboarding@resend.dev
CRON_SECRET=<32+ char random string>
# Optional — rate limiting is a no-op without these:
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
# Optional — Sentry is disabled without these:
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=...
SENTRY_ORG=...
SENTRY_PROJECT=...
```

Run database migrations and seed:

```bash
npx prisma migrate deploy
npx prisma db seed
```

Start the dev server:

```bash
npm run dev
```

Seed creates a `demo_host` user (Clerk ID `demo_host`) with 10 experiences and 3 future time slots each.

---

## Tests

```bash
npm test                  # Vitest unit suite (35 tests)
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report — target ≥70% on src/lib/**
npm run test:ui           # Vitest browser UI
```

| File | What it tests |
|---|---|
| `src/lib/pricing/__tests__/calculator.test.ts` | Price calculator — all rule combinations, compounding, rounding |
| `src/lib/__tests__/webhook.test.ts` | `decideNextStatus` pure function — 7 booking state transitions |
| `src/lib/__tests__/refund.test.ts` | Cancellation policy — every branch including 48h/24h boundaries |
| `src/lib/__tests__/booking-hold.test.ts` | **Integration** — concurrent hold race; requires real Postgres |

The integration test is skipped when `TEST_DATABASE_URL` is not set. To run it:

```bash
# Point at a test database (separate from dev — the test wipes all data in beforeEach)
dotenv -e .env.test -- vitest run src/lib/__tests__/booking-hold.test.ts
```

---

## Key directories

```
src/
├── app/
│   ├── (customer)/        # Guest-facing pages
│   ├── (host)/            # Host dashboard, earnings, listings
│   ├── (admin)/           # Platform admin (ADMIN role guard)
│   ├── (legal)/           # Impressum, Datenschutz, AGB, Widerrufsbelehrung
│   └── api/
│       ├── mollie/        # webhook + OAuth callback
│       ├── cron/          # 6 scheduled jobs (Bearer-authed)
│       └── me/            # GDPR export + anonymize
├── lib/
│   ├── actions/           # Server Functions (booking, review, search, wishlist…)
│   ├── pricing/           # Calculator + Zod schema for pricing rules
│   ├── refund-policy.ts   # Cancellation policy pure function
│   ├── mollie.ts          # getHostMollieClient with auto-refresh
│   ├── crypto.ts          # AES-256-GCM encrypt/decrypt for Mollie tokens
│   ├── gdpr.ts            # exportUserData — exhaustive PII pull
│   ├── ratelimit.ts       # Upstash sliding-window helper
│   └── notify.ts          # Notification row + email, email failure non-fatal
└── components/
    ├── customer/          # ExperienceCard, WishlistHeart, ReviewForm, …
    ├── host/              # EarningsChart, KPI cards
    ├── legal/             # CookieBanner
    └── ui/                # shadcn/ui components
```

---

## Cron jobs

All routes are under `/api/cron/*` and require `Authorization: Bearer $CRON_SECRET`.

| Route | Schedule | Purpose |
|---|---|---|
| `expire-holds` | `*/5 * * * *` | `RESERVED_HOLD` → `EXPIRED_HOLD` after 15 min |
| `complete-bookings` | `*/10 * * * *` | `CONFIRMED` → `COMPLETED` after slot end + 1h |
| `refresh-mollie-status` | `0 * * * *` | Re-fetches Mollie payment status for stuck holds |
| `review-prompts` | `0 10 * * *` | Sends review-prompt emails 24h after slot end |
| `promote-waitlist` | `*/5 * * * *` | Promotes next waitlist entry when a spot is released |
| `retention-cleanup` | `0 4 * * 0` | Hard-deletes anonymized users older than 10 years |

---

## Deployment

See [phase 5 deployment notes](https://github.com/your-org/erlebnisly/wiki) for the full Vercel + Neon + Mollie production checklist.

Short version:

1. Create Vercel project, connect repo.
2. Set all env vars (Production scope). `ENCRYPTION_KEY` and `CRON_SECRET` must differ from dev.
3. Connect Neon prod branch as `DATABASE_URL`. Run `npx prisma migrate deploy` once.
4. Add production redirect URI to Mollie app: `https://your-domain.de/api/mollie/callback`.
5. Switch `MOLLIE_API_KEY` to a `live_*` key and remove all `testmode: true` calls.
6. Verify crons appear in Vercel → Cron Jobs tab after first deploy.

---

## Limitations / known issues

- Search "sort by rating" is approximated by review count, not computed average — a proper rating sort requires a pre-aggregated column or a generated column in Postgres.
- VAT only handles German standard (19%) and reduced (7%) rates. OSS (One-Stop-Shop) scheme for EU-wide sales is deferred to v1.1.
- Single currency (EUR) only — `currency` column exists for future expansion.
- `useOptimistic` is used for single-component state (wishlist heart, notification mark-read); TanStack Query is used where multiple components share cache (search results, paginated lists). These are intentionally separate — see [optimistic UI decision matrix](src/lib/hooks/).
- Session Replay (`replaysSessionSampleRate`) is set to `0.0` by default. Enable in `instrumentation-client.ts` only after updating the Datenschutzerklärung and cookie banner to disclose it.
