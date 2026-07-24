# Mister Torre — build report

Mister Torre is the internal AI operator of the Wings Global Trade management tower: a
productivity-artifact layer extending the existing internal Mister (`MisterCockpit` +
`lib/copilot`), not a new bot. This report documents what was built in the self-driving
build loop, how the governance holds, and what remains.

The build ran **foundations → loops**, continuously, each item gated by
`typecheck (cache-free) + vitest + next build` and reviewed by an independent **Fable**
reviewer whose confirmed findings were applied before advancing. Test count grew from a
**476** baseline to **905**. Every pure/backend item is now built, tested, and
Fable-reviewed; what remains is UI (needs visual QA) and two decision/provider-gated jobs.

---

## The constitution (enforced, not just documented)

Every layer holds these laws — the Fable reviews repeatedly probed them and the fixes
closed the gaps that were found:

1. **No model arithmetic on money.** All cost math flows through the deterministic
   SUNAT engine (`computeImportCost`) via `compute_landed_cost`; to *persist* a quote the
   agent calls `propose_quote`, which prices SERVER-side through the shared `quote-core`.
   The model supplies product facts, never numbers. It cannot even pass a freight/margin
   override on the agentic path (removed after review — it would have dodged the blockers).
2. **Rates and tariffs never from memory.** `get_rates` / `get_tariff` / `get_costing_config`
   are the only sources, each carrying validity; `get_tariff` emits the exact duty fraction
   and flags unverified/stale positions; RAG's `precedentAnswer` refuses a price/rate query
   and redirects to the dated tools.
3. **Nothing auto-commits.** Every artifact lands in `ai_drafts` as `DRAFT`; approval is a
   separate human action that names the exact side effect. Send-on-approve *claims* the
   draft (atomic `DRAFT→APPROVED` lock) before sending, so a race can't double-send or send
   a rejected message.
4. **Typed uncertainty + blockers.** `verified | estimado | requiere_verificacion`; a
   payload with any open blocker is unapprovable (`isApprovable`), including the *derived*
   blocker of a checklist with a missing required doc, and a hand-edited price is
   downgraded `verified → estimado` with an operator source.
5. **RLS is the permission system.** Every read/write runs in the operator's context; the
   real provider and every migration mirror the tower RLS conventions.
6. **Mock-first connectors.** Email/WhatsApp send and the embed job are behind adapters
   (`MOCK_CONNECTORS`) that record instead of performing.
7. **World-B token discipline.** Zero raw hex/px outside the ratified `mister-theme`
   exemption; wholesale-only language throughout.

---

## What was built

### Foundations

- **A1 · rate_tables** — dated freight/insurance rates + pure `resolveFreightRate` (hard
  filters, USD-only, future-dated excluded, deterministic tiebreak), wired into the quote run.
- **A2 · tariff_positions** — HS candidate resolution (accent-insensitive keyword match);
  1→duty, ≥2→ambiguous blocker carrying candidates, 0→brand default; unverified/stale flags.
- **A3 · org_rules** — margin defaults + per-archetype rules + incoterm + validity +
  approval matrix; pure `resolveMarginFraction` / `rolesForKind` / `canRolesApprove`.
- **A4 · Ajustes-lite** — `getTorrePolicy` + `addFreightRate` + the "Reglas y tarifas" panel
  (error/stale states, a11y).
- **B1 · agentic loop** — pure `runToolLoop`: dispatch, recoverable error capture, runaway
  guard, `access` read/draft flag, `stopHint` for honest truncation, abort, `onStep` stream.
- **B2 · tool belt** — model-callable tools (get_import · get_client · get_supplier ·
  get_rates · get_tariff · get_costing_config · search_knowledge · compute_landed_cost ·
  propose_quote · draft_message) behind an injected provider seam, + the Anthropic tool_use
  adapter. RAG framed as data-not-instructions; strict schemas.
- **B3 · profiles + router** — cotizador/operaciones/redactor/analista prompt profiles on
  the same loop, each SCOPING the belt (redactor cannot fabricate a number); model-first
  Haiku router with a deterministic word-boundary-stem heuristic fallback that never strands.
- **C1 · streaming** — `runTorreAgent` composes route→profile→scoped-belt→loop, streamed as
  SSE (`POST /api/ai/torre`); the shared `quote-core` unifies the flagship action and the
  agentic path; the real RLS `provider`.

### Loops (the five: cotizar · comunicar · vigilar · documentar · reportar)

- **L1 · Cotizar** — money-aware semantic diff (`diffTorreArtifact`), versioned revision
  (`reviseTorreArtifact`, honesty downgrade of edited prices), branded PDF print model,
  revise server action (versioned successor DRAFT + diff).
- **L2 · Comunicar** — redactor tone/audience model (now WIRED as the canonical prompt
  contract via `toneGuidanceBlock` + `defaultLanguage` — one source of truth), the send gate
  (`prepareSend`) + mock-first adapters wired into approve as claim-before-send, the send
  **outbox** (`torre_sends`, one row per approval's send SENT/FAILED+reason, draft_id-idempotent,
  RLS superset of the approve roles) via `runSendOnApprove`. Inbound thread capture
  (`normalizeInbound`, sender-scoped keys, References root); inbound PERSISTENCE is already
  served by the platform's `/api/hooks/whatsapp` → `whatsapp_messages` (a parallel Torre table
  would fork the record) — email-inbound wiring is provider-dependent (deferred).
- **L3 · Documentar** — four document artifact types (reporte_estado · checklist_docs ·
  acta · sop), each with schema + Markdown exporter (escaped, blockers shown) + queue
  renderer + eval-tests; a missing required doc is a derived blocker.
- **L4 · Vigilar (Watch)** — 8 detection rules (null-safe dates, demurrage pre-warning),
  triage + interruption budget (only `inmediato` interrupts), idempotent reconciler with
  severity-escalation + MUTED survival, kill switches, `watch_signals` migration.
- **L5 · Reportar** — the Morning Brief (per-role scoping, urgent/attention/drafts bands,
  quiet flag, cadence mastheads) + productivity telemetry (never fabricated). The telemetry
  SOURCE (`timeSavedEventsFromApprovals` + `getTorreTelemetry`) reads APPROVED artifacts in a
  window and, after review, counts HONESTLY: a quote pair (COTIZACION + its HOJA) counts once,
  a revision lineage counts once, `draftsApproved` counts every approval, `signalsResolved` is
  omitted until tracked, and a `basis` note carries the methodology.
- **L6 · RAG/memory** — structure-aware chunking, hybrid retrieval ranking, cited answers,
  the freshness guard; the pgvector `knowledge_chunks` corpus (approved-only). Ingest-on-approval
  is wired (`ingest.ts`: an approved artifact becomes corpus precedent, best-effort, HOJA excluded,
  a DRAFT never ingested); embeddings stay null until a real provider (keyword retrieval works meanwhile).
- **L7 · Surfaces** — the Cmd+K verb registry (loops → run/panel/route) and the remaining
  Constellation states (LISTENING/SPEAKING/ERROR/watch-catch), reduced-motion-aware.

---

## Migrations (pending pipeline apply — NEVER manual prod SQL)

`tower_48` (ai_drafts kinds, incl. the L3 document kinds, pre-reserved) · `tower_49`
(rate_tables) · `tower_50` (tariff_positions) · `tower_51` (org_rules) · `tower_52`
(watch_signals, partial-unique active key) · `tower_53` (knowledge_chunks, pgvector) ·
`tower_54` (torre_sends, the send outbox). These are committed as migration files; applying
them is a pipeline concern. Until applied, the Torre runtime degrades safely (the code reads
`{ error }` and does not crash), but persistence-backed features won't function in prod.

---

## The review loop

Every item was reviewed by an independent Fable agent against the spec. Reviews ranged from
SHIP to a genuine **BLOCK** (B2's first pass — the tool belt could not obey its own laws;
the writer surface was redesigned, `get_costing_config` added, and the block was resolved
and re-confirmed). Confirmed findings were applied and re-verified green before advancing —
notably the `hsCodeHint` pin bypass, the agent-override provenance mislabel, the diff
blocker-laundering holes, the send-ordering race, and the NaN-date false-`inmediato`. The
later backend items were reviewed the same way: the **L5 telemetry** review (pair +
revision-lineage double-counts → collapsed; honest counts; required window), the **L2 outbox**
review (HOJA_COSTOS side effect moved after the claim; FAILED sends surfaced; a testable
`runSendOnApprove`; an `error` column), and the **L2 tone wiring** review (the "single source
of truth" was only real on a throwaway object — pointed the actual persistence path at tone.ts).

---

## What remains (all human-gated: visual QA or a decision/provider)

Every pure/backend item is built, tested (905), and Fable-reviewed. What's left cannot be
completed *to the project's Definition of Done* headlessly — it needs a browser (the Awwwards
visual QA gate: "one deliberate moment of tension per key view") or a decision that is the
owner's to make:

- **UI (build against the existing Torre component + token vocabulary; visual QA is the human gate):**
  the persistent side panel + inline pins + surfacing the Torre verb registry in the *existing*
  ⌘K `CommandPalette` (⌘K is already taken — this is an integration + UX decision, not a new palette)
  + ConstellationField state wiring (L7); the Brief screen (L5); the Q&A view (L6); a bespoke
  document renderer beyond the Markdown preview (L3); the inline-edit form + PDF component (L1);
  the signals view (L4).
- **Blocked on a decision / provider (do NOT improvise):**
  - **L4 DB watch reconciler** — needs the import-tracking schema (how eta/docs/arrival/payment/
    margin are represented over time). The 8 watch RULES are pure-tested; the reconciler that
    feeds them from real import data needs that data model, a product decision.
  - **L6 embed job** — needs a real embedding provider. A mock embedding is NOT a faithful
    placeholder (it would write garbage vectors that corrupt the similarity leg), so unlike the
    send mock this cannot be built mock-first; embeddings stay null and keyword retrieval carries L6.
- **Pipeline task (human/CI):** apply migrations `tower_48`–`tower_54` via the Supabase
  migration pipeline (never manual prod SQL).
- **Source of truth:** `apps/tower/MISTER_TORRE_BACKLOG.md` tracks per-item status and the
  applied review findings.
