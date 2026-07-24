-- TOWER · Mister Torre A3 — org_rules. The brand's commercial policy the quote run
-- reads instead of hardcoded constants: default margin (+ per-archetype overrides),
-- default incoterm, quote validity window, the approval matrix (artifact kind →
-- approving roles), and default ports. One editable config row per brand (unlike the
-- append-only rate/tariff tables, a policy row has a lifecycle → update is allowed).
set search_path to tower, public;

create table if not exists tower.org_rules (
  id                 uuid primary key default gen_random_uuid(),
  brand_id           uuid not null references tower.brands(id) unique,
  margin_default_bps int not null default 1800 check (margin_default_bps between 0 and 10000),
  -- archetype → margin bps overrides, e.g. {"EQUIPMENT":1800,"COMMODITY":1000}
  margin_rules       jsonb not null default '{}',
  incoterm_default   text not null default 'FOB' check (incoterm_default in ('EXW','FOB','CFR','CIF')),
  validity_days      int not null default 15 check (validity_days between 1 and 365),
  -- artifact kind → approving roles, e.g. {"COTIZACION":["LANE_DIRECTOR","SALES"]}
  approval_matrix    jsonb not null default '{}',
  ports_default      jsonb not null default '{}',
  updated_at         timestamptz not null default now(),
  created_at         timestamptz not null default now()
);

-- (no extra index: the unique(brand_id) constraint already provides the index.)

alter table tower.org_rules enable row level security;

create policy org_rules_read on tower.org_rules for select using (
  tower.has_brand_access(brand_id)
);
create policy org_rules_write on tower.org_rules for insert with check (
  tower.has_brand_role(brand_id, array['LANE_DIRECTOR'])
);
create policy org_rules_update on tower.org_rules for update using (
  tower.has_brand_role(brand_id, array['LANE_DIRECTOR'])
);
-- No delete policy (a brand always has exactly one policy row).

grant select, insert, update on tower.org_rules to authenticated;

drop trigger if exists audit_org_rules on tower.org_rules;
create trigger audit_org_rules
  after insert or update or delete on tower.org_rules
  for each row execute function tower.audit_trigger();

-- Keep updated_at honest on edits (the shared house idiom, tower_26).
drop trigger if exists set_updated_at_org_rules on tower.org_rules;
create trigger set_updated_at_org_rules
  before update on tower.org_rules
  for each row execute function tower.rb_set_updated_at();

-- Seed one policy row per brand lacking one (idempotent via the brand_id unique).
insert into tower.org_rules (brand_id, margin_default_bps, margin_rules, incoterm_default, validity_days, approval_matrix)
select b.id, 1800,
  '{"EQUIPMENT":1800,"PROJECT":1500,"COMMODITY":1000,"PROGRAM":1600,"CREDENTIAL":2000,"ORIGIN":1200}'::jsonb,
  'FOB', 15,
  -- Kept consistent with the ai_drafts UPDATE RLS (LANE_DIRECTOR/TRADE_OPS only): the
  -- matrix must not promise an approval role RLS will refuse. Broadening to SALES for
  -- client cotizaciones is a deliberate RLS change for a later item, not a seed lie.
  '{"COTIZACION":["LANE_DIRECTOR","TRADE_OPS"],"HOJA_COSTOS":["LANE_DIRECTOR","TRADE_OPS"],"COMUNICACION":["LANE_DIRECTOR","TRADE_OPS"]}'::jsonb
from tower.brands b
on conflict (brand_id) do nothing;
