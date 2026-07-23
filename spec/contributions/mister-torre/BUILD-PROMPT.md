# BUILD-PROMPT — paste this into Claude Code at the tower repo root

---

Build **Mister Torre** — the internal AI operator of Wings Global Trade's management tower — to the specification in `/spec-torre`. `CLAUDE.md` is your operating law. The shared design system comes from the sibling client package (`/spec` + its implementation); import it, never fork it.

Load before writing code:
1. `spec-torre/README.md` — package map, assumptions, inheritance rule
2. `spec-torre/00-EXECUTIVE-BRIEF.md` — the mission: productivity; the unit of value: the approved artifact
3. `spec-torre/02-INTELLIGENCE-ARCHITECTURE.md` + `03-ARTIFACT-SYSTEM.md` — the core machinery
4. `spec-torre/06-DATA-INTEGRATIONS.md` — schema first

Then execute `spec-torre/07-BUILD-PLAN.md` in order:

- **Phase 0** — scaffold + shared UI import + engine-room deltas + Supabase schema/RLS + seed. Gate: paper-room renders on tokens; RLS tests pass per role.
- **Phase 1** — `compute_landed_cost` (pure, unit-tested) + rate/tariff tables + orchestrator v0 + the quote run producing linked `hoja_costos` + `cotizacion` artifacts through the full lifecycle (draft→review→approve→export). Gate: quoting eval ≥90%, a seeded quote reproduced to the cent, trigger→approvable pair <3 min.
- **Phase 2** — side panel + Cmd+K + router/profiles + comms artifacts + review queue (J/K) + email send-on-approve. Gate: comms ≥90%, honesty 100%, keyboard audit.
- **Phase 3** — RAG (ingest/chunk/embed/hybrid+citations) + Drive sync + learned-on-approval. Gate: precedent Q&A ≥13/15 cited correctly; rates/tariffs provably never from memory.
- **Phase 4** — The Watch + rules + triage + Morning Brief/Friday/month-end + tracking/TRM connectors + kill switches. Gate: watch eval ≥90%, zero false `inmediato` on staging replay, every alert ships its one-tap draft.
- **Phase 5** — analista reports, inline intelligence, acta/sop artifacts, style learning, the three signature moments, a11y/states sweep.
- **Phase 6** — hardening, injection suite, telemetry (hours returned/week), shadow-mode week, release gate.

Rules of engagement:
- After each phase: summary + gate results including failures; fix before proceeding. Maintain `GATES.md`.
- Everything must run on `seed/demo.sql` + `ANTHROPIC_API_KEY` alone; all connectors ship mocked behind their adapters with a `MOCK_CONNECTORS=1` flag.
- Precedence on conflict: CLAUDE.md constitution > 03 artifact law > 02 intelligence > 06 schema > 04 UI deltas > shared design system.
- Never introduce: model arithmetic on money, unapproved side effects, un-cited claims, raw hex/px, scroll-driven motion in the tower, artifact types without schema+renderer+exporter+eval.

Deliverable: a running tower module where an operator can — on seed data — run a quote to an exportable approved pair in under 10 minutes, review comms with `⌘↵`, read a Morning Brief, and watch Mister catch a seeded demurrage risk with the fix already drafted. Plus `GATES.md` with every gate result.

---
