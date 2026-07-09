-- TOWER Wave 5 · BUILD_PROMPT demo seed: 3 demo products per lane WGT/02–06 (WGT/01
-- already carries the 99 real imported products), one SHARED container on WGT/01 with
-- two commitments, one demo RFQ per archetype (stage = the archetype's first stage id,
-- unit = the archetype's default unit, from lib/archetypes/config.ts). Idempotent.
-- Demo rows are unmistakably prefixed; the demo container code WGT/01-DEMO1 stays
-- outside the real append-only C-number sequence.
set search_path to tower, public;

-- demo wholesale account (RFQs + commitments hang off it)
insert into tower.accounts (id, brand_id, name, country, region)
select '00000000-0000-0000-0000-00000000de01', b.id, 'DEMO — Comprador Mayorista / Wholesale Buyer', 'PE', 'LATAM'
from tower.brands b where b.slug = 'wings'
  and not exists (select 1 from tower.accounts where id = '00000000-0000-0000-0000-00000000de01');

-- 3 demo DRAFT products per lane WGT/02–06
insert into tower.products (brand_id, lane_id, slug, status, name, specs, category_path)
select l.brand_id, l.id, 'demo-' || l.slug || '-' || n, 'DRAFT',
       jsonb_build_object(
         'es', 'DEMO — Producto ' || n || ' (' || l.name || ')',
         'en', 'DEMO — Product '  || n || ' (' || l.name || ')'),
       '{}'::jsonb, array['demo']
from tower.lanes l cross join generate_series(1,3) n
where l.code in ('WGT/02','WGT/03','WGT/04','WGT/05','WGT/06')
  and not exists (select 1 from tower.products p
                  where p.lane_id = l.id and p.slug = 'demo-' || l.slug || '-' || n);

-- one SHARED 40HC container on WGT/01
insert into tower.containers (id, brand_id, lane_id, code, kind, capacity_cbm, mode, status)
select '00000000-0000-0000-0000-00000000dc01', l.brand_id, l.id, 'WGT/01-DEMO1', '40HC', 76, 'SHARED', 'FILLING'
from tower.lanes l where l.code = 'WGT/01'
  and not exists (select 1 from tower.containers where code = 'WGT/01-DEMO1');

-- two commitments on it
insert into tower.container_commitments (id, container_id, account_id, cbm, status)
select v.id::uuid, '00000000-0000-0000-0000-00000000dc01', '00000000-0000-0000-0000-00000000de01', v.cbm, v.status
from (values
  ('00000000-0000-0000-0000-00000000cc01', 18.5, 'CONFIRMED'),
  ('00000000-0000-0000-0000-00000000cc02', 12.0, 'RESERVED')
) as v(id, cbm, status)
where exists (select 1 from tower.containers where id = '00000000-0000-0000-0000-00000000dc01')
  and not exists (select 1 from tower.container_commitments where id = v.id::uuid);

-- one demo RFQ per archetype (first stage id from the archetype config) + one line each
insert into tower.rfqs (id, brand_id, lane_id, account_id, source, stage, currency)
select v.id::uuid, l.brand_id, l.id, '00000000-0000-0000-0000-00000000de01', 'MANUAL', v.stage, 'USD'
from (values
  ('00000000-0000-0000-0000-00000000aa01','WGT/01','inquiry'),
  ('00000000-0000-0000-0000-00000000aa02','WGT/02','brief'),
  ('00000000-0000-0000-0000-00000000aa03','WGT/03','inquiry'),
  ('00000000-0000-0000-0000-00000000aa04','WGT/04','inquiry'),
  ('00000000-0000-0000-0000-00000000aa05','WGT/05','inquiry'),
  ('00000000-0000-0000-0000-00000000aa06','WGT/06','inquiry')
) as v(id, code, stage)
join tower.lanes l on l.code = v.code
where not exists (select 1 from tower.rfqs where id = v.id::uuid);

insert into tower.rfq_lines (rfq_id, description, qty, unit, currency)
select v.rfq::uuid, v.descr, v.qty, v.unit, 'USD'
from (values
  ('00000000-0000-0000-0000-00000000aa01', 'DEMO — 2 excavadoras / 2 excavators', 2::numeric, 'per_unit'),
  ('00000000-0000-0000-0000-00000000aa02', 'DEMO — FF&E 40 llaves / FF&E 40 keys', 40::numeric, 'per_key'),
  ('00000000-0000-0000-0000-00000000aa03', 'DEMO — 24 TM grado exportación / 24 MT export grade', 24::numeric, 'per_mt'),
  ('00000000-0000-0000-0000-00000000aa04', 'DEMO — programa 12 SKU / 12-SKU program', 1::numeric, 'per_sku_program'),
  ('00000000-0000-0000-0000-00000000aa05', 'DEMO — mandato territorio Perú / Peru territory mandate', 1::numeric, 'per_territory'),
  ('00000000-0000-0000-0000-00000000aa06', 'DEMO — 1 contenedor 40HC origen / 1×40HC origin container', 1::numeric, 'per_container')
) as v(rfq, descr, qty, unit)
where exists (select 1 from tower.rfqs where id = v.rfq::uuid)
  and not exists (select 1 from tower.rfq_lines where rfq_id = v.rfq::uuid);
