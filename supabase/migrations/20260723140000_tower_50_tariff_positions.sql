-- TOWER · Mister Torre A2 — tariff_positions. Real HS resolution: a curated table of
-- positions (duty + IGV, with keywords + verification) so the quote run resolves a
-- product to a position, and when 2+ match it PRESENTS the candidates and blocks
-- approval until a human chooses (spec-torre/03 "get_tariff → ambiguous → block").
-- Distinct from ad_valorem_rates (the engine's prefix rate table): this is the
-- classification/candidate layer. Duty/IGV in basis points; verification is provenance.
set search_path to tower, public;

create table if not exists tower.tariff_positions (
  id           uuid primary key default gen_random_uuid(),
  brand_id     uuid not null references tower.brands(id),
  hs_code      text not null,
  description  text not null,
  keywords     text[] not null default '{}',   -- ES/EN match terms
  duty_bps     int not null default 0 check (duty_bps between 0 and 10000),
  iva_bps      int not null default 1800 check (iva_bps between 0 and 10000),
  notes        text,
  verified_by  uuid references tower.profiles(id),
  verified_at  timestamptz,
  created_at   timestamptz not null default now(),
  unique (brand_id, hs_code)
);

create index if not exists tariff_positions_brand_idx on tower.tariff_positions (brand_id);

alter table tower.tariff_positions enable row level security;

create policy tariff_positions_read on tower.tariff_positions for select using (
  tower.has_brand_access(brand_id)
);
create policy tariff_positions_write on tower.tariff_positions for insert with check (
  tower.has_brand_role(brand_id, array['LANE_DIRECTOR','TRADE_OPS'])
);
create policy tariff_positions_update on tower.tariff_positions for update using (
  tower.has_brand_role(brand_id, array['LANE_DIRECTOR','TRADE_OPS'])
);
-- No delete policy — append-only.

grant select, insert, update on tower.tariff_positions to authenticated;

drop trigger if exists audit_tariff_positions on tower.tariff_positions;
create trigger audit_tariff_positions
  after insert or update or delete on tower.tariff_positions
  for each row execute function tower.audit_trigger();

-- Demo seed for the Wings machinery lane. 'excavadora' resolves to ONE position;
-- 'generador' deliberately matches TWO (ambiguous → the quote run blocks with both).
insert into tower.tariff_positions (brand_id, hs_code, description, keywords, duty_bps, iva_bps, verified_at)
select b.id, v.hs_code, v.description, v.keywords, v.duty_bps, 1800, '2026-07-01'::timestamptz
from tower.brands b
cross join (values
  ('8429.52.00.00', 'Excavadoras hidráulicas / Hydraulic excavators', array['excavadora','excavator','cat 320','retroexcavadora'], 0),
  ('8427.20.00.00', 'Montacargas autopropulsados / Self-propelled forklifts', array['montacargas','forklift','minicargador','skid steer'], 0),
  ('8502.13.00.00', 'Grupos electrógenos > 375 kVA / Generating sets', array['generador','generating','grupo electrogeno','genset'], 600),
  ('8502.20.00.00', 'Grupos electrógenos con motor de émbolo / Piston-engine gensets', array['generador','generating','grupo electrogeno','diesel generator'], 0),
  ('8479.89.00.00', 'Máquinas y aparatos mecánicos n.c.o.p. / Mechanical appliances nesoi', array['compresor','compressor','bomba','pump','mezcladora','mixer'], 0)
) as v(hs_code, description, keywords, duty_bps)
where b.slug = 'wings'
on conflict (brand_id, hs_code) do nothing;
