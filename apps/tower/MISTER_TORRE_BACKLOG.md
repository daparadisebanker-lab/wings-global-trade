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
- `TODO` **A3 · org_rules** — margin_rules + incoterm_defaults + ports_default +
  approval_matrix; wire margin default + validity + per-artifact approver roles.
- `TODO` **A4 · Ajustes-lite** — view/edit rate tables + margin rules (host-Tower UI).
- `TODO` **B1 · agentic loop** — `IntelligenceClient.runAgent` (tool-use loop, message
  history, stop_reason) behind the seam; fake-client tested.
- `TODO` **B2 · tool belt** — typed model-callable tools (get_import/get_client/
  get_rates/get_tariff/search_knowledge) + dispatcher; mutating tools → ai_drafts.
- `TODO` **B3 · profiles + router** — cotizador/operaciones/redactor/analista prompt
  profiles on the loop + intent router.
- `TODO` **C1 · streaming** — SSE route for Torre runs (mirror api/ai/spec-extract).

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
