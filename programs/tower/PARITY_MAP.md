# TOWER · PARITY_MAP.md

wings-operations → TOWER workflow parity, per the Absorption section of
`programs/tower/CLAUDE.md`. Source app read-only at `~/projects/wings-operations`
(standalone Next.js; its data already lives inside `pyznlglvwihosemqkhtq` per D-02,
NOT on the paused "Euro Global" project `rsstxmptehndaipscaou`).

**What wings-operations actually is.** Not a generic catalog+container tool — it
is a **Peru-specific import-cost engine**: a SUNAT/Zofratacna landed-cost
calculator (CIF-by-incoterm → Ad Valorem → ISC → IGV importación → percepción →
recoverable-tax margins), a physical container-stowage simulator, a
multi-item cost-allocation (prorrateo) tool, and PDF/XLSX export of all of it,
with a SUNAT-expert AI co-pilot embedded in the financial module. That domain
depth is where the parity gaps concentrate.

Status: **PARITY** (equivalent workflow shipped) · **PARTIAL** (some of it
shipped, concrete gap) · **MISSING** (no TOWER counterpart).

| # | wings-operations workflow | Source (evidence) | TOWER counterpart | Status | Concrete gap |
|---|---|---|---|---|---|
| 1 | **Catalog CRUD** | `app/(protected)/catalog/*` on `public.products` | Catalog Studio (`lib/actions/catalog.ts`, ProductEditor, SpecForm, VersionHistory, PublishBar) | **PARITY+** | TOWER is a superset: schema-driven specs, DRAFT→IN_REVIEW→PUBLISHED, versioning + rollback, publish snapshots, revalidation. 99 products migrated (D-09). No gap. |
| 2 | **Bulk / xlsx import** | `app/(protected)/bulk/page.tsx` → `parse-pdf` → `calculate` → `exportBulk*` | One-time SQL catalog import (`migration/import_catalog.sql`, D-09) | **PARTIAL** | The migration was a **one-shot** load of 99 rows. There is **no ongoing bulk-import UI** — no xlsx/csv upload, no in-app row editor, no bulk export. `xlsx` is not even a TOWER dependency. Ops loses the drag-a-file → parse → review → import → export loop. |
| 3 | **Container tracking** | `lib/container.ts` `simularContenedor` (physical stowage sim: dims, door fit, floor packing, stacking, Callao MTC 32.5t road limit) | Container Desk (`containers.ts`, FillMeter, `commit_container_cbm`) | **PARTIAL** | TOWER models a container as *committed CBM vs a manually-entered capacity number*. wings-operations computes **how many physical units fit** from unit dimensions, container geometry, rotation, stacking and port weight limits. TOWER cannot answer "how many of this machine fit in a 40HC?" — the operational question the sim exists for. (Arguably out of TOWER's declared CBM-commitment scope, but it IS a live wings-operations workflow, so ops must confirm they don't need it before decommission.) |
| 4 | **Prorrateo (CBM-proportional cost allocation)** | `lib/prorrateo.ts` `calcularProrrateo` (allocate gastos across items by cbm / peso / valor_cif / unidad, with a rounding adjuster to the largest item; per-item logistic + purchase unit cost) | — | **MISSING** | TOWER has **no** multi-item cost allocation. `commit_container_cbm` tracks capacity; it never distributes a shared cost across the items in a container. This is a named parity requirement in the Absorption section and has no counterpart. |
| 5 | **Financial views (landed cost)** | `lib/calculations.ts` `calculate` (Decimal.js; CIF per incoterm EXW/FOB/CFR/CIF, Ad Valorem, ISC derived from fuelType+engineCC, IGV importación soles↔USD, percepción, cash outlay vs landed cost, target-price vs percent margin, three margin blocks: bruto / neto real / neto caja) | `computeLandedCost` + CostSheet (`containers.ts:918`, `containers-logic.ts:96`) | **PARTIAL / effectively MISSING for Peru** | TOWER's landed cost is a **flat 5-term sum**: `fob + freight + insurance + duties + handling` (`computeLandedCostTotal`). It has **no** incoterm-driven CIF, **no** Ad Valorem/ISC/IGV/percepción, **no** recoverable-tax accounting, **no** margin modelling, **no** PEN↔USD. TOWER cannot reproduce a single wings-operations cost sheet for a real Peru import. **This is the #1 decommission blocker.** |
| 6 | **parse-pdf** | `app/api/parse-pdf/route.ts` (supplier PDF → **array** of vehicle rows for bulk import; haiku, base64 document) | `/api/ai/spec-extract` (`route.ts`; supplier PDF → **one** product spec draft; sonnet, reviewable) | **PARTIAL** | Different granularity and purpose. TOWER extracts **one** product's spec fields for a single draft; wings-operations extracts **many** rows to feed the bulk cost calculator. TOWER can't do bulk multi-row extraction into an import queue. |
| 7 | **ai-support** | `app/api/ai-support/route.ts` (streaming SUNAT-expert chat with workspace context + tool-use "suggestion" blocks, embedded in the financial module) | Intelligence: triage / score / brief / spec-extract as reviewable drafts (`lib/actions/intelligence.ts`) | **PARTIAL / different shape** | TOWER's AI is draft-producing (triage a lead, score an account, write a brief, extract a spec). There is **no in-module conversational co-pilot** answering SUNAT/costing questions against the current financial workspace. The "ask the AI about this calculation" affordance is absent. |
| 8 | **Dashboard** | `app/(protected)/dashboard/page.tsx` | Signal Deck (`signals.ts`, LanePulse/Funnel/Leaderboard/FillWatch/SourceSplit) | **PARTIAL** | Different domain: TOWER's dashboard is **first-party event analytics** (views→spec→mister→rfq funnels from rollups). wings-operations' dashboard aggregates **saved cost calculations / operational KPIs**. They don't overlap; whether ops' dashboard needs are met depends on what that page shows (verify contents with ops). |
| 9 | **History** | `app/(protected)/history/page.tsx` + `lib/audit.ts` (`loadAuditHistory`, `verifyRecord` — saved calculations with per-record verification) | AuditExplorer (COMPONENT_TREE §6) | **MISSING (unbuilt)** | The TOWER counterpart is the Admin AuditExplorer, which is a **placeholder** this wave (`admin/page.tsx` = EmptyState). wings-operations' history also re-opens/re-exports past calculations — a feature tied to workflow #5, which TOWER doesn't have either. |

---

## Verdict — is the decommission gate passable?

**No. Not yet.** The Absorption gate (TOWER CLAUDE.md §Decommission gate)
requires that *every wings-operations workflow demonstrably runs in TOWER and ops
signs off*. Three named parity requirements are **not met in code**, and one of
them is the core reason wings-operations exists:

1. **Financial / landed-cost (row 5) — MISSING for Peru.** TOWER's flat 5-term
   sum cannot reproduce a SUNAT import cost sheet (incoterm CIF, Ad Valorem, ISC,
   IGV importación, percepción, recoverable-tax margins). No operator could switch
   from wings-operations to TOWER for costing today.
2. **Prorrateo (row 4) — MISSING.** No multi-item cost allocation exists in TOWER.
3. **Bulk import + PDF/XLSX export (rows 2, 6) — PARTIAL.** The ongoing
   file-in / rows-out loop and the branded PDF/XLSX deliverables ops relies on are
   absent; only a one-shot SQL load happened.

Secondary blockers: the container **stowage simulator** (row 3) and the
**history/audit** view (row 9, tied to the unbuilt AuditExplorer and to the
missing financial engine).

**Until these close, wings-operations stays live as the operational fallback**
(exactly as the Absorption section instructs: *never turn it off mid-migration*).
The decommission checklist in HANDOVER.md is therefore **not yet actionable** —
it becomes actionable only after (a) the financial engine + prorrateo are built
in TOWER, (b) bulk import/export is restored, (c) ops runs its real workflows in
TOWER and signs off. What *is* correct today is the data location (row-1 catalog
migrated, all data inside `pyznlglvwihosemqkhtq`), so no cross-project data move
remains — the blocker is feature parity on the financial/logistics workflows, not
data.

> Scope note for the roadmap: rows 3–5 imply TOWER needs a **Peru-costing
> archetype extension** — incoterm-aware CIF + SUNAT duty schedule + prorrateo —
> before it can absorb the import-calculator role. That is a build program, not a
> hardening fix, and should be scheduled explicitly rather than assumed done.
