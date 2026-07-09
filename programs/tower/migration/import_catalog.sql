-- TOWER · Wave 1 (W1.5) · catalog import — INTRA-PROJECT public -> tower
-- Source: public.products/categories/subcategories on pyznlglvwihosemqkhtq (the project the
--   dashboard mislabels "wings-operations"; see DECISIONS.log D-01/D-02).
-- All 99 products are EQUIPMENT-archetype (machinery/buses/autos/trucks/industrial/UTV/parts) ⇒
--   single unambiguous lane: wings / WGT/01. Original taxonomy preserved in category_path.
-- No money conversion: the catalog has NO price columns (wholesale, per no-retail-price directive).
-- Idempotent: re-runnable, keyed on the source product id (reused as tower id). Non-destructive:
--   never touches public.* — read-only source.
-- Containers / financial / prorrateo history: NO source exists in this project's public schema
--   (that data belonged to the unrelated Euro Global project) — nothing to migrate for those.

set search_path to tower, public;

with w as (select id as brand_id from tower.brands where slug = 'wings'),
     l as (select id as lane_id  from tower.lanes  where code = 'WGT/01')
insert into tower.products (id, brand_id, lane_id, slug, status, category_path, name, specs, updated_at)
select
  p.id,
  w.brand_id,
  l.lane_id,
  p.slug,
  case when p.is_active then 'PUBLISHED' else 'RETIRED' end,
  array_remove(array[c.slug, s.slug], null),
  jsonb_build_object('es', p.name_es, 'en', p.name_en),
  coalesce(p.specs, '{}'::jsonb),
  now()
from public.products p
cross join w
cross join l
left join public.categories c   on c.id = p.category_id
left join public.subcategories s on s.id = p.subcategory_id
on conflict (id) do nothing;

-- v1 publish snapshot for each PUBLISHED product (satisfies the publish=snapshot invariant). Idempotent.
insert into tower.product_versions (product_id, version, snapshot)
select pr.id, 1, to_jsonb(pr)
from tower.products pr
where pr.status = 'PUBLISHED'
  and not exists (select 1 from tower.product_versions v where v.product_id = pr.id and v.version = 1);

-- reconciliation (source vs target must line up)
select
  (select count(*) from public.products)                                             as source_products,
  (select count(*) from tower.products
     where lane_id = (select id from tower.lanes where code='WGT/01'))                as tower_products,
  (select count(*) from public.products where is_active)                             as source_active,
  (select count(*) from tower.products where status='PUBLISHED')                     as tower_published,
  (select count(*) from tower.product_versions)                                      as snapshots;
