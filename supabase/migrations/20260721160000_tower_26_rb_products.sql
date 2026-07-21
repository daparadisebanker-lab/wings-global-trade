-- tower_26 · RB Console Wave 2 — represented-brand product shelf + specs.
-- (represented-brands-console SPEC §R3/R4 ledger; carved from DATA_MODEL.sql §2,
-- with the ALLOCATION spec-schema seed emitted inline and an updated_at trigger.)
--
-- Additive only (append-only law): a NEW brand-scoped product model that mirrors
-- tower.products' column vocabulary + DRAFT→IN_REVIEW→PUBLISHED→RETIRED lifecycle
-- but is scoped to a represented brand (never a lane, never tower.brands — root
-- §5-bis). Nothing shipped is altered destructively. PREREQ: tower_25_rb_console
-- (has_rb_role + rb_memberships) and tower_13 (spec_schemas).
--
-- Decision (SPEC §2.2, ruling): a parallel tower.rb_products table — NOT a
-- nullable represented_brand_id on tower.products — because tower.products carries
-- NOT-NULL brand_id + lane_id FKs and lane-role RLS that RB rows cannot satisfy.
-- Reuse is at the component/logic layer (SpecForm, status guards) via props.

set search_path to tower, public;

-- 2.1 rb_products — mirrors tower.products vocabulary, brand-scoped. slug joins
-- rb_packing_profiles.product_slug via (represented_brand_id, slug=product_slug);
-- the shipped global UNIQUE on product_slug is handled at authoring time (R12).
-- Numbers are brand assets: moq / cbm_per_unit are display; slot math is server-
-- side only. hs_code is the single regulatory home (never also a spec field, R1).
create table tower.rb_products (
  id                    uuid primary key default gen_random_uuid(),
  represented_brand_id  uuid not null references tower.represented_brands(id) on delete cascade,
  slug                  text not null,
  status                text not null default 'DRAFT'
                          check (status in ('DRAFT','IN_REVIEW','PUBLISHED','RETIRED')),
  category_path         text[] not null default '{}',
  name                  jsonb not null,               -- {es,en}
  specs                 jsonb not null default '{}',  -- ALLOCATION spec value — R1:
                                                      -- presentation fields ONLY (unitLabel,
                                                      -- description, highlights). Diagram
                                                      -- geometry lives in rb_diagram_specs (§4).
  spec_schema_id        uuid references tower.spec_schemas(id),
  hs_code               text,
  moq                   numeric,
  cbm_per_unit          numeric,
  created_by            uuid references tower.profiles(id),
  updated_at            timestamptz default now(),
  created_at            timestamptz default now(),
  unique (represented_brand_id, slug)
);
create index on tower.rb_products (represented_brand_id);
create index on tower.rb_products (status);

-- 2.2 Publish snapshots (append-only truth of what went public at each version).
create table tower.rb_product_versions (
  id            uuid primary key default gen_random_uuid(),
  rb_product_id uuid not null references tower.rb_products(id),
  version       int not null,
  snapshot      jsonb not null,
  published_by  uuid references tower.profiles(id),
  published_at  timestamptz default now(),
  unique (rb_product_id, version)
);
create index on tower.rb_product_versions (rb_product_id);

-- 2.3 RB product media. product_media's product_id FK targets tower.products
-- (tower_02) — an rb_products id would violate it, so RB gets a mirrored table.
create table tower.rb_product_media (
  id            uuid primary key default gen_random_uuid(),
  rb_product_id uuid not null references tower.rb_products(id) on delete cascade,
  storage_path  text not null,
  kind          text not null,
  sort          int not null default 0,
  meta          jsonb not null default '{}'
);
create index on tower.rb_product_media (rb_product_id);

-- 2.4 ALLOCATION spec-schema seed — the versioned archetype-default row that
-- getSpecSchema('ALLOCATION', …) resolves, so SpecForm can render RB specs.
-- REGENERATED from lib/schemas/spec/registry.ts (never hand-authored) — this is
-- specFieldsToJsonSchema('ALLOCATION', 1, ALLOCATION_SPEC_FIELDS) verbatim, same
-- convention + idempotent guard as tower_13. lane_id = null (no lane override).
insert into tower.spec_schemas (archetype, lane_id, version, json_schema)
select 'ALLOCATION', null, 1, $allocation_schema$
{"type":"object","x-archetype":"ALLOCATION","x-version":1,"properties":{"unitLabel":{"type":"string","x-localized":true,"x-label":{"es":"Etiqueta de unidad","en":"Unit label"},"x-order":0},"description":{"type":"string","x-localized":true,"x-label":{"es":"Descripción","en":"Description"},"x-order":1},"highlights":{"type":"array","items":{"type":"string"},"x-label":{"es":"Destacados","en":"Highlights"},"x-order":2}},"required":["unitLabel","description"]}
$allocation_schema$::jsonb
where not exists (
  select 1 from tower.spec_schemas where archetype = 'ALLOCATION' and lane_id is null and version = 1
)
on conflict (archetype, lane_id, version) do nothing;

-- 2.5 Public read seam — the site's only surface onto RB products. Includes gtin
-- from day one (R10), joined from rb_packing_profiles (its single-source home).
-- PUBLISHED products of LIVE brands only. Service-role read only (site loader
-- bypasses RLS); revoked from anon/authenticated — identical posture to the
-- shipped rb_public_* views.
create view public.rb_public_products as
  select p.id, p.slug, p.name, p.category_path, p.specs, p.hs_code, p.moq,
         p.cbm_per_unit, b.slug as brand_slug, pk.gtin
  from tower.rb_products p
  join tower.represented_brands b on b.id = p.represented_brand_id
  left join tower.rb_packing_profiles pk
    on pk.represented_brand_id = p.represented_brand_id
   and pk.product_slug = p.slug
  where p.status = 'PUBLISHED' and b.status = 'LIVE';
revoke all on public.rb_public_products from anon, authenticated;
grant select on public.rb_public_products to service_role;

-- 2.6 RLS — per-tenant scoping via has_rb_role (tower_25), the same regime the
-- shipped RB tables carry. Read: all three brand roles + group admin. Write:
-- BRAND_MANAGER / BRAND_OPS. NO delete policy anywhere (retire, never delete —
-- append-only law). Áladín/wings isolation is inherent: has_rb_role checks the
-- caller's rb_memberships for THIS brand, so a wings user never sees aladin rows
-- (they hold no membership on it) and vice-versa. Service-role site reads bypass RLS.
alter table tower.rb_products         enable row level security;
alter table tower.rb_product_versions enable row level security;
alter table tower.rb_product_media    enable row level security;

create policy rb_products_read on tower.rb_products for select
  using ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS','BRAND_VIEWER']) );
create policy rb_products_ins on tower.rb_products for insert
  with check ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) );
create policy rb_products_upd on tower.rb_products for update
  using ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) )
  with check ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) );

-- versions + media resolve the brand through the parent product (join-through-
-- parent, the shape tower_25 uses for rb_slot_allocations).
create policy rb_product_versions_read on tower.rb_product_versions for select
  using ( exists (select 1 from tower.rb_products p where p.id = rb_product_id
          and has_rb_role(p.represented_brand_id,
                          array['BRAND_MANAGER','BRAND_OPS','BRAND_VIEWER'])) );
create policy rb_product_versions_ins on tower.rb_product_versions for insert
  with check ( exists (select 1 from tower.rb_products p where p.id = rb_product_id
          and has_rb_role(p.represented_brand_id, array['BRAND_MANAGER','BRAND_OPS'])) );

create policy rb_product_media_read on tower.rb_product_media for select
  using ( exists (select 1 from tower.rb_products p where p.id = rb_product_id
          and has_rb_role(p.represented_brand_id,
                          array['BRAND_MANAGER','BRAND_OPS','BRAND_VIEWER'])) );
create policy rb_product_media_ins on tower.rb_product_media for insert
  with check ( exists (select 1 from tower.rb_products p where p.id = rb_product_id
          and has_rb_role(p.represented_brand_id, array['BRAND_MANAGER','BRAND_OPS'])) );
create policy rb_product_media_upd on tower.rb_product_media for update
  using ( exists (select 1 from tower.rb_products p where p.id = rb_product_id
          and has_rb_role(p.represented_brand_id, array['BRAND_MANAGER','BRAND_OPS'])) )
  with check ( exists (select 1 from tower.rb_products p where p.id = rb_product_id
          and has_rb_role(p.represented_brand_id, array['BRAND_MANAGER','BRAND_OPS'])) );

-- 2.7 updated_at — a BEFORE UPDATE trigger makes rb_products.updated_at
-- authoritative at the DB level (moddatetime is not enabled in this project;
-- a self-contained tower function keeps the migration dependency-free).
create or replace function tower.rb_set_updated_at() returns trigger
language plpgsql as $fn$
begin
  new.updated_at = now();
  return new;
end
$fn$;
create trigger rb_products_set_updated_at before update on tower.rb_products
  for each row execute function tower.rb_set_updated_at();

-- 2.8 Audit — the shipped per-table trigger (tower_07), attached to every new RB
-- table so all mutations land in tower.audit_log (never written by the actions).
create trigger audit_rb_products after insert or update or delete
  on tower.rb_products for each row execute function tower.audit_trigger();
create trigger audit_rb_product_versions after insert or update or delete
  on tower.rb_product_versions for each row execute function tower.audit_trigger();
create trigger audit_rb_product_media after insert or update or delete
  on tower.rb_product_media for each row execute function tower.audit_trigger();
