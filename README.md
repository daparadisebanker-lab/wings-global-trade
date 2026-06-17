# Wings Global Trade

B2B trade intelligence and inquiry platform for Latin American importers.
Two flows, one platform: a curated **Catalog** (inquiry → lead) and the
**Accio Engine** (AI chat → TPR → CIF estimate → qualified lead). No cart,
no checkout, no auth — a CRM intake pipeline.

> Precisión. Proximidad. Confianza.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v3 · Supabase · Claude API
(`claude-haiku-4-5` chat, `claude-sonnet-4-6` estimation) · Resend · Twilio
WhatsApp · Framer Motion · Zod · pnpm.

## Getting started

```bash
pnpm install
cp .env.local.example .env.local   # fill in real values
pnpm dev
```

The app runs **without** Supabase/Claude/Resend/Twilio configured: it falls
back to `src/data/seed.json` for the catalog and to a deterministic mock for
the Accio chat, and notifications log to the console. This makes the full UI
testable offline. Configure the env vars to enable the live integrations.

## Environment variables

See `.env.local.example`. Required for full functionality:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `RESEND_API_KEY`, `WINGS_OPS_EMAIL`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`, `WINGS_OPS_WHATSAPP`

Notifications only fire real WhatsApp/email when `VERCEL_ENV === 'production'`.

## Database

Apply the migrations in `supabase/migrations/` (in order) to a Supabase
project:

```bash
# via Supabase CLI
supabase db push
# or paste 0001_initial_schema.sql then 0002_seed.sql into the SQL editor
```

- `0001_initial_schema.sql` — tables, enums, indexes, RLS, triggers
- `0002_seed.sql` — 5 categories + sample products (idempotent)

RLS: `categories` and `products` are public-read; `leads`, `accio_projects`,
and `notification_log` are server-only (service role key, via API routes).

## Architecture

- `src/app/api/**` — 8 route handlers (categories, products, products/[slug],
  leads/catalog, leads/contact, accio/chat, accio/estimate, accio/submit)
- `src/lib/cif-calculator.ts` — deterministic CIF engine
- `src/lib/claude.ts` — Anthropic client + `ACCIO_SYSTEM_PROMPT` + JSON-block
  extraction; `claude.client.ts` holds the client-safe greeting
- `src/lib/catalog-data.ts` — Supabase reads with seed fallback
- `src/lib/notifications/**` — Twilio + Resend senders (fire-and-forget)

## Build

```bash
pnpm build   # zero TypeScript errors, 16 routes
```
