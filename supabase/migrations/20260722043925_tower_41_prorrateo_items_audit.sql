-- tower_41 · Audit trigger for prorrateo_items (closes L4 audit gap)
-- tower_23 attached tower.audit_trigger() to cost_calculations, prorrateo_runs
-- and costing_config but OMITTED prorrateo_items, so the per-item cost-allocation
-- rows mutate without a trail in tower.audit_log — a gap against Directive 4
-- (every mutating table gets the audit trigger). prorrateo_items is an
-- insert-only child of prorrateo_runs (ON DELETE CASCADE), so a run deletion
-- cascades its items; auditing INSERT/UPDATE/DELETE brings it to parity with its
-- parent and the rest of the costing family.
--
-- Uses the exact trigger-naming + event convention from tower_23/40; idempotent
-- drop-then-create so the migration is safe to re-run.

set search_path to tower, public;

drop trigger if exists audit_prorrateo_items on tower.prorrateo_items;
create trigger audit_prorrateo_items after insert or update or delete
  on tower.prorrateo_items for each row execute function tower.audit_trigger();
