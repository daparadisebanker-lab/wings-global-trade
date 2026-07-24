-- TOWER · Mister Torre A1 — rate_tables. Dated freight/insurance rates by route/
-- mode/container, so the quote run sources freight from a REAL, validity-bound table
-- instead of a mocked/operator-stated number (Directive 4: rates never from memory).
-- A lapsed valid_to becomes the rate-expiry blocker/watch signal. Money is integer
-- minor units + currency (Directive 3). RLS + audit mirror the tower conventions.
set search_path to tower, public;

create table if not exists tower.rate_tables (
  id             uuid primary key default gen_random_uuid(),
  brand_id       uuid not null references tower.brands(id),
  lane_id        uuid references tower.lanes(id),
  kind           text not null default 'FREIGHT' check (kind in ('FREIGHT', 'INSURANCE')),
  route          text not null,               -- e.g. 'CN-SHANGHAI>PE-CALLAO'
  mode           text not null default 'SEA' check (mode in ('SEA', 'AIR', 'LAND')),
  container_type text check (container_type in ('20GP', '40GP', '40HC', 'LCL', 'RORO')),
  rate_minor     bigint not null check (rate_minor >= 0),
  -- USD only until multi-currency freight is actually designed: the SUNAT engine
  -- consumes USD major units, so a non-USD rate would be miscosted (money law).
  currency       text not null default 'USD' check (currency in ('USD')),
  valid_from     date not null default current_date,
  valid_to       date,                          -- null = open-ended
  source         text,                          -- carrier / agent quote reference
  created_by     uuid references tower.profiles(id) default auth.uid(),
  created_at     timestamptz not null default now(),
  unique (brand_id, kind, route, mode, container_type, valid_from)
);

create index if not exists rate_tables_brand_kind_idx on tower.rate_tables (brand_id, kind, valid_to);
create index if not exists rate_tables_lane_idx on tower.rate_tables (lane_id);
create index if not exists rate_tables_route_idx on tower.rate_tables (route);

alter table tower.rate_tables enable row level security;

create policy rate_tables_read on tower.rate_tables for select using (
  case when lane_id is not null
    then tower.has_lane_role(lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES','VIEWER'])
    else tower.has_brand_access(brand_id) end
);
create policy rate_tables_write on tower.rate_tables for insert with check (
  case when lane_id is not null
    then tower.has_lane_role(lane_id, array['LANE_DIRECTOR','TRADE_OPS'])
    else tower.is_group_admin() end
);
-- Genuinely append-only (like cost_calculations): a rate a past quote's SourceRef
-- points at must never be rewritten in place. Supersede with a new dated row. So no
-- update policy and no update grant.

grant select, insert on tower.rate_tables to authenticated;

drop trigger if exists audit_rate_tables on tower.rate_tables;
create trigger audit_rate_tables
  after insert or update or delete on tower.rate_tables
  for each row execute function tower.audit_trigger();

-- Demo seed: a dated 40HC ocean freight for the Wings machinery lane, so the quote
-- run has a real, valid rate to source (the seeded demo container's route).
insert into tower.rate_tables (brand_id, lane_id, kind, route, mode, container_type, rate_minor, currency, valid_from, valid_to, source)
select b.id, l.id, 'FREIGHT', 'CN-SHANGHAI>PE-CALLAO', 'SEA', '40HC', 420000, 'USD', '2026-07-01', '2026-08-31', 'Demo carrier quote'
from tower.brands b
join tower.lanes l on l.brand_id = b.id and l.code = 'WGT/01'
where b.slug = 'wings'
on conflict do nothing;
