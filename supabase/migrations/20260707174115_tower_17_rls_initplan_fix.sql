-- TOWER Wave 5 · performance-advisor fix: wrap direct auth.uid() in (select auth.uid())
-- so it's evaluated once per statement (initplan) instead of per row.
-- Scope: exactly the six policies flagged by auth_rls_initplan. Semantics unchanged.
set search_path to tower, public;

drop policy lanes_read on tower.lanes;
create policy lanes_read on tower.lanes for select using (
  tower.is_group_admin() or exists (
    select 1 from tower.lane_memberships m
    where m.user_id = (select auth.uid()) and m.lane_id = id));

drop policy profiles_read on tower.profiles;
create policy profiles_read on tower.profiles for select
  using (id = (select auth.uid()) or tower.is_group_admin());

drop policy profiles_self_ins on tower.profiles;
create policy profiles_self_ins on tower.profiles for insert
  with check (id = (select auth.uid()) or tower.is_group_admin());

drop policy profiles_upd on tower.profiles;
create policy profiles_upd on tower.profiles for update
  using (id = (select auth.uid()) or tower.is_group_admin())
  with check (case when tower.is_group_admin() then true else is_group_admin = false end);

drop policy memberships_read on tower.lane_memberships;
create policy memberships_read on tower.lane_memberships for select
  using (user_id = (select auth.uid()) or tower.is_group_admin());

drop policy spec_read on tower.spec_schemas;
create policy spec_read on tower.spec_schemas for select using (
  tower.is_group_admin() or lane_id is null
  or exists (
    select 1 from tower.lane_memberships m
    where m.user_id = (select auth.uid()) and m.lane_id = lane_id));
