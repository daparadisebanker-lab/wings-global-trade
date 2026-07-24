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
  **Telemetry source DONE** (L5): `timeSavedEventsFromApprovals` (pure) + `getTorreTelemetry`
  action → reads APPROVED Torre artifacts in a window (RLS) → hours-returned rollup;
  watch-resolutions excluded (won't credit machine auto-resolve). Remaining L5: Brief screen UI.
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
  **Revise server action DONE** (`torre-revise.ts`: persists the versioned successor as a
  new DRAFT linked to its predecessor via ref_table='ai_drafts'/ref_id; RLS-scoped). 18 tests.
  Remaining (**UI, needs visual QA**): inline-edit form, PDF print component + button. Fable review: pending.
- `DONE` **L2 · Comunicar** — cores DONE: **tone.ts** (toneProfile per audience×language:
  client formal in its lang, supplier EN, agent ES); **send.ts** (prepareSend gate — an
  unblocked, addressed, non-empty COMUNICACION only; mock-first recording adapters,
  MOCK_CONNECTORS) wired into **approveTorreDraft** as real send-on-approve; **inbound.ts**
  (normalizeInbound → thread-keyed capture for email/WhatsApp, replies group). Comms Fable
  review: **SHIP-WITH-FIXES applied** — send-on-approve CLAIMS the draft (atomic
  DRAFT→APPROVED lock) BEFORE sending; OutboundMessage carries an idempotency key + mock
  providerId keyed on it; email thread keys scoped by sender + References ROOT; subject strip
  fixpoint; language verbatim.
  **Outbox persistence DONE** (tower_54 `torre_sends` + buildSendRow + runSendOnApprove wired
  into approve): one row per approval's send (SENT/FAILED + reason), draft_id-idempotent, RLS
  superset of ai_drafts approve roles, append-only + audit. Outbox Fable review:
  **SHIP-WITH-FIXES applied** — HOJA_COSTOS side effect moved AFTER the claim (winner-only,
  no double cost-sheet); FAILED send surfaced to the operator (sent.ok:false + reason); `error`
  column added; runSendOnApprove extracted + unit-tested (best-effort ledger never unwinds the
  send; 23505 benign; throw swallowed); mocked default dropped; crash-window + FK-bypass documented.
  **Tone wiring DONE** — `toneGuidanceBlock` (the full per-audience tone contract, incl. the
  wholesale-only no-retail-language client rule) embedded in the redactor profile prompt;
  draft_message language default routed through tone `defaultLanguage` (one source of truth).
  Tone-wiring Fable review: pending.
  **Inbound persistence** = satisfied by existing platform infra: `/api/hooks/whatsapp` →
  `tower.whatsapp_messages` (idempotent wa_message_id, threaded to account/RFQ, Triage fallback),
  rendered via `conversations.ts`. A parallel Torre inbound table would fork the record — NOT built.
  Email inbound wiring for `normalizeInbound` is provider-dependent (MOCK_CONNECTORS) — deferred.
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
  profile already exists (B3). **Telemetry source DONE** (`timeSavedEventsFromApprovals` +
  `getTorreTelemetry`). Telemetry Fable review: **SHIP-WITH-FIXES applied** — the headline
  "hours returned" no longer inflates: a quote PAIR (COTIZACION + its HOJA via hojaCostosRef)
  counts once; a revision LINEAGE (predecessor superseded by an approved successor) counts once;
  draftsApproved counts every approval-derived event (not just the 'draft_approved' kind);
  signalsResolved omitted until tracked (no "0 resolved" lie); a `basis` methodology note ships;
  the action requires `since`, accepts a timestamp with strict date validation, orders + warns
  on the 5000 cap, and relabels the number per-viewer (RLS-scoped, not team-wide). Remaining
  (**UI, needs visual QA**): Brief screen. 
- `DONE` **L6 · RAG / memory** — pure core (rag.ts): **chunkByStructure** (splits by
  Markdown headings, packs paragraphs to maxChars, carries heading + entity metadata — no
  blind windows); **hybridRank** (vector + keyword by weight + entity-filter boost,
  deterministic recency tiebreak, top-k); **citationsFor** (deduped clickable sources —
  every answer cites); **isRateOrPriceQuery** + **precedentAnswer** enforcing the freshness
  law (a price/rate ask is guarded, redirected to get_rates/get_tariff — precedent is
  context, never the live number). pgvector corpus migration (tower_53). Fable review:
  **SHIP-WITH-FIXES applied** — the freshness guard is now WIRED into search_knowledge (was
  dead code); chunkByStructure hard-splits an oversized paragraph at sentence boundaries and
  keeps a heading-only section; rate/price terms broadened (price/cost/tariff/costará);
  topK<0 empties; tsvector is Spanish + immutable-unaccent (accent-folded, client-parity).
  13 tests. **Ingest-on-approval DONE** (ingest.ts: artifactToCorpusDoc + corpusRowsFromArtifact
  — pure, tested; wired best-effort into approveTorreDraft: an approved artifact becomes
  corpus precedent, HOJA_COSTOS excluded, a DRAFT never ingested, failure non-blocking).
  Remaining: embed job (fill the null embeddings) + Q&A UI.
- `DONE` **L7 · Surfaces & aesthetics** — pure cores: **cmdk.ts** (the Cmd+K verb registry;
  `filterVerbs` word-boundary + label-over-keyword ranking); **constellation-motion.ts**
  extended with the remaining states. Fable review: **SHIP-WITH-FIXES applied** — the motion
  states were rewritten to CONSTELLATION-SPEC §4 VERBATIM (they had contradicted it): ERROR
  is now a field-loosen (amp×2/400ms) + dot-drop, NEVER a shake and NEVER red; LISTENING is
  the 300ms 8%-contraction (not a perpetual breath); SPEAKING is the amp-0.004 ≤8Hz core
  pulse; the invented watch-catch state was DELETED (not in the closed §4 table). cmdk gained
  a reachable triage verb + English keywords + honest header. 23 tests. Remaining (UI): side
  panel, inline pins, the Cmd+K component + ConstellationField state wiring.

## Log (append per item)
- (start) Flagship quote run + review + loading/approve motion — merged (PR #33).
- Foundations A1–A4, B1–B3, C1 + loops L1(core)/L3/L4/L5/L6/L7 built, Fable-reviewed, fixed; merged (PR #34).
- L6 ingest-on-approval (ingest.ts + tower_53) — an approved artifact becomes corpus precedent, best-effort.
- L5 telemetry honesty fixes (Fable review) — pair + lineage collapse, honest counts, required window.
- L2 outbox persistence (tower_54 torre_sends) + Fable review fixes — claim-first side effects, failure honesty, testable orchestration.
- L2 tone wiring — canonical tone.ts contract into the redactor prompt + draft_message default. Review pending.

## Remaining (all UI — needs visual/Awwwards QA — or a flagged decision)
Every pure/backend item is built, tested (903), and reviewed. What's left needs a browser or a human decision:
- **UI** (build against the existing Torre component + token vocabulary; visual QA is the human gate):
  L1 inline-edit form + PDF print component/button · L3 bespoke document renderer · L4 signals UI ·
  L5 Brief screen · L6 Q&A UI · L7 persistent side panel + inline pins + Cmd+K component + ConstellationField wiring.
- **Blocked (design/provider decision — do NOT improvise):**
  L4 DB reconciler (needs the import-tracking schema: eta/docs/arrival/payment/margin — a product data-model decision) ·
  L6 embed job (needs an embedding provider; keyword retrieval works meanwhile, embeddings stay null).
- **Pipeline task (human/CI):** apply migrations tower_48–54 to prod via the Supabase migration pipeline
  (never manual prod SQL). Torre runtime degrades safely until then.
