# Wings Network — Architecture Decision Record

## System Diagram
```
                    ┌─────────────────────────────────────────┐
                    │        Next.js 15 on Vercel             │
                    │  (buyer)/red   /vende   /portal*  /api  │
                    │  RSC + Server Actions        *flagged   │
                    └───────┬───────────────┬─────────────────┘
              typed helpers │               │ tool calls (match_supply,
                      + RLS │               │ get_fill_state, log_routed_lead)
                    ┌───────▼───────────────▼─────────────────┐
                    │  Supabase wings (pyznlglvwihosemqkhtq)  │
                    │  schema: marketplace                    │
                    │  Postgres · pgvector · Auth · Realtime  │
                    │  containers_fill_view (trigger-fed)     │
                    └───────┬─────────────────────────────────┘
             signed         │ db webhooks / cron
             webhooks ┌─────▼──────┐    reports/CRM sync   ┌────────┐
        ┌────────────►│    n8n     │◄────────────────────►│ Notion │
        │             │ W-M1…W-M8  │                       └────────┘
        │             └─────┬──────┘
   Next.js /api/webhooks    │ WhatsApp deep-links · Resend email
                            ▼
                     Buyers & Suppliers
   Anthropic API (Mister) · Stripe* · Upstash Redis · Sentry · PostHog
```

## ADRs

**ADR-1 — Monorepo extension, not a second app.**
Marketplace lives in the existing repo/domain. Shared design system, shared fill-meter, one deploy surface, one SEO authority. *Rejected:* separate marketplace app — doubles every surface, splits the trust asset. *Consequence:* zero-regression discipline on existing routes; route groups isolate blast radius.

**ADR-2 — Same Supabase project, new `marketplace` schema.**
Keeps the intelligence backend unified (n8n already connected), enables cross-schema demand analytics, one RLS/auth story. *Rejected:* new Supabase project — operational overhead, cross-project joins impossible. *Consequence:* strict schema namespacing; migrations never touch existing schemas.

**ADR-3 — RSC + Server Actions first; API routes only where n8n/Stripe/Mister need HTTP.**
Fewer client bundles, typed end-to-end, secrets stay server-side by construction. *Rejected:* separate REST/tRPC backend — no consumer needs it yet; API_MAP defines the HTTP surface that must exist.

**ADR-4 — n8n owns async, Next.js owns sync.**
Notifications, reports, billing runs, verification lifecycle, SLA timers = n8n (the production engine already runs seven workflows). Request/response, auth, rendering = Next.js. Contract: signed webhooks both directions (HMAC, `x-wings-signature`). *Rejected:* Vercel cron/queues for these — duplicates a machine that already exists and that ops already watches.

**ADR-5 — Matching = SQL filters THEN pgvector, wrapped as a Mister tool.**
`match_supply(need_embedding, category, lane, min_tier)`: hard eligibility filters (tier ≥ 2, verified, category open, not reserved-line, lane-compatible) in SQL; vector similarity ranks only pre-qualified rows; Direct catalog queried first and wins ties. The model chooses among qualified candidates — it structurally cannot promote an ineligible supplier. *Rejected:* context-stuffing the catalog (won't scale), external search service (premature).

**ADR-6 — Money: `numeric(14,2)` + currency tag; immutable `fee_events`; statements are projections.**
Fees computed once at event time by server code, appended, never recomputed from mutable state. Big.js on the TS side. *Rejected:* floats anywhere, Stripe as the commission ledger (Stripe bills subscriptions only; the rail's fees are Wings' own ledger).

**ADR-7 — Auth: Supabase Auth, magic-link primary, one user table, role claims.**
Suppliers = auth users linked to `supplier_contacts`; RLS policies key on `auth.uid()` → supplier_id. Buyers stay unauthenticated on public surfaces (existing pattern) until a buyer-account phase exists. *Rejected:* separate auth service; password-first (corridor reality: WhatsApp + email magic links win).

**ADR-8 — Feature flags as config, not deploys.**
`flags` table + edge-cached read. Opening a category to Mister routing = one row update. Suspension of a supplier = tier/verification update → routing stops instantly through ADR-5's filters. This is the governance layer's kill switch.

**ADR-9 — Realtime for the fill-meter, polling for everything else.**
`containers_fill_view` broadcast via Supabase Realtime to the public component (the hero must feel alive); portal tables poll/refetch on focus. *Rejected:* websockets everywhere — cost without narrative payoff.

**ADR-10 — Evals as release gate for routing.**
`evals/mister/` scenario matrix (5 lanes × 4 branches + adversarial cases: reserved-line probes, unverified-supplier bait, hallucinated-supply traps). CI blocks merge on eval regression. Routing is billing; it gets payments-grade rigor.

## Channel Conflict (enforced in code)
- `categories.reserved_line = true` → listings in that category cannot reach `publish_state = 'published'` (DB constraint + UI block)
- Tie-break: `ORDER BY is_direct DESC, similarity DESC` — always
- No query, view, or export joins individual supplier sales to Direct sourcing tooling (data-firewall: enforced by schema grants — Direct tooling role has no SELECT on supplier-attributed sales)

## Environments & Config
- `production` / `preview` (Vercel) / `local` (supabase CLI). Secrets: Vercel env + Supabase vault. n8n webhook secrets rotated quarterly.
- Migrations: `supabase/migrations/` ordered, forward-only; every state-machine table gets its audit trigger in the same migration that creates it.

## Security Checklist (build-time, not afterthought)
Rate limits (Upstash) on: application submit, request-a-product, Mister endpoints, portal mutations · webhook HMAC verification on every n8n/Stripe ingress · Zod at every boundary · RLS proven by tests (`pnpm test:rls` — attempts cross-supplier reads must fail) · Sentry PII scrubbing · no service key in client bundles (CI grep gate)
