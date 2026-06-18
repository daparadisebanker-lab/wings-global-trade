-- ============================================================
-- Wings Global Trade — Expand Category Domains
-- Migration 0006
-- Depends on: 0005_subcategories_and_filter_attrs.sql
--
-- Adds four new top-level categories and their subcategories.
-- All inserts are idempotent via ON CONFLICT (slug) DO NOTHING.
-- Do NOT apply this file manually — run via Supabase CLI.
-- ============================================================


-- ============================================================
-- CATEGORIES
-- ============================================================

INSERT INTO categories (slug, name_es, name_en, description_es, icon_key, sort_order)
VALUES (
  'buses-y-transporte',
  'Buses y Transporte de Pasajeros',
  'Buses & Passenger Transport',
  'Buses urbanos, interurbanos, escolares y minibuses para transporte masivo de pasajeros.',
  'bus',
  3
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (slug, name_es, name_en, description_es, icon_key, sort_order)
VALUES (
  'motocicletas',
  'Motocicletas y Mototaxis',
  'Motorcycles & Mototaxis',
  'Motos de trabajo, mototaxis tres ruedas, motocultores y cuatrimotos ATV.',
  'motorcycle',
  4
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (slug, name_es, name_en, description_es, icon_key, sort_order)
VALUES (
  'equipo-industrial',
  'Equipo Industrial',
  'Industrial Equipment',
  'Montacargas, compactadores, generadores y equipos de bombeo para operaciones industriales.',
  'industrial',
  5
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (slug, name_es, name_en, description_es, icon_key, sort_order)
VALUES (
  'repuestos',
  'Repuestos y Accesorios',
  'Spare Parts & Accessories',
  'Repuestos para tractores, camiones KAMA, consumibles y lubricantes para mantenimiento.',
  'parts',
  6
)
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- SUBCATEGORIES — Buses y Transporte de Pasajeros
-- ============================================================

INSERT INTO subcategories (category_id, slug, name_es, name_en, sort_order)
SELECT id, 'buses-urbanos', 'Buses Urbanos', 'Urban Buses', 1
FROM categories WHERE slug = 'buses-y-transporte'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (category_id, slug, name_es, name_en, sort_order)
SELECT id, 'buses-interurbanos', 'Buses Interurbanos', 'Intercity Buses', 2
FROM categories WHERE slug = 'buses-y-transporte'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (category_id, slug, name_es, name_en, sort_order)
SELECT id, 'minibuses', 'Minibuses', 'Minibuses', 3
FROM categories WHERE slug = 'buses-y-transporte'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (category_id, slug, name_es, name_en, sort_order)
SELECT id, 'buses-escolares', 'Buses Escolares', 'School Buses', 4
FROM categories WHERE slug = 'buses-y-transporte'
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- SUBCATEGORIES — Motocicletas y Mototaxis
-- ============================================================

INSERT INTO subcategories (category_id, slug, name_es, name_en, sort_order)
SELECT id, 'motos-trabajo', 'Motos de Trabajo', 'Work Motorcycles', 1
FROM categories WHERE slug = 'motocicletas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (category_id, slug, name_es, name_en, sort_order)
SELECT id, 'mototaxis', 'Mototaxis 3 ruedas', 'Three-wheel Mototaxis', 2
FROM categories WHERE slug = 'motocicletas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (category_id, slug, name_es, name_en, sort_order)
SELECT id, 'motocultores', 'Motocultores', 'Motocultivators', 3
FROM categories WHERE slug = 'motocicletas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (category_id, slug, name_es, name_en, sort_order)
SELECT id, 'atv', 'Cuatrimotos ATV', 'ATVs', 4
FROM categories WHERE slug = 'motocicletas'
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- SUBCATEGORIES — Equipo Industrial
-- ============================================================

INSERT INTO subcategories (category_id, slug, name_es, name_en, sort_order)
SELECT id, 'montacargas', 'Montacargas y Elevadores', 'Forklifts & Lifts', 1
FROM categories WHERE slug = 'equipo-industrial'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (category_id, slug, name_es, name_en, sort_order)
SELECT id, 'compactadores', 'Compactadores y Constructoras', 'Compactors & Construction', 2
FROM categories WHERE slug = 'equipo-industrial'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (category_id, slug, name_es, name_en, sort_order)
SELECT id, 'generadores', 'Generadores y Energía', 'Generators & Power', 3
FROM categories WHERE slug = 'equipo-industrial'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (category_id, slug, name_es, name_en, sort_order)
SELECT id, 'bombas', 'Bombas y Riego Industrial', 'Pumps & Irrigation', 4
FROM categories WHERE slug = 'equipo-industrial'
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- SUBCATEGORIES — Repuestos y Accesorios
-- ============================================================

INSERT INTO subcategories (category_id, slug, name_es, name_en, sort_order)
SELECT id, 'repuestos-tractores', 'Repuestos para Tractores', 'Tractor Parts', 1
FROM categories WHERE slug = 'repuestos'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (category_id, slug, name_es, name_en, sort_order)
SELECT id, 'repuestos-kama', 'Repuestos para Camiones KAMA', 'KAMA Truck Parts', 2
FROM categories WHERE slug = 'repuestos'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (category_id, slug, name_es, name_en, sort_order)
SELECT id, 'consumibles', 'Consumibles y Lubricantes', 'Consumables & Lubricants', 3
FROM categories WHERE slug = 'repuestos'
ON CONFLICT (slug) DO NOTHING;
