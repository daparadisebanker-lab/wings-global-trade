-- Migration 0009: KAMA truck filter attributes
-- Adds fuel, payload, and usage fields to filter_attrs for all 12 KAMA series.
-- Uses JSONB merge (||) so existing keys (brand, hp, etc.) are preserved.

UPDATE products SET filter_attrs = COALESCE(filter_attrs, '{}'::jsonb) || '{"fuel":"gasolina","payload":"mini","usage":"carga"}'::jsonb
  WHERE slug = 'kama-serie-w';

UPDATE products SET filter_attrs = COALESCE(filter_attrs, '{}'::jsonb) || '{"fuel":"multi","payload":"ligero","usage":"carga"}'::jsonb
  WHERE slug = 'kama-serie-x';

UPDATE products SET filter_attrs = COALESCE(filter_attrs, '{}'::jsonb) || '{"fuel":"gasolina","payload":"mini","usage":"carga"}'::jsonb
  WHERE slug = 'kama-serie-v';

UPDATE products SET filter_attrs = COALESCE(filter_attrs, '{}'::jsonb) || '{"fuel":"gasolina","payload":"ligero","usage":"carga"}'::jsonb
  WHERE slug = 'kama-serie-s';

UPDATE products SET filter_attrs = COALESCE(filter_attrs, '{}'::jsonb) || '{"fuel":"diesel","payload":"ligero","usage":"carga"}'::jsonb
  WHERE slug = 'kama-serie-k';

UPDATE products SET filter_attrs = COALESCE(filter_attrs, '{}'::jsonb) || '{"fuel":"diesel","payload":"ligero","usage":"carga"}'::jsonb
  WHERE slug = 'kama-serie-m1';

UPDATE products SET filter_attrs = COALESCE(filter_attrs, '{}'::jsonb) || '{"fuel":"diesel","payload":"mediano","usage":"carga"}'::jsonb
  WHERE slug = 'kama-serie-m3';

UPDATE products SET filter_attrs = COALESCE(filter_attrs, '{}'::jsonb) || '{"fuel":"diesel","payload":"mediano","usage":"carga"}'::jsonb
  WHERE slug = 'kama-serie-m6';

UPDATE products SET filter_attrs = COALESCE(filter_attrs, '{}'::jsonb) || '{"fuel":"diesel","payload":"pesado","usage":"volteo"}'::jsonb
  WHERE slug = 'kama-serie-gm';

UPDATE products SET filter_attrs = COALESCE(filter_attrs, '{}'::jsonb) || '{"fuel":"electrico","payload":"mini","usage":"carga"}'::jsonb
  WHERE slug = 'kama-serie-ew-ev';

UPDATE products SET filter_attrs = COALESCE(filter_attrs, '{}'::jsonb) || '{"fuel":"electrico","payload":"mini","usage":"pasajeros"}'::jsonb
  WHERE slug = 'kama-serie-es-esp';

UPDATE products SET filter_attrs = COALESCE(filter_attrs, '{}'::jsonb) || '{"fuel":"electrico","payload":"mediano","usage":"carga"}'::jsonb
  WHERE slug = 'kama-serie-ex-em';
