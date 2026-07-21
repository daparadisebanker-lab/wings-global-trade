-- tower_36 · RB slot-allocation status machine (Represented-Brands Wave 3,
-- ALLOCATION archetype — root CLAUDE.md §5-bis; the UPDATE policy tower_25 §1.4
-- deferred: "The UPDATE policy for the status machine lands in Wave 3").
--
-- rb_wave1 shipped rb_slot_allocations with a 4-value status
-- (RESERVED/CONFIRMED/LOADED/RELEASED) but NO update path: only rb_alloc_read
-- (SELECT) exists, so RLS denies every UPDATE. This migration opens the write
-- path under the same tenancy law as the rest of the RB console and guards it:
--
--   · rb_alloc_upd — RLS UPDATE policy, brand resolved THROUGH rb_containers
--     (allocations carry no represented_brand_id), authorised by has_rb_role
--     BRAND_MANAGER/BRAND_OPS — exactly the join shape rb_alloc_read uses.
--   · column privilege — authenticated may write ONLY status; slots, quantity,
--     expiry and the container link stay service-role only, so the RLS path can
--     never rewrite the ledger it is subtracting from.
--   · a BEFORE UPDATE guard trigger — the single source of truth for legal
--     status jumps (RESERVED→CONFIRMED→LOADED→RELEASED, plus RESERVED→RELEASED
--     for expiry/cancel). Fires for the RLS path AND the job/service-role path.
--   · tower.rb_release_expired_allocations() — an idempotent job that flips
--     expired reservations to RELEASED for the ledger, plus a public wrapper and
--     a pg_cron schedule so cron/n8n can drive it.
--
-- Additive only — never alters the shipped rb_wave1 objects destructively. The
-- audit trigger (audit_rb_slot_allocations, tower_25 §1.4) already covers this
-- table; the AFTER-audit fires after the BEFORE-guard, so the trail stays intact.

set search_path to tower, public;

-- ── 1 · Legal-transition guard (single source of truth) ─────────────────────
-- Rejects any illegal status jump on rb_slot_allocations, whatever the caller.
-- Only runs when status actually changes, so ordinary edits are untouched and a
-- no-op status write is rejected (mirrors canTransitionAllocationStatus, and
-- keeps an empty audit row from ever being written by a status "flip").
create or replace function tower.rb_alloc_status_guard() returns trigger
language plpgsql security definer set search_path = tower, public as $fn$
begin
  if new.status is not distinct from old.status then
    raise exception 'RB_ALLOC_STATUS_NOOP'
      using hint = 'status unchanged — nothing to transition';
  end if;

  if not (
       (old.status = 'RESERVED'  and new.status in ('CONFIRMED','RELEASED'))
    or (old.status = 'CONFIRMED' and new.status = 'LOADED')
    or (old.status = 'LOADED'    and new.status = 'RELEASED')
  ) then
    raise exception 'RB_ALLOC_ILLEGAL_TRANSITION: % -> %', old.status, new.status;
  end if;

  return new;
end $fn$;

drop trigger if exists rb_slot_allocations_status_guard on tower.rb_slot_allocations;
create trigger rb_slot_allocations_status_guard
  before update of status on tower.rb_slot_allocations
  for each row execute function tower.rb_alloc_status_guard();

-- ── 2 · RLS UPDATE policy + column privilege ────────────────────────────────
-- Authorisation is has_rb_role through the container (rb_alloc_read's join),
-- MANAGER/OPS only — a BRAND_VIEWER may read allocations but never advance them.
create policy rb_alloc_upd on tower.rb_slot_allocations for update
  using ( exists (select 1 from tower.rb_containers c
                  where c.id = rb_container_id
                    and has_rb_role(c.represented_brand_id,
                                    array['BRAND_MANAGER','BRAND_OPS'])) )
  with check ( exists (select 1 from tower.rb_containers c
                       where c.id = rb_container_id
                         and has_rb_role(c.represented_brand_id,
                                         array['BRAND_MANAGER','BRAND_OPS'])) );

-- Column privilege: the authenticated (rep) path may write ONLY status. slots,
-- quantity_units, expires_at, rb_container_id and lead_id stay service-role only
-- so a rep can never rewrite the ledger the subtraction rule reads. service_role
-- keeps full write (tower_11 grant all … to service_role).
revoke update on tower.rb_slot_allocations from authenticated;
grant  update (status) on tower.rb_slot_allocations to authenticated;

-- ── 3 · Expiry job (idempotent) ─────────────────────────────────────────────
-- Flips RESERVED rows whose expiry has passed to RELEASED for the ledger. The
-- subtraction rule (tower.rb_slots_taken) already stops counting them the moment
-- they expire — this is the durable book-keeping flip, not the availability
-- correction. Idempotent: a second run finds nothing (the rows are RELEASED, no
-- longer RESERVED). The status guard allows RESERVED→RELEASED, so no bypass.
-- Returns the number of allocations released.
create or replace function tower.rb_release_expired_allocations() returns int
language plpgsql security definer set search_path = tower, public as $fn$
declare
  v_released int;
begin
  with expired as (
    update tower.rb_slot_allocations
       set status = 'RELEASED'
     where status = 'RESERVED'
       and expires_at is not null
       and expires_at < now()
    returning 1
  )
  select count(*)::int into v_released from expired;
  return v_released;
end $fn$;

revoke all on function tower.rb_release_expired_allocations() from public, anon, authenticated;
grant execute on function tower.rb_release_expired_allocations() to service_role;

-- Public wrapper so cron/n8n can drive it through the exposed public schema
-- (tower is not PostgREST-exposed — same contract as public.rb_reserve).
create or replace function public.rb_release_expired_allocations() returns int
language sql security definer set search_path = tower, public as $$
  select tower.rb_release_expired_allocations();
$$;

revoke all on function public.rb_release_expired_allocations() from public, anon, authenticated;
grant execute on function public.rb_release_expired_allocations() to service_role;

-- ── 4 · Schedule — hourly sweep (idempotent reschedule, tower_09 style) ──────
-- pg_cron already installed by tower_09. Guard the unschedule so this migration
-- is safe to re-run; n8n may also call the wrapper on its own cadence.
select cron.unschedule(jobid) from cron.job where jobname = 'rb_release_expired_allocations';
select cron.schedule('rb_release_expired_allocations', '0 * * * *',
  $cron$ select tower.rb_release_expired_allocations() $cron$);
