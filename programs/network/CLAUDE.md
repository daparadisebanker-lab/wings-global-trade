# Wings Network — Claude Code Configuration

## Identity
Wings Network is the marketplace ecosystem of Wings Global Trade: third-party suppliers rent access to Wings' corridor buyers (Tacna/ZOFRATACNA, Iquique/ZOFRI) and Wings' consolidated containers — subscription for presence, commission at the logistics rail. This codebase extends the existing `wings-global-trade` Next.js repo. It is NOT a separate app.

## Stack
- Framework: Next.js 15, App Router, React Server Components by default
- Language: TypeScript, `strict: true`, no `any` — ever
- Database: Supabase (Postgres 15 + pgvector + Auth + Storage + Realtime), project wings-global-trade (`pyznlglvwihosemqkhtq` — NOT dalab-intelligence), schema `marketplace`
- Styling: Tailwind CSS + Wings design tokens (see DESIGN_SYSTEM.md — inherit existing site tokens; do not invent a second visual language)
- Motion: GSAP + Lenis on brand surfaces (buyer-facing, Vende landing); CSS/Framer-micro only inside the portal (data surfaces stay quiet)
- State/data: React Server Components + Server Actions first; TanStack Query only where client interactivity demands it; Zustand for ephemeral UI state only
- Forms/validation: React Hook Form + Zod — every boundary (form, API, webhook, LLM output) validates through a shared Zod schema in `src/lib/schemas/`
- AI: Anthropic API — claude-sonnet-4-6 (Mister routing/diagnosis), claude-haiku-4-5 (classification, extraction, embeddings pipeline glue)
- Async/workflows: n8n production engine via signed webhooks (`/api/webhooks/n8n/*`) — n8n owns notifications, reports, billing runs, verification lifecycle; Next.js owns synchronous request/response only
- Email: Resend. WhatsApp: existing deep-link pipeline. Rate limiting/cache: Upstash Redis
- Payments (flagged, Phase 2): Stripe subscriptions for supplier tiers; commission/consolidation fees invoice via fee_events → n8n billing run (NOT Stripe)
- Errors/observability: Sentry (client+server) + PostHog (product analytics)
- Package manager: pnpm. Deployment: Vercel (existing pipeline). Testing: Vitest (unit), Playwright (e2e), Mister eval suite (`pnpm eval:mister`)

## Non-Negotiable Rules
1. **Money is `numeric` in Postgres and decimal-string in TS (`Big.js`) — floats never touch money.** All fee math server-side, from immutable `fee_events`.
2. **RLS on every table, day one.** Supplier rows readable only by that supplier's auth identity. Service key server-side only.
3. **Mister never sees ineligible suppliers.** Tier/verification/category/lane filters run in SQL BEFORE candidates reach the model. Routing precedence: Direct > Network(T2+) > near-match > demand-gap capture. Direct wins all ties.
4. **Every routed lead is a schema-validated event** (see API_MAP.md `routed_lead`). Malformed output → retry once → human handoff. Never write garbage attribution.
5. **Feature flags gate every marketplace surface** (`network_catalog`, `mister_routing:<category>`, `portal`, `stripe_billing`). Phase 0 surfaces ship live; Phase 2 surfaces ship dark.
6. **Third-party is never disguised as first-party.** Every Network listing renders supplier name + verification state. Wings Direct always outranks in ties.
7. **State machines are append-only logged** (containers, shipments, verification) with actor + timestamp. No silent transitions.
8. **The fill-meter never waits on a join** — reads `containers_fill_view` (materialized/cached), updated by trigger.

## Code Conventions
- Components: functional, PascalCase, one per file. Files: kebab-case. Imports: `@/` absolute.
- Server Actions in `src/actions/`, named `verbNoun` (`createApplication`, `reserveSlot`).
- DB access only through `src/lib/db/` typed helpers (generated types via `supabase gen types`).
- Every async boundary: try/catch → typed error → toast (user) / Sentry (system). Raw errors never reach the UI.
- Conventional commits. `pnpm build && pnpm test` green before any feature is declared done.

## File Structure (additions to existing repo)
```
src/
  app/
    (buyer)/red/            ← badged Network catalog + request-a-product
    vende/                  ← supplier landing + application (Phase 0, LIVE)
    portal/                 ← supplier portal (Phase 2, FLAGGED)
    api/
      mister/               ← existing agent + new routing tools
      marketplace/          ← listings, slots, leads (portal backend)
      webhooks/n8n/         ← signed workflow ingress
      webhooks/stripe/      ← flagged
  actions/                  ← server actions
  components/
    marketplace/            ← FillMeter (two-sided), VerifiedBadge, TierCard,
                              ListingCard, SpecSheet, SlotPicker, LeadInbox…
  lib/
    schemas/                ← Zod: application, listing, routed-lead, fee-event…
    db/                     ← typed Supabase helpers
    mister/                 ← routing matrix, lane-conditioned prompts, tools
    money/                  ← Big.js helpers, currency formatting (USD primary)
    flags.ts                ← feature flag access
supabase/
  migrations/               ← DATABASE_SCHEMA.sql split into ordered migrations
evals/mister/               ← routing scenario suite (lane × branch matrix)
```

## Session Rules
- Read PRODUCT_BRIEF.md, ARCHITECTURE.md, API_MAP.md before writing code.
- Check existing repo conventions first — this extends a live site; match its patterns where they conflict with defaults here, except the Non-Negotiables, which always win.
- Never build Phase 2 surfaces unflagged. Never touch reserved-line category logic without reading ARCHITECTURE.md §Channel Conflict.
- Run `pnpm eval:mister` after ANY change to prompts, tools, or routing logic. Routing errors are billing errors.
- Commit per feature; deploy preview per wave; production deploy only Wave gates (BUILD_PROMPT.md).
