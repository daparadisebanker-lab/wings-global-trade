-- ============================================================================
-- Represented-Brands Console — CONSOLIDATED additive tower-schema delta
-- Program: programs/represented-brands-console/ (PROPOSAL — not applied)
--
-- Assumes shipped and NEVER altered destructively:
--   20260710120000_rb_wave1.sql        (represented_brands, rb_packing_profiles,
--                                       rb_container_templates, rb_containers,
--                                       rb_slot_allocations, rb_slots_taken,
--                                       rb_reserve, 3 public.rb_public_* views)
--   tower_01..tower_24                 (identity/access, catalog, pipeline,
--                                       audit spine, quotation, costing)
--
-- This file is the single deduped authority (SPEC §R3). At build time it is
-- carved verbatim into five numbered migrations — section markers below:
--   §1 → tower_25_rb_console      §2 → tower_26_rb_catalog
--   §3 → tower_27_rb_availability §4 → tower_28_rb_diagrams
--   §5 → tower_29_rb_outputs
-- Codes append-only: if unrelated migrations land first, shift the whole chain.
--
-- Laws: additive only; per-command RLS policies (no `for all`); NO DELETE policy
-- on any domain table (append-only; memberships are the sole exception);
-- tower.audit_trigger() attached to every new/RB table; money integer-minor+bps
-- only (this delta adds ZERO money columns); service-role site reads bypass RLS.
-- ============================================================================


-- ############################################################################
-- §1 · tower_25_rb_console — tenancy + RLS on shipped RB tables + audit
--      (Chapter 01; rulings R5-partial, R10, R15 context)
-- ############################################################################
set search_path to tower, public;

-- 1.1 Multi-rep membership (mirror of lane_memberships, brand-scoped)
create table if not exists rb_memberships (
  user_id              uuid not null references profiles(id) on delete cascade,
  represented_brand_id uuid not null references represented_brands(id) on delete cascade,
  role text not null check (role in ('BRAND_MANAGER','BRAND_OPS','BRAND_VIEWER')),
  primary key (user_id, represented_brand_id, role)
);
create index if not exists rb_memberships_brand_idx on rb_memberships (represented_brand_id);

-- RLS mandatory (tower_11 default grants + tower_21 PostgREST exposure would
-- otherwise let any staff user self-grant). Read own-or-admin; write admin-only.
-- DELETE policy required: setRepresentedBrandMemberships does real deletes
-- (memberships are NOT append-only — the one sanctioned delete surface).
alter table rb_memberships enable row level security;
create policy rb_memberships_read on rb_memberships for select
  using ( user_id = auth.uid() or is_group_admin() );
create policy rb_memberships_admin_ins on rb_memberships for insert
  with check ( is_group_admin() );
create policy rb_memberships_admin_upd on rb_memberships for update
  using ( is_group_admin() ) with check ( is_group_admin() );
create policy rb_memberships_admin_del on rb_memberships for delete
  using ( is_group_admin() );

-- 1.2 The scoping predicate — byte-for-byte the has_lane_role shape
create or replace function has_rb_role(p_brand uuid, p_roles text[]) returns boolean
language sql stable security definer set search_path = tower, public as
$$ select is_group_admin() or exists (
     select 1 from rb_memberships m
     where m.user_id = auth.uid()
       and m.represented_brand_id = p_brand
       and m.role = any(p_roles)) $$;

-- 1.3 Per-tenant RLS on the five shipped RB tables (deny-all → scoped).
-- Column revoke: status + kit_complete are the publish gate — service-role
-- writer only (canTransitionRbStatus / saveBrandKit validators live in TS;
-- the revoke is what makes the DB refuse a bypassing PostgREST PATCH).
revoke update (status, kit_complete) on represented_brands from authenticated;

create policy rb_brands_read on represented_brands for select
  using ( has_rb_role(id, array['BRAND_MANAGER','BRAND_OPS','BRAND_VIEWER']) );
create policy rb_brands_upd on represented_brands for update
  using ( has_rb_role(id, array['BRAND_MANAGER']) )
  with check ( has_rb_role(id, array['BRAND_MANAGER']) );
-- (no insert policy: brand creation is group-admin/service-role; no delete: append-only)

create policy rb_profiles_read on rb_packing_profiles for select
  using ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS','BRAND_VIEWER']) );
create policy rb_profiles_ins on rb_packing_profiles for insert
  with check ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) );
create policy rb_profiles_upd on rb_packing_profiles for update
  using ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) )
  with check ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) );

create policy rb_templates_read on rb_container_templates for select
  using ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS','BRAND_VIEWER']) );
create policy rb_templates_ins on rb_container_templates for insert
  with check ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) );
create policy rb_templates_upd on rb_container_templates for update
  using ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) )
  with check ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) );

create policy rb_containers_read on rb_containers for select
  using ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS','BRAND_VIEWER']) );
create policy rb_containers_ins on rb_containers for insert
  with check ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) );
create policy rb_containers_upd on rb_containers for update
  using ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) )
  with check ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) );

-- allocations: no represented_brand_id — resolve brand through the container
-- (join-through-parent, same shape as tower_23 prorrateo_items).
create policy rb_alloc_read on rb_slot_allocations for select
  using ( exists (select 1 from rb_containers c where c.id = rb_container_id
          and has_rb_role(c.represented_brand_id,
                          array['BRAND_MANAGER','BRAND_OPS','BRAND_VIEWER'])) );
-- NOTE: the allocation UPDATE policy lives in §3 (R5) beside the status machine
-- it exists to serve; inserts remain rb_reserve-only (SECURITY DEFINER path).

-- 1.4 Audit triggers — close the append-only gap on the shipped RB tables
-- (tower_07's tbls[] predates rb_wave1). ONE attachment point for all five;
-- §2/§4 attach their own new tables; §3 attaches nothing (deduped here).
do $do$ declare t text;
  tbls text[] := array['represented_brands','rb_packing_profiles',
                       'rb_container_templates','rb_containers','rb_slot_allocations'];
begin
  foreach t in array tbls loop
    execute format('drop trigger if exists audit_%1$s on tower.%1$I', t);
    execute format(
      'create trigger audit_%1$s after insert or update or delete on tower.%1$I '
      'for each row execute function tower.audit_trigger()', t);
  end loop;
end $do$;

-- 1.5 Widen public.rb_public_brands (view replace = additive; the ONLY shipped
-- view this program changes — R10). mandate is projected public-safe (never the
-- raw column: it carries private document refs).
create or replace view public.rb_public_brands as
select b.code, b.slug, b.name, b.categories,
       b.identity,                                  -- --rb-* tokens + logo + photography
       jsonb_build_object(
         'territory',   b.mandate -> 'territory',
         'scope',       b.mandate -> 'scope',
         'exclusivity', b.mandate -> 'exclusivity'
       ) as mandate_public,
       b.content                                    -- about/story, ES+EN
from tower.represented_brands b
where b.status = 'LIVE';
grant select on public.rb_public_brands to service_role;


-- ############################################################################
-- §2 · tower_26_rb_catalog — RB product shelf (Chapter 02; R1, R8, R10, R12)
--      PREREQ: §1 (has_rb_role).
-- ############################################################################

-- 2.1 rb_products — mirrors tower.products vocabulary, brand-scoped (never a
-- nullable lane on tower.products; never overload tower.brands — root §5-bis).
create table tower.rb_products (
  id                    uuid primary key default gen_random_uuid(),
  represented_brand_id  uuid not null references tower.represented_brands(id) on delete cascade,
  slug                  text not null,               -- joins rb_packing_profiles.product_slug
                                                     -- via (represented_brand_id, slug=product_slug);
                                                     -- global-UNIQUE collision handled per R12
                                                     -- (authoring-time guard, brand-qualified convention)
  status                text not null default 'DRAFT'
                          check (status in ('DRAFT','IN_REVIEW','PUBLISHED','RETIRED')),
  category_path         text[] not null default '{}',
  name                  jsonb not null,              -- {es,en}
  specs                 jsonb not null default '{}', -- ALLOCATION spec value — R1: presentation
                                                     -- fields ONLY (unit_label, spec_rows,
                                                     -- description, highlights). Diagram geometry
                                                     -- lives in rb_diagram_specs (§4), never here.
  spec_schema_id        uuid references tower.spec_schemas(id),
  hs_code               text,                        -- single regulatory home (not a spec field)
  moq                   numeric,                     -- display; slot math stays server-side
  cbm_per_unit          numeric,
  created_by            uuid references tower.profiles(id),
  updated_at            timestamptz default now(),
  created_at            timestamptz default now(),
  unique (represented_brand_id, slug)
);
create index on tower.rb_products (represented_brand_id);
create index on tower.rb_products (status);

-- 2.2 Publish snapshots (append-only truth of what went public)
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

-- 2.3 RB product media (product_media's FK targets tower.products — mirrored table)
create table tower.rb_product_media (
  id            uuid primary key default gen_random_uuid(),
  rb_product_id uuid not null references tower.rb_products(id) on delete cascade,
  storage_path  text not null,
  kind          text not null,
  sort          int not null default 0,
  meta          jsonb not null default '{}'
);
create index on tower.rb_product_media (rb_product_id);

-- 2.4 ALLOCATION spec-schema seed — REGENERATED from registry.ts (never hand-
-- authored; same convention as tower_13). Idempotent guard; R1 field set only.
--   insert into tower.spec_schemas (archetype, lane_id, version, json_schema)
--   select 'ALLOCATION', null, 1, $allocation_schema$ {…machine-emitted from
--   specFieldsToJsonSchema(ALLOCATION_SPEC_FIELDS)…} $allocation_schema$::jsonb
--   where not exists (select 1 from tower.spec_schemas
--     where archetype='ALLOCATION' and lane_id is null and version=1);

-- 2.5 Public read seam — includes gtin from day one (R10: absorbs Ch 05 §5's
-- amendment; joined from rb_packing_profiles, its single-source home).
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

-- 2.6 RLS — per-command (house style; Ch 02's `for all` shorthand superseded),
-- no delete anywhere (retire, never delete).
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

-- 2.7 Audit
create trigger audit_rb_products after insert or update or delete
  on tower.rb_products for each row execute function tower.audit_trigger();
create trigger audit_rb_product_versions after insert or update or delete
  on tower.rb_product_versions for each row execute function tower.audit_trigger();
create trigger audit_rb_product_media after insert or update or delete
  on tower.rb_product_media for each row execute function tower.audit_trigger();


-- ############################################################################
-- §3 · tower_27_rb_availability — ledger lifecycle + availability (Chapter 03;
--      R5, R19). PREREQ: §1 policies. Audit triggers already attached in §1.4.
-- ############################################################################

-- 3.1 R5: the UPDATE policy rb_set_allocation_status runs under (Ch 01 shipped
-- read-only; without this the function's UPDATE matches zero rows for reps).
-- Column revoke preserves the append-only intent: the RLS path may move ONLY
-- status/expires_at (+ §5's order_id/quote_id links); slot counts and bindings
-- stay writable solely by the SECURITY DEFINER rb_reserve path.
revoke update (slots, quantity_units, rb_container_id, lead_id)
  on tower.rb_slot_allocations from authenticated;
create policy rb_alloc_upd on tower.rb_slot_allocations for update
  using ( exists (select 1 from tower.rb_containers c where c.id = rb_container_id
          and has_rb_role(c.represented_brand_id, array['BRAND_MANAGER','BRAND_OPS'])) )
  with check ( exists (select 1 from tower.rb_containers c where c.id = rb_container_id
          and has_rb_role(c.represented_brand_id, array['BRAND_MANAGER','BRAND_OPS'])) );

-- 3.2 Allocation status machine — forward-only, NOT security definer: the
-- UPDATE inside is gated by rb_alloc_upd above (+ the column revoke).
create or replace function tower.rb_set_allocation_status(
  p_allocation uuid, p_to text
) returns tower.rb_slot_allocations
language plpgsql as $$
declare v_row tower.rb_slot_allocations;
begin
  select * into v_row from tower.rb_slot_allocations
    where id = p_allocation for update;            -- row lock, rb_reserve discipline
  if not found then raise exception 'RB_ALLOCATION_NOT_FOUND'; end if;
  -- Legal moves only: RESERVED→{CONFIRMED,RELEASED}, CONFIRMED→{LOADED,RELEASED}.
  -- LOADED/RELEASED terminal; no reverse, no skip (canTransition* guard law).
  if not (   (v_row.status = 'RESERVED'  and p_to in ('CONFIRMED','RELEASED'))
          or (v_row.status = 'CONFIRMED' and p_to in ('LOADED','RELEASED')) ) then
    raise exception 'RB_INVALID_TRANSITION';
  end if;
  update tower.rb_slot_allocations
     set status = p_to, expires_at = null          -- no legal target can expire
   where id = p_allocation
   returning * into v_row;
  return v_row;
end $$;
-- TOWER-only: no public.* wrapper. Site's sole write stays public.rb_reserve.

-- 3.3 Expiry sweep — hygiene, not correctness (rb_slots_taken already ignores
-- expired rows). SECURITY DEFINER: cron runs as no rep, must sweep every brand.
create or replace function tower.rb_release_expired() returns int
language sql security definer set search_path = tower, public as $$
  with released as (
    update tower.rb_slot_allocations
       set status = 'RELEASED'
     where status = 'RESERVED'
       and expires_at is not null and expires_at <= now()
     returning 1
  ) select count(*)::int from released;
$$;
revoke all on function tower.rb_release_expired() from public, anon, authenticated;
grant execute on function tower.rb_release_expired() to service_role;

-- R19: pg_cron owns the schedule (precedent tower_09); n8n only WATCHES
-- (daily count of RESERVED rows expired >24h → alert ops if >0).
select cron.schedule('rb_release_expired_hourly', '17 * * * *',
                     $$select tower.rb_release_expired()$$);

-- 3.4 Availability view — security_invoker so §1.3 RLS scopes each rep;
-- reuses rb_slots_taken (the one subtraction), derives the dropped denorms.
-- TOWER-only: never on the site read path. composition[0] join = R11 rule,
-- same as the shipped rb_public_templates.
create or replace view tower.rb_container_availability
  with (security_invoker = true) as
select
  c.id, c.code, c.status, c.route, c.closes_at, c.public_fill_visible,
  c.represented_brand_id, b.slug as brand_slug,
  t.ref as template_ref, t.total_slots, t.packages_per_slot,
  tower.rb_slots_taken(c.id)                       as slots_taken,
  t.total_slots - tower.rb_slots_taken(c.id)       as slots_available,
  coalesce((select sum(a.slots) from tower.rb_slot_allocations a
             where a.rb_container_id = c.id
               and a.status in ('CONFIRMED','LOADED')), 0)::int as committed_slots,
  coalesce((select sum(a.slots) from tower.rb_slot_allocations a
             where a.rb_container_id = c.id
               and a.status = 'RESERVED'
               and (a.expires_at is null or a.expires_at > now())), 0)::int as reserved_slots,
  (t.packages_per_slot * p.units_per_package)      as units_per_slot,
  (t.total_slots - tower.rb_slots_taken(c.id))
      * (t.packages_per_slot * p.units_per_package) as units_available,
  p.unit_name_plural
from tower.rb_containers c
join tower.rb_container_templates t on t.id = c.template_id
join tower.represented_brands b     on b.id = c.represented_brand_id
join tower.rb_packing_profiles p
  on p.product_slug = (t.composition -> 0 ->> 'profile_slug');  -- R11: composition[0]
revoke all on tower.rb_container_availability from anon;
grant select on tower.rb_container_availability to authenticated, service_role;


-- ############################################################################
-- §4 · tower_28_rb_diagrams — parametric diagram-spec store (Chapter 04,
--      REBASED per R2: has_rb_role RLS, not deny-all/group-admin). PREREQ: §1.
-- ############################################################################

-- One home for SKU drawing geometry (R1). N specs per SKU (profile is 1-row);
-- presentation choice kept out of the immutable logistics profile.
create table tower.rb_diagram_specs (
  id                    uuid primary key default gen_random_uuid(),
  represented_brand_id  uuid not null
                          references tower.represented_brands(id) on delete cascade,
  product_slug          text not null,             -- joins rb_packing_profiles.product_slug
                                                   -- via (represented_brand_id, product_slug) — R12
  model_id              text not null
                          check (model_id in ('caja-master','pallet-stack')),
                          -- exploded view rides caja-master's params.exploded{axis,caption};
                          -- container-cupos / container-fit are runtime projections, never stored
  params                jsonb not null default '{}',-- validated by the @wings/trade-ui Zod registry
  status                text not null default 'DRAFT'
                          check (status in ('DRAFT','PUBLISHED','RETIRED')),
                          -- two-state + retire; R17: publish refused unless parent
                          -- rb_products row is PUBLISHED (review happens at product level)
  version               int  not null default 1,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),
  unique (represented_brand_id, product_slug, model_id)
);
create index rb_diagram_specs_brand_idx on tower.rb_diagram_specs (represented_brand_id);
create index rb_diagram_specs_slug_idx  on tower.rb_diagram_specs (product_slug);

create trigger rb_diagram_specs_moddatetime
  before update on tower.rb_diagram_specs
  for each row execute function extensions.moddatetime(updated_at);

create table tower.rb_diagram_spec_versions (
  id            uuid primary key default gen_random_uuid(),
  spec_id       uuid not null references tower.rb_diagram_specs(id) on delete cascade,
  version       int  not null,
  model_id      text not null,
  params        jsonb not null,
  snapshot_at   timestamptz default now(),
  snapshot_by   uuid default auth.uid(),           -- R2: real under the RLS client
  unique (spec_id, version)
);

-- RLS (R2): same regime as §2 — read all roles, write MANAGER/OPS, no delete.
alter table tower.rb_diagram_specs         enable row level security;
alter table tower.rb_diagram_spec_versions enable row level security;

create policy rb_diagram_specs_read on tower.rb_diagram_specs for select
  using ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS','BRAND_VIEWER']) );
create policy rb_diagram_specs_ins on tower.rb_diagram_specs for insert
  with check ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) );
create policy rb_diagram_specs_upd on tower.rb_diagram_specs for update
  using ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) )
  with check ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) );

create policy rb_diagram_spec_versions_read on tower.rb_diagram_spec_versions for select
  using ( exists (select 1 from tower.rb_diagram_specs d where d.id = spec_id
          and has_rb_role(d.represented_brand_id,
                          array['BRAND_MANAGER','BRAND_OPS','BRAND_VIEWER'])) );
create policy rb_diagram_spec_versions_ins on tower.rb_diagram_spec_versions for insert
  with check ( exists (select 1 from tower.rb_diagram_specs d where d.id = spec_id
          and has_rb_role(d.represented_brand_id, array['BRAND_MANAGER','BRAND_OPS'])) );

-- Audit
create trigger audit_rb_diagram_specs
  after insert or update or delete on tower.rb_diagram_specs
  for each row execute function tower.audit_trigger();
create trigger audit_rb_diagram_spec_versions
  after insert or update or delete on tower.rb_diagram_spec_versions
  for each row execute function tower.audit_trigger();

-- Public seam (second NEW view — R10)
create view public.rb_public_diagrams as
  select b.slug as brand_slug, d.product_slug, d.model_id, d.params
  from tower.rb_diagram_specs d
  join tower.represented_brands b on b.id = d.represented_brand_id
  where d.status = 'PUBLISHED' and b.status = 'LIVE';
revoke all on public.rb_public_diagrams from anon, authenticated;
grant select on public.rb_public_diagrams to service_role;


-- ############################################################################
-- §5 · tower_29_rb_outputs — allocation↔quote links + brand-scoped pipeline
--      spine (Chapter 05). PREREQ: §1, §3. Adds NO money columns — money stays
--      on the shipped quotes columns (integer-minor + bps, tower_22 work).
-- ############################################################################

-- 5.1 Re-connect allocation → order/quote (nullable link columns, not state;
-- the §1.4 audit trigger captures every set; rb_slots_taken never reads them;
-- writable through the §3.1 rb_alloc_upd path — deliberately NOT in its revoke).
alter table tower.rb_slot_allocations
  add column if not exists order_id uuid references tower.orders(id) on delete set null,
  add column if not exists quote_id uuid references tower.quotes(id) on delete set null;
create index if not exists rb_slot_allocations_order_idx on tower.rb_slot_allocations (order_id);

-- 5.2 Brand-scope the pipeline spine: (a) brand pointer, (b) relax lane-identity
-- NOT NULLs (widening — lane rows keep their values), (c) exactly-one-identity CHECK.
alter table tower.rfqs   add column if not exists represented_brand_id uuid references tower.represented_brands(id);
alter table tower.quotes add column if not exists represented_brand_id uuid references tower.represented_brands(id);
alter table tower.orders add column if not exists represented_brand_id uuid references tower.represented_brands(id);

alter table tower.rfqs   alter column lane_id    drop not null;
alter table tower.orders alter column lane_id    drop not null;
alter table tower.orders alter column brand_id   drop not null;
alter table tower.orders alter column account_id drop not null;  -- RB binds to leads, not accounts

alter table tower.rfqs   add constraint rfqs_scope_ck
  check ((lane_id is not null) <> (represented_brand_id is not null)) not valid;
alter table tower.orders add constraint orders_scope_ck
  check ((lane_id is not null) <> (represented_brand_id is not null)) not valid;
-- `not valid` so legacy lane rows never block the migration; validate later:
--   alter table tower.rfqs   validate constraint rfqs_scope_ck;
--   alter table tower.orders validate constraint orders_scope_ck;

-- 5.3 Additive RB RLS on the spine — a strict widening beside the shipped lane
-- policies (never a change to them): an RB rep reads/writes rows of their brand.
create policy rfqs_rb_read on tower.rfqs for select
  using ( represented_brand_id is not null
          and has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS','BRAND_VIEWER']) );
create policy rfqs_rb_ins on tower.rfqs for insert
  with check ( represented_brand_id is not null
          and has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) );
create policy quotes_rb_read on tower.quotes for select
  using ( represented_brand_id is not null
          and has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS','BRAND_VIEWER']) );
create policy quotes_rb_ins on tower.quotes for insert
  with check ( represented_brand_id is not null
          and has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) );
create policy quotes_rb_upd on tower.quotes for update
  using ( represented_brand_id is not null
          and has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) )
  with check ( represented_brand_id is not null
          and has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) );
create policy orders_rb_read on tower.orders for select
  using ( represented_brand_id is not null
          and has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS','BRAND_VIEWER']) );
create policy orders_rb_ins on tower.orders for insert
  with check ( represented_brand_id is not null
          and has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) );

-- 5.4 NOT added, deliberately: no quote/document tables (tower.quotes + the
-- shipped QuotationDocument shape are the home); no price on templates or
-- allocations (price-per-slot is a compose-time quote-line input); no XLSX
-- artifact table (client-generated, ephemeral — costing export doctrine); no
-- new subtraction or packing function (cascadeForSlots via @wings/rb-core).
