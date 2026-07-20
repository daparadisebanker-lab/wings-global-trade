# TOWER Wave 6 — Peru Costing + Completion

> **Status: PROPOSAL — Phase 0 pending Muaaz.** Written 2026-07-20.
> A spec package (per `programs/README.md`) — not active law until Muaaz says
> build it. It closes the **wings-operations decommission gate** (the one thing
> keeping the legacy app alive) by porting its Peru import-cost engine into
> TOWER, and folds in TOWER's remaining "missing pieces" (bulk import/export,
> history, the open QA items) as a completion wave. Grounded in the actual
> `wings-operations` source (cloned into this session) and its parity oracle.

---

## 0 · Why this exists

The TOWER audit (2026-07) found the app **built across all five waves but unable
to retire `wings-operations`** — because wings-operations is not a catalog tool,
it is a **Peru-specific SUNAT import-cost engine**, and three of its named parity
requirements have no TOWER counterpart (PARITY_MAP rows 4, 5, 2/6). Until they
land, wings-operations must stay live as the operational fallback, and the
HANDOVER decommission checklist stays un-actionable.

This program builds those pieces **as a faithful port of validated logic**, not a
reinvention — the source math is already proven against an Excel workbook to
`|Δ| ≤ 0.005` across 185 rows. That changes the risk profile: this is a
disciplined migration with a regression oracle, not a from-scratch domain build.

## 1 · What wings-operations actually does (the source of truth)

Read directly from `/workspace/wings-operations` (commit `82b3404`; engine
`c74b60e`):

| Capability | Source | Lines | What it computes |
|---|---|---|---|
| **SUNAT landed cost** | `lib/calculations.ts` | 193 | Incoterm→CIF (EXW/FOB/CFR/CIF) → Ad Valorem → ISC (fuel/CC-derived) → IGV importación (soles↔USD round-trip) → percepción → landed cost → cash outlay → margin (percent / target-price) → 3 margin blocks (bruto / neto real / neto caja) |
| **Prorrateo** | `lib/prorrateo.ts` | 104 | Allocate shared gastos across items by `cbm / peso / valor_cif / unidad`, with a rounding adjuster to the largest item; per-item logistic + purchase unit cost |
| **Stowage sim** | `lib/container.ts` | 205 | How many units fit a `20ST/40ST/40HC/OT20/FR40` by volume, weight, floor packing, stacking, and the **Callao MTC 32.5t** road limit; returns `factor_limitante` |
| **Export** | `lib/export.ts` | — | Branded **PDF** (jsPDF) + **XLSX** (sheetjs), single-calculation and bulk |
| **Bulk import** | `app/(protected)/bulk` + `api/parse-pdf` | — | Supplier PDF → **many** vehicle rows (haiku) → cost each → review → export |
| **SUNAT co-pilot** | `api/ai-support` | 74 | Streaming SUNAT-expert chat with workspace context |
| **History** | `app/(protected)/history` + `lib/audit.ts` | 89 | Saved calculations, per-record verify, re-open/re-export |

**The parity oracle (this is the asset that de-risks everything):**
`wings-operations/fixtures.json` — 185 rows generated from the live engine
(`scripts/generate-fixtures.ts`), 7 cases (A–F) covering all 4 incoterms, 4 fuel
types, both margin modes, the margin floor, and prorrateo with the adjuster
firing. `EXCEL_PARITY.md` documents all ~27 rounding points and the deliberate
as-coded quirks. **The port is correct iff it reproduces `fixtures.json`.**

## 2 · Prime constraints (decide before code)

### 2.1 Money discipline — the central porting decision (Phase-0 gate G1)
wings-operations computes in **`decimal.js`** and emits `number`. TOWER law
(Directive 3 / ADR-7) is **integer minor units + bps, no float touches stored
money**. These meet at the engine boundary. Recommended resolution:

> **The costing engine keeps `decimal.js` as its sanctioned numeric core**
> (arbitrary-precision decimal — *not* IEEE float; the exact tool the SUNAT
> round-trips and 6-dp margin rates require). It takes explicit inputs (amounts
> as integer minor units + currency, rates as bps, TC as an explicit per-op
> input) and **converts to integer minor units at the persistence boundary**.
> Directive 3's intent — no float on a *stored* amount, all arithmetic
> server-side — is fully honored; a from-scratch integer reimplementation would
> risk the load-bearing soles↔USD rounding for no benefit. `fixtures.json` is the
> regression gate on every change.

If Muaaz rejects `decimal.js` in TOWER, the fallback is a pure integer-minor
reimplementation validated to the same fixtures — more work, same output.

### 2.2 Archetype fit (Phase-0 gate G2)
Per root CLAUDE.md §3, structure derives from archetype. Peru costing is a
**cross-cutting financial capability**, not a new buyer archetype — it attaches
to a container/order regardless of lane archetype (EQUIPMENT machinery, COMMODITY
drums, etc. all get landed). Recommended: model it as a **Costing module on the
Container Desk**, keyed to `containers`/`orders`, config-driven — not a 7th
archetype. (The EQUIPMENT vehicle inputs — `fuelType`, `engineCC` for ISC — are
product-spec fields already, so ISC derivation reads specs, not hardcode.)

### 2.3 Non-negotiables carried from TOWER law
RLS on every new table (SALES/LANE_DIRECTOR write, per lane); audit trigger
before UI; append-only saved calculations (a cost sheet is a dated record, never
edited in place — re-run = new version); rates live in a **config table**, never
magic numbers (mirrors the workbook's "no magic numbers" rule); ES/EN + wholesale
lint on all copy. This is internal costing — absolute figures are fine (it is not
a public surface).

## 3 · The build — capability by capability

### A · SUNAT landed-cost engine  *(PARITY_MAP row 5 — the #1 blocker)*
Port `calculations.ts` verbatim in logic into `apps/tower/src/lib/costing/`:
- `deriveISCRate({fuelType, engineCC})` — hybrid/diesel→0; else CC≤1400→5%, >1400→7.5%. **Replicate the `electric` fall-through quirk** (flag as an upstream review item, do not silently "fix" — parity first).
- `computeImportCost(inputs)` — the exact chain in §1, exact rounding order per `EXCEL_PARITY.md` points 1–18, including the **basePEN round-in-soles → igvImportacion round-in-USD** round-trip (load-bearing).
- Keep the two deliberately-unrounded values (percent-mode `marginRate`, `margenNetoCajaPct`).
- Ship `costing/fixtures.json` (copied from source) + a parity test asserting all import cases A–E to `|Δ| ≤ 0.005`.

### B · Prorrateo  *(row 4 — MISSING)*
Port `prorrateo.ts`: base by `cbm/peso/valor_cif/unidad`, per-cell 2-dp round,
**rounding adjuster to the largest item**, USD/PEN handling, per-item
logistic+purchase unit cost. Replicate the `totalBase=0 → full monto to first
item` and tie-break-first-max quirks. Parity test against fixtures case F.

### C · Bulk import  *(rows 2, 6 — PARTIAL)*
The ongoing loop wings-operations has and TOWER lost: **file → parse → review →
cost → import/export**.
- Multi-row extraction: extend Intelligence with a `bulk-spec-extract` that
  returns **an array** of product/vehicle rows (source `parse-pdf` extracts many;
  TOWER's current `spec-extract` does one). Lands as a reviewable draft queue
  (Directive 7 — propose, human disposes), not auto-import.
- Import queue UI: review rows → cost each (engine A) → commit to `products` /
  a container. `xlsx` becomes a TOWER dependency (it is not today).

### D · Export (PDF + XLSX)  *(rows 2, 6)*
Port `export.ts`: branded single-calculation **PDF** + **XLSX**, and bulk
variants. Server-generated where possible (consistent with "PDF via n8n" in
API_MAP) or client-side via `xlsx`/jsPDF for the interactive desk. This is the
deliverable ops hands to clients/customs — parity of *format* matters.

### E · Stowage simulator  *(row 3 — PARTIAL; Phase-0 gate G3)*
Port `container.ts` (`simularContenedor`): container geometry table
(20ST/40ST/40HC/OT20/FR40 with real vol/peso/tara), floor+volume+weight+stacking,
**Callao MTC 32.5t road limit**, `factor_limitante`. **Gated:** ops must confirm
they still need "how many fit in a 40HC?" before we build it — it may be out of
TOWER's declared CBM-commitment scope. If yes, it feeds the FillMeter/Container
Desk; if no, it is explicitly descoped and wings-operations' sim is retired.

### F · SUNAT co-pilot  *(row 7 — PARTIAL; Phase-0 gate G4)*
An in-module conversational assistant answering SUNAT/costing questions against
the current cost sheet. Recommended **deferred**: it is an assistant affordance,
not a decommission blocker — the engine (A) is what ops needs to switch. Revisit
after A–D ship. (If built: reviewable, workspace-scoped, no auto-commit.)

### G · History / saved cost calculations  *(row 9 — MISSING)*
Append-only `cost_calculations` (inputs + result snapshot + config version + who
+ when), listable/filterable, re-openable, re-exportable. This is the wings-ops
"history" workflow and depends on A. AuditExplorer (already built) covers the
audit trail; this covers the *domain* record.

## 4 · Data model (additions to schema `tower`)

Draft — refine at build. All: `uuid` PK, `timestamptz`, integer minor units,
`brand_id`+`lane_id` for RLS, audit trigger, append-only where noted.

```sql
set search_path to tower;

-- Config rates (no magic numbers — mirrors the workbook CONFIG sheet). Versioned.
create table costing_config (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id),
  version int not null,
  igv_bps int not null default 1800,
  percepcion_bps int not null default 350,
  insurance_bps int not null default 150,
  isc_threshold_cc int not null default 1400,
  isc_low_bps int not null default 500,   -- ≤ threshold
  isc_high_bps int not null default 750,  -- > threshold
  effective_from date not null,
  unique (brand_id, version)
);

-- Append-only saved cost sheet (the "history" record; re-run = new row).
create table cost_calculations (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id),
  lane_id uuid not null references lanes(id),
  container_id uuid references containers(id),
  order_id uuid references orders(id),
  product_id uuid references products(id),
  config_version int not null,
  inputs jsonb not null,        -- ImportInputs (amounts minor, rates bps, TC explicit)
  result jsonb not null,        -- ImportResult snapshot (minor units)
  incoterm text not null,
  exchange_rate_milli int not null,  -- TC × 1000, integer (per-op data, not a rate)
  landed_minor bigint not null, cash_outlay_minor bigint not null,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Multi-item allocation run + per-item results.
create table prorrateo_runs (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id),
  container_id uuid references containers(id),
  exchange_rate_milli int not null,
  gastos jsonb not null,        -- GastoProrrateo[]
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);
create table prorrateo_items (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references prorrateo_runs(id) on delete cascade,
  item jsonb not null,          -- ItemProrrateo
  result jsonb not null,        -- ResultadoItemProrrateo (minor units)
  costo_total_minor bigint not null
);
```

`landed_costs` (the existing flat 5-term table) is **superseded** for Peru by
`cost_calculations` but kept for non-Peru/simple cases — the CostSheet chooses by
config, no destructive migration.

## 5 · Where it lives + surfaces

- **Costing module on the Container Desk** (`apps/tower/src/components/containers/cost-sheet` extended, or a sibling `costing/`): the SUNAT cascade as a `ManifestTable`-style waterfall, incoterm-aware input greying (mirrors the workbook), the 3 margin blocks, PDF/XLSX export.
- **Prorrateo panel** on a container: items × gastos grid → allocation matrix → per-item landed unit cost.
- **Bulk import** under Catalog: drag file → review draft rows → cost → import.
- **History** list: saved cost sheets, re-open/re-export.
- Stowage sim (if G3=yes): a calculator on the container detail feeding FillMeter.

## 6 · TOWER completion items (fold-in — the other "missing pieces")

Bundled here so TOWER reaches a clean, deployable, decommission-ready state:

- **Deploy readiness** (HANDOVER §4): confirm `tower` PostgREST exposure is live (migration `tower_21` sets it in-DB — verify on prod); set env vars; **storage RLS** policies on `product-media`/`trade-documents` (D-13.3 outstanding); import + activate the n8n weekly-brief workflow.
- **M-1 (QA):** make publish+snapshot and other multi-step writes **atomic RPCs** (today they are multi-statement server actions). Applies to the new costing writes too.
- **M-2 (QA):** correct stale `wave3/wave4` migration references in code comments → the committed `supabase/migrations/` files.
- **M-3 (QA):** wire the **⌘K palette** record-jumps (product/account/container) and run-actions ("publish…", "new RFQ…", "new cost sheet…") — currently dead stubs beyond admin destinations.
- **Doc reconciliation:** PARITY_MAP row 9 ("AuditExplorer unbuilt") is stale — Admin shipped in Wave 5; update it. Root CLAUDE.md "TOWER unbuilt" line already corrected in practice.

## 7 · Wave plan

| Wave | Scope | Gate |
|---|---|---|
| **6.0** | Phase-0 sign-off (G1–G5); copy `fixtures.json`; scaffold `lib/costing` | Muaaz answers |
| **6.1** | **Engine port** (A) + **prorrateo** (B) as pure, tested TS; parity to fixtures A–F | 185 rows `|Δ|≤0.005` green |
| **6.2** | Persistence (migrations §4, RLS, audit) + Costing module UI (waterfall, margins) | non-admin fixture + Áladín isolation |
| **6.3** | Export (D: PDF+XLSX) + History (G) | ops opens a real cost sheet end-to-end |
| **6.4** | Bulk import (C: multi-row extract → review → cost → import) | file-in → rows-out loop demoed |
| **6.5** | Completion fold-in (§6: storage RLS, M-1/M-2/M-3, deploy prereqs) | deploy checklist green |
| **6.6** | Stowage sim (E) *if G3=yes* · co-pilot (F) *if G4=yes* | ops confirms need |
| **6.7** | **Ops sign-off** — every wings-operations workflow runs in TOWER; decommission gate passes | HANDOVER §6 actionable |

## 8 · Phase 0 — decisions for Muaaz (gates)

- **G1 · `decimal.js` as the costing numeric core** (recommended yes; §2.1). No → integer-minor reimplementation to the same fixtures.
- **G2 · Costing = Container-Desk module, not a 7th archetype** (recommended yes; §2.2).
- **G3 · Stowage simulator — still needed?** Ops confirms they use "how many fit" or we descope it (§3E).
- **G4 · SUNAT co-pilot — now or deferred?** (recommended deferred; §3F).
- **G5 · Rate source of truth.** Are IGV/percepción/Ad Valorem/ISC rates and the exchange rate ops-entered per operation (as today), or pulled from a SUNAT reference feed? (Recommended: config table + per-op TC now; feed later — §4.) Ad Valorem is per-HS-code (0/6/11%): entered per product now, or a HS→rate table?
- **G6 · Scope confirmation:** does closing the decommission gate need all of A–D+G, or does ops accept an interim (e.g. history deferred)? Sets the minimum wave set before sign-off.

## 9 · Definition of done (decommission-ready)

- [ ] Phase 0 (G1–G6) answered and recorded.
- [ ] Engine + prorrateo reproduce `fixtures.json` (185 rows, `|Δ| ≤ 0.005`) in TOWER CI.
- [ ] All quirks replicated intentionally (electric ISC, bloque2=bloque1, negative caja margin, adjuster ties, totalBase=0) — parity, with review flags where noted.
- [ ] Money: integer minor units at every persistence boundary; rates in bps; TC explicit; audit + RLS + non-admin/Áladín-isolation tests green.
- [ ] PDF + XLSX export format-faithful to wings-operations deliverables.
- [ ] Bulk file-in → rows-out loop works; History re-open/re-export works.
- [ ] §6 completion items closed; deploy checklist green.
- [ ] **Ops runs each real workflow in TOWER end-to-end and signs off** → HANDOVER §6 decommission steps become actionable (archive repo + retire Vercel; never touch either Supabase project).
