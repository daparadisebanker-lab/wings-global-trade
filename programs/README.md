# Programs — queued build initiatives

Each subfolder is a self-contained spec package for something **not yet built**.
Nothing here governs current work: the live site's law is the root `CLAUDE.md`.
A program becomes active only when Muaaz says to build it — then its
BUILD_PROMPT / spec is the entry point.

| Program | What it is | Status | Entry point |
|---|---|---|---|
| `ecosystem/` | Multi-lane monorepo migration — "same box, different livery"; frozen skeleton + per-lane livery, lanes WGT/01–06 | Staged | `MIGRATION_BUILD_PROMPT.md` (4 waves, runs first) → `CLAUDE.ecosystem.md` (becomes root `CLAUDE.md` at Wave M4) + umbrella strategy doc |
| `tower/` | TOWER — internal CRM+ERP+PIM+analytics at `apps/tower` (`tower.wingsglobaltrade.com`); absorbs the deployed `wings-operations` app | Spec complete | `BUILD_PROMPT.md` (5 waves) |
| `network/` | Wings Network — supplier marketplace (subscription for presence, commission at the logistics rail); `marketplace` schema | Spec complete, phase-gated | `WINGS_MARKETPLACE_STRATEGY.md` (Layer 11 gates) → `BUILD_PROMPT.md` |
| `shared-container/` | Contenedor Compartido — «Trae tu grupo» group container imports; additive Mister lanes | Spec complete | `wings-shared-container-spec.md` · GTM: `marketing/meta-ads-program/06-contenedor-compartido/` |

## Sequencing constraints (decided facts, not suggestions)

1. **The ecosystem migration precedes everything.** `ecosystem/MIGRATION_BUILD_PROMPT.md` converts the repo to the monorepo (apps/site + packages/*, zero user-visible change) and activates the ecosystem root CLAUDE.md at its final wave. TOWER's BUILD_PROMPT requires both; Network's `src/...` paths resolve to `apps/site/src/...` after it.
2. **TOWER absorbs `~/projects/wings-operations`** (decided 2026-07-06): that app is feature-frozen; its data migrates in TOWER Wave 1; decommission gate at Wave 5 with ops sign-off. It stays live as fallback until then.
3. **Network extends this repo directly** (not gated on the monorepo migration) but inherits Wings design tokens and the wholesale-only rules.
4. **Shared-container is additive to live Mister** — no existing flow is replaced; its `FillMeter` component becomes a shared organ reused by ecosystem/TOWER/network.
5. **One database for everything: the wings Supabase project (`pyznlglvwihosemqkhtq`)** — decided 2026-07-06. TOWER = `tower` schema, Network = `marketplace` schema, Áladín = `aladin` schema (until its own project post-agreement). dalab-intelligence is NOT used.
