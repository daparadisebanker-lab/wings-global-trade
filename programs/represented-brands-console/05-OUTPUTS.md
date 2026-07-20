# RB Console · Chapter 05 — Cross-Category Outputs (Quotation PDF · Technical XLSX)

> Scope: the two **category-agnostic** documents the console emits for any
> represented brand — (1) a **quotation PDF** (the client-facing «Cotización»)
> and (2) a **technical spreadsheet** (XLSX ficha técnica). Both are built by
> **re-mounting shipped generators**, never new renderers: the quotation reuses
> `components/pipeline/quotation-document` + `lib/actions/quotation.ts` + the
> print route `/quote/[id]/document`; the XLSX reuses the costing export's
> "one row-builder, two consumers (print + XLSX)" pattern
> (`components/costing/export.ts` + `CostSheetDocument`). Grounded in the shipped
> pipeline spine (`apps/tower/src/lib/actions/pipeline.ts`), the quotation model
> (`apps/tower/src/lib/quotation/document.ts`), the RB core
> (`supabase/migrations/20260710120000_rb_wave1.sql`), the packing math
> (`apps/site/src/lib/rb/packing.ts`), and Chapters 02–04 of this program.
> **The migration wins over SPEC §3 proposals.** This chapter builds on Ch 02's
> `tower.rb_products` shelf, Ch 03's availability view + ledger transitions, and
> Ch 04's `tower.rb_diagram_specs` parametric geometry.
>
> **Non-negotiable reuse boundary:** neither output re-implements money math,
> slot math, or a document renderer. The quotation runs through the **untouched**
> `composeQuote → issueQuotation → getQuotationDocument` chain (server-recomputed
> `subtotal/tax/total`, integer minor + bps); the XLSX runs through a **new but
> pattern-identical** row-builder feeding the same two consumers the cost sheet
> already feeds. This chapter adds **one** money-bearing surface (the RB
> allocation → quote bridge) and **one** presentation-free data assembler (the
> tech-sheet section builder). Everything else is a re-mount.

---

## 1 · What

A represented brand sells **container-only** (ALLOCATION archetype, root §5-bis):
the negotiable unit is a **slot (cupo)** or a server-rounded **quantity**, never a
retail unit. Two documents close that sale, and both must be **category-agnostic**
— identical machinery whether the cargo is bathroom tissue, ceramics, or a
category that does not exist yet:

1. **Quotation PDF** — the official «Cotización» a buyer receives. It must pull, in
   one document: the **brand** it is issued under, the **product/spec** being
   allocated, and the **container-slot** line (how many cupos, at what price, what
   that unfolds into — cajas → unidades → kg). This is a **money document**
   (integer-minor totals, bps tax) and therefore rides the shipped pipeline spine
   verbatim — the RB layer only *assembles the line* and hands it to `composeQuote`.

2. **Technical spreadsheet (XLSX)** — the data-faithful ficha técnica ops archives
   and buyers download. It assembles **specs + dimensions + diagram parameters +
   container/slot quantities** into a workbook that is **presentation-free** (no
   styling, no money) and works for **any** category, because every section is
   iterated from schema-driven data (`rb_products.specs` JSON schema, Ch 02) or
   derived from archetype-independent packing math (`cascadeForSlots`, Ch 03).

**Why these two reuse cleanly.** The shipped quotation generator already consumes a
**category-neutral shape** — `QuotationDocument { billTo, lines[], totals, terms,
observations, issuer }` (`document.ts:55-73`) — assembled from persisted rows by
`toDocument` (`quotation.ts:123`) and drawn by a pure renderer that "only formats
what it's handed" (`QuotationDocument.tsx:1-6`). The shipped cost export already
proves the "one row-builder → {print, XLSX}" doctrine: `costSheetRows(inputs,result)`
(`export.ts:13`) feeds both `CostSheetDocument` (`CostSheetDocument.tsx:25`) and
`exportCostSheetXlsx` (`export.ts:47`). Neither generator knows or cares what
category it is drawing. The RB job is to *feed* them, not fork them — the reuse map
§5 states this outright ("RB allocation confirmations reuse this document renderer +
issue/number-minting flow as-is"; "one math, two consumers").

**The one thing this chapter settles:** the ledger produces an **allocation** (Ch 03),
but there is today **no bridge** from an allocation to a priced quote, and **no
technical export** for RB SKUs at all. Both are added — the first as a thin adapter
onto the untouched pipeline, the second as a pattern-clone of the cost export.

---

## 2 · Data model deltas (SQL) — new migration `tower_28_rb_outputs` (additive only)

> **Migration number.** `tower_24` is **already shipped**
> (`20260720130000_tower_24_costing_config_seed.sql`) — the backend map's "tower_22+"
> guidance is stale. This chapter takes the next free number **after** the RB console
> chain (Ch 01 `tower_25_rb_console`, Ch 02 `tower_26_rb_catalog`, Ch 03
> `tower_27_rb_availability`; Ch 04 ships **no** migration — it is registry/config only):
> **`tower_28_rb_outputs`**. Codes are append-only; never reuse `tower_24`.

The outputs are overwhelmingly **reads of already-shipped tables**. The quotation
reuses the pipeline spine (`tower.rfqs`, `tower.quotes`, `tower.orders`); the XLSX
reuses `tower.rb_products` / `tower.rb_packing_profiles` (Ch 02),
`tower.rb_diagram_specs` (Ch 04), and `tower.rb_container_availability` (Ch 03).
Exactly **two** additive deltas are required: (2.1) re-connect FKs the shipped
`rb_slot_allocations` deliberately dropped (backend map §6.8), and (2.2) widen the
pipeline spine so it can carry a lane-less, brand-bound quote — a nullable brand
pointer, a relax of the lane-identity NOT NULLs, a scope CHECK, and RLS. Every change
is additive/widening; nothing shipped is narrowed.

```sql
-- supabase/migrations/20260722xxxxxx_tower_28_rb_outputs.sql
-- Additive only. Nothing shipped is altered destructively (append-only law).
-- Re-connects the order_id/quote linkage SPEC §3.3 proposed and the shipped
-- rb_slot_allocations dropped (backend map §6.8). Money stays in the pipeline
-- spine (integer-minor + bps); this migration adds NO money columns.
set search_path to tower, public;
```

### 2.1 Re-connect the allocation → order/quote linkage (`NEW`, additive)

The shipped `rb_slot_allocations` (`rb_wave1.sql:82-95`) binds **only** to
`public.leads` — SPEC §3.3's `account_id`/`order_id` FKs were never shipped (backend
map §1, §6.8). To let an issued quotation point back at the cupo it priced (and to
let the RB order write the reuse map §5 describes — through the brand-scoped order path
of §2.2, not `convertToOrder` verbatim, which requires an account `pipeline.ts:838`),
add the FKs **additively and nullable** — an allocation stays valid with neither set:

```sql
alter table tower.rb_slot_allocations
  add column if not exists order_id uuid references tower.orders(id) on delete set null,
  add column if not exists quote_id uuid references tower.quotes(id) on delete set null;

create index if not exists rb_slot_allocations_order_idx on tower.rb_slot_allocations (order_id);
```

These are **link columns, not state** — the ledger lifecycle
(`RESERVED→CONFIRMED→LOADED→RELEASED`, Ch 03 §2.1) is untouched; slot subtraction
(`rb_slots_taken`, `rb_wave1.sql:109-121`) never reads them. The Ch 03 §2.4 audit
trigger already attached to `rb_slot_allocations` captures every set of `order_id`/
`quote_id`, so the money↔cupo link is append-only-audited for free.

### 2.2 Brand-scope the pipeline spine for RB quotes (`NEW`, additive + nullable)

The shipped pipeline scopes RFQs/quotes/orders by **lane** (`FORBIDDEN_LANE`,
`quotation.ts:187`; RLS `tower.quotes "SALES + LANE_DIRECTOR write"`,
`quotation.ts:6-8`). An RB brand has **no lane** — it scopes by
`represented_brand_id` (Ch 01). A nullable brand pointer alone is **not enough**: the
shipped spine hard-requires lane identity — `tower.rfqs.lane_id` is `not null`
(`tower_03_crm_pipeline.sql:23`) and `tower.orders` has `brand_id`, `lane_id` **and**
`account_id` all `not null` (`:58-60`). Without relaxing those, an RB RFQ/order simply
**cannot be inserted**. So this delta does three additive things: (a) add the brand
pointer, (b) **drop the lane NOT NULLs** on the spine (a widening — a lane row still
sets them), (c) add a scope CHECK so exactly one identity is present:

```sql
-- (a) brand pointer on the spine
alter table tower.rfqs   add column if not exists represented_brand_id uuid references tower.represented_brands(id);
alter table tower.quotes add column if not exists represented_brand_id uuid references tower.represented_brands(id);
alter table tower.orders add column if not exists represented_brand_id uuid references tower.represented_brands(id);

-- (b) relax the lane-identity NOT NULLs so an RB (lane-less) row is insertable.
-- Purely additive/widening: existing lane rows keep their values; nothing is dropped.
alter table tower.rfqs   alter column lane_id    drop not null;
alter table tower.orders alter column lane_id    drop not null;
alter table tower.orders alter column brand_id   drop not null;
alter table tower.orders alter column account_id drop not null;  -- RB binds to public.leads, not accounts (§2.1)

-- (c) exactly one identity: a row is either a lane row OR a represented-brand row.
alter table tower.rfqs   add constraint rfqs_scope_ck   check ((lane_id is not null) <> (represented_brand_id is not null)) not valid;
alter table tower.orders add constraint orders_scope_ck check ((lane_id is not null) <> (represented_brand_id is not null)) not valid;
```

The CHECKs ship `not valid` (validated later against existing rows) so the migration
never fails on legacy lane data; all lane rows already satisfy the `lane_id is not null`
branch. `NULL represented_brand_id` = an ordinary lane RFQ/quote (unchanged behaviour);
non-null = an RB quote. RLS gets **one additive policy per table** so an RB rep sees
their brand's rows via the same membership predicate Ch 01 established (`has_rb_role`,
the RB analogue of `has_lane_role`, keyed on `represented_brand_id`) — a strict
*widening*, never a change to the shipped lane predicate. The money columns
(`quotes.subtotal_minor/tax_bps/tax_minor/total_minor`, `quotation.ts:67-68`) are
**reused as-is** — an RB quote is integer-minor + bps exactly like a lane quote.

**`orders.account_id` for lead-mediated RB.** RB allocations bind to `public.leads`,
not `tower.accounts` (Ch 01), yet `convertToOrder` (`pipeline.ts:808`) both **requires**
`rfq.account_id` (`:838`) and writes `orders.account_id` (`:848`). Two consequences the
RB layer must own: (1) dropping `orders.account_id`'s NOT NULL above lets a lead-only RB
order exist; (2) the RB order path must **not** reuse `convertToOrder` verbatim (it
rejects an account-less RFQ) — the RB adapter either promotes the lead to an account
first (Ch 01 lead→account promotion) or writes the RB order through its own brand-scoped
insert that carries `represented_brand_id` + `lead_id` instead of `account_id`. The
quote/PDF path (§3.1) needs none of this — only the order step does.

### 2.3 What is deliberately NOT added

- **No new quote/document tables.** The «Cotización» persists in `tower.quotes`
  (already append-only via `mint_quote_no`, `quotation.ts:229`) and renders through
  the shipped `QuotationDocument` shape. A parallel RB quote table would fork the
  money law.
- **No money on templates/allocations.** Price-per-slot is a **quote-line input**
  entered at compose time (§3.1), server-recomputed by `taxFromBps`
  (`quotation.ts:82`) — never stored on `rb_container_templates` (geometry only, Ch 03
  §3.1 "emits zero money") nor on `rb_slot_allocations`.
- **No XLSX artifact table.** The technical sheet is **client-generated, ephemeral**
  — identical policy to the cost sheet ("the data-faithful artifact ops archives /
  re-exports from history", `export.ts:2-3`). It is a pure projection of live TOWER
  reads; nothing new is persisted to emit it.
- **No new subtraction / no new packing function.** Slot cascades come from the
  shipped `cascadeForSlots` (`packing.ts:17`); availability from Ch 03's
  `rb_container_availability` view — both reused, never re-inlined.

---

## 3 · Server actions (API)

Every action follows the shipped mutation law **auth → Zod → RLS** and returns the
shared `ActionResult<T>` envelope (`ok()`/`fail()`). The gate is `requireUser()`
(the pattern at `quotation.ts:35` / `pipeline.ts:302`: `createServerSupabase` →
`auth.getUser` → `supabase.schema('tower')`, the RLS-scoped client). Actions
**never branch on role** (`pipeline.ts:7-10` law); RLS confines the rep to their
`represented_brand_id`. `requireGroupAdmin()` (`admin.ts:91`) is **not** used here —
these are brand-scoped writes, not tenant-registry writes.

### 3.1 Quotation PDF — the allocation → quote bridge (`apps/tower/src/lib/actions/rb-quote.ts`, `NEW`)

**Design: one new adapter action; the entire document/issue/render chain is
re-mounted unchanged.** The RB layer's only job is to *assemble the quote line from
cupo data* and hand it to the shipped `composeQuote` (`pipeline.ts:674`); everything
downstream (number minting, server-recomputed totals, PDF render) is shipped code.

| Action | Models on | Behavior |
|---|---|---|
| `composeRbAllocationQuote(allocationId, priceInput)` `NEW` | `upsertLines:579` + `composeQuote:674` (`createRFQ:477` **pattern only**, see note) | auth → Zod (`{ unitPriceMinor: z.number().int().nonnegative(), taxBps?: z.number().int().min(0).max(10_000) }`, the `pipeline.ts:295` money-input shape) → RLS-load the allocation + its container + template + brand + product (§3.2) → build **one** `QuoteLineDraft` (description, quantity = `allocation.slots`, `unitPriceMinor`) → ensure an RB RFQ exists for the allocation's `lead_id` (see note; create if absent) → call the **untouched** `composeQuote(rfqId, [line])` (server recomputes line totals + `computeQuoteTotal`, `pipeline.ts:697`) → **set `bill_to` from the lead** (via `saveRbQuotationDetails`, §3.2 — the RB RFQ has no account, so `deriveBillTo` would leave it empty) → write `quote_id` back onto the allocation (§2.1). Returns `{ quoteId }`. |
| `issueRbQuotation(quoteId)` | **reuse verbatim** `quotation.issueQuotation:203` | The **same** action a lane quote uses: mints `COT-WGT-YYYY-NNNN` once via `mint_quote_no` (`quotation.ts:229`, idempotent), snapshots bill-to, persists the server-computed `subtotal/tax/total`. Not re-implemented — the RB console imports and calls it. |
| `getRbQuotationDocument(quoteId)` | **reuse verbatim** `quotation.getQuotationDocument:180` | Assembles the render-ready `QuotationDocument` (`toDocument`, `quotation.ts:123`). Unchanged — it already produces a category-neutral document. |
| `saveRbQuotationDetails(quoteId, input)` | **reuse verbatim** `quotation.saveQuotationDetails:274` | Overrides bill-to / terms / observations / `taxBps`; recomputes the split server-side (`taxFromBps`, `quotation.ts:295`). Unchanged. |

**Note — the RFQ row is a brand-scoped insert, not `createRFQ` verbatim.** `createRFQ`
(`pipeline.ts:477`) reads a `tower.lanes` row and copies `brand_id`/`lane_id` off it
(`:490-505`); an RB allocation has **no lane**, so it cannot call `createRFQ`. The
adapter follows the same *shape* but inserts an RB RFQ carrying `represented_brand_id`
+ `lead_id` and a `NULL lane_id` (the §2.2 relax + scope CHECK make this legal). Line
management (`upsertLines`, `pipeline.ts:579`) and the whole money chain (`composeQuote →
issueQuotation`) are reused untouched — only the RFQ-mint step is RB-specific.

**Money law is satisfied by re-mount, not re-implementation.** `composeRbAllocationQuote`
emits **one integer** (`unitPriceMinor`) into a `QuoteLineDraft`; from there
`composeQuote → issueQuotation` own all arithmetic (integer minor, bps tax, single
rounding in `taxFromBps`, `quotation.ts:82-84`). The RB action never sums, never
taxes, never rounds — Directive 3 / ADR-7 stay in the one shipped place.

### 3.2 How the brand quotation pulls brand / product / spec / container-slot data

`composeRbAllocationQuote` assembles the `QuotationDocument` inputs from four
already-shipped authorities. **This is the "category-agnostic" guarantee** — the
mapping is by *shape*, not by product family:

| `QuotationDocument` field (`document.ts`) | Pulled from | Via |
|---|---|---|
| `billTo` (`BillTo`, `document.ts:15`) | `rb_slot_allocations.lead_id → public.leads` (name / whatsapp / email) | **The shipped `deriveBillTo` cannot serve this.** `deriveBillTo` (`quotation.ts:87-107`) reads **only** `tower.accounts` + `tower.contacts` keyed by `accountId`, and returns `{ company: '' }` when the RFQ has no account — an RB RFQ binds to a **lead**, not an account, so reusing `issueQuotation` blindly would snapshot an **empty** bill-to. So `composeRbAllocationQuote` sets `bill_to` **explicitly** from the lead row (company / attention / contact / `taxId` RUC) via `saveRbQuotationDetails` (= shipped `saveQuotationDetails`, `quotation.ts:274`, which persists a bill-to override) **before** `issueRbQuotation` snapshots it. No change to `deriveBillTo`. |
| `lines[].description` (`QuotationLine`, `document.ts:36`) | **brand** (`tower.represented_brands.name`) + **product** (`tower.rb_products.name` jsonb, Ch 02) + **container-slot cascade** | `cascadeForSlots(template, slots)` (`packing.ts:17`) unfolds the cupo honestly, e.g. *«Áladín · Papel higiénico bambú — 1 cupo en RB01-40HC-001 · 94 cajas · 5.640 rollos · 1.269 kg»*. Category-neutral: `unitNamePlural` (`rollos`/`unidades`/…) comes from the template, never hardcoded. |
| `lines[].quantity` | `rb_slot_allocations.slots` (the negotiated cupos) | Direct. The buyer negotiates in **slots** (wholesale unit), never retail units — root §5-bis rule 4. |
| `lines[].unitPriceMinor` | the rep's price **per slot** (integer minor) | Zod-validated input; never read from a stored price (templates carry none). Server-recomputed line total = `quantity × unitPriceMinor` inside `composeQuote`. |
| `terms` (`CommercialTerms`, `document.ts:27`) | container `route` + `closes_at` (Ch 03) → `deliveryTime` / `incoterm` | `withDefaultTerms` (`document.ts:140`) fills gaps from `DEFAULT_TERMS` (`document.ts:123`); the RB incoterm defaults to CIF-Callao like the reference doc. |
| `observations` (`document.ts:71`) | endorsement lockup | Prepends *«Representado por Wings Global Trade»* (root §5-bis rule 3 — the Wings credit belongs on trade documents, never the hero). |
| `issuer` (`CompanyInfo`) | `WINGS_ISSUER` (`quotation.ts:19`) | **Unchanged.** Wings is the seller of record for RB (represents + sells container-only); the brand appears in the *line/observations*, Wings on the *letterhead*. |

Nothing in this table is category-specific: swap the brand, product, and template
and the same four pulls produce a valid document. That is exactly why the shipped
renderer needs **zero** RB awareness.

### 3.3 Technical XLSX — the section builder (`packages/rb-core/tech-sheet.ts`, `NEW` — shared package)

**Design: clone the cost-export doctrine — one pure row-builder, two consumers
(print + XLSX).** Where the cost sheet has `costSheetRows(inputs, result)`
(`export.ts:13`) returning `[label, value][]`, the RB tech sheet has
`techSheetSections(input)` returning **labeled sections** (a multi-sheet workbook is
the natural fit for four distinct data blocks). It is **presentation-free and
money-free** — pure `[string, string|number][]` rows, the data-faithful artifact.

**Shared-package placement (not a mirrored copy).** `techSheetSections` and the
`cascadeForSlots` it calls must execute **byte-identically in both apps** — TOWER
(console export) and site (public fiche, §5). But `cascadeForSlots` currently lives at
`apps/site/src/lib/rb/packing.ts:17` and `RbContainerTemplate` is an `apps/site` type
(`fixtures.ts:63`), and **tower cannot import from `apps/site`** (`pnpm swap-test` law).
Mirroring them into `apps/tower` would silently break this chapter's own §5 byte-equivalence
invariant (two copies drift). So this chapter **lifts** `cascadeForSlots`, the
`RbContainerTemplate`/`PackingCascade` types, **and** `techSheetSections` into a shared
`packages/rb-core` package that both apps import — the same choice Ch 03 §3.3 flagged
("lifted to a shared package, or mirrored with a shared test vector"). One implementation,
two importers — never a copy.

```ts
// packages/rb-core/tech-sheet.ts  (NEW — shared package, imported by apps/tower AND apps/site;
//                                  mirrors the components/costing/export.ts shape)
// `RbContainerTemplate` + `cascadeForSlots` are lifted here from apps/site/src/lib/rb/*
// so both apps share ONE builder (see shared-package note above). The template type is
// extended with `packageCbm` + `packageKind` (both already on the shipped
// rb_packing_profiles / rb_public_templates view; see §3.3 note).
export interface TechSheetInput {
  brandName: string
  product: { name: string; specs: Array<{ label: string; value: string }>; hsCode?: string }
  packing: RbContainerTemplate          // package_cbm, package_kg, units_per_package, unit_name_plural, package_kind (Ch 02/03)
  gtin?: string                         // sourced from rb_packing_profiles.gtin (Ch 02 §2.4 single-source), nullable
  diagram: { box?: { w: number; d: number; h: number }; cells?: { x: number; z: number; y: number };
             pallet?: { grid: { x: number; z: number; skip: number }; layers: number } }  // rb_diagram_specs.params (Ch 04)
  container?: { kind: string; totalSlots: number; packagesPerSlot: number }                // Ch 03
}

/** Section rows shared by the print ficha and the XLSX — the ONE builder. */
export function techSheetSections(i: TechSheetInput): Record<string, [string, string | number][]> {
  const perSlot = i.container ? cascadeForSlots(i.packing, 1) : null                        // REUSE lifted cascadeForSlots
  const full    = i.container ? cascadeForSlots(i.packing, i.container.totalSlots) : null
  return {
    'Especificaciones': [
      ['Marca', i.brandName], ['Producto', i.product.name],
      ...(i.gtin ? [['GTIN', i.gtin] as [string, string]] : []),                            // nullable — omitted when absent
      ...(i.product.hsCode ? [['Partida (HS)', i.product.hsCode] as [string, string]] : []),
      ...i.product.specs.map((s) => [s.label, s.value] as [string, string]),               // schema-driven → category-agnostic
    ],
    'Empaque y dimensiones': [
      ['Empaque', i.packing.packageKind],                     // package_kind ('box'…), NOT unitNamePlural (retail unit)
      ['Unidades por empaque', i.packing.unitsPerPackage],
      ['CBM por empaque', i.packing.packageCbm],              // package_cbm — a volume, not the weight
      ['Peso por empaque (kg)', i.packing.packageKg],
      ...(i.diagram.box ? [['Caja máster (mm)', `${i.diagram.box.w}×${i.diagram.box.d}×${i.diagram.box.h}`] as [string, string]] : []),
      ...(i.diagram.cells ? [['Subdivisión interna', `${i.diagram.cells.x}×${i.diagram.cells.z}×${i.diagram.cells.y}`] as [string, string]] : []),
    ],
    ...(i.diagram.pallet ? { 'Paletizado': [
      ['Cajas por camada', i.diagram.pallet.grid.x * i.diagram.pallet.grid.z - i.diagram.pallet.grid.skip],
      ['Camadas', i.diagram.pallet.layers],
    ] } : {}),
    ...(i.container && perSlot && full ? { 'Contenedor y cupos': [
      ['Tipo', i.container.kind], ['Cupos totales', i.container.totalSlots],
      ['Cajas por cupo', i.container.packagesPerSlot],
      ['Unidades por cupo', perSlot.units], ['Kg por cupo', perSlot.kg],
      ['Unidades por contenedor', full.units], ['Kg por contenedor', full.kg],
    ] } : {}),
  }
}
```

**Template extension required (`packageCbm` + `packageKind`).** The shipped
`RbContainerTemplate` (`fixtures.ts:63-77`) carries `packageKg` but **no `packageCbm`**
and **no `packageKind`** — even though the shipped `public.rb_public_templates` view
already exposes `package_cbm` (`rb_wave1.sql:189`) and the profile row carries
`package_kind` (`:44`, default `'box'`). So the lifted `RbContainerTemplate` (shared
package, above) and its `mapTemplate` loader gain both fields. Without this: the CBM row
would emit **kg** (the original `packageKg` bug the comment betrayed), and `'Empaque'`
would print the **retail** unit `unitNamePlural` (e.g. `rollos`) instead of the package
kind (`box`). Both are now sourced correctly.

**Two consumers, exactly like the cost sheet:**

- `exportRbTechSheetXlsx(input, label?)` `NEW` — mirrors `exportCostSheetXlsx`
  (`export.ts:47`): `const XLSX = await import('xlsx')` (dynamic, client-only),
  `XLSX.utils.aoa_to_sheet` per section, `book_append_sheet` one tab per section,
  `XLSX.writeFile(wb, `wings-ficha-${slug(label)}.xlsx`)` (the `slug` helper,
  `export.ts:8`, reused). No styling — the XLSX is data only, category-blind.
- `RbTechSheetDocument` `NEW` — mirrors `CostSheetDocument` (`CostSheetDocument.tsx:14,25`):
  a pure presentational print surface that maps the **same** `techSheetSections(input)`
  into token-driven `--rb-*` blocks, printed via a browser-print route (§4).

**Category-agnostic proof.** The `'Especificaciones'` section spreads
`i.product.specs` — which come from the schema-driven `tower.rb_products.specs` jsonb,
rendered elsewhere by the one archetype-agnostic `SpecForm` (`SpecForm.tsx:50`, the
single `renderField` switch). No spec label is hardcoded; a new category ships a new
`spec_schema` and the sheet grows rows automatically. Dimensions/packing/cupo math
come from `cascadeForSlots` + template columns, which know nothing about the cargo.
**One builder, any category** — the same invariant SPEC §4 names ("one math, two
consumers").

**Server assembler** `getRbTechSheet(brandSlug, productSlug)` `NEW`
(`apps/tower/src/lib/actions/rb-quote.ts` or a sibling): auth → RLS read that joins
`rb_products` (specs, hs_code, name) + `rb_packing_profiles`/template (Ch 02/03 —
**GTIN pulled from `rb_packing_profiles.gtin`**, its single-source home per Ch 02 §2.4,
nullable) + `rb_diagram_specs.params` (Ch 04) + optional live template into a single
`TechSheetInput`. Returns it as `ActionResult<TechSheetInput>` so **both** consumers
render from identical server-assembled data (the print route and the client XLSX
button never assemble independently).

### 3.4 Capability derivation (hide-not-enforce)

`computeRbOutputCapabilities(roles, allocationStatus, productPublished)` `NEW`,
modeled on `computeCapabilities` (`catalog-logic.ts:50`) and derived from the
uppercase `DbLaneRole` (`catalog-logic.ts:19`), **never** `rbac.ts`'s mistyped
lowercase `Role` (reconciliation flag `catalog-logic.ts:11-18`). Exposes
`canQuote = allocation.status IN (RESERVED,CONFIRMED)` and `canExportTechSheet =
productPublished`. Drives **UI hiding only** (the «Generar cotización» button is
hidden until an allocation exists; «Descargar ficha» hidden until the product
publishes) — the same pattern as `PublishBar.showPublish` (`PublishBar.tsx:37`).
RLS + `composeQuote`'s own checks remain the real gate.

---

## 4 · Console UI (component tree)

Under the `marcas` module (Ch 01). **Reuse first, fork never** (reuse map "No forked
components"). Both outputs re-mount shipped organs and drive them with RB data
through props.

```
app/(shell)/marcas/[brand]/
├─ contenedores/SlotAllocationGrid            (Ch 03 — where the quote starts)
│   └─ row action «Generar cotización» → composeRbAllocationQuote
│        → composeQuote (untouched) → issueRbQuotation (mint number)
│        → open  /quote/[id]/document  in a new tab
│
├─ productos/[slug]/                          (Ch 02/04 fiche editor)
│   ├─ QuotationInstrumentPanel               (NEW; thin driver, no renderer)
│   │   ├─ unitPriceMinor input (Zod-bound integer minor; wholesale, per CUPO)
│   │   ├─ taxBps input (defaults DEFAULT_TAX_BPS 1800, document.ts:137)
│   │   └─ «Emitir» → issueRbQuotation → QuotationDocument preview (REUSE)
│   └─ TechSheetPanel                         (NEW; thin driver)
│       ├─ «Ver ficha técnica» → /marcas/[brand]/productos/[slug]/ficha-tecnica
│       └─ «Descargar XLSX» → exportRbTechSheetXlsx(getRbTechSheet(...))  (client)
│
└─ (print routes — OUTSIDE the (shell) group, like /quote/[id]/document)
    ├─ /quote/[id]/document                   (REUSE VERBATIM the shipped route:
    │     force-dynamic + robots noindex, page.tsx:12,16; renders
    │     <QuotationDocument doc={getQuotationDocument(id)} /> with PrintBar →
    │     browser print / save-as-PDF. RB quotes render here unchanged.)
    └─ /marcas/[brand]/productos/[slug]/ficha-tecnica   (NEW; mirrors the quote
          route — white A4, force-dynamic, robots noindex — rendering
          <RbTechSheetDocument sections={techSheetSections(getRbTechSheet(...))} />
          with a PrintBar. The PDF path = browser print, exactly as costing:
          "a client PDF is available via the print route", export.ts:4-5.)
```

`QuotationDocument` (`QuotationDocument.tsx:30`), the `/quote/[id]/document` route,
`PrintBar`, and the `slug`/`aoa_to_sheet`/`writeFile` export mechanics are rendered
**unchanged**, driven by props/args. The two NEW panels are **drivers, not
renderers** — they call server actions and mount the shipped surfaces. No second
«Cotización» layout, no second XLSX writer.

---

## 5 · Public sync (TOWER writes → site reads)

The two outputs sit on **opposite sides** of the public boundary — one is
internal-only, one has a public twin — and both honor "TOWER writes / site reads."

| Output | Public status | Sync path |
|---|---|---|
| **Quotation PDF** | **Internal only.** The `/quote/[id]/document` route is `force-dynamic` + `robots:{index:false}` (`page.tsx:12,16`) — never indexed, never a shelf surface. | TOWER composes/issues the quote (`tower.quotes`, RLS-scoped); it reaches the buyer through the **existing lead-mediated handoff** (WhatsApp + email, site map §4 reserve flow), not a public view. The buyer gets a PDF/link, never a `public.rb_public_*` row. This preserves root §5-bis: reservations and their instruments are lead/WhatsApp-mediated (no auth). |
| **Technical XLSX / ficha técnica** | **Has a public twin.** The console export and the **public fiche download** must be identical. | The public fiche reads `public.rb_public_templates` / `rb_public_containers` (site map §1) + Ch 04's `public.rb_public_diagrams` (`brand_slug, product_slug, model_id, params`) **plus** — required for the `'Especificaciones'` section, which none of those carry — Ch 02's `public.rb_public_products` (`name`, `specs`, `hs_code`; `02-CATALOG-AND-SPECS.md:188-193`) and the shipped `public.rb_public_brands` (`name`; `rb_wave1.sql:181-184`). This is the **same** data `getRbTechSheet` assembles from `tower.*`; both feed the **one** `techSheetSections` builder, so console-exported and shelf-downloaded XLSX are byte-equivalent. **GTIN decision:** GTIN is in **no** public view today and lives only on `rb_packing_profiles.gtin`. To keep byte-equivalence, this migration **additively adds `gtin`** (nullable) to Ch 02's `public.rb_public_products` view (join `rb_packing_profiles`) so both twins show it identically — this touches **none** of the three shipped `rb_public_*` views (invariant 4). If public GTIN is undesired, the field is dropped from the console twin too; it is never shown on only one side. |

**Sync invariants.** (1) The **money** document never crosses into a public view —
it is `tower.quotes` + a noindex print route; the site's only write-back stays
`public.rb_reserve` (site map §4). (2) The **public ficha técnica shows static
geometry only** — specs, dimensions, per-slot and full-container cascade (template
math) — and **never** a live remaining-slot count: that number lives only in the
configurator (`misterPack.ts` `forbidden_reminder`, site map §5; root §5-bis rule 4).
`techSheetSections` emits `totalSlots` / `packagesPerSlot` (immutable template facts),
**not** `slots_available`. (3) The public diagram params come from
`public.rb_public_diagrams` (Ch 04) which projects the **same** `rb_diagram_specs`
the console reads — one geometry source, so the drawing on the fiche and the numbers
in the XLSX can never disagree (Prime Directive 5: numbers exhibited from one source).
(4) No output touches the three shipped `rb_public_*` views' schema — the "Fixture
rule" (backend map §6) holds; the ficha reads them, the quote bypasses them.

---

## 6 · Phase-0 gates (must hold before either output ships)

Adapted from the lane Onboarding Protocol QA gates (root §4, §6) and TOWER law:

1. **Money integer-minor + bps, one source.** The quotation total is composed
   **only** through `composeQuote → issueQuotation` (server recompute via
   `subtotalFromLines`/`taxFromBps`, `quotation.ts:76,82`). `composeRbAllocationQuote`
   emits a single `unitPriceMinor` integer and **zero** arithmetic; no price is stored
   on a template or allocation; display never overrides the server split (root §5-bis
   rule 4). Assert: a composed RB quote's persisted `total_minor` equals the
   re-derivation, and no float appears in any RB money path.
2. **Mutation law auth → Zod → RLS.** Both write actions gate `requireUser()`
   (`pipeline.ts:302` pattern), Zod-parse before any write, and act through the
   `schema('tower')` RLS client scoped by `represented_brand_id` (§2.2 policies).
   `has_lane_role`'s RB analogue is the DB predicate — actions never branch on role
   (`pipeline.ts:7-10`). `requireGroupAdmin` is used **only** for tenant registration
   (Ch 01), never here.
3. **Append-only + audit.** The quote number mints once via `mint_quote_no`
   (`quotation.ts:229`, idempotent — never re-mints, `quotation.ts:200-201`); the
   additive `order_id`/`quote_id` back-links (§2.1) and every issue are captured by the
   Ch 03 §2.4 audit trigger on `rb_slot_allocations`. Nothing shipped is mutated
   destructively (`add column if not exists` only).
4. **TOWER writes / site reads.** The quotation is a TOWER-internal noindex print
   surface; the XLSX/ficha reads **only** `public.rb_public_*` + `rb_public_diagrams`
   on the public side, `tower.*` under RLS on the console side. No client writes. The
   public ficha never prints a live availability count.
5. **Tokens only.** The quotation print surface uses the shipped light print CSS
   (`quotation-document.css`); the ficha print surface (`RbTechSheetDocument`) is
   `--rb-*`-driven, no raw hex. The XLSX carries **no** styling (data-faithful,
   `export.ts` doctrine) — so it is trivially token-clean.
6. **Category-agnostic + swap test.** (a) `techSheetSections` spreads
   `product.specs` from the schema-driven store — a new category adds rows with no code
   change. (b) Render `RbTechSheetDocument` and the quotation line for brand A with
   brand B's `--rb-*` tokens: structure must hold (root §5-bis rule 2). (c) The
   quotation renderer already passed the swap test as a shared organ; the RB feed adds
   no component-level override.
7. **Wholesale-only language.** The quotation's unit is **cupo / contenedor**, never a
   per-unit retail price; no "add to cart" / "buy now" in any locale (Prime Directive 2).
   The cascade string exhibits cajas/unidades/kg as **derived brand assets** (Prime
   Directive 5), not a shoppable SKU price.
8. **Endorsement lockup.** «Representado por Wings Global Trade» appears in the
   quotation observations/colophon and never in a hero (root §5-bis rule 3); the issuer
   letterhead stays `WINGS_ISSUER`.

---

## 7 · Reuse ledger (what this chapter does NOT build)

- **Quotation renderer** — `QuotationDocument` (`QuotationDocument.tsx:30`) + the
  `/quote/[id]/document` print route (`page.tsx`). Re-mounted verbatim; RB data enters
  through the `QuotationDocument` shape only.
- **Quote money math + issue/number-minting** — `composeQuote`/`sendQuote`
  (`pipeline.ts:674,728`), `issueQuotation`/`getQuotationDocument`/`saveQuotationDetails`
  (`quotation.ts:203,180,274`), `taxFromBps`/`subtotalFromLines` (`quotation.ts:82,76`),
  `mint_quote_no` (`:229`). Reused; the RB adapter emits one integer and no arithmetic.
- **XLSX/print doctrine** — `costSheetRows` → {`CostSheetDocument`, `exportCostSheetXlsx`}
  (`export.ts:13,47`; `CostSheetDocument.tsx:25`). Cloned in shape
  (`techSheetSections` → {`RbTechSheetDocument`, `exportRbTechSheetXlsx`}); the
  `xlsx` dynamic import, `aoa_to_sheet`, `book_append_sheet`, `slug`, and browser-print
  PDF path are reused mechanics.
- **Slot cascade math** — `cascadeForSlots` (`packing.ts:17`). Reused for both the
  quotation line description and the XLSX cupo section; never re-inlined.
- **Spec assembly** — the schema-driven `tower.rb_products.specs` + `SpecForm`
  (`SpecForm.tsx:50`) and Ch 04's `rb_diagram_specs` params. Read, not rebuilt.
- **Availability + ledger** — `rb_slots_taken`/`rb_reserve` (`rb_wave1.sql:109-233`),
  `rb_container_availability` (Ch 03 §2.3), `setAllocationStatus` (Ch 03 §2.1).
  Referenced by the quote bridge; the reserve/subtraction path is untouched.

What this chapter genuinely **adds**: the additive `order_id`/`quote_id`/
`represented_brand_id` FKs (§2), `composeRbAllocationQuote` + `getRbTechSheet` actions,
the `techSheetSections` row-builder + its two thin consumers, the ficha-técnica print
route, and the two console driver panels — all layered over the shipped quotation and
cost-export machinery, never beside it.
