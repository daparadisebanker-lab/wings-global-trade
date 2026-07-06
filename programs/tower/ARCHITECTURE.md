# TOWER · ARCHITECTURE.md

## Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| App | **Next.js App Router + TypeScript**, deployed on Vercel as `apps/tower` in the existing monorepo | Shares `@wings/trade-ui`; server actions for mutations; RSC for dense data pages |
| Database | **Supabase Postgres** (wings-global-trade project, `pyznlglvwihosemqkhtq`) — schema `tower`, plus existing `aladin` schema read through brand scoping | RLS is the entire RBAC model; same project as the live Wings site |
| Auth | Supabase Auth — email magic link + Google OAuth; JWT carries `user_id`; roles resolved via `lane_memberships` | Never roles-in-JWT: memberships change without re-login |
| Storage | Supabase Storage — buckets `product-media`, `trade-documents` (private, signed URLs) | Trade docs are sensitive; nothing public by default |
| Realtime | Supabase Realtime on `containers`, `rfqs`, `events_rollup` | Live fill-meters and pipeline boards |
| Automation | Existing **n8n** instance — new TOWER pipeline group | WhatsApp I/O, digest scheduling, publish webhooks, document generation |
| AI | **Claude API** — `claude-haiku-4-5` for classification/triage, `claude-sonnet-4-6` for spec extraction, digests, Mister supervision | Per ecosystem defaults; streaming for anything > 2s |
| Data grid | TanStack Table + TanStack Query | Dense manifest-grade tables with server pagination |
| Charts | Recharts, restyled to manifest aesthetic (thin rules, mono numerals) | Boring, reliable, themeable |
| Validation | **Zod everywhere** — spec schemas, server actions, event ingest | One schema language from DB edge to form |
| Search | Postgres FTS (products, accounts) v1 → Typesense upgrade path documented | Don't add infra before pain |
| Events/analytics | First-party ingest endpoint → `tower.events` (monthly partitions) → materialized rollups via `pg_cron` | Supabase-first; **upgrade path: Tinybird/ClickHouse** when events > ~5M/mo |

## Key decisions

**ADR-1 · RBAC = Postgres RLS on `lane_memberships`.** Every domain table carries `lane_id` (and `brand_id`). Policies join through memberships. There is no application-level permission code to drift out of sync — the database *is* the permission system. Group Admin bypass via `is_group_admin()` security-definer function.

**ADR-2 · Multi-tenant by brand, not by deployment.** `brands` table (wings, aladin, future endorsed brands). All queries brand-scoped; Áladín team members have memberships only on Áladín lanes. One TOWER, N brands — consistent with the endorsed-brand rules in the ecosystem CLAUDE.md. Áladín's existing schema is bridged by views into `tower` during migration, then consolidated.

**ADR-3 · Specs are JSONB validated by versioned Zod schemas per archetype.** `spec_schemas` stores the JSON-Schema export; the form renders *from* the schema (schema-driven forms). Adding a spec field to COMMODITY = publishing a new schema version. No migrations for spec evolution, full validation retained, old products keep their schema version.

**ADR-4 · Publishing = state + webhook, site pulls truth.** Public sites read published product state from Supabase (or its ISR cache). `publish` flips `status`, writes `product_versions`, and POSTs Vercel on-demand revalidation for the affected lane paths. Rollback = republish previous version. The site never holds content the TOWER doesn't know about.

**ADR-5 · Events are append-only and anonymous-first.** Ingest endpoint is public but HMAC-signed by the sites, rate-limited, no PII (session hash only). Identity joins happen only when a session converts to an RFQ. Keeps GDPR posture clean for Áladín's EU traffic.

**ADR-6 · Audit log is append-only, on everything.** Trigger-based `audit_log` on all mutating tables (who, what, before/after, when). Non-negotiable for a trading house that will face banks, certifiers, and visa assessors.

**ADR-7 · Money is integers.** All monetary values stored as integer minor units + currency code. Landed-cost math in SQL/server only, never floating client math. Percentages as basis points.

## System diagram

```
 Public sites (Manifest + lanes + Áladín)
   │  events (HMAC)            ▲ ISR revalidate
   ▼                           │
 ┌──────────────── TOWER (Next.js, Vercel) ────────────────┐
 │ Catalog Studio · Pipeline · Container Desk ·            │
 │ Signal Deck · Intelligence · Admin                      │
 └───────┬──────────────┬──────────────┬───────────────────┘
         ▼              ▼              ▼
   Supabase (tower schema, RLS, Storage, Realtime)
         │              │
         ▼              ▼
       n8n  ◄──── WhatsApp / email / digests / doc-gen
         │
         ▼
    Claude API (Tower Intelligence)
```

## Environments & safety

`main` → production; Vercel preview per PR against a Supabase branch. Service key server-side only. Every server action: auth check → Zod parse → RLS-scoped query. Global error boundary; toasts; raw errors never surface.

## Performance budget

Tables virtualize past 100 rows; dashboard queries hit rollups, never raw events; p95 < 400ms for any list view; Signal Deck initial load < 2s.
