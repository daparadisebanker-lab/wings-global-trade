-- TOWER · RLS isolation test (Wave 1, W1.2)
-- Self-contained: seeds fixtures, asserts cross-lane + cross-brand isolation and the
-- publish/write guards, then ROLLS BACK — nothing persists on the DB.
-- Run:  psql "$DATABASE_URL" -f rls_test.sql   (or via Supabase execute_sql)
-- Personas: group admin · WGT/01 CATALOG_EDITOR · WGT/02 LANE_DIRECTOR · Áladín SALES.

begin;

-- ---- fixtures (as the migration/service role; bypasses RLS) ----
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1','admin@tower.test'),
  ('00000000-0000-0000-0000-0000000000e1','editor01@tower.test'),
  ('00000000-0000-0000-0000-0000000000d2','director02@tower.test'),
  ('00000000-0000-0000-0000-0000000000a4','aladin.sales@tower.test');

insert into tower.brands (id, slug, name) values
  ('00000000-0000-0000-0000-0000000000b1','wings','Wings Global Trade'),
  ('00000000-0000-0000-0000-0000000000b2','aladin','Áladín Exports');

insert into tower.lanes (id, brand_id, code, slug, name, archetype) values
  ('00000000-0000-0000-0000-0000000000c1','00000000-0000-0000-0000-0000000000b1','WGT/01','machinery','Machinery','EQUIPMENT'),
  ('00000000-0000-0000-0000-0000000000c2','00000000-0000-0000-0000-0000000000b1','WGT/02','interiors','Interiors','PROJECT'),
  ('00000000-0000-0000-0000-0000000000ca','00000000-0000-0000-0000-0000000000b2','ALD/01','origin','Origin','ORIGIN');

insert into tower.profiles (id, full_name, is_group_admin) values
  ('00000000-0000-0000-0000-0000000000a1','Group Admin', true),
  ('00000000-0000-0000-0000-0000000000e1','Editor One', false),
  ('00000000-0000-0000-0000-0000000000d2','Director Two', false),
  ('00000000-0000-0000-0000-0000000000a4','Aladin Sales', false);

insert into tower.lane_memberships (user_id, lane_id, role) values
  ('00000000-0000-0000-0000-0000000000e1','00000000-0000-0000-0000-0000000000c1','CATALOG_EDITOR'),
  ('00000000-0000-0000-0000-0000000000d2','00000000-0000-0000-0000-0000000000c2','LANE_DIRECTOR'),
  ('00000000-0000-0000-0000-0000000000a4','00000000-0000-0000-0000-0000000000ca','SALES');

insert into tower.products (id, brand_id, lane_id, slug, name) values
  ('00000000-0000-0000-0000-0000000000f1','00000000-0000-0000-0000-0000000000b1','00000000-0000-0000-0000-0000000000c1','p01','{"es":"Excavadora","en":"Excavator"}'),
  ('00000000-0000-0000-0000-0000000000f2','00000000-0000-0000-0000-0000000000b1','00000000-0000-0000-0000-0000000000c2','p02','{"es":"Butaca","en":"Armchair"}'),
  ('00000000-0000-0000-0000-0000000000fa','00000000-0000-0000-0000-0000000000b2','00000000-0000-0000-0000-0000000000ca','pa1','{"es":"Quinua","en":"Quinoa"}');

-- ---- switch to the API role; identity comes from request.jwt.claims ----
set local role authenticated;

-- PERSONA: WGT/01 CATALOG_EDITOR (wings)
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-0000000000e1","role":"authenticated"}', true);
do $$ begin
  if (select count(*) from tower.products) <> 1 then
    raise exception 'FAIL editor01: expected 1 visible product, saw %', (select count(*) from tower.products); end if;
  if not exists (select 1 from tower.products where id='00000000-0000-0000-0000-0000000000f1') then
    raise exception 'FAIL editor01: cannot see own WGT/01 product'; end if;
  -- cross-lane + cross-brand isolation
  if exists (select 1 from tower.products where id in
      ('00000000-0000-0000-0000-0000000000f2','00000000-0000-0000-0000-0000000000fa')) then
    raise exception 'FAIL editor01: leaked WGT/02 or Áladín product'; end if;
end $$;
-- editor01 must NOT insert into WGT/02 (no membership there)
do $$ begin
  begin
    insert into tower.products (id, brand_id, lane_id, slug, name) values
      ('00000000-0000-0000-0000-0000000000ab','00000000-0000-0000-0000-0000000000b1','00000000-0000-0000-0000-0000000000c2','x','{"es":"x","en":"x"}');
    raise exception 'FAIL editor01: was allowed to insert into WGT/02';
  exception when insufficient_privilege then null; end;
end $$;
-- editor01 must NOT publish (only LANE_DIRECTOR flips PUBLISHED)
do $$ begin
  begin
    update tower.products set status='PUBLISHED' where id='00000000-0000-0000-0000-0000000000f1';
    raise exception 'FAIL editor01: was allowed to PUBLISH';
  exception when insufficient_privilege then null; end;
end $$;

-- PERSONA: WGT/02 LANE_DIRECTOR (wings)
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-0000000000d2","role":"authenticated"}', true);
do $$ begin
  if (select count(*) from tower.products) <> 1
     or not exists (select 1 from tower.products where id='00000000-0000-0000-0000-0000000000f2') then
    raise exception 'FAIL director02: should see exactly its WGT/02 product'; end if;
end $$;
-- director02 MAY publish its own product
do $$ begin
  update tower.products set status='PUBLISHED' where id='00000000-0000-0000-0000-0000000000f2';
  if not exists (select 1 from tower.products where id='00000000-0000-0000-0000-0000000000f2' and status='PUBLISHED') then
    raise exception 'FAIL director02: could not publish own product'; end if;
end $$;

-- PERSONA: Áladín SALES — cross-brand isolation
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-0000000000a4","role":"authenticated"}', true);
do $$ begin
  if (select count(*) from tower.products) <> 1
     or not exists (select 1 from tower.products where id='00000000-0000-0000-0000-0000000000fa') then
    raise exception 'FAIL aladin.sales: should see exactly the Áladín product'; end if;
  if exists (select 1 from tower.products where brand_id='00000000-0000-0000-0000-0000000000b1') then
    raise exception 'FAIL aladin.sales: leaked a Wings product across tenants'; end if;
end $$;

-- PERSONA: GROUP ADMIN — sees everything
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', true);
do $$ begin
  if (select count(*) from tower.products) <> 3 then
    raise exception 'FAIL admin: expected 3 products, saw %', (select count(*) from tower.products); end if;
end $$;

reset role;
select 'RLS TESTS PASSED' as result;
rollback;
