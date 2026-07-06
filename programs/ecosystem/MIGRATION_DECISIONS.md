# Monorepo Migration — Decision Log

Every judgment call made during the M0–M4 migration, per MIGRATION_BUILD_PROMPT.md.
Append-only.

## D-01 · §6 path reconciliation (pre-logged from the prompt header)
`CLAUDE.ecosystem.md` §6 writes site paths root-relative (`app/(lanes)/...`);
TOWER expects `apps/tower`. The migration establishes `apps/site` + `apps/tower`
(later) + `packages/*`; §6's site paths resolve inside `apps/site/src/`.
Logged as a decision, not open for reinterpretation.

## D-02 · "MisterDock" maps to the live shell, not the dead files (M0, 2026-07-06)
The prompt's "Mister launcher/window shell as MisterDock" names `MisterLauncher.tsx`
/ `MisterWindow.tsx` — but those files have **zero importers** (superseded design
pass). The live shell mounted by `src/app/layout.tsx` is `MisterSiteWidget`
(MisterProvider + MisterFloatingButton + MisterFullscreenOverlay). M3 extracts the
live shell as `MisterDock`; the two orphan files are left in place untouched
(deleting them would be a refactor beyond what the moves require).

## D-03 · `types/mister.ts` is shared client/server — extraction strategy (M0, 2026-07-06)
`@/types/mister` has 10+ server-side importers (API routes, guardrail-adjacent
libs). Wholesale extraction into `packages/mister` would drag server surface into
the package. Per the prompt's wrap-and-re-export rule, M3 keeps `src/types/mister.ts`
in `apps/site` as a re-export of the package's client types so no server import
changes; only genuinely client-only modules move.

## D-04 · Latent type errors unmasked by the moved TS incremental cache (M1, 2026-07-06)
The M0 baseline `pnpm build` was **exit 0 only because a stale root
`tsconfig.tsbuildinfo` (gitignored, dated Jul 5) let TypeScript's incremental
checker skip unchanged files.** Moving the app to `apps/site` (no cache) forced a
full type-check, surfacing 4 pre-existing `strict`-mode errors the live repo would
also hit on any clean build:
- `ProductGallery.tsx` — two implicit-`any` event params on `motion.div` handlers.
- `SiteNav.tsx` — implicit-`any` event param on the catalog `<Link>` `onClick`.
- `button.tsx` — `variants[variant]` / `sizes[size]` indexed by an `any`-widened key.

Fixed with **type-only annotations** (`type MouseEvent/KeyboardEvent as React*`
imports; `as Variant`/`as Size` index assertions). Types are erased at build — the
emitted JS is unchanged, so this does not violate "zero user-visible change".
Re-masking via a shipped `tsbuildinfo` was rejected: a fresh Vercel build has no
cache and would fail to deploy. Root `tsconfig.tsbuildinfo` deleted (regenerates per
build). Follow-up flag: CI evidently never ran a cold type-check — add a clean-build
gate post-migration.

## D-05 · Root vs app package split; seed pipeline unaffected (M1, 2026-07-06)
All app runtime deps live in `apps/site/package.json` (name `site`). Root
`package.json` is the workspace shell: proxy scripts (`pnpm --filter site …`) plus
`@resvg/resvg-js` for the retained `scripts/generate-icons.mjs`. The "seed pipeline"
is Python (`scripts/generate-sql-seed.py` → `infrastructure/supabase/seed-catalog.sql`)
reading root `data/` — both stay at root, so it is unaffected. `generate-icons.mjs`
read `public/` relatively; repointed to `apps/site/public` (the only root script the
move touched).

## D-06 · Vercel Root Directory is a manual dashboard step (M1, 2026-07-06)
M1.4 requires setting the Vercel project Root Directory to `apps/site`. That is a
dashboard action outside this environment, left for Muaaz to apply before the M1
preview deploy can be verified. The exit gate ("preview matches baseline") stays
open until that setting lands.
