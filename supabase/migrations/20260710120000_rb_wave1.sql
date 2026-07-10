-- ============================================================
-- Represented Brands — Wave 1 (SPEC §3, program law in
-- programs/represented-brands/SPEC.md; root CLAUDE.md §5-bis)
-- ------------------------------------------------------------
-- Core entities + the server-side subtraction rule + the public
-- read/write contract for apps/site.
--
-- Deviations from SPEC §3, each deliberate:
-- · rb_containers is its own table (SPEC reuses tower.containers,
--   but that table binds containers to lanes via lane_id NOT NULL;
--   RB containers are brand-scoped). The mirror into
--   tower.containers / container_commitments ships with the TOWER
--   UI integration wave.
-- · rb_packing_profiles carries product_slug text (site content)
--   instead of FK to tower.products — RB SKUs enter the catalog
--   module in the TOWER wave.
-- · The tower schema is NOT PostgREST-exposed, so the site talks
--   only to public.* views + the public.rb_reserve wrapper below.
-- ============================================================

-- ── Entities ────────────────────────────────────────────────

create table if not exists tower.represented_brands (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,                -- RB/01, RB/02… append-only, never reused
  slug text unique not null,
  name text not null,
  status text not null default 'PROSPECT'
    check (status in ('PROSPECT','NEGOTIATION','SIGNED','ONBOARDING','BRAND_REVIEW','LIVE','PAUSED','ENDED')),
  mandate jsonb not null default '{}',
  identity jsonb not null default '{}',
  kit_complete boolean not null default false,
  content jsonb not null default '{}',
  categories text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists tower.rb_packing_profiles (
  id uuid primary key default gen_random_uuid(),
  represented_brand_id uuid not null references tower.represented_brands(id) on delete cascade,
  product_slug text unique not null,
  product_name text not null,
  gtin text,
  package_kind text not null default 'box',
  packets_per_package int not null default 1,
  units_per_package int not null,
  unit_name_plural text not null default 'unidades',
  package_cbm numeric(8,4) not null,
  package_kg numeric(8,2) not null,
  stackable boolean default true,
  notes text
);

create table if not exists tower.rb_container_templates (
  id uuid primary key default gen_random_uuid(),
  ref text unique not null,                 -- e.g. RB01-40HC-A
  represented_brand_id uuid not null references tower.represented_brands(id) on delete cascade,
  kind text not null check (kind in ('20GP','40GP','40HC','REEFER')),
  composition jsonb not null default '[]',  -- [{profile_slug, packages}]
  max_packages int not null,
  governing_bound text not null check (governing_bound in ('CBM','KG')),
  utilization_note text,
  total_slots int not null,
  packages_per_slot int not null,
  status text not null default 'DRAFT' check (status in ('DRAFT','PUBLISHED','RETIRED')),
  created_at timestamptz default now()
);

create table if not exists tower.rb_containers (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,                -- RB01-40HC-001
  template_id uuid not null references tower.rb_container_templates(id),
  represented_brand_id uuid not null references tower.represented_brands(id) on delete cascade,
  route jsonb not null default '{}',        -- {origin, destination}
  closes_at date,
  status text not null default 'OPEN'
    check (status in ('OPEN','FILLING','CLOSED','SHIPPED','CANCELLED')),
  public_fill_visible boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists tower.rb_slot_allocations (
  id uuid primary key default gen_random_uuid(),
  rb_container_id uuid not null references tower.rb_containers(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  slots int not null check (slots > 0),
  quantity_units int not null default 0,
  status text not null default 'RESERVED'
    check (status in ('RESERVED','CONFIRMED','LOADED','RELEASED')),
  expires_at timestamptz,                   -- RESERVED self-expires; NULL = no expiry
  created_at timestamptz default now()
);

create index if not exists rb_slot_allocations_container_idx
  on tower.rb_slot_allocations(rb_container_id);

-- RLS on every table; no policies — service role only (site server code).
alter table tower.represented_brands enable row level security;
alter table tower.rb_packing_profiles enable row level security;
alter table tower.rb_container_templates enable row level security;
alter table tower.rb_containers enable row level security;
alter table tower.rb_slot_allocations enable row level security;

-- ── The subtraction rule — computed in ONE place ────────────
-- Taken = confirmed/loaded + unexpired reservations. Expired
-- RESERVED rows stop counting immediately (self-healing without a
-- cron); a later TOWER job flips them to RELEASED for the ledger.

create or replace function tower.rb_slots_taken(p_container uuid)
returns int
language sql
stable
as $$
  select coalesce(sum(slots), 0)::int
  from tower.rb_slot_allocations
  where rb_container_id = p_container
    and (
      status in ('CONFIRMED','LOADED')
      or (status = 'RESERVED' and (expires_at is null or expires_at > now()))
    );
$$;

-- Atomic reservation: locks the container row so concurrent
-- reserves serialize; the last slot cannot be sold twice.
create or replace function tower.rb_reserve(
  p_container uuid,
  p_slots int,
  p_lead uuid default null,
  p_quantity_units int default 0
)
returns uuid
language plpgsql
as $$
declare
  v_total int;
  v_taken int;
  v_status text;
  v_allocation uuid;
begin
  if p_slots is null or p_slots < 1 then
    raise exception 'RB_INVALID_SLOTS';
  end if;

  select t.total_slots, c.status
    into v_total, v_status
  from tower.rb_containers c
  join tower.rb_container_templates t on t.id = c.template_id
  where c.id = p_container
  for update of c;

  if not found then
    raise exception 'RB_CONTAINER_NOT_FOUND';
  end if;
  if v_status not in ('OPEN','FILLING') then
    raise exception 'RB_CONTAINER_CLOSED';
  end if;

  v_taken := tower.rb_slots_taken(p_container);
  if p_slots > v_total - v_taken then
    raise exception 'RB_INSUFFICIENT_SLOTS';
  end if;

  insert into tower.rb_slot_allocations
    (rb_container_id, lead_id, slots, quantity_units, status, expires_at)
  values
    (p_container, p_lead, p_slots, coalesce(p_quantity_units, 0), 'RESERVED', now() + interval '72 hours')
  returning id into v_allocation;

  if v_taken + p_slots >= v_total then
    update tower.rb_containers set status = 'FILLING' where id = p_container and status = 'OPEN';
  end if;

  return v_allocation;
end;
$$;

-- ── Public contract for apps/site ───────────────────────────
-- (tower schema is not PostgREST-exposed; these are the only
--  surfaces the site touches.)

create or replace view public.rb_public_brands as
select b.code, b.slug, b.name, b.categories
from tower.represented_brands b
where b.status = 'LIVE';

create or replace view public.rb_public_templates as
select t.ref, t.kind, t.total_slots, t.packages_per_slot,
       p.packets_per_package, p.units_per_package, p.unit_name_plural,
       p.package_kg, p.package_cbm,
       t.max_packages, t.governing_bound, b.slug as brand_slug
from tower.rb_container_templates t
join tower.represented_brands b on b.id = t.represented_brand_id
join tower.rb_packing_profiles p
  on p.product_slug = (t.composition -> 0 ->> 'profile_slug')
where t.status = 'PUBLISHED';

create or replace view public.rb_public_containers as
select c.id, c.code, c.route, c.closes_at, c.status,
       t.ref as template_ref, b.slug as brand_slug,
       t.total_slots,
       coalesce((
         select sum(a.slots) from tower.rb_slot_allocations a
         where a.rb_container_id = c.id and a.status in ('CONFIRMED','LOADED')
       ), 0)::int as committed_slots,
       coalesce((
         select sum(a.slots) from tower.rb_slot_allocations a
         where a.rb_container_id = c.id and a.status = 'RESERVED'
           and (a.expires_at is null or a.expires_at > now())
       ), 0)::int as reserved_slots
from tower.rb_containers c
join tower.rb_container_templates t on t.id = c.template_id
join tower.represented_brands b on b.id = c.represented_brand_id
where c.public_fill_visible and c.status in ('OPEN','FILLING');

-- Wrapper RPC so the site (service role) can reserve through the
-- exposed public schema. SECURITY DEFINER + locked-down grants:
-- anon/authenticated cannot call it.
create or replace function public.rb_reserve(
  p_container uuid,
  p_slots int,
  p_lead uuid default null,
  p_quantity_units int default 0
)
returns uuid
language sql
security definer
set search_path = tower, public
as $$
  select tower.rb_reserve(p_container, p_slots, p_lead, p_quantity_units);
$$;

revoke all on function public.rb_reserve(uuid, int, uuid, int) from public, anon, authenticated;
grant execute on function public.rb_reserve(uuid, int, uuid, int) to service_role;

revoke all on public.rb_public_brands from anon, authenticated;
revoke all on public.rb_public_templates from anon, authenticated;
revoke all on public.rb_public_containers from anon, authenticated;
grant select on public.rb_public_brands, public.rb_public_templates, public.rb_public_containers to service_role;

-- ── Seed — RB/01 Áladín (ratified 2026-07-10) ───────────────

insert into tower.represented_brands (code, slug, name, status, kit_complete, mandate, categories)
values (
  'RB/01', 'aladin', 'Áladín', 'LIVE', true,
  '{"territory": "Perú", "own_brand": true, "note": "representation letter pending (formality)"}',
  array['higiene','papel-ecologico']
)
on conflict (code) do nothing;

insert into tower.rb_packing_profiles
  (represented_brand_id, product_slug, product_name, gtin, package_kind,
   packets_per_package, units_per_package, unit_name_plural, package_cbm, package_kg)
select b.id, v.slug, v.name, v.gtin, 'box', v.packets, v.units, v.unit_name, v.cbm, 9.70
from tower.represented_brands b,
  (values
    ('papel-higienico-bambu', 'Papel higiénico de bambú', '0723707931803', 6, 60, 'rollos', 0.0777),
    ('papel-facial-bambu',    'Papel facial de bambú',    '0723707931797', 9, 45, 'empaques', 0.0590)
  ) as v(slug, name, gtin, packets, units, unit_name, cbm)
where b.code = 'RB/01'
on conflict (product_slug) do nothing;

insert into tower.rb_container_templates
  (ref, represented_brand_id, kind, composition, max_packages, governing_bound,
   utilization_note, total_slots, packages_per_slot, status)
select 'RB01-40HC-A', b.id, '40HC',
       '[{"profile_slug": "papel-higienico-bambu", "packages": 940}]',
       940, 'CBM',
       '945 computed (grid 27x7x5, 96.1% vol, 2020 box dims) - 5 held as ops slack; confirm current dims before first stuffing',
       10, 94, 'PUBLISHED'
from tower.represented_brands b
where b.code = 'RB/01'
on conflict (ref) do nothing;

insert into tower.rb_containers (code, template_id, represented_brand_id, route, closes_at, status)
select 'RB01-40HC-001', t.id, b.id,
       '{"origin": "Qingdao", "destination": "Callao"}', date '2026-08-28', 'OPEN'
from tower.represented_brands b
join tower.rb_container_templates t on t.represented_brand_id = b.id and t.ref = 'RB01-40HC-A'
where b.code = 'RB/01'
on conflict (code) do nothing;
