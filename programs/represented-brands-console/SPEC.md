# Represented-Brands Console — Program Index (SPEC)

**Program:** RB Console — the TOWER «Marcas Representadas» write-side for hosted brands (RB/xx).
**Status:** PROPOSAL — queued spec, not active law. Build only when Muaaz says start.
**Extends:** the shipped RB backend (`supabase/migrations/20260710120000_rb_wave1.sql`, in prod), the public shelf at `apps/site/src/app/(brands)/marcas/*`, and the built TOWER modules under `apps/tower/src/` (incl. the quotation document work `tower_22` and the costing work `tower_23`/`tower_24` on this branch).
**Chapters (the detail lives there — this file resolves, it does not restate):**

| Ch | File | Owns |
|---|---|---|
| 01 | [`01-BRANDS-AND-TENANCY.md`](./01-BRANDS-AND-TENANCY.md) | Brand registry (RB/xx mint, retire), `--rb-*` kit intake, `rb_memberships` + `has_rb_role`, RLS on the five shipped RB tables, widened `rb_public_brands` |
| 02 | [`02-CATALOG-AND-SPECS.md`](./02-CATALOG-AND-SPECS.md) | `rb_products` shelf + versions + media, ALLOCATION archetype registration, `rb_public_products`, packing-profile writes |
| 03 | [`03-CONTAINERS-AVAILABILITY.md`](./03-CONTAINERS-AVAILABILITY.md) | Template/container lifecycle, allocation status machine, availability view, expiry sweep, FillMeter sync |
| 04 | [`04-DIAGRAM-MODELS.md`](./04-DIAGRAM-MODELS.md) | Parametric diagram-model registry, `rb_diagram_specs` store, `@wings/trade-ui` diagram move, `rb_public_diagrams` |
| 05 | [`05-OUTPUTS.md`](./05-OUTPUTS.md) | Quotation PDF (allocation → quote bridge over the shipped pipeline spine), technical XLSX (`techSheetSections`), pipeline-spine brand scoping |

Where a chapter and this SPEC disagree, **this SPEC wins** — the rulings in §2 are the merge, ratified at program level. Chapters are otherwise authoritative for their own detail.

---

## 1 · Overview — how this extends the existing RB backend + public site

The shipped `rb_wave1` core (7 objects: `represented_brands`, `rb_packing_profiles`, `rb_container_templates`, `rb_containers`, `rb_slot_allocations`, `rb_slots_taken`, `rb_reserve` + three `public.rb_public_*` views) is the **data plane**; the public shelf at `/marcas/{brand}` is its read-only projection (fixtures today). This program adds the **write-side console** in TOWER (new eighth module `marcas`) so a rep can: manage their brand + identity kit, add/retire products with schema-driven specs, list containers with slot/quantity availability, author the parametric drawings, and emit the two cross-category documents (quotation PDF, technical XLSX).

Structural laws carried throughout (no chapter deviates):

- **Additive only.** No shipped table/view/function is altered destructively; RB codes append-only; retire ≠ delete.
- **One math.** Slot subtraction = `rb_slots_taken`; reservation = `rb_reserve`; quantity↔slot = the lifted `packing.ts` functions; money = `composeQuote → issueQuotation` (integer-minor + bps, server-recomputed). Never a second implementation.
- **Auth spine:** `requireUser()` → Zod → RLS scoped by `has_rb_role(represented_brand_id, …)` for every brand-scoped write; `requireGroupAdmin()` only for tenant-registry acts (mint brand, grant memberships). See ruling R2.
- **TOWER writes, site reads.** The site touches only `public.rb_public_*` + `public.rb_reserve` (service-role). This program adds two new views and widens one; the sole site write-back stays `rb_reserve`.
- **Reuse first, fork never.** All console UI re-mounts shipped organs (`ProductEditor`, `SpecForm`, `PublishBar`, `MediaManager`, `BrandManager` pattern, `FillMeter`, the diagram family, `QuotationDocument`, the cost-export XLSX doctrine) through props.

---

## 2 · Merge rulings (the resolved gaps — binding)

Numbered R1–R20, matching the reconciliation gap list. Where a chapter section conflicts with a ruling, the ruling supersedes that section.

**R1 · Diagram geometry has one home: `tower.rb_diagram_specs` (Ch 04 wins).** Ch 02 §2.4's geometry spec fields (`packing_box_mm`, `packing_cells`, `roll_or_slab`, `pallet_grid/layers/skip/box_dims`, `explode_axis`, `explode_caption`) are **struck from the ALLOCATION spec field set**. The ALLOCATION spec keeps only fiche presentation data: `unit_label`, `spec_rows[]`, `description`, `highlights`. The fiche's `packing`/`pallet`/`exploded` render from `public.rb_public_diagrams` (Ch 04 §6); `unitLabel`/`specs[]`/`descriptionEs`/`highlights` from `public.rb_public_products` (Ch 02 §5). One write path, one read path per datum — Prime Directive 5 restored.

**R2 · Chapter 04 is rebased onto `requireUser` + `has_rb_role`.** Ch 04 §3's `requireGroupAdmin` + deny-all + service-role regime is **rejected**: it was written as if Ch 01's tenancy layer didn't exist, and it makes the chapter's own headline workflow (a rep authoring a diagram) impossible. `rb_diagram_specs`/`_versions` get `has_rb_role`-keyed RLS policies (read: all three roles; write: `BRAND_MANAGER`/`BRAND_OPS`; no delete), identical to Ch 02 §2.3e. Actions in `rb-diagrams.ts` use `requireUser()`; `snapshot_by` defaults to `auth.uid()` (real under the RLS client — Ch 04's null-uid workaround is moot). `computeDiagramCapabilities` derives from rb roles + `kit_complete`, not `is_group_admin`.

**R3 + R4 · Canonical migration ledger.** The shipped tree ends at `tower_24_costing_config_seed` (20260720130000). This program's chain — all self-claims in chapters are superseded:

| Migration | Chapter | Content |
|---|---|---|
| `tower_25_rb_console` | 01 | tenancy, RLS on shipped RB tables, audit triggers, `rb_public_brands` widen |
| `tower_26_rb_catalog` | 02 | `rb_products`/`_versions`/`_media`, ALLOCATION seed, `rb_public_products` (incl. `gtin`, see R10) |
| `tower_27_rb_availability` | 03 | `rb_set_allocation_status`, `rb_release_expired` + pg_cron, `rb_container_availability` |
| `tower_28_rb_diagrams` | 04 | `rb_diagram_specs`/`_versions`, `rb_public_diagrams` — **Ch 04 DOES ship a migration** (Ch 05 §2's "registry/config only" claim is false and superseded) |
| `tower_29_rb_outputs` | 05 | allocation `order_id`/`quote_id`, pipeline-spine brand scoping + scope CHECKs + RB RLS on `rfqs`/`quotes`/`orders` |

Codes append-only: if unrelated work lands first, the whole chain shifts to the next free integers in this order. The consolidated delta is [`DATA_MODEL.sql`](./DATA_MODEL.sql) — the single deduped authority; at build time each wave carves its numbered slice from it verbatim.

**R5 · Allocation status flips get a real RLS path.** `rb_set_allocation_status` stays non-SECURITY-DEFINER; the missing UPDATE policy is added (join-through-parent to the container's brand, `BRAND_MANAGER`/`BRAND_OPS`). The append-only intent ("the atomic subtraction rule remains the only writer") is preserved by **column revoke**: `slots`, `quantity_units`, `rb_container_id`, `lead_id` are revoked from `authenticated` UPDATE, so the RLS path can move only `status`/`expires_at`/`order_id`/`quote_id`. `rb_reserve` (SECURITY DEFINER, service-role) is unaffected. See DATA_MODEL §3.

**R6 · One shared package: `@wings/rb-core` (`packages/rb-core`).** Ch 03's `@wings/rb-packing` name is dropped. `packages/rb-core` holds: `slotsForQuantity`, `cascadeForSlots`, `RbContainerTemplate`, `RbPackingProfile`, `PackingCascade` types (lifted from `apps/site/src/lib/rb/packing.ts` + `fixtures.ts`), and later `techSheetSections` (Wave 5). Both apps import it; `apps/site/src/lib/rb/packing.ts` becomes a re-export shim until its callers are re-pointed.

**R7 · The diagram-organ move to `@wings/trade-ui` is Wave 0, a declared prerequisite.** Ch 01's `ContainerSliceDiagram` mount and Ch 03 §4's `PackingDiagram`/`ExplodedDiagram`/`PalletDiagram` reuse inside `apps/tower` are only possible after Ch 04 §4.1's move (`packages/ui/src/organs/diagrams/`). The move (components + `iso.ts` + `CONTAINER_SPECS` + `TechDraw`, GSAP/zod as peerDependencies) is pulled forward into Wave 0, before any console UI. GSAP licensing/peer-dep cost must be ratified by Muaaz at Wave-0 gate.

**R8 · `listRbProducts` is `requireUser` + RLS**, not group-admin (Ch 02 §3.2 row 1 corrected to match its own §3.1). A group admin still sees all via `has_rb_role`'s `is_group_admin()` branch.

**R9 · Action ownership map (single owner per action, duplicates dropped):**

| File | Owns | Superseded duplicates |
|---|---|---|
| `apps/tower/src/lib/actions/represented-brands.ts` (Ch 01) | `registerRepresentedBrand`, `listRepresentedBrands`, `setRepresentedBrandMemberships`, `setRepresentedBrandStatus`, `saveBrandKit` | Ch 01's `saveRbPackingProfile`, `saveRbTemplate`, `saveRbContainer` rows are **dropped** (owned below) |
| `apps/tower/src/lib/actions/rb-catalog.ts` (Ch 02) | product lifecycle actions, `attachRbMedia`, **`upsertRbPackingProfile`** (canonical name) | — |
| `apps/tower/src/lib/actions/rb-containers.ts` (Ch 03) | `saveRbTemplate`, `publishRbTemplate`, **`retireRbTemplate`** (R13), `openRbContainer`, `setRbContainerStatus`, `listRbAvailability`, `convertQuantity`, `setAllocationStatus`, `reserveRbSlots` | — |
| `apps/tower/src/lib/actions/rb-diagrams.ts` (Ch 04, rebased per R2) | `saveDiagramSpec`, `publishDiagramSpec`, `retireDiagramSpec`, `rollbackDiagramSpec` | — |
| `apps/tower/src/lib/actions/rb-quote.ts` (Ch 05) | `composeRbAllocationQuote`, `getRbTechSheet` (+ re-exports of the untouched `quotation.ts` actions) | — |

**R10 · Truthful view ledger.** Of the three shipped views: `rb_public_brands` is **replaced-widened** by Ch 01 §25.5 (additive columns only); `rb_public_templates` and `rb_public_containers` are untouched. Two **new** views: `rb_public_products` (Ch 02 — defined **with `gtin` from day one**, absorbing Ch 05 §5's amendment so no view is amended twice) and `rb_public_diagrams` (Ch 04). One TOWER-only view: `rb_container_availability` (Ch 03). All "the three shipped views are untouched" / "the ONLY new site surface" / "the fourth view" claims in chapters are superseded by this ledger.

**R11 · Multi-product composition: composition[0] is the governing profile — a ledgered V1 limitation.** Everywhere the money/tech-sheet path needs "the product" of an allocation, it resolves deterministically: `template.composition[0].profile_slug` → profile → `rb_products` row via `(represented_brand_id, slug = product_slug)`. Same rule as the shipped `rb_public_templates` join. Seam for V2: quote line description enumerates all composition entries; `getRbTechSheet` gains an explicit `profileSlug` parameter. No chapter may silently assume >1 entry works before that amendment.

**R12 · `product_slug` global uniqueness: authoring-time guard + convention.** The shipped global `UNIQUE` on `rb_packing_profiles.product_slug` stays (append-only). `upsertRbPackingProfile` pre-checks the slug across all brands and on collision fails with a clear error recommending a brand-qualified slug (`{brand-slug}-{slug}`). All joins are always on `(represented_brand_id, slug = product_slug)`, so a qualified slug changes nothing downstream. The proper fix — replacing the global UNIQUE with `unique(represented_brand_id, product_slug)` — is a **framework amendment proposed to Muaaz for a later wave**, not done here.

**R13 · `retireRbTemplate` added** (`rb-containers.ts`): `PUBLISHED → RETIRED`, refused (`RB_TEMPLATE_IN_USE`) while any container referencing it is `OPEN`/`FILLING`.

**R14 · `retireRbProduct` cross-guard added**: refused (`RB_PRODUCT_IN_LIVE_COMPOSITION`) while the product's profile_slug appears in any `PUBLISHED` template's composition or any `OPEN`/`FILLING` container's template. Retire order: close containers → retire template → retire product.

**R15 · Kit photography minimum: hero ≥3, about ≥2** (the Zod schema is canonical); Ch 01's Phase-0 gate 2 "≥1 photography asset" is corrected accordingly (see consolidated gates, §4).

**R16 · Errata — stale cross-references.** Ch 03's citations of "Chapter 01 §24.3/§24.4" mean Ch 01 **§25.3/§25.4** (sections renumbered when the migration moved 24→25). Read accordingly; chapters are not edited.

**R17 · Diagram two-state lifecycle is kept, with the missing rationale + guard:** a diagram spec has no `IN_REVIEW` because review happens once, at product level — `publishDiagramSpec` **refuses unless the parent `rb_products` row is `PUBLISHED`** (guard `RB_PRODUCT_NOT_PUBLISHED`). A public drawing therefore never ships with less review than the spec beside it.

**R18 · `TechSheetInput` splits template and profile.** Ch 05 §3.3's conflated `packing: RbContainerTemplate` becomes two fields: `profile: RbPackingProfile` (`packageKind`, `unitsPerPackage`, `packageCbm`, `packageKg`, `gtin?`, `unitNamePlural`) and `container?: { kind, totalSlots, packagesPerSlot }`. `cascadeForSlots` in `@wings/rb-core` takes `(profile, packagesPerSlot, slots)` explicitly. `getRbTechSheet` join keys, stated: `rb_products (represented_brand_id, slug)` ⋈ `rb_packing_profiles` on `(represented_brand_id, product_slug = slug)` (R12 rule) ⋈ template via `composition[0]` (R11) ⋈ `rb_diagram_specs` on `(represented_brand_id, product_slug, model_id)`.

**R19 · Expiry sweep: pg_cron owns the schedule** (precedent: `tower_09_cron_jobs.sql`), scheduled in `tower_27` (hourly). Monitoring: one n8n daily check counting `RESERVED` rows expired >24h; >0 alerts ops (sweep-stopped detector). n8n never runs the sweep — one owner, one watcher.

**R20 · AI-assisted kit (`RB_KIT` drafts) future home: Chapter 06.** Deferred exactly as Ch 01 states; its seam (both paths terminate at the same `identity` jsonb + `kit_complete` validator) is preserved by every ruling above. Not scheduled in this program's waves.

---

## 3 · Wave plan (merged, ordered, with file targets)

Full per-wave instructions in [`BUILD_PROMPT.md`](./BUILD_PROMPT.md). DB deltas in [`DATA_MODEL.sql`](./DATA_MODEL.sql), sectioned by wave.

| Wave | Delivers | Primary file targets | Depends on |
|---|---|---|---|
| **0 — Shared packages** (R6, R7) | `@wings/rb-core` (packing math + types lifted); diagram organs + `iso.ts` + `CONTAINER_SPECS` + `TechDraw` into `packages/ui/src/organs/diagrams/`; site re-pointed | `packages/rb-core/*` `NEW`; `packages/ui/src/organs/diagrams/*` `NEW` (moved); `apps/site/src/lib/rb/packing.ts` → shim; `apps/site` fiche/cubicaje imports re-pointed | GSAP peer-dep ratification (Muaaz) |
| **1 — Tenancy + brand console** (Ch 01) | `tower_25`; `represented-brands.ts` + `represented-brands-logic.ts`; `marcas` module; `RepresentedBrandManager`, `BrandKitPanel`, `RepMembershipMatrix`; `getRbBrands` site loader | `supabase/migrations/…tower_25_rb_console.sql`; `apps/tower/src/lib/actions/represented-brands{,-logic}.ts` `NEW`; `apps/tower/src/lib/{nav,rbac}.ts` extend; `apps/tower/src/app/(shell)/marcas/*` `NEW`; `apps/site/src/lib/rb/data.ts` extend | — |
| **2 — Catalog + specs** (Ch 02, minus R1 geometry) | `tower_26`; ALLOCATION registration; `rb-catalog.ts`; ProductEditor/SpecForm mount; `getRbProductsForBrand` + fiche swap (presentation fields) | `supabase/migrations/…tower_26_rb_catalog.sql`; `apps/tower/src/lib/schemas/spec/allocation.ts` `NEW` + `registry.ts`/`archetypes/{types,config}.ts` extend; `apps/tower/src/lib/actions/rb-catalog.ts` `NEW`; `apps/tower/src/app/(shell)/marcas/[brand]/productos/*` `NEW`; `apps/site/src/lib/rb/data.ts` extend | Wave 1 |
| **3 — Containers + availability** (Ch 03 + R5, R13, R19) | `tower_27`; `rb-containers.ts` (incl. `retireRbTemplate`); `TemplateWorksheet`, `ContainerBoard`, `SlotAllocationGrid`; pg_cron sweep + n8n watcher | `supabase/migrations/…tower_27_rb_availability.sql`; `apps/tower/src/lib/actions/rb-containers{,-logic}.ts` `NEW`; `apps/tower/src/app/(shell)/marcas/[brand]/contenedores/*` `NEW` | Waves 0–2 |
| **4 — Diagram registry** (Ch 04 rebased per R2) | `tower_28`; `diagramRegistry` + Zod schemas in `@wings/trade-ui`; `rb-diagrams.ts`; `DiagramSpecPanel`; `getRbDiagramsForProduct` + fiche geometry swap | `packages/ui/src/organs/diagrams/registry.ts` `NEW`; `supabase/migrations/…tower_28_rb_diagrams.sql`; `apps/tower/src/lib/actions/rb-diagrams.ts` `NEW`; `apps/tower/…/productos/[slug]/DiagramSpecPanel.tsx` `NEW`; `apps/site/src/lib/rb/data.ts` extend | Waves 0, 2 |
| **5 — Outputs** (Ch 05 + R11, R18) | `tower_29`; `rb-quote.ts`; `techSheetSections` in `@wings/rb-core`; `RbTechSheetDocument` + ficha print route; `QuotationInstrumentPanel`, `TechSheetPanel` | `supabase/migrations/…tower_29_rb_outputs.sql`; `apps/tower/src/lib/actions/rb-quote.ts` `NEW`; `packages/rb-core/tech-sheet.ts` `NEW`; `apps/tower/src/app/marcas/[brand]/productos/[slug]/ficha-tecnica/*` `NEW`; console panels | Waves 1–4 |

**Recommended first wave: Wave 0** — it is pure refactor (zero schema, zero behavior change, swap-test provable), unblocks every console UI wave, and forces the one open ratification (GSAP peer-dep) before anything is built on top of it.

---

## 4 · Consolidated Phase-0 gates

Machine-checkable gates are enforced in the owning action; checklist gates surface in the console before the relevant flip. Chapter-local gate lists remain valid detail; this is the merged program-level set.

**G-A · Brand goes `LIVE`** (owner: `setRepresentedBrandStatus`) — Ch 01 gates 1–7 with R15 applied: RB/xx minted + registry.md line; kit validated (5 tokens, `accent-ink` 4.5:1, hue separation, `surface-tint ≤4%`, 4 logo slots, **hero ≥3 + about ≥2** photography); ≥1 `BRAND_MANAGER` membership; ≥1 packing profile + ≥1 `PUBLISHED` template; ES+EN content; Mister `rb-{slug}` pack answers; swap test.

**G-B · Product publishes** (owner: `publishRbProduct`) — Ch 02 gates 1–6 with R1 applied: ALLOCATION registered end-to-end (registry, archetype config, `spec_schemas` v1 row); spec valid (presentation fields only — geometry gates moved to G-D); packing profile joins per R12; `rb_public_products` + loader live; auth spine proven.

**G-C · Container goes public** (owner: `openRbContainer`/`publishRbTemplate`) — Ch 03 gates 1–7 plus: `retireRbTemplate`/`retireRbProduct` guards (R13/R14) verified; pg_cron sweep scheduled + n8n watcher green (R19); allocation UPDATE policy proven (a rep can confirm, cannot touch `slots` — R5).

**G-D · Diagram publishes** (owner: `publishDiagramSpec`) — Ch 04 gates 1–9 with R2/R17 applied: single-source render grep-proof; swap test; parent product `PUBLISHED`; writes via `requireUser` + `has_rb_role`; `CONTAINER_SPECS` is the only container-geometry table.

**G-E · Outputs ship** (owner: `composeRbAllocationQuote`/`getRbTechSheet`) — Ch 05 gates 1–8 with R11/R18 applied: money only via `composeQuote → issueQuotation`; bill-to set from the lead before issue; composition[0] rule applied consistently in quote line and tech sheet; console and public XLSX byte-equivalent; wholesale language + endorsement lockup.

**Program-wide (every wave):** token lint zero raw values in new code; swap test on any shared-organ touch; reduced-motion + keyboard parity; no retail vocabulary in any locale; audit trigger attached to every new table; no hard deletes anywhere.

---

## 5 · Reuse map (consolidated — what this program does NOT build)

| Reused as-is | From | Consumed by |
|---|---|---|
| Slot subtraction + atomic reserve (`rb_slots_taken`, `rb_reserve`) | `rb_wave1.sql` | Waves 3, 5 — read-through/write-through only |
| Quantity↔slot math (`slotsForQuantity`, `cascadeForSlots`) | `apps/site/src/lib/rb/packing.ts` → lifted to `@wings/rb-core` (Wave 0) | Waves 3, 5 |
| Money spine (`composeQuote`, `issueQuotation`, `mint_quote_no`, `taxFromBps`, `QuotationDocument` + `/quote/[id]/document`) | `pipeline.ts` / `quotation.ts` / tower_22 work on this branch | Wave 5 — one adapter, zero arithmetic |
| XLSX/print doctrine (one row-builder, two consumers; `slug`, `aoa_to_sheet`, browser-print PDF) | `components/costing/export.ts` + `CostSheetDocument` (tower_23/24 work) | Wave 5 pattern-clone |
| `tower.audit_trigger()`, `moddatetime` | tower_07 / extensions | Every new table |
| `has_lane_role` shape → `has_rb_role`; `nextLaneCode` → RB/xx mint; `diffMemberships`; `canTransition*` guard law; `computeCapabilities` pattern | `tower_01`, `admin-logic.ts`, `containers-logic.ts`, `catalog-logic.ts` | Waves 1–5 (patterns copied, tables never overloaded) |
| Console organs: `BrandManager` scaffolding, `ProductEditor`, `SpecForm`, `PublishBar`, `MediaManager`, `UserManager` grid | `apps/tower/src/components/*` | Waves 1–4, props only |
| Site organs: `FillMeter` (`@wings/trade-ui`), `SlotGrid`, diagram family + `iso.ts` (→ `@wings/trade-ui` in Wave 0), `ContainerConfigurator` | `packages/ui` / `apps/site` | Waves 0, 3, 4 |
| Site read boundary (`data.ts` loader shape, ISR `revalidate = 60`, fixture fallback), Mister `rb-{slug}` auto-compile | `apps/site/src/lib/rb/*`, `misterPack.ts` | Waves 1, 2, 4 (new loaders, same shape) |

Genuinely new: `rb_memberships` + `has_rb_role`, RLS policies + column revokes, `rb_products`/`_versions`/`_media`, ALLOCATION registration, `rb_set_allocation_status` + `rb_release_expired`, `rb_container_availability`, `rb_diagram_specs`/`_versions` + `diagramRegistry`, the pipeline-spine brand scoping, the five action files (R9), the console `marcas` module UI, `techSheetSections` + `RbTechSheetDocument`, and three public-view changes (R10).
