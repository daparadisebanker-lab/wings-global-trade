# MISTER TORRE — build backlog (the pending stream)

The self-driving build loop finishing Mister Torre. Order: **foundations → loops**,
run continuously. Source of truth for "what's next" — survives context resets.

## The per-item loop protocol
1. **Build** the next `TODO` item: code + tests. Gate = cache-free typecheck
   (`pnpm typecheck`) + `pnpm test` + `pnpm build` all green. Commit.
2. **Review**: spawn an independent **Fable** reviewer against the spec
   (`spec/contributions/mister-torre/`) — correctness, security, token discipline, a11y.
3. **Fix**: apply confirmed findings + enhancements; re-verify green; commit.
4. **Advance**: mark the item `DONE`, take the next `TODO`. Push.

Laws that never bend (root `CLAUDE.md` + spec): no model arithmetic on money;
nothing auto-commits (artifacts land as `ai_drafts` DRAFT); rates/tariffs never from
memory; typed uncertainty + blockers; RLS is the permission system; zero raw hex/px
off the World-B exemption; connectors mock-first behind adapters (`MOCK_CONNECTORS`).

## Status legend: `TODO` · `WIP` · `DONE`

### Foundations
- `DONE` **A1 · rate_tables** — freight/insurance rate tables + pure `resolveFreightRate`
  + wired into the quote run. Fable review: **6 findings applied** (criteria are now
  hard filters not preferences; USD-only; future-dated excluded; append-only migration;
  idempotent seed; deterministic tiebreak).
- `DONE` **A2 · tariff_positions** — HS candidate resolution (keyword-matched, accent-
  insensitive) + wired: 1 → duty, ≥2 → tariff-ambiguous blocker carrying the candidates
  (rendered on the blocker panel), 0 → brand default. Fable review: pending.
- `DONE` **A3 · org_rules** — margin_default + per-archetype margin_rules + incoterm +
  validity_days + approval_matrix (+ seed); pure resolveMargin/rolesForKind/canRolesApprove
  (tested); quote run now reads margin + validity from policy (hardcoded 0.18/15 gone).
  Approval-matrix *enforcement* wired at Ajustes time (helper ready). Fable review: pending.
- `DONE` **A4 · Ajustes-lite** — getTorrePolicy + addFreightRate + a "Reglas y tarifas"
  panel. Fable review: **7 findings applied** (validTo validation + refine; read errors
  surfaced not swallowed; insert error.code diagnosis; error/stale UI states; a
  policy-scoped lane list for all read roles; a11y labels + status banner).
  **→ Foundation A COMPLETE (A1–A4, all Fable-reviewed & fixed).**
- `DONE` **B1 · agentic loop** — pure `runToolLoop(nextTurn, tools, maxSteps)`: dispatch,
  error capture (unknown tool / throw → recoverable result), runaway max-step guard.
  Fable review: **SHIP-WITH-FIXES applied** (2 major + 7 minor) — `AgentTool.access`
  read/draft flag; `ModelTurn.stopHint` + `StopReason 'aborted'` for honest truncation;
  `AbortSignal`; maxSteps<1 + duplicate-name guards; terminal turn in transcript;
  String() armor; readonly steps. 17 tests.
- `DONE` **B2 · tool belt** — model-callable tools behind an injected `TorreToolProvider`
  seam (pure, fake-provider-tested — no DB/key), + the Anthropic tool_use adapter
  (`anthropic-runner.ts`). Fable review: **BLOCK resolved** (6 major + minors applied):
  · added **get_costing_config** so every compute input (IGV/percepción/seguro fractions,
    TC, brand-default Ad Valorem) is tool-sourced — memory-sourcing is now impossible;
  · replaced the generic create_artifact with **propose_quote** (server prices the whole
    linked pair via the tested buildQuoteRun — the model never does arithmetic, never
    converts to minor units, and cannot fabricate a cost sheet) + **draft_message**
    (COMUNICACION only, no money);
  · get_tariff emits the **exact duty fraction** (`usa 0.065`), flags **unverified** and
    **stale-verified** (verifiedAt+365) positions; get_rates flags a **lapsed recommended**
    rate and a **not-yet-effective** row distinctly;
  · search_knowledge sandwiches hits as untrusted data; party tools require a criterion;
    strict schemas everywhere; abnormal-stop set gained `model_context_window_exceeded`.
  Tools: get_import · get_client · get_supplier · get_rates · get_tariff ·
  get_costing_config · search_knowledge · compute_landed_cost · propose_quote ·
  draft_message. 45 tests.
- `DONE` **B3 · profiles + router** — four specialism profiles on the same loop
  (`profiles.ts`): each layers a specialism prompt on TORRE_TOOL_SYSTEM and SCOPES the
  belt (redactor denied compute/rates/tariff/propose_quote → cannot fabricate a number;
  operaciones can't quote). `selectProfileTools`/`profileSystem`/`getProfile`. Router
  (`router.ts`): model-first Haiku classifier + PURE keyword-stem heuristic fallback
  (`classifyIntent`/`parseRouterResponse`/`routeIntent`) → always returns a valid
  {profile, urgency}, never strands a run. 28 tests. Fable review: pending.
- `DONE` **C1 · streaming** — the full agentic run, streamed. `runToolLoop` gained an
  `onStep` observer; `runTorreAgent` (run.ts) composes route→profile→scoped-belt→loop and
  emits typed events (route·step·final). Shared **quote-core.ts** extracted from the
  flagship action so propose_quote and runTorreQuote drive ONE money pipeline (+ hsCodeHint
  to pin an agent-chosen HS position). Real RLS **provider.ts** (orders→milestones,
  accounts/suppliers, rates/tariff/costing, propose_quote→core, draft_message→ai_drafts;
  search_knowledge interim until L6). SSE route **POST /api/ai/torre** mirrors
  api/ai/spec-extract. 16 new tests (loop stream, orchestrator, provider mapping). Fable
  review: pending.

### Loops
- `TODO` **L1 · Cotizar polish** — PDF export (branded), inline edit, comment-to-revise
  (versioned), semantic diffs (old→new).
- `TODO` **L2 · Comunicar** — redactor tone/audience (client/supplier/agent, per-lang),
  email + WhatsApp send-on-approve (mocked adapters + queue), inbound thread capture.
- `TODO` **L3 · Documentar** — artifact types reporte_estado · checklist_docs · acta ·
  sop (schema+renderer+exporter+eval each) + the branded document frame.
- `TODO` **L4 · Vigilar (Watch)** — `watch_signals` migration + reconciler + v1 rules
  (ETA slip, doc deadline, demurrage, rate expiry, payment milestone, quote-quiet,
  margin drift, stale import) + triage/severity + interruption budget + one-tap draft +
  kill switches + a seeded demurrage catch.
- `TODO` **L5 · Reportar** — Morning Brief (per-role screen + masthead) + Friday +
  month-end + analista profile + productivity telemetry (time-saved, hours returned).
- `TODO` **L6 · RAG / memory** — pgvector migration + ingest-on-approval + hybrid
  retrieval + precedent Q&A with citations + learned-on-approval.
- `TODO` **L7 · Surfaces & aesthetics** — persistent 420px side panel · inline
  intelligence pins (cell underline, `Mister ▸` row, ghost fields) · Cmd+K verbs ·
  remaining Constellation states (LISTENING/SPEAKING/ERROR) + the watch-catch pulse +
  Brief masthead moments.

## Log (append per item)
- (start) Flagship quote run + review + loading/approve motion — merged (PR #33).
