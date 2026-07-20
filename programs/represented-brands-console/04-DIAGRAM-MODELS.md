# RB Console · Chapter 04 — The Parametric Diagram-Model Registry

> Scope: how a rep turns the six shipped parametric SVG drawing components into a
> **pick-a-model → fill-dimensions → live-preview → publish** flow, how the chosen
> model + params are stored in TOWER, and how the public fiche renders the *identical*
> drawing from the same code. Grounded in the shipped diagram components
> (`apps/site/src/components/features/{brands,shared,cubicaje}/*`), the shared iso
> engine (`apps/site/src/lib/rb/iso.ts`), the shipped RB core
> (`supabase/migrations/20260710120000_rb_wave1.sql`), the TOWER audit spine
> (`tower_06`/`tower_07`), and the reuse map (`ProductEditor` / `PublishBar` /
> `catalog.ts` / `admin.ts`). **Migration wins over SPEC §3 proposals.**

---

## 1 · What

The six components are **not illustrations** — they are pure, runtime-generated technical
drawings whose geometry is fully derived from a small dimensional/count parameter set. A
rep never draws. A rep **picks a `model_id` and fills its dimensional schema** (mm dims +
integer counts + a ledger triple). Identity comes entirely from tokens (`--rb-*` /
`--csd-*` / `--livery-*`), so every parameter schema is presentation-free — matching
"same box, different livery" (root §1.1) and Prime Directive 5 (numbers exhibited, from
one source).

Today those params are **fixture-only**: `RbProduct.packing` (`PackingSpec`),
`RbProduct.pallet` (`PalletSpec`), `RbProduct.explodeAxis` / `explodeCaption`, all
hand-authored in `apps/site/src/lib/rb/fixtures.ts:44-62` and rendered by the fiche at
`app/(brands)/marcas/[brand]/productos/page.tsx:87,113-120`. There is **no console, no
store, no read path** — a rep cannot choose a model or enter a dimension anywhere. This
chapter builds that missing layer.

### 1.1 The registry (the intelligence, made explicit)

The five distinct components already form a registry of parametric models keyed by cargo
concept. Reconciled into one canonical table:

| `model_id` | Parameter schema (what the rep fills) | Component (source path) | Iso source | Stored? | Data authority |
|---|---|---|---|---|---|
| `caja-master` | `PackingSpec { box{w,d,h}, cells{x,z,y}, detail:'rolls'\|'slabs', title, composition, exploded?:{ axis:'y'\|'z', caption } }` | `PackingDiagram` (`features/brands/PackingDiagram.tsx:16-23`) + `ExplodedDiagram` render mode | inlined COS/SIN (`:25-26`) / `@/lib/rb/iso` | **yes** | caja-máster interior packing (+ exploded view) |
| `pallet-stack` | `PalletSpec { grid{x,z,skip}, layers, boxDims{w,d,h}, note }` | `PalletDiagram` (`features/brands/PalletDiagram.tsx:9-16`) | `@/lib/rb/iso` (`:7`) | **yes** | pallet camada / apilado |
| `container-cupos` | *(runtime props, not a fillable schema)* `{ kind, slots{total,committed,reserved}, selected?, onSelect?, headline?, caption? }` | `ContainerSliceDiagram` (`features/shared/ContainerSliceDiagram.tsx:39-50`) | own cabinet proj. (`:30-31`) | **no** — projection of the live ledger | cupo allocation ledger (ALLOCATION) |
| `container-fit` | *(runtime props, not a fillable schema)* `{ container: ContainerKindSpec, fit: FitResult }` | `ContainerFitDiagram` (`features/cubicaje/ContainerFitDiagram.tsx:18-24`) | `@/lib/rb/iso` (`:8`) | **no** — computed from user dims | cubicaje fit estimation |

Three structural facts from the code drive every decision below:

1. **`caja-master` and the exploded view share one `PackingSpec`.** `ExplodedDiagram`
   imports the type from `PackingDiagram` (`ExplodedDiagram.tsx:6`). They are **one stored
   model with two render modes**: the exploded-only fields (`axis`, `caption`) live as an
   optional `exploded` object **on the `caja-master` params**, not on a separate
   `caja-exploded` row. There is exactly **one storable `model_id` for the caja pair
   (`caja-master`)** — the CHECK constraint (§2.1), the ModelPicker predicate (§5), and the
   loader (§6) all agree on this. `caja-exploded` survives only as a registry *render-mode*
   entry (`storable:false`, `rides:caja-master`), never as a persisted `model_id`.
2. **`container-cupos` and `container-fit` store nothing new.** `container-cupos` is a
   pure projection of the availability triple already emitted by
   `public.rb_public_containers` (`total/committed/reserved`, backend map §4); its only
   dimensional input, `kind`, already lives on `rb_container_templates.kind`.
   `container-fit` is the `/cubicaje` tool — `FitResult` is computed at request time by
   `fit.ts::fitInContainer` from user-entered unit dims and is never a brand asset. **Both
   are marked display-only in the code** (`ContainerSliceDiagram.tsx:9-10`, `fit.ts:3-5`);
   §5-bis makes slot subtraction and packing math server-authoritative. The console
   therefore stores params for exactly the two SKU-geometry models; the two container
   models are *parametrized from existing authorities at render time*.
3. **The container catalog is duplicated and must be reconciled.** `DIMS` in
   `ContainerSliceDiagram.tsx:23-28` (has REEFER, only `l`/`h`) disagrees with
   `CONTAINER_KINDS` in `fit.ts:28-32` (no REEFER, adds `w`/`payload`/`cbm`). The registry
   folds these into **one `CONTAINER_SPECS`** table (§4.4) — the single container-geometry
   source both container models read.

**Net deliverable of this chapter:** a `model_id → Zod schema → component` registry that
lives in `@wings/trade-ui`; a TOWER console panel to pick a model, fill dims, and preview
live; a `tower.rb_diagram_specs` store (append-only, audited) for the two stored models;
one new public view; and the fiche re-pointed at that view — rendering the exact same
component, swap-test safe by construction.

---

## 2 · Data model deltas (SQL)

**Recommendation: a NEW `tower.rb_diagram_specs` table — do NOT extend
`tower.rb_packing_profiles`.** Three grounded reasons:

1. **Cardinality.** `rb_packing_profiles.product_slug` is **`UNIQUE`** (wave1 L40) — one
   physical profile per SKU. But one SKU carries **many** diagram specs (`caja-master`,
   `caja-exploded`, `pallet-stack`, and potentially more views). N specs per product
   cannot be columns on a 1-row-per-product table.
2. **Separation of authority.** `rb_packing_profiles` holds the *immutable logistics
   geometry* — `package_cbm numeric(8,4)`, `package_kg numeric(8,2)`,
   `units_per_package` (wave1 L47-50) — the numbers the slot cascade and Mister's
   `unit_math` derive from. Diagram params (`cells{x,z,y}`, `detail`, `grid{skip}`) are a
   *display projection chosen by a rep* for the drawing. Mixing a mutable presentation
   choice into the immutable geometry table pollutes the profile and risks a second,
   competing number (violates Prime Directive 5: one source). The box `w/d/h` mm dims the
   drawing needs are **not present** in `rb_packing_profiles` today regardless (it stores
   cbm/kg, never linear mm) — so new columns are required either way; a clean table is the
   honest home.
3. **Append-only + non-destructive (extension guidance §6).** A new sibling table adds
   zero destructive `ALTER` to a shipped, prod table.

### 2.1 Migration `20260720140000_rb_wave2_diagram_specs.sql`

```sql
-- ============================================================
-- Represented Brands — Wave 2: parametric diagram-spec store.
-- Sibling to rb_packing_profiles; N specs per SKU, keyed by
-- model_id. Params are presentation-free geometry (mm + counts).
-- Deny-all RLS + service-role, same regime as wave1 (L97-102).
-- ============================================================
set search_path to tower, public;

create table tower.rb_diagram_specs (
  id                    uuid primary key default gen_random_uuid(),
  represented_brand_id  uuid not null
                          references tower.represented_brands(id) on delete cascade,
  product_slug          text not null,               -- joins rb_packing_profiles.product_slug
                                                      -- (text, NOT FK — same deviation as wave1 L15-16)
  model_id              text not null
                          check (model_id in ('caja-master','pallet-stack')),
                          -- the exploded view rides the caja-master row via its optional
                          -- params.exploded {axis,caption} — NOT a separate model_id;
                          -- container-cupos / container-fit are runtime projections, never stored
  params                jsonb not null default '{}', -- the model's schema payload; validated
                                                      -- server-side by the @wings/trade-ui Zod registry
  status                text not null default 'DRAFT'
                          -- two-state machine here (DRAFT↔PUBLISHED) + RETIRE; no IN_REVIEW
                          -- (see §5: PublishBar mounts in its two-state configuration)
                          check (status in ('DRAFT','PUBLISHED','RETIRED')),
  version               int  not null default 1,     -- bumped on each publish snapshot
  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),
  unique (represented_brand_id, product_slug, model_id)  -- one live spec per (SKU, model)
);

create index rb_diagram_specs_brand_idx on tower.rb_diagram_specs (represented_brand_id);
create index rb_diagram_specs_slug_idx  on tower.rb_diagram_specs (product_slug);

-- updated_at maintenance: the extension already provides moddatetime (wave1 uses it);
-- attach it so updated_at is DB-maintained rather than trusted from the action.
create trigger rb_diagram_specs_moddatetime
  before update on tower.rb_diagram_specs
  for each row execute function extensions.moddatetime(updated_at);

-- One-time backfill of the fixture-era flat fields into the new store. Existing SKU
-- geometry lives on RbProduct.packing / .pallet / .explodeAxis / .explodeCaption
-- (fixtures.ts:44-62), never in TOWER. There is no prod row to migrate (the params were
-- fixture-only, §1); the backfill is therefore a data-authoring step run by ops when a
-- brand is first onboarded to the console — folding explodeAxis/explodeCaption into the
-- caja-master params.exploded object — not a destructive SQL migration of live rows.

-- Version history (append-only publish snapshots) — mirrors tower.product_versions.
create table tower.rb_diagram_spec_versions (
  id            uuid primary key default gen_random_uuid(),
  spec_id       uuid not null references tower.rb_diagram_specs(id) on delete cascade,
  version       int  not null,
  model_id      text not null,
  params        jsonb not null,
  snapshot_at   timestamptz default now(),
  snapshot_by   uuid,                                 -- group-admin user id, passed explicitly
                                                      -- by the action (auth.uid() is NULL under
                                                      -- the service-role client — see §3)
  unique (spec_id, version)
);

-- RLS: deny-all to anon/authenticated; access only via service-role + the
-- SECURITY DEFINER public view below. Identical posture to wave1 L97-102.
alter table tower.rb_diagram_specs         enable row level security;
alter table tower.rb_diagram_spec_versions enable row level security;

-- Audit: wave1/wave2 tables are NOT in the tower_07 trigger array (that list
-- predates RB). Attach the shipped generic audit trigger explicitly.
create trigger audit_rb_diagram_specs
  after insert or update or delete on tower.rb_diagram_specs
  for each row execute function tower.audit_trigger();     -- tower_07 fn, unchanged
```

### 2.2 The public read seam (the ONLY site surface)

Add a **fourth** `rb_public_*` view — the three-view contract stays the sole site
boundary (backend map §6 fixture rule). It exposes only PUBLISHED specs of LIVE brands:

```sql
create view public.rb_public_diagrams as
  select b.slug as brand_slug, d.product_slug, d.model_id, d.params
  from tower.rb_diagram_specs d
  join tower.represented_brands b on b.id = d.represented_brand_id
  where d.status = 'PUBLISHED' and b.status = 'LIVE';

revoke all on public.rb_public_diagrams from anon, authenticated;
grant  select on public.rb_public_diagrams to service_role;   -- same grant law as wave1 L232
```

No money, no bps anywhere in this delta: params are dimensionless geometry (integer mm,
integer counts). The **money law is satisfied vacuously** — the diagram layer never
introduces a currency or a competing logistics number; the authoritative cbm/kg stay on
`rb_packing_profiles` (numeric, server-side). Prime Directive 5 preserved.

---

## 3 · Server actions (API) — TOWER writes, auth → Zod → RLS

RB is **brand-scoped, not lane-scoped**: `rb_diagram_specs` has no `lane_id`, so
`tower.has_lane_role(lane_id, …)` (`tower_01:44`, the predicate lane tables gate with,
e.g. `tower_08:53-55`) **cannot apply** — there is no lane to check. This is the exact
case the reuse map calls out: identity/tenant tables have no `lane_id` to scope by
(`admin.ts:8-21`), so RB writes follow the **`requireGroupAdmin()`** regime
(`admin.ts:91`) — authorize (RLS read of `profiles.is_group_admin`, `admin.ts:102`) then
act privileged via `createServiceClient` against the deny-all `tower` tables. The
mutation law thus reads **auth → Zod → (RLS-gated authorize) → service-role write +
append-only snapshot + audit**, the RB specialization of the standard
`auth → Zod → has_lane_role` spine.

**Alternative considered and rejected: `requireUser`.** The reuse map assigns `requireUser`
to *lane-scoped RB data (allocations, packing)* — data a lane operator legitimately writes
within their lane. Diagram specs are **not** lane-scoped (no `lane_id`, §2.1) and they are a
brand-presentation authoring act on a partner shelf, not an operator's day-to-day lane
data. Gating them at `requireUser` would let any authenticated lane user publish another
brand's public drawing. `requireGroupAdmin()` is therefore the correct, narrower gate here;
the `requireUser`/packing row of the reuse map does not govern this table.

New actions in `apps/tower/src/lib/actions/rbDiagrams.ts` (modeled on
`catalog.ts` product lifecycle):

| Action | Signature | Law it honors |
|---|---|---|
| `saveDiagramSpec` | `(brandId, productSlug, modelId, params) → {id, version}` | `requireGroupAdmin()` → **Zod-validate `params` against the registry schema for `modelId`** (§4.1) → service-role `upsert` on `rb_diagram_specs`, `status='DRAFT'`. Audit trigger fires. Models `catalog.updateProduct` (`catalog.ts:420`). |
| `publishDiagramSpec` | `(specId) → void` | `requireGroupAdmin()` **returns the admin's user id** → re-validate params → flip `DRAFT→PUBLISHED`, bump `version`, **insert `rb_diagram_spec_versions` snapshot** with `snapshot_by = <that user id>` passed explicitly into the insert (the service-role client has **no `auth.uid()` context** — null there; capture it action-side exactly as `catalog.publishProduct` does). Then **revalidate the fiche**: `revalidatePath('/marcas/[brand]/productos')` + `revalidateTag('rb-diagrams:'+brandSlug)` so the public render picks up the new geometry (the PublishBar contract's "public-URL + revalidate status", reuse map §4). Mirrors `catalog.publishProduct` version snapshot (`catalog.ts:542-556`). |
| `retireDiagramSpec` | `(specId) → void` | `requireGroupAdmin()` → `PUBLISHED→RETIRED` (never hard delete — append-only law, mirrors `catalog.retireProduct` `catalog.ts:563`). |
| `rollbackDiagramSpec` | `(specId, version) → void` | restore params from a `rb_diagram_spec_versions` row (mirrors `catalog.rollbackProduct` `catalog.ts:597`). |

Zod validation is the **single gate on shape**: the same registry schema used by the
console form (§5) and the public loader map (§6). Invalid dims (negative mm, `skip >
grid.x*grid.z`, `detail` outside `'rolls'|'slabs'`) are rejected here before any write —
never client-trusted (backend map §2: everything display, re-validated server-side).

**Container models write nothing.** `container-cupos` has no save action — its params are
read live from `public.rb_public_containers` via the existing `getRbContainers`
(`data.ts:108`); `container-fit` is computed by `fit.ts` in the `/cubicaje` route. The
console **cannot** create a diagram spec for either `model_id` — the `CHECK` constraint
(§2.1) forbids it, matching the "display-only / server-authoritative" stamp in code.

---

## 4 · The registry contract (lives in `@wings/trade-ui`)

### 4.1 Where the registry lives — the packages/ui vs apps/site boundary

**Decision: the registry, the five diagram components, the iso engine, `TechDraw`, and
`CONTAINER_SPECS` move into `packages/ui/src/organs/diagrams/` (`@wings/trade-ui`).**

The forcing constraint: the **console lives in `apps/tower`** (reuse map — RB console
extends `BrandManager`, `PublishBar`, etc.) and the **fiche lives in `apps/site`**. Both
must render the *byte-identical* drawing from the *same code* (that is the whole point of
"live preview == public render"). A component sitting in `apps/site/src/components` is
unreachable from `apps/tower`. The only place both apps import from is `packages/*`.
This is also precisely the shared-organ law: `ContainerSliceDiagram` is already documented
as *"the shared visual grammar for BOTH cupo products"* (`ContainerSliceDiagram.tsx:4-6`),
sitting in `features/shared/` — it is a `FillMeter`-class organ (`packages/ui/src/organs/`)
that never got promoted. The diagram registry is "one brain, many mouths" (root §1.4) for
drawings.

Boundary, precisely:

```
packages/ui/src/organs/diagrams/          ← @wings/trade-ui (frozen, token-only)
  registry.ts        model_id → { schema: ZodType|null, component, iso, storable }
  iso.ts             the shared projection engine (moved from apps/site/src/lib/rb/iso.ts)
  containerSpecs.ts  CONTAINER_SPECS + the ContainerKindSpec / FitResult TYPES (§4.4)
  PackingDiagram.tsx · ExplodedDiagram.tsx · PalletDiagram.tsx
  ContainerSliceDiagram.tsx · ContainerFitDiagram.tsx
  TechDraw.tsx       animation wrapper (orthogonal — data-td-* attrs only)

apps/site  imports { PackingDiagram, diagramRegistry } from '@wings/trade-ui'  (fiche)
apps/tower imports the SAME symbols                                             (console preview)
```

**Dependency inversion — resolved, not ignored.** `ContainerFitDiagram.tsx:9` currently
imports `ContainerKindSpec` / `FitResult` from `@/lib/cubicaje/fit` — an *app* module. A
frozen package cannot import from an app. Resolution: the two **types** (`ContainerKindSpec`,
`FitResult`) move into `containerSpecs.ts` in the package; `fitInContainer` (the compute
function) **stays in `apps/site/src/lib/cubicaje/fit.ts`** — it is app/route logic, not a
render organ — and is re-pointed to import those types (and `CONTAINER_SPECS`) *from*
`@wings/trade-ui`. Direction is now correct: app → package only. `container-fit` is computed
in `/cubicaje` (app) and passed as props to the package component; the package never reaches
back into the app.

**Package dependencies — a real, named cost.** `@wings/trade-ui/package.json` today peers
only `framer-motion` / `react` / `react-dom`. The move pulls in `gsap`, `gsap/ScrollTrigger`,
`@gsap/react` (`TechDraw.tsx:17-19`) and `zod` (the registry's `schema: ZodType`). **Decision:
declare all four as `peerDependencies`** (not bundled deps) so consumers dedupe them and the
frozen package adds no hard runtime weight of its own. This is an acknowledged architectural
cost — every `@wings/trade-ui` consumer now carries GSAP in its graph (bundle weight, and GSAP
licensing must be confirmed for the org before this lands). If that cost is rejected, the
fallback is to leave `TechDraw` app-side and expose only the static diagram organs from the
package — but that reopens the "one definition, two importers" gate (§7.1), so peer-dep is the
recommended path. Either way the decision is explicit and must be ratified before the move.

- **Params schema (Zod) is the shared contract**, exported from `registry.ts`, imported by
  three call sites that must never disagree: the console form (§5), the TOWER server action
  (§3), and the site loader map (§6). One schema, three consumers — the same "one math,
  two consumers" pattern the cost sheet uses (`costing/export.ts:13`).
- **`ContainerFitDiagram`** stays hardcoded to the blueprint dark palette
  (`ContainerFitDiagram.tsx:12-15`) because it only ever renders in `/cubicaje` contained
  mode — that is acceptable *only* because it is single-context; it still moves to the
  package so `container-fit` resolves through one registry, but its entry is flagged
  `context:'cubicaje-dark'` (not `--rb-*` themable). All others are token-only and pass the
  swap test unchanged.
- **`TechDraw` is not a registry axis.** No component carries animation params
  (`TechDraw.tsx:4-13` is attribute-driven, `data-td-*`); wrapping is a host-page decision.
  The registry schema stays animation-free.

### 4.2 Registry shape

```ts
// packages/ui/src/organs/diagrams/registry.ts
// schema: a ZodType ONLY where a write gate exists (storable models). Non-storable
// models carry schema:null and a TS props type — a Zod schema cannot (and must not)
// describe a runtime callback prop like onSelect, and nothing ever validates them
// (they are never written).
export const diagramRegistry = {
  'caja-master':     { schema: PackingSpecSchema, component: PackingDiagram,        iso: 'inline',   storable: true,  renderModes: ['packing','exploded'] },
  'caja-exploded':   { schema: null,              component: ExplodedDiagram,       iso: 'shared',   storable: false, ridesOn: 'caja-master' },
  'pallet-stack':    { schema: PalletSpecSchema,  component: PalletDiagram,         iso: 'shared',   storable: true },
  'container-cupos': { schema: null,              component: ContainerSliceDiagram, iso: 'cabinet',  storable: false, source: 'rb_public_containers' /* props: CuposProps */ },
  'container-fit':   { schema: null,              component: ContainerFitDiagram,   iso: 'shared',   storable: false, source: 'cubicaje/fit', context: 'cubicaje-dark' /* props: FitProps */ },
} as const
```

Only `caja-master` and `pallet-stack` are storable, and only they carry a Zod schema —
those are the two rows the CHECK constraint (§2.1) permits. `PackingSpecSchema` /
`PalletSpecSchema` are the Zod mirrors of the shipped TS interfaces
(`PackingDiagram.tsx:16-23`, `PalletDiagram.tsx:9-16`) — no invented fields; the exploded
view is an optional `exploded` object *inside* `PackingSpecSchema` (§4.3), not its own
schema. The three `storable:false` entries (`caja-exploded`, `container-cupos`,
`container-fit`) are render-only registry rows: `schema:null`, described by TS props types
(`CuposProps`, `FitProps`) rather than validators, since no write path ever parses them.

### 4.3 The two stored schemas (real props only)

```ts
export const PackingSpecSchema = z.object({           // caja-master (drives BOTH render modes)
  box:   z.object({ w: z.number().int().positive(),
                    d: z.number().int().positive(),
                    h: z.number().int().positive() }), // interior mm (x,z,y)
  cells: z.object({ x: z.number().int().positive(),
                    z: z.number().int().positive(),
                    y: z.number().int().positive() }),
  detail: z.enum(['rolls','slabs']),
  title:  z.string(), composition: z.string(),
  // exploded-view add-on — optional; present when the SKU also ships an exploded drawing.
  // Lives HERE (not on a separate caja-exploded row) so it persists under the one
  // storable model_id the CHECK permits. ExplodedDiagram reads box/cells/detail + these.
  exploded: z.object({ axis: z.enum(['y','z']), caption: z.string() }).optional(),
})
export const PalletSpecSchema = z.object({             // pallet-stack
  grid: z.object({ x: z.number().int().positive(),
                   z: z.number().int().positive(),
                   skip: z.number().int().min(0) }),
  layers:  z.number().int().positive(),
  boxDims: z.object({ w: z.number().int().positive(),
                      d: z.number().int().positive(),
                      h: z.number().int().positive() }),
  note: z.string(),
}).refine(s => s.grid.skip < s.grid.x * s.grid.z, 'skip must leave ≥1 filled cell')
```

The `refine` encodes the honest-count rule already in `PalletDiagram.tsx:10-13` (skip
blanks cells so 5 reads as 3×2−1). `box`/`boxDims` are integer mm; `cells`/`grid`/`layers`
integer counts — no floats, no money. `PackingDiagram` auto-scales mm→px to 210 px
(`PackingDiagram.tsx:32-33`), so the schema stores true dims, never pixels.

### 4.4 `CONTAINER_SPECS` — reconciling the two container authorities

```ts
// packages/ui/src/organs/diagrams/containerSpecs.ts — the single container-geometry source.
// fitReady:true means all four fit inputs (l/w/h + payload + cbm) are present, so
// fitInContainer may run for that kind. REEFER is NOT fit-ready: its w/payload are not in
// either shipped source and its cbm is unknown — fit excludes it until ops supplies them.
export const CONTAINER_SPECS = {
  '20GP':  { label: "20' Standard", l: 5898,  w: 2352, h: 2393, payload: 28200, cbm: 33.2, fitReady: true },
  '40GP':  { label: "40' Standard", l: 12032, w: 2352, h: 2393, payload: 28200, cbm: 67.7, fitReady: true },
  '40HC':  { label: "40' High-Cube", l: 12032, w: 2352, h: 2698, payload: 28500, cbm: 76.4, fitReady: true },
  // REEFER: l/h are from DIMS (verified). w/payload/cbm are NOT in either source —
  // ops-supplied TBD, not reconciliation. Kept for the slice drawing (l/h only);
  // fitReady:false so container-fit skips it rather than dividing by a null cbm.
  REEFER:  { label: "Reefer", l: 11560, /* w */ w: null, h: 2500, /* payload */ payload: null, /* cbm */ cbm: null, fitReady: false },
} as const
```

Merges `DIMS` (`ContainerSliceDiagram.tsx:23-28`, the REEFER row + `l`/`h`) with
`CONTAINER_KINDS` (`fit.ts:28-32`, which also carries `label`, `w`, `payload`, `cbm`). The
`label` field is **kept** — deleting `CONTAINER_KINDS` (gate 4) would otherwise orphan the
`/cubicaje` kind labels ("20' Standard"…). Nullable `w`/`payload`/`cbm` on REEFER widen the
type off a naive numeric `as const`; `ContainerKindSpec` types them `number | null`, and
`fitInContainer` **guards on `fitReady`** (kinds where it is false are excluded from the
selector / return a "fit unavailable, ops-gated" result) so no math ever touches a null.
Both container components read this one table; `ContainerSliceDiagram`'s
unknown-kind→40HC fallback (`:40,62`) — which needs only `l`/`h`, present for REEFER —
and `fit.ts`'s three-kind list become one catalog. **`kind` still originates from
`rb_container_templates.kind`** (wave1 L58) — `CONTAINER_SPECS` only supplies the geometry
for that kind, never a second source of truth for which containers exist.

---

## 5 · Console UI (component tree)

The panel is a new tab inside the RB product editor (reuse map §4: RB products ride
`ProductEditor`; the packing profile is the one new input). It re-mounts shipped blocks —
**no forked components** (reuse-map invariant).

```
<DiagramSpecPanel>                                  apps/tower/.../rb/DiagramSpecPanel.tsx
│  props: { brandId, productSlug }                   (mounts beside SpecForm in ProductEditor)
│
├─ <ModelPicker>                                     radio row over diagramRegistry keys
│    caja-master · pallet-stack                        where storable === true ONLY
│    (the picker predicate and the §2.1 CHECK agree: only these two model_ids can be saved.
│     caja-exploded / container-cupos / container-fit are storable:false — shown READ-ONLY,
│     "exploded view (rides caja-master) / projected from ledger / cubicaje")
│
├─ <DimensionForm modelId>                           schema-driven, exactly like SpecForm:27
│    renders one input per Zod field of diagramRegistry[modelId].schema
│    · box.w/d/h, cells.x/z/y, detail(select), title, composition,   (caja-master)
│      + optional exploded{axis(select),caption} sub-fieldset          (same caja-master row)
│    · grid.x/z/skip, layers, boxDims.w/d/h, note                    (pallet-stack)
│    onChange → local params → Zod parse (client mirror) → error surface
│
├─ <LivePreview modelId params>                      THE SAME component the fiche renders
│    const { component: C } = diagramRegistry[modelId]
│    <C spec={params} />          ← @wings/trade-ui, wrapped in a [data-brand] node whose
│                                    --rb-* tokens come from the brand's identity kit
│                                    (jsonb, Chapter 01) injected as inline style vars — see below
│    (re-renders on every valid params change — no server round-trip for preview)
│
└─ <PublishBar>                                      reused (PublishBar.tsx:14), two-state config
     DRAFT ↔ PUBLISHED only — RETIRE for withdraw. This table's status machine has NO
     IN_REVIEW (§2.1 CHECK), so PublishBar mounts with its review affordance suppressed
     (submitForReview button hidden via the capability flag, same mechanism catalog uses to
     hide publish); the bar drives DRAFT→PUBLISHED directly. No submitDiagramForReview action.
     showPublish hidden until params validate + kit_complete (wiring-gate, §7)
     buttons call saveDiagramSpec / publishDiagramSpec (§3)
```

**Preview theming (why `[data-brand]` works in `apps/tower`).** The tower app has no RB
livery CSS of its own — there is no global `[data-brand="…"]` stylesheet there. The console
therefore reads the brand's `--rb-*` values from its **identity kit** (the `identity` jsonb
compiled in Chapter 01) and injects them as **inline CSS custom properties** on the preview
wrapper (`style={{ '--rb-accent': kit.accent, … }}`). That is exactly the token set the
fiche resolves in `apps/site`, so the preview is faithful. If a brand's kit is incomplete,
the preview renders with fallback `--rb-*` (unthemed neutral) rather than blocking — the
geometry, which is what the rep is authoring, is identical regardless of theme.

Live preview is guaranteed faithful because `<LivePreview>` imports the **identical
component from `@wings/trade-ui`** that the fiche imports — not a console-only mock. What
the rep sees is what ships. Nav/module wiring: add `'marcas'` to `MODULES`
(`nav.ts:23-31`) and `ALL_MODULES` (`rbac.ts:16`) exactly as the reuse map prescribes;
this panel needs no new module of its own.

Capabilities drive **hiding only** (never enforcement): a `computeDiagramCapabilities`
predicate returns `{ canPublish: isGroupAdmin && kitComplete && paramsValid }`. Its auth
input is **`profiles.is_group_admin`** — NOT `DbLaneRole`. There is no lane membership row
for a lane-less table (§3), so `DbLaneRole` is undefined here; the `DbLaneRole`-vs-`rbac.ts`
`Role` reconciliation flag governs *lane-scoped catalog* capabilities (`catalog-logic.ts:21`),
not this brand-scoped one. RLS in `rb_diagram_specs` (deny-all + service-role behind
`requireGroupAdmin()`) is the *real* gate; the button state is presentation.

---

## 6 · Public sync — identical render on the fiche

The fiche swaps from fixtures to the view with **zero component change**. New loader in
`apps/site/src/lib/rb/data.ts` (service-role, server-only), sibling to
`getRbTemplateForBrand` (`data.ts:83`):

```ts
// data.ts — reads the fourth view, validates each row via the registry, maps into params.
// Same {data,error} + fixture-fallback shape as getRbTemplateForBrand (data.ts:83).
export async function getRbDiagramsForProduct(brandSlug: string, productSlug: string) {
  if (!hasSupabaseEnv()) return null            // → caller uses the fixture fallback below
  const { data, error } = await sb.from('rb_public_diagrams')
    .select('model_id, params')
    .eq('brand_slug', brandSlug).eq('product_slug', productSlug)
  if (error || !data) return null               // fail soft to fixtures, never throw on fiche
  const out: Record<string, unknown> = {}
  for (const r of data) {
    const entry = diagramRegistry[r.model_id]   // only storable rows appear in the view
    // validate with the SAME @wings/trade-ui schema used on write (§4.3); skip bad rows
    const parsed = entry?.schema?.safeParse(r.params)
    if (parsed?.success) out[r.model_id] = parsed.data
  }
  return out                                    // { 'caja-master': …, 'pallet-stack': … }
}
```

Fiche re-point (`app/(brands)/marcas/[brand]/productos/page.tsx:87,113-120`), swapping
`product.packing` / `product.pallet` (fixtures) for the loaded specs. The view emits only
the storable rows (`caja-master`, `pallet-stack`); the exploded drawing reads its
`axis`/`caption` from **`caja-master.exploded`**, never a nonexistent `caja-exploded` key:

```tsx
const dg = await getRbDiagramsForProduct(brand.slug, product.slug)
         ?? fixtureDiagrams(product)          // fixture fallback (see below)
const cm = dg['caja-master']
<PackingDiagram  spec={cm} />
{cm.exploded && <ExplodedDiagram spec={cm} axis={cm.exploded.axis}
                                           caption={cm.exploded.caption} />}
<PalletDiagram   spec={dg['pallet-stack']} />
```

The exploded view correctly reuses the `caja-master` `PackingSpec` (the "one stored model,
two render modes" fact from §1.1), reading only the optional `exploded.axis`/`.caption`
folded onto that same row — so there is never an undefined `dg['caja-exploded']`. The
`container-cupos` diagram on the container page (`app/contenedor/[id]/page.tsx`) keeps
reading `container.slots` from `getRbContainerById` (`data.ts:120`) — **unchanged**, since
its params are the live ledger triple, never a stored diagram spec (§3). ISR staleness
rule holds: container fill stays `revalidate = 60` (`contenedor/page.tsx:14`). Diagram
geometry is immutable-per-publish, so the fiche need not poll: `publishDiagramSpec` (§3)
fires `revalidateTag('rb-diagrams:'+brandSlug)` (and `revalidatePath` on the productos
route) at publish, and `getRbDiagramsForProduct`'s fetch is tagged with the same
`rb-diagrams:{brandSlug}` cache tag — so a publish, and only a publish, invalidates the
rendered geometry. No time-based `revalidate` is set on the diagram read.

Fixture fallback: `fixtureDiagrams(product)` adapts the existing `fixtures.ts`
`RbProduct.packing` / `.pallet` / `.explodeAxis` / `.explodeCaption` (`fixtures.ts:44-62`)
into the same `{ 'caja-master': …(with .exploded), 'pallet-stack': … }` shape the loader
returns — folding the flat `explodeAxis`/`explodeCaption` into `caja-master.exploded`. It is
the Supabase-env-absent path (backend map preamble), used whenever
`getRbDiagramsForProduct` returns `null` — the fallback, never the source of record.

---

## 7 · Phase-0 gates (all must pass before this ships)

1. **Single-source render (the core gate).** The console preview and the public fiche must
   import the *same* component symbol from `@wings/trade-ui`. Grep proof: no diagram
   component may remain under `apps/site/src/components/features/**` or be duplicated in
   `apps/tower`. One definition, two importers.
2. **Swap test (root §4 QA-6).** Render a `caja-master`/`pallet-stack` spec under
   `[data-brand="aladin"]` then under a second brand's `--rb-*` tokens — geometry
   identical, only ink/accent change. Params carry zero styling (§4.3), so this passes by
   construction; the gate proves no component-level override crept in.
3. **Token lint (root §4 QA-2 / Prime Directive 3).** Zero raw hex/px in the moved
   components except the sanctioned `ContainerFitDiagram` blueprint constants
   (`:12-15`, single dark-context, flagged `context:'cubicaje-dark'`). All others resolve
   through `--csd-*` / `--rb-*` / `--livery-*`.
4. **Container-catalog reconciliation.** `CONTAINER_SPECS` (§4.4) is the only container
   geometry table; `DIMS` and `CONTAINER_KINDS` are deleted and both container components
   import the merged one. `kind` still sourced from `rb_container_templates.kind`.
5. **Mutation law.** Every write goes `requireGroupAdmin()` → Zod-validate against the
   registry schema → service-role write → append-only version snapshot → audit trigger
   fires (`audit_rb_diagram_specs`). No client-trusted params reach the DB. No hard
   deletes (RETIRE only).
6. **RLS boundary.** `rb_diagram_specs` / `_versions` ship deny-all + service-role;
   `rb_public_diagrams` is `REVOKE`d from anon/authenticated, `GRANT`ed to `service_role`
   only — the three-view contract becomes four, still the sole site seam.
7. **Money/number law.** No currency, no bps, no float in diagram params (integer mm +
   integer counts). The authoritative cbm/kg stay on `rb_packing_profiles`; the diagram
   layer never emits a competing logistics number (Prime Directive 5).
8. **Display-only containers.** `container-cupos` / `container-fit` have `storable:false`
   and a `CHECK` constraint (§2.1) forbidding their `model_id` in `rb_diagram_specs`;
   they parametrize from the ledger / `fit.ts` at render time, never from a stored spec.
9. **Reduced motion + keyboard (root §4 QA-5).** `TechDraw`'s reduced-motion branch
   (`TechDraw.tsx:42-46`, finished drawing, slabs pre-placed) unaffected by the move;
   `ContainerSliceDiagram` `onSelect` keyboard parity preserved.

Payoff protected (root closing law): the registry makes model N+1 a *schema entry + a
component in one package*, not a new drawing pipeline. Adding a future model (e.g. a
crate-nesting view) costs one registry row, one Zod schema, one component — never a fork,
never a second store.
