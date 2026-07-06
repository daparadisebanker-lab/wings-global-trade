# ECOSYSTEM · MIGRATION_BUILD_PROMPT.md
*The missing first link: converts this repo from a single Next.js app into the monorepo that `CLAUDE.ecosystem.md`, `programs/tower/`, and `programs/network/` all assume. Run this BEFORE the TOWER build prompt — TOWER's prompt starts "from the monorepo root" and reads "the ecosystem root CLAUDE.md", both of which only exist after this migration.*

*Scope guard: this prompt builds the chassis only. It does NOT onboard lanes, build The Manifest, create liveries beyond Wings' own, or add any feature. Its entire definition of success is: the live site deploys and behaves **identically**, from inside the new structure.*

*Reconciliation (logged as a decision, not open for reinterpretation): `CLAUDE.ecosystem.md` §6 writes site paths root-relative (`app/(lanes)/...`); TOWER expects `apps/tower`. This migration establishes `apps/site` + `apps/tower` (later) + `packages/*`, and §6's site paths resolve inside `apps/site/src/`.*

---

You are migrating the **wings-global-trade** production repo to its ecosystem monorepo structure. Read first: root `CLAUDE.md` (current law — stays law until Wave M4), `programs/ecosystem/CLAUDE.ecosystem.md` §2 (frozen skeleton) and §6 (repo conventions), and this file. The prime directive of this migration overrides everything else: **zero user-visible change**. No feature, no redesign, no refactor beyond what the moves require. Log every judgment call in `programs/ecosystem/MIGRATION_DECISIONS.md`.

**WAVE M0 — Baseline & safety net (blocking):**
1. Tag `pre-monorepo` on master. Work on branch `chore/monorepo-migration`; merge only at wave boundaries after the wave's preview deploy verifies.
2. Record the baseline in `programs/ecosystem/migration-baseline/`: clean `pnpm build` log; screenshots of `/`, one category grid, one product detail, `/mister`, `/nosotros`, `/contacto` at desktop and 390px; a full Mister conversation exercised end-to-end (SSE stream, control block → surfaces + quick actions, quotation prefill); one catalog inquiry and one contact lead submitted (non-prod: verify notification payloads logged to console); Lighthouse scores for `/` and one product page. This baseline is the acceptance oracle for every later wave.
3. Generate an import inventory for every component that Wave M3 will extract (who imports it, from where).

**WAVE M1 — Workspace conversion (structure only):**
1. Add `packages:` (`apps/*`, `packages/*`) to `pnpm-workspace.yaml` (keep its existing build config).
2. Create `apps/site` and move into it: `src/`, `public/`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `tsconfig.json` (now extending a root `tsconfig.base.json`), `.eslintrc.json`, `next-env.d.ts`. Use `git mv` so history follows. The `@/` alias keeps resolving within `apps/site/src` — no import rewrites inside the app.
3. Root keeps: `supabase/`, `data/`, `infrastructure/`, `scripts/`, `docs/`, `spec/`, `programs/`, `marketing/`, `assets/`, `DECISIONS.md`, README, and a workspace-root `package.json` whose scripts proxy (`pnpm --filter site dev|build|lint`). Verify the `infrastructure/` seed pipeline still runs from repo root reading `data/` relatively.
4. Vercel: set the project's Root Directory to `apps/site` (dashboard → Settings → Build & Deployment). Confirm env vars carry over. A preview deploy must match the M0 baseline before this wave merges.
**Exit:** preview deploy pixel- and behavior-identical to baseline · `pnpm build` green from repo root · seed pipeline runs.

**WAVE M2 — Token tiers:**
1. Create `packages/ui/tokens/skeleton.css` — Tier 1, frozen, from `CLAUDE.ecosystem.md` §2 verbatim: spacing `4 8 12 16 24 32 48 64 96 128`, 1.25 modular type scale, 12-col grid variables, radii 0/≤2px, `--ease-gantry` + `--ease-settle`, tabular-numeral rule.
2. Create `packages/liveries/wings/livery.css` + `lane.config.ts`: map the CURRENT site values (navy `#001E50`, gold `#C4933F`, warm white `#F8F6F0`; NissanOpti/Flexo/Teko variables) into livery custom properties **without changing a single computed value**. Seed `packages/liveries/registry.md` (append-only) with the Wings hue entry.
3. `apps/site` consumes both files from `globals.css`; replace duplicated literals only where the substitution is provably value-identical.
**Constraint:** the current site is NOT registered as a lane — lane onboarding is the ecosystem program's later work, not the migration's. **Exit:** screenshot diff against baseline shows zero change; skeleton tokens file is byte-stable against §2.

**WAVE M3 — Organ extraction (`packages/ui` = `@wings/trade-ui`):**
1. Scaffold `@wings/trade-ui`: pure TypeScript/React, styles via tokens only, peer-dep react; **packages never import from `apps/*`** — enforce with a lint rule.
2. Extract what exists today by move + re-export, imports updated, pixel-identical: `SpecSheet` (from mister/surfaces), the site footer as `TrustFooter`, the Mister launcher/window shell as `MisterDock`, the inquiry/quotation flow as `RFQFlow`. Organs the specs name that do NOT exist yet (`ManifestTable`, `LaneStamp`, `FillMeter` — FillMeter arrives with the shared-container program) are NOT invented: list them as documented gaps in the package README.
3. `packages/mister`: extract only the client surface (hooks, types, control-block schema). Server routes, guardrails, and the system prompt stay in `apps/site` untouched — if an extraction risks behavior, wrap and re-export instead, and log it.
4. Build the swap-test harness (ecosystem §4 QA-6): render every extracted organ under the Wings livery and a synthetic test livery; the organ passes only if it renders correctly from tokens alone.
**Exit:** site imports all extracted organs from `@wings/trade-ui` · swap test green · preview identical to baseline · full Mister conversation re-verified.

**WAVE M4 — The law switch:**
1. Distill the current root `CLAUDE.md` into `apps/site/CLAUDE.md`: keep everything still true and site-specific (Mister v2 rules, copy rules, brand values, API error pattern, notification flow, DB rules); drop what the migration made false.
2. Activate the ecosystem law: `programs/ecosystem/CLAUDE.ecosystem.md` becomes the root `CLAUDE.md`, amended with (a) a Repository Map for the new structure (apps/, packages/, content/ placeholder, root knowledge dirs, programs/), (b) a "Current state" block — apps/site is the live site not yet split into lanes; TOWER and Network are queued in `programs/` — and (c) the §6 path note from this file's header.
3. Update `programs/README.md`: ecosystem status → migration complete; TOWER unblocked. Append the migration entry to `DECISIONS.md`.
**Exit — THE MIGRATION TEST:** production deploy from the monorepo is indistinguishable from the M0 baseline on every recorded flow (routes, full Mister SSE conversation, both lead submissions, notifications) · `pnpm build` + typecheck green across all workspace packages · Lighthouse ≥ baseline · Supabase untouched (zero new migrations, zero schema changes) · git log shows the moves as renames.

**Hard rules:** zero user-visible change, ever — this migration ships no features. Never touch `supabase/migrations/`, any `mister_*` table, or Mister's guardrail/hold-back code paths. Every wave ends deployable; never merge a wave whose preview hasn't been verified against baseline. If any step forces a behavior change, stop and log it — do not improvise product decisions inside a migration.

---

## After this migration
- `programs/tower/BUILD_PROMPT.md` runs as written (monorepo root exists; ecosystem CLAUDE.md is the root law; `packages/ui` exists).
- `programs/network/` paths written as `src/...` resolve to `apps/site/src/...`.
- Lane onboarding (ecosystem §4 Phases 0–6) becomes executable but is a separate, explicitly-ordered piece of work.
