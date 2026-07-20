# Programs — queued build initiatives

Each subfolder is a self-contained spec package for something **not yet built**.
Nothing here governs current work: the live site's law is the root `CLAUDE.md`.
A program becomes active only when Muaaz says to build it — then its
BUILD_PROMPT / spec is the entry point.

| Program | What it is | Status | Entry point |
|---|---|---|---|
| `ecosystem/` | Multi-lane monorepo migration — "same box, different livery"; frozen skeleton + per-lane livery, lanes WGT/01–06 | **Migration COMPLETE** (M0–M4, 2026-07) — `CLAUDE.ecosystem.md` is now the root `CLAUDE.md`; `apps/site` + `packages/*` live. Lane onboarding (§4 Phases 0–6) is the remaining, separately-ordered work. | `MIGRATION_DECISIONS.md` (D-01…D-11) · `CLAUDE.ecosystem.md` (source of the root law) |
| `tower/` | TOWER — internal CRM+ERP+PIM+analytics at `apps/tower` (`tower.wingsglobaltrade.com`); absorbs the deployed `wings-operations` app | **UNBLOCKED** — monorepo root + ecosystem law + `packages/ui` all exist; `BUILD_PROMPT.md` runs as written | `BUILD_PROMPT.md` (5 waves) |
| `network/` | Wings Network — supplier marketplace (subscription for presence, commission at the logistics rail); `marketplace` schema | Spec complete, phase-gated | `WINGS_MARKETPLACE_STRATEGY.md` (Layer 11 gates) → `BUILD_PROMPT.md` |
| `shared-container/` | Contenedor Compartido — «Trae tu grupo» group container imports; additive Mister lanes | Spec complete | `wings-shared-container-spec.md` · GTM: pending — meta-ads program deleted 2026-07-08, replacement not yet written |
| `represented-brands/` | Partner brands sold container-only (full or shared, never units) — hosted brand shelves at `/marcas`, TOWER brand/designation/allocation workflows, Mister brand data loop | Spec complete — Phase-0 decisions (archetype `ALLOCATION`, brand #1) pending Muaaz | `SPEC.md` (§7 gates) |
| `quotation-intelligence/` | Live import‑tracking layer — a private per‑order tracker (CIF document + phase‑by‑phase shipment tracker + quote‑validity countdown + installment ledger), all written in TOWER, read by a tokenized client surface on `apps/site` | **PROPOSAL** — Phase‑0 (G1–G6) pending Muaaz; extends built TOWER + adds one `apps/site` surface; touches the no‑absolute‑price site law (ratification gate) | `SPEC.md` (§7 gates) |
| `peru-costing/` | TOWER Wave 6 — port `wings-operations`' Peru SUNAT import‑cost engine (landed cost + prorrateo + bulk import + PDF/XLSX export + stowage sim + history) into TOWER, plus the remaining TOWER completion items; closes the wings‑operations **decommission gate** | **PROPOSAL** — Phase‑0 (G1–G6) pending Muaaz; faithful port with a 185‑row parity oracle (`wings-operations/fixtures.json`) | `SPEC.md` (§7 waves · §8 gates) |
| `represented-brands-console/` | RB Console — the TOWER «Marcas Representadas» write‑side over the shipped `rb_wave1` backend: brand/kit tenancy, ALLOCATION product shelf, container availability, parametric diagram registry, quotation PDF + technical XLSX; five chapters merged under one migration ledger (`tower_25`–`tower_29`) and rulings R1–R20 | **PROPOSAL** — merged spec package; waves 0–5, Wave 0 (shared packages) first; GSAP peer‑dep ratification pending Muaaz | `SPEC.md` (rulings + wave plan) → `DATA_MODEL.sql` · `BUILD_PROMPT.md` |

## Sequencing constraints (decided facts, not suggestions)

1. **The ecosystem migration precedes everything — DONE.** The repo is now the monorepo (apps/site + packages/*, zero user-visible change) and the ecosystem root CLAUDE.md is active. TOWER's BUILD_PROMPT prerequisites are met; Network's `src/...` paths resolve to `apps/site/src/...`.
2. **TOWER absorbs `~/projects/wings-operations`** (decided 2026-07-06): that app is feature-frozen; its data migrates in TOWER Wave 1; decommission gate at Wave 5 with ops sign-off. It stays live as fallback until then.
3. **Network extends this repo directly** (not gated on the monorepo migration) but inherits Wings design tokens and the wholesale-only rules.
4. **Shared-container is additive to live Mister** — no existing flow is replaced; its `FillMeter` component becomes a shared organ reused by ecosystem/TOWER/network.
5. **One database for everything: the wings Supabase project (`pyznlglvwihosemqkhtq`)** — decided 2026-07-06. TOWER = `tower` schema, Network = `marketplace` schema, Áladín = `aladin` schema (until its own project post-agreement). dalab-intelligence is NOT used.
6. **Represented-brands depends on TOWER being deployed** (its Phase 1 = tower migrations 22+) and reuses shared-container's slot engine + FillMeter. `tower.brands` stays the tenant concept; partner brands are `tower.represented_brands` — never overload the former.
