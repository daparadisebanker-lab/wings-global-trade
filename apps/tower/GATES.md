# GATES.md — Mister Torre

Gate results for the Mister Torre build (spec at `spec/contributions/mister-torre/`).
Honest status: what is **green**, what is **stubbed/mocked**, what is **deferred**.
This session delivered the **flagship quote run** vertical slice (the owner's chosen
scope) plus the Constellation avatar and the Inter→Space Grotesk font swap.

Run the gates:

```
cd apps/tower
pnpm run typecheck          # tsc --noEmit
pnpm test                   # vitest run  (whole tower suite)
pnpm exec vitest run src/lib/torre/   # Torre core + eval suites only
pnpm run lint               # next lint
```

Baseline before this work: **476 tests / 54 files green**. After: **565 tests / 61
files green** (89 new). Typecheck + lint clean throughout; every commit is a green
checkpoint.

---

## Phase 0 — Foundations · ✅ (docked, not re-scaffolded)

The Tower already exists (mid-build); Mister Torre is additive on top of it.

| Gate | Status | Evidence |
|---|---|---|
| Schema for artifacts | ✅ additive | `supabase/migrations/20260723120000_tower_48_torre_artifacts.sql` extends `ai_drafts.kind` (COTIZACION, HOJA_COSTOS, COMUNICACION + reserved kinds). **File written, not applied to prod** — the tower migration branch (tower_22→47) is itself undeployed; migrations are the source of truth. |
| RLS per role | ✅ inherited | `ai_drafts` RLS (roles `LANE_DIRECTOR/CATALOG_EDITOR/TRADE_OPS/SALES`) governs Torre writes unchanged. Verified by reading `tower_16` + `tower_08`. |
| Tokens only, zero raw hex/px | ✅ | Host surfaces use Tower semantic tokens; Mister artifact renderers use the ratified World-B constant (`mister-theme.ts`) — the sanctioned exemption, not new hex. |
| Audit online | ✅ inherited | `ai_drafts` audit trigger + hash-chain fire on every Torre write (operator = `auth.uid()`). |

## Phase 1 — The calculator & quote run (the flagship) · ✅

| Gate | Target | Status | Evidence |
|---|---|---|---|
| `compute_landed_cost` unit-tested | 100% | ✅ pre-existing | `lib/costing/engine.ts` `computeImportCost` (parity oracle `parity.test.ts` vs `fixtures.json`). Torre **reuses** it; no model money math. |
| Quoting eval | ≥90% | ✅ 100% | `evals/quoting.jsonl` (32 cases) via `lib/torre/evals.test.ts`. Each artifact's stored result equals `computeImportCost(stored inputs)` to the cent; margin per rule; approvable. |
| Honesty eval | 100% | ✅ 100% | `evals/honesty.jsonl` (15 traps) — missing FOB, missing/expired freight rate, unresolved/stale tariff → blocker + unapprovable. Never invents a rate. |
| A quote reproduced to the cent | exact | ✅ | `quote-run.test.ts` golden anchor (CAT 320: landed 85 014.00, final 118 373.49). |
| Trigger → approvable pair | linked | ✅ | `lib/actions/torre-quote.ts` persists linked `hoja_costos` + `cotizacion` (+ cover `comunicacion`) as DRAFTs; `cotizacion.hojaCostosRef` links the pair. |
| draft→review→approve→export | full lifecycle | ✅ | Review queue (below) + `torre-review.ts` approve (blocker-gated) + XLSX exporters (`export.ts`). |

## Phase 2 — Panel, command bar & comms · ◑ (review + comms shipped; panel reuses existing)

| Gate | Status | Evidence |
|---|---|---|
| Reachable from Cmd+K / panel | ✅ reused | `quoteRunCapability` registered in the **existing** Mister cockpit (⌘J) + `lib/copilot/router.ts`; no second palette built (extends what exists). |
| comms artifact | ✅ | `COMUNICACION` artifact (schema + renderer + cover generation, ES/EN by client language). |
| Review queue with J/K flow | ✅ | `components/intelligence/torre-queue/TorreReviewQueue.tsx` — J/K navigate, ⌘↵ approve, R reject; keyboard-complete. Default panel in the Intelligence workspace. |
| Approve names the exact side effect | ✅ | `review-logic.ts` `approveSideEffect`; the approve button renders it; disabled while any blocker is open. |
| Email send-on-approve | ◑ mocked | Connector is **MOCK_CONNECTORS** — approving a COMUNICACION marks it ready-to-send; no external send in v1 (constitutional: no autonomous side effects). |
| comms eval ≥90% / honesty 100% | ◑ | Honesty (quote path) 100%. A dedicated comms-tone eval suite is deferred. |

## Phase 3 — Knowledge & memory (RAG) · ⯀ deferred

Not built this pass. The law stands in code (`quote-run.ts`): **rates/tariffs never
come from memory** — only from `costing_config` / stated inputs, else a blocker.
pgvector ingest + precedent Q&A is a follow-up migration + pipeline.

## Phase 4 — The Watch & briefs · ⯀ deferred

Not built this pass (the owner scoped this session to the flagship). Docking is mapped
in `spec/contributions/mister-torre/INTEGRATION.md`: a new `watch_signals` table + a
reconciler modeled on the existing `runJourneyAdvance` hook; per-role Morning Brief
extends the existing `WEEKLY_BRIEF` draft kind.

## Phase 5 — Intelligence depth & polish · ◑

| Gate | Status | Evidence |
|---|---|---|
| Typed confidence rendering | ✅ | `verified` = normal, `estimado` = gold + dotted underline, `requiere_verificacion` = blocker chip (`TorreQuoteArtifact.tsx`). |
| ±flete / ±TRM sensitivity | ✅ | `quote-run.ts` sensitivity legs; rendered in the hoja card. |
| The Constellation (one signature) | ✅ | `ConstellationField.tsx` — canvas from the canonical `constellation-map.json` (17 dots, 4 metaball bridges), BASE/IDLE/THINKING, reduced-motion→BASE. In the Torre review header (idle at rest, thinking while approving). |
| Reports / acta / sop | ⯀ deferred | Reserved artifact kinds in `tower_48`. |

## Phase 6 — Hardening & adoption · ◑

- Injection posture: the model only PARSES a sentence into a structured spec; it
  never produces money and cannot reach a mutating tool that isn't gated by an
  `ai_drafts` write. Rate/tariff invention is structurally blocked.
- Everything runs on **seed data + `ANTHROPIC_API_KEY`**; connectors mocked. The
  eval suites need **no key** (deterministic core). The model-parse step degrades
  gracefully when the key is absent (the action returns a clear message).
- Telemetry (hours-returned), shadow-mode week: deferred.

---

## Owner-authorized deviations from the uploaded scope

- **Font:** Inter → **Space Grotesk** across the whole Tower (self-hosted OFL
  subsets; `--font-ui/--font-display/--font-mono` repointed, tabular figures on).
  Recorded in `DECISIONS.md`.
- **Constellation** avatar added (built from the canonical map), merged into the
  existing Mister expressive surfaces rather than a parallel visual system.
- **No DDP** (engine models EXW/FOB/CFR/CIF); **Peru-first** tax model (IGV/
  percepción/ISC) — both per the repo's own ratified law.
