# CLAUDE.md — Mister Torre (Wings Management Tower)

You are building **Mister Torre**, the internal AI operator of Wings Global Trade's management tower. The spec in `/spec-torre` is the contract. The sibling package `/spec` (client-facing Mister) provides the shared design system — tokens, Constellation, motion — which you import, never fork.

## Non-negotiables

1. **Artifacts are the product.** Every capability terminates in a schema-validated, versioned, human-approved artifact (`spec-torre/03`). No schema+renderer+exporter+eval → the artifact type does not exist.
2. **The approval constitution:** Mister drafts and flags autonomously; he **never** sends, pays, commits, or deletes without a permissioned human's `approved`. The approve control always names the exact side effect. This is not configurable.
3. **No model arithmetic on money.** All cost math flows through the unit-tested `compute_landed_cost` module. The model chooses inputs; the calculator produces numbers.
4. **Rates and tariffs never come from RAG memory** — only from dated `get_rates`/`get_tariff` tools. RAG provides precedent with citations, always clickable to source.
5. **Typed uncertainty everywhere:** `verified | estimado | requiere_verificación`, rendered per `spec-torre/03`; open blockers make artifacts unapprovable. A confident guess in the honesty eval fails the release.
6. **Permissions are server-side truth** (Supabase RLS + tool layer, `spec-torre/06`); Mister runs in the requesting operator's context and can never see across roles.
7. **Scope boundary + engine-room UI law** (`spec-torre/04`): the Mister design language applies ONLY to Mister-owned surfaces (panel, avatar, artifacts, loading states, presence pins, Brief). The Tower app has its own established identity — never restyle host chrome, tables, or modules. Inside Mister's surfaces: paper-first data, denser type, motion restraint tier 2 — no scroll effects, no hover theater; the Constellation lives in exactly three places. Shared tokens only; zero raw hex/px.
8. **Interruption budget:** ≤1 inline suggestion per module, real-time pings only for `inmediato` severity; everything else batches to the Morning Brief.
9. **Keyboard-complete:** Cmd+K, `M`, `⌘↵` approve, `E` edit, `R` revise, `J/K` queue navigation — tested at every gate.
10. **Audit everything:** every run logs profile, tools, sources, artifact ids, approver; autonomous work is labeled "Mister"; human names go on everything that leaves.
11. **Evals gate releases** (`evals/*.jsonl`, `spec-torre/02`): quoting/comms/watch ≥90%, honesty 100%. Follow phase order in `spec-torre/07`; never batch gates.

## Project facts

- Stack: tower stack (assume Next.js + TypeScript strict + Supabase — Postgres/RLS/Storage/Edge/pgvector; adapter notes in 06 if different). Anthropic API server-side only, streaming; Sonnet-class orchestrated runs, Haiku-class router/watch/extraction.
- Shared UI: import `packages/mister-ui` (or copy from `/spec` implementation) — tokens, ConstellationField, MisterAvatar, motion vocabulary. **The ConstellationField engine must be built from `spec-torre/design-language/constellation-map.json` per `CONSTELLATION-SPEC.md` (measured geometry — never approximate coordinates); primitive rules in `spec-torre/design-language/UI-PRIMITIVES.md` are binding on every Mister-owned surface.**
- Seed: `seed/demo.sql` gives a full demo dataset; the entire system must run on seed data with `ANTHROPIC_API_KEY` as the only external secret (connectors mocked behind their adapters).
- Language: internal UI/docs Spanish; client artifacts in client language; supplier comms EN by default.

## Taste tie-breakers

- Fewer, better artifacts > more chat. Drafts are cheap, sends are sacred.
- Stillness is the tower's luxury; the three signature moments only earn their motion because nothing else moves.
- When the spec is silent, ask: which of the five loops (cotizar, comunicar, vigilar, documentar, reportar) does this serve, and does it return hours? No loop, no build.
