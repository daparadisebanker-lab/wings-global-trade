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
  {profile, urgency}, never strands a run. Fable review: **SHIP-WITH-FIXES applied** —
  phantom create_artifact in prompts fixed; word-boundary stem matching (kills playa→ya,
  descarta→carta, prestado→estado, correspondiente→respond) + costará coverage; urgency
  trimmed to unambiguous signals; redactor must name missing figures; analista comms
  internal-only (+ test); parseRouterResponse balanced-brace (survives braces in reason).
- `DONE` **C1 · streaming** — the full agentic run, streamed. `runToolLoop` gained an
  `onStep` observer; `runTorreAgent` (run.ts) composes route→profile→scoped-belt→loop and
  emits typed events (route·step·final). Shared **quote-core.ts** extracted from the
  flagship action so propose_quote and runTorreQuote drive ONE money pipeline. Real RLS
  **provider.ts**; SSE route **POST /api/ai/torre**. Fable review: **SHIP-WITH-FIXES
  applied** (B2 BLOCK fixes re-CONFIRMED) — hsCodeHint now pins ONLY among keyword
  candidates (`resolveQuoteTariff`, tested) so it can't dodge the ambiguity blocker;
  freight/margin overrides REMOVED from propose_quote (agent can't fabricate a
  freight/margin number — server sources both), killing the provenance mislabel; provider
  now calls its tested helpers; abort threaded into the SDK call; client-pinned `today`
  gated to non-prod; get_import brand-scoped + ref round-trips; SSE heartbeat + bounded
  maxSteps; draft_message throws on invalid (honest isError).

### Loops
- `WIP` **L1 · Cotizar polish** — pure cores DONE: **revise.ts** (diffTorreArtifact —
  money-aware semantic diff old→new; reviseTorreArtifact — versioned successor + schema
  re-validate; the engine behind comment-to-revise AND inline edit) + **print.ts**
  (cotizacionPrintModel — branded, structured, token-safe, honesty preserved → the PDF).
  18 tests. Remaining wiring: inline-edit form, revise server action (persist successor
  DRAFT), PDF print component + button. Fable review: pending.
- `WIP` **L2 · Comunicar** — cores DONE: **tone.ts** (toneProfile per audience×language:
  client formal in its lang, supplier EN, agent ES); **send.ts** (prepareSend gate — an
  unblocked, addressed, non-empty COMUNICACION only; mock-first recording adapters,
  MOCK_CONNECTORS) wired into **approveTorreDraft** as real send-on-approve (records, never
  performs; a non-sendable message can't be approved); **inbound.ts** (normalizeInbound →
  thread-keyed capture for email/WhatsApp, replies group). 20 tests. Remaining: persist
  outbox/inbound to tables + redactor tone wired into the draft_message prompt. Fable review:
  **SHIP-WITH-FIXES applied** — send-on-approve now CLAIMS the draft (atomic DRAFT→APPROVED
  lock) BEFORE sending, so a concurrent approve/reject can't double-send or send a rejected
  message; OutboundMessage carries an idempotency key (draft id) + mock providerId keyed on
  it; email thread keys scoped by sender + use the References ROOT (no cross-client collision
  / injection); subject strip is fixpoint; language passed verbatim (no third-language mislabel).
- `DONE` **L3 · Documentar** — four operational document artifact types added to the
  ai_drafts union: **reporte_estado · checklist_docs · acta · sop**. Each has its zod
  schema (artifacts.ts, wired through parseTorreArtifact/drafts/review-logic exhaustive
  switches), a pure Markdown **exporter** (documents.ts) + shared branded **documentFrame**
  (§5 endorsement slot, approvable flag), a **renderer** (queue Markdown preview in the
  World-B panel), diff support (revise.ts factsFor), and **eval-tests** (schema validity +
  honesty: a missing required doc is marked and warned, a blocked document is unapprovable).
  Kinds were pre-reserved in migration tower_48 — no new migration. 16 tests. Review: pending.
- `DONE` **L4 · Vigilar (Watch)** — pure engine (watch.ts): the **8 v1 rules** (eta-slip,
  doc-deadline, demurrage, rate-expiry, payment-milestone, quote-quiet, margin-drift,
  stale-import) each detecting from an import snapshot with severity + a one-tap suggested
  draft; **triageSignals** (rank + dedup); **partitionByDelivery** (interruption budget —
  only `inmediato` interrupts, ≤1/import, rest → Brief); **reconcileWatch** (idempotent
  new-vs-resolved diff — a standing exception never re-pings); **activeRules** kill switches;
  a seeded demurrage catch. `watch_signals` migration (tower_52, partial-unique OPEN key +
  RLS + audit). 13 tests. Remaining: DB reconciler job + signals UI. Review: pending.
- `DONE` **L5 · Reportar** — pure core (brief.ts): **buildMorningBrief** assembles the
  Brief from watch signals + the pending-draft queue, SCOPED to the operator's role
  (ops vs commercial vs VIEWER-sees-all), split into urgent (inmediato) / attention
  (batched, ranked) / approvable-drafts, with a `quiet` flag (the tower's stillness) and
  per-cadence mastheads (morning · friday · month-end). **productivitySummary** +
  MINUTES_SAVED baseline → hours returned + counts (weekly/monthly rollup). analista
  profile already exists (B3). 11 tests. Remaining: Brief screen UI + telemetry source
  events. Review: pending.
- `TODO` **L6 · RAG / memory** — pgvector migration + ingest-on-approval + hybrid
  retrieval + precedent Q&A with citations + learned-on-approval.
- `TODO` **L7 · Surfaces & aesthetics** — persistent 420px side panel · inline
  intelligence pins (cell underline, `Mister ▸` row, ghost fields) · Cmd+K verbs ·
  remaining Constellation states (LISTENING/SPEAKING/ERROR) + the watch-catch pulse +
  Brief masthead moments.

## Log (append per item)
- (start) Flagship quote run + review + loading/approve motion — merged (PR #33).
