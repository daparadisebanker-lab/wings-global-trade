-- ============================================================
-- Wings Global Trade — Subcategories + Filter Attributes
-- Migration 0005
--
-- Task 1: Create subcategories table, add subcategory_id +
--         filter_attrs columns to products.
-- Task 2: Seed subcategories, backfill filter_attrs for all
--         tractor and KAMA truck products.
-- Idempotent: uses IF NOT EXISTS and ON CONFLICT DO NOTHING.
-- ============================================================


-- ============================================================
-- TASK 1 — SCHEMA
-- ============================================================

-- Subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  slug        TEXT NOT NULL UNIQUE,
  name_es     TEXT NOT NULL,
  name_en     TEXT NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subcategories_category ON subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_slug     ON subcategories(slug);

-- RLS
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read subcategories" ON subcategories;
CREATE POLICY "public read subcategories" ON subcategories FOR SELECT USING (true);

-- Add new columns to products (idempotent via IF NOT EXISTS)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES subcategories(id),
  ADD COLUMN IF NOT EXISTS filter_attrs   JSONB NOT NULL DEFAULT '{}';

-- Partial index on subcategory for FK lookups
CREATE INDEX IF NOT EXISTS idx_products_subcategory
  ON products(subcategory_id) WHERE subcategory_id IS NOT NULL;

-- GIN-style expression indexes for common filter_attrs keys
CREATE INDEX IF NOT EXISTS idx_products_filter_hp
  ON products ((filter_attrs->>'hp'))
  WHERE filter_attrs ? 'hp';

CREATE INDEX IF NOT EXISTS idx_products_filter_traction
  ON products ((filter_attrs->>'traction'))
  WHERE filter_attrs ? 'traction';


-- ============================================================
-- TASK 2 — SEED SUBCATEGORIES
-- ============================================================

-- Maquinaria Agrícola subcategories
INSERT INTO subcategories (category_id, slug, name_es, name_en, sort_order)
SELECT id, 'tractores', 'Tractores', 'Tractors', 1
FROM categories WHERE slug = 'maquinaria-agricola'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (category_id, slug, name_es, name_en, sort_order)
SELECT id, 'cosechadoras', 'Cosechadoras', 'Harvesters', 2
FROM categories WHERE slug = 'maquinaria-agricola'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (category_id, slug, name_es, name_en, sort_order)
SELECT id, 'labranza', 'Equipo de Labranza', 'Tillage Equipment', 3
FROM categories WHERE slug = 'maquinaria-agricola'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (category_id, slug, name_es, name_en, sort_order)
SELECT id, 'siembra', 'Siembra y Trasplante', 'Planting Equipment', 4
FROM categories WHERE slug = 'maquinaria-agricola'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (category_id, slug, name_es, name_en, sort_order)
SELECT id, 'proteccion-cultivos', 'Protección de Cultivos', 'Crop Protection', 5
FROM categories WHERE slug = 'maquinaria-agricola'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (category_id, slug, name_es, name_en, sort_order)
SELECT id, 'poscosecha', 'Poscosecha y Almacenamiento', 'Post-Harvest', 6
FROM categories WHERE slug = 'maquinaria-agricola'
ON CONFLICT (slug) DO NOTHING;

-- Camiones subcategories
INSERT INTO subcategories (category_id, slug, name_es, name_en, sort_order)
SELECT id, 'volteos', 'Volteos y Dumpers', 'Dump Trucks', 1
FROM categories WHERE slug = 'camiones'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (category_id, slug, name_es, name_en, sort_order)
SELECT id, 'camiones-carga', 'Camiones de Carga', 'Cargo Trucks', 2
FROM categories WHERE slug = 'camiones'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (category_id, slug, name_es, name_en, sort_order)
SELECT id, 'camiones-cisterna', 'Camiones Cisterna', 'Tank Trucks', 3
FROM categories WHERE slug = 'camiones'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (category_id, slug, name_es, name_en, sort_order)
SELECT id, 'camiones-especiales', 'Camiones Especiales', 'Special Vehicles', 4
FROM categories WHERE slug = 'camiones'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (category_id, slug, name_es, name_en, sort_order)
SELECT id, 'tractocamiones', 'Tractocamiones', 'Semi-Trucks', 5
FROM categories WHERE slug = 'camiones'
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- TASK 2 — BACKFILL filter_attrs FOR TRACTOR PRODUCTS
-- All tractor products have 4WD traction.
-- Transmission mapping:
--   "8+2", "10+2", "10+2 / 8+2", "9+3"  → "mechanical"
--   "12+4", "12+12", "12F+12R",
--   "12+12 Quad-Shift"                   → "syncro"
--   "20×16"                              → "powershift"
-- Weight: parse the numeric value from "Peso operativo" spec.
-- Brand: inferred from product slug prefix.
-- ============================================================

-- --- New Holland SH504 (50 HP, 4WD, 8+2, 2370 kg) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'hp',           50,
  'traction',     '4wd',
  'transmission', 'mechanical',
  'weight_kg',    2370,
  'brand',        'New Holland'
) WHERE slug = 'new-holland-sh504';

-- --- New Holland SNH504 (50 HP, 4WD, 10+2/8+2, 2370 kg) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'hp',           50,
  'traction',     '4wd',
  'transmission', 'mechanical',
  'weight_kg',    2370,
  'brand',        'New Holland'
) WHERE slug = 'new-holland-snh504';

-- --- New Holland SNH554 (55 HP, 4WD, 10+2/8+2, 2370 kg) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'hp',           55,
  'traction',     '4wd',
  'transmission', 'mechanical',
  'weight_kg',    2370,
  'brand',        'New Holland'
) WHERE slug = 'new-holland-snh554';

-- --- New Holland SNH704 (70 HP, 4WD, 10+2/8+2, 2500 kg) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'hp',           70,
  'traction',     '4wd',
  'transmission', 'mechanical',
  'weight_kg',    2500,
  'brand',        'New Holland'
) WHERE slug = 'new-holland-snh704';

-- --- New Holland SNH754 (75 HP, 4WD, 10+2/8+2, 2520 kg) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'hp',           75,
  'traction',     '4wd',
  'transmission', 'mechanical',
  'weight_kg',    2520,
  'brand',        'New Holland'
) WHERE slug = 'new-holland-snh754';

-- --- New Holland SNH804 (80 HP, 4WD, 10+2, 2520 kg) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'hp',           80,
  'traction',     '4wd',
  'transmission', 'mechanical',
  'weight_kg',    2520,
  'brand',        'New Holland'
) WHERE slug = 'new-holland-snh804';

-- --- New Holland SNH1004 (100 HP, 4WD, 12+12, 3890 kg) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'hp',           100,
  'traction',     '4wd',
  'transmission', 'syncro',
  'weight_kg',    3890,
  'brand',        'New Holland'
) WHERE slug = 'new-holland-snh1004';

-- --- New Holland SNH1104 (110 HP, 4WD, 12+12, 4720 kg) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'hp',           110,
  'traction',     '4wd',
  'transmission', 'syncro',
  'weight_kg',    4720,
  'brand',        'New Holland'
) WHERE slug = 'new-holland-snh1104';

-- --- New Holland T1104 (110 HP, 4WD, 12+12, 3900 kg) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'hp',           110,
  'traction',     '4wd',
  'transmission', 'syncro',
  'weight_kg',    3900,
  'brand',        'New Holland'
) WHERE slug = 'new-holland-t1104';

-- --- New Holland SNH1204 (120 HP, 4WD, 12+12, 4850 kg) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'hp',           120,
  'traction',     '4wd',
  'transmission', 'syncro',
  'weight_kg',    4850,
  'brand',        'New Holland'
) WHERE slug = 'new-holland-snh1204';

-- --- New Holland SNH1304 (130 HP, 4WD, 12+12, 4850 kg) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'hp',           130,
  'traction',     '4wd',
  'transmission', 'syncro',
  'weight_kg',    4850,
  'brand',        'New Holland'
) WHERE slug = 'new-holland-snh1304';

-- --- New Holland SNH1354 (135 HP, 4WD, 12+12, 4850 kg) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'hp',           135,
  'traction',     '4wd',
  'transmission', 'syncro',
  'weight_kg',    4850,
  'brand',        'New Holland'
) WHERE slug = 'new-holland-snh1354';

-- --- New Holland TM140 (140 HP, 4WD, 20×16, 5400 kg) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'hp',           140,
  'traction',     '4wd',
  'transmission', 'powershift',
  'weight_kg',    5400,
  'brand',        'New Holland'
) WHERE slug = 'new-holland-tm140';

-- --- John Deere 5B-704 (70 HP, 4WD, no tx in specs, 2790 kg) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'hp',           70,
  'traction',     '4wd',
  'transmission', 'mechanical',
  'weight_kg',    2790,
  'brand',        'John Deere'
) WHERE slug = 'john-deere-5b-704';

-- --- John Deere 5E-854 (85 HP, 4WD, 12+4, 3488 kg) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'hp',           85,
  'traction',     '4wd',
  'transmission', 'syncro',
  'weight_kg',    3488,
  'brand',        'John Deere'
) WHERE slug = 'john-deere-5e-854';

-- --- John Deere 5E-954 (95 HP, 4WD, 12+4, 3488 kg) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'hp',           95,
  'traction',     '4wd',
  'transmission', 'syncro',
  'weight_kg',    3488,
  'brand',        'John Deere'
) WHERE slug = 'john-deere-5e-954';

-- --- John Deere 5E-1104 (110 HP, 4WD, 12+4, no weight in real specs) ---
-- Weight not present in 0003 specs for this model; omit weight_kg.
UPDATE products SET filter_attrs = jsonb_build_object(
  'hp',           110,
  'traction',     '4wd',
  'transmission', 'syncro',
  'brand',        'John Deere'
) WHERE slug = 'john-deere-5e-1104';

-- --- John Deere 5E-1204 (120 HP, 4WD, no tx in specs, 3198 kg) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'hp',           120,
  'traction',     '4wd',
  'transmission', 'mechanical',
  'weight_kg',    3198,
  'brand',        'John Deere'
) WHERE slug = 'john-deere-5e-1204';

-- --- John Deere 6B1204 (120 HP, 4WD, no tx in specs, 4640 kg) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'hp',           120,
  'traction',     '4wd',
  'transmission', 'mechanical',
  'weight_kg',    4640,
  'brand',        'John Deere'
) WHERE slug = 'john-deere-6b1204';

-- --- John Deere 6E1404 (140 HP, 4WD, 12+4) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'hp',           140,
  'traction',     '4wd',
  'transmission', 'syncro',
  'brand',        'John Deere'
) WHERE slug = 'john-deere-6e1404';

-- --- John Deere 6B1404 (140 HP, 4WD, 12+4, 4860 kg) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'hp',           140,
  'traction',     '4wd',
  'transmission', 'syncro',
  'weight_kg',    4860,
  'brand',        'John Deere'
) WHERE slug = 'john-deere-6b1404';

-- --- John Deere 5055E (55 HP, 4WD, 9+3, 2700 kg) ---
-- Added in 0004_fix_images_add_jd5055e.sql
UPDATE products SET filter_attrs = jsonb_build_object(
  'hp',           55,
  'traction',     '4wd',
  'transmission', 'mechanical',
  'weight_kg',    2700,
  'brand',        'John Deere'
) WHERE slug = 'john-deere-5055e';

-- --- Massey Ferguson MF1004 (100 HP, 4WD, 12+4, 3950 kg) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'hp',           100,
  'traction',     '4wd',
  'transmission', 'syncro',
  'weight_kg',    3950,
  'brand',        'Massey Ferguson'
) WHERE slug = 'massey-ferguson-mf1004';

-- --- Massey Ferguson MF1104 (110 HP, 4WD, 12+4, 4050 kg) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'hp',           110,
  'traction',     '4wd',
  'transmission', 'syncro',
  'weight_kg',    4050,
  'brand',        'Massey Ferguson'
) WHERE slug = 'massey-ferguson-mf1104';

-- --- Massey Ferguson MF1204 (120 HP, 4WD, 12+4, 4150 kg) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'hp',           120,
  'traction',     '4wd',
  'transmission', 'syncro',
  'weight_kg',    4150,
  'brand',        'Massey Ferguson'
) WHERE slug = 'massey-ferguson-mf1204';

-- --- Massey Ferguson S1204-C (120 HP, 4WD, 12+4, 4150 kg, cabin) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'hp',           120,
  'traction',     '4wd',
  'transmission', 'syncro',
  'weight_kg',    4150,
  'brand',        'Massey Ferguson',
  'cabin',        'closed'
) WHERE slug = 'massey-ferguson-s1204c';

-- --- Kubota M704K (70 HP, 8+8, 2400 kg) ---
-- No "Tipo de tracción" in Kubota specs — treat as 2wd per available data.
UPDATE products SET filter_attrs = jsonb_build_object(
  'hp',           70,
  'traction',     '2wd',
  'transmission', 'syncro',
  'weight_kg',    2400,
  'brand',        'Kubota'
) WHERE slug = 'kubota-m704k';

-- --- Kubota M854K (85 HP, 12+12, 3060 kg) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'hp',           85,
  'traction',     '2wd',
  'transmission', 'syncro',
  'weight_kg',    3060,
  'brand',        'Kubota'
) WHERE slug = 'kubota-m854k';

-- --- Kubota M954K (95 HP, 12+12, 2995 kg) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'hp',           95,
  'traction',     '2wd',
  'transmission', 'syncro',
  'weight_kg',    2995,
  'brand',        'Kubota'
) WHERE slug = 'kubota-m954k';

-- --- Kubota M954KQ (95 HP, 12+12 Quad-Shift, 3245 kg) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'hp',           95,
  'traction',     '2wd',
  'transmission', 'syncro',
  'weight_kg',    3245,
  'brand',        'Kubota'
) WHERE slug = 'kubota-m954kq';

-- --- Kubota M1004Q (100 HP, 12F+12R, 3135 kg) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'hp',           100,
  'traction',     '2wd',
  'transmission', 'syncro',
  'weight_kg',    3135,
  'brand',        'Kubota'
) WHERE slug = 'kubota-m1004q';


-- ============================================================
-- TASK 2 — SET subcategory_id FOR TRACTOR PRODUCTS
-- All maquinaria-agricola products above are tractors.
-- ============================================================
UPDATE products
SET subcategory_id = (SELECT id FROM subcategories WHERE slug = 'tractores')
WHERE slug IN (
  'new-holland-sh504',
  'new-holland-snh504',
  'new-holland-snh554',
  'new-holland-snh704',
  'new-holland-snh754',
  'new-holland-snh804',
  'new-holland-snh1004',
  'new-holland-snh1104',
  'new-holland-t1104',
  'new-holland-snh1204',
  'new-holland-snh1304',
  'new-holland-snh1354',
  'new-holland-tm140',
  'john-deere-5b-704',
  'john-deere-5e-854',
  'john-deere-5e-954',
  'john-deere-5e-1104',
  'john-deere-5e-1204',
  'john-deere-6b1204',
  'john-deere-6e1404',
  'john-deere-6b1404',
  'john-deere-5055e',
  'massey-ferguson-mf1004',
  'massey-ferguson-mf1104',
  'massey-ferguson-mf1204',
  'massey-ferguson-s1204c',
  'kubota-m704k',
  'kubota-m854k',
  'kubota-m954k',
  'kubota-m954kq',
  'kubota-m1004q'
);


-- ============================================================
-- TASK 2 — BACKFILL filter_attrs FOR KAMA TRUCK PRODUCTS
-- GVW values parsed from "GVW" spec field.
-- Payload values parsed from "Carga útil" spec field.
-- ============================================================

-- --- KAMA Serie W (payload 1.5 T, GVW 3.040 t → 3040 kg) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'payload_t', 1.5,
  'gvw_t',     3.04,
  'brand',     'KAMA'
) WHERE slug = 'kama-serie-w';

-- --- KAMA Serie X (payload 2–2.5 T, GVW up to 4.6 T) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'payload_t', 2.0,
  'gvw_t',     4.6,
  'brand',     'KAMA'
) WHERE slug = 'kama-serie-x';

-- --- KAMA Serie V (payload 1.2–1.5 T, GVW 2.7–3.25 T) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'payload_t', 1.2,
  'gvw_t',     3.25,
  'brand',     'KAMA'
) WHERE slug = 'kama-serie-v';

-- --- KAMA M36F (payload 4 T, GVW 5.58 T) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'payload_t', 4.0,
  'gvw_t',     5.58,
  'brand',     'KAMA'
) WHERE slug = 'kama-m36f';

-- --- KAMA Serie M6 (payload 3.5–10 T, GVW 6.32–14.87 T; use upper bound) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'payload_t', 10.0,
  'gvw_t',     14.87,
  'brand',     'KAMA'
) WHERE slug = 'kama-serie-m6';

-- --- KAMA GM67E (payload 10 T, GVW 16.62 T) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'payload_t', 10.0,
  'gvw_t',     16.62,
  'brand',     'KAMA'
) WHERE slug = 'kama-gm67e';

-- --- KAMA EW/EV electric mini (payload 1–1.5 T, GVW 2.1–3.39 T) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'payload_t', 1.0,
  'gvw_t',     3.39,
  'brand',     'KAMA',
  'fuel_type', 'electric'
) WHERE slug = 'kama-serie-ew-ev';

-- --- KAMA ES/ESP electric van (payload 1–1.5 T, GVW 3.05–3.35 T) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'payload_t', 1.0,
  'gvw_t',     3.35,
  'brand',     'KAMA',
  'fuel_type', 'electric'
) WHERE slug = 'kama-serie-es-esp';

-- --- KAMA EX/EM heavy electric (payload up to 8 T, GVW 3.51–8 T) ---
UPDATE products SET filter_attrs = jsonb_build_object(
  'payload_t', 8.0,
  'gvw_t',     8.0,
  'brand',     'KAMA',
  'fuel_type', 'electric'
) WHERE slug = 'kama-serie-ex-em';


-- ============================================================
-- TASK 2 — SET subcategory_id FOR KAMA TRUCK PRODUCTS
-- Naming heuristic:
--   "Volteo/Dumper" → volteos
--   Light cargo / mini / furgon → camiones-carga
--   Electric variants → camiones-especiales
-- ============================================================

-- Heavy cargo trucks → camiones-carga
UPDATE products
SET subcategory_id = (SELECT id FROM subcategories WHERE slug = 'camiones-carga')
WHERE slug IN (
  'kama-serie-w',
  'kama-serie-x',
  'kama-serie-v',
  'kama-m36f',
  'kama-serie-m6',
  'kama-gm67e'
);

-- Electric models → camiones-especiales
UPDATE products
SET subcategory_id = (SELECT id FROM subcategories WHERE slug = 'camiones-especiales')
WHERE slug IN (
  'kama-serie-ew-ev',
  'kama-serie-es-esp',
  'kama-serie-ex-em'
);
