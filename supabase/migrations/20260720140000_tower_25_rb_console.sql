-- tower_25 · RB Console Wave 1 — represented-brand tenancy + RLS + audit
-- (represented-brands-console SPEC §R3 ledger; carved verbatim from DATA_MODEL.sql §1).
-- Additive only: adds rb_memberships + has_rb_role, turns the shipped RB tables'
-- deny-all RLS into per-tenant scoping, revokes the two publish-gate columns from
-- the authenticated path, attaches audit triggers, and widens rb_public_brands.
-- Never alters the shipped rb_wave1 objects destructively.

set search_path to tower, public;

-- 1.1 Multi-rep membership (mirror of lane_memberships, brand-scoped)
create table if not exists rb_memberships (
  user_id              uuid not null references profiles(id) on delete cascade,
  represented_brand_id uuid not null references represented_brands(id) on delete cascade,
  role text not null check (role in ('BRAND_MANAGER','BRAND_OPS','BRAND_VIEWER')),
  primary key (user_id, represented_brand_id, role)
);
create index if not exists rb_memberships_brand_idx on rb_memberships (represented_brand_id);

alter table rb_memberships enable row level security;
create policy rb_memberships_read on rb_memberships for select
  using ( user_id = auth.uid() or is_group_admin() );
create policy rb_memberships_admin_ins on rb_memberships for insert
  with check ( is_group_admin() );
create policy rb_memberships_admin_upd on rb_memberships for update
  using ( is_group_admin() ) with check ( is_group_admin() );
create policy rb_memberships_admin_del on rb_memberships for delete
  using ( is_group_admin() );

-- 1.2 The scoping predicate — byte-for-byte the has_lane_role shape
create or replace function has_rb_role(p_brand uuid, p_roles text[]) returns boolean
language sql stable security definer set search_path = tower, public as
$$ select is_group_admin() or exists (
     select 1 from rb_memberships m
     where m.user_id = auth.uid()
       and m.represented_brand_id = p_brand
       and m.role = any(p_roles)) $$;

-- 1.3 Per-tenant RLS on the five shipped RB tables (deny-all → scoped).
-- Column revoke: status + kit_complete are the publish gate — service-role only.
revoke update (status, kit_complete) on represented_brands from authenticated;

create policy rb_brands_read on represented_brands for select
  using ( has_rb_role(id, array['BRAND_MANAGER','BRAND_OPS','BRAND_VIEWER']) );
create policy rb_brands_upd on represented_brands for update
  using ( has_rb_role(id, array['BRAND_MANAGER']) )
  with check ( has_rb_role(id, array['BRAND_MANAGER']) );

create policy rb_profiles_read on rb_packing_profiles for select
  using ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS','BRAND_VIEWER']) );
create policy rb_profiles_ins on rb_packing_profiles for insert
  with check ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) );
create policy rb_profiles_upd on rb_packing_profiles for update
  using ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) )
  with check ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) );

create policy rb_templates_read on rb_container_templates for select
  using ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS','BRAND_VIEWER']) );
create policy rb_templates_ins on rb_container_templates for insert
  with check ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) );
create policy rb_templates_upd on rb_container_templates for update
  using ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) )
  with check ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) );

create policy rb_containers_read on rb_containers for select
  using ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS','BRAND_VIEWER']) );
create policy rb_containers_ins on rb_containers for insert
  with check ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) );
create policy rb_containers_upd on rb_containers for update
  using ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) )
  with check ( has_rb_role(represented_brand_id, array['BRAND_MANAGER','BRAND_OPS']) );

-- allocations: no represented_brand_id — resolve brand through the container.
-- (The UPDATE policy for the status machine lands in Wave 3 / DATA_MODEL §3, R5.)
create policy rb_alloc_read on rb_slot_allocations for select
  using ( exists (select 1 from rb_containers c where c.id = rb_container_id
          and has_rb_role(c.represented_brand_id,
                          array['BRAND_MANAGER','BRAND_OPS','BRAND_VIEWER'])) );

-- 1.4 Audit triggers — close the append-only gap on the shipped RB tables.
do $do$ declare t text;
  tbls text[] := array['represented_brands','rb_packing_profiles',
                       'rb_container_templates','rb_containers','rb_slot_allocations'];
begin
  foreach t in array tbls loop
    execute format('drop trigger if exists audit_%1$s on tower.%1$I', t);
    execute format(
      'create trigger audit_%1$s after insert or update or delete on tower.%1$I '
      'for each row execute function tower.audit_trigger()', t);
  end loop;
end $do$;

-- 1.5 Widen public.rb_public_brands (view replace = additive; the ONLY shipped
-- view this program changes — R10). mandate is projected public-safe.
create or replace view public.rb_public_brands as
select b.code, b.slug, b.name, b.categories,
       b.identity,
       jsonb_build_object(
         'territory',   b.mandate -> 'territory',
         'scope',       b.mandate -> 'scope',
         'exclusivity', b.mandate -> 'exclusivity'
       ) as mandate_public,
       b.content
from tower.represented_brands b
where b.status = 'LIVE';
grant select on public.rb_public_brands to service_role;
