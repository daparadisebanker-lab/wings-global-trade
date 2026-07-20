# RB Console · Chapter 03 — Container Availability & Quantities (ALLOCATION archetype)

> Scope: how a rep **lists a container of their product** (draft the immutable
> geometry, then open a live container), how the console **lists new containers
> available with quantities/slots** (`available = total_slots − rb_slots_taken`),
> how quantity↔slot conversion runs **server-side**, and how all of it **syncs to
> the public shelf FillMeter** (TOWER writes, site reads). Grounded entirely in the
> shipped RB core (`supabase/migrations/20260710120000_rb_wave1.sql`), the shipped
> audit spine (`tower_06`/`tower_07`), the site read-model (`apps/site/src/lib/rb/*`),
> and the reuse map. **The migration wins over SPEC §3 proposals** wherever they
> disagree. This chapter builds on Chapter 01's RB memberships + RLS policies (§24.3)
> and Chapter 02's product/packing shelf.
>
> **Non-negotiable reuse boundary:** the slot subtraction (`tower.rb_slots_taken`,
> `rb_wave1.sql:109-121`) and the atomic reservation (`tower.rb_reserve` /
> `public.rb_reserve`, `rb_wave1.sql:125-233`) are **canonical and already shipped**.
> This chapter **never** reimplements slot math — not in a SQL function, not in a
> server action, not in the client. Everything below either *reads through*
> `rb_slots_taken` or *writes through* `rb_reserve`.

---

## 1 · What

An ALLOCATION-archetype brand (root §3, §5-bis) sells **container-only**: a buyer
takes a *slot* (cupo) or a *quantity* that the server rounds up to whole slots. The
geometry that defines a slot is fixed per **template**
(`tower.rb_container_templates`, `rb_wave1.sql:54-67`); the fast-moving fill state
lives per **container** (`tower.rb_containers`, `rb_wave1.sql:69-80`); the ledger of
who holds what is `tower.rb_slot_allocations` (`rb_wave1.sql:82-95`). All three
tables **already exist** — "create" in this chapter means *console CRUD that inserts
rows*, never DDL against shipped columns (append-only law; codes never reshuffle).

Four category-agnostic capabilities the console must add over the shipped core:

1. **A rep lists a container of their product** — (a) draft/publish a template
   (`total_slots`, `packages_per_slot`, `composition`, `governing_bound`), then
   (b) open one or more `rb_containers` rows (route, `closes_at`,
   `public_fill_visible`). Template `DRAFT→PUBLISHED→RETIRED` (`rb_wave1.sql:65`);
   container `OPEN→FILLING→CLOSED→SHIPPED→CANCELLED` (`rb_wave1.sql:76-77`).
2. **List new containers available with quantities/slots** — the ops board shows,
   per open container, `available = total_slots − rb_slots_taken(id)` **plus** the
   derived quantity figures (`units_per_slot`, `available_units`) that the shipped
   schema deliberately does **not** store (backend map §2; `units_per_slot` was
   dropped from the shipped template, so it is *derived*, never persisted).
3. **Quantity↔slot conversion, server-side** — "por cantidad" mode: a unit/packet/
   package count converts **up** to the minimum whole slot count, remainder exposed
   (Costco honesty). This math already exists as the single implementation in
   `apps/site/src/lib/rb/packing.ts` (`slotsForQuantity:36`, `cascadeForSlots:17`);
   the console **reuses those pure functions**, it does not add a second convert.
4. **Public sync to the FillMeter** — every write above reprojects through the three
   shipped `public.rb_public_*` views (`rb_wave1.sql:181-238`); the site polls them
   at 60 s ISR. The console never touches a site surface directly.

**The one thing this chapter settles:** the ledger currently has *no status
transitions and no way to list availability with quantities*. Both are added as
**reads/writes layered over `rb_slots_taken`**, never as new subtraction logic.

---

## 2 · Data model deltas (SQL) — new migration `tower_26_rb_availability` (additive only)

Shipped and therefore **NOT re-created** (backend map §1): `rb_container_templates`
(incl. `total_slots`, `packages_per_slot`), `rb_containers`, `rb_slot_allocations`,
`rb_slots_taken`, `rb_reserve`, and the three public views. What is genuinely
missing (backend map §6 items 4, 5, and the availability read) gets **added**:

> **Migration numbering (append-only).** The shipped tree already carries
> `tower_23_costing` and `tower_24_costing_config_seed`, so `tower_23` is taken.
> Chapter 01 claims `tower_24_rb_console` and Chapter 02 `tower_25_rb_catalog`,
> which makes this chapter **`tower_26`** — the next free integer. Codes never
> reshuffle; if a sibling chapter lands first, this one takes the next free integer.

```sql
-- supabase/migrations/20260721xxxxxx_tower_26_rb_availability.sql
-- Additive only. Nothing shipped is altered destructively (append-only law).
-- Base objects in `tower`, never PostgREST-exposed. Reuses rb_slots_taken +
-- rb_reserve — no new subtraction, no new reservation.
set search_path to tower, public;
```

### 2.1 Ledger status transitions (`NEW`) — the missing lifecycle

Backend map §6.4: `RESERVED→CONFIRMED→LOADED→RELEASED` has **no function** today —
only `rb_reserve`'s insert exists. Availability (§2.3) cannot move from *reserved* to
*committed* without it. This is a **forward-only guarded status update**, not slot
math — `rb_slots_taken` (`rb_wave1.sql:113-119`) already counts `CONFIRMED`/`LOADED`
as taken and drops expired `RESERVED`, so a status flip is the *only* thing needed to
move the ledger; the subtraction stays untouched.

```sql
create or replace function tower.rb_set_allocation_status(
  p_allocation uuid,
  p_to text
) returns tower.rb_slot_allocations
language plpgsql
as $$
declare
  v_row tower.rb_slot_allocations;
begin
  select * into v_row from tower.rb_slot_allocations
    where id = p_allocation for update;          -- row lock, same discipline as rb_reserve
  if not found then raise exception 'RB_ALLOCATION_NOT_FOUND'; end if;

  -- forward-only. The only legal moves: RESERVED→CONFIRMED, RESERVED→RELEASED,
  -- CONFIRMED→LOADED, CONFIRMED→RELEASED. LOADED and RELEASED are terminal
  -- (a LOADED slot is on the boat; RELEASED→RELEASED is rejected). Mirrors the
  -- canTransition* guard law (containers-logic.ts:64) so the ledger can never skip
  -- or reverse a state — audit truth stays monotonic.
  if not (
       (v_row.status = 'RESERVED'  and p_to in ('CONFIRMED','RELEASED'))
    or (v_row.status = 'CONFIRMED' and p_to in ('LOADED','RELEASED'))
  ) then
    raise exception 'RB_INVALID_TRANSITION';       -- string-matched by the action, §3
  end if;

  -- Every legal target here is CONFIRMED, LOADED, or RELEASED — none of which can
  -- expire — so the expiry stamp is always cleared. (p_to='RESERVED' can never pass
  -- the guard above, so there is no branch that preserves expires_at.)
  update tower.rb_slot_allocations
     set status = p_to,
         expires_at = null
   where id = p_allocation
   returning * into v_row;
  return v_row;
end;
$$;
```

Note: no `public.` wrapper. Status transitions are a **TOWER-only** operation
(ops confirms a paid slot); the site never confirms/loads/releases — its only
write is `public.rb_reserve` (backend map §4-§5). The console reaches this through
the RLS `schema('tower')` client (§3), gated by the Chapter 01 §24.3 policies.

### 2.2 Expiry-release job (`NEW`) — ledger hygiene, not correctness

Backend map §6.5 + `rb_wave1.sql:106-107`: a "later TOWER job" should flip expired
`RESERVED`→`RELEASED`. Correctness is *already* preserved (`rb_slots_taken` ignores
expired rows the instant they lapse), so this is **ledger hygiene only** — it stops
stale rows accumulating and makes the ledger read cleanly.

```sql
create or replace function tower.rb_release_expired() returns int
language sql
security definer                                   -- MUST bypass RLS: a cron job runs
set search_path = tower, public                    --  as no rep, and must sweep EVERY
as $$                                              --  brand's expired rows, not one's.
  with released as (
    update tower.rb_slot_allocations
       set status = 'RELEASED'
     where status = 'RESERVED'
       and expires_at is not null and expires_at <= now()
     returning 1
  ) select count(*)::int from released;
$$;

-- Service-role / cron only. Never granted to anon/authenticated — a rep must never
-- trigger a global ledger sweep, and calling it through the RLS client would (absent
-- SECURITY DEFINER) scope the UPDATE to only the caller's own rows, defeating hygiene.
revoke all on function tower.rb_release_expired() from public, anon, authenticated;
grant execute on function tower.rb_release_expired() to service_role;
```

Scheduled via `pg_cron` / the shared n8n instance (SPEC §6 Phase-3), running as
`service_role`. Because it only touches already-expired rows, it can never race a live
reserve — the `total − rb_slots_taken` figure is identical before and after it runs.
There is **no rep-facing console action** for this job (see §3.2): it is a
service-role/cron sweep, not a per-brand button.

### 2.3 Availability read (`NEW`) — one figure, reusing the one subtraction

The console needs `available` **as a single number plus quantities**, which no
shipped surface emits: `rb_public_containers` deliberately exposes `committed_slots`
and `reserved_slots` separately (`rb_wave1.sql:203-212`) and *never* `available`
(site computes it, backend map §4). We add a **TOWER-only** view that (a) reuses
`rb_slots_taken` verbatim — the single subtraction point — and (b) derives the
quantity denorms the schema dropped.

```sql
create or replace view tower.rb_container_availability
  with (security_invoker = true) as               -- runs as the CALLER, so the Ch-01
select                                             --  §24.3 table RLS scopes each rep
  c.id, c.code, c.status, c.route, c.closes_at, c.public_fill_visible,
  c.represented_brand_id, b.slug as brand_slug,
  t.ref as template_ref, t.total_slots, t.packages_per_slot,
  tower.rb_slots_taken(c.id)                       as slots_taken,      -- REUSE, never reinline
  t.total_slots - tower.rb_slots_taken(c.id)       as slots_available,
  -- committed/reserved split — SAME definitions as public.rb_public_containers
  -- (rb_wave1.sql:203-212) so the console can feed the FillMeter the identical
  -- {total, committed, reserved} triple the public shelf renders (§4):
  coalesce((select sum(a.slots) from tower.rb_slot_allocations a
             where a.rb_container_id = c.id
               and a.status in ('CONFIRMED','LOADED')), 0)::int as committed_slots,
  coalesce((select sum(a.slots) from tower.rb_slot_allocations a
             where a.rb_container_id = c.id
               and a.status = 'RESERVED'
               and (a.expires_at is null or a.expires_at > now())), 0)::int as reserved_slots,
  -- derived denorms (units_per_slot NOT stored — backend map §2; first-profile
  -- unit math, same join rule as public.rb_public_templates, rb_wave1.sql:193-194):
  (t.packages_per_slot * p.units_per_package)      as units_per_slot,
  (t.total_slots - tower.rb_slots_taken(c.id))
      * (t.packages_per_slot * p.units_per_package) as units_available,
  p.unit_name_plural
from tower.rb_containers c
join tower.rb_container_templates t on t.id = c.template_id
join tower.represented_brands b     on b.id = c.represented_brand_id
join tower.rb_packing_profiles p
  on p.product_slug = (t.composition -> 0 ->> 'profile_slug');   -- ⚠ first entry only, per shipped view

-- Exposed to the console's RLS client only. Because the view is security_invoker,
-- the SELECT executes with the rep's own privileges, so the Ch-01 §24.3 policies on
-- the underlying tables scope it to the rep's own brand — a plain (owner-rights) view
-- would bypass RLS and leak every brand's fill. Revoked from anon; never on the site path.
revoke all on tower.rb_container_availability from anon;
grant select on tower.rb_container_availability to authenticated, service_role;
```

`slots_available` here is algebraically identical to the site's `total − committed −
reserved` (`packing.ts:50`), because `rb_slots_taken = committed + unexpired
reserved` — one truth, two projections. The `committed_slots`/`reserved_slots` columns
carry the split so the console FillMeter and the public shelf derive from the same
figures. This view is **console-only** (read through the `schema('tower')` RLS client,
scoped by security_invoker + the Ch-01 policies); it is **never** added to the site's
read path. (The site's availability continues to come from `rb_public_containers`.)

### 2.4 Audit + RLS — close the append-only gap on RB tables

The generic `tower.audit_trigger()` (`tower_07:5`) is **not** attached to the RB
tables (its `tbls[]` list, `tower_07:34-38`, predates wave1). Chapter 01 §24.4 opens
this gap for `represented_brands`; this chapter extends the same fix to the
availability tables so every open/close/status-flip is captured:

```sql
do $do$ declare t text;
  tbls text[] := array['rb_container_templates','rb_containers','rb_slot_allocations'];
begin
  foreach t in array tbls loop
    execute format('drop trigger if exists audit_%1$s on tower.%1$I', t);
    execute format(
      'create trigger audit_%1$s after insert or update or delete on tower.%1$I '
      'for each row execute function tower.audit_trigger()', t);
  end loop;
end $do$;
```

RLS: the three tables ship deny-all with zero policies (`rb_wave1.sql:99-101`). The
**write/read policies for the console** are Chapter 01's §24.3 job (membership-scoped
via the RB analogue of `has_lane_role`). `rb_container_templates` and `rb_containers`
carry `represented_brand_id` directly, so their policies key on it. **`rb_slot_allocations`
has no `represented_brand_id`** — only `rb_container_id` (backend map §1) — so its
policy must **join through `tower.rb_containers`** to reach the brand
(`… where rb_container_id in (select id from tower.rb_containers where <brand membership>)`).
This matters because `rb_set_allocation_status` (§2.1) is **not** SECURITY DEFINER:
its status-flip `UPDATE` is gated entirely by that join-through-parent allocation policy
existing. This chapter assumes those policies exist; it adds no new RLS regime.
`rb_slots_taken`, `rb_reserve`, and the site's service-role reads are unaffected (they
bypass RLS by `SECURITY DEFINER` / service key).

### 2.5 What is deliberately NOT added

- **No SQL quantity→slots function.** The conversion is a *pure* function
  (`packing.ts:36`), server-executed in both apps. `rb_reserve` is slot-authoritative
  and stores `quantity_units` verbatim (`rb_wave1.sql:164-166`); a DB convert would be
  a second math source. Reuse the TS function (§3.3).
- **No `units_per_slot` / `utilization_factor` columns.** Dropped from the shipped
  template on purpose (backend map §1). Derived in the view (§2.3) and in `packing.ts`.
- **No new reserve path.** `public.rb_reserve` (`rb_wave1.sql:218-230`) remains the
  sole write-back; the console re-mounts it, never clones it.
- **No `tower.containers` mirror.** Deferred to the TOWER ERP wave (backend map §6.7).

---

## 3 · Server actions (API) — new `apps/tower/src/lib/actions/rb-containers.ts`

Every action follows the shipped mutation law **auth → Zod → (RLS or reused RPC)**,
returning the shared `ActionResult<T>` envelope (`result.ts:32`, `ok()`/`fail()`).
The gate is `requireUser()` (`pipeline.ts:302`): `createServerSupabase` →
`auth.getUser` → `supabase.schema('tower')` — the **RLS-scoped** client. Actions
**never branch on role** (`pipeline.ts:7-10` law); the Chapter 01 §24.3 policies
confine a rep to their own `represented_brand_id`.

### 3.1 The mutation law, mapped to container reality

| Layer | Container/availability instance |
|---|---|
| **auth** | `requireUser()` (`pipeline.ts:302`) for all brand-scoped writes — the *group-admin role* is **not** required (a container belongs to a brand a rep already holds membership on, so RLS scopes template/container/allocation writes; group-admin is only for the tenant registry, Ch 01). The **one exception** is `reserveRbSlots`: `public.rb_reserve` is granted to `service_role` only (`rb_wave1.sql:232-233`), so it borrows the *authorize-then-privileged-act mechanism* of `requireGroupAdmin` (`admin.ts:91`) — `requireUser()` + explicit brand-membership check, **then** the service client — without requiring the group-admin role itself (§3.2). |
| **Zod** | Every input validated before any write. `total_slots`/`packages_per_slot`/`slots` are `z.number().int().positive()`; `governing_bound` is `z.enum(['CBM','KG'])`; status targets are `z.enum([...])` against the shipped checks (`rb_wave1.sql:65,76-77`). **No raw values reach the DB** (token/law parity with the `unitPriceMinor: z.number().int().nonnegative()` shape at `pipeline.ts:295`). |
| **RLS / reused RPC** | Template/container/allocation-status writes go through the `schema('tower')` RLS client — status flips delegate to `rb_set_allocation_status` (RLS-gated, §2.1). **Slot reservation is the exception:** `rb_reserve` is `service_role`-only, so it runs via membership-check-then-service-client (§3.2), never the RLS client. |

**Money law note:** slot counts and quantities are **integers, never money** — no
minor-units, no bps, live in this chapter. When an accepted allocation becomes a
commercial order, that crosses into the pipeline spine (`convertToOrder`,
`pipeline.ts:808`) where the integer-minor + bps money math already lives
(`quotation.ts:81 taxFromBps`, server-recomputed). This chapter emits **zero**
money; it hands slot/quantity counts to that untouched engine.

### 3.2 Actions (each returns `ActionResult<…>`)

| Action | Models on | Behavior |
|---|---|---|
| `saveRbTemplate(input)` `NEW` | `catalog.createProduct/updateProduct` (`catalog.ts:364,420`) + `PublishBar` flow | Zod-validate `{ ref, kind, composition[], total_slots, packages_per_slot, max_packages, governing_bound }`; upsert `rb_container_templates` at `status='DRAFT'`. A separate `publishRbTemplate` flips `DRAFT→PUBLISHED` (mirrors `catalog.publishProduct:500`), gated by capabilities (§3.4). RLS `rb_templates_write`. **This is step (a) of "a rep lists a container."** |
| `openRbContainer(input)` `NEW` | shipped Container Desk — `containers.ts` + `containers-logic.ts` | Zod-validate `{ template_id, route:{origin,destination}, closes_at?, public_fill_visible }` — **`code` is NOT a client input.** The template must be `PUBLISHED` (checked via the RLS read) before a container opens. The `code` (`RB01-40HC-001`) is **minted server-side** by extending `computeNextContainerCode` (`containers-logic.ts:50`, append-only ops-code issuance — codes never reused even for a container that never opened), from the count of containers already issued for the brand/template. Insert `rb_containers` at `status='OPEN'`. RLS `rb_containers_write`. **Step (b) — the container is now live and, if `public_fill_visible`, on the shelf.** |
| `setRbContainerStatus(containerId, to)` `NEW` | `containers-logic.canTransitionContainerStatus` (`:64`) pattern | Zod-enum `to ∈ {FILLING,CLOSED,SHIPPED,CANCELLED}`; guarded by a new **`canTransitionRbContainerStatus(from,to)`** — the same forward-only ordinal law as the ERP guard, but over the RB lifecycle `OPEN→FILLING→CLOSED→SHIPPED→CANCELLED` (`rb_wave1.sql:76-77`; `CANCELLED` reachable from any non-`SHIPPED` state, PO-guard style). Writes `rb_containers.status` through the RLS client. This is how a rep who **listed** a container can later close, ship, or cancel it — without it the lifecycle in §1.1 is unreachable. (The automatic `OPEN→FILLING` flip inside `rb_reserve` stays; this action covers the operator-driven moves.) |
| `listRbAvailability(brandId)` `NEW` | `catalog.listProducts` (`catalog.ts:231`) read shape | Select from `tower.rb_container_availability` (§2.3) under the RLS client (security_invoker scopes it to the rep's brand) → returns `{ code, template_ref, status, closes_at, total_slots, slots_taken, committed_slots, reserved_slots, slots_available, units_per_slot, units_available, unit_name_plural }[]`. **This is "list new containers available with quantities/slots"** — `available` is the view's `slots_available` (reused `rb_slots_taken`), the `committed_slots`/`reserved_slots` split feeds the FillMeter's `{total, committed, reserved}` triple (§4), and quantities are the view's derived columns. Display-only; the number is re-validated on every reserve. |
| `convertQuantity(templateRef, quantity, level)` `NEW` | **reuse** `packing.ts` | Server-side quantity↔slot conversion (§3.3). No DB call for the math; loads the template (RLS read), then calls the shared pure function. Returns `{ slots, packages, packets, units, kg, remainderUnits }`. |
| `setAllocationStatus(allocationId, to)` `NEW` | `pipeline.markQuoteStatus` (`pipeline.ts:772`) + `canTransition*` guard | Zod-enum `to ∈ {CONFIRMED,LOADED,RELEASED}`; calls `rpc('rb_set_allocation_status', …)` (§2.1). String-matches `RB_INVALID_TRANSITION`/`RB_ALLOCATION_NOT_FOUND` → `ActionError` (same contract style as `data.ts:157-161`). This is the console lever that moves a slot from *reserved* to *committed*, which the FillMeter then shows. |
| `reserveRbSlots(…)` | **reuse verbatim**, via authorize-then-privileged-act | The reservation function is `public.rb_reserve` (`rb_wave1.sql:218-230`) — the same one the site's `reserveRbSlots` (`data.ts:140`) calls — and its shipped grants are `revoke … from public, anon, authenticated; grant execute … to service_role` (`rb_wave1.sql:232-233`). So the console **cannot** call it through the `requireUser()` RLS client (EXECUTE denied). It uses the **authorize-then-privileged-act** pattern (`requireGroupAdmin`, `admin.ts:91`): `requireUser()` + verify the rep's Ch-01 membership on the container's brand, **then** invoke `rb_reserve` through the **service client**. The reserve math is never reimplemented and never re-granted to `authenticated`; the membership check is the console-side gate that RLS would otherwise provide. A console-initiated reservation (rep books a slot on a buyer's behalf) inserts a lead-bound allocation exactly as the site does. |

### 3.3 Quantity↔slot conversion — one math, reused (not rebuilt)

The task's "quantity↔slot conversion server-side" is **already implemented once** and
must stay singular. `apps/site/src/lib/rb/packing.ts` header states it verbatim: *"ONE
implementation … slot subtraction and packing math are server-side only … Same
functions TOWER will use (SPEC §3.2 / §4)."*

- `slotsForQuantity(template, quantity, level)` (`packing.ts:36`) — quantity → **min
  whole slots** + `remainderUnits` (`unitsPerSlot = packagesPerSlot × unitsPerPackage`,
  `packing.ts:44`; the derived denorm from §2.3, computed identically).
- `cascadeForSlots(template, slots)` (`packing.ts:17`) — slots → `{packages, packets,
  units, kg}`.

The console imports these from a **single shared package** — `packing.ts` is lifted
out of `apps/site/src/lib/rb/` into `packages/` (e.g. `@wings/rb-packing`) and consumed
by *both* apps. A mirror is explicitly **rejected**: it would be a second implementation
of the quantity↔slot math, exactly what §1.3 and the reuse boundary forbid ("it does not
add a second convert"). A direct cross-app import is also impossible — `apps/site`'s `@/`
alias resolves only within `apps/site/src` (root CLAUDE.md repo map), so tower cannot
reach `apps/site/src/lib/rb/packing.ts`. One package, two consumers ("one math," SPEC §4).
The **authority** remains the DB:
whatever slot count the conversion yields is passed as `p_slots` to `rb_reserve`,
which re-checks `p_slots ≤ total − rb_slots_taken` under a row lock
(`rb_wave1.sql:158-161`) — display math never overrides (root §5-bis rule 4). This is
the same discipline the site's `/api/rb/convert` route already follows (site map §4).

### 3.4 Capability derivation (hide-not-enforce)

`computeRbContainerCapabilities(roles, kitComplete, hasPublishedTemplate)` `NEW`,
modeled on `computeCapabilities` (`catalog-logic.ts:50`) and derived from the
uppercase `DbLaneRole` (`catalog-logic.ts:19`), **never** `rbac.ts`'s mistyped
lowercase `Role` (reconciliation flag `catalog-logic.ts:11-18`). Exposes
`canOpenContainer = hasPublishedTemplate` and `canPublishTemplate = isManager`.
Drives **UI hiding only** (open-container disabled until a template is published,
same pattern as `PublishBar.showPublish`, `PublishBar.tsx:37`); RLS + the DB checks
are the real gate.

---

## 4 · Console UI (component tree)

Under the `marcas` module added in Chapter 01. Reuse first, fork never (site map "No
forked components"). The container surface re-mounts the existing diagram + publish
organs and drives them with RB data through props.

```
app/(shell)/marcas/[brand]/contenedores/
├─ TemplateWorksheet            (NEW; step (a) — "list a container of my product")
│   ├─ composition picker → rb_products/rb_packing_profiles (Ch 02) → composition[]
│   ├─ total_slots / packages_per_slot / governing_bound inputs (Zod-bound, no raw values)
│   ├─ PackingDiagram + ExplodedDiagram + PalletDiagram   (REUSE features/brands/*;
│   │     parametric, token-driven — the caja-máster/pallet geometry preview)
│   ├─ ContainerSliceDiagram    (REUSE features/shared/ContainerSliceDiagram.tsx;
│   │     the cupo grammar — fed {total, committed:0, reserved:0} at design time)
│   ├─ live cascade read-out via convertQuantity (cascadeForSlots) — cupo→caja→unidad→kg
│   └─ PublishBar               (REUSE PublishBar.tsx:14 → DRAFT→PUBLISHED; showPublish
│                                  hidden until canPublishTemplate)
│
├─ ContainerBoard              (NEW; step (b) + "list new containers available")
│   ├─ open-container form → openRbContainer (route, closes_at, public_fill_visible;
│   │     code minted server-side — never typed, §3.2)
│   ├─ lifecycle actions → setRbContainerStatus (Abrir→En llenado→Cerrar→Embarcar /
│   │     Cancelar; capability-gated, forward-only per canTransitionRbContainerStatus)
│   ├─ availability table ← listRbAvailability:
│   │     code · template_ref · estado · cierra · cupos: available/total ·
│   │     por cantidad: units_available unit_name_plural   (all from the view, §2.3)
│   ├─ FillMeter               (REUSE @wings/trade-ui FillMeter.tsx:58-67; per-container
│   │     silhouette, fed the {total, committed, reserved} triple — the SAME organ the
│   │     public shelf renders, so console and shelf can never disagree)
│   └─ ContainerSliceDiagram   (REUSE; live slots + selected preview)
│
└─ SlotAllocationGrid          (NEW view over rb_slot_allocations)
    ├─ one row per allocation: lead · slots · quantity_units · status · expires_at
    ├─ status actions → setAllocationStatus (Reservado→Confirmado→Cargado / Liberar)
    │     (buttons capability-gated; forward-only mirrors rb_set_allocation_status)
    ├─ SlotGrid                (REUSE SlotGrid.tsx:22-66; committed/reserved/open cells)
    └─ "Reservar cupo" → reserveRbSlots (REUSE public.rb_reserve — the one write-back)
```

`FillMeter`, `ContainerSliceDiagram`, `SlotGrid`, `PackingDiagram` family, and
`PublishBar` are all rendered **unchanged**, driven by props. The availability triple
the console shows is the same `{total, committed, reserved}` the FillMeter organ
already segments (`FillMeter.tsx:58-67`) — identical derivation on both sides of the
write boundary.

---

## 5 · Public sync (TOWER writes → site reads)

The shelf is a **read-only projection** (site map §1). Every console write above
reprojects through the three shipped `public.rb_public_*` views; the site reads them
at 60 s ISR and never touches `tower.*`.

| Console write (§3) | View that reprojects it (`rb_wave1.sql`) | Site read-path |
|---|---|---|
| `publishRbTemplate` → template `status='PUBLISHED'` | `public.rb_public_templates` (`:186-195`) — geometry + first-profile unit math | `getRbTemplateForBrand` / `getRbTemplateByRef` (`data.ts:83,96`) → configurator, `/api/rb/convert`. |
| `openRbContainer` (`public_fill_visible`, status `OPEN`) | `public.rb_public_containers` (`:197-213`) — appears once `public_fill_visible AND status IN (OPEN,FILLING)` | `getRbContainers` (`data.ts:108`) → shelf FillMeter + SlotGrid. |
| `reserveRbSlots` / `setAllocationStatus` | `public.rb_public_containers` recomputes `committed_slots` (CONFIRMED+LOADED) and `reserved_slots` (unexpired RESERVED) live (`:203-212`) | Same view; **ISR `revalidate = 60`** (`contenedor/page.tsx:14`) so "quedan N" is ≤60 s stale — the FillMeter's `{total,committed,reserved}` updates within a minute of any confirm/reserve. |
| Any container becomes full (`rb_reserve` flips `OPEN→FILLING`, `rb_wave1.sql:169-171`) | View's `WHERE status IN (OPEN,FILLING)` keeps it visible; `CLOSED`/`SHIPPED`/`CANCELLED` drop it | Container disappears from `getRbContainers` — no delete, the row + ledger persist. |
| Any template/container publish | (webhook/n8n trigger, SPEC §6 Phase-4) | Mister `rb-{slug}` pack auto-compiles from the **same views** (`misterPack.ts:32`); availability enters as **structure only** ("hay un contenedor en llenado…", `misterPack.ts:56-59`) — the live count never leaves the configurator (`forbidden_reminder`, `:64-65`). |

**Sync invariants.** (1) The site reads **only** `public.rb_public_*` + calls
`public.rb_reserve`; `tower.rb_container_availability` (§2.3) is TOWER-only and never
crosses the boundary. (2) `available` is derived on the site as `total − committed −
reserved` (`packing.ts:50`, `ContainerConfigurator.tsx:57-59`, `FillMeter.tsx:58-67`)
— algebraically the same as the console's `total − rb_slots_taken`, one truth. (3)
The reserve RPC is the **only** write-back from site into TOWER; `setAllocationStatus`
and template/container CRUD are TOWER-inbound only. (4) Schema changes to the three
views ripple across every workstream (backend map §6 "Fixture rule") — this chapter
adds a *new* TOWER-only view and touches none of the three.

---

## 6 · Phase-0 gates (must hold before a container is public)

Adapted from the lane Onboarding Protocol Phase-5/QA gates (root §4) to the
container surface. A `rb_containers` row must not be `public_fill_visible` and a
template must not be `PUBLISHED` until:

1. **Template geometry is real & bounded.** `total_slots ≥ 1`, `packages_per_slot ≥ 1`,
   `max_packages` consistent with `total_slots × packages_per_slot`, `governing_bound`
   set — the cupo math must resolve to whole numbers (backend map §2 cascade). Depth
   over breadth: one correct template beats many placeholders.
2. **Composition resolves.** `composition[0].profile_slug` matches a
   `rb_packing_profiles.product_slug` (Ch 02), because the public template view joins
   on exactly that (`rb_wave1.sql:193-194`) — a missing profile makes the template
   invisible on the shelf regardless of status.
3. **Derived quantities check out.** `units_per_slot = packages_per_slot ×
   units_per_package` and `units_available` render sanely in `listRbAvailability`
   before opening (they are *derived*, never stored — §2.3).
4. **A published template exists before any container opens.** `canOpenContainer`
   requires `hasPublishedTemplate` (§3.4); the public container view is useless
   without a `PUBLISHED` template to join (`rb_public_templates` filters `PUBLISHED`).
5. **Reserve path proven.** A test `rb_reserve` on the container succeeds and
   `rb_public_containers.reserved_slots` moves within the 60 s ISR window; the last
   slot cannot be double-sold (`RB_INSUFFICIENT_SLOTS`, `rb_wave1.sql:158-161`).
6. **Ledger transitions guarded.** `setAllocationStatus` refuses illegal moves
   (`RB_INVALID_TRANSITION`) and `rb_release_expired` reconciles stale RESERVED rows —
   audit rows land in `tower.audit_log` for every flip (§2.4).
7. **Swap test.** Render this container's shelf card and `ContainerSliceDiagram` with
   another brand's `--rb-*` tokens — the cupo grammar and FillMeter must hold (root
   §5-bis rule 2). If it breaks, someone forked the skeleton.

Gate owner: `openRbContainer` / `publishRbTemplate` refuse the write unless
(1)-(2)-(4) are machine-checkable-true; (3),(5),(6),(7) are `ContainerBoard`
checklist items surfaced before `public_fill_visible` is offered.

---

## 7 · Reuse ledger (what this chapter does NOT build)

- **Slot subtraction** — `tower.rb_slots_taken` (`rb_wave1.sql:109-121`). Reused by
  the availability view (§2.3); never reinlined.
- **Atomic reservation** — `tower.rb_reserve` / `public.rb_reserve`
  (`rb_wave1.sql:125-233`). Re-mounted by the console (§3.2); never cloned. Row-lock,
  72 h expiry, `OPEN→FILLING` flip all stay in the one shipped function.
- **Container code minting + status law** — the shipped Container Desk
  `containers.ts` + `containers-logic.ts`: `computeNextContainerCode`
  (`containers-logic.ts:50`, append-only ops-code issuance) is **extended** to mint
  `RB01-40HC-001` (reps never free-type codes, §3.2), and `canTransitionContainerStatus`
  (`:64`) is the pattern the new `canTransitionRbContainerStatus` follows. `computeContainerCapabilities`
  is the model for `computeRbContainerCapabilities` (§3.4). Reused/extended, not reinvented.
- **Quantity↔slot math** — `packing.ts` `slotsForQuantity` / `cascadeForSlots`
  (`:36,:17`), lifted into a shared `packages/` module (§3.3) and reused server-side by
  both apps; no SQL convert added, no mirror.
- **The three public views** — `rb_public_brands/templates/containers`
  (`rb_wave1.sql:181-213`). Untouched; the console adds one *separate* TOWER-only view.
- **Audit trigger** — `tower.audit_trigger()` (`tower_07:5`). Attached to RB tables
  (§2.4); not rewritten.
- **Diagram + publish organs** — `FillMeter`, `ContainerSliceDiagram`, `SlotGrid`,
  `PackingDiagram`/`ExplodedDiagram`/`PalletDiagram`, `PublishBar`. Rendered through
  props; no fork.
- **Money math** — `pipeline.convertToOrder` (`:808`) + `quotation.ts` bps/minor
  recompute. Untouched; this chapter emits only integer slot/quantity counts.

What this chapter genuinely **adds**: `rb_set_allocation_status`,
`rb_release_expired` (SECURITY DEFINER, service-role/cron only),
`canTransitionRbContainerStatus`, the `rb_container_availability` view
(security_invoker), RB audit-trigger attachment, and the `rb-containers.ts` actions
(incl. `setRbContainerStatus`) + console UI — all layered over the shipped ledger,
never beside it.
