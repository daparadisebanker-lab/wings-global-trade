# ADAPTATION — Reconciling the Mister Scopes with the Real Repo

**Verified against:** `github.com/daparadisebanker-lab/wings-global-trade` @ `master` (2026-07-23) — root `CLAUDE.md`, `spec/`, `programs/tower/`, `apps/tower/` (package.json, env template, src routes), `packages/` and Supabase migrations incl. `tower_16_ai_drafts` and `tower_23_costing`.
**Verdict in one line:** the Tower is not greenfield — it is mid-build (Wave 5 QA) with its own spec suite; both my packages stand as *vision/experience layers* but several assumptions are corrected below, and everything must dock onto existing names, tables, and laws.

## 1. Verified repo facts that govern

- **Monorepo (pnpm):** `apps/site` (live), `apps/tower` (CRM/ERP/PIM, actively built — Next 15.3.9, React 19, Tailwind **3.4** reading CSS custom properties, TanStack query/table/virtual, **cmdk**, zod, **decimal.js**, exceljs/xlsx, `@anthropic-ai/sdk`, vitest). Packages: `@wings/mister` (client contract + SSE hook), `@wings/trade-ui` (frozen Tier-1 organs), `@wings/rb-core`, `liveries`.
- **Single Supabase project** (`pyznlglvwihosemqkhtq`); tower schema is deep: identity/access, catalog, CRM pipeline, ERP container desk, **signals**, ops audit + triggers, RLS, **cron jobs**, events partitions, **whatsapp_messages**, **ai_drafts**, webhook deliveries, **quotation_document**, **costing + costing_config**, import_journeys, storage buckets, fichas, rep profiles, RB console.
- **Design constitution (root CLAUDE.md):** Tier-1 frozen skeleton — spacing `4…128` (matches my 8-pt law ✓), radii **8/12/16/20/999** (control/card/panel/dock/pill), 1.25 modular type scale, "gantry/settle" easing + macOS springs, semantic tokens only, wholesale-only vocabulary, swap test, Awwwards tension test already in QA.
- **Mister constitution (spec/MISTER_MASTER_BRIEF.md):** one engine, many knowledge packs; archetypes A1–A5; client-side Mister **NEVER states final prices, lead times, or availability — and no tool exists that could** (architectural prohibition); exactly 3 quick actions per turn; landed-cost *education* is an indexed waterfall (base-100), not real quotes; voice "Expert. Direct. Commercial. Not corporate."
- **Tower program spec exists:** `programs/tower/` (PRODUCT_BRIEF, ARCHITECTURE, DATABASE_SCHEMA.sql, DESIGN_SYSTEM, COMPONENT_TREE, API_MAP, BUILD_PROMPT, CLAUDE.md, PARITY_MAP, REMAINING, WAVE5_QA_FINDINGS). Note: root CLAUDE.md still calls tower "queued/unbuilt" — stale; migrations and `apps/tower/src` prove otherwise.
- **Market math is Peru-first:** `costing_config` carries `igv_bps`, `percepcion_bps`, `isc_*` (Peruvian IGV/percepción/ISC), `exchange_rate_milli`, all money in integer minor units. My Colombia/TRM/DIAN assumption was wrong.
- **Roles (RLS):** `LANE_DIRECTOR, CATALOG_EDITOR, TRADE_OPS, SALES, VIEWER` + `is_group_admin()` — not my `direccion/comercial/ops/finanzas`.
- **Automation:** shared n8n instance (`N8N_WEBHOOK_BASE`), HMAC ingest keys per brand, WhatsApp webhooks, "Mister Hook", `JOURNEY_SIGNING_SECRET`. Vercel deploy.

## 2. Concept → repo mapping (the docking table)

| My spec concept | Repo reality | Action |
|---|---|---|
| Artifact system (03) | `tower.ai_drafts` (kinds `TRIAGE, LEAD_SCORE, SPEC_EXTRACT, WEEKLY_BRIEF`; status `DRAFT/APPROVED/REJECTED`; confidence; reviewed_by; append-only) + `quotation_document` + proforma/ficha/cost-sheet routes | **Extend, don't replace.** New kinds (`COTIZACION, HOJA_COSTOS, COMUNICACION, REPORTE_ESTADO, CHECKLIST_DOCS, ACTA, SOP, BRIEF`) join the enum; my lifecycle adds `review→sent/filed` states and semantic diffs on top of the existing approve flow |
| `compute_landed_cost` calculator | `cost_calculations` + `costing_config` + prorrateo engine (decimal.js, minor units, `exchange_rate_milli`) | **Exists.** Keep my law ("no model arithmetic on money") pointed at *their* engine; adopt `_minor`/`_milli`/bps conventions; Peru tax model |
| The Watch (05) | `tower_05_signals` + `tower_09_cron_jobs` + webhook_deliveries | **Substrate exists.** My watch rules become signal definitions + triage layer; delivery/severity/interruption budget is the new part |
| Morning Brief | `WEEKLY_BRIEF` draft kind | Extend to daily per-role; rendering + 90-second law is new |
| Cmd+K command bar (01) | `cmdk` already a dependency | Build on it; verb grammar is the new part |
| Review queue (J/K) | ai_drafts has status but (apparently) no queue UX | New screen; confirm against `programs/tower/COMPONENT_TREE.md` before building |
| Roles/permissions (06) | `has_lane_role()`, roles above, brand/lane dimensions | **Adopt theirs**; my approval matrix maps: direccion→`is_group_admin`/LANE_DIRECTOR, comercial→SALES, ops→TRADE_OPS, finanzas→(confirm; likely LANE_DIRECTOR-scoped) |
| My proposed schema (clients/imports/quotes…) | CRM pipeline, container desk, import_journeys, catalog already exist | **Drop my table proposals**; keep only additive ones (knowledge_chunks/pgvector, watch triage fields) as new migrations following `tower_NN_*` naming |
| RAG company memory (02) | Not found in migrations | **Genuinely new** — pgvector migration + ingest-on-approval; rates/tariffs-never-from-memory law stands |
| Orchestrator profiles (02) | One engine, many knowledge packs; `@wings/mister` | Torre profiles = internal knowledge packs + tower tool belt on the **same** engine/package. No second bot |
| Design tokens (my 02) | Tier-1 frozen + `WINGS_PALETTE_LAW_AMENDMENT`, livery system | Tier-1 wins where they differ: radii **8/12/16/20** (not my 8/16/24); easing names gantry/settle; Tailwind 3.4 not v4. My engine-room deltas (paper-first density) remain valid as a Tier-2 proposal |
| Constellation signature | `MISTER_EXPRESSIVE_LAYER_SPEC.md` + `MisterDock` organ exist | Merge: read that spec first; my Constellation states/formations become a proposal into it, not a parallel system |

## 3. Corrections to the CLIENT package (`mister-product-scope/`)

1. **The Ch.4 live demo may not show real cost bands.** Client-side constitution forbids final prices/lead times, with no price tools existing. Replace with the sanctioned **landed-cost waterfall (indexed, base-100)** + real *process* answers; real quotes remain a Tower-side, human-approved artifact. This makes the demo constitution-compliant and still real.
2. The marketing surface must compose with `apps/site`'s lane/livery system (same box, different livery) rather than a standalone site; wholesale vocabulary lint applies to all my copy ("cotización" flows → RFQ language where the site law requires).
3. Radii + Tailwind version corrections as above; motion vocabulary should express "gantry/settle + macOS springs" naming.
4. My Mister voice rules are compatible with theirs ("Expert. Direct. Commercial.") — merge, theirs leads.

## 4. Where these packages land in the repo

- `mister-tower-scope/` → **`spec/contributions/mister-torre/`** (a `contributions` dir already exists) or alongside `programs/tower/` as `EXPERIENCE_LAYER_*` docs — flag: root law says `programs/` are never built unless explicitly told, so the act of adopting this package is that explicit instruction, recorded in `DECISIONS.md`.
- `mister-product-scope/` → `spec/contributions/mister-expressive/` as input to `MISTER_EXPRESSIVE_LAYER_SPEC.md`.
- Any new tables ship as `supabase/migrations/…_tower_NN_*.sql` continuing the sequence; all money in minor units; RLS + audit triggers mandatory (their pattern).

## 5. Standing corrections summary (assumption → verified)

| Assumed | Verified |
|---|---|
| Greenfield tower | Mid-build, Wave 5 QA, own spec suite in `programs/tower/` |
| Tailwind v4 | 3.4 + CSS custom properties |
| Radii 8/16/24 | Tier-1: 8/12/16/20/999 |
| Colombia/TRM/COP | Peru-first: IGV/percepción/ISC, `exchange_rate_milli` |
| Roles direccion/comercial/ops/finanzas | LANE_DIRECTOR/CATALOG_EDITOR/TRADE_OPS/SALES/VIEWER + group admin |
| New artifact tables | Extend `ai_drafts` + `quotation_document` |
| New calculator | `cost_calculations`/`costing_config`/prorrateo exist |
| Client demo shows cost bands | Forbidden client-side; use indexed waterfall education |
| Separate internal bot | One engine (`@wings/mister`), Torre = packs + tools + surfaces |

**Still unverified (check on integration):** `programs/tower/DATABASE_SCHEMA.sql` vs live migrations drift; `PARITY_MAP.md` and `REMAINING.md` (what Wave 6+ already plans — avoid duplicating); whether a review-queue UX already exists in `COMPONENT_TREE.md`; finanzas role mapping; `packages/mister/src` internals.
