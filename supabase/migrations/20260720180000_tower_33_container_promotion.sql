-- tower_33 · Container promotion — activation state + rep-authored marketing copy
-- + the public "active container" read contract.
--
-- The promotion feature (root CLAUDE.md §5-bis, ALLOCATION archetype): a rep
-- ACTIVATES an open container for marketing, authors the copy in TOWER, and the
-- site exposes an "active container" page + a share card. This migration adds
-- the promotion fields to the shipped tower.rb_containers and a public view the
-- site reads. Additive only — never alters rb_wave1 objects destructively; the
-- existing rb_containers_upd RLS policy (has_rb_role BRAND_MANAGER/BRAND_OPS,
-- tower_25) already gates who may flip promotion, so no new write policy here.

set search_path to tower, public;

-- ── Promotion state on the shipped container ────────────────────────────────
-- promo_copy holds the rep-authored overrides consumed by @wings/rb-core's
-- promo library: { headline?, priceNote?, specs?: [{label,value}], routeLabel?,
-- unitLabel? }. Empty {} = use the derived defaults. Activation is append-only
-- audited (the audit trigger already covers rb_containers, tower_25 §1.4).
alter table rb_containers
  add column if not exists promo_active       boolean not null default false,
  add column if not exists promo_copy          jsonb   not null default '{}',
  add column if not exists promo_activated_at  timestamptz,
  add column if not exists promo_activated_by  uuid references profiles(id),
  -- Shipping phase of the container itself (origin/destination live in `route`).
  -- The promotion states where the container is: loading at origin, in transit,
  -- or arrived at destination. Route + phase come from the container spec — the
  -- rep advances the phase, never re-types the ports.
  add column if not exists shipping_phase      text not null default 'EN_ORIGEN'
    check (shipping_phase in ('EN_ORIGEN','EN_TRANSITO','ARRIBADO'));

-- ── Public read contract — the active-container marketing surface ───────────
-- One row per PROMOTED, still-open container of a LIVE brand. Carries everything
-- the site's active-container page and share card need, computed server-side:
-- the product (composition head → packing profile), the exhibited product facts,
-- live slot availability (through the single subtraction rule rb_slots_taken),
-- and the rep's promo_copy. tower schema stays unexposed; the site reads only
-- this view (service role), exactly like rb_public_containers.
create or replace view public.rb_active_containers as
select
  c.id,
  c.code,
  b.slug                                             as brand_slug,
  b.name                                             as brand_name,
  c.route,
  c.closes_at,
  c.status,
  c.shipping_phase,
  c.promo_copy,
  c.promo_activated_at,
  t.ref                                              as template_ref,
  t.kind                                             as container_kind,
  t.total_slots,
  tower.rb_slots_taken(c.id)                          as taken_slots,
  (t.total_slots - tower.rb_slots_taken(c.id))::int  as available_slots,
  -- committed (vendido) vs reserved (reservado) breakdown for the container
  -- slice diagram — the same split rb_public_containers exposes.
  coalesce((
    select sum(a.slots) from tower.rb_slot_allocations a
    where a.rb_container_id = c.id and a.status in ('CONFIRMED','LOADED')
  ), 0)::int                                          as committed_slots,
  coalesce((
    select sum(a.slots) from tower.rb_slot_allocations a
    where a.rb_container_id = c.id and a.status = 'RESERVED'
      and (a.expires_at is null or a.expires_at > now())
  ), 0)::int                                          as reserved_slots,
  p.product_slug,
  p.product_name,
  p.unit_name_plural,
  jsonb_build_object(
    'packetsPerPackage', p.packets_per_package,
    'unitsPerPackage',   p.units_per_package,
    'unitNamePlural',    p.unit_name_plural,
    'packageKg',         p.package_kg,
    'packageCbm',        p.package_cbm,
    'gtin',              p.gtin,
    'packagesPerSlot',   t.packages_per_slot
  )                                                  as product_facts
from tower.rb_containers c
join tower.rb_container_templates t on t.id = c.template_id
join tower.represented_brands b     on b.id = c.represented_brand_id
join tower.rb_packing_profiles p    on p.product_slug = (t.composition -> 0 ->> 'profile_slug')
where c.promo_active = true
  and c.status in ('OPEN', 'FILLING')
  and b.status = 'LIVE';

revoke all on public.rb_active_containers from anon, authenticated;
grant select on public.rb_active_containers to service_role;
