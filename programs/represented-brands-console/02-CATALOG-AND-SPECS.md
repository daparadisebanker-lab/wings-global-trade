# RB Console · Chapter 02 — Product & Specifications (category-agnostic)

> Scope: how a rep adds/removes products under a represented brand, and how each
> product's specification sheet is captured, validated, versioned, published, and
> synced to the public fiche. Grounded entirely in the shipped TOWER catalog
> (`tower.products` / `tower.spec_schemas` / `tower.product_versions` /
> `tower.audit_log`), the shipped RB core (`supabase/migrations/20260710120000_rb_wave1.sql`),
> and the reuse map (ProductEditor / SpecForm / PublishBar / catalog.ts). **Migration
> wins over SPEC §3 proposals** wherever they disagree.

---

## 1 · What

A represented brand (`tower.represented_brands`, e.g. RB/01 Áladín) needs a **product
shelf**: named items (ES/EN), each carrying a **specification sheet** and a **packing
profile**, moving through the same `DRAFT → IN_REVIEW → PUBLISHED → RETIRED` lifecycle
the lane catalog already uses. The public site renders these as the `productos` fiche
(today fixture-only: `ALADIN_PRODUCTS`, `apps/site/.../productos/page.tsx:35`, whose
comment `:33-34` marks the TOWER swap to real data).

Three category-agnostic requirements:

1. **Add / remove product per brand** — create, edit, submit, publish, retire, roll back.
   Removal is never a hard delete (append-only + audit law): it is `RETIRED` +
   version snapshot, mirroring `catalog.retireProduct` (`catalog.ts:563`).
2. **Specifications via the schema-driven `SpecForm`** — the one form that renders every
   archetype from a `tower.spec_schemas.json_schema` (`SpecForm.tsx:50`, the switch at
   `:27 renderField`). RB is the **ALLOCATION** archetype (root §3, §5-bis) — which does
   **not yet exist** in `SPEC_FIELD_DEFAULTS` (`registry.ts:20`, six archetypes only) nor
   in `ARCHETYPE_CODES` (`archetypes/types.ts:9-17`). Adding it is a *versioned schema
   addition*, never a form fork.
3. **Packing profile per product** — the immutable geometry (`box{w,d,h}`, cells, cartons)
   that feeds `PackingDiagram`/`ExplodedDiagram`/`PalletDiagram` and the slot cascade.
   This already has a shipped home: `tower.rb_packing_profiles` (migration L38-52).

**The one design decision this chapter settles:** where RB products live. See §2.

---

## 2 · Data model — recommendation: a parallel `tower.rb_products` table

**Recommendation: parallel `tower.rb_products`, scoped by `represented_brand_id`, NOT a
nullable `represented_brand_id` on `tower.products`.**

### 2.1 Why not overload `tower.products` (the SPEC §3 line-455 proposal)

The reuse map cites SPEC §3 line 455 ("reuse `tower.products` with nullable
`represented_brand_id`"). Against the **shipped** `tower.products`
(`20260706204539_tower_02_catalog.sql:14-30`) that path is destructive and breaks four
shipped invariants:

| Shipped constraint (tower_02) | What the shared-table path forces |
|---|---|
| `brand_id uuid **not null** references tower.brands(id)` | RB has no `tower.brands` row — root §5-bis: **"never overload `tower.brands`"**. Forces nullable-ing a NOT-NULL FK. |
| `lane_id uuid **not null** references tower.lanes(id)` | RB is not a lane (ALLOCATION is the 7th archetype, §5-bis). Forces a nullable lane. |
| `unique (lane_id, slug)` | With `lane_id = NULL`, uniqueness collapses — two brands could collide on `slug`. |
| RLS = lane-role via `has_lane_role(lane_id)` (mirrored in `computeCapabilities`, `catalog-logic.ts:50`) | A null-lane row **cannot be gated by `has_lane_role`** — there is no lane to check. RB base tables ship deny-all + service-role (wave1 L97-102). Two RLS regimes cannot cleanly co-house in one table. |

Beyond schema: the lane catalog readers (`listProducts` `catalog.ts:231`,
`listEditableLanes` `:326`) all assume a lane; RB rows would pollute every lane query and
every `product_versions` snapshot with null-lane branches. And the **public contract
differs** — lane products publish to lane surfaces; RB products may publish **only**
through the `rb_public_*` seam (fixture rule, backend map §6). One table, two publish
destinations, is a leak.

### 2.2 Why a parallel table is the grounded choice

Reuse in this codebase is at the **component/logic layer via props**, never the table
layer — the reuse map's own precedent: `admin.createBrand` (`admin.ts:468`) is *"the
pattern to copy into a `represented_brands` action, not the table to reuse."* The same
law applies one level down: copy the `tower.products` **column vocabulary and lifecycle**
into `rb_products`, and drive `ProductEditor`/`SpecForm`/`PublishBar` through props
(reuse-map invariant: *"No forked components… render RB data through props only"*). The
result: zero destructive alters (append-only law), one RLS regime per table, and the
public seam stays the three-view contract + a new sibling view.

`rb_products` deliberately mirrors `tower.products` column-for-column (same
`status` enum, `name jsonb`, `specs jsonb`, `spec_schema_id`, `category_path`,
`hs_code`, `moq`, `cbm_per_unit`) so the shared editor binds by shape, and swaps
`brand_id`+`lane_id` for a single `represented_brand_id`.

### 2.3 SQL — new migration `tower_25_rb_catalog` (additive only)

> **Migration numbering:** the shipped tree already carries `tower_22`
> (`20260718140000_..._quotation_document`), `tower_23`
> (`20260720120000_..._costing`), and `tower_24`
> (`20260720130000_..._costing_config_seed`). The backend map's "tower_22+"
> guidance is stale; the next free number is **tower_25**. (Chapter 01's tenancy
> migration — `rb_memberships` + `has_rb_role` — is its own additive migration and
> a **hard prerequisite** of this one: §2.3e and §3.1 depend on that predicate.)

```sql
-- supabase/migrations/20260721xxxxxx_tower_25_rb_catalog.sql
-- Additive: extends the shipped RB core (wave1) + tower catalog. Nothing altered
-- destructively (append-only law). All base tables in `tower`, never PostgREST-exposed.
-- PREREQUISITE: Chapter 01's tower tenancy migration (rb_memberships + has_rb_role).
set search_path to tower, public;

-- 2.3a · The RB product shelf (mirrors tower.products vocabulary; scoped to a
-- represented brand, not a lane/operating-tenant).
create table tower.rb_products (
  id                    uuid primary key default gen_random_uuid(),
  represented_brand_id  uuid not null references tower.represented_brands(id) on delete cascade,
  slug                  text not null,                         -- joins rb_packing_profiles.product_slug
  status                text not null default 'DRAFT'
                          check (status in ('DRAFT','IN_REVIEW','PUBLISHED','RETIRED')),
  category_path         text[] not null default '{}',
  name                  jsonb not null,                        -- {es,en} — same shape ProductEditor writes
  specs                 jsonb not null default '{}',           -- ALLOCATION spec value, validated by Zod (§3)
  spec_schema_id        uuid references tower.spec_schemas(id),-- the versioned ALLOCATION schema row
  hs_code               text,                                  -- SINGLE regulatory home for HS code (NOT also a spec field, §2.4)
  moq                   numeric,                               -- min order (units) — display; slot math stays server-side
  cbm_per_unit          numeric,
  created_by            uuid references tower.profiles(id),
  updated_at            timestamptz default now(),
  created_at            timestamptz default now(),
  unique (represented_brand_id, slug)                          -- brand-scoped uniqueness (replaces unique(lane_id,slug))
);
create index on tower.rb_products (represented_brand_id);
create index on tower.rb_products (status);

-- rb_products.slug ↔ rb_packing_profiles.product_slug is the packing link.
-- NOT a hard FK: product_slug is globally UNIQUE on the shipped table (wave1 L40,
-- a documented deviation) while rb_products.slug is only brand-scoped-unique.
-- Joining on (represented_brand_id, slug=product_slug) preserves both — no
-- destructive alter to the shipped column (append-only law).

-- 2.3b · Publish snapshots (mirror tower.product_versions; append-only truth of
-- what was served publicly at each version).
create table tower.rb_product_versions (
  id            uuid primary key default gen_random_uuid(),
  rb_product_id uuid not null references tower.rb_products(id),
  version       int not null,
  snapshot      jsonb not null,                                -- full product incl. specs at publish
  published_by  uuid references tower.profiles(id),
  published_at  timestamptz default now(),
  unique (rb_product_id, version)
);
create index on tower.rb_product_versions (rb_product_id);

-- 2.3b-bis · RB product media. MediaManager (§4) is REUSED, but its shipped action
-- `attachMedia` (media.ts:155-158) inserts into tower.product_media, whose
-- `product_id` is `not null references tower.products(id)` (tower_02 L44) — an
-- rb_products id would violate that FK. So RB gets a mirrored table (same column
-- vocabulary: storage_path/kind/sort/meta), FK'd to rb_products instead.
create table tower.rb_product_media (
  id            uuid primary key default gen_random_uuid(),
  rb_product_id uuid not null references tower.rb_products(id) on delete cascade,
  storage_path  text not null,
  kind          text not null,
  sort          int not null default 0,
  meta          jsonb not null default '{}'
);
create index on tower.rb_product_media (rb_product_id);
-- The console calls a sibling media action `attachRbMedia` (§3.2) — same
-- signed-URL/buildMediaStoragePath mechanism as attachMedia, retargeted to
-- rb_product_media. (Either this sibling action, or a `product_id`-vs-
-- `rb_product_id` parameterization of the existing action; the mirrored table is
-- the non-negotiable part — MediaManager cannot write into product_media for RB.)

-- 2.3c · The ALLOCATION spec schema — a NEW versioned spec_schemas row, never an
-- edit-in-place (registry.ts:18 law: bumping SPEC_SCHEMA_VERSION = a new row).
-- archetype is free text on the shipped table (tower_02 L6), so 'ALLOCATION' is
-- legal even though ARCHETYPE_CODES (types.ts) still lists six. lane_id NULL =
-- the archetype default (no lane override for RB).
--
-- This is NOT hand-written JSON. Follow the shipped seed convention exactly
-- (`tower_13_seed_spec_schemas.sql`, header: "generated from
-- lib/schemas/spec/registry.ts. Idempotent"): once ALLOCATION is registered in
-- registry.ts (§2.4), REGENERATE the seed so the ALLOCATION block is emitted as
-- inline literal JSON, guarded idempotently. i.e. the migration ships:
--
--   insert into tower.spec_schemas (archetype, lane_id, version, json_schema)
--   select 'ALLOCATION', null, 1, $allocation_schema$
--   { …generated by specFieldsToJsonSchema(ALLOCATION_SPEC_FIELDS)… }
--   $allocation_schema$::jsonb
--   where not exists (select 1 from tower.spec_schemas
--     where archetype='ALLOCATION' and lane_id is null and version=1);
--
-- (Regenerate, never author by hand — the dollar-quoted literal is machine-emitted
-- from the registry so it can never drift from SPEC_JSON_SCHEMA_DEFAULTS.ALLOCATION.)

-- 2.3d · Public read seam — the 4th rb_public_* view (fixture rule: this is the
-- ONLY new site surface; the existing three views are untouched). PUBLISHED rows
-- of LIVE brands only. REVOKE from anon/authenticated; GRANT service_role only —
-- identical posture to the shipped views (wave1 L177-238).
create view public.rb_public_products as
  select p.id, p.slug, p.name, p.category_path, p.specs, p.hs_code, p.moq, p.cbm_per_unit,
         b.slug as brand_slug
  from tower.rb_products p
  join tower.represented_brands b on b.id = p.represented_brand_id
  where p.status = 'PUBLISHED' and b.status = 'LIVE';
revoke all on public.rb_public_products from anon, authenticated;
grant select on public.rb_public_products to service_role;

-- 2.3e · RLS — per-tenant scoping via has_rb_role (Chapter 01's predicate), the
-- SAME regime Chapter 01 puts on the shipped RB tables. RB has NO lane roles, but it
-- DOES have rb_memberships (BRAND_MANAGER / BRAND_OPS / BRAND_VIEWER) keyed on
-- represented_brand_id — so a rep sees/edits ONLY their own brand's products without
-- being group admin. Service-role (the site's read path via the view) bypasses RLS.
alter table tower.rb_products         enable row level security;
alter table tower.rb_product_versions enable row level security;
alter table tower.rb_product_media    enable row level security;

-- rb_products: read for any brand role; write (insert/update) for MANAGER/OPS.
create policy rb_products_read on tower.rb_products for select
  using ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS','BRAND_VIEWER']) );
create policy rb_products_write on tower.rb_products for all
  using ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) )
  with check ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) );

-- versions + media: resolve the brand through the parent product (the join-through-
-- parent shape Chapter 01 uses for rb_slot_allocations; mirrors tower_23 prorrateo).
create policy rb_product_versions_read on tower.rb_product_versions for select
  using ( exists (select 1 from tower.rb_products p where p.id = rb_product_id
          and has_rb_role(p.represented_brand_id,
                          array['BRAND_MANAGER','BRAND_OPS','BRAND_VIEWER'])) );
create policy rb_product_media_all on tower.rb_product_media for all
  using ( exists (select 1 from tower.rb_products p where p.id = rb_product_id
          and has_rb_role(p.represented_brand_id, array['BRAND_MANAGER','BRAND_OPS'])) )
  with check ( exists (select 1 from tower.rb_products p where p.id = rb_product_id
          and has_rb_role(p.represented_brand_id, array['BRAND_MANAGER','BRAND_OPS'])) );

-- 2.3f · Audit — auditing in TOWER is NOT written by the actions; it is the shipped
-- per-table trigger `tower.audit_trigger()` (tower_07_audit_triggers.sql). Attach it
-- to the new RB catalog tables so every mutation lands in tower.audit_log, matching
-- every other TOWER table (same attachment Chapter 01 adds to the shipped RB tables).
create trigger audit_rb_products after insert or update or delete
  on tower.rb_products for each row execute function tower.audit_trigger();
create trigger audit_rb_product_versions after insert or update or delete
  on tower.rb_product_versions for each row execute function tower.audit_trigger();
create trigger audit_rb_product_media after insert or update or delete
  on tower.rb_product_media for each row execute function tower.audit_trigger();
```

**Money law note:** catalog/spec fields carry no money — the only numerics are
`moq`/`cbm_per_unit` (counts/volume). Any ALLOCATION spec field that *is* monetary (e.g.
a price-window reference) must be stored **integer-minor + currency code**, and any rate
as **bps**, never a float — same law the pipeline/quotation layer already honors
(`taxFromBps`, `subtotalFromLines`, quotation.ts). Slot price/quote math is out of this
chapter's scope; it lives on the allocation instrument (Chapter 03) and is server-side
only (§5-bis: display math never overrides).

### 2.4 ALLOCATION spec fields (new file, mirrors the six existing)

Add `apps/tower/src/lib/schemas/spec/allocation.ts` exporting `ALLOCATION_SPEC_FIELDS`
(a `SpecFieldDef[]`, same shape as `EQUIPMENT_SPEC_FIELDS` et al.), then register it:

- `registry.ts` — add `ALLOCATION: ALLOCATION_SPEC_FIELDS` to `SPEC_FIELD_DEFAULTS`
  (`:20`). `SPEC_JSON_SCHEMA_DEFAULTS` and `SPEC_ZOD_DEFAULTS` derive automatically
  (`:31`, `:39`) — the spec-schema side is one map entry, zero downstream branching.
- `archetypes/types.ts` — append `'ALLOCATION'` to `ARCHETYPE_CODES` (`:9-17`). This is
  a Zod enum widening; treat as the framework amendment root §3 requires (ALLOCATION is
  already ratified in §5-bis, so this is registration, not a new-archetype proposal).
- `archetypes/config.ts` — **NOT zero-cost.** `Archetype` is inferred from
  `ARCHETYPE_CODES`, and `ARCHETYPES: Record<Archetype, ArchetypeConfig>` (`:187`) is a
  **total** map, so widening the enum forces a full `ALLOCATION` `ArchetypeConfig` or the
  `.parse` map and its `resolveSpecSchema`/`stagesFor`/`unitsFor` consumers fail to
  typecheck. This chapter must ship that config entry: pipeline `stages`, `unitMath` with
  `per_slot` / `per_container` units (the §3/§5-bis ALLOCATION unit math), and
  `specSchema.defaultSchemaKey`. (Alternatively, scope the widening explicitly — but the
  total-map default is a full config, not an optional add.)

Two datums have a home **elsewhere and are therefore NOT spec fields** (single source of
truth rule): `hs_code` lives on the `rb_products` column (§2.3a, regulatory home), and
`gtin` lives on the shipped `tower.rb_packing_profiles.gtin` (wave1 L43, packing home).
Neither is duplicated into the spec.

Because `productos/page.tsx` renders the full `RbProduct` shape (`fixtures.ts:45-61`:
`unitLabel`, display `specs` rows `{label,value,icon}`, `packing: PackingSpec`,
`explodeAxis`, `explodeCaption`, `pallet: PalletSpec`, `descriptionEs`, `highlights`), the
ALLOCATION field set must cover **all** of it (dimensions + counts + presentation
metadata), and §5.3 must define the view-row → `RbProduct` mapping. Field set:

| `RbProduct` field | ALLOCATION spec source |
|---|---|
| `packing` (`PackingSpec`) | `packing_box_mm {w,d,h}`, `packing_cells {x,z,y}`, `roll_or_slab` (enum `rolls\|slabs`) → the `caja-master`/`caja-exploded` diagram schemas |
| `pallet` (`PalletSpec`) | `pallet_grid {x,y}`, `pallet_layers`, `pallet_skip`, `pallet_box_dims {w,d,h}`, `pallet_note` (localized) → `pallet-stack`/`PalletDiagram` |
| `explodeAxis` / `explodeCaption` | `explode_axis` (enum `y\|z`), `explode_caption` (localized) |
| `unitLabel` | `unit_label` (localized) |
| `specs[]` display rows `{label,value,icon}` | `spec_rows` — array of `{label, value, icon}` where `icon ∈ SpecIconId`; the human-facing fiche table, distinct from the parametric fields above |
| `descriptionEs` / `highlights` | `description` (localized), `highlights` (localized string array) |
| `slug`, `name`, `category_path` | not spec — top-level `rb_products` columns (§2.3a) |

One capture in `SpecForm`, many drawings **and** the full fiche — no field the renderer
needs is left without a source.

---

## 3 · Server actions (API) — new `lib/actions/rb-catalog.ts`

Mirrors `catalog.ts` shape-for-shape; every rep-facing action is
**`requireUser` → Zod → RLS write scoped by `has_rb_role` → append-only version**, with
audit landing via the per-table trigger (§2.3f), never an action-level insert.

### 3.1 The mutation law, mapped to RB reality

The lane catalog's law is `requireUser()` → Zod → RLS via `has_lane_role(lane_id)`
(`catalog.ts:219`, deliberately never an `if (role===…)` gate, `:6-8`). RB has **no
lane**, but Chapter 01 ships the exact analogue — `rb_memberships` + `has_rb_role(
represented_brand_id, …)` — so the RB substitution keeps the RLS path intact, swapping
only the predicate:

- **Auth (rep-facing product actions):** `requireUser()` (`pipeline.ts:302`) → the RLS
  client + the §2.3e `has_rb_role`-keyed policies do the scoping; the action **never**
  branches on role (law comments `catalog.ts:6-8`). This is what confines a
  BRAND_MANAGER rep to their own brand and — critically — lets that rep create/edit
  products **without being group admin**. Reserve `requireGroupAdmin()` (`admin.ts:91`)
  for the *registration-level* acts (minting the brand, granting memberships) that live
  in Chapter 01's `represented-brands.ts`, not here. (The backend-map "no auth" citation
  describes the **site** read seam, not TOWER writes — it does not apply to these
  actions.)
- **Zod:** every input parsed before the write (mirrors `createProduct`'s `parsed =
  schema.safeParse` at `catalog.ts:364`+), **plus** the spec value validated against the
  resolved ALLOCATION Zod object (`SPEC_ZOD_DEFAULTS.ALLOCATION`) — the same guard
  `SpecForm`'s `validateSpecValue` runs client-side (`validate.ts:21`), re-run
  server-side because display never authorizes (§5-bis).
- **RLS:** `rb_products`/`rb_product_versions`/`rb_product_media` are scoped by
  `has_rb_role` (§2.3e), exactly like the shipped RB tables under Chapter 01 — RLS
  remains the only reachable-data boundary (reuse-map invariant "RLS is the only gate").
  Capability functions hide UI only. The RLS client (not a service-role write) is what
  makes "a rep edits only their brand" true in the database.

### 3.2 Actions (each returns `ActionResult<…>`, the shared envelope)

| Action | Mirrors | Behavior |
|---|---|---|
| `listRbProducts(brandId)` | `listProducts` `catalog.ts:231` | Group-admin read of `rb_products` by `represented_brand_id`. |
| `getRbProduct(id)` | `getProduct` `:272` | Single row + resolved schema. |
| `createRbProduct(brandId, input)` | `createProduct` `:364` | Zod-parse `input`; validate `specs` vs ALLOCATION Zod; insert `status='DRAFT'`, `spec_schema_id` = the v1 ALLOCATION row. (Audit row lands via the `audit_rb_products` trigger, §2.3f — not written by the action.) |
| `updateRbProduct(id, patch)` | `updateProduct` `:420` | Editable only while `DRAFT`/`IN_REVIEW` (`canEditStatus`, `catalog-logic.ts`); re-validate specs. (Before/after captured by the audit trigger.) |
| `submitRbForReview(id)` | `submitForReview` `:469` | `DRAFT → IN_REVIEW` (`canSubmitForReview`). |
| `attachRbMedia(id, uploads)` | `attachMedia` `media.ts:155` | Sibling media action → inserts into `tower.rb_product_media` (§2.3b-bis), NOT `product_media` (whose FK targets `tower.products`). Same signed-URL / `buildMediaStoragePath` mechanism. |
| `publishRbProduct(id)` | `publishProduct` `:500` | **Gated write first, then snapshot** (the shipped order, `:530-556`): flip `PUBLISHED`, compute `nextVersionNumber`, insert `rb_product_versions` snapshot, then a **marcas-path** revalidate — `publishProduct` fires `triggerRevalidate({ laneSlug, productSlug })` (`catalog.ts:558`), which is lane-shaped; RB has no lane, so `publishRbProduct` needs a marcas variant/payload (e.g. `triggerRevalidate({ marcasPath: '/marcas/{brand}/productos' })` or a sibling `triggerRbRevalidate`) targeting the `(brands)` route, §5.4. Blocks unless `isCompleteForPublish` (name ES/EN + category) **and** kit/spec-complete (§6). |
| `retireRbProduct(id)` | `retireProduct` `:563` | `PUBLISHED → RETIRED` = the "remove product" path. Never a hard delete. |
| `rollbackRbProduct(id, version)` | `rollbackProduct` `:597` | Restore a `rb_product_versions` snapshot; re-snapshot on republish (append-only). |
| `getRbProductCapabilities(brandId)` | `getLaneCapabilities` `:306` | Presentation-only; extends `ProductCapabilities` (`catalog-logic.ts:21`) with a **`kitComplete`** predicate (reuse map §2) so publish buttons *stay hidden* until the brand kit + spec are complete (structural wiring gate, SPEC §3.1c — hide, don't disable). |

Status/transition guards are **reused verbatim** from `catalog-logic.ts`
(`canPublish`/`canRetire`/`canRollback`/`canEditStatus`) — no RB fork; the
DRAFT→IN_REVIEW→PUBLISHED→RETIRED machine is archetype-agnostic.

**Packing profile writes** (`rb_packing_profiles`) are a sibling action set
(`upsertRbPackingProfile`) on the same auth path — the geometry a rep enters in the
worksheet, joined to the product by `(represented_brand_id, slug=product_slug)`.

---

## 4 · Console UI (component tree)

Every node below is an **existing component re-pointed by props** (reuse-map invariant
"No forked components"), mounted under the new `marcas` module (add to `nav.ts` `MODULES`
`:23-31` + `ModuleId` union `:6-13`; add `'marcas'` to `rbac.ts` `ALL_MODULES` `:16` +
`ROLE_MODULES`).

```
marcas/[brandCode]/productos/               (RB product shelf route — rep-scoped via has_rb_role; group admin sees all)
│
├─ RbProductList  ◄ list/status table pattern from BrandManager (BrandManager.tsx:15)
│   └─ useRepresentedProductsQuery  ◄ sibling of useAdminBrandsQuery (:9), TanStack, same shape
│
└─ ProductEditor  ◄ REUSED (product-editor/ProductEditor.tsx:68) — props only
    ├─ NameFields            name {es,en}                    (existing)
    ├─ CategoryPathEditor    category_path                   (existing)
    ├─ SpecForm  ◄ REUSED (spec-form/SpecForm.tsx:50)
    │     schema = getSpecSchema('ALLOCATION', null, overrideRows)   (resolve.ts:22)
    │     value  = rb_products.specs   onChange → updateRbProduct
    │     └─ renderField switch (:27): LocalizedString | Enum | String | Number | Boolean | Array
    │        (control-room styling only — no @wings/trade-ui, SpecForm.tsx:4-6)
    ├─ PackingProfileFields  ◄ NEW thin fields → rb_packing_profiles (the only net-new input)
    │     also drives PackingDiagram/ExplodedDiagram/PalletDiagram preview (PackingSpec)
    ├─ MediaManager  ◄ REUSED (media-manager/MediaManager.tsx:11)
    │     signed-URL upload → attachRbMedia → tower.rb_product_media (§2.3b-bis, NOT
    │     product_media); storage path via buildMediaStoragePath (catalog-logic.ts:166),
    │     rb/{code}/ prefix — same mechanism as the kit intake
    └─ PublishBar  ◄ REUSED (publish-bar/PublishBar.tsx:14)
          buttons capability-gated (:36-38); showPublish (:37) hidden until
          canPublish && kitComplete (the wiring gate) — calls publishRbProduct
```

`SpecView` (`spec-form/SpecView.tsx`) renders the read-only spec on the review screen —
same schema, no second renderer.

---

## 5 · Public sync (TOWER writes → site reads)

The RB shelf is a **read-only projection of TOWER state** (read-model map): TOWER writes
`tower.rb_products`; the site reads only through the new `public.rb_public_products` view.
Sync chain on publish:

1. `publishRbProduct` flips `status='PUBLISHED'` (gated write) and inserts the
   `rb_product_versions` snapshot — the append-only record of exactly what goes public.
2. `public.rb_public_products` (§2.3d) now exposes the row (PUBLISHED × LIVE brand).
3. A **new loader `getRbProductsForBrand`** in `apps/site/src/lib/rb/data.ts` — the
   service-role, server-only read boundary — reads the view via `.eq('brand_slug', …)`,
   exactly like `getRbTemplateForBrand` (`data.ts:83`) and `getRbContainers` (`:108`).
   This closes only the `productos/page.tsx:33` fixture→TOWER swap marker: the loader
   replaces `ALADIN_PRODUCTS` (fixtures) with the view rows. (It does **not** touch the
   separate `rb_public_brands` loader gap at `data.ts:3` — brand identity/tokens — which
   remains open and belongs to Chapter 01, read-model map §6.)
   **View-row → `RbProduct` mapping:** the loader maps each view row to the fiche's
   `RbProduct` shape (`fixtures.ts:45-61`) by reading `p.specs` (the ALLOCATION spec,
   §2.4): `slug`/`name`/`category_path` from top-level columns; `unitLabel` ← `unit_label`;
   display `specs[]` ← `spec_rows` (`{label,value,icon}`); `packing` ← `packing_box_mm` +
   `packing_cells` + `roll_or_slab`; `explodeAxis`/`explodeCaption` ← `explode_axis`/
   `explode_caption`; `pallet` ← the `pallet_*` fields; `descriptionEs`/`highlights` ←
   `description`/`highlights`. No renderer field is left unsourced (point-for-point §2.4).
4. **Staleness / fiche freshness:** the fiche follows the shipped RB ISR discipline —
   `export const revalidate = 60` (as `contenedor/page.tsx:14`). `publishProduct` fires
   `triggerRevalidate({ laneSlug, productSlug })` (`catalog.ts:558`), which is lane-shaped;
   RB has no lane, so `publishRbProduct` must call a **marcas-path** variant — a payload/
   overload targeting the `(brands)` route (`/marcas/{brand}/productos`), not the lane
   surface — so a publish is visible within one ISR window without re-revalidating any lane
   path. Fixture fallback (`lib/rb/fixtures.ts`) still covers the no-Supabase-env case.
5. **Mister sync is automatic:** `getRbMisterPacks` compiles the `rb-{slug}` pack from the
   same `rb_public_*` views (`misterPack.ts:32`) — so adding
   `rb_public_products.products[]` into the pack means Mister and the shelf can never
   disagree (zero manual pack authoring). Per `misterPack.ts:5-8`, specs enter as
   **structure**, never live counts.

**Fixture rule honored:** exactly one new view added; the three shipped views and the
`rb_reserve` RPC are untouched (backend map §6, "schema changes to these views ripple
across all workstreams").

---

## 6 · Phase-0 gates (must pass before any RB product publishes)

Adapted from the lane Onboarding Protocol Phase 0 + the RB structural wiring gate
(SPEC §3.1c). Publish actions **stay hidden** (not disabled-but-shown) until every gate
is green — the `kitComplete` capability predicate (§3.2) is the enforcement seam:

1. **Archetype confirmed = ALLOCATION** — registered in `ARCHETYPE_CODES` +
   `SPEC_FIELD_DEFAULTS`; the `tower.spec_schemas` ALLOCATION v1 row exists (§2.3c).
   Without it, `getSpecSchema('ALLOCATION',…)` cannot resolve and `SpecForm` cannot render.
2. **Brand is registerable** — `tower.represented_brands` row exists with an
   append-only `RB/xx` code minted via `nextLaneCode` (`admin.ts:365`); `kit_complete =
   true` (contrast/hue/token kit validated). No product publishes under a non-LIVE brand
   (the view filters `b.status='LIVE'`).
3. **Spec sheet complete + valid** — `validateSpecValue` (server re-run) returns zero
   errors for the ALLOCATION schema; `isCompleteForPublish` passes (name ES/EN +
   category). Money-typed spec fields (if any) are integer-minor + bps, never float.
4. **Packing profile present** — a `rb_packing_profiles` row joins on
   `(represented_brand_id, slug)`; the 3-level cascade (unit → package → slot) resolves
   so downstream slot math (`rb_slots_taken`/`rb_reserve`, canonical, never
   reimplemented) has geometry to compute against.
5. **Public seam wired** — `public.rb_public_products` deployed;
   `getRbProductsForBrand` loader live; `productos/page.tsx` reads the view, not the
   fixture; ISR `revalidate = 60` set.
6. **Auth/RLS proven** — every rep-facing `rb-catalog.ts` action runs `requireUser` →
   Zod → RLS write scoped by `has_rb_role(represented_brand_id, …)` (registration-level
   acts stay `requireGroupAdmin`, Chapter 01); a rep sees/edits only their own brand's
   products; capabilities drive UI hiding only. Audit rows land in `tower.audit_log` via
   the `audit_rb_*` triggers (§2.3f) — the shipped `tower.audit_trigger()`, **not** an
   action-level insert — on every mutation.

Definition of done for "add a product to a represented brand": a DRAFT created through
the reused `ProductEditor`, its ALLOCATION spec captured in the reused `SpecForm`, packing
profile attached, published via the reused `PublishBar` behind the `kitComplete` gate,
snapshotted to `rb_product_versions`, and visible on the public fiche through
`rb_public_products` within one ISR window — with zero forked components and zero
destructive schema change.
