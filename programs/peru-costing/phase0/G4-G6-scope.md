# Phase-0 Decision Memo — G4 & G6
## TOWER Wave 6 · Peru Costing

> Decision memo for two Phase-0 gates. Grounded in `wings-operations` (commit
> `82b3404`) and TOWER `apps/tower`. Recommendations are proposals — not law until
> Muaaz signs. Companion: SPEC.md §3F, §7, §8, §9 · PARITY_MAP.md · HANDOVER.md §6.

---

## G4 · SUNAT co-pilot — build now or defer?

**Gate.** wings-operations embeds a streaming SUNAT-expert chat in the financial
module. Is porting it a decommission *blocker*, or an assistant affordance that can
follow the engine later?

**Options.**
- **(a) Build now** — port the co-pilot into Wave 6.1–6.3 alongside the engine.
- **(b) Defer** — ship the engine (A), prorrateo (B), export (D), history (G) first;
  revisit the co-pilot after ops is live on the engine.

**Evidence (file:line).**
- The co-pilot is a thin streaming wrapper, not domain logic: `app/api/ai-support/route.ts:41-58`
  streams `claude-haiku-4-5`, injects workspace context, and emits an optional
  `[SUGGESTION]` tool block. 74 lines total. Its knowledge lives in a prompt string
  (`lib/ai-config.ts:3` `SUNAT_SYSTEM`) — the CIF/ISC/prorrateo *rules it narrates*
  are the very rules the real engine already computes in `lib/calculations.ts` /
  `lib/prorrateo.ts`. The chat does not compute costs; the engine does.
- It ships in two embeddings: a **global widget** that explicitly *strips* the
  suggestion and only informs (`components/AsisteChat.tsx:125-127`), and the financial
  panel that *applies* `propose_recalculation` to inputs (`financial/page.tsx:3,8`
  — `Suggestion`, `SENTINEL`). Both are convenience over the calculator, not the
  calculator.
- TOWER already owns the harder half of this: a reviewable-draft AI substrate under
  Directive 7 (`lib/actions/intelligence.ts:11-15`, `api/ai/{triage,score,spec-extract,brief}`).
  What it lacks is a *streaming conversational* surface — a shape, not a capability gap.
- PARITY_MAP row 7 rates ai-support **PARTIAL / different shape**, not MISSING — it is
  the only parity row that is a UX affordance rather than an absent computation.

**Trade-offs.** Building now costs streaming-chat + tool-apply UI work and a second
AI surface to secure (workspace-scoped, no auto-commit) *before* the thing it talks
about (the engine) even exists — you would be shipping the mouth before the brain.
Deferring means ops loses the "ask the AI about this cost sheet" convenience on day
one; but no PO, cost sheet, or customs document depends on it. The engine is what ops
must switch to; the chat is what makes the engine pleasant.

**Recommendation — DEFER (option b).** The co-pilot is an assistant affordance, not a
decommission blocker. Nothing in HANDOVER §6's gate names it (the gate names the
engine, prorrateo, bulk/export, sim, history). It can follow the engine in Wave 6.6
as a conditional, reusing TOWER's Directive-7 substrate and streaming per the
haiku-classify / stream->2s convention. If built later: workspace-scoped, reviewable,
no auto-commit to a stored cost sheet.

**What Muaaz must confirm (one sentence).** Ops can switch off wings-operations
without an in-app costing chatbot on day one, accepting it as a Wave-6.6 fast-follow.

---

## G6 · Minimum wave set for decommission sign-off

**Gate.** HANDOVER §6 requires every wings-operations workflow to run in TOWER and
ops to sign off. What is the *minimum* wave set (SPEC §7) before that is plausible?

**Evidence — the seven real `(protected)` workflows mapped to TOWER status.**

| wings-ops route | What it is | TOWER counterpart | Status | SPEC wave |
|---|---|---|---|---|
| `catalog/` (533 ln) | product/listing CRUD | Catalog Studio | **BUILT** (PARITY+, row 1) | — |
| `financial/` (554 ln) | SUNAT landed-cost engine — *the reason the app exists* | — (flat 5-term sum only) | **MISSING** for Peru | 6.1 + 6.2 (A) |
| `prorrateo/` (319 ln) | multi-item cost allocation | — | **MISSING** (row 4) | 6.1 (B) |
| `history/` (162 ln) | saved cost sheets, re-open/re-export | AuditExplorer ≠ domain record | **MISSING** (row 9) | 6.3 (G) |
| `bulk/` (247 ln) | supplier PDF → many rows → cost → export | one-shot SQL import only | **PARTIAL** (rows 2,6) | 6.4 (C) |
| `container/` (217 ln) | physical stowage sim (fit/weight/Callao 32.5t) | CBM-commit only | **PARTIAL**, G3-gated | 6.6 (E) |
| `dashboard/` (205 ln) | thin: `listings` stats + one sample calc | Signal Deck (event analytics) | **PARTIAL**, non-overlapping | — |
| — | export PDF/XLSX (the client/customs deliverable) | absent | **MISSING** (rows 2,6) | 6.3 (D) |

Note the dashboard is genuinely thin (`dashboard/page.tsx:7-27` — listing counts +
one `calculate(DEFAULT_INPUTS)` sample); it is not a KPI surface ops depends on, so it
does not gate. Catalog is already at parity. The load-bearing gaps are all downstream
of the engine.

**Must-have (real daily workflow, no interim substitute).**
- **A — SUNAT engine** (`financial/`): the app's entire reason to exist; no operator can
  switch without it. Waves **6.1** (port to `fixtures.json` parity) + **6.2** (UI/persist).
- **B — Prorrateo** (`prorrateo/`): named parity requirement, daily multi-item
  allocation, no TOWER analogue. Wave **6.1**.
- **D — Export PDF/XLSX**: the artifact ops physically hands to clients/customs — an
  engine ops cannot get a document out of is not operationally usable. Wave **6.3**.
- **Deploy-readiness subset of §6/6.5**: PostgREST `tower` exposure is BLOCKING
  (HANDOVER §4.1 — reads return empty without it) + storage RLS + env. Not a *parity*
  item but a hard prerequisite to signing off on *any* live switch.

**Nice-to-have (deferrable to interim / fast-follow).**
- **G — History** (Wave 6.3): ops can re-run the engine to reproduce a sheet in the
  interim; append-only `cost_calculations` is the clean home but not blocking if ops
  accepts re-runs short-term. *Recommend keeping in 6.3 since it's cheap once A lands.*
- **C — Bulk import** (Wave 6.4): a real supplier-PDF → many-rows loop, but degradable
  to one-at-a-time costing if bulk volume is low. **Conditional must-have** — ask ops.
- **E — Stowage sim** (Wave 6.6): G3-gated; may be descoped entirely.
- **F — Co-pilot** (Wave 6.6): deferred per G4.

**Trade-offs.** Minimum-viable-decommission = **6.0 → 6.1 → 6.2 → 6.3 + 6.5(deploy
subset) → 6.7** — delivers engine + prorrateo + export + history + a deployable TOWER,
deferring bulk (6.4) and sim/co-pilot (6.6) to post-decommission fast-follows. Risk: if
ops runs high supplier-PDF bulk volume, dropping 6.4 forces manual per-row costing and
they won't sign off — so 6.4's status is the one genuinely open question, and it hinges
on ops' actual bulk cadence, not on engineering.

**Recommendation — MVD scope = A + B + D + G + deploy-prereqs (waves 6.1, 6.2, 6.3, and
the deploy subset of 6.5), then ops sign-off (6.7).** Defer C (6.4) and E/F (6.6) unless
ops confirms bulk is a daily necessity. This closes every *MISSING* parity row plus the
export deliverable and makes HANDOVER §6 actionable.

**What Muaaz must confirm (one sentence).** Whether bulk import (6.4) is a day-one
must-have or a post-decommission fast-follow — i.e. does ops cost supplier PDFs in
batches often enough that one-at-a-time is not an acceptable interim.
