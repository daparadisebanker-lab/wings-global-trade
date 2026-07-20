# RB Console — Build Prompt (wave-by-wave)

**Read first:** [`SPEC.md`](./SPEC.md) (merge rulings R1–R20 — binding), [`DATA_MODEL.sql`](./DATA_MODEL.sql) (the DB authority, sectioned §1–§5 per wave), then the owning chapter per wave. Where a chapter conflicts with SPEC rulings, SPEC wins. Do not start any wave until Muaaz activates this program.

Global rules for every wave:

- Migrations: carve the wave's section from `DATA_MODEL.sql` verbatim into its numbered file (`tower_25`…`tower_29`, or next free integers if the tree moved). Never manual prod SQL; never alter shipped objects destructively.
- Every mutation: `requireUser()` → Zod → RLS via `has_rb_role` (brand-scoped) or `requireGroupAdmin()` (tenant registry only). Actions never branch on role. All actions return `ActionResult<T>`.
- Reuse first, fork never: shipped organs re-pointed through props. Any shared-organ touch → run the swap test against ≥2 brands/lanes.
- Token lint zero raw values; no retail vocabulary in any locale; capabilities hide UI only — RLS + DB checks are the gate.

---

## Wave 0 — Shared packages (Ch 04 §4.1 + SPEC R6/R7) · no schema, no behavior change

**Gate before starting:** Muaaz ratifies GSAP (+ zod) as `@wings/trade-ui` peerDependencies (Ch 04 §4.1 cost note).

**Create:**
- `packages/rb-core/` (`@wings/rb-core`): lift `slotsForQuantity`, `cascadeForSlots` from `apps/site/src/lib/rb/packing.ts`; lift `RbContainerTemplate`, `PackingCascade` types (+ a new `RbPackingProfile` type per R18, adding `packageCbm`/`packageKind` per Ch 05 §3.3's template-extension note). `cascadeForSlots` signature takes profile + packagesPerSlot explicitly (R18).
- `packages/ui/src/organs/diagrams/`: move `PackingDiagram`, `ExplodedDiagram`, `PalletDiagram`, `ContainerSliceDiagram`, `ContainerFitDiagram`, `TechDraw`, `iso.ts` (from `apps/site/src/lib/rb/iso.ts`), and new `containerSpecs.ts` merging `DIMS` + `CONTAINER_KINDS` into `CONTAINER_SPECS` (Ch 04 §4.4, REEFER `fitReady:false`). Move the `ContainerKindSpec`/`FitResult` types here; `fitInContainer` stays in `apps/site/src/lib/cubicaje/fit.ts` and imports them from the package (dependency direction: app → package only).

**Extend:** `apps/site` — re-point all diagram/iso/packing imports to `@wings/trade-ui` / `@wings/rb-core`; `apps/site/src/lib/rb/packing.ts` becomes a re-export shim; delete `DIMS`/`CONTAINER_KINDS` once both components read `CONTAINER_SPECS`. `packages/ui/package.json` gains the peer deps.

**Done-check:** repo grep proves no diagram component remains under `apps/site/src/components/features/{brands,shared,cubicaje}` and only one container-geometry table exists; `pnpm swap-test` passes; site builds and renders fiche + `/cubicaje` pixel-identically; reduced-motion branch of `TechDraw` unaffected.

---

## Wave 1 — Tenancy + brand console (Ch 01 · DATA_MODEL §1)

**Migration:** `tower_25_rb_console` = DATA_MODEL §1 (memberships, `has_rb_role`, RLS on five shipped RB tables + column revoke on `status`/`kit_complete`, audit triggers, widened `rb_public_brands`).

**Create:**
- `apps/tower/src/lib/actions/represented-brands.ts` + `represented-brands-logic.ts` (pure, testable): `registerRepresentedBrand` (mints RB/xx via `nextLaneCode(_, 'RB')`; emits the registry.md one-liner for ops), `listRepresentedBrands` (**`requireUser`** — RLS returns only held brands), `setRepresentedBrandMemberships` (group-admin; `diffMemberships` pattern), `setRepresentedBrandStatus` (with `canTransitionRbStatus`; kit gate blocks leaving `ONBOARDING` unless `kit_complete`), `saveBrandKit` (rbKitSchema per Ch 01 — **hero ≥3, about ≥2** is canonical, R15; contrast/hue/`surface-tint ≤4%` validators; `kit_complete` set service-role only). Do NOT add packing/template/container actions here (R9 — owned by Waves 2/3).
- `apps/tower/src/app/(shell)/marcas/`: `RepresentedBrandManager` (BrandManager pattern), `BrandKitPanel` (`RbTokenContractForm` + reused `MediaManager` → `rb/{code}/…` + `KitCompletenessMeter`), `RepMembershipMatrix`, `useRepresentedBrandsQuery`. `computeRbCapabilities` drives hide-only publish.

**Extend:** `apps/tower/src/lib/nav.ts` (+`marcas` module, tag `MRC`), `rbac.ts` (`ALL_MODULES` + `ROLE_MODULES`); `apps/site/src/lib/rb/data.ts` — new `getRbBrands` loader on the widened view; `marcas/[brand]/layout.tsx` reads `[data-brand]` tokens from the view instead of `fixtures.ts` (fixture fallback kept).

**Done-check:** a rep with one membership lists exactly one brand (proven via RLS client, not TS); direct PostgREST `PATCH status=LIVE` as a rep is refused by the column revoke; audit rows land for every brand mutation; retire = `PAUSED`/`ENDED` flip, row survives, brand drops off `rb_public_brands`; Phase-0 gate G-A checklist surfaces on `BrandKitPanel`; swap test on the shelf with two brands' kits.

---

## Wave 2 — Catalog + specs (Ch 02 with R1/R8/R12 · DATA_MODEL §2)

**Migration:** `tower_26_rb_catalog` = DATA_MODEL §2. The ALLOCATION seed block is regenerated from `registry.ts` (tower_13 convention), never hand-authored.

**Create:**
- `apps/tower/src/lib/schemas/spec/allocation.ts` — `ALLOCATION_SPEC_FIELDS`, **R1 field set only**: `unit_label`, `spec_rows[]` (`{label,value,icon}`), `description`, `highlights`. NO packing/pallet/explode geometry (that is Wave 4's store).
- `apps/tower/src/lib/actions/rb-catalog.ts`: `listRbProducts` (**`requireUser`**, R8), `getRbProduct`, `createRbProduct`, `updateRbProduct`, `submitRbForReview`, `attachRbMedia` (→ `rb_product_media`, never `product_media`), `publishRbProduct` (gated write → version snapshot → marcas-path revalidate variant), `retireRbProduct` (**with the R14 guard**: fail `RB_PRODUCT_IN_LIVE_COMPOSITION` while referenced by a PUBLISHED template or OPEN/FILLING container), `rollbackRbProduct`, `getRbProductCapabilities` (adds `kitComplete`), `upsertRbPackingProfile` (**with the R12 guard**: global product_slug pre-check; on collision fail with brand-qualified-slug guidance).
- `apps/tower/src/app/(shell)/marcas/[brand]/productos/`: `RbProductList` + reused `ProductEditor`/`SpecForm` (schema = `getSpecSchema('ALLOCATION', null)`)/`PackingProfileFields`/`MediaManager`/`PublishBar` (hidden until `canPublish && kitComplete`).

**Extend:** `registry.ts` (`SPEC_FIELD_DEFAULTS.ALLOCATION`), `archetypes/types.ts` (`ARCHETYPE_CODES` + `'ALLOCATION'`), `archetypes/config.ts` (full `ALLOCATION` `ArchetypeConfig` — the total map forces it); `apps/site/src/lib/rb/data.ts` — `getRbProductsForBrand` mapping view rows → `RbProduct` **presentation fields only** (`unitLabel`, `specs[]`, `descriptionEs`, `highlights`, `gtin`); `packing`/`pallet`/`explode` stay on fixtures until Wave 4.

**Done-check:** a rep creates→reviews→publishes→retires a product entirely through reused components; spec re-validated server-side; snapshot in `rb_product_versions`; fiche shows the published row within one ISR window (revalidate 60); retire guard fires when a live template references the profile; slug collision across brands is caught at authoring time; audit rows on every mutation; zero forked components.

---

## Wave 3 — Containers + availability (Ch 03 with R5/R13/R16/R19 · DATA_MODEL §3)

Ch 03's "§24.3/§24.4" citations mean Ch 01 §25.3/§25.4 (R16).

**Migration:** `tower_27_rb_availability` = DATA_MODEL §3 (allocation UPDATE policy + column revoke, `rb_set_allocation_status`, `rb_release_expired` + pg_cron schedule, `rb_container_availability` security_invoker view). No audit triggers here — §1 attached them.

**Create:**
- `apps/tower/src/lib/actions/rb-containers.ts` + `rb-containers-logic.ts`: `saveRbTemplate`, `publishRbTemplate`, **`retireRbTemplate`** (R13: fail `RB_TEMPLATE_IN_USE` while an OPEN/FILLING container references it), `openRbContainer` (code minted server-side via extended `computeNextContainerCode` → `RB01-40HC-001`; requires PUBLISHED template), `setRbContainerStatus` (new `canTransitionRbContainerStatus`, forward-only, CANCELLED from any non-SHIPPED), `listRbAvailability` (reads the §3.4 view under the RLS client), `convertQuantity` (loads template, calls `@wings/rb-core` `slotsForQuantity` — no SQL math), `setAllocationStatus` (rpc `rb_set_allocation_status`; string-match `RB_INVALID_TRANSITION`/`RB_ALLOCATION_NOT_FOUND`), `reserveRbSlots` (authorize-then-privileged-act: `requireUser` + membership check → service client → `public.rb_reserve`; never re-granted, never cloned), `computeRbContainerCapabilities`.
- `apps/tower/src/app/(shell)/marcas/[brand]/contenedores/`: `TemplateWorksheet` (composition picker from Wave-2 products/profiles; diagram previews via `@wings/trade-ui` from Wave 0; live cascade read-out; `PublishBar`), `ContainerBoard` (open form, lifecycle actions, availability table, `FillMeter` + `ContainerSliceDiagram`), `SlotAllocationGrid` (rows + status actions + `SlotGrid` + «Reservar cupo»).
- n8n: the R19 watcher (daily count of RESERVED rows expired >24h → ops alert). n8n never runs the sweep.

**Done-check:** a rep drafts+publishes a template, opens a container, and it appears on the public shelf FillMeter within 60s; `available` on the console equals the shelf's `total − committed − reserved`; a rep can CONFIRM an allocation (RLS UPDATE path works — R5) but a direct PATCH of `slots` is refused by the column revoke; last slot cannot be double-sold (`RB_INSUFFICIENT_SLOTS`); expired reservation swept by cron and detected by the watcher when cron is disabled in a test; `retireRbTemplate`/`retireRbProduct` guards fire; gate G-C checklist on `ContainerBoard`.

---

## Wave 4 — Diagram registry (Ch 04 REBASED per R2/R17 · DATA_MODEL §4)

**Migration:** `tower_28_rb_diagrams` = DATA_MODEL §4 (has_rb_role RLS — NOT Ch 04 §3's group-admin/deny-all regime).

**Create:**
- `packages/ui/src/organs/diagrams/registry.ts`: `diagramRegistry` (Ch 04 §4.2) + `PackingSpecSchema`/`PalletSpecSchema` (§4.3, exploded rides caja-master). Only `caja-master`/`pallet-stack` storable — matches the CHECK.
- `apps/tower/src/lib/actions/rb-diagrams.ts`: `saveDiagramSpec`, `publishDiagramSpec`, `retireDiagramSpec`, `rollbackDiagramSpec` — all **`requireUser()` → Zod (registry schema) → RLS** (R2). `publishDiagramSpec`: re-validate → refuse unless parent `rb_products` row is `PUBLISHED` (R17, `RB_PRODUCT_NOT_PUBLISHED`) → flip + bump version + snapshot (`snapshot_by` defaults to `auth.uid()`) → `revalidateTag('rb-diagrams:'+brandSlug)` + `revalidatePath` on the productos route.
- `apps/tower/…/productos/[slug]/DiagramSpecPanel.tsx` (mounts beside `SpecForm` in `ProductEditor`): `ModelPicker` (storable only), `DimensionForm` (schema-driven, SpecForm pattern), `LivePreview` (the identical `@wings/trade-ui` component, `--rb-*` injected inline from the Wave-1 kit), `PublishBar` two-state config. `computeDiagramCapabilities` from **rb roles + kitComplete + paramsValid + productPublished** (not `is_group_admin` — R2).

**Extend:** `apps/site/src/lib/rb/data.ts` — `getRbDiagramsForProduct` (Ch 04 §6: validates each row with the same registry schema, tag `rb-diagrams:{brandSlug}`, fixture fallback via `fixtureDiagrams`); fiche re-point of `packing`/`pallet`/`exploded` (`productos/page.tsx`) — this completes the fixture retirement Wave 2 left open.

**Done-check:** gate G-D — console preview and fiche import the same symbol (grep-proof); a rep (not group admin) authors and publishes a diagram for a PUBLISHED product of their own brand only; publish for a DRAFT product is refused; swap test under two brands' tokens; container models remain storeless (CHECK refuses them); publish-and-only-publish invalidates the fiche geometry.

---

## Wave 5 — Outputs (Ch 05 with R6/R11/R18 · DATA_MODEL §5)

**Migration:** `tower_29_rb_outputs` = DATA_MODEL §5 (allocation links, spine widening + scope CHECKs + RB RLS). Validate the `not valid` CHECKs after deploy.

**Create:**
- `packages/rb-core/tech-sheet.ts`: `TechSheetInput` with **split `profile` + `container`** (R18) and `techSheetSections` (Ch 05 §3.3 sections; `'Empaque'` from `packageKind`, `'CBM por empaque'` from `packageCbm`; never `slots_available`).
- `apps/tower/src/lib/actions/rb-quote.ts`: `composeRbAllocationQuote(allocationId, priceInput)` — auth → Zod (`unitPriceMinor` int, `taxBps?`) → RLS-load allocation ⋈ container ⋈ template ⋈ brand ⋈ product **via composition[0]** (R11) → one `QuoteLineDraft` (quantity = slots; description via `cascadeForSlots`, unit names from the template) → ensure the RB RFQ (brand-scoped insert: `represented_brand_id` + `lead_id`, `NULL lane_id` — never `createRFQ` verbatim) → **untouched** `composeQuote` → set `bill_to` from the lead via `saveQuotationDetails` (an RB RFQ has no account; `deriveBillTo` would leave it empty) → write `quote_id` onto the allocation. Zero arithmetic in the adapter. Plus `getRbTechSheet(brandSlug, productSlug)` assembling `TechSheetInput` with the R18 join keys; `computeRbOutputCapabilities`. `issueRbQuotation`/`getRbQuotationDocument`/`saveRbQuotationDetails` = re-exports of the shipped `quotation.ts` actions, verbatim.
- `exportRbTechSheetXlsx` (mirrors `exportCostSheetXlsx`: dynamic `xlsx` import, one tab per section, no styling) + `RbTechSheetDocument` (mirrors `CostSheetDocument`, `--rb-*` tokens) + print route `/marcas/[brand]/productos/[slug]/ficha-tecnica` (outside the shell group; force-dynamic, robots noindex, `PrintBar` — like `/quote/[id]/document`).
- Console panels: `QuotationInstrumentPanel` (unitPriceMinor + taxBps → «Emitir» → the shipped `/quote/[id]/document` route unchanged) and `TechSheetPanel` («Ver ficha» / «Descargar XLSX»), plus the «Generar cotización» row action on `SlotAllocationGrid`.

**Extend (site twin):** public ficha download reads `rb_public_products` (incl. `gtin` — already in the Wave-2 view, R10) + `rb_public_brands` + `rb_public_templates` + `rb_public_diagrams`, feeding the **same** `techSheetSections`.

**Done-check:** gate G-E — an RB quote's persisted `total_minor` equals re-derivation; quote number mints once (`COT-WGT-YYYY-NNNN`); bill-to snapshots the lead, not `{company:''}`; endorsement line «Representado por Wings Global Trade» in observations, never a hero; console XLSX and public-fiche XLSX byte-equivalent for the same product; scope CHECKs validated; lane pipeline behavior unchanged (regression: compose+issue a lane quote); no float, no stored price, no retail vocabulary.

---

## After Wave 5

Flip the program row in `programs/README.md` per status; propose to Muaaz the two ledgered amendments: the brand-scoped `product_slug` UNIQUE (R12) and multi-product composition support (R11 V2 seam). Chapter 06 (AI kit assembly, `RB_KIT` drafts — R20) remains a separately-ordered future chapter.
