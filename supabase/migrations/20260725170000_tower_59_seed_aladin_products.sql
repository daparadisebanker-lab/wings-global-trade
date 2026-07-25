-- tower_59 · Seed RB/01 Áladín product catalog + technical drawings + brand kit.
-- ----------------------------------------------------------------------------
-- The Áladín brand row + packing profiles + container are already seeded (rb_wave1);
-- this adds the two flagship SKUs, their master-package drawing geometry, and the
-- brand kit identity, so Tower's Marcas Representadas shows the real catalog + kit.
-- Source of truth: apps/site/src/lib/rb/fixtures.ts (ALADIN_PRODUCTS) +
-- programs/represented-brands/brands/rb-01-aladin/{PRODUCTS.md,KIT-INTAKE.md}.
--
-- Products are seeded as DRAFT on purpose. rb_public_products exposes PUBLISHED
-- rows only, so DRAFT keeps the LIVE public site on its current fixtures (no
-- regression) while the rows appear + are editable in Tower. Publish each product
-- through Tower's own flow (publishRbProduct) when ready — that writes the append-
-- only rb_product_versions snapshot and runs the spec/kit validators, which a raw
-- PUBLISHED insert would bypass. Publishing the site off fixtures ALSO needs the
-- site read model (apps/site/src/lib/rb/data.ts liveToShelf) taught to render
-- specs.specRows + the exploded/pallet drawings — tracked as a follow-up.
--
-- FLAGGED for brand ratification (do not treat as settled fact):
--   · Kit tokens: accent-ink #4C7012 was measured on WHITE (5.78:1); Tower's
--     validateKit checks accent-ink ON accent (#4C7012 on #5E8A16 = 1.41:1, FAILS
--     4.5:1). The kit panel will show a contrast ✗ until this is resolved (ratify a
--     true on-accent ink, or align the validator's semantic). Colors are transcribed
--     verbatim from KIT-INTAKE §2.5.
--   · Kit docs (mandate letter / usage manual) are NOT seeded — no asset on file;
--     upload via Tower's BrandKitPanel. Until then the kit cannot round-trip a save.
--   · hs_code uses the standard HS-6 family (4818.10 toilet paper / 4818.20 facial
--     tissue) per KIT-INTAKE "48.18 family — confirm per SKU"; confirm the national
--     tariff line before publishing.
--
-- Idempotent: products/diagrams upsert on their natural keys; the identity update is
-- guarded so a re-run never clobbers assets an operator later uploaded via the panel.
-- Manual-apply (SQL editor) note: after running, reconcile the ledger with
--   insert into supabase_migrations.schema_migrations (version, name)
--   values ('20260725170000','tower_59_seed_aladin_products') on conflict (version) do nothing;
set search_path to tower, public;

-- 0) Fail loudly if the brand row is missing (else the cross joins below would
--    silently insert zero rows).
do $$
begin
  if not exists (select 1 from tower.represented_brands where slug = 'aladin') then
    raise exception 'RB/01 aladin represented_brands row not found — run rb_wave1 first';
  end if;
end $$;

-- 1) PRODUCTS (DRAFT) — localized name + specs; specRows carries the fiche table
--    (presentation only; gtin/hs_code/geometry live in their own homes). Schema id
--    resolves to the HIGHEST ALLOCATION version (v2 adds specRows, tower_44).
insert into tower.rb_products
  (represented_brand_id, slug, status, category_path, name, specs, spec_schema_id, hs_code, moq, cbm_per_unit)
select b.id, v.slug, 'DRAFT', v.category_path, v.name::jsonb, v.specs::jsonb, s.id, v.hs_code, null::numeric, null::numeric
from (select id from tower.represented_brands where slug = 'aladin') b
cross join (
  select id from tower.spec_schemas
  where archetype = 'ALLOCATION' and lane_id is null
  order by version desc limit 1
) s
cross join (values
  ('papel-higienico-bambu',
   '{higiene,papel-higienico}'::text[],
   '{"es":"Papel higiénico de bambú","en":"Bamboo toilet paper"}',
   '{"unitLabel":{"es":"pack × 10 rollos","en":"pack × 10 rolls"},"description":{"es":"Papel higiénico ecológico elaborado a base de fibras 100% vírgenes de bambú. Suave, resistente y antialérgico; biodegradable y libre de químicos.","en":"Eco-friendly toilet paper made from 100% virgin bamboo fibre. Soft, strong and hypoallergenic; biodegradable and chemical-free."},"highlights":["100% fibra virgen de bambú","Sin químicos ni lejía","4 capas · 30 metros por rollo"],"specRows":[{"label":"Presentación","value":"Pack × 10 rollos · 30 m · 4 capas","icon":"box"},{"label":"Hoja","value":"103 × 102 mm · hoja simple","icon":"doc"},{"label":"Peso por rollo","value":"160 g","icon":"weight"},{"label":"Caja máster","value":"6 packs · 60 rollos · 330 × 440 × 535 mm","icon":"box"},{"label":"Peso caja","value":"9,7 kg · 0,0777 m³","icon":"cbm"},{"label":"Origen","value":"Importado","icon":"box"},{"label":"Registro sanitario","value":"No requerido","icon":"doc"}]}',
   '4818.10'),
  ('papel-facial-bambu',
   '{higiene,papel-facial}'::text[],
   '{"es":"Papel facial de bambú","en":"Bamboo facial tissue"}',
   '{"unitLabel":{"es":"empaque × 390 hojas","en":"pack × 390 sheets"},"description":{"es":"Papel facial ultra suave de fibra de bambú, 3 capas. No irrita ni raspa la piel; fragancia natural, producto ecológico.","en":"Ultra-soft 3-ply bamboo facial tissue. Non-irritating and gentle on skin; natural fragrance, eco-friendly."},"highlights":["390 hojas ultra suaves","3 capas","No irrita la piel"],"specRows":[{"label":"Presentación","value":"Empaque × 390 hojas · 3 capas","icon":"box"},{"label":"Empaque unitario","value":"70 × 95 × 175 mm · 190 g","icon":"weight"},{"label":"Caja máster","value":"9 pilas × 5 · 45 empaques · 360 × 295 × 555 mm","icon":"box"},{"label":"Peso caja","value":"9,7 kg · 0,0590 m³","icon":"cbm"},{"label":"Origen","value":"Importado","icon":"box"},{"label":"Registro sanitario","value":"No requerido","icon":"doc"}]}',
   '4818.20')
) as v(slug, category_path, name, specs, hs_code)
on conflict (represented_brand_id, slug) do update set
  category_path = excluded.category_path, name = excluded.name, specs = excluded.specs,
  spec_schema_id = excluded.spec_schema_id, hs_code = excluded.hs_code;

-- 2) DIAGRAM SPECS — master-package geometry. Mapping from fixtures.ts packing:
--    length=box.w, width=box.d(depth), height=box.h; cells across=x, high=y, deep=z.
--    Facial packages_per_slot = 118 (grid-derived draft, KIT/PRODUCTS.md 33×4×9 on
--    40HC); higienico 94 is the ratified template.
insert into tower.rb_diagram_specs
  (rb_product_id, package_length_mm, package_width_mm, package_height_mm,
   units_per_package, packages_per_slot, cells_across, cells_high, cells_deep, detail, caption)
select p.id, v.l, v.w, v.h, v.upp, v.pps, v.ca, v.ch, v.cd, v.detail, v.caption
from tower.rb_products p
join tower.represented_brands b on b.id = p.represented_brand_id and b.slug = 'aladin'
join (values
  ('papel-higienico-bambu', 440, 535, 330, 60,  94, 2, 3, 1, 'rolls', '6 paquetes (2 pilas de 3) · 10 rollos c/u = 60 rollos · 9,7 kg'),
  ('papel-facial-bambu',    295, 555, 360, 45, 118, 3, 1, 3, 'slabs', '9 pilas (3 × 3) · 5 empaques c/u = 45 empaques · 9,7 kg')
) as v(slug, l, w, h, upp, pps, ca, ch, cd, detail, caption) on v.slug = p.slug
on conflict (rb_product_id) do update set
  package_length_mm = excluded.package_length_mm, package_width_mm = excluded.package_width_mm,
  package_height_mm = excluded.package_height_mm, units_per_package = excluded.units_per_package,
  packages_per_slot = excluded.packages_per_slot, cells_across = excluded.cells_across,
  cells_high = excluded.cells_high, cells_deep = excluded.cells_deep,
  detail = excluded.detail, caption = excluded.caption;

-- 3) BRAND KIT identity — tokens + the 4 logo lockups + hero/about photography.
--    Paths are same-origin public assets served from apps/tower/public/brands/aladin/
--    (and apps/site/public). GUARDED: only sets identity when a logo is not already
--    present, so a re-run never destroys assets uploaded later via BrandKitPanel.
update tower.represented_brands
set identity = jsonb_build_object(
      'tokens', jsonb_build_object(
        'accent', '#5E8A16', 'accent-ink', '#4C7012', 'accent-2', '#C77029',
        'ink', '#44650F', 'surface-tint', '#FCFCF7'),
      'logo', jsonb_build_object(
        'isologo',  '/brands/aladin/isologo.svg',
        'positivo', '/brands/aladin/positivo.svg',
        'isotipo',  '/brands/aladin/isotipo.svg',
        'sello',    '/brands/aladin/sello.svg'),
      'photography', jsonb_build_object(
        'hero', jsonb_build_array(
          jsonb_build_object('path', '/brands/aladin/hero-rolls.jpeg',  'source', 'brand_supplied'),
          jsonb_build_object('path', '/brands/aladin/hero-stack.jpeg',  'source', 'brand_supplied'),
          jsonb_build_object('path', '/brands/aladin/hero-bamboo.jpeg', 'source', 'brand_supplied')),
        'about', jsonb_build_array(
          jsonb_build_object('path', '/brands/aladin/hero-bamboo.jpeg', 'source', 'brand_supplied'),
          jsonb_build_object('path', '/brands/aladin/hero-stack.jpeg',  'source', 'brand_supplied')))
    ),
    mandate = coalesce(mandate, '{}'::jsonb)
              || jsonb_build_object('territory', 'Sudamérica, Centroamérica y el Caribe')
where slug = 'aladin'
  and not (coalesce(identity, '{}'::jsonb) ? 'logo');  -- idempotency guard

-- 4) Confirm what landed:
select 'product' as what, slug, status, coalesce(hs_code, '—') as detail
from tower.rb_products
where represented_brand_id = (select id from tower.represented_brands where slug = 'aladin')
union all
select 'diagram', p.slug, d.detail, (d.packages_per_slot || ' pkg/slot')
from tower.rb_diagram_specs d
join tower.rb_products p on p.id = d.rb_product_id
where p.represented_brand_id = (select id from tower.represented_brands where slug = 'aladin')
union all
select 'kit', 'identity', (identity ? 'logo')::text, coalesce(identity->'tokens'->>'accent', '—')
from tower.represented_brands where slug = 'aladin';
