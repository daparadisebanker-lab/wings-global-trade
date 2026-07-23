# INTEGRATION — Mister Torre → the real Tower

This folder is the **adopted scope** for Mister Torre (see `README.md` for the
package map). It is a vision/experience layer. What is actually built in the repo,
and how it docks, is recorded here. Authorized by `DECISIONS.md`
("Mister Torre adopted — 2026-07-23").

## Framing correction (read first)

The internal AI operator **already exists** in the repo — it is the `MisterCockpit`
("Phase E") + the `lib/copilot/` capability engine. Mister Torre is therefore the
**productivity-artifact layer that extends it**, not a second bot. Everything is
additive; nothing forks the skeleton or restyles host Tower chrome.

Three places this scope is superseded by the repo's ratified law (root `CLAUDE.md` +
`DECISIONS.md`, which the BUILD-PROMPT ranks above the design system):

| Scope says | Repo law (wins) |
|---|---|
| A "Constellation" particle visual system | Mister expressive layer + World-B navy artifact exemption (`mister-theme.ts`); the avatar merges into it |
| DDP incoterm | Engine models **EXW / FOB / CFR / CIF** only |
| Colombia / TRM / DIAN | **Peru-first**: IGV / percepción / ISC, `exchange_rate_milli` |
| New tables for clients/imports/quotes | All exist — only `ai_drafts.kind` is extended + (later) a `watch_signals` table |
| Space Grotesk vs Inter | Owner-authorized: **Inter → Space Grotesk** swap (recorded in DECISIONS) |

## Docking table (concept → where it lives)

| Scope concept | Repo home | Status |
|---|---|---|
| Artifact system (03) | `tower.ai_drafts` + `apps/tower/src/lib/torre/artifacts.ts` (zod + typed confidence + blockers) | **built** |
| `compute_landed_cost` (no model math) | `lib/costing/engine.ts` `computeImportCost` (parity-tested) | reused as-is |
| The quote run (03 flagship) | `lib/torre/quote-run.ts` — pure, reproduces to the cent | **built** |
| Draft persistence layer | `lib/torre/drafts.ts` (typed over `ai_drafts`) | **built** |
| Evals (02) | `apps/tower/evals/{quoting,honesty}.jsonl` + `lib/torre/evals.test.ts` | **built** |
| Kind vocabulary | migration `tower_48_torre_artifacts.sql` (additive CHECK) | **built (file; unapplied)** |
| Server action + capability | `lib/actions/torre-quote.ts` + a copilot capability | in progress |
| Renderers + review keyboard + export | World-B renderers + review flow + XLSX/PDF | in progress |
| Constellation avatar + font | canvas avatar from `constellation-map.json` + Space Grotesk | in progress |
| The Watch (05), Morning Brief (01) | new `watch_signals` + reconciler; per-role brief | not this pass |

## Constitution honored (enforced, not promised)

- **No model arithmetic on money** — every number in an artifact comes from
  `computeImportCost`; the model only parses inputs.
- **Nothing auto-commits** — artifacts land as `ai_drafts` (status `DRAFT`); the DB
  status-transition guards physically forbid illegal jumps; approval is a human
  server action.
- **Rates/tariffs never from memory** — a missing rate or unresolved tariff is a
  hard/soft blocker; `evals/honesty.jsonl` gates this at 100%.
- **Typed uncertainty** — `verified | estimado | requiere_verificación`; open
  blockers make an artifact unapprovable (`isApprovable`).

## Migration note

`supabase/migrations/20260723120000_tower_48_torre_artifacts.sql` is written but
**not applied** to the live project (the tower migration branch `tower_22→47` is
itself undeployed; migrations are the source of truth, applied on the deploy pass —
see `programs/tower/REMAINING.md` Track ①). It is additive and idempotent.
