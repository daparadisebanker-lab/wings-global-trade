-- tower_42 · Tamper-evident hash-chain over tower.audit_log
--
-- The audit trail (tower_06/07) records actor + before/after + timestamp, but a
-- privileged writer (service role, or anyone who reaches the DB) could rewrite or
-- delete a past entry and leave no evidence. A financial-grade audit log must be
-- tamper-EVIDENT: each entry commits to the entire history before it, so any
-- edit/deletion/reordering breaks the chain and is detectable.
--
-- Design:
--   entry_hash = sha256( prev_hash ‖ payload )
--   payload    = seq ‖ at(UTC) ‖ actor ‖ table ‖ row_id ‖ action ‖ before ‖ after
-- where prev_hash is the previous entry's entry_hash (genesis uses a sentinel).
-- chain_seq is assigned INSIDE the chain trigger under a transaction advisory
-- lock — NOT from a sequence/identity default, because default-time assignment
-- order does not match commit order under concurrency and would fork the chain.
-- The lock serialises "read head → link → insert" so the chain is strictly
-- linear. audit_log is also made hard append-only (UPDATE/DELETE blocked) so the
-- chain cannot be silently rewritten through the same definer path.
--
-- Canonicalisation lives in ONE function (audit_entry_payload) shared by the
-- backfill, the live trigger, and the verifier, so all three agree byte-for-byte.
-- `at` is rendered in UTC with microsecond precision so the hash is independent
-- of session TimeZone.
--
-- Post-deploy: run `select * from tower.verify_audit_chain();` — expect
-- (ok=true, chain intact). Re-run any time to attest the trail is unbroken.

set search_path to tower, public, extensions;

-- pgcrypto provides digest(); on Supabase it lives in the extensions schema.
create extension if not exists pgcrypto with schema extensions;

-- ── Columns ─────────────────────────────────────────────────────────────────
alter table tower.audit_log add column if not exists chain_seq  bigint;
alter table tower.audit_log add column if not exists prev_hash  text;   -- null only at genesis
alter table tower.audit_log add column if not exists entry_hash text;

-- ── Canonical payload (single source of truth for all three consumers) ───────
-- Record-separator (U+001E) delimited; jsonb rendered via ::text (deterministic
-- for a given jsonb value); timestamp pinned to UTC microseconds.
create or replace function tower.audit_entry_payload(
  p_seq bigint, p_at timestamptz, p_actor uuid, p_table text,
  p_row uuid, p_action text, p_before jsonb, p_after jsonb
) returns text language sql immutable as $fn$
  select p_seq::text
      || E'\x1e' || to_char((p_at at time zone 'UTC'), 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')
      || E'\x1e' || coalesce(p_actor::text, '')
      || E'\x1e' || p_table
      || E'\x1e' || coalesce(p_row::text, '')
      || E'\x1e' || p_action
      || E'\x1e' || coalesce(p_before::text, '')
      || E'\x1e' || coalesce(p_after::text, '')
$fn$;

-- Hash helper: sha256(prev ‖ payload) as lowercase hex. Genesis prev → 'GENESIS'.
create or replace function tower.audit_chain_hash(p_prev text, p_payload text)
returns text language sql immutable set search_path = tower, public, extensions as $fn$
  select encode(
    digest(convert_to(coalesce(p_prev, 'GENESIS') || E'\x1e' || p_payload, 'UTF8'), 'sha256'),
    'hex')
$fn$;

-- ── Backfill existing rows into a chain (deterministic order by identity id) ──
-- Runs BEFORE the append-only + chain triggers exist, so these UPDATEs are legal.
do $do$
declare
  r         record;
  v_prev    text := null;
  v_seq     bigint := 0;
  v_payload text;
  v_hash    text;
begin
  for r in select * from tower.audit_log order by id asc loop
    v_seq := v_seq + 1;
    v_payload := tower.audit_entry_payload(v_seq, r.at, r.actor, r.table_name, r.row_id, r.action, r.before, r.after);
    v_hash := tower.audit_chain_hash(v_prev, v_payload);
    update tower.audit_log set chain_seq = v_seq, prev_hash = v_prev, entry_hash = v_hash where id = r.id;
    v_prev := v_hash;
  end loop;
end $do$;

-- Now the chain columns are populated for every row → enforce their invariants.
alter table tower.audit_log alter column chain_seq set not null;
alter table tower.audit_log alter column entry_hash set not null;
create unique index if not exists audit_log_chain_seq_key on tower.audit_log(chain_seq);

-- ── Live chain trigger (BEFORE INSERT) ───────────────────────────────────────
create or replace function tower.audit_log_chain() returns trigger
language plpgsql security definer set search_path = tower, public, extensions as $fn$
declare
  v_prev    text;
  v_seq     bigint;
  v_payload text;
begin
  -- Serialise the read-head→link→insert critical section for the whole chain.
  perform pg_advisory_xact_lock(918273645);
  select chain_seq, entry_hash into v_seq, v_prev
    from tower.audit_log order by chain_seq desc limit 1;

  new.chain_seq := coalesce(v_seq, 0) + 1;
  new.prev_hash := v_prev;  -- null at genesis
  v_payload := tower.audit_entry_payload(
    new.chain_seq, new.at, new.actor, new.table_name, new.row_id, new.action, new.before, new.after);
  new.entry_hash := tower.audit_chain_hash(new.prev_hash, v_payload);
  return new;
end $fn$;

drop trigger if exists audit_log_chain on tower.audit_log;
create trigger audit_log_chain before insert on tower.audit_log
  for each row execute function tower.audit_log_chain();

-- ── Hard append-only: block UPDATE/DELETE so the chain cannot be rewritten ────
create or replace function tower.audit_log_immutable() returns trigger
language plpgsql as $fn$
begin
  raise exception 'tower.audit_log is append-only (hash-chained): % is not permitted', tg_op;
end $fn$;

drop trigger if exists audit_log_no_update on tower.audit_log;
create trigger audit_log_no_update before update on tower.audit_log
  for each row execute function tower.audit_log_immutable();
drop trigger if exists audit_log_no_delete on tower.audit_log;
create trigger audit_log_no_delete before delete on tower.audit_log
  for each row execute function tower.audit_log_immutable();

-- ── Verifier: walk the chain, recompute, report the first break (or intact) ──
create or replace function tower.verify_audit_chain()
returns table(ok boolean, broken_seq bigint, detail text)
language plpgsql security definer set search_path = tower, public, extensions as $fn$
declare
  r          record;
  v_prev     text := null;
  v_payload  text;
  v_expected text;
begin
  for r in select * from tower.audit_log order by chain_seq asc loop
    if r.prev_hash is distinct from v_prev then
      return query select false, r.chain_seq,
        format('prev_hash link broken at seq %s (stored=%s expected=%s)', r.chain_seq, r.prev_hash, v_prev);
      return;
    end if;
    v_payload := tower.audit_entry_payload(r.chain_seq, r.at, r.actor, r.table_name, r.row_id, r.action, r.before, r.after);
    v_expected := tower.audit_chain_hash(r.prev_hash, v_payload);
    if r.entry_hash is distinct from v_expected then
      return query select false, r.chain_seq,
        format('entry_hash mismatch at seq %s (row content altered)', r.chain_seq);
      return;
    end if;
    v_prev := r.entry_hash;
  end loop;
  return query select true, null::bigint, 'chain intact'::text;
end $fn$;
