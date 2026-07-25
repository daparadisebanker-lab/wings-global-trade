-- TOWER migration 57 · Audit triggers for the team-space tables (Directive 4 gap)
--
-- tower_55 (team_space) shipped `team_notes` + `team_note_mentions` without the
-- `audit_trigger()` every mutating table must carry (root law / Directive 4). That
-- migration was applied to prod before its file was recovered, so it was committed
-- verbatim (as-applied) rather than edited. This closes the gap FORWARD, the only
-- legal way: attach the shared generic trigger to both tables. Both have a uuid `id`
-- so audit_log.row_id is captured. Idempotent (drop-if-exists), matching the
-- tower_07 attach idiom.
set search_path to tower, public;

drop trigger if exists audit_team_notes on tower.team_notes;
create trigger audit_team_notes
  after insert or update or delete on tower.team_notes
  for each row execute function tower.audit_trigger();

drop trigger if exists audit_team_note_mentions on tower.team_note_mentions;
create trigger audit_team_note_mentions
  after insert or update or delete on tower.team_note_mentions
  for each row execute function tower.audit_trigger();
