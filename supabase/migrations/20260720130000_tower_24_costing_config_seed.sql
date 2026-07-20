-- tower_24 · Costing config seed + HS-code → Ad Valorem lookup (peru-costing G5).
-- Statutory constants live in versioned costing_config (single source of truth,
-- not per-operation input); the exchange rate stays per-operation (daily market
-- data). Ad Valorem is HS-code driven (Peru bands 0/6/11%) keyed on the
-- products.hs_code TOWER already stores, with a conservative 0% default and a
-- per-operation override retained in the calculator.

set search_path to tower;

-- Seed a v1 config for every brand that lacks one (idempotent).
insert into costing_config (brand_id, version, igv_bps, percepcion_bps, insurance_bps,
                            isc_threshold_cc, isc_low_bps, isc_high_bps, effective_from)
select b.id, 1, 1800, 350, 150, 1400, 500, 750, current_date
from brands b
where not exists (select 1 from costing_config c where c.brand_id = b.id and c.version = 1);

-- HS-code → Ad Valorem rate (longest-prefix match; '' = brand default).
create table if not exists ad_valorem_rates (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id),
  hs_prefix text not null,        -- '' matches everything (default); '8703' etc. for specifics
  bps int not null check (bps >= 0 and bps <= 10000),
  label text,
  updated_at timestamptz default now(),
  unique (brand_id, hs_prefix)
);

-- Conservative default: 0% for every brand. Ops populates specific HS bands
-- (6% = 600 bps, 11% = 1100 bps) as needed — no guessed mappings shipped.
insert into ad_valorem_rates (brand_id, hs_prefix, bps, label)
select b.id, '', 0, 'Predeterminado / Default (0%)'
from brands b
where not exists (select 1 from ad_valorem_rates r where r.brand_id = b.id and r.hs_prefix = '');

create trigger audit_ad_valorem_rates after insert or update or delete on ad_valorem_rates
  for each row execute function tower.audit_trigger();

-- RLS: any staff reads; only group admin edits the rate tables (brand-wide policy).
alter table ad_valorem_rates enable row level security;
create policy ad_valorem_read on ad_valorem_rates for select using ( auth.role() = 'authenticated' );
create policy ad_valorem_write on ad_valorem_rates for insert with check ( is_group_admin() );
create policy ad_valorem_update on ad_valorem_rates for update using ( is_group_admin() );

grant select, insert, update on ad_valorem_rates to authenticated;
