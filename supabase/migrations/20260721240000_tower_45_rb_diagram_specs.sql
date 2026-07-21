-- tower_45 · RB Console Wave 4 — parametric diagram geometry store.
-- (represented-brands-console SPEC §4 / Ch 04 "DIAGRAM-MODELS", rebased per the
-- program ledger onto the shipped tower_25 has_rb_role regime — SPEC R1/R2.)
--
-- Additive only (append-only law): a NEW brand-scoped table holding the BOUNDED
-- geometry a product's technical package/packing drawing is derived from. Root
-- §5-bis / R1: diagram geometry lives OUTSIDE the spec value — here, never in
-- tower.rb_products.specs (which keeps presentation fields only: unitLabel,
-- description, highlights). One write path, one read path per datum (Prime
-- Directive 5). PREREQ: tower_26_rb_products (rb_products + has_rb_role RLS
-- regime + rb_set_updated_at() + audit_trigger()).
--
-- The model is DELIBERATELY bounded — defined numeric columns, never a free-form
-- JSON blob (task law): package box mm (L/W/H), the two ALLOCATION counts
-- (units-per-package, packages-per-slot), the packing-grid cell counts that split
-- the drawing's faces, a bounded `detail` render mode, and an optional caption.
-- Numbers are brand assets (Directive 5); no money, no float — integer mm + counts.

set search_path to tower, public;

-- 41.1 rb_diagram_specs — one geometry spec per product (unique rb_product_id).
-- Keyed to the product row directly (FK, on delete cascade) — the mirrored shape
-- rb_product_media uses (tower_26 §2.3), so a deleted product cascades its drawing
-- away and no orphan geometry survives.
create table tower.rb_diagram_specs (
  id                  uuid primary key default gen_random_uuid(),
  rb_product_id       uuid not null references tower.rb_products(id) on delete cascade,
  -- Package box geometry, interior mm. length = x (runs to lower-right in the
  -- cabinet/iso projection), width = z (depth, lower-left), height = y (up).
  package_length_mm   integer not null,
  package_width_mm    integer not null,
  package_height_mm   integer not null,
  -- ALLOCATION packing counts — exhibited as brand assets on the drawing caption.
  units_per_package   integer not null,
  packages_per_slot   integer not null,
  -- Packing grid: how the master box's visible faces divide in the drawing
  -- (across the width, stacked up, and into depth). Default 1 = an undivided box.
  cells_across        integer not null default 1,   -- x divisions (front width)
  cells_high          integer not null default 1,   -- y divisions (front height)
  cells_deep          integer not null default 1,   -- z divisions (depth)
  -- Bounded front-face detail render mode (mirrors the PackingDiagram organ's
  -- 'rolls' | 'slabs') — a fixed enum, never free text.
  detail              text not null default 'slabs'
                        check (detail in ('rolls','slabs')),
  -- Optional caption exhibited under the drawing (a short composition line). When
  -- absent the renderer derives one from the two counts.
  caption             text,
  created_by          uuid references tower.profiles(id),
  updated_at          timestamptz default now(),
  created_at          timestamptz default now(),
  unique (rb_product_id),
  -- All geometry inputs are strictly positive (a zero dimension is not a drawing).
  constraint rb_diagram_specs_positive check (
    package_length_mm > 0 and package_width_mm > 0 and package_height_mm > 0
    and units_per_package > 0 and packages_per_slot > 0
    and cells_across > 0 and cells_high > 0 and cells_deep > 0
  )
);
create index on tower.rb_diagram_specs (rb_product_id);

-- 41.2 Public read seam — the site's only surface onto diagram geometry. PUBLISHED
-- products of LIVE brands only (mirrors rb_public_products, tower_26 §2.5). Carries
-- product_slug + brand_slug so the site loader keys it exactly like rb_public_products.
-- Service-role read only; revoked from anon/authenticated.
create view public.rb_public_diagrams as
  select d.rb_product_id,
         p.slug as product_slug,
         b.slug as brand_slug,
         d.package_length_mm, d.package_width_mm, d.package_height_mm,
         d.units_per_package, d.packages_per_slot,
         d.cells_across, d.cells_high, d.cells_deep,
         d.detail, d.caption
  from tower.rb_diagram_specs d
  join tower.rb_products p on p.id = d.rb_product_id
  join tower.represented_brands b on b.id = p.represented_brand_id
  where p.status = 'PUBLISHED' and b.status = 'LIVE';
revoke all on public.rb_public_diagrams from anon, authenticated;
grant select on public.rb_public_diagrams to service_role;

-- 41.3 RLS — per-tenant scoping via has_rb_role (tower_25), resolving the brand
-- through the parent product (join-through-parent, the shape tower_26 uses for
-- rb_product_versions / rb_product_media). Read: all three brand roles + group
-- admin (has_rb_role's is_group_admin branch). Write: BRAND_MANAGER / BRAND_OPS.
-- NO delete policy anywhere (retire-not-delete — append-only law; a product delete
-- cascades the row, never an authenticated hard delete). Service-role site reads
-- bypass RLS.
alter table tower.rb_diagram_specs enable row level security;

create policy rb_diagram_specs_read on tower.rb_diagram_specs for select
  using ( exists (select 1 from tower.rb_products p where p.id = rb_product_id
          and has_rb_role(p.represented_brand_id,
                          array['BRAND_MANAGER','BRAND_OPS','BRAND_VIEWER'])) );
create policy rb_diagram_specs_ins on tower.rb_diagram_specs for insert
  with check ( exists (select 1 from tower.rb_products p where p.id = rb_product_id
          and has_rb_role(p.represented_brand_id, array['BRAND_MANAGER','BRAND_OPS'])) );
create policy rb_diagram_specs_upd on tower.rb_diagram_specs for update
  using ( exists (select 1 from tower.rb_products p where p.id = rb_product_id
          and has_rb_role(p.represented_brand_id, array['BRAND_MANAGER','BRAND_OPS'])) )
  with check ( exists (select 1 from tower.rb_products p where p.id = rb_product_id
          and has_rb_role(p.represented_brand_id, array['BRAND_MANAGER','BRAND_OPS'])) );

-- 41.4 updated_at — the self-contained tower function (tower_26 §2.7); moddatetime
-- is not enabled in this project.
create trigger rb_diagram_specs_set_updated_at before update on tower.rb_diagram_specs
  for each row execute function tower.rb_set_updated_at();

-- 41.5 Audit — the shipped per-table trigger (tower_07), attached so every
-- mutation lands in tower.audit_log (never written by the action).
create trigger audit_rb_diagram_specs after insert or update or delete
  on tower.rb_diagram_specs for each row execute function tower.audit_trigger();
