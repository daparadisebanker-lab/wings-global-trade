-- TOWER migration 11 · role grants (privileges are separate from RLS; without these the API roles can't reach the schema)
-- Internal app: anon gets nothing. authenticated = logged-in staff (RLS filters rows). service_role = full.
grant usage on schema tower to authenticated, service_role;

grant all on all tables in schema tower to service_role;
grant all on all sequences in schema tower to service_role;

-- staff DML on domain tables; no DELETE (append-only, defense in depth alongside no-delete RLS)
grant select, insert, update on all tables in schema tower to authenticated;

-- analytics surface is service-role only: raw events (+ partitions) and the rollup matview
revoke all on tower.events from authenticated;
revoke all on tower.events_202607 from authenticated;
revoke all on tower.events_202608 from authenticated;
revoke all on tower.metric_rollups_daily from authenticated;

-- future domain tables/sequences inherit the same grants
alter default privileges in schema tower grant select, insert, update on tables to authenticated;
alter default privileges in schema tower grant all on tables to service_role;
alter default privileges in schema tower grant all on sequences to service_role;
