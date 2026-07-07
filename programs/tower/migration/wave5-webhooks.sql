-- TOWER · Wave 5 (W5.B WebhookHealth) · PROPOSED SQL — artifact only.
-- NOT APPLIED by this agent, and NO Supabase MCP tool was called. The Conductor
-- reviews, attaches (or deliberately omits — see the audit-trigger note below)
-- the standard trigger, and applies all DB changes — identical handling to
-- wave3-hooks.sql and wave4-intelligence.sql.
--
-- This file proposes ONE new table — tower.webhook_deliveries — plus its RLS +
-- grants. It is the durable record behind <WebhookHealth> (COMPONENT_TREE §6):
-- the revalidation webhook's round-trip and any n8n pipeline delivery, so an
-- operator can see recent deliveries, success/failure counts, and last-seen per
-- source WITHOUT scanning tower.events or reading provider dashboards.
--
-- ── WHAT WRITES HERE ────────────────────────────────────────────────────────
--  · REVALIDATE_OUT      — lib/revalidate.ts triggerRevalidate() records each
--                          outbound Vercel on-demand revalidation attempt
--                          (OUTBOUND, OK|FAILED from the RevalidateOutcome).
--  · REVALIDATE_CALLBACK — POST /api/hooks/revalidate-callback records the
--                          Vercel confirmation that the revalidation ran
--                          (INBOUND). API_MAP: "records the Vercel revalidation
--                          confirmation → WebhookHealth".
--  · N8N_* (e.g. N8N_BRIEF, N8N_DOCGEN) — the same callback endpoint accepts an
--                          explicit `source`, so an n8n job can POST its own
--                          delivery status through the one secured sink rather
--                          than TOWER instrumenting each n8n route (those route
--                          files are owned by other waves and are not touched).
--  All writes go through the SERVICE-ROLE client — never `authenticated`.
--
-- ── FLAGS FOR THE CONDUCTOR ─────────────────────────────────────────────────
--  F1 · AUDIT TRIGGER — DELIBERATELY OMITTED (reasoned, not forgotten).
--       Directive 4 attaches tower.audit_trigger() to every *mutating* table
--       "before it gets a UI." webhook_deliveries is not a mutated domain
--       world: it is append-only, insert-only, service-role-only SYSTEM
--       TELEMETRY — the row IS its own immutable record. This is the exact
--       shape of tower.events (D-04: "service-role only … no audit trigger"),
--       NOT of tower.whatsapp_messages (D-17, which carries the trigger because
--       it holds business conversation content a human reads and links). An
--       audit trigger here would mirror every telemetry insert into audit_log
--       on a hot publish path — pure write-amplification with zero
--       investigative value (you'd be auditing the audit/telemetry log). If the
--       Conductor nonetheless wants uniformity, attach:
--         create trigger webhook_deliveries_audit
--           after insert or update or delete on tower.webhook_deliveries
--           for each row execute function tower.audit_trigger();
--
--  F2 · READ PATH. <WebhookHealth> reads through the SERVICE-ROLE client after a
--       getIsGroupAdmin() check (lib/actions/webhooks.ts), mirroring
--       getGroupSignalDeck (signals.ts) — proven in-repo precedent for an
--       admin-gated read of a service-role-written table. The group-admin SELECT
--       policy below is defense-in-depth (and lets a future RLS-client read be
--       correctly gated); it is not the primary read path.

set search_path to tower, public;

-- ============================================================
-- 1 · tower.webhook_deliveries — webhook / pipeline delivery telemetry
-- ============================================================
create table if not exists tower.webhook_deliveries (
  id          uuid        primary key default gen_random_uuid(),
  -- Free-form but constrained-shape source key (e.g. REVALIDATE_OUT,
  -- REVALIDATE_CALLBACK, N8N_BRIEF). Kept as text (not an enum) so a new n8n
  -- pipeline can report without a migration — same "no DDL for new source"
  -- rationale as spec_schemas' versioned JSON (ADR-3). The app validates the
  -- shape (^[A-Z][A-Z0-9_]{1,39}$) before insert.
  source      text        not null,
  direction   text        not null default 'OUTBOUND'
                          check (direction in ('INBOUND', 'OUTBOUND')),
  -- Readable without color (DESIGN_SYSTEM): the label carries the state.
  status      text        not null
                          check (status in ('OK', 'FAILED')),
  -- What the delivery concerned — a lane slug, product slug, deployment id, or
  -- job ref. Free text, non-PII (this endpoint is not an identity surface).
  reference   text,
  -- Safe, non-PII metadata only (paths/tags revalidated, a short error label).
  -- Raw DB/exception strings are never stored or rendered (root CLAUDE.md).
  detail      jsonb       not null default '{}',
  occurred_at timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

-- WebhookHealth reads recent rows per source, newest first, and a bounded
-- recent window overall.
create index if not exists webhook_deliveries_source_time_idx
  on tower.webhook_deliveries (source, occurred_at desc);
create index if not exists webhook_deliveries_time_idx
  on tower.webhook_deliveries (occurred_at desc);
create index if not exists webhook_deliveries_status_idx
  on tower.webhook_deliveries (status);

-- ============================================================
-- 2 · RLS — group-admin read only; no authenticated write (F2).
-- ============================================================
alter table tower.webhook_deliveries enable row level security;

-- READ — group admin only (same posture as audit_log's select restriction).
-- is_group_admin() is the Wave-1 security-definer helper (DATABASE_SCHEMA.sql /
-- ADR-1 group-admin bypass).
create policy webhook_deliveries_read on tower.webhook_deliveries for select
  using ( tower.is_group_admin() );

-- No authenticated INSERT/UPDATE policy: writes happen only via the
-- service-role client (matches tower.events and whatsapp_messages). No DELETE
-- policy anywhere — append-only (Directive 4).

-- ============================================================
-- 3 · Grants (D-06: RLS and privileges are orthogonal). No DELETE grant.
-- ============================================================
-- SELECT to authenticated so the group-admin SELECT policy above actually has a
-- privilege to gate (a future RLS-client read is then correctly group-admin
-- scoped); the shipped read path still uses the service role (F2).
grant select on tower.webhook_deliveries to authenticated;
grant select, insert on tower.webhook_deliveries to service_role;
