-- tower_32 · Group-admin column guard + team bootstrap note.
-- The small core team all run as group admins (the "sees + does everything"
-- tier — is_group_admin bypasses every RLS policy and shows every module; the
-- fine-grained lane/brand roles are for external reps + future scale). Promotion
-- happens through setUserGroupAdmin (group-admin gated, service-role). This
-- revoke is defense in depth: no authenticated user can self-promote via a
-- direct PostgREST PATCH of their own profile — only the service-role writer moves it.

set search_path to tower;

revoke update (is_group_admin) on profiles from authenticated;

-- ── Bootstrap the first admin (run ONCE, after the founder has signed in) ─────
-- There is no admin yet to grant the first admin, so seed it by email. Replace
-- the address, then setUserGroupAdmin handles everyone else from the UserManager.
--
--   update tower.profiles p set is_group_admin = true
--   from auth.users u
--   where u.id = p.id and u.email = 'founder@wingsglobaltrade.com';
--
-- (Left as a comment — a migration must not hardcode a real person's email.)
