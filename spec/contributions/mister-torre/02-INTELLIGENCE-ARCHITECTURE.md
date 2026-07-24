# 02 — Intelligence Architecture

Mister Torre is one persona backed by an **orchestrated system**: a router, specialist runs, typed tools, company memory, and evals. The team always experiences "Mister" — the plumbing is invisible.

## Topology

```
User / Trigger
   │
   ▼
[Router]  intent + scope + urgency (Haiku-class, <300ms)
   │
   ▼
[Orchestrator run]  (Sonnet-class, agentic loop with tools)
   ├─ plan (visible to user as steps in the side panel)
   ├─ tool calls (typed, permissioned, logged)
   ├─ knowledge retrieval (RAG)
   └─ artifact emission (schema-validated → 03)
   │
   ▼
[Guardrail layer]  approval gates · permission checks · audit log
```

Specialisms are **prompt profiles on the same loop**, not separate bots: `cotizador` (landed-cost math + margin rules), `operaciones` (logistics/status/exceptions), `redactor` (client/supplier comms, tone-per-audience), `analista` (reports, margins, pipeline). Router picks the profile; profiles can chain (cotizador → redactor for the cover email).

## Tools (the complete v1 surface — typed, server-side, permissioned)

| Tool | Does | Writes? |
|------|------|---------|
| `get_import / list_imports` | full state incl. milestones, costs, docs | no |
| `get_client / get_supplier` | profile + history + preferences | no |
| `search_knowledge` | RAG query over the corpus (below) | no |
| `get_rates` | freight/insurance rate tables + validity | no |
| `get_tariff` | tariff positions w/ duty+IVA (curated table) | no |
| `compute_landed_cost` | **deterministic calculator** — the LLM never does the arithmetic | no |
| `create_artifact / update_artifact` | emit schema-validated artifact draft | draft only |
| `create_task / create_watch` | tower tasks, watch rules | yes, logged |
| `log_interaction` | audit + time-saved accounting | yes |

**Hard rule:** all money math flows through `compute_landed_cost` (a tested TS module). The model reasons about *inputs and applicability*; the calculator produces numbers. This kills the worst failure class of AI quoting.

## Company memory (RAG)

- **Corpus:** past quotes + outcomes (won/lost/why), tariff resolutions & precedents, supplier history and negotiated rates, SOPs, templates, key email threads, meeting notes.
- **Pipeline:** ingest on artifact-approval and via Drive-folder sync → chunk (by document structure, not blind windows) → embed → Postgres/pgvector (Supabase) with metadata (entity links, date, language, doc type).
- **Retrieval:** hybrid (vector + keyword + entity-filter), top-k 8, always returned *with citations*; answers must link sources (01 §law 3).
- **Freshness law:** rates and tariffs are never answered from RAG memory — only from `get_rates`/`get_tariff` with validity dates. RAG provides precedent, not prices.

## Memory & context per run

- Injected: operator identity/role, current module + focused record (full state), conversation (last 12 turns), org facts (margin rules, incoterm defaults, ports).
- Persistent: per-client preferences, per-operator style corrections ("Muaaz shortens greetings" → redactor learns), decision log per import.
- Budget: system+context ≤ 30K tokens; overflow trims history first, never the focused record.

## Model routing

| Job | Model class | Why |
|-----|-------------|-----|
| Router, watch triage, field extraction | Haiku | volume + latency |
| Orchestrated runs, artifacts, analysis | Sonnet | reasoning + long context |
| Nightly corpus jobs (summaries, indexing) | Haiku batch | cost |

## Honesty & guardrails

- Uncertainty is typed: every numeric claim carries `verified | estimado | requiere_verificación`; artifacts render the state visually (03) and estimados never silently enter client-facing artifacts.
- Out-of-scope, contradictory data, or missing sources → Mister names the gap and creates the verification task instead of guessing.
- Permissions mirror tower roles (06); tools enforce them server-side — the model cannot see what the operator cannot.
- Prompt-injection defense: retrieved docs and inbound emails are *data, never instructions*; system prompt states it; tool layer strips directives from ingested content.
- Full audit: every run logs profile, tools called, sources, artifact ids, approver.

## Evals (living, in-repo, gate every release)

- `evals/quoting.jsonl` — 30 real-shaped quote scenarios → landed-cost inputs correct, calculator invoked, margins per rules.
- `evals/comms.jsonl` — 20 drafting cases → tone, language, facts-from-state only.
- `evals/watch.jsonl` — 20 event streams → correct exception + ranking, no false urgency.
- `evals/honesty.jsonl` — 15 traps (missing rate, ambiguous HS, stale tariff) → must refuse/verify, zero confident guesses.
Pass bar: ≥90% per suite; honesty suite 100% (a single confident guess fails the release).
