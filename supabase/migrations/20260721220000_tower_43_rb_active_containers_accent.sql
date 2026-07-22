-- tower_43 · Surface the brand accent on the public active-container contract.
--
-- The public share/OG card (@wings/rb-core buildPromoCardSvg) already accepts an
-- `accent` (validated hex; falls back to Wings gold). The gap was purely the read
-- path: public.rb_active_containers (tower_33) never carried the brand accent, so
-- every brand's card fell back to gold. This adds the accent — sourced from the
-- brand's identity token contract (represented_brands.identity → tokens.accent,
-- the same path apps/tower's container-promo reads) — to the view.
--
-- Additive only: `create or replace view` preserves EVERY existing column, the
-- exact same WHERE/posture (promo_active + OPEN/FILLING + LIVE brand), and the
-- service-role-only grants (re-applied here since a replace can reset them,
-- exactly as tower_33 established them). No column removed or renamed.

set search_path to tower, public;

-- Drop + recreate rather than `create or replace`: the new column (`accent`) sits
-- mid-list, and CREATE OR REPLACE VIEW may only APPEND columns — a mid-list insert
-- is rejected. The drop is atomic inside this migration's transaction (no reader
-- downtime), the site reads the view with select('*') so column order is
-- irrelevant, and the grants are re-applied below exactly as tower_33 set them.
drop view if exists public.rb_active_containers;
create view public.rb_active_containers as
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
  -- Brand accent (hex) from the identity token contract — the card's container
  -- fill. Absent/invalid → NULL; @wings/rb-core validates and falls back to gold.
  b.identity -> 'tokens' ->> 'accent'                as accent,
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
