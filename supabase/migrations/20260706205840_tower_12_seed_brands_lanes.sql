-- TOWER seed · brands (wings, aladin) + wings lanes WGT/01–06 (archetypes per ecosystem CLAUDE.md §3). Idempotent.
set search_path to tower, public;

insert into tower.brands (slug, name) values
  ('wings','Wings Global Trade'),
  ('aladin','Aladin Exports')
on conflict (slug) do nothing;

insert into tower.lanes (brand_id, code, slug, name, archetype, status)
select b.id, v.code, v.slug, v.name, v.archetype, 'OPENING'
from (values
  ('WGT/01','machinery','Machinery','EQUIPMENT'),
  ('WGT/02','interiors','Interiors','PROJECT'),
  ('WGT/03','provisions','Provisions','COMMODITY'),
  ('WGT/04','living','Living','PROGRAM'),
  ('WGT/05','representation','Representation','CREDENTIAL'),
  ('WGT/06','export','Export','ORIGIN')
) as v(code, slug, name, archetype)
cross join (select id from tower.brands where slug='wings') b
on conflict (code) do nothing;
