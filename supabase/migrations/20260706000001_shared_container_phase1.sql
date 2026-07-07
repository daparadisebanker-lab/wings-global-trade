-- ============================================================
-- CONTENEDOR COMPARTIDO — "Trae tu grupo" — Phase 1 (MVP)
-- Migration: 20260706000001_shared_container_phase1.sql
-- Spec: programs/shared-container/wings-shared-container-spec.md §2
--
-- IDENTITY MODEL (decision, 2026-07-06): this app has never used Supabase
-- Auth. Members are identified by a signed token subject (`*_ref` text),
-- consistent with the session/service-role pattern of the Mister system.
-- The spec's `auth.users` FKs are therefore realized as `*_ref` text columns.
-- The "account" IS the signed token; the "magic link" IS the wa.me deep link.
--
-- RLS MODEL: service-role-only on every table (matching mister_* tables).
-- No anon-readable policies — the invite landing and workspace render
-- server-side via the service-role client, and an anon policy would let the
-- anon key enumerate invite tokens / private containers. Per-member scoping
-- ("members see their own rows + aggregate container state") is enforced in
-- the server data layer (lib/container/access.ts), which verifies the token
-- subject against member_ref before returning rows.
--
-- Phase 2 columns (deposits, hybrid, landing_slug) are present but unused in
-- Phase 1 so the schema does not need a breaking migration to open slots.
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================
DO $$ BEGIN
  CREATE TYPE container_mode AS ENUM ('private_group', 'public_slots', 'hybrid');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE container_status AS ENUM (
    'draft',          -- lead configuring
    'filling',        -- open for members/claims
    'soft_deadline',  -- fill deadline near; hybrid-open decision point (Phase 2)
    'closed',         -- fully committed, booking in progress
    'booked',         -- carrier booking confirmed
    'sailed',
    'arrived',        -- at Tacna / Iquique FTZ
    'cleared',        -- customs/FTZ clearance done
    'delivered',      -- all member cargo released
    'cancelled'       -- fallback executed
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE fallback_policy AS ENUM (
    'wings_tops_up',   -- Wings fills remaining CBM with own inventory
    'extend_once',     -- one deadline extension, then refund (launch default)
    'refund'           -- full deposit refund
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE member_role AS ENUM ('lead', 'member');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE slot_status AS ENUM (
    'invited',        -- invite link opened, not yet onboarded
    'joined',         -- identity created via WhatsApp opt-in
    'reserved',       -- slot held (deposit pending in Phase 2)
    'committed',      -- deposit paid / contract signed
    'paid_in_full',
    'released'        -- member exited before commitment
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================
-- CONTAINERS
-- ============================================================
CREATE TABLE IF NOT EXISTS containers (
  id                 uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  short_code         text              UNIQUE NOT NULL,        -- human ref in the wa.me text, e.g. 'AQP-4417'
  mode               container_mode    NOT NULL DEFAULT 'private_group',
  status             container_status  NOT NULL DEFAULT 'draft',
  route_origin       text              NOT NULL,               -- 'Ningbo, CN'
  route_destination  text              NOT NULL,               -- 'Tacna FTZ' | 'Iquique FTZ'
  container_type     text              NOT NULL DEFAULT '40HC',
  total_cbm          numeric(6,2)      NOT NULL,               -- usable CBM
  total_slots        int               NOT NULL,               -- marketing unit (e.g. 10)
  cbm_per_slot       numeric(6,2)      NOT NULL,               -- total_cbm / total_slots baseline
  slot_price_usd     numeric(10,2)     NOT NULL,               -- ALL-IN importation price per slot
  overage_per_cbm_usd numeric(10,2),                           -- published per-CBM overage rate (§7 open decision)
  price_includes     jsonb             NOT NULL DEFAULT '[]',  -- ['flete','seguro','zona franca','despacho'] — rendered verbatim
  fill_deadline      timestamptz       NOT NULL,
  fallback           fallback_policy   NOT NULL DEFAULT 'extend_once',
  lead_ref           text,                                     -- token subject of the lead; null for Wings-initiated public containers
  lead_name          text,                                     -- display name shown on the invite landing
  hybrid_opened_at   timestamptz,                              -- Phase 2: when a private group opened remaining slots
  landing_slug       text              UNIQUE,                 -- Phase 2 / hybrid public landing
  created_at         timestamptz       NOT NULL DEFAULT now(),
  updated_at         timestamptz       NOT NULL DEFAULT now(),
  CONSTRAINT containers_slots_positive CHECK (total_slots > 0),
  CONSTRAINT containers_cbm_positive   CHECK (total_cbm > 0)
);

CREATE INDEX IF NOT EXISTS containers_status_idx     ON containers(status);
CREATE INDEX IF NOT EXISTS containers_lead_ref_idx   ON containers(lead_ref);
CREATE INDEX IF NOT EXISTS containers_deadline_idx   ON containers(fill_deadline);

ALTER TABLE containers ENABLE ROW LEVEL SECURITY;
-- Service-role only (matching mister_* tables). The invite landing renders
-- server-side via the service-role client, so no anon-readable policy is
-- needed — and adding one would let the anon key enumerate every private
-- container (lead names, routes, prices). Phase 2's public marketplace will
-- introduce a scoped read path when it actually needs client reads.
-- Drop any earlier public-preview policy from a prior run of this migration.
DROP POLICY IF EXISTS "containers_public_preview" ON containers;

-- ============================================================
-- MEMBERSHIP & SLOTS
-- ============================================================
CREATE TABLE IF NOT EXISTS container_members (
  id                   uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id         uuid          NOT NULL REFERENCES containers ON DELETE CASCADE,
  member_ref           text          NOT NULL,                    -- signed token subject (identity)
  phone                text,                                       -- WhatsApp number (compliance anchor pair)
  display_name         text,
  role                 member_role   NOT NULL DEFAULT 'member',
  slot_status          slot_status   NOT NULL DEFAULT 'joined',
  slots_claimed        int           NOT NULL DEFAULT 1,          -- one member may take multiple slots
  cbm_allocated        numeric(6,2),                              -- actual, may differ from baseline
  cargo_description    text,                                       -- machinery item(s)
  cost_share_usd       numeric(10,2),                             -- CBM-proportional, recomputed server-side only
  deposit_usd          numeric(10,2)  NOT NULL DEFAULT 0,          -- Phase 2
  visibility_opt_in    boolean        NOT NULL DEFAULT false,      -- public slots: show identity to group?
  whatsapp_opted_in_at timestamptz,                               -- REQUIRED before any template send (Ley 29733 / WA policy)
  joined_via_invite_id uuid,
  created_at           timestamptz    NOT NULL DEFAULT now(),
  updated_at           timestamptz    NOT NULL DEFAULT now(),
  UNIQUE (container_id, member_ref),
  CONSTRAINT container_members_slots_positive CHECK (slots_claimed > 0)
);

CREATE INDEX IF NOT EXISTS container_members_container_idx ON container_members(container_id);
CREATE INDEX IF NOT EXISTS container_members_ref_idx       ON container_members(member_ref);

ALTER TABLE container_members ENABLE ROW LEVEL SECURITY;
-- No public policies: service role only. Per-member scoping in the server layer.

-- ============================================================
-- INVITATIONS (the "Trae tu grupo" mechanic)
-- ============================================================
CREATE TABLE IF NOT EXISTS container_invites (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id  uuid        NOT NULL REFERENCES containers ON DELETE CASCADE,
  created_by_ref text       NOT NULL,                 -- token subject of the creator (lead)
  token         text        UNIQUE NOT NULL,          -- short, unguessable, in the share URL
  max_uses      int,                                  -- null = until container fills
  uses          int         NOT NULL DEFAULT 0,
  revoked_at    timestamptz,                          -- lead can revoke; landing then shows "grupo cerrado"
  expires_at    timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS container_invites_token_idx     ON container_invites(token);
CREATE INDEX IF NOT EXISTS container_invites_container_idx ON container_invites(container_id);

ALTER TABLE container_invites ENABLE ROW LEVEL SECURITY;
-- Service-role only. Invite tokens are resolved by the server (service role)
-- filtering on the exact token from the URL; an anon SELECT policy here would
-- expose the entire token table (every private group is joinable by anyone
-- who lists it). Drop any earlier public policy from a prior run.
DROP POLICY IF EXISTS "container_invites_public_resolve" ON container_invites;

-- Attribution: every invite open/join is an acquisition event (viral coefficient)
CREATE TABLE IF NOT EXISTS invite_events (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_id  uuid        NOT NULL REFERENCES container_invites ON DELETE CASCADE,
  event      text        NOT NULL CHECK (event IN ('opened','wa_started','account_created','slot_reserved')),
  user_ref   text,                                    -- null until identity exists
  meta       jsonb       NOT NULL DEFAULT '{}',       -- utm / referrer / user-agent hints
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS invite_events_invite_idx ON invite_events(invite_id);
CREATE INDEX IF NOT EXISTS invite_events_event_idx  ON invite_events(event);

ALTER TABLE invite_events ENABLE ROW LEVEL SECURITY;
-- No public policies: attribution writes go through the server (service role).

-- ============================================================
-- MILESTONES & PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS container_milestones (
  id           uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id uuid              NOT NULL REFERENCES containers ON DELETE CASCADE,
  milestone    container_status  NOT NULL,
  occurred_at  timestamptz       NOT NULL DEFAULT now(),
  note         text,
  document_url text                                   -- BL, packing list, clearance docs
);

CREATE INDEX IF NOT EXISTS container_milestones_container_idx ON container_milestones(container_id);

ALTER TABLE container_milestones ENABLE ROW LEVEL SECURITY;
-- No public policies: service role only.

CREATE TABLE IF NOT EXISTS member_payments (
  id         uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id  uuid          NOT NULL REFERENCES container_members ON DELETE CASCADE,
  kind       text          NOT NULL CHECK (kind IN ('deposit','balance','adjustment','refund')),
  amount_usd numeric(10,2) NOT NULL,
  status     text          NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','refunded')),
  proof_url  text,                                    -- transfer receipt upload (Phase 1: manual confirm)
  created_at timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS member_payments_member_idx ON member_payments(member_id);

ALTER TABLE member_payments ENABLE ROW LEVEL SECURITY;
-- No public policies: service role only. Never expose another member's payments.

-- ============================================================
-- DOCUMENTS (per-member slice of the shared import)
-- ============================================================
CREATE TABLE IF NOT EXISTS member_documents (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id  uuid        NOT NULL REFERENCES container_members ON DELETE CASCADE,
  doc_type   text        NOT NULL,                    -- 'factura','packing','poder','ficha_ruc', ...
  url        text        NOT NULL,
  status     text        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS member_documents_member_idx ON member_documents(member_id);

ALTER TABLE member_documents ENABLE ROW LEVEL SECURITY;
-- No public policies: service role only.

-- ============================================================
-- UPDATED_AT TRIGGERS (set_updated_at() defined by an earlier migration)
-- ============================================================
DROP TRIGGER IF EXISTS set_containers_updated_at ON containers;
CREATE TRIGGER set_containers_updated_at
  BEFORE UPDATE ON containers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_container_members_updated_at ON container_members;
CREATE TRIGGER set_container_members_updated_at
  BEFORE UPDATE ON container_members
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- COST ALLOCATION — single source of truth (server-side only)
-- cost_share_usd = slot_price_usd × slots_claimed, plus an overage adjustment
-- when cbm_allocated exceeds the member's baseline (cbm_per_slot × slots_claimed),
-- billed at the container's published overage_per_cbm_usd rate.
-- Never computed client-side. This function is the canonical implementation;
-- the TS mirror in lib/container/cost.ts must match it exactly.
-- ============================================================
-- Row-form is the canonical implementation so the trigger can run BEFORE the
-- row exists in the table (BEFORE INSERT/UPDATE). The id-form delegates to it.
-- search_path pinned (advisor 0011: function_search_path_mutable).
CREATE OR REPLACE FUNCTION container_member_cost_share_row(m container_members)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  v_slot_price   numeric(10,2);
  v_cbm_per_slot numeric(6,2);
  v_overage_rate numeric(10,2);
  v_baseline_cbm numeric(6,2);
  v_base_cost    numeric(10,2);
  v_overage_cost numeric(10,2) := 0;
BEGIN
  SELECT c.slot_price_usd, c.cbm_per_slot, c.overage_per_cbm_usd
    INTO v_slot_price, v_cbm_per_slot, v_overage_rate
  FROM containers c
  WHERE c.id = m.container_id;

  IF v_slot_price IS NULL THEN
    RETURN NULL;
  END IF;

  v_base_cost    := v_slot_price * m.slots_claimed;
  v_baseline_cbm := v_cbm_per_slot * m.slots_claimed;

  IF m.cbm_allocated IS NOT NULL
     AND v_overage_rate IS NOT NULL
     AND m.cbm_allocated > v_baseline_cbm THEN
    v_overage_cost := (m.cbm_allocated - v_baseline_cbm) * v_overage_rate;
  END IF;

  RETURN v_base_cost + v_overage_cost;
END;
$$;

-- Id-form convenience wrapper (delegates to the row-form; identical math).
CREATE OR REPLACE FUNCTION container_member_cost_share(p_member_id uuid)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE m container_members;
BEGIN
  SELECT * INTO m FROM container_members WHERE id = p_member_id;
  IF NOT FOUND THEN RETURN NULL; END IF;
  RETURN container_member_cost_share_row(m);
END;
$$;

-- Recompute cost_share on any allocation/slot change. The application layer
-- still owns member notification when this value moves (spec §2, §4.4).
CREATE OR REPLACE FUNCTION container_members_sync_cost()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.cost_share_usd := container_member_cost_share_row(NEW);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_container_member_cost ON container_members;
CREATE TRIGGER sync_container_member_cost
  BEFORE INSERT OR UPDATE OF slots_claimed, cbm_allocated ON container_members
  FOR EACH ROW EXECUTE FUNCTION container_members_sync_cost();

-- ============================================================
-- SLOT ACCOUNTING — claimed / reserved / open, for the FillMeter and
-- the concurrent-claim guard (spec §4.4: "two members claim the last slot").
-- Returns claimed+reserved slot totals for a container in one round trip.
-- ============================================================
CREATE OR REPLACE FUNCTION container_slot_counts(p_container_id uuid)
RETURNS TABLE (committed_slots int, reserved_slots int, total_taken int)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    COALESCE(SUM(slots_claimed) FILTER (WHERE slot_status IN ('committed','paid_in_full')), 0)::int,
    COALESCE(SUM(slots_claimed) FILTER (WHERE slot_status IN ('reserved','joined')), 0)::int,
    COALESCE(SUM(slots_claimed) FILTER (WHERE slot_status <> 'released'), 0)::int
  FROM container_members
  WHERE container_id = p_container_id;
$$;
