-- TOWER Wave 5 deploy prereq (D-13 §1): expose schema `tower` to PostgREST.
-- Verified before applying: authenticator has NO pgrst.db_schemas role setting and
-- the only schemas in the DB are the Supabase defaults + tower, so this in-database
-- config (which takes precedence over platform config) reproduces the default list
-- additively. PostgREST reloads via NOTIFY (config + schema cache).
-- Verified after applying: service-role read of tower.lanes via /rest/v1 returns all
-- six lanes; public-schema reads unaffected; anon correctly denied on tower.
alter role authenticator set pgrst.db_schemas = 'public, storage, graphql_public, tower';
notify pgrst, 'reload config';
notify pgrst, 'reload schema';
