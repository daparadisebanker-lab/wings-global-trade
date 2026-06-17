-- ============================================================
-- Wings Global Trade — Initial Schema
-- Source of truth: /spec/data-model.md
-- RLS enabled on every table. No public writes — server-side only.
-- ============================================================

-- ---------- Enums ----------
DO $$ BEGIN
  CREATE TYPE lead_flow AS ENUM ('catalog', 'accio', 'contact');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'closed_won', 'closed_lost');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE tpr_completeness AS ENUM ('partial', 'minimum', 'complete');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE notification_channel AS ENUM ('whatsapp', 'email');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed', 'retried');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ---------- updated_at trigger fn ----------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- categories
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           text UNIQUE NOT NULL,
  name_es        text NOT NULL,
  name_en        text NOT NULL,
  description_es  text,
  icon_key       text,
  sort_order     integer NOT NULL DEFAULT 0,
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "categories_public_read" ON categories;
CREATE POLICY "categories_public_read" ON categories
  FOR SELECT USING (is_active = true);

DROP TRIGGER IF EXISTS set_categories_updated_at ON categories;
CREATE TRIGGER set_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- products
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  slug            text UNIQUE NOT NULL,
  name_es         text NOT NULL,
  name_en         text NOT NULL,
  description_es   text NOT NULL,
  description_en   text,
  specs           jsonb NOT NULL DEFAULT '{}',
  source_markets  text[] NOT NULL DEFAULT '{}',
  images          text[] NOT NULL DEFAULT '{}',
  models          jsonb DEFAULT '[]',
  is_active       boolean NOT NULL DEFAULT true,
  sort_order      integer NOT NULL DEFAULT 0,
  meta_title_es   text,
  meta_desc_es    text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_category_id_idx ON products(category_id);
CREATE INDEX IF NOT EXISTS products_slug_idx ON products(slug);
CREATE INDEX IF NOT EXISTS products_is_active_idx ON products(is_active);
CREATE INDEX IF NOT EXISTS products_fts_idx ON products
  USING gin(to_tsvector('spanish', name_es || ' ' || description_es));

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_public_read" ON products;
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (is_active = true);

DROP TRIGGER IF EXISTS set_products_updated_at ON products;
CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- accio_projects (declared before leads for FK reference)
-- ============================================================
CREATE TABLE IF NOT EXISTS accio_projects (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_description    text NOT NULL,
  hs_code                text,
  hs_code_confirmed      boolean NOT NULL DEFAULT false,
  quantity               text NOT NULL,
  quantity_units         text,
  target_price_usd       numeric(12, 2),
  destination_country    text NOT NULL,
  destination_port       text,
  certifications         text[],
  tech_specs             jsonb DEFAULT '{}',
  packaging_requirements text,
  delivery_timeline      text,
  free_zone              text,
  source_market          text,
  fob_estimate_usd       numeric(12, 2),
  freight_estimate_usd   numeric(12, 2),
  insurance_estimate_usd numeric(12, 2),
  cif_total_usd          numeric(12, 2),
  duty_rate_pct          numeric(5, 2),
  duty_amount_usd        numeric(12, 2),
  free_zone_savings_pct  numeric(5, 2),
  estimate_generated_at  timestamptz,
  estimate_disclaimer    text NOT NULL DEFAULT 'Estimación preliminar sujeta a cotización formal.',
  completeness           tpr_completeness NOT NULL DEFAULT 'partial',
  missing_fields         text[],
  conversation_turns     integer NOT NULL DEFAULT 0,
  conversation_snapshot  jsonb DEFAULT '[]',
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS accio_projects_destination_country_idx ON accio_projects(destination_country);
CREATE INDEX IF NOT EXISTS accio_projects_created_at_idx ON accio_projects(created_at DESC);
CREATE INDEX IF NOT EXISTS accio_projects_completeness_idx ON accio_projects(completeness);

ALTER TABLE accio_projects ENABLE ROW LEVEL SECURITY;
-- No public policies: server-side only via service role key.

DROP TRIGGER IF EXISTS set_accio_projects_updated_at ON accio_projects;
CREATE TRIGGER set_accio_projects_updated_at BEFORE UPDATE ON accio_projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- leads
-- ============================================================
CREATE TABLE IF NOT EXISTS leads (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flow                  lead_flow NOT NULL,
  status                lead_status NOT NULL DEFAULT 'new',
  full_name             text NOT NULL,
  company               text,
  email                 text NOT NULL,
  phone                 text NOT NULL,
  destination_country   text NOT NULL,
  product_id            uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name_snapshot text,
  quantity              text,
  message               text,
  accio_project_id      uuid REFERENCES accio_projects(id) ON DELETE SET NULL,
  whatsapp_sent_at      timestamptz,
  whatsapp_error        text,
  email_sent_at         timestamptz,
  email_error           text,
  source_url            text,
  user_agent            text,
  ip_country            text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_flow_idx ON leads(flow);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads(email);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- No public policies: ops-only via service role key.

DROP TRIGGER IF EXISTS set_leads_updated_at ON leads;
CREATE TRIGGER set_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- notification_log
-- ============================================================
CREATE TABLE IF NOT EXISTS notification_log (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id        uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  channel        notification_channel NOT NULL,
  status         notification_status NOT NULL DEFAULT 'pending',
  recipient      text NOT NULL,
  payload        jsonb NOT NULL DEFAULT '{}',
  provider_id    text,
  error_message  text,
  attempts       integer NOT NULL DEFAULT 0,
  sent_at        timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notification_log_lead_id_idx ON notification_log(lead_id);
CREATE INDEX IF NOT EXISTS notification_log_status_idx ON notification_log(status);

ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;
-- No public policies: server-side only via service role key.
