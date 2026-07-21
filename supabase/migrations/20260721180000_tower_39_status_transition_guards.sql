-- tower_39 · Server-side status-transition guards (TOWER Directive: illegal
-- status transitions must be blocked in the DB, not by app convention).
--
-- Today only tower.rb_slot_allocations has a transition trigger
-- (rb_alloc_status_guard, tower_36). Every other state machine relies on a
-- value-domain CHECK plus a TS `canTransition*` predicate in the server action —
-- which an authorised writer bypasses trivially (a direct UPDATE, a future
-- action that forgets the check, the service-role path). This migration adds the
-- DB backstops, each mirroring the EXACT app-layer predicate so no legal
-- transition breaks. The TS checks stay (defense in depth: TS gives the operator
-- a clean typed error; the trigger is the wall behind it).
--
-- Tables + the predicate each guard mirrors (all in apps/tower/src/lib):
--   · containers.status          ← containers-logic.ts canTransitionContainerStatus
--   · purchase_orders.status     ← containers-logic.ts canAdvancePoStatus
--   · quotes.status              ← pipeline-logic.ts canSendQuote + canMarkQuoteStatus
--   · orders.status              ← (no TS predicate exists — see §4 note)
--   · rb_containers.shipping_phase ← (app validates membership only — see §5 note)
--   · rfqs.stage                 ← archetypes/resolve.ts isValidStage (membership,
--                                    archetype-scoped) + a value-domain CHECK floor
--
-- Conventions mirror tower_36 exactly: BEFORE UPDATE OF <col>, SECURITY DEFINER,
-- schema-qualified `set search_path`, no-op status writes rejected (keeps an
-- empty audit row from a status "flip"), `create or replace function` +
-- `drop trigger if exists` so the whole migration is safe to re-run. The audit
-- trigger on each table is AFTER, so it never fires for a rejected transition.
--
-- COLUMN-SCOPED IS LOAD-BEARING: `before update of status` fires ONLY when the
-- UPDATE's SET list names that column. quotation.ts (issueQuotation /
-- saveQuotationDetails write subtotal/tax/quote_no, never status) and
-- container-promo.ts (saveContainerPromoCopy / setContainerPromoActive write
-- promo_*, never shipping_phase) therefore never trip these guards.
--
-- Raised code: `STATUS_TRANSITION_INVALID` for the five status/phase machines
-- (the action layer maps it to the typed STAGE_INVALID ActionResult, exactly as
-- containers.ts maps commit_container_cbm's CAPACITY_EXCEEDED); `RFQ_STAGE_INVALID`
-- for the rfqs.stage guard (mapped to STAGE_INVALID as well).

set search_path to tower, public;

-- ── 1 · containers.status ───────────────────────────────────────────────────
-- Mirrors containers-logic.ts#canTransitionContainerStatus:
--   `CONTAINER_ORDER[to] > CONTAINER_ORDER[from]`
-- i.e. forward-only along OPEN→FILLING→BOOKED→IN_TRANSIT→ARRIVED→CLEARED→CLOSED,
-- forward SKIPS allowed (that predicate permits e.g. OPEN→BOOKED), backward
-- NEVER, no-op NEVER (index is not strictly greater). The public FillMeter's
-- state must never move backward under an operator's fingers.
create or replace function tower.containers_status_guard() returns trigger
language plpgsql security definer set search_path = tower, public as $fn$
declare
  ord constant text[] := array['OPEN','FILLING','BOOKED','IN_TRANSIT','ARRIVED','CLEARED','CLOSED'];
begin
  if new.status is not distinct from old.status then
    raise exception 'STATUS_TRANSITION_INVALID: containers no-op status write (%)', old.status
      using hint = 'status unchanged — nothing to transition';
  end if;
  if not (array_position(ord, new.status) > array_position(ord, old.status)) then
    raise exception 'STATUS_TRANSITION_INVALID: containers % -> %', old.status, new.status;
  end if;
  return new;
end $fn$;

drop trigger if exists containers_status_guard on tower.containers;
create trigger containers_status_guard
  before update of status on tower.containers
  for each row execute function tower.containers_status_guard();

-- ── 2 · purchase_orders.status ──────────────────────────────────────────────
-- Mirrors containers-logic.ts#canAdvancePoStatus exactly:
--   · from CANCELLED or SHIPPED → nothing legal (both terminal; a shipped PO is
--     history, not cancellable).
--   · to CANCELLED (from any non-terminal) → legal.
--   · otherwise forward-only by index in the flow
--     ISSUED→CONFIRMED→IN_PRODUCTION→QC_PENDING→QC_PASSED→SHIPPED (skips allowed,
--     since the predicate is `PO_ORDER[to] > PO_ORDER[from]`).
create or replace function tower.purchase_orders_status_guard() returns trigger
language plpgsql security definer set search_path = tower, public as $fn$
declare
  flow constant text[] := array['ISSUED','CONFIRMED','IN_PRODUCTION','QC_PENDING','QC_PASSED','SHIPPED'];
begin
  if new.status is not distinct from old.status then
    raise exception 'STATUS_TRANSITION_INVALID: purchase_orders no-op status write (%)', old.status
      using hint = 'status unchanged — nothing to transition';
  end if;

  -- Terminal states: nothing (not even CANCELLED) leaves SHIPPED/CANCELLED.
  if old.status in ('SHIPPED','CANCELLED') then
    raise exception 'STATUS_TRANSITION_INVALID: purchase_orders % -> % (terminal)', old.status, new.status;
  end if;

  -- CANCELLED reachable from any non-terminal state.
  if new.status = 'CANCELLED' then
    return new;
  end if;

  -- Otherwise forward-only along the flow (skips allowed, backward rejected).
  if not (array_position(flow, new.status) > array_position(flow, old.status)) then
    raise exception 'STATUS_TRANSITION_INVALID: purchase_orders % -> %', old.status, new.status;
  end if;
  return new;
end $fn$;

drop trigger if exists purchase_orders_status_guard on tower.purchase_orders;
create trigger purchase_orders_status_guard
  before update of status on tower.purchase_orders
  for each row execute function tower.purchase_orders_status_guard();

-- ── 3 · quotes.status ───────────────────────────────────────────────────────
-- Mirrors pipeline-logic.ts, which is NOT a linear index machine — it is two
-- explicit predicates:
--   · canSendQuote:        DRAFT → SENT                      (a draft is sent)
--   · canMarkQuoteStatus:  SENT  → ACCEPTED|REJECTED|EXPIRED (a sent quote resolves)
-- A resolved quote never re-opens (append-only law: a new negotiation round is a
-- new quote VERSION, composeQuote, never a status walk-back). convertToOrder
-- READS status='ACCEPTED' but never mutates it, so it is unaffected.
create or replace function tower.quotes_status_guard() returns trigger
language plpgsql security definer set search_path = tower, public as $fn$
begin
  if new.status is not distinct from old.status then
    raise exception 'STATUS_TRANSITION_INVALID: quotes no-op status write (%)', old.status
      using hint = 'status unchanged — nothing to transition';
  end if;
  if not (
       (old.status = 'DRAFT' and new.status = 'SENT')
    or (old.status = 'SENT'  and new.status in ('ACCEPTED','REJECTED','EXPIRED'))
  ) then
    raise exception 'STATUS_TRANSITION_INVALID: quotes % -> %', old.status, new.status;
  end if;
  return new;
end $fn$;

drop trigger if exists quotes_status_guard on tower.quotes;
create trigger quotes_status_guard
  before update of status on tower.quotes
  for each row execute function tower.quotes_status_guard();

-- ── 4 · orders.status ───────────────────────────────────────────────────────
-- NOTE — there is NO TS `canTransition` predicate for orders in the app today:
-- pipeline.ts#convertToOrder only INSERTs status='CONTRACTED', and no action
-- ever UPDATEs an order's status. This guard is therefore a pure backstop with
-- no current caller to mirror, so its machine is CHOSEN (and flagged as an open
-- question in the migration report) rather than derived from code:
--   · Linear, SINGLE-STEP forward along
--     CONTRACTED→IN_PRODUCTION→READY→SHIPPED→DELIVERED→CLOSED. Unlike containers
--     and POs, forward SKIPS are REJECTED — the task names "CONTRACTED→CLOSED
--     skips" as an illegal jump to block, so the order lifecycle advances one
--     step at a time.
--   · CANCELLED reachable from any pre-delivery state
--     (CONTRACTED/IN_PRODUCTION/READY/SHIPPED) — a delivered or closed order is
--     history and cannot be cancelled.
--   · CLOSED and CANCELLED are terminal.
-- When an order-status action is eventually built it MUST carry a TS predicate
-- matching this machine (defense in depth), and any change to this lifecycle
-- belongs here first.
create or replace function tower.orders_status_guard() returns trigger
language plpgsql security definer set search_path = tower, public as $fn$
declare
  chain constant text[] := array['CONTRACTED','IN_PRODUCTION','READY','SHIPPED','DELIVERED','CLOSED'];
begin
  if new.status is not distinct from old.status then
    raise exception 'STATUS_TRANSITION_INVALID: orders no-op status write (%)', old.status
      using hint = 'status unchanged — nothing to transition';
  end if;

  -- Terminal states never move.
  if old.status in ('CLOSED','CANCELLED') then
    raise exception 'STATUS_TRANSITION_INVALID: orders % -> % (terminal)', old.status, new.status;
  end if;

  -- CANCELLED reachable from any pre-delivery state (not from DELIVERED).
  if new.status = 'CANCELLED' then
    if old.status = 'DELIVERED' then
      raise exception 'STATUS_TRANSITION_INVALID: orders DELIVERED -> CANCELLED';
    end if;
    return new;
  end if;

  -- Otherwise single-step forward only (no skipping).
  if array_position(chain, new.status) is distinct from array_position(chain, old.status) + 1 then
    raise exception 'STATUS_TRANSITION_INVALID: orders % -> %', old.status, new.status;
  end if;
  return new;
end $fn$;

drop trigger if exists orders_status_guard on tower.orders;
create trigger orders_status_guard
  before update of status on tower.orders
  for each row execute function tower.orders_status_guard();

-- ── 5 · rb_containers.shipping_phase ────────────────────────────────────────
-- NOTE — the app-layer writer (container-promo.ts#setContainerShippingPhase)
-- validates ONLY membership (`SHIPPING_PHASES.includes(phase)`); it does NOT
-- enforce ordering, so today a rep could walk a container BACKWARD
-- (NACIONALIZADO → EN_ORIGEN). That is a latent gap, not a legitimate flow: a
-- shipment physically only moves forward, and the function's own doc comment
-- reads "en origen → en tránsito → arribado". This guard therefore enforces
-- FORWARD-ONLY progression (skips allowed, matching the containers pattern),
-- which is STRICTER than the current TS. Consequence (flagged in the report):
-- a backward phase move — legal in the app today — is rejected after this
-- migration, and a no-op phase re-save is rejected too. A phase CHECK for the
-- value domain already exists (tower_33); this is additive alongside it.
create or replace function tower.rb_containers_phase_guard() returns trigger
language plpgsql security definer set search_path = tower, public as $fn$
declare
  phases constant text[] := array['EN_ORIGEN','EN_TRANSITO','ARRIBADO','NACIONALIZADO'];
begin
  if new.shipping_phase is not distinct from old.shipping_phase then
    raise exception 'STATUS_TRANSITION_INVALID: rb_containers no-op shipping_phase write (%)', old.shipping_phase
      using hint = 'shipping_phase unchanged — nothing to transition';
  end if;
  if not (array_position(phases, new.shipping_phase) > array_position(phases, old.shipping_phase)) then
    raise exception 'STATUS_TRANSITION_INVALID: rb_containers shipping_phase % -> %', old.shipping_phase, new.shipping_phase;
  end if;
  return new;
end $fn$;

drop trigger if exists rb_containers_phase_guard on tower.rb_containers;
create trigger rb_containers_phase_guard
  before update of shipping_phase on tower.rb_containers
  for each row execute function tower.rb_containers_phase_guard();

-- ── 6 · rfqs.stage ──────────────────────────────────────────────────────────
-- rfqs.stage shipped as bare `text NOT NULL` with NO CHECK. Its legality is
-- ARCHETYPE-DEPENDENT and, critically, MEMBERSHIP- only — pipeline.ts#updateStage
-- gates on archetypes/resolve.ts#isValidStage, which is
-- `ARCHETYPES[archetype].stages.some(s => s.id === stageId)`: any stage in the
-- lane's archetype set is reachable from any other (the PipelineBoard lets an
-- operator drag an RFQ forward OR backward between that archetype's columns).
-- There is NO ordering and NO no-op rejection to mirror — so this is a
-- membership guard, NOT a linear transition machine.
--
-- Rather than the weaker "union of all stage vocabulary" CHECK the task offers
-- as a fallback, this faithfully replicates isValidStage: a BEFORE INSERT OR
-- UPDATE trigger resolves the lane's archetype and checks membership in THAT
-- archetype's stage set. The per-archetype sets below mirror
-- archetypes/config.ts one-for-one; a new archetype (a rare framework amendment
-- per root CLAUDE.md §3, itself migration-worthy) must extend this function.
-- (New LANES need no change here — they reuse an existing archetype, preserving
-- TOWER's "a new lane lights up with zero code changes" law.)
create or replace function tower.archetype_stage_ids(p_archetype text) returns text[]
language sql immutable as $fn$
  select case p_archetype
    when 'EQUIPMENT'  then array['inquiry','specification','quote','contract','production','shipment','commissioning']
    when 'PROJECT'    then array['brief','spec','quote','contract','production','shipment','installation']
    when 'COMMODITY'  then array['inquiry','offer','contract','booking','shipment']
    when 'PROGRAM'    then array['inquiry','assortment','quote','contract','production','shipment','replenishment']
    when 'CREDENTIAL' then array['inquiry','qualification','proposal','mandate','activation']
    when 'ORIGIN'     then array['inquiry','offer','contract','documentation','booking','shipment']
    when 'ALLOCATION' then array['inquiry','reservation','contract','consolidation','shipment']
    else null::text[]
  end
$fn$;

create or replace function tower.rfq_stage_guard() returns trigger
language plpgsql security definer set search_path = tower, public as $fn$
declare
  v_archetype text;
  v_valid     text[];
begin
  select archetype into v_archetype from tower.lanes where id = new.lane_id;
  if v_archetype is null then
    raise exception 'RFQ_STAGE_INVALID: lane % has no resolvable archetype', new.lane_id;
  end if;

  v_valid := tower.archetype_stage_ids(v_archetype);
  if v_valid is null then
    raise exception 'RFQ_STAGE_INVALID: unknown archetype % (extend tower.archetype_stage_ids)', v_archetype;
  end if;

  if not (new.stage = any(v_valid)) then
    raise exception 'RFQ_STAGE_INVALID: stage "%" not valid for archetype %', new.stage, v_archetype;
  end if;
  return new;
end $fn$;

drop trigger if exists rfq_stage_guard on tower.rfqs;
create trigger rfq_stage_guard
  before insert or update of stage on tower.rfqs
  for each row execute function tower.rfq_stage_guard();

-- Value-domain floor: even if the trigger is ever bypassed (session_replication
-- _role = replica during a logical restore, say), stage can never hold a value
-- outside the KNOWN vocabulary — the distinct union of every archetype's stage
-- ids above. The trigger remains the archetype-SCOPED truth; this CHECK is the
-- cheap superset that also holds when triggers are off. Existing rows are clean
-- (every stage was written through defaultStageFor / isValidStage), so this
-- validates without a NOT VALID dance. Must be extended alongside
-- tower.archetype_stage_ids when a new archetype is ratified.
alter table tower.rfqs drop constraint if exists rfqs_stage_known_vocabulary;
alter table tower.rfqs add constraint rfqs_stage_known_vocabulary check (
  stage in (
    'inquiry','specification','quote','contract','production','shipment','commissioning',
    'brief','spec','installation','offer','booking','assortment','replenishment',
    'qualification','proposal','mandate','activation','documentation','reservation','consolidation'
  )
);
