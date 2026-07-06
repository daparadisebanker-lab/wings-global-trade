-- TOWER · DATABASE_SCHEMA.sql · schema "tower" on the wings-global-trade Supabase project (pyznlglvwihosemqkhtq)
-- Conventions: uuid PKs, timestamptz, soft-retire via status, money = integer minor units,
-- every domain table carries brand_id + lane_id for RLS. Append-only audit on all mutations.

create schema if not exists tower;
set search_path to tower;

-- ============ IDENTITY & ACCESS ============
create table brands (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,            -- 'wings' | 'aladin' | future endorsed brands
  name text not null,
  created_at timestamptz default now()
);

create table lanes (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id),
  code text unique not null,            -- 'WGT/01' … append-only, never reused
  slug text not null,
  name text not null,
  archetype text not null check (archetype in
    ('EQUIPMENT','PROJECT','COMMODITY','PROGRAM','CREDENTIAL','ORIGIN')),
  status text not null default 'OPENING' check (status in ('OPENING','ACTIVE','ARCHIVED')),
  config jsonb not null default '{}',   -- mirror of lane.config.ts
  unique (brand_id, slug)
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  is_group_admin boolean not null default false,
  created_at timestamptz default now()
);

create table lane_memberships (
  user_id uuid not null references profiles(id) on delete cascade,
  lane_id uuid not null references lanes(id),
  role text not null check (role in
    ('LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES','VIEWER')),
  primary key (user_id, lane_id, role)
);

-- RLS helpers
create or replace function is_group_admin() returns boolean
language sql stable security definer as
$$ select coalesce((select is_group_admin from tower.profiles where id = auth.uid()), false) $$;

create or replace function has_lane_role(p_lane uuid, p_roles text[]) returns boolean
language sql stable security definer as
$$ select tower.is_group_admin() or exists (
     select 1 from tower.lane_memberships m
     where m.user_id = auth.uid() and m.lane_id = p_lane and m.role = any(p_roles)) $$;

-- ============ CATALOG (PIM) ============
create table spec_schemas (
  id uuid primary key default gen_random_uuid(),
  archetype text not null,
  lane_id uuid references lanes(id),    -- null = archetype default
  version int not null,
  json_schema jsonb not null,           -- exported from Zod; forms render from this
  created_at timestamptz default now(),
  unique (archetype, lane_id, version)
);

create table products (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id),
  lane_id uuid not null references lanes(id),
  slug text not null,
  status text not null default 'DRAFT'
    check (status in ('DRAFT','IN_REVIEW','PUBLISHED','RETIRED')),
  category_path text[] not null default '{}',      -- e.g. {'ffe','seating'}
  name jsonb not null,                              -- {"es": "...", "en": "..."}
  specs jsonb not null default '{}',                -- validated against spec_schemas
  spec_schema_id uuid references spec_schemas(id),
  hs_code text,
  moq numeric, cbm_per_unit numeric,
  created_by uuid references profiles(id),
  updated_at timestamptz default now(),
  unique (lane_id, slug)
);

create table product_versions (          -- snapshot on every publish; rollback source
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id),
  version int not null,
  snapshot jsonb not null,
  published_by uuid references profiles(id),
  published_at timestamptz default now(),
  unique (product_id, version)
);

create table product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  storage_path text not null,
  kind text not null check (kind in ('HERO','GALLERY','TECHNICAL','CERTIFICATE')),
  sort int not null default 0,
  meta jsonb default '{}'
);

-- ============ CRM (PIPELINE) ============
create table accounts (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id),
  name text not null,
  country text, region text,
  archetype_profile text,               -- dominant buying logic observed
  score int default 0,                  -- Intelligence lead score
  created_at timestamptz default now()
);

create table contacts (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  full_name text not null, email text, whatsapp text, role text
);

create table rfqs (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id),
  lane_id uuid not null references lanes(id),
  account_id uuid references accounts(id),
  source text not null check (source in ('MISTER','RFQ_FORM','WHATSAPP','MANUAL','ADVISOR')),
  stage text not null,                  -- validated in app against archetype stage set
  owner_id uuid references profiles(id),
  mister_session_id uuid,               -- FK to existing mister sessions table
  currency text default 'USD',
  created_at timestamptz default now()
);

create table rfq_lines (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references rfqs(id) on delete cascade,
  product_id uuid references products(id),
  description text,
  qty numeric not null,
  unit text not null,                   -- 'unit' | 'key' | 'pallet' | 'MT' | 'sku_program'
  target_price_minor bigint, currency text default 'USD'
);

create table quotes (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references rfqs(id),
  version int not null default 1,
  lines jsonb not null,
  total_minor bigint not null, currency text not null default 'USD',
  status text not null default 'DRAFT' check (status in ('DRAFT','SENT','ACCEPTED','REJECTED','EXPIRED')),
  valid_until date,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes(id),
  brand_id uuid not null, lane_id uuid not null references lanes(id),
  account_id uuid not null references accounts(id),
  status text not null default 'CONTRACTED'
    check (status in ('CONTRACTED','IN_PRODUCTION','READY','SHIPPED','DELIVERED','CLOSED','CANCELLED')),
  incoterm text, created_at timestamptz default now()
);

-- ============ ERP (CONTAINER DESK) ============
create table suppliers (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id),
  name text not null, country text, verified boolean default false,
  qc_history jsonb default '[]', lanes uuid[] default '{}'
);

create table containers (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null, lane_id uuid not null references lanes(id),
  code text unique not null,            -- internal program code, stencil-stamped in UI
  kind text not null default '40HC' check (kind in ('20GP','40GP','40HC','REEFER')),
  capacity_cbm numeric not null,
  mode text not null default 'DEDICATED' check (mode in ('DEDICATED','SHARED')),
  status text not null default 'OPEN'
    check (status in ('OPEN','FILLING','BOOKED','IN_TRANSIT','ARRIVED','CLEARED','CLOSED')),
  route jsonb default '{}',             -- origin port, destination, ETD/ETA
  public_fill_visible boolean default true,   -- feeds the site FillMeter
  created_at timestamptz default now()
);

create table container_commitments (    -- shared-container participants live here
  id uuid primary key default gen_random_uuid(),
  container_id uuid not null references containers(id) on delete cascade,
  order_id uuid references orders(id),
  account_id uuid references accounts(id),
  cbm numeric not null check (cbm > 0),
  status text not null default 'RESERVED' check (status in ('RESERVED','CONFIRMED','LOADED','RELEASED')),
  created_at timestamptz default now()
);

create table purchase_orders (
  id uuid primary key default gen_random_uuid(),
  container_id uuid references containers(id),
  supplier_id uuid not null references suppliers(id),
  lane_id uuid not null references lanes(id),
  lines jsonb not null,
  total_minor bigint not null, currency text not null default 'USD',
  status text not null default 'ISSUED'
    check (status in ('ISSUED','CONFIRMED','IN_PRODUCTION','QC_PENDING','QC_PASSED','SHIPPED','CANCELLED'))
);

create table qc_checks (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references purchase_orders(id),
  checkpoint text not null, result text check (result in ('PASS','FAIL','CONDITIONAL')),
  evidence jsonb default '[]',          -- storage paths
  checked_by uuid references profiles(id), checked_at timestamptz
);

create table trade_documents (
  id uuid primary key default gen_random_uuid(),
  container_id uuid references containers(id),
  order_id uuid references orders(id),
  kind text not null,                   -- 'BL','PACKING_LIST','CO','PHYTO','INVOICE','CERT',…
  storage_path text not null,
  uploaded_by uuid references profiles(id), uploaded_at timestamptz default now()
);

create table landed_costs (             -- one row per container; computed server-side
  container_id uuid primary key references containers(id),
  fob_minor bigint, freight_minor bigint, insurance_minor bigint,
  duties_minor bigint, handling_minor bigint,     -- incl. free-zone handling
  currency text not null default 'USD',
  computed_at timestamptz default now()
);

-- ============ SIGNALS (ANALYTICS) ============
create table events (
  id bigint generated always as identity,
  occurred_at timestamptz not null default now(),
  brand_slug text not null, lane_slug text not null,
  session_hash text not null,           -- anonymous; no PII
  event text not null,                  -- 'page_view','product_view','spec_open',
                                        -- 'fillmeter_interact','mister_start','mister_complete',
                                        -- 'rfq_submit','whatsapp_handoff'
  product_slug text, path text, meta jsonb default '{}',
  primary key (id, occurred_at)
) partition by range (occurred_at);
-- n8n/pg_cron creates monthly partitions + refreshes rollups:

create materialized view metric_rollups_daily as
select date_trunc('day', occurred_at) as day, brand_slug, lane_slug, event,
       product_slug, count(*) as n, count(distinct session_hash) as sessions
from events group by 1,2,3,4,5;

-- ============ OPS ============
create table tasks (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null, lane_id uuid references lanes(id),
  ref_table text, ref_id uuid,          -- polymorphic link (rfq, container, product…)
  title text not null, assignee_id uuid references profiles(id),
  due_date date, status text default 'OPEN' check (status in ('OPEN','DONE','CANCELLED'))
);

create table audit_log (
  id bigint generated always as identity primary key,
  at timestamptz default now(),
  actor uuid, table_name text not null, row_id uuid,
  action text not null check (action in ('INSERT','UPDATE','DELETE')),
  before jsonb, after jsonb
);
-- Generic trigger fn attached to every mutating table (see BUILD_PROMPT).

-- ============ RLS (pattern — apply to every domain table) ============
alter table products enable row level security;

create policy products_read on products for select
  using ( has_lane_role(lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES','VIEWER']) );

create policy products_write on products for insert with check
  ( has_lane_role(lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR']) );

create policy products_update on products for update
  using ( has_lane_role(lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR']) )
  with check (
    -- only Lane Directors may set PUBLISHED / RETIRED
    case when status in ('PUBLISHED','RETIRED')
         then has_lane_role(lane_id, array['LANE_DIRECTOR'])
         else true end );

-- Same pattern: rfqs/quotes/orders → SALES + LANE_DIRECTOR write;
-- containers/purchase_orders/qc/documents → TRADE_OPS + LANE_DIRECTOR write;
-- events → insert via service role only; selects via rollups.
-- audit_log: insert-only via trigger; select restricted to group admin.
