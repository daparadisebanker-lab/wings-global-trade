# 07 — Build Plan, Gates & Productivity Measurement

Order optimizes for **compounding usefulness**: the calculator and artifacts first (immediate hours saved), theater last.

### Phase 0 — Foundations
Repo/module scaffold in the tower stack; shared design system imported from the sibling package (tokens + Constellation + motion libs as a package or copied `packages/mister-ui`); engine-room deltas (04); Supabase schema (06) + RLS + seed data; audit_log online from day one.
**Gate 0:** schema migrated, seed loads, a paper-room table renders with tokens only; RLS verified per role with tests.

### Phase 1 — The calculator & quote run (the flagship)
`compute_landed_cost` as a pure, unit-tested TS module (incoterm scenarios, USD/COP, TRM dated, sensitivity) · rate_tables + tariff_positions CRUD + Ajustes screens · orchestrator v0 (single profile: cotizador) · `hoja_costos` + `cotizacion` artifacts end-to-end (schema → render → review → approve → PDF/XLSX export).
**Gate 1:** 30-case quoting eval ≥90%; calculator 100% unit-tested against hand-verified cases; trigger→approvable pair <3 min; a real Wings quote reproduced to the cent.

### Phase 2 — The panel, command bar & comms
Side panel + Cmd+K (01) · router + profiles (redactor, operaciones) · `comunicacion` + `reporte_estado` + `checklist_docs` artifacts · review queue screen with J/K keyboard flow · email connector (send-on-approve).
**Gate 2:** comms eval ≥90%; honesty eval 100%; keyboard-complete audit; a full client-update flow (ask → draft → approve → sent) in <2 min, logged with attribution.

### Phase 3 — Knowledge & memory
RAG pipeline (ingest, chunk, embed, hybrid retrieval, citations) · Drive sync connector · corpus backfill (past quotes, SOPs, resolutions) · learned-on-approval loop · precedent answers in Cmd+K.
**Gate 3:** 15 precedent questions answered with correct citations ≥13/15; rates/tariffs provably never answered from memory (trap tests); citation click-through lands on the exact source.

### Phase 4 — The Watch & briefs
Watch engine + v1 rules (05) · triage + severity delivery · Morning Brief (per-role) + Friday report + month-end report · WhatsApp/email digests · tracking + TRM connectors · kill switches.
**Gate 4:** watch eval ≥90% with zero false `inmediato` in a week of staging replay; every alert ships its one-tap draft; Brief reads in ≤90s (word-count budget enforced); interruption budget honored in telemetry.

### Phase 5 — Intelligence depth & polish
analista profile + margin/pipeline reports · inline intelligence (cells, ghost fields, record header row) · `acta` + `sop` artifacts · per-operator style learning · signature moments (approve sweep, watch dock, brief masthead) · full a11y + states sweep.
**Gate 5:** margin report explains a seeded anomaly correctly; inline suggestions ≤1 per module verified; the three signature moments land in a recorded review — and nothing else in the tower moves.

### Phase 6 — Hardening & adoption
Load/latency pass (p50 first-token <800ms panel; brief generation <20s) · security review (RLS, injection suite, PII whitelist audit) · telemetry dashboard for the North Star (hours returned/week, acceptance rate, catches/week) · team onboarding inside the product (Mister teaches Mister) · one week of shadow-mode on real data before sends go live.
**Gate 6 (release):** all eval suites re-pass on prod build · shadow week reviewed: ≥60% artifacts approvable without edits, zero guardrail breaches · the team test: after one week, turn Mister off for an hour — if nobody protests, we built the wrong thing. They will.

## Productivity measurement (built-in, not a promise)
- Every artifact logs `time_saved_estimate` (type-based baseline minus actual review time) — conservative constants, reported weekly.
- Weekly auto-report to dirección: hours returned, artifacts by type, acceptance %, catches ranked by avoided cost, top corrections (learning input).
- Baselines captured in week 0 (time-to-quote, updates/day, misses/month) so the before/after is honest.

## Risks
- **Garbage tariff/rate tables → confident garbage quotes.** Mitigation: verified_by fields, validity dates, Gate 1 traps, blockers UX.
- **Over-alerting kills trust in week one.** Mitigation: shadow mode, interruption budget telemetry, brief-first delivery defaults.
- **Scope creep toward BI/chat-toy.** Mitigation: every PR names its loop (00) — no loop, no merge.
- **Tower stack unknown.** Mitigation: schema + tools + artifacts are portable; UI deltas are token-based; only the shell adapter changes.
