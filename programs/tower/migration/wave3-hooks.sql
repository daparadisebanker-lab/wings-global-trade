-- programs/tower/migration/wave3-hooks.sql
-- PROPOSED — NOT APPLIED. Written by Builder W3.C (ingestion hooks + the
-- ConversationPane data layer). Per this wave's brief: "DB is authoritative
-- and applied. Do NOT write DDL or to Supabase directly for schema changes" —
-- this file is an artifact for the Conductor to review and apply (e.g. via
-- Supabase MCP `apply_migration`), same pattern as Wave 1's DATABASE_SCHEMA.sql
-- and `programs/tower/migration/{import_catalog,rls_test}.sql`.
--
-- WHY THIS TABLE EXISTS: DATABASE_SCHEMA.sql has no WhatsApp storage at all.
-- `/api/hooks/whatsapp` (API_MAP) needs somewhere durable to land inbound
-- (and outbound) messages so <ConversationPane> can render a WhatsApp thread
-- the same way it renders a Mister transcript (COMPONENT_TREE.md
-- <ConversationPane>: "the record IS the conversation" — PRODUCT_BRIEF
-- "Conversational CRM"). The Mister half needs no new table — it reads the
-- existing `public.mister_projects.history` jsonb (Wave-1/mister-v2 system,
-- unrelated to this migration).
--
-- Run against the `tower` schema on the wings-global-trade Supabase project
-- (pyznlglvwihosemqkhtq), same as every other tower table.
set search_path to tower;

create table if not exists whatsapp_messages (
  id            uuid        primary key default gen_random_uuid(),
  -- Nullable: API_MAP "threads message onto matching account/RFQ (by
  -- number), else Triage Queue." An unmatched number lands with both FKs
  -- null — a human links it later; the hook never invents an RFQ without a
  -- lane to put it in (rfqs.lane_id is NOT NULL) and never invents an
  -- account from a bare, unconfirmed phone number.
  rfq_id        uuid        references rfqs(id) on delete set null,
  account_id    uuid        references accounts(id) on delete set null,
  direction     text        not null default 'INBOUND'
                            check (direction in ('INBOUND', 'OUTBOUND')),
  -- WhatsApp Business API / n8n provider message id. Unique + required:
  -- webhook redelivery is expected (at-least-once delivery), and this is the
  -- idempotency key the route uses to no-op a retry instead of duplicating.
  wa_message_id text        unique not null,
  from_number   text        not null,
  to_number     text        not null,
  body          text        not null,
  occurred_at   timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create index if not exists whatsapp_messages_rfq_id_idx     on whatsapp_messages(rfq_id);
create index if not exists whatsapp_messages_account_id_idx on whatsapp_messages(account_id);
create index if not exists whatsapp_messages_occurred_at_idx on whatsapp_messages(occurred_at);

alter table whatsapp_messages enable row level security;

-- Same lane-role read pattern as `products` (the DATABASE_SCHEMA.sql
-- template) — CLAUDE.md Directive 1: RLS is the permission system, never an
-- `if` in the app. A message not yet linked to an RFQ has no lane to gate
-- on, so it stays invisible to authenticated users until a human links it
-- (service role can always see it — that's how the Triage Queue UI would
-- read unlinked rows in a later wave).
create policy whatsapp_messages_read on whatsapp_messages for select
  using (
    rfq_id is not null
    and exists (
      select 1 from rfqs r
      where r.id = whatsapp_messages.rfq_id
        and has_lane_role(r.lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES','VIEWER'])
    )
  );

-- No authenticated-role write policy: inserts happen only via
-- /api/hooks/whatsapp's service-role client (matches the `tower.events`
-- pattern — "insert via service role only" per DATABASE_SCHEMA.sql's RLS
-- section). No delete policy anywhere (append-only, Directive 4).

-- Grants — orthogonal to RLS (D-06 in DECISIONS.log.md: a missing grant is
-- "permission denied for schema tower" regardless of policy correctness).
grant select on whatsapp_messages to authenticated;
grant select, insert, update on whatsapp_messages to service_role;

-- Audit trigger — FLAG FOR CONDUCTOR: every mutating table gets the generic
-- audit trigger before it gets a UI (CLAUDE.md Directive 4 / ARCHITECTURE
-- ADR-6). Wave 1 added this function directly via Supabase MCP
-- (DECISIONS.log.md: "production-Supabase spine ... executed in the main
-- thread") and it was never committed as a migration file in this worktree,
-- so its real name/signature isn't visible from the repo. Uncomment and fix
-- the function name below to match what Wave 1 actually applied (introspect
-- with `select tgname, tgrelid::regclass from pg_trigger where tgrelid =
-- 'tower.products'::regclass` if unsure), or apply the equivalent by hand:
--
-- create trigger whatsapp_messages_audit
--   after insert or update or delete on whatsapp_messages
--   for each row execute function tower.audit_trigger();
