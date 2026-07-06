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
