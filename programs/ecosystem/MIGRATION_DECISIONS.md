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
