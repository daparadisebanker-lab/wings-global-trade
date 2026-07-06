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

## D-07 · `.env.local` must live in `apps/site` after the move (M1 defect, found in M2)
Next loads `.env.local` from its working directory. Once the app moved to
`apps/site`, `next start`/`next dev` run with cwd `apps/site`, so the repo-root
`.env.local` was no longer loaded — the local server lost Supabase creds and
`catalog-data.ts` silently fell back to `seed.json`, 404ing every Supabase-only
product slug (e.g. `new-holland-sh504`). M1's runtime check missed it because it
only hit a category page present in both seed and DB; M2's broader visual pass
surfaced it. Fix: `apps/site/.env.local` (copied from root; both gitignored via
`.env*.local`). Root `.env.local` left in place for any root-run tooling. On
Vercel this does not arise — env vars are injected at the project level (confirm
they carry over per M1.4). Behavior-identical to M0 restored: the slug returns 200
and renders identically.

## D-08 · M2 token consumption is value-identical; seed-catalog.sql drift left untouched (M2, 2026-07-06)
`globals.css` now `@import`s `packages/ui/tokens/skeleton.css` (frozen Tier-1) and
`packages/liveries/wings/livery.css` (Tier-2), and its brand/navy/font `:root` vars
reference `var(--livery-*)` whose values are byte-identical to the previous
literals — verified by rendered screenshots (home + product page) matching baseline.
Separately noted: running the Python seed pipeline regenerated
`infrastructure/supabase/seed-catalog.sql` with a large diff, revealing pre-existing
drift between the committed SQL and current `data/product-catalog.json`. That is
unrelated to the migration and was reverted (not bundled into any wave) — flagged
for a separate data-reconciliation task.

## D-09 · M3 organ extraction — scope split to protect the Mister danger zone (M3, 2026-07-06)
`@wings/trade-ui` is stood up and two organs are extracted, verified, and building:
- **SpecSheet** — moved verbatim; app re-exports from the package; fully
  token-driven; swap-test clean.
- **TrustFooter** — moved as a lane-agnostic Server Component; Wings content
  injected as props via a `renderLink` callback; markup byte-identical, verified at
  runtime.

Enforcement + QA added: `packages/ui/.eslintrc.json` `no-app-imports` rule, and
`pnpm swap-test` (hard-gates app imports; itemizes token-purity debt — one inherited
`#000C1F` in TrustFooter; Tailwind color utilities still resolve to app-theme hex,
not livery vars).

**Deliberately deferred (not rushed at the tail of this session):**
- `RFQFlow` — tractable like TrustFooter but couples to lead-submit endpoints/toast.
- `MisterDock` (= the live `MisterSiteWidget` shell, per D-02) and `packages/mister`
  (client surface) — these pull the full Mister provider/streaming/context stack,
  which sits next to the guardrail/hold-back paths marked "never touch" in both
  CLAUDE.md and the migration prompt. Per M3.3's wrap-and-log allowance for
  behavior-risky extractions, these are done as a dedicated wave with the full
  Mister SSE conversation re-verified against the M0 baseline afterward — not
  folded into a long mixed session. `types/mister.ts` stays in `apps/site` as the
  re-export seam (D-03) until then.

Every step remains deployable and build-green; nothing user-visible changed. M3's
exit gate ("site imports ALL extracted organs from @wings/trade-ui; swap test green;
full Mister conversation re-verified") is therefore **partially met** — met for
SpecSheet + TrustFooter; open for RFQFlow + MisterDock.

## D-10 · M3b — RFQFlow + primitives extracted; QuotationForm is a distinct organ (2026-07-06)
- **UI primitives** (`Input`, `Textarea`, `Select`, `Button`, Toast) moved to
  `@wings/trade-ui` verbatim (package-local `cn`); app `components/ui/*` re-export
  them, so all consumers are unchanged. `DESTINATION_COUNTRIES` stays app-side.
- **RFQFlow** organ ported verbatim from `InquiryForm`; lane-specific bits injected
  (productId/name/slug, `countries`, `endpoint`, `storageKeyPrefix`, `notify` toast,
  `renderSuccess`). `useInquiryForm` is now a thin wrapper over the package
  `useRFQForm` (catalog endpoint bound). App `InquiryForm` is a Wings adapter.
  **Verified end-to-end**: filled + submitted a catalog inquiry → validation, gold
  border-trace/goal-gradient animations, POST `/api/leads/catalog`, and the injected
  `InquirySuccess` state all behave identically; server logged the notification
  payload as in the M0 baseline.
- **QuotationForm** (`/cotizar`) is **NOT** RFQFlow — it is a structurally different
  guided quote wizard (category picker, suggestion chips, timelines, line-field
  styling, `/api/leads/contact`). Unifying it would be a redesign, violating
  zero-change. Left app-local and documented as a future `QuoteBuilder` organ.
- Copy-debt: RFQFlow keeps its Spanish copy as organ defaults (a future non-Wings
  lane parameterizes it) — tracked, not blocking, like the token-debt.

## D-11 · M3c — packages/mister client surface extracted; MisterDock shell stays app-local (2026-07-06)
Created `@wings/mister` holding the **client surface only**: the full Mister v2
type/data contract (`types.ts`, incl. control-block schema types) and the SSE
`useMisterStream` hook. `apps/site/src/types/mister.ts` and
`src/hooks/useMisterStream.ts` are now thin **re-export seams**, so all 11 server
importers and every client component import `@/types/mister` /
`@/hooks/useMisterStream` unchanged (D-03). The package copies the 3 database value
types it references (`FreeZone`, `TprCompleteness`, `ConversationTurn`) into
`database-shared.ts` (byte-identical) rather than importing from apps.

**Server/guardrail surface never moved**: `app/api/mister/*`, the HOLD-BACK price
guardrail, `lib/mister/{guardrails,systemPrompt,tools,client,stage,…}`, and the
cached system prompt all stay in `apps/site`.

**MisterDock deliberately NOT extracted.** The live shell (`MisterSiteWidget` + ~28
interwoven client components/surfaces + provider + streaming) is inseparable from the
guardrail-adjacent stack; deep-moving it risks the verified crown-jewel conversation
for a purely future theming gain, and packages can't import apps so no thin wrapper is
possible. Per M3.3's wrap-and-log allowance it stays app-local, documented as a future
clean-move once the client stack is decoupled from app-local `lib/mister`
motion/haptics/fallback utilities.

**Danger-zone gate — GREEN.** Re-ran the full Mister SSE conversation against the M0
baseline: streaming, archetype resolution (COMPRADOR FINAL), all stage transitions
(INDUCCIÓN→…→PRE-CALIFICACIÓN), product surfaces, control block (quick actions/state/
collected país=PE), pre-qualification escalation, and the **price hold-back
("A cotizar", no absolute price) all behaved identically**. No route errors or
guardrail trips. swap-test extended to scan `packages/mister` (green).

M3 organ extraction is complete for everything safely extractable: SpecSheet,
TrustFooter, RFQFlow (+ primitives), and the Mister client surface. The two documented
app-local exceptions (QuotationForm→future QuoteBuilder; MisterDock shell) are
deliberate risk-managed decisions, not gaps of omission. M4 (law switch) is unblocked.

<!-- historical note kept below -->
_(Superseded planning note)_ M3b done. Remaining for M3: M3c (MisterDock + `packages/mister`, the danger-zone
wave with full Mister SSE re-verification).
