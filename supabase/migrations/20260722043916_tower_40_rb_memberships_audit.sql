-- tower_40 · Audit trigger for rb_memberships (closes M3 audit gap)
-- rb_memberships (tower_25) records who can access a represented-brand tenant —
-- a security-sensitive grant/revoke, and the only membership table carrying a
-- DELETE policy (rb_memberships_admin_del). It shipped WITHOUT an audit trigger,
-- so grants/revocations left no trail in tower.audit_log — violating Directive 4
-- (append-only worlds: every mutating table gets the audit trigger). Its sibling
-- lane_memberships is audited (tower_07); this brings rb_memberships to parity.
--
-- Attaches the generic tower.audit_trigger() covering INSERT/UPDATE/DELETE, using
-- the exact trigger-naming + event convention from tower_07/25/26/30. Idempotent
-- drop-then-create mirrors the RB-family pattern in tower_07 and tower_25.
--
-- Note on row identity: rb_memberships has a COMPOSITE primary key
-- (user_id, represented_brand_id, role) and no scalar `id` column, so the generic
-- trigger records audit_log.row_id = NULL. Identity is still fully captured — the
-- trigger serializes the whole row to jsonb: `before` on DELETE/UPDATE and `after`
-- on INSERT/UPDATE. No per-column work is required.

set search_path to tower, public;

drop trigger if exists audit_rb_memberships on tower.rb_memberships;
create trigger audit_rb_memberships after insert or update or delete
  on tower.rb_memberships for each row execute function tower.audit_trigger();
