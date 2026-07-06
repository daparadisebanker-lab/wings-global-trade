-- TOWER · Wave 3 (W3.B Container Desk) · PROPOSED SQL — artifact only.
-- NOT APPLIED by this agent. The Conductor reviews and applies all DB changes
-- (per the build brief: "Do NOT apply the SQL or write to Supabase").
--
-- Three things this file proposes:
--   1. The atomic CBM-capacity RPC: tower.commit_container_cbm(...)
--   2. RLS policies for the five Wave-3 domain tables (DATABASE_SCHEMA.sql
--      only ships a worked RLS example on `products`; its own comment says
--      "Same pattern: apply to every domain table" for containers/POs/QC/
--      documents/landed_costs/commitments but never writes it).
--   3. Grants for the same tables (D-06 from Wave 1: RLS and privileges are
--      orthogonal — `authenticated` needs explicit table grants or every
--      query 403s regardless of policy correctness).
--
-- Role law this file encodes (CLAUDE.md core law, verbatim):
--   "containers/purchase_orders/qc/documents/landed_costs are TRADE_OPS +
--    LANE_DIRECTOR write; commitments TRADE_OPS/SALES/LANE_DIRECTOR."
-- Read is broader than write everywhere (mirrors products_read): any lane
-- membership (incl. VIEWER) may read; group admin bypasses via is_group_admin().
--
-- FLAG (out-of-ownership dependency): containers.ts's listCommitments/
-- listPurchaseOrders embed `accounts(name)` / `suppliers(name)` (PostgREST
-- joins) for display. `accounts` and `suppliers` are CRM/ERP tables this wave
-- does NOT own (no RLS or grants proposed for them here) — until whichever
-- wave owns them adds RLS + grants, those embeds will return null/empty (or
-- 403, if RLS is enabled on them with no policy) for a normal `authenticated`
-- caller. Container Desk still functions (falls back to showing the raw
-- account_id/supplier_id — see containers.ts's `?? null` fallbacks), just
-- without the friendly name until that gap is closed.

set search_path to tower, public;

-- ============================================================
-- 1 · commit_container_cbm — the ONE atomic capacity check
-- ============================================================
-- FLAG: this is the load-bearing piece of Wave 3. A plain
-- `insert into container_commitments (...)` guarded only by RLS cannot
-- prevent two concurrent commits from both reading a stale "committed so far"
-- sum and both passing the capacity check — RLS has no row-lock primitive.
-- This function does the whole read-check-write under `FOR UPDATE` on the
-- container row, so a second concurrent call blocks until the first commits
-- or rolls back, then re-reads the now-correct sum.
--
-- SECURITY DEFINER is required for the row lock to work uniformly regardless
-- of the caller's own row-level privileges, but that means this function
-- BYPASSES RLS entirely inside its own body — so it re-implements the
-- TRADE_OPS/SALES/LANE_DIRECTOR permission check itself via has_lane_role().
-- If the container_commitments RLS policy below is ever widened, widen this
-- check too; they do not share a definition and will silently drift apart
-- otherwise (flagged in components/containers/README.md too).
create or replace function tower.commit_container_cbm(
  p_container uuid,
  p_order uuid,
  p_account uuid,
  p_cbm numeric
) returns tower.container_commitments
language plpgsql
security definer
set search_path = tower, public
as $$
declare
  v_lane_id uuid;
  v_capacity numeric;
  v_committed numeric;
  v_row tower.container_commitments;
begin
  if p_cbm is null or p_cbm <= 0 then
    raise exception 'INVALID_CBM' using errcode = 'P0001';
  end if;

  -- Row lock: blocks a concurrent commit on the SAME container until this
  -- transaction commits or rolls back. Different containers never contend.
  select lane_id, capacity_cbm into v_lane_id, v_capacity
  from tower.containers
  where id = p_container
  for update;

  if not found then
    raise exception 'CONTAINER_NOT_FOUND' using errcode = 'P0002';
  end if;

  -- Permission check RLS would have made on a plain insert — re-implemented
  -- here because SECURITY DEFINER bypasses table RLS inside this body.
  if not tower.has_lane_role(v_lane_id, array['TRADE_OPS', 'SALES', 'LANE_DIRECTOR']) then
    raise exception 'FORBIDDEN_LANE' using errcode = 'P0003';
  end if;

  select coalesce(sum(cbm), 0) into v_committed
  from tower.container_commitments
  where container_id = p_container
    and status in ('RESERVED', 'CONFIRMED', 'LOADED');

  if v_committed + p_cbm > v_capacity then
    raise exception 'CAPACITY_EXCEEDED' using errcode = 'P0004';
  end if;

  insert into tower.container_commitments (container_id, order_id, account_id, cbm, status)
  values (p_container, p_order, p_account, p_cbm, 'RESERVED')
  returning * into v_row;

  return v_row;
end;
$$;

-- Callable by any authenticated user — the function's own has_lane_role()
-- check above is the real gate, matching the pattern security-definer RLS
-- helper functions already use in DATABASE_SCHEMA.sql (is_group_admin,
-- has_lane_role themselves are also security definer + callable by anyone).
grant execute on function tower.commit_container_cbm(uuid, uuid, uuid, numeric) to authenticated;

-- ============================================================
-- 2 · RLS — containers, container_commitments, purchase_orders,
--     qc_checks, trade_documents, landed_costs
-- ============================================================

-- ---- containers ----
alter table tower.containers enable row level security;

create policy containers_read on tower.containers for select
  using ( has_lane_role(lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES','VIEWER']) );

create policy containers_write on tower.containers for insert with check
  ( has_lane_role(lane_id, array['TRADE_OPS','LANE_DIRECTOR']) );

create policy containers_update on tower.containers for update
  using ( has_lane_role(lane_id, array['TRADE_OPS','LANE_DIRECTOR']) );
-- No delete policy anywhere in this file — append-only (CLAUDE.md Directive 4,
-- D-05's "two-layer" enforcement: no policy AND no grant, see §3 below).

-- ---- container_commitments (no lane_id column — derive via containers) ----
alter table tower.container_commitments enable row level security;

create policy container_commitments_read on tower.container_commitments for select
  using (
    has_lane_role(
      (select c.lane_id from tower.containers c where c.id = container_id),
      array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES','VIEWER']
    )
  );

-- Write policy exists for completeness/consistency, but in practice every
-- commit goes through commit_container_cbm() (SECURITY DEFINER, bypasses
-- this policy) — a direct insert would still need this same role set.
create policy container_commitments_write on tower.container_commitments for insert with check (
  has_lane_role(
    (select c.lane_id from tower.containers c where c.id = container_id),
    array['TRADE_OPS','SALES','LANE_DIRECTOR']
  )
);

create policy container_commitments_update on tower.container_commitments for update using (
  has_lane_role(
    (select c.lane_id from tower.containers c where c.id = container_id),
    array['TRADE_OPS','SALES','LANE_DIRECTOR']
  )
);

-- ---- purchase_orders ----
alter table tower.purchase_orders enable row level security;

create policy purchase_orders_read on tower.purchase_orders for select
  using ( has_lane_role(lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES','VIEWER']) );

create policy purchase_orders_write on tower.purchase_orders for insert with check
  ( has_lane_role(lane_id, array['TRADE_OPS','LANE_DIRECTOR']) );

create policy purchase_orders_update on tower.purchase_orders for update
  using ( has_lane_role(lane_id, array['TRADE_OPS','LANE_DIRECTOR']) );

-- ---- qc_checks (no lane_id — derive via purchase_orders) ----
alter table tower.qc_checks enable row level security;

create policy qc_checks_read on tower.qc_checks for select
  using (
    has_lane_role(
      (select po.lane_id from tower.purchase_orders po where po.id = purchase_order_id),
      array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES','VIEWER']
    )
  );

create policy qc_checks_write on tower.qc_checks for insert with check (
  has_lane_role(
    (select po.lane_id from tower.purchase_orders po where po.id = purchase_order_id),
    array['TRADE_OPS','LANE_DIRECTOR']
  )
);

-- ---- trade_documents (no lane_id — derive via containers; order_id-only
-- rows with a null container_id have no lane to scope by, so they're
-- deliberately invisible under this policy until they carry a container —
-- consistent with this wave's actions always setting container_id) ----
alter table tower.trade_documents enable row level security;

create policy trade_documents_read on tower.trade_documents for select
  using (
    container_id is not null and has_lane_role(
      (select c.lane_id from tower.containers c where c.id = container_id),
      array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES','VIEWER']
    )
  );

create policy trade_documents_write on tower.trade_documents for insert with check (
  container_id is not null and has_lane_role(
    (select c.lane_id from tower.containers c where c.id = container_id),
    array['TRADE_OPS','LANE_DIRECTOR']
  )
);

-- ---- landed_costs (PK is container_id itself) ----
alter table tower.landed_costs enable row level security;

create policy landed_costs_read on tower.landed_costs for select
  using (
    has_lane_role(
      (select c.lane_id from tower.containers c where c.id = container_id),
      array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES','VIEWER']
    )
  );

create policy landed_costs_write on tower.landed_costs for insert with check (
  has_lane_role(
    (select c.lane_id from tower.containers c where c.id = container_id),
    array['TRADE_OPS','LANE_DIRECTOR']
  )
);

create policy landed_costs_update on tower.landed_costs for update using (
  has_lane_role(
    (select c.lane_id from tower.containers c where c.id = container_id),
    array['TRADE_OPS','LANE_DIRECTOR']
  )
);

-- ============================================================
-- 3 · Grants (D-06: RLS and privileges are orthogonal — `authenticated`
-- gets "permission denied for schema tower" without these regardless of
-- policy correctness). No DELETE grant anywhere — append-only, matches D-05.
-- ============================================================
grant select, insert, update on tower.containers            to authenticated;
grant select, insert, update on tower.container_commitments  to authenticated;
grant select, insert, update on tower.purchase_orders        to authenticated;
grant select, insert         on tower.qc_checks              to authenticated;
grant select, insert         on tower.trade_documents         to authenticated;
grant select, insert, update on tower.landed_costs           to authenticated;

-- ============================================================
-- 4 · Storage — trade-documents bucket (see components/containers/README.md
-- for the full spec: private, signed URLs only, path convention). Creating
-- the bucket itself and its storage.objects policies is the Conductor's job,
-- not this file's — listed here only so the two proposals sit next to each
-- other for review.
-- ============================================================
-- Expected (not executed here):
--   insert into storage.buckets (id, name, public) values ('trade-documents', 'trade-documents', false);
--   -- storage.objects policies mirroring the TRADE_OPS/LANE_DIRECTOR write
--   -- boundary above, scoped by the {brandSlug}/{laneSlug}/... path prefix.
