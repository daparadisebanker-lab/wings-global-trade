-- ============================================================
-- Mister AI Trade Intelligence System — v2
-- Migration: 20260627000001_mister_system.sql
-- Authoritative: spec/contributions/ai-engineer.md §8
-- Runbook: deploy atomically with feature/mister-v2 code push.
-- lead_flow enum ALTER is outside a transaction; deploy standalone first.
-- ============================================================

-- Extend lead_flow enum to include 'mister'
-- ALTER TYPE cannot run inside a transaction block in Postgres.
-- Supabase migrations run each file in its own transaction; the IF NOT EXISTS
-- guard makes this idempotent.
ALTER TYPE lead_flow ADD VALUE IF NOT EXISTS 'mister';

-- ============================================================
-- Enums for the Mister session model
-- ============================================================
DO $$ BEGIN
  CREATE TYPE mister_archetype AS ENUM (
    'lead_buyer', 'project_manager', 'logistics_manager',
    'reseller', 'wholesale_partner', 'unresolved'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE mister_stage AS ENUM (
    'induction', 'discovery', 'consideration', 'pre_qualification', 'support'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE mister_locale AS ENUM ('es-PE', 'en', 'nl', 'de');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================
-- Preserve old mister_projects if it exists with the old TPR schema.
-- We rename it to mister_projects_legacy so no data is lost.
-- ============================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mister_projects'
      AND column_name = 'product_description'
  ) THEN
    ALTER TABLE mister_projects RENAME TO mister_projects_legacy;
  END IF;
END $$;

-- ============================================================
-- mister_projects — one row per Mister v2 session
-- ============================================================
CREATE TABLE IF NOT EXISTS mister_projects (
  id                  uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id          text          UNIQUE NOT NULL,
  archetype           mister_archetype NOT NULL DEFAULT 'unresolved',
  archetype_history   jsonb         NOT NULL DEFAULT '[]',
  -- shape: [{ from: MisterArchetype, to: MisterArchetype, at: ISO8601 }]
  stage               mister_stage  NOT NULL DEFAULT 'induction',
  locale              mister_locale NOT NULL DEFAULT 'es-PE',
  current_page        text,
  current_product_id  uuid          REFERENCES products(id) ON DELETE SET NULL,
  collected           jsonb         NOT NULL DEFAULT '{}',
  -- shape: MisterCollected (destinationCountry, incoterm, containerType, volume, ruc, timeline, productInterest, budgetBand, notes)
  history             jsonb         NOT NULL DEFAULT '[]',
  -- shape: { role: 'user'|'assistant', content: string }[]
  -- server trims to last 15 turns before model call; full history (≤50) stored here
  turn_count          integer       NOT NULL DEFAULT 0,
  flags               text[]        NOT NULL DEFAULT '{}',
  -- entries: 'INJECTION:{timestamp}', 'GUARDRAIL:{pattern}:{timestamp}', 'TIGHTENED'
  in_flight           boolean       NOT NULL DEFAULT false,
  lead_id             uuid          REFERENCES leads(id) ON DELETE SET NULL,
  -- set when session converts to a lead (contact info submitted)
  created_at          timestamptz   NOT NULL DEFAULT now(),
  updated_at          timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mister_projects_session_id_idx  ON mister_projects(session_id);
CREATE INDEX IF NOT EXISTS mister_projects_archetype_idx   ON mister_projects(archetype);
CREATE INDEX IF NOT EXISTS mister_projects_stage_idx       ON mister_projects(stage);
CREATE INDEX IF NOT EXISTS mister_projects_created_at_idx  ON mister_projects(created_at DESC);

ALTER TABLE mister_projects ENABLE ROW LEVEL SECURITY;
-- No public policies: service role only.

DROP TRIGGER IF EXISTS set_mister_projects_updated_at ON mister_projects;
CREATE TRIGGER set_mister_projects_updated_at
  BEFORE UPDATE ON mister_projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- Add mister_project_id FK to leads (alongside existing accio_project_id)
-- ============================================================
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS mister_project_id uuid REFERENCES mister_projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS leads_mister_project_id_idx ON leads(mister_project_id);

-- ============================================================
-- mister_contacts — fetchContact source table
-- ============================================================
CREATE TABLE IF NOT EXISTS mister_contacts (
  id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text    NOT NULL,
  role        text    NOT NULL,
  category    text    NOT NULL CHECK (category IN ('sales','project','logistics','partnerships','key_accounts')),
  archetypes  text[]  NOT NULL DEFAULT '{}',
  -- which mister_archetype values this contact handles
  whatsapp    text    NOT NULL,
  email       text,
  is_active   boolean NOT NULL DEFAULT true,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE mister_contacts ENABLE ROW LEVEL SECURITY;
-- No public policies: service role only.

-- Seed: ops fallback (always present, no duplicate on re-run)
INSERT INTO mister_contacts (name, role, category, archetypes, whatsapp, sort_order)
VALUES (
  'Wings Global Trade',
  'Operaciones',
  'sales',
  ARRAY['lead_buyer','project_manager','logistics_manager','reseller','wholesale_partner','unresolved'],
  '+50760250735',
  999
) ON CONFLICT DO NOTHING;

-- ============================================================
-- mister_documents — fetchDocument source table
-- ============================================================
CREATE TABLE IF NOT EXISTS mister_documents (
  id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code    text    NOT NULL,
  -- ISO 3166-1 alpha-2 or 'ALL' for universal documents
  product_type    text    NOT NULL,
  -- 'ALL' or category slug or HS chapter
  title           text    NOT NULL,
  description_es  text,
  storage_path    text,
  -- Supabase Storage path (relative to bucket root)
  public_url      text,
  -- pre-signed URL or public URL
  is_available    boolean NOT NULL DEFAULT false,
  -- false until document is actually uploaded
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mister_documents_lookup_idx
  ON mister_documents(country_code, product_type);

ALTER TABLE mister_documents ENABLE ROW LEVEL SECURITY;
-- No public policies.

DROP TRIGGER IF EXISTS set_mister_documents_updated_at ON mister_documents;
CREATE TRIGGER set_mister_documents_updated_at
  BEFORE UPDATE ON mister_documents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- mister_quote_tokens — prefill tokens for quotation form
-- ============================================================
CREATE TABLE IF NOT EXISTS mister_quote_tokens (
  id            uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  token         text    UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  session_id    text    NOT NULL,
  prefill_data  jsonb   NOT NULL DEFAULT '{}',
  -- shape: Partial<MisterCollected> & { archetype, productIds? }
  used          boolean NOT NULL DEFAULT false,
  expires_at    timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mister_quote_tokens_token_idx       ON mister_quote_tokens(token);
CREATE INDEX IF NOT EXISTS mister_quote_tokens_session_id_idx  ON mister_quote_tokens(session_id);
CREATE INDEX IF NOT EXISTS mister_quote_tokens_expires_at_idx  ON mister_quote_tokens(expires_at);

ALTER TABLE mister_quote_tokens ENABLE ROW LEVEL SECURITY;
-- Public can read unexpired+unused tokens (for /cotizar page pre-fill).
DROP POLICY IF EXISTS "quote_token_public_read" ON mister_quote_tokens;
CREATE POLICY "quote_token_public_read" ON mister_quote_tokens
  FOR SELECT USING (used = false AND expires_at > now());
