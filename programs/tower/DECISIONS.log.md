# TOWER — DECISIONS.log.md

Append-only log of build decisions and resolved ambiguities. Newest at bottom.

---

## Wave 1 — Foundation · started 2026-07-06

**Dispatch scope (confirmed with Muaaz):** Wave 1 only. Waves 2–5 dispatched after review.

**Production Supabase authorization (confirmed with Muaaz):** apply migrations
directly to the live ecosystem project, unsupervised. Reconciliation on the
ops-data migration is still mandatory per BUILD_PROMPT step 5.

**Execution model:** run as Conductor with a dependency-ordered pipeline. The
production-Supabase spine (schema, triggers, crons, RLS DDL, ops migration) is
executed in the main thread where reconciliation can be verified; independent,
prod-safe code modules (apps/tower scaffold, lib/archetypes) fan out to subagents.

### D-01 · Supabase project-ID reconciliation (blocking, resolved)
The dashboard project *names* do not match the spec's prose:
- `pyznlglvwihosemqkhtq` — spec calls this the "wings ecosystem project" (TOWER
  target). Dashboard name is **"wings-operations"** (stale). Verified as the
  correct target by inspecting its contents: it holds `mister_projects`,
  `mister_contacts`, live `products`/`categories`, and migrations
  `rename_accio_to_mister` / `mister_system` / `add_mister_rehydration_token`.
  This is the live site/ecosystem DB. **TOWER schema `tower` goes here.** No
  `tower` schema exists yet (clean slate).
- `rsstxmptehndaipscaou` — spec calls this "wings-operations" (migration source).
  Dashboard name is **"Euro Global"** and status is **INACTIVE (paused)**.
  Decision: IDs are authoritative (they match `programs/tower/CLAUDE.md` and
  `BUILD_PROMPT.md`); dashboard names are stale. Do not trust names.

### D-02 · Ops-data migration source (Wave 1 step 5 — resolved by Muaaz)
Correction from Muaaz: **`rsstxmptehndaipscaou` ("Euro Global") is unrelated —
do not touch it.** TOWER lives in the wings-global-trade project
(`pyznlglvwihosemqkhtq` Supabase + its Vercel app). The BUILD_PROMPT's claim that
wings-operations sits on a separate paused project is stale.

The wings-operations catalog data already lives **inside `pyznlglvwihosemqkhtq`
itself** — the project is literally *named* "wings-operations" in the dashboard
and holds `public.products` (99), `public.categories` (9),
`public.subcategories` (26), `public.leads` (5), `public.notification_log`.
Therefore Wave 1 step 5 is an **intra-project** migration `public` → `tower`,
not a cross-project pull. No paused DB to restore; the earlier checkpoint is
dropped. All five Wave-1 steps proceed unblocked.

### D-03 · Implicit brand_id FKs made explicit
`orders.brand_id` and `containers.brand_id` were declared `not null` without a
FK in DATABASE_SCHEMA.sql. Added `references tower.brands(id)` for integrity,
consistent with every other domain table. No behavioural change.

### D-04 · Analytics surface is service-role only
`tower.events` (+ monthly partitions) and the `metric_rollups_daily` matview are
locked to `service_role`: RLS enabled with no user policies, and privileges
revoked from `authenticated`. Ingest is server-side (HMAC endpoint, Wave 4);
dashboards read rollups server-side. `ensure_events_partition()` auto-enables RLS
on every future partition (migration 10) — partitions do not inherit parent RLS
for direct access.

### D-05 · Append-only enforced in two layers
No DELETE anywhere for domain tables: no delete RLS policy AND no delete grant to
`authenticated`. Retirement is via `status`, per CLAUDE.md directive 4.

### D-06 · Schema file omitted role grants — added as migration 11
DATABASE_SCHEMA.sql defined RLS but no GRANTs. Privileges are orthogonal to RLS;
without `grant usage on schema tower` + table grants, the Supabase `authenticated`
role gets "permission denied for schema tower" regardless of policies. Added
`tower_11_grants`. Later-wave tables must add their own grants (default privileges
cover new tables created by the postgres role).

### D-07 · profiles readable by self + group admin only (Wave 1)
Kept tight for now; lane-mates cannot yet read each other's names. The admin
UserManager (Wave 5) and any assignment UI needing broader reads will widen this
deliberately. Noted so a later wave doesn't treat it as a bug.

### D-08 · RLS verified, not just written
`programs/tower/migration/rls_test.sql` seeds 4 personas (group admin, WGT/01
CATALOG_EDITOR, WGT/02 LANE_DIRECTOR, Áladín SALES) in a transaction, asserts
cross-lane + cross-brand isolation + the insert/publish guards, then ROLLS BACK.
Ran green against pyznlglvwihosemqkhtq on 2026-07-06 → "RLS TESTS PASSED".

### D-09 · Catalog import executed + reconciled (W1.5)
`import_catalog.sql` run against pyznlglvwihosemqkhtq 2026-07-06. All 99
`public.products` → `tower.products` under wings / WGT/01 (every product is
EQUIPMENT archetype — machinery/buses/autos/trucks/industrial/UTV/parts — so the
lane is unambiguous). Original category+subcategory slugs preserved in
`category_path`. is_active → PUBLISHED (+ a v1 `product_versions` snapshot each),
else RETIRED. Reconciliation exact: source 99 = tower 99, active 99 = published
99, snapshots 99. No money conversion (catalog has no price columns). No
container/financial/prorrateo source exists in this project's public schema
(belonged to unrelated Euro Global) — nothing to migrate there.

## Wave 2 — Catalog Studio · 2026-07-06

### D-10 · Fanned to 3 parallel worktree agents, synthesized by Conductor
W2.A (spec schemas + SpecForm), W2.B (public catalog API + revalidation), W2.C
(Catalog Studio UI + publish). Disjoint path ownership + interface contracts
(SpecForm, getSpecSchema, triggerRevalidate, apiError). C left `// CONTRACT STUB`
placeholders for A/B modules; synthesis discarded them in favour of the real ones.
All DB writes stayed with the Conductor (agents only produced artifacts).

### D-11 · Foundation bugs fixed during integration
- `lib/rbac.ts`: roles were lowercase + treated `group_admin` as a lane role.
  Corrected to the DB enum (UPPERCASE) + group-admin via `profiles.is_group_admin`
  threaded through `visibleModules(roles, isGroupAdmin)` and the shell.
- `lib/lanes/memberships.ts`: selected a non-existent `lanes.accent` column (query
  errored → LaneSwitcher always empty). Removed; accent is livery-derived (null for
  now). Added `getIsGroupAdmin()`.
- C's `requireUser()` guard returned a non-discriminated union (`gate.error` inferred
  `| undefined`); added an `ok` discriminant across catalog.ts + media.ts. Fixed a
  Zod array-schema `fieldErrors` (number-indexed) not fitting `Record<string,string[]>`.

### D-12 · Spec schemas seeded + storage bucket
6 archetype-default schemas in `tower.spec_schemas` (idempotent, `where not exists`
for the NULL-lane_id uniqueness gotcha). Private `product-media` bucket created.

### D-13 · DEPLOYMENT PREREQUISITES (app is non-functional until done)
1. **Expose `tower` schema to PostgREST** — the JS client (both `.schema('tower')`
   and default reads) needs it. Dashboard → Settings → API → Exposed schemas → add
   `tower` (canonical). SQL alternative (verify current list first, additive):
   `alter role authenticator set pgrst.db_schemas = 'public, storage, graphql_public, tower'; notify pgrst, 'reload config';`
   Not applied by Conductor — can't read the current exposed list via SQL, won't risk
   clobbering the live site's API surface.
2. **Env vars** on Vercel (per BUILD_PROMPT): NEXT_PUBLIC_SUPABASE_URL/ANON_KEY,
   SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, INGEST_HMAC_KEY_*, REVALIDATE_SECRET,
   N8N_WEBHOOK_BASE.
3. **Storage RLS** for `product-media`: signed-URL upload/read via service role works
   now; direct `authenticated` object access would need `storage.objects` policies —
   follow-up (see components/catalog/README.md).

### D-14 · Verification
typecheck clean · 93 vitest tests green (9 files) · `next build` green (14 routes).
SQL-level e2e proof: published products carry v1 snapshots and the public-read join
returns 99 readable rows for wings/machinery. Full browser click-through (auth →
draft → publish) is the Verifier's gate (needs running server + real session).

## Wave 3 — Pipeline + Container Desk + hooks · 2026-07-06

### D-15 · Fanned to 3 worktree agents; shared primitive committed up front
W3.A (Pipeline), W3.B (Container Desk), W3.C (hooks + conversation layer). Learned
from Wave 2: committed `lib/money.ts` (integer-minor helpers, 5 tests) as `aba3ff7`
BEFORE fanning out, so both money-touching agents imported a real helper (no stub
contention). Each brief did an explicit `git reset --hard feature/tower-wave1` step 0
(fixing the worktree-off-master gap). Only cross-agent contract was `getConversation`.

### D-16 · Conversation contract reconciled at integration
W3.A improvised a different ConversationPane shape (messages/channel/direction/body)
than W3.C's real `getConversation` (entries/source/role/text, matching the brief).
Kept C's data layer; rewrote A's ConversationPane + the `[id]` page fallback to C's
shape. C's authorize-then-privileged-read pattern (RLS-read the rfq row first, then
service client for mister_projects/whatsapp scoped to that row) kept as-is — correct.

### D-17 · Applied ONLY the genuinely-new DB objects
Agents proposed RLS/grants for the container/PO/QC/doc tables believing none existed
(they only see DATABASE_SCHEMA.sql's single `products` example) — but migrations 8 & 11
already cover every domain table. Applied only:
- `tower.commit_container_cbm(...)` (migration 14): atomic CBM capacity — `SELECT … FOR
  UPDATE` on the container, sums RESERVED/CONFIRMED/LOADED, raises CAPACITY_EXCEEDED;
  SECURITY DEFINER so it re-checks `has_lane_role(TRADE_OPS/SALES/LANE_DIRECTOR)` itself.
- `tower.whatsapp_messages` (migration 15): new table (WhatsApp side of ConversationPane).
  service-role insert only (like events), RLS read via the linked rfq's lane, audit
  trigger `tower.audit_trigger()`, `authenticated` insert/update revoked (default-priv
  would have granted them; RLS blocks anyway — defense in depth).
Skipped the agents' redundant RLS/grants. Created private `trade-documents` bucket.
B's flagged "accounts/suppliers have no RLS" is a non-issue — secured in mig 8/11.

### D-18 · Integration typecheck/build fixes
- `PipelineCapabilities` re-exported from pipeline.ts (components imported it there).
- `committedCbmByContainerId` + `loadRfqContext` typed `ReturnType<SupabaseClient['schema']>`
  (removed an `any` + an eslint-disable for `@typescript-eslint/no-explicit-any`, a rule
  the project's ESLint doesn't register — the stray directive was failing `next build`).
- pipeline.ts Zod array `fieldErrors` → collapsed to `{ lines: issues.map(...) }` (same
  number-index issue fixed in Wave 2's media.ts).

### D-19 · Verification
typecheck clean · 163 vitest tests (15 files) · `next build` green (adds /pipeline[/id],
/containers[/id], /api/hooks/{mister,whatsapp}, /api/public/fill/[...code]). Capacity fn
proven to reject over-commit: a transactional test (TRADE_OPS member) raised
CAPACITY_EXCEEDED at 6+5 > 10 capacity; rolled back, zero leak confirmed. Minor open:
one non-fatal `exhaustive-deps` warning in PipelineBoard.

### D-20 · New deployment env (add to Vercel + .env.local.example)
`MISTER_HOOK_SECRET`, `WHATSAPP_HOOK_SECRET` (W3.C hook HMAC verification). Still
outstanding from earlier waves: expose `tower` schema to PostgREST; the Wave-1/2 env set.
