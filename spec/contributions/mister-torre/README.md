# MISTER TORRE — Internal Intelligence for the Wings Management Tower

**Project:** Mister Torre — the internal, operator-grade version of Mister embedded in Wings Global Trade's management tower system.
**Core objective:** productivity. Every feature is justified by hours returned to the team and artifacts it produces without being asked twice.
**Consumer:** Claude Code. Written to be executed autonomously inside (or alongside) the existing tower codebase.

## Relationship to the public Mister package

This package is a **sibling of `mister-product-scope/`** (the client-facing advisor). They share one brand and one design language; they differ in everything else.

| | Mister (client) | Mister Torre (internal) |
|--|-----------------|------------------------|
| User | importing businesses | Wings team: ops, comercial, finanzas, dirección |
| Objective | trust & conversion | throughput & accuracy |
| Intelligence | single advisor, conversational | orchestrated agents with tools, memory, and company knowledge |
| Output | answers + status cards | **artifacts**: quotes, cost sheets, client comms, reports, briefs |
| Autonomy | answers when asked | acts proactively inside guardrails, drafts before being asked |
| Surface | its own product | embedded in every tower module + command bar |

**Inheritance rule:** design tokens, typography, the Constellation signature, and motion physics come from `mister-product-scope/02, 03, 05` — do NOT duplicate them. `04-UI-INTEGRATION.md` here defines only the *internal deltas* (density, paper-room dominance, restraint tier).

## Reading order

| # | File | Governs |
|---|------|---------|
| 00 | `00-EXECUTIVE-BRIEF.md` | Mission, productivity thesis, KPIs, personas |
| 01 | `01-OPERATOR-EXPERIENCE.md` | Where Mister lives in the tower; command surfaces; jobs-to-be-done |
| 02 | `02-INTELLIGENCE-ARCHITECTURE.md` | Agents, tools, RAG, memory, routing, evals, guardrails |
| 03 | `03-ARTIFACT-SYSTEM.md` | The heart: artifact types, lifecycle, rendering, export |
| 04 | `04-UI-INTEGRATION.md` | Internal design deltas + tower shell integration |
| 05 | `05-AUTOMATIONS-PROACTIVITY.md` | Triggers, watches, daily briefs, human-in-the-loop law |
| 06 | `06-DATA-INTEGRATIONS.md` | Entity model, connectors, permissions, audit |
| 07 | `07-BUILD-PLAN.md` | Phases, gates, productivity measurement |
| — | `CLAUDE.md` | Repo operating law for Claude Code |
| — | `BUILD-PROMPT.md` | Kickoff prompt |
| — | `ADAPTATION.md` | Repo-verified reconciliation (read before integrating) |
| DL | `design-language/` | **Binding visual ground truth for Mister's surfaces** (scope boundary in 04 applies — never restyles Tower chrome): `CONSTELLATION-SPEC.md` + `constellation-map.json` (canonical isotipo geometry/colors/states), `UI-PRIMITIVES.md` (buttons, loading, icons, CTAs, hierarchy), `ASSETS-MANIFEST.md`, plus living references `constellation-reference.html` / `mister-ui-primitives.html`. Same files as the client package — one design language, two rooms. |

## Standing assumptions (override if wrong)

1. The tower is (or will be) a web app in the Wings ecosystem repos; docs are written for Next.js/TypeScript + Supabase (Postgres/auth/storage/edge functions) with an adapter note for any other stack.
2. Team size is small (units, not hundreds); design for depth-per-operator, not seat-scale admin.
3. Working language internal: Spanish; artifacts sent to clients follow the client's language; supplier-facing artifacts often English.
4. AI: Anthropic API, server-side, streaming; Sonnet-class for reasoning/artifacts, Haiku-class for classification/watch jobs.
5. The tower already holds (or will hold) the operational truth: imports, clients, suppliers, quotes, documents. Mister Torre reads/writes it through typed tools — never free-form DB access.
