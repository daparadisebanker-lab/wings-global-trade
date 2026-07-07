-- TOWER Wave 3 · atomic CBM capacity check (W3.B). RLS/grants for the container
-- tables already exist (migrations 8 & 11) — only this function is new.
set search_path to tower, public;

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

  -- Row lock: a concurrent commit on the SAME container blocks until this txn ends.
  select lane_id, capacity_cbm into v_lane_id, v_capacity
  from tower.containers
  where id = p_container
  for update;

  if not found then
    raise exception 'CONTAINER_NOT_FOUND' using errcode = 'P0002';
  end if;

  -- SECURITY DEFINER bypasses RLS in this body, so re-check the write role here.
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

grant execute on function tower.commit_container_cbm(uuid, uuid, uuid, numeric) to authenticated;
