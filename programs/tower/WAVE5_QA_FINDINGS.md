# TOWER · WAVE5_QA_FINDINGS.md

Static QA sweep of `apps/tower/src` against the Definition of Done in
`programs/tower/CLAUDE.md` and the overall DoD in `BUILD_PROMPT.md`. Reviewer
pass only — no product code was changed. Base commit `8ace280` (Wave 4).

**Headline:** the security spine is genuinely strong. Every server action
follows auth → Zod → RLS; the D-23 service-client schema-scoping bug class is
fully remediated (every `createServiceClient()` read is `.schema('tower')`-scoped
or reads `public.mister_projects` deliberately); money is integer minor units
end-to-end; ingest enforces HMAC → shape → PII → rate-limit in order; raw DB
errors never reach users. **No CRITICAL code defect was found.** The material
findings are (a) infrastructure/reproducibility gaps and (b) one tenant-isolation
question that only a DB check can close. DB-level items are delegated to the
Conductor (see the list at the bottom).

Severity key: CRITICAL (blocks ship / security / data loss) · HIGH (must fix
before decommission) · MEDIUM (fix this wave) · LOW (polish / debt).

---

## CRITICAL

None. The invariants that would earn a CRITICAL — RLS-as-permission, integer
money, PII rejection at ingest, no raw-error leakage, service-role never reaching
the client — all hold in the code as written. Two items below are HIGH only
because their risk is conditional on a DB fact I cannot verify statically
(H-1) or is an infrastructure/process gap rather than a runtime hole (H-2/H-3).

---

## HIGH

### H-1 · Triage candidate-lane list is not tenant-scoped — possible cross-tenant leak
**`src/app/api/ai/triage/route.ts:46-64`** (`.from('lanes').neq('status','ARCHIVED')`)
The triage route fetches **every** non-archived lane through the RLS-scoped
client and feeds all lane names/codes/archetypes to the model as classification
candidates, then writes a draft with the model's proposed `lane_id`/`brand_id`.
Every other lane-list path in the app scopes by membership (`listEditableLanes`
non-admin path `catalog.ts:342-347`, `listContainerLanes` `containers.ts:500-503`,
`resolveSignalScope` `signals.ts:310-315` all filter `lane_memberships.user_id =
user.id`). This route uniquely relies on the `lanes` table's RLS read policy to
scope. **If `tower.lanes` is readable by any authenticated user regardless of
brand/membership** (plausible — lanes are catalog-structural), then a Wings
operator's triage session enumerates Áladín lane names/codes and the model can
propose an Áladín lane for a Wings inquiry — a tenant-isolation break of the
DoD's "wings user cannot see aladin rows." The subsequent approve is RLS-blocked,
but the candidate-list leak and mis-routed draft already happened.
**Fix:** scope the candidate query to the caller's accessible lanes explicitly —
either join through `lane_memberships` for the caller (mirroring `listPipelineLanes`)
or, for group admins, pass the RFQ's own `brand_id` and filter `lanes.brand_id`
to it. Do not depend on `lanes` RLS alone for cross-tenant safety here.
**Elevate to CRITICAL if** the Conductor's RLS check confirms `tower.lanes` is
readable across brands by non-admins.

### H-2 · The applied `tower` schema is not version-controlled in the repo
**Repo-wide** (`supabase/migrations/` holds only live-site `public`-schema
migrations; `programs/tower/DATABASE_SCHEMA.sql` is the original spec, not the
applied state; `programs/tower/migration/*.sql` are partial/proposal artifacts).
Per DECISIONS.log the live `tower` schema is the result of ~16 migrations applied
directly to `pyznlglvwihosemqkhtq` via MCP `apply_migration` (D-01, D-06 grants =
mig 11, D-17 `commit_container_cbm` = mig 14 + `whatsapp_messages` = mig 15, D-22
`ai_drafts` = mig 16, plus partitions/matview/crons). **None of these applied
migrations exist as executable files in the repo.** `DATABASE_SCHEMA.sql` predates
D-03 (FKs), D-06 (grants), and every function/partition added later, so it no
longer equals production. Consequence: the `tower` database **cannot be rebuilt
from the repo** (disaster recovery, staging, a fresh environment), and this
directly contradicts root `CLAUDE.md` ("supabase/ Migrations + config … Never
manual prod SQL"). This matters most precisely at the Wave-5 decommission gate —
you would be retiring the operational fallback while the survivor's schema lives
only inside one Supabase project.
**Fix:** export the applied migration history (Conductor: `list_migrations` +
dump each) and commit them under `supabase/migrations/` (or
`programs/tower/migration/applied/`) as the canonical, ordered, reproducible set.
Then reconcile `DATABASE_SCHEMA.sql` to the applied state or mark it clearly as
"original spec — see applied migrations for truth."

### H-3 · PostgREST `tower`-schema exposure is a hard, unmet deploy gate (D-13)
**Deployment config (not code).** The JS client's `.schema('tower')` reads —
i.e. every server action and public endpoint — return nothing until `tower` is
added to the project's PostgREST *Exposed schemas* (Dashboard → Settings → API,
or the additive `pgrst.db_schemas` role setting in D-13). D-13 records this was
**not applied** by the Conductor (couldn't read the current exposed list via SQL
without risking the live site's API surface). Until it is, TOWER is non-functional
in production regardless of code quality.
**Fix:** a human (or Conductor with dashboard access) adds `tower` to Exposed
schemas, additively, and confirms the live site's `public`/`storage`/`graphql_public`
exposure is preserved. Tracked as the top deployment prerequisite in HANDOVER.md.

---

## MEDIUM

### M-1 · Multi-step writes are not transactional — partial-state risk
**`src/lib/actions/catalog.ts:529-556`** (publish: status→PUBLISHED, then read
versions, then insert `product_versions`), **`catalog.ts:636-678`** (rollback,
same shape), **`pipeline.ts:614-636`** (`upsertLines`: delete stale ids, then a
per-line update/insert loop), **`pipeline.ts:842-851`** (`convertToOrder`).
None run inside a DB transaction/RPC. The most user-visible failure: a product
flips to `PUBLISHED` but the version insert fails (`catalog.ts:551-556`) →
published-but-no-snapshot. The public read model then silently **drops** that
product (`api/public/catalog/_lib/data.ts:151-157`), so it publishes to an
invisible state with no error surfaced to the operator.
**Fix:** move each multi-write mutation into a single `SECURITY INVOKER` SQL
function (RPC) so RLS still applies and the steps commit atomically — mirroring
how `commit_container_cbm` already wraps the capacity check. At minimum, wrap
publish+snapshot so the two can't diverge.

### M-2 · Stale migration references in code comments misstate what enforces RLS
**`src/lib/actions/containers.ts:6-16`**, **`containers-logic.ts:16-18`**,
**`conversations.ts:6-8`**, **`api/public/fill/_lib/data.ts:9-11`** all cite
`migration/wave3-container.sql` / `wave3-hooks.sql` / `wave4-signals.sql` as
"proposed, NOT yet applied" or as the RLS source. Per DECISIONS.log D-17/D-22
those files were **redundant and skipped** — the RLS/grants for container, PO,
QC, document, commitment, whatsapp and ai_drafts tables were already covered by
the Wave-1 migrations (8 & 11), and the only genuinely-new applied objects were
`commit_container_cbm` (14), `whatsapp_messages` (15), `ai_drafts` (16). A future
reader auditing security will conclude these tables have no RLS ("not yet
applied") when they do. This is a documentation-integrity defect on a security
surface.
**Fix:** update the comments to point at the actual applied migration numbers
(or the committed migration files once H-2 is resolved), and delete or clearly
label the redundant proposal SQL in `programs/tower/migration/`.

### M-3 · ⌘K command palette: only module navigation works; actions and record jumps are dead stubs
**`src/components/shell/CommandPalette.tsx:71-83`.** COMPONENT_TREE specifies
"jump to product/account/container, run actions ('publish…','new RFQ…')." The
palette ships with modules navigable but the two action items rendered
`disabled` and **no** record-jump search at all. The DoD's "Keyboard + ⌘K
reachable" is therefore only half-met: modules are reachable, actions/records are
not. (The Cmd/Ctrl-K toggle itself is correctly wired — `ShellChrome.tsx:36-45`.)
**Fix:** wire the record-jump (product/account/container by code) and the
run-actions to the existing server actions; this is naturally part of the Wave-5
Admin/hardening synthesis.

### M-4 · Admin module is an unbuilt placeholder (this wave's work)
**`src/app/(shell)/admin/page.tsx`** is an `EmptyState`. UserManager,
LaneRegistry, BrandManager, **AuditExplorer**, WebhookHealth (COMPONENT_TREE §6)
are absent. AuditExplorer is the parity target for wings-operations' history/audit
view (see PARITY_MAP.md) so container/catalog parity on the "audit trail" workflow
is blocked until it exists. Flagged as **pending Wave-5 synthesis** per the sweep
brief; the parallel admin-build agent owns it.

---

## LOW

- **L-1 · API error-code drift.** `api/ai/_lib/drafts.ts:67-82` uses
  `AI_UNAVAILABLE`/`AI_ERROR`/`INTERNAL`; `api-errors.ts:18-27` adds
  `INTERNAL`/`NOT_FOUND`. Neither set matches API_MAP's taxonomy exactly. Both are
  documented in-file and harmless, but a consumer coding to API_MAP's list will
  miss them. Reconcile API_MAP or the code.
- **L-2 · Hardcoded `'inquiry'` stage fallback.** `api/hooks/mister/route.ts:212`
  and `api/hooks/whatsapp/route.ts:99` use `getStages(archetype)[0]?.id ?? 'inquiry'`.
  The `?? 'inquiry'` is a stage literal outside `lib/archetypes`; unreachable given
  the validated config always has stages, but it's the one spot that could drift if
  an archetype ever shipped with an empty stage set. Prefer throwing/logging over a
  silent literal.
- **L-3 · `transcript_ref` accepted, silently dropped.** `api/hooks/mister/route.ts:51-53`
  validates `transcript_ref` but never persists it (no column). Documented, but a
  future integrator may assume it's stored. Either persist it or reject it.
- **L-4 · Unbounded / N+1 reads.** `pipeline.ts:449-454` (`listRfqs` fetches the
  whole lane roster, no cursor — acknowledged) and `pipeline.ts:619-636`
  (`upsertLines` per-line query loop). Fine at v1 CRM volume; revisit if a lane's
  open-RFQ or line count grows large.

---

## DoD checklist — module-by-module verdict

| DoD item | catalog | pipeline | containers | signals | intelligence | admin |
|---|---|---|---|---|---|---|
| Server action: auth → Zod → RLS | PASS | PASS | PASS | PASS (reads) | PASS | pending |
| No permission logic only in React | PASS | PASS | PASS | PASS | PASS | pending |
| `.schema('tower')` on service reads | PASS | n/a | n/a | PASS | PASS | pending |
| Archetype-config, no hardcoded stages/units | PASS | PASS | PASS | PASS | PASS | pending |
| Money = integer minor units | n/a | PASS | PASS | PASS (bps) | n/a | pending |
| Tenant isolation (wings vs aladin) | PASS | PASS | PASS | PASS | **H-1 risk** | pending |
| Keyboard + ⌘K reachable | modules only (M-3) | modules only | modules only | modules only | modules only | pending |
| Charts read rollups, never raw events | n/a | n/a | n/a | PASS | n/a | n/a |
| Wholesale-language lint (ES/EN) | PASS | PASS | PASS | PASS | PASS | PASS |
| Error hygiene (no raw errors) | PASS | PASS | PASS | PASS | PASS | pending |
| Audit trigger on mutations | verify DB | verify DB | verify DB | n/a | verify DB (D-22 attached) | pending |
| RLS tested w/ non-admin fixture | D-08 (Wave 1) | verify DB | verify DB | verify DB | verify DB | pending |

Notes on the greens:
- **Wholesale-language lint clean.** The only retail-vocab hit across all ES/EN
  copy is a comment in `lib/ai/prompts.ts:4` *instructing the model never to use*
  "cart/checkout/buy" — the opposite of a violation.
- **Charts read rollups.** `signals.ts` reads only `metric_rollups_daily`
  (`ROLLUP_VIEW`, lane-filtered) and never `tower.events` (`signals.ts:20-21,323-337`).
- **Archetype config is the single source of truth** (`lib/archetypes/config.ts`),
  parsed through `archetypeConfigSchema` at load; the triage route resolves the
  first stage from it (`triage/route.ts:62`) rather than hardcoding.

## BUILD_PROMPT overall-DoD items unverifiable from code (→ Conductor / DB)

- **Seed data.** BUILD_PROMPT requires: brands (wings, **aladin**), lanes
  **WGT/01–06** with archetypes, **3 demo products per active lane**, **one SHARED
  container on WGT/01 with two commitments**, **one demo RFQ per archetype**.
  DECISIONS.log only evidences 99 real Wings/WGT-01 products (D-09) and 6 spec
  schemas (D-12). The aladin brand, WGT/02–06 rows, per-lane demo products, the
  shared container + 2 commitments, and per-archetype demo RFQs are **not
  evidenced** — verify against the DB.
- **End-to-end acceptance flow** (draft → submit → publish → public snapshot →
  ingested event in Signal Deck → Mister hook → RFQ → order → container fill).
  Each leg exists in code and has unit coverage; the wired end-to-end run needs a
  live session + the Verifier's browser gate (per D-14/D-19/D-26 these were left to
  the Verifier).

## Conductor resolutions (Wave 5 synthesis, 2026-07-07)

- **H-1 — RESOLVED, no leak.** `lanes_read` (migration 8) scopes SELECT to
  `is_group_admin() OR` an own-lane membership, so the triage candidate list is
  RLS-scoped by construction. Proven by extending the RLS fixture with two
  lane-enumeration assertions (non-admin cannot see other-brand lanes) — green.
- **H-2 — RESOLVED.** All applied migrations (tower_01…tower_20) exported from
  `supabase_migrations.schema_migrations` into `supabase/migrations/` with
  DB-matched version stamps. The `tower` schema is rebuildable from the repo.
- **H-3 — still open.** PostgREST `tower` exposure remains the top deploy gate
  (human dashboard action; see HANDOVER §4.1).
- **M-3 — partially closed.** Wave 5 wired admin destinations/actions into ⌘K;
  record-jumps (product/account/container) and publish/new-RFQ actions remain stubs.
- **M-4 — RESOLVED.** Admin module shipped (W5.A + W5.B).
- **Advisors run:** security — zero new criticals; performance — six
  `auth_rls_initplan` WARNs fixed (migration 17), isolation re-proven via fixture.
- **Audit triggers:** verified present on every mutating `tower` table; absent only
  on `audit_log` + events partitions (correct) and `webhook_deliveries`
  (deliberate, events-style telemetry — see wave5-webhooks.sql F1).
- **Seeds:** gaps confirmed and closed via migration 19 (`tower_19_seed_demo`).
- **M-1, M-2, L-1…L-4** remain open — tracked in HANDOVER §5. Delegated item 2
  (extended per-table RLS fixture beyond products + lanes) also remains open.

## DB-level verifications delegated to the Conductor

1. **H-1 blocker:** is `tower.lanes` SELECT-able by a non-admin user outside their
   brand? (RLS policy read on `lanes`.) If yes → H-1 is a live cross-tenant leak.
2. **RLS live tests** for every domain table with a non-admin membership fixture
   (catalog was proven in D-08; pipeline/containers/intelligence/signals were
   asserted in code but need the fixture run): confirm cross-lane AND cross-brand
   (wings vs aladin) isolation on `rfqs`, `quotes`, `orders`, `containers`,
   `container_commitments`, `purchase_orders`, `qc_checks`, `trade_documents`,
   `landed_costs`, `ai_drafts`, `whatsapp_messages`.
3. **Audit triggers** present on every mutating `tower` table (D-22 confirms
   `ai_drafts`; verify the rest, especially the Wave-3 container tables and quotes/
   orders).
4. **Service-role isolation** on analytics: `tower.events` (+ partitions) and
   `metric_rollups_daily` deny `authenticated` (D-04); confirm live.
5. **Applied migration export** (H-2): `list_migrations` → commit the real set.
6. **`get_advisors`** (security + performance) per BUILD_PROMPT Wave-5 — fix all
   criticals (not runnable by this reviewer; no Supabase access).
7. **Seed rows** per the list above.
