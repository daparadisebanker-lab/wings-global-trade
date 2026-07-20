-- tower_23 · Peru costing persistence (peru-costing SPEC §4, Wave 6.2).
-- Stores SUNAT landed-cost calculations and prorrateo runs. The engine's numeric
-- output is frozen as a jsonb snapshot (audit record — never re-derived); the
-- queryable money columns are integer minor units + exchange rate as ×1000
-- integer (TOWER Directive 3 / ADR-7). Append-only (a re-run is a new row).
-- RLS via has_lane_role; audit trigger attached; grants inherited from the
-- schema default privileges (tower_11) and re-stated for clarity.

set search_path to tower;

-- ── Config rates (no magic numbers — mirrors the workbook CONFIG sheet) ──────
create table if not exists costing_config (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id),
  version int not null,
  igv_bps int not null default 1800,
  percepcion_bps int not null default 350,
  insurance_bps int not null default 150,
  isc_threshold_cc int not null default 1400,
  isc_low_bps int not null default 500,   -- ≤ threshold
  isc_high_bps int not null default 750,  -- > threshold
  effective_from date not null default current_date,
  created_at timestamptz default now(),
  unique (brand_id, version)
);

-- ── Saved cost sheet (the "history" record; re-run = new row) ────────────────
create table if not exists cost_calculations (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id),
  lane_id uuid not null references lanes(id),
  container_id uuid references containers(id),
  order_id uuid references orders(id),
  product_id uuid references products(id),
  config_version int,
  inputs jsonb not null,                 -- ImportInputs snapshot
  result jsonb not null,                 -- ImportResult snapshot (engine numbers)
  incoterm text not null,
  exchange_rate_milli int not null,      -- TC × 1000, integer (per-op data, not a rate)
  landed_minor bigint not null,
  cash_outlay_minor bigint not null,
  sale_price_minor bigint not null default 0,
  margin_minor bigint not null default 0,
  label text,
  created_by uuid references profiles(id) default auth.uid(),
  created_at timestamptz default now()
);
create index if not exists cost_calculations_lane_idx on cost_calculations (lane_id, created_at desc);
create index if not exists cost_calculations_container_idx on cost_calculations (container_id);

-- ── Prorrateo run + per-item results ────────────────────────────────────────
create table if not exists prorrateo_runs (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id),
  lane_id uuid not null references lanes(id),
  container_id uuid references containers(id),
  exchange_rate_milli int not null,
  gastos jsonb not null,                 -- GastoProrrateo[]
  created_by uuid references profiles(id) default auth.uid(),
  created_at timestamptz default now()
);
create table if not exists prorrateo_items (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references prorrateo_runs(id) on delete cascade,
  item jsonb not null,                   -- ItemProrrateo snapshot
  result jsonb not null,                 -- ResultadoItemProrrateo snapshot
  costo_total_minor bigint not null
);

-- ── Audit triggers ──────────────────────────────────────────────────────────
create trigger audit_cost_calculations after insert or update or delete on cost_calculations
  for each row execute function tower.audit_trigger();
create trigger audit_prorrateo_runs after insert or update or delete on prorrateo_runs
  for each row execute function tower.audit_trigger();
create trigger audit_costing_config after insert or update or delete on costing_config
  for each row execute function tower.audit_trigger();

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table cost_calculations enable row level security;
create policy cost_calc_read on cost_calculations for select
  using ( has_lane_role(lane_id, array['LANE_DIRECTOR','TRADE_OPS','SALES','CATALOG_EDITOR','VIEWER']) );
create policy cost_calc_write on cost_calculations for insert with check
  ( has_lane_role(lane_id, array['LANE_DIRECTOR','TRADE_OPS','SALES']) );

alter table prorrateo_runs enable row level security;
create policy prorrateo_runs_read on prorrateo_runs for select
  using ( has_lane_role(lane_id, array['LANE_DIRECTOR','TRADE_OPS','SALES','CATALOG_EDITOR','VIEWER']) );
create policy prorrateo_runs_write on prorrateo_runs for insert with check
  ( has_lane_role(lane_id, array['LANE_DIRECTOR','TRADE_OPS','SALES']) );

alter table prorrateo_items enable row level security;
create policy prorrateo_items_read on prorrateo_items for select
  using ( exists (select 1 from prorrateo_runs r where r.id = run_id
          and has_lane_role(r.lane_id, array['LANE_DIRECTOR','TRADE_OPS','SALES','CATALOG_EDITOR','VIEWER'])) );
create policy prorrateo_items_write on prorrateo_items for insert with check
  ( exists (select 1 from prorrateo_runs r where r.id = run_id
          and has_lane_role(r.lane_id, array['LANE_DIRECTOR','TRADE_OPS','SALES'])) );

-- Config: any staff reads; only group admin writes (rates are brand-wide policy).
alter table costing_config enable row level security;
create policy costing_config_read on costing_config for select using ( auth.role() = 'authenticated' );
create policy costing_config_write on costing_config for insert with check ( is_group_admin() );
create policy costing_config_update on costing_config for update using ( is_group_admin() );

-- Grants (default privileges from tower_11 already cover these; explicit for clarity).
grant select, insert, update on cost_calculations, prorrateo_runs, prorrateo_items, costing_config to authenticated;
