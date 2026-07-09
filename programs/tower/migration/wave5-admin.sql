-- TOWER · Wave 5 (W5.A Admin) · PROPOSED SQL — artifact only.
-- NOT APPLIED by this agent. The Conductor reviews and applies all DB changes.
-- No Supabase MCP tool was called; nothing here has touched the live project.
--
-- Context — the shipped admin.ts uses the SERVICE-ROLE client for every admin
-- read/write, gated by a DB-resolved group-admin check (requireGroupAdmin reads
-- profiles.is_group_admin through the RLS-scoped client). Rationale: the admin
-- module operates on the identity/tenant tables (profiles, lane_memberships,
-- lanes, brands) which have no lane_id to scope by and are inherently cross-user
-- / cross-brand — lane RLS cannot express "a group admin administers everyone",
-- and inviteUser needs the auth admin API regardless. So MOST of this file is
-- NOT required for the feature to run. Exactly one item (§1) is a genuine gap
-- the shipped UI needs; §2 upholds the append-only audit law; §3 is OPTIONAL,
-- only if the Conductor prefers an authenticated-client admin path instead.

set search_path to tower, public;

-- ============================================================
-- 1 · brands.status — REQUIRED for BrandManager status flips
-- ============================================================
-- DATABASE_SCHEMA.sql ships brands as (id, slug, name, created_at) with NO
-- status column, but COMPONENT_TREE §6 BrandManager + the wave brief require
-- "status management … retire, never delete". Until this column exists,
-- setBrandStatus() returns a clear VALIDATION error (Postgres 42703) and
-- listBrands() reads every brand as ACTIVE — the app does not crash, it just
-- can't retire a brand. Append-only spirit (Directive 4): retire via status,
-- never DELETE. No delete policy/grant is added anywhere.
alter table tower.brands
  add column if not exists status text not null default 'ACTIVE'
    check (status in ('ACTIVE', 'RETIRED'));

-- ============================================================
-- 2 · Audit triggers on the identity/tenant tables (ADR-6 / Directive 4)
-- ============================================================
-- "Trigger-based audit_log on all mutating tables … non-negotiable." The admin
-- module is the first surface to mutate profiles / lane_memberships / lanes /
-- brands from the app, so those four must carry the audit trigger before this
-- wave's UI is trusted in prod. Idempotent: attaches tower.audit_trigger()
-- (defined in Wave 1, reused by W3/W4) only where absent. If Wave 1 already
-- attached them, this block is a no-op.
do $$
declare
  t text;
begin
  foreach t in array array['profiles', 'lane_memberships', 'lanes', 'brands'] loop
    if not exists (
      select 1 from pg_trigger
      where tgrelid = ('tower.' || t)::regclass
        and tgname = 'audit_' || t
    ) then
      execute format(
        'create trigger %I after insert or update or delete on tower.%I
           for each row execute function tower.audit_trigger()',
        'audit_' || t, t
      );
    end if;
  end loop;
end $$;

-- ============================================================
-- 3 · OPTIONAL — group-admin RLS policies (NOT needed by shipped code)
-- ============================================================
-- Only apply this section if TOWER later moves admin reads/writes off the
-- service-role client and onto the authenticated client. It grants a group
-- admin (is_group_admin()) full reach over the identity/tenant tables through
-- RLS, so requireGroupAdmin could then use the RLS-scoped client instead of the
-- service role. The shipped Wave-5 code does NOT depend on any of this.
--
-- NOTE on profiles (D-07): the current policy already lets a group admin read
-- every profile (is_group_admin() is in its SELECT using-clause) — do NOT widen
-- the read. What's missing for an authenticated-client path is group-admin
-- WRITE on these tables. Shown for completeness; commented out by default.
--
-- -- lane_memberships: group admin reads all + manages all
-- create policy lane_memberships_admin_read on tower.lane_memberships for select
--   using ( is_group_admin() or user_id = auth.uid() );
-- create policy lane_memberships_admin_write on tower.lane_memberships for insert
--   with check ( is_group_admin() );
-- create policy lane_memberships_admin_delete on tower.lane_memberships for delete
--   using ( is_group_admin() );
--   -- NB: this is the one place a DELETE policy is intentional — a membership
--   -- revocation is a real row delete (lane_memberships is NOT an append-only
--   -- world; Directive 4 lists lane codes / container codes / product_versions /
--   -- audit_log / events, not memberships). Scoped strictly to group admins.
--
-- -- lanes: group admin registers + flips status (append-only code enforced in app)
-- create policy lanes_admin_write on tower.lanes for insert with check ( is_group_admin() );
-- create policy lanes_admin_update on tower.lanes for update using ( is_group_admin() );
--
-- -- brands: group admin creates + retires
-- create policy brands_admin_write on tower.brands for insert with check ( is_group_admin() );
-- create policy brands_admin_update on tower.brands for update using ( is_group_admin() );
--
-- -- profiles: group admin may flip is_group_admin / edit names (WRITE only —
-- -- read already covered by the D-07 policy). Not exercised by Wave-5 UI.
-- create policy profiles_admin_update on tower.profiles for update using ( is_group_admin() );
