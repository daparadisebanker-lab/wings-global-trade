# 01 · Brand Management + Tenancy

**Program:** Represented-Brands Console (TOWER, «Marcas Representadas» module)
**Status:** QUEUED spec — not active law. Build only when explicitly told to start this program.
**Extends, never re-creates:** `supabase/migrations/20260710120000_rb_wave1.sql` (shipped to prod) and the TOWER admin/catalog blocks under `apps/tower/src/`.

> Grounding rule: every table, column, function, action, and component named below **already exists** in the shipped code unless it is explicitly marked `NEW`. New DB objects arrive via an additive migration (proposed here, not applied — same discipline as `admin.ts:20-21` pointing at `programs/tower/migration/wave5-admin.sql`). The shipped `rb_wave1` objects are never altered destructively — **RB/xx codes are append-only** (`rb_wave1.sql:25`).

---

## What

The RB console is the TOWER write-side that the site's read-only `/marcas` shelf projects. It does four things, each a re-point of an existing TOWER block rather than a new build:

1. **Add / upload a brand** — mint an append-only `RB/xx` code, seed the tenant row in `tower.represented_brands` (`rb_wave1.sql:23-36`), then intake the identity kit (the `--rb-*` token contract + logo + photography) into `identity jsonb`.
2. **Retire a brand** — never a delete. A brand moves along its shipped 8-state `status` enum to `PAUSED` (reinstatable) or `ENDED` (terminal). The code and every allocation row survive (`ON DELETE CASCADE` is never triggered because rows are never deleted). Same append-only spirit as `BrandManager`'s "retire, never delete" (`BrandManager.tsx:5-7`, `admin-logic.ts:56-61`).
3. **The `--rb-*` token contract intake** — a «Kit de marca» checklist that writes the fixed token set (`accent`, `accent-ink`, `accent-2`, `ink`, `surface-tint`) + `logo` + `photography` into `identity jsonb`, validates contrast + hue, and only then sets `kit_complete` (`rb_wave1.sql:32`). `kit_complete` is a structural **publish block**, not a label.
4. **Multi-rep tenancy** — a rep who manages a hygiene brand (RB/01 Áladín) and a rep who manages a food brand each see and list **only their own brand**. This is `NEW`: RB tables ship RLS-enabled with **zero policies = deny-all** (`rb_wave1.sql:97-102`), and there is no membership table scoping a user to a `represented_brand`. We add `tower.rb_memberships` + a `has_rb_role()` predicate mirroring `tower.has_lane_role` (`tower_01_identity_access.sql:44-48`), then RLS policies keyed on `represented_brand_id`.

**TOWER law honored throughout:** money is integer-minor + bps (`cost_calculations.landed_minor bigint`, `costing_config.igv_bps int` — `tower_23_costing.sql:16,42`); every mutation is **auth → Zod → RLS via `has_*_role`** (`admin.ts:91` group-admin gate; `pipeline.ts:302` `requireUser`; `tower_23_costing.sql:81-89` policies); tables are append-only with an audit trigger (`tower.audit_trigger()`, `tower_23_costing.sql:71-76`); **TOWER writes, site reads** through the three `public.rb_public_*` views only (`rb_wave1.sql:181-238`); components consume semantic tokens only (root Directive 3).

Nothing about a brand is wired — no products, no templates, no shelf row, no Mister pack — **until it has a code and a validated kit** (SPEC §3.1). That gate is what makes brand N+1 mechanical.

---

## Data model deltas (SQL)

Proposed additive migration `tower_25_rb_console.sql` (naming continues from the shipped `tower_24_costing_config_seed.sql`, which ships alongside `tower_23_costing.sql`; `tower_24` is taken, so this proposal is `tower_25` — per the extension guidance, "add missing columns/objects via new migrations, never alter the shipped ones"). It adds **tenancy + audit only** — it does not touch the seven shipped RB objects.

### 25.1 · Multi-rep membership table (`NEW`)

Mirror of `tower.lane_memberships` (`tower_01_identity_access.sql:32-38`), scoped to a `represented_brand` instead of a `lane`. A rep is granted to a brand, not to a category — so a rep of a food brand and a rep of a hygiene brand are simply two rows pointing at two different `represented_brand_id`s.

```sql
-- tower_25_rb_console.sql · Represented-brand tenancy + audit
set search_path to tower;

create table if not exists rb_memberships (
  user_id              uuid not null references profiles(id) on delete cascade,
  represented_brand_id uuid not null references represented_brands(id) on delete cascade,
  role text not null check (role in ('BRAND_MANAGER','BRAND_OPS','BRAND_VIEWER')),
  primary key (user_id, represented_brand_id, role)
);
create index if not exists rb_memberships_brand_idx on rb_memberships (represented_brand_id);

-- RLS is mandatory here: tower_11's default privileges grant authenticated
-- select/insert/update on every future tower table, and tower is PostgREST-exposed
-- (tower_21) — so without policies any logged-in staff user could POST themselves a
-- ('BRAND_MANAGER', any_brand) row and pass has_rb_role everywhere. Mirror the
-- shipped lane_memberships guard (tower_08_rls_policies.sql:38-40): read own-or-admin,
-- write admin-only. DELETE policy is required too — setRepresentedBrandMemberships
-- does real row deletes (memberships are not append-only).
alter table rb_memberships enable row level security;
create policy rb_memberships_read on rb_memberships for select
  using ( user_id = auth.uid() or is_group_admin() );
create policy rb_memberships_admin_ins on rb_memberships for insert
  with check ( is_group_admin() );
create policy rb_memberships_admin_upd on rb_memberships for update
  using ( is_group_admin() ) with check ( is_group_admin() );
create policy rb_memberships_admin_del on rb_memberships for delete
  using ( is_group_admin() );
```

Three roles (deliberately fewer than the five lane roles — an RB tenant has no catalog-editor/trade-ops split at launch): `BRAND_MANAGER` (the rep who owns the mandate; edit + publish), `BRAND_OPS` (packing/container ops; edit, no publish), `BRAND_VIEWER` (read). Group admin (`profiles.is_group_admin`) is above all of them and is **never** an rb role — identical to how group-admin sits outside `lane_memberships` (`admin-logic.ts:14-15`).

### 25.2 · The scoping predicate (`NEW`) — exact shape of `has_lane_role`

```sql
create or replace function has_rb_role(p_brand uuid, p_roles text[]) returns boolean
language sql stable security definer set search_path = tower, public as
$$ select is_group_admin() or exists (
     select 1 from rb_memberships m
     where m.user_id = auth.uid()
       and m.represented_brand_id = p_brand
       and m.role = any(p_roles)) $$;
```

Byte-for-byte the structure of `tower.has_lane_role` (`tower_01_identity_access.sql:44-48`) with `lane_memberships`→`rb_memberships` and `lane_id`→`represented_brand_id`. It reuses the shipped `tower.is_group_admin()` (`tower_01:40-42`) so a group admin transparently passes every brand.

### 25.3 · RLS policies — turn deny-all into per-tenant scoping (`NEW`)

The shipped migration enabled RLS on all five RB tables with **zero policies** (`rb_wave1.sql:97-102`), which is correct deny-all for the site's service-role path. We now add policies so an *authenticated rep* (the TOWER console, `requireUser` RLS client) sees exactly one brand's rows. Service-role bypasses RLS entirely, so the site's `public.rb_public_*` reads and the `public.rb_reserve` wrapper are **unaffected** (they never went through these policies).

Per-command policies (no `for all`), matching the shipped house style (`tower_23_costing.sql` uses explicit `for select`/`for insert`/`for update`) and the append-only law: **no DELETE policy is created on any domain table**, so the `authenticated` role cannot delete brand/kit/template/container/allocation rows even though the `for all` shorthand would have silently permitted it. Column-privilege gate on `represented_brands`: `status` and `kit_complete` are the two fields the whole publish gate turns on — they are moved out of reach of the RLS `authenticated` path entirely and left to the service-role writer (`setRepresentedBrandStatus` / the `saveBrandKit` validator). RLS alone can't express "row-updatable except these two columns", so this is a column-level `revoke`; without it a `BRAND_MANAGER` could `PATCH status=LIVE` or `kit_complete=true` straight through PostgREST, bypassing `canTransitionRbStatus` and the kit validators (which live only in TS).

```sql
-- represented_brands: reps may update identity/content/mandate/categories only.
-- status + kit_complete are the publish gate — revoke them from the authenticated
-- path so ONLY the service-role writer (setRepresentedBrandStatus / the saveBrandKit
-- validator) can move them. tower_11 granted column-wide update to authenticated;
-- narrow it back for these two columns.
revoke update (status, kit_complete) on represented_brands from authenticated;

create policy rb_brands_read on represented_brands for select
  using ( has_rb_role(id, array['BRAND_MANAGER','BRAND_OPS','BRAND_VIEWER']) );
create policy rb_brands_upd on represented_brands for update
  using ( has_rb_role(id, array['BRAND_MANAGER']) )
  with check ( has_rb_role(id, array['BRAND_MANAGER']) );
-- (no insert policy: brand creation is group-admin, service-role only; no delete policy: append-only)

-- packing profiles / templates / containers: scope by represented_brand_id.
-- Split select/insert/update explicitly; no delete policy (append-only).
create policy rb_profiles_read on rb_packing_profiles for select
  using ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS','BRAND_VIEWER']) );
create policy rb_profiles_ins on rb_packing_profiles for insert
  with check ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) );
create policy rb_profiles_upd on rb_packing_profiles for update
  using ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) )
  with check ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) );

create policy rb_templates_read on rb_container_templates for select
  using ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS','BRAND_VIEWER']) );
create policy rb_templates_ins on rb_container_templates for insert
  with check ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) );
create policy rb_templates_upd on rb_container_templates for update
  using ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) )
  with check ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) );

create policy rb_containers_read on rb_containers for select
  using ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS','BRAND_VIEWER']) );
create policy rb_containers_ins on rb_containers for insert
  with check ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) );
create policy rb_containers_upd on rb_containers for update
  using ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) )
  with check ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) );

-- allocations: no represented_brand_id column — resolve the brand through the container
create policy rb_alloc_read on rb_slot_allocations for select
  using ( exists (select 1 from rb_containers c where c.id = rb_container_id
          and has_rb_role(c.represented_brand_id,
                          array['BRAND_MANAGER','BRAND_OPS','BRAND_VIEWER'])) );
```

The allocation read policy is the same join-through-parent shape the shipped costing migration uses for `prorrateo_items` (`tower_23_costing.sql:92-94`). Writes to allocations stay exclusively on the `rb_reserve` path (§ below); no per-user insert policy is added, so a rep can *see* their fill ledger but the atomic subtraction rule remains the only writer.

> Net tenancy result: `select * from tower.represented_brands` under a rep's RLS client returns **only their brand**. A hygiene rep never sees the food brand and vice-versa — enforced in the database, not in TypeScript. Row scoping is RLS; the two publish-gate columns (`status`, `kit_complete`) are additionally held by a column-level `revoke` so only the service-role writer moves them — **both are DB-level gates, and neither is a TS `if (role === …)` branch** (law comments `pipeline.ts:7-10`, `catalog.ts:6-8`). The validators (`canTransitionRbStatus`, the kit contrast/hue checks) that decide *when* the service role writes those columns still live in TS, so the column-revoke is what makes the DB refuse a direct PostgREST write that would bypass them.

### 25.4 · Audit triggers (`NEW`) — close the append-only gap

The shipped RB tables have **no audit trigger** (they were data-core only). Attach the existing `tower.audit_trigger()` so every brand/kit/template/container/allocation mutation lands in the audit log, matching every other TOWER table (`tower_23_costing.sql:71-76`).

```sql
create trigger audit_represented_brands after insert or update or delete
  on represented_brands for each row execute function tower.audit_trigger();
create trigger audit_rb_packing_profiles after insert or update or delete
  on rb_packing_profiles for each row execute function tower.audit_trigger();
create trigger audit_rb_container_templates after insert or update or delete
  on rb_container_templates for each row execute function tower.audit_trigger();
create trigger audit_rb_containers after insert or update or delete
  on rb_containers for each row execute function tower.audit_trigger();
create trigger audit_rb_slot_allocations after insert or update or delete
  on rb_slot_allocations for each row execute function tower.audit_trigger();
```

### 25.5 · Public brand view — emit identity for the shelf read-path (`NEW`)

The shipped `public.rb_public_brands` exposes only `code, slug, name, categories` (`rb_wave1.sql:181-184`) and has **no loader in `apps/site/src/lib/rb/data.ts`** (declared in the header comment `data.ts:3`, Gap §5 in the site map) — so brand tokens/logos/hero are still fixture-only (`lib/rb/fixtures.ts`). Widen the view (a view replace is additive to the schema and is the *only* place the `--rb-*` contract crosses into `public`).

Note the shipped schema splits `mandate` and `content` into **two** columns: `mandate jsonb` carries territory, scope, exclusivity, and **document refs** (`rb_wave1.sql:30`); `content jsonb` carries about/story blocks (`rb_wave1.sql:33`). The shelf fixture this view must replace (`RbPublicBrand`) needs `territory` + `mandateScope[]`, which live in `mandate` — so the view must emit a **public-safe projection of `mandate`** (territory, scope, exclusivity only) and must **not** expose the raw column, since it holds private document refs. Emit `content` whole (about/story is public copy):

```sql
create or replace view public.rb_public_brands as
select b.code, b.slug, b.name, b.categories,
       b.identity,   -- the --rb-* token contract + logo + photography manifest
       -- public-safe mandate projection: territory/scope/exclusivity only, never doc refs
       jsonb_build_object(
         'territory',   b.mandate -> 'territory',
         'scope',       b.mandate -> 'scope',
         'exclusivity', b.mandate -> 'exclusivity'
       ) as mandate_public,
       b.content     -- about/story blocks, ES+EN
from tower.represented_brands b
where b.status = 'LIVE';
grant select on public.rb_public_brands to service_role;
```

`status = 'LIVE'` is unchanged — publishing a brand to the shelf is still exactly "flip status to LIVE" (§ Public sync). No new base column is added; `identity`, `mandate`, `content` are the shipped jsonb columns (`rb_wave1.sql:30,31,33`). Without the `mandate_public` projection the identity-sync seam stays open for `territory`/`mandateScope`.

### 25.6 · What is deliberately NOT added here

- **No money columns on `rb_slot_allocations`.** SPEC's `account_id`/`order_id` were dropped from the shipped table (site map §6.8); RB commercial money rides the pipeline spine (`convertToOrder` at `pipeline.ts:808`, server-side money math `composeQuote:697`) where all totals are already integer-minor + bps. When RB money lands it is a `*_minor bigint` / `*_bps int` column on the order, never a float on the allocation.
- **No new `identity` sub-schema table.** The `--rb-*` contract is a fixed key set validated in application code (§ Server actions) and stored in the shipped `identity jsonb` — same pattern as `lanes.config` carrying archetype/scope (`admin.ts:369`).
- **No alteration** of the shipped `rb_reserve` / `rb_slots_taken` / three views' core columns (Fixture rule, site map §6).

---

## Server actions (API)

All new actions live in `apps/tower/src/lib/actions/represented-brands.ts` (`NEW`), modeled 1:1 on `admin.ts`. Two auth gates, chosen per the tables a given action touches:

- **`requireGroupAdmin()`** (`admin.ts:91`) — for the *tenant registry* operations (create brand, mint code, grant memberships). `represented_brands` is a cross-tenant identity table with no single brand scope to gate a *creation* by — identical rationale to `admin.ts:8-21` for `brands`/`lanes`. Reads `profiles.is_group_admin` via the RLS client, then writes with the service-role client.
- **`requireUser()`** (`pipeline.ts:302`) — for *brand-scoped* operations (edit kit, packing profiles, templates, containers, list "my brands"). The RLS client + the §25.3 policies do the scoping; the action **never** branches on role. This is how a rep is confined to their own brand.

Every action is **auth → Zod → (RLS or service-write)**, returning the shared `ActionResult<T>` (`result.ts`).

### Registry / tenancy actions (group-admin gated)

| Action | Models on | Behavior |
|---|---|---|
| `registerRepresentedBrand(input)` `NEW` | `admin.registerLane` (`admin.ts:342`) + `admin.createBrand` (`admin.ts:468`) | Zod-validate `{ name, slug?, categories[] }`. Read all `represented_brands.code`, mint the next code with **`nextLaneCode(existingCodes, 'RB')`** — the shipped minter's regex `^([A-Z]{2,5})\/(\d+)$` already matches `RB/01` (`admin-logic.ts:68,97-104`), so `RB` prefix yields `RB/01, RB/02, …`, append-only, never reused. Insert row at `status='PROSPECT'`, `kit_complete=false`. **Emit a PR-able one-liner for the `packages/liveries/registry.md` `## Represented brands` section — a server action cannot write a repo file, so ops pastes/merges it; the DB `unique` constraint on `code` is the real guard** (SPEC §3.1a/§3.1d(2)). Service-role write. |
| `listRepresentedBrands()` | `admin.listBrands` (`admin.ts:210`) **but `requireUser`, not group-admin** | The tenancy read. Under a rep's RLS client the §25.3 `rb_brands_read` policy returns **only brands they hold a membership on**; a group admin sees all. This single swap (RLS client instead of service-role) is what makes "sees/lists only their own brand" true. |
| `setRepresentedBrandMemberships(userId, desired)` `NEW` | `admin.setMemberships` (`admin.ts:280`) + `diffMemberships` (`admin-logic.ts:126`) | Replace a user's `(represented_brand_id, role)` set with the grid's desired set; minimal add/remove; real row deletes (memberships are not append-only, `admin-logic.ts:108-113`). Group-admin gated. |
| `setRepresentedBrandStatus(brandId, to)` `NEW` | `admin.setBrandStatus` (`admin.ts:499`) + `canTransition*` guard | The **retire path**. Zod-enum against the shipped 8-state check (`rb_wave1.sql:28-29`); a `canTransitionRbStatus(from,to,{kitComplete})` `NEW` guard (in a new `represented-brands-logic.ts`, mirroring `admin-logic.ts:59`) permits forward moves + the reinstatable `PAUSED↔LIVE`, rejects no-ops and any move out of terminal `ENDED`. **Retire = flip to `PAUSED` or `ENDED`; never delete.** Per SPEC §3.1b the kit gate fires **before status can leave `ONBOARDING`**, not only at the `→ LIVE` flip: the guard blocks `ONBOARDING → BRAND_REVIEW` (and any later state) unless `kit_complete`, so `BRAND_REVIEW` never holds an unvalidated kit. Publishing to LIVE remains blocked unless `kit_complete` as well (see gate). |

### Brand-scoped actions (`requireUser`, RLS-scoped)

| Action | Models on | Behavior |
|---|---|---|
| `saveBrandKit(brandId, kit)` `NEW` | `MediaManager` upload (`MediaManager.tsx:26`) + `admin` update pattern | The `--rb-*` contract intake. Zod schema (below) validates the **five** token keys + logo slots + source-tagged photography + docs; runs the contrast + hue + `surface-tint ≤4%` validators; writes the manifest into `identity jsonb` and sets `kit_complete` **only if the validators pass** — `kit_complete` is never set by hand (`rb_wave1.sql:32`). Service-role write of `kit_complete` (the column is revoked from the `authenticated` path, §25.3); the rep-facing `identity` fields go through RLS as `BRAND_MANAGER`. |
| `saveRbPackingProfile(brandId, profile)` `NEW` | `catalog.createProduct/updateProduct` (`catalog.ts:364,420`) | Upsert into `rb_packing_profiles` (3-level packing: `packets_per_package × units_per_package`, `rb_wave1.sql:45-47`). RLS `rb_profiles_write`. |
| `saveRbTemplate` / `saveRbContainer` `NEW` | `containers.ts` block | Draft/publish the immutable geometry (`rb_container_templates.status DRAFT→PUBLISHED→RETIRED`, `rb_wave1.sql:65`) and open containers. RLS `rb_templates_write` / `rb_containers_write`. |
| **Slot reservation** | **reuse verbatim** | Never reimplement. The only shipped allocation write is `public.rb_reserve` (`rb_wave1.sql:218-230`) — an insert-via-reserve; the atomic subtraction (`rb_slots_taken`, `rb_wave1.sql:109-121`) is canonical and lives in exactly one place. The console **re-mounts that reserve path** via the site's `reserveRbSlots` (`data.ts:140`). **Status transitions on allocations (`RESERVED → CONFIRMED / LOADED / RELEASED`) have no shipped function** (site map §3/§6.4) — a console confirm/release flow is `NEW` and is **deferred to chapter 03**, not built here. |

### The `--rb-*` token contract (Zod)

The schema mirrors the **full** §3.1b kit table — five tokens (not six), source-tagged imagery with SPEC's minimums (hero ≥3, about ≥2), the `surface-tint ≤4%` rule, and the **Docs slot** (mandate letter + brand usage manual, each with a public-copy flag — the usage manual is the mandated source of the color values, §8.2):

```ts
// represented-brands-logic.ts (NEW) — pure, testable, no Supabase
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/)   // no raw values leak past validation
const source = z.enum(['brand_supplied', 'wings_studio'])   // §8.7 authenticity tag; no untagged media renders
const image = z.object({ path: z.string(), source })
const doc   = z.object({ path: z.string(), publicCopy: z.boolean() })   // §3.1b Docs slot public-copy flag

export const rbKitSchema = z.object({
  tokens: z.object({          // FIVE keys — the §2.5 --rb-* contract, no sixth
    accent:        hex,   // the cargo's premium material signal
    'accent-ink':  hex,   // paired text-on-accent (must pass 4.5:1)
    'accent-2':    hex,
    ink:           hex,   // derived from ground temperature
    'surface-tint':hex,   // brand tint over the pure-white (brands) ground; ≤4% (checked in validator, not Zod)
  }),
  logo: z.object({ isologo: z.string(), positivo: z.string(),
                   isotipo: z.string(), sello: z.string() }),   // Storage paths, rb/{code}/…
  photography: z.object({
    hero:  z.array(image).min(3),   // §3.1b hero set ≥3
    about: z.array(image).min(2),   // §3.1b about set ≥2
  }),
  docs: z.object({
    mandateLetter: doc,   // §3.1b Docs slot
    usageManual:   doc,   // the mandated source of the color row (§8.2)
  }),
})
```

`accent-ink` exists precisely because root Phase-2 rule 3 requires an `--accent-ink` pair when the accent can't guarantee 4.5:1. Zod covers shape/tags/minimums; the numeric gates (`accent-ink` 4.5:1 contrast, hue-separation, `surface-tint ≤4%` per the §3.1b table) run in the same `represented-brands-logic.ts` validators and, like `kit_complete`, are what gate publish. The `logo` slot names mirror the fixture shape already consumed by the shelf (`fixtures.ts` `logo{isologo,positivo,isotipo,sello}`, site map §6). Kit assets upload through the **existing** `MediaManager` signed-URL pipeline (`MediaManager.tsx:11,26`) to `rb/{code}/…`, extending the `buildMediaStoragePath` convention (`catalog-logic.ts:166-176`) — a `buildRbKitStoragePath` `NEW` sibling keyed on the brand code.

> **AI-assisted kit assembly (SPEC §3.1d) is out of scope for this chapter, by design.** SPEC is explicit that "manual kit assembly is the fallback, not the workflow": the normal path is the `RB_KIT` draft kind on `tower.ai_drafts` (a server compiler proposes every §3.1b slot with per-slot confidence, ops approves slot-by-slot, approval writes the same `identity` manifest the manual `saveBrandKit` writes). This chapter builds only the **manual fallback** path and the validators/gate it feeds; the `RB_KIT` compiler, its enum value, and the drafts wiring are **deferred to a later console chapter**. The seam is intentional — both paths terminate at the identical `identity`-jsonb + `kit_complete` validator, so adding the AI path later re-points nothing here.

### Capability derivation (hide-not-enforce)

`computeRbCapabilities(roles: RbRole[], isGroupAdmin, kitComplete)` `NEW`, modeled on `computeCapabilities` (`catalog-logic.ts:50`) and derived from `DbLaneRole`-style uppercase roles — **never** from `rbac.ts`'s mistyped lowercase `Role` (the reconciliation flag at `catalog-logic.ts:11-18`). It extends `ProductCapabilities` with `canPublishBrand: isGroupAdmin || (isManager && kitComplete)`. This drives **UI hiding only** — the publish button literally does not enable while `kit_complete=false` (SPEC §3.1c wiring gate), exactly as `PublishBar`'s `showPublish` hides on capability (`PublishBar.tsx:37`). The real gate is at the DB: the §25.3 column-`revoke` on `status`/`kit_complete` plus the service-role `saveBrandKit` validator and `canTransitionRbStatus` — a hidden button is convenience, not enforcement.

---

## Console UI (component tree)

New module `marcas` added as the **eighth** entry on the existing seven-module rail (`ALL_MODULES` ships `['catalog','pipeline','containers','costing','signals','intelligence','admin']` — `rbac.ts:16`). Reuse first, fork never (site map "No forked components"):

```
lib/nav.ts            → add { id:'marcas', href:'/marcas', label:{es:'Marcas',en:'Brands'}, tag:'MRC' }
                        to MODULES (nav.ts:23) and 'marcas' to ModuleId union (nav.ts:6-13)
lib/rbac.ts           → add 'marcas' to ALL_MODULES (rbac.ts:16) + relevant ROLE_MODULES rows;
                        visibleModules (rbac.ts:31) unchanged. Presentation-only (rbac.ts:2-6).

app/(shell)/marcas/
├─ RepresentedBrandManager      (NEW; = BrandManager re-pointed at represented_brands)
│   ├─ reuses create-form + status table + retire/reinstate scaffolding verbatim
│   │   (BrandManager.tsx:33 submitCreate, :48 flipStatus, :27 invalidate)
│   ├─ create-form → registerRepresentedBrand (mints RB/xx, shows code preview)
│   ├─ status table → RB/xx · slug · name · <RbStatusChip> · Retirar/Reactivar
│   │   (BrandManager.tsx:130-151 pattern; RETIRED→ PAUSED/ENDED per the shipped status enum, §25.3)
│   └─ useRepresentedBrandsQuery  (NEW; sibling of useAdminBrandsQuery.ts:9, same TanStack shape)
│
├─ BrandKitPanel                 (NEW «Kit de marca»)
│   ├─ RbTokenContractForm       (NEW; five --rb-* swatch inputs + accent-ink pair)
│   │   └─ live contrast + hue-adjacency read-out (validators from represented-brands-logic)
│   ├─ MediaManager              (REUSE MediaManager.tsx:11 → uploads to rb/{code}/)
│   ├─ KitCompletenessMeter      (NEW; drives kit_complete preview → gates publish)
│   └─ saveBrandKit action
│
├─ RepMembershipMatrix          (NEW; = UserManager membership grid re-pointed at rb_memberships)
│   └─ setRepresentedBrandMemberships  (rows scoped by RLS — a rep only appears against their brand)
│
├─ PackingProfileEditor / TemplateWorksheet / ContainerBoard  (NEW; reuse ProductEditor
│   :68 · SpecForm :50 · PublishBar :14 — RB data through props only, no fork)
│   └─ FillMeter (@wings/trade-ui) + ContainerSliceDiagram (features/shared) preview the cupo ledger
│
└─ SlotAllocationGrid            (NEW; read-only view of rb_slot_allocations via rb_alloc_read.
                                  reserve = public.rb_reserve, reused. Confirm/release row actions
                                  have NO shipped function — deferred to chapter 03, not built here)
```

`PublishBar` (`PublishBar.tsx:14`) renders unchanged for both the brand-LIVE flip and the template-PUBLISHED flip; its `showPublish` capability-hide (`:36-38`) is fed `canPublishBrand`, so the publish control is invisible until the kit validates. `RbStatusChip` extends the existing `StatusChip`/`BrandStatusChip` (`BrandManager.tsx:13`).

---

## Public sync (TOWER writes → site reads)

The shelf is a read-only projection; publishing is a **status flip**, and the three shipped `public.rb_public_*` views are the entire contract (`rb_wave1.sql:181-238`). What each write moves:

| Console write | View that reprojects it | Site read-path |
|---|---|---|
| Brand `status → 'LIVE'` (via `setRepresentedBrandStatus`, gated on `kit_complete`) | `public.rb_public_brands` — now also emits `identity` (--rb-* tokens) + `mandate_public` (territory/scope, no doc refs) + `content` (§25.5) | **Wire `getRbBrands` loader in `data.ts`** (`NEW`; the declared-but-unwired view, `data.ts:3` / site map §5). `marcas/[brand]/layout.tsx:27` then reads `[data-brand]` tokens from the view instead of `fixtures.ts` — closes the identity sync seam (`fixtures.ts:2-6`, `productos/page.tsx:33`). |
| Template `status → 'PUBLISHED'` | `public.rb_public_templates` (`rb_wave1.sql:186-195`) | `getRbTemplateForBrand` / `getRbTemplateByRef` (`data.ts:83,96`) — configurator geometry. |
| Container open + reservations (via `rb_reserve`) | `public.rb_public_containers` — live `total/committed/reserved` triple (`rb_wave1.sql:197-213`) | `getRbContainers` (`data.ts:108`); FillMeter + SlotGrid; **ISR `revalidate = 60`** so "quedan N" never goes stale (site map §3). |
| Any brand/template publish | (trigger) | Mister `rb-{slug}` pack **auto-compiles from the same views** (`misterPack.ts:32`) — availability enters as structure only, never a number (`misterPack.ts:5-8`). Zero manual pack authoring; shelf and Mister can't disagree. |

Sync invariants (stated correctly — the `rb_wave1.sql:17-18` header comment "the tower schema is NOT PostgREST-exposed" is **stale**: `tower_21_postgrest_expose_tower.sql` added `tower` to `pgrst.db_schemas` on 2026-07-07, *before* rb_wave1, and that exposure is exactly what makes the console's own `requireUser` reads (`supabase.schema('tower')`, `pipeline.ts:302` pattern) work). The real layering: **anon** gets nothing; the **site** touches only `public.rb_public_*` + `public.rb_reserve` (service-role); **authenticated TOWER staff** reach `tower.*` through the §25.3 RLS policies. The service-role read path is untouched by the new RLS policies (§25.3). Retiring a brand (`PAUSED`/`ENDED`) drops it from `rb_public_brands` automatically because the view filters `status='LIVE'` — no delete, no cascade, the row and its allocations persist for the ledger.

---

## Phase-0 gates (publish preconditions — all must hold before `status → LIVE`)

Adapted from the lane Onboarding Protocol Phase-0/Phase-5 gates (root CLAUDE.md §4) to the ALLOCATION archetype. A brand cannot leave `BRAND_REVIEW`/`ONBOARDING` for `LIVE` until:

1. **Code minted & ledgered.** `RB/xx` exists (append-only via `nextLaneCode(_, 'RB')`) and the `registry.md` `## Represented brands` line is written (SPEC §3.1a). Hue-adjacency with lane accents eyeballed in the same ledger.
2. **Kit complete & validated.** `saveBrandKit` set `kit_complete=true` — meaning all five `--rb-*` tokens present, `accent-ink` passes 4.5:1 contrast on the pure-white `(brands)` ground, hue-separation check passed, all four logo slots + ≥1 photography asset uploaded to `rb/{code}/`. `kit_complete=false` structurally disables publish (`computeRbCapabilities`).
3. **Tenancy assigned.** ≥1 `rb_memberships` row with `BRAND_MANAGER` (a brand with no rep can't publish). Verified through the RLS read, not client state.
4. **At least one shippable geometry.** ≥1 `rb_packing_profiles` row and ≥1 `rb_container_templates` at `status='PUBLISHED'` (depth over breadth — the shelf needs real cupo math, not a placeholder). The public template view only projects `PUBLISHED` (`rb_wave1.sql:195`).
5. **Content bilingual.** `content jsonb` has about/story in **ES + EN** (`rb_wave1.sql:33`); mandate terms (territory/scope/exclusivity/doc refs) live in the separate `mandate jsonb` (`rb_wave1.sql:30`), not in `content`.
6. **Mister pack answers.** The auto-compiled `rb-{slug}` pack (`misterPack.ts`) returns the brand's unit-math/availability-shape correctly in a test turn, and its `forbidden_reminder` (no narrated slot numbers) is present (`misterPack.ts:64-65`).
7. **Swap test.** Render this brand's `/marcas/{slug}` with another brand's `--rb-*` tokens — structure must hold (root §5-bis rule 2). If it breaks, someone forked the skeleton.

Gate owner: the `setRepresentedBrandStatus → LIVE` action refuses the transition unless (1)-(2)-(4) are machine-checkable-true; (3),(5),(6),(7) are console-surfaced checklist items on `BrandKitPanel` before the LIVE flip is offered. Same discipline as the lane content launch gate (root §Phase-5).

---

## Reuse ledger (what this chapter does NOT build)

- The subtraction rule (`rb_slots_taken`) and atomic reserve (`rb_reserve`) — **reused verbatim**, never reimplemented (`rb_wave1.sql:109-175`, site map §6 canonical).
- Money math — rides pipeline's server-side integer-minor + bps engine (`composeQuote:697`, `quotation.ts:81 taxFromBps`); RB adds no float, no client total.
- `createBrand`/`brands` — the **pattern** is copied into `represented_brands` actions; `tower.brands` (operating tenant) is **never** overloaded (SPEC §3, `rb_wave1.sql` header, root §5-bis rule 5).
- Components — `BrandManager` / `ProductEditor` / `SpecForm` / `PublishBar` / `MediaManager` / `QuotationDocument` / `CostSheetDocument` are re-pointed through props, never copied.
