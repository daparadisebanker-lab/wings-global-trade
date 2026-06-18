-- ============================================================
-- Wings Global Trade — Real Product Catalog Migration
-- Replaces placeholder seeds with authentic product data.
-- Source: wingsglobaltrade.com + data/product-catalog.json (GitHub)
-- ============================================================

-- Clear placeholder products from maquinaria-agricola and camiones
-- (buses, equipo-industrial, repuestos placeholders are retained)
DELETE FROM products
WHERE category_id = (SELECT id FROM categories WHERE slug = 'maquinaria-agricola');

DELETE FROM products
WHERE slug IN ('volquete-howo-8x4', 'camion-carga-6x4', 'furgon-refrigerado-4x2');

-- ============================================================
-- MAQUINARIA AGRÍCOLA — New Holland (14 modelos)
-- ============================================================

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'new-holland-sh504', 'New Holland SH504', 'New Holland SH504 Tractor',
  'Tractor agrícola de 50 HP con motor 4100B-4a, transmisión 8+2 y tracción 4WD. Peso operativo 2.370 kg. Plataforma compacta para labranza ligera y media en cultivos andinos y costeros.',
  '{"Potencia del motor":"50 HP","Tipo de tracción":"4WD","Transmisión":"8+2","Peso operativo":"2.370 kg","Motor":"4100B-4a","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/maquinaria-agricola/new-holland-sh504.jpg'], 10
FROM categories WHERE slug = 'maquinaria-agricola';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'new-holland-snh504', 'New Holland SNH504', 'New Holland SNH504 Tractor',
  'Tractor profesional de 50 HP con motor 4100B-3 y transmisión 10+2 extendida. Tracción 4WD y peso operativo 2.370 kg. Versión mejorada del SH504 con rango de marchas ampliado para mayor versatilidad.',
  '{"Potencia del motor":"50 HP","Tipo de tracción":"4WD","Transmisión":"10+2 / 8+2","Peso operativo":"2.370 kg","Motor":"4100B-3","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/maquinaria-agricola/new-holland-snh504.jpg'], 11
FROM categories WHERE slug = 'maquinaria-agricola';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'new-holland-snh554', 'New Holland SNH554', 'New Holland SNH554 Tractor',
  'Tractor de 55 HP con motor 4100B-2, transmisión 10+2 y tracción 4WD. Peso operativo 2.370 kg. Diseñado para operaciones de labranza y transporte agrícola de intensidad media.',
  '{"Potencia del motor":"55 HP","Tipo de tracción":"4WD","Transmisión":"10+2 / 8+2","Peso operativo":"2.370 kg","Motor":"4100B-2","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/maquinaria-agricola/new-holland-snh554.jpg'], 12
FROM categories WHERE slug = 'maquinaria-agricola';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'new-holland-snh704', 'New Holland SNH704', 'New Holland SNH704 Tractor',
  'Tractor de potencia media 70 HP con motor SNH4102, transmisión 10+2 y tracción 4WD. Peso operativo 2.500 kg. Apto para labranza, siembra y trabajo con implementos pesados.',
  '{"Potencia del motor":"70 HP","Tipo de tracción":"4WD","Transmisión":"10+2 / 8+2","Peso operativo":"2.500 kg","Motor":"SNH4102","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/maquinaria-agricola/new-holland-snh704.jpg'], 13
FROM categories WHERE slug = 'maquinaria-agricola';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'new-holland-snh754', 'New Holland SNH754', 'New Holland SNH754 Tractor',
  'Tractor agrícola de 75 HP con motor SNH4102Z turboalimentado, transmisión 10+2 y tracción 4WD. Peso operativo 2.520 kg. Equilibrio óptimo entre potencia y consumo de combustible.',
  '{"Potencia del motor":"75 HP","Tipo de tracción":"4WD","Transmisión":"10+2 / 8+2","Peso operativo":"2.520 kg","Motor":"SNH4102Z","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/maquinaria-agricola/new-holland-snh754.jpg'], 14
FROM categories WHERE slug = 'maquinaria-agricola';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'new-holland-snh804', 'New Holland SNH804', 'New Holland SNH804 Tractor',
  'Tractor de 80 HP con motor SNH4102Z, transmisión 10+2 y tracción 4WD. Peso operativo 2.520 kg. Capacidad para implementos de doble efecto y toma de fuerza trasera de alta productividad.',
  '{"Potencia del motor":"80 HP","Tipo de tracción":"4WD","Transmisión":"10+2","Peso operativo":"2.520 kg","Motor":"SNH4102Z","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/maquinaria-agricola/new-holland-snh804.jpg'], 15
FROM categories WHERE slug = 'maquinaria-agricola';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'new-holland-snh1004', 'New Holland SNH1004', 'New Holland SNH1004 Tractor',
  'Tractor de alta potencia 100 HP con motor Weichai WP4T90E20, transmisión 12+12 y tracción 4WD. Peso operativo 3.890 kg. Para labranza profunda y trabajo intensivo en grandes extensiones.',
  '{"Potencia del motor":"100 HP","Tipo de tracción":"4WD","Transmisión":"12+12","Peso operativo":"3.890 kg","Motor":"Weichai WP4T90E20","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/maquinaria-agricola/new-holland-snh1004.jpg'], 16
FROM categories WHERE slug = 'maquinaria-agricola';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'new-holland-snh1104', 'New Holland SNH1104', 'New Holland SNH1104 Tractor',
  'Tractor de 110 HP con motor Weichai WP6T110E20, transmisión 12+12 y tracción 4WD. El mayor peso operativo (4.720 kg) de la serie garantiza tracción superior en suelos difíciles y laderas.',
  '{"Potencia del motor":"110 HP","Tipo de tracción":"4WD","Transmisión":"12+12","Peso operativo":"4.720 kg","Motor":"Weichai WP6T110E20","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/maquinaria-agricola/new-holland-snh1104.jpg'], 17
FROM categories WHERE slug = 'maquinaria-agricola';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'new-holland-t1104', 'New Holland T1104', 'New Holland T1104 Tractor',
  'Tractor 110 HP de la serie T con motor IVECO 8045.25D.313T de origen europeo, transmisión 12+12 y tracción 4WD. Peso operativo 3.900 kg. Motor IVECO reconocido por durabilidad en condiciones extremas.',
  '{"Potencia del motor":"110 HP","Tipo de tracción":"4WD","Transmisión":"12+12","Peso operativo":"3.900 kg","Motor":"IVECO 8045.25D.313T","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/maquinaria-agricola/new-holland-t1104.jpg'], 18
FROM categories WHERE slug = 'maquinaria-agricola';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'new-holland-snh1204', 'New Holland SNH1204', 'New Holland SNH1204 Tractor',
  'Tractor de 120 HP con motor Weichai WP6T120E20, transmisión 12+12 y tracción 4WD. Peso operativo 4.850 kg. Para operaciones agroindustriales de gran escala que demandan potencia sostenida.',
  '{"Potencia del motor":"120 HP","Tipo de tracción":"4WD","Transmisión":"12+12","Peso operativo":"4.850 kg","Motor":"Weichai WP6T120E20","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/maquinaria-agricola/new-holland-snh1204.jpg'], 19
FROM categories WHERE slug = 'maquinaria-agricola';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'new-holland-snh1304', 'New Holland SNH1304', 'New Holland SNH1304 Tractor',
  'Tractor de 130 HP con motor Weichai WP6T130E20, transmisión 12+12 y tracción 4WD. Alto par motor para labranza profunda y remolques de gran tonelaje. Peso 4.850 kg.',
  '{"Potencia del motor":"130 HP","Tipo de tracción":"4WD","Transmisión":"12+12","Peso operativo":"4.850 kg","Motor":"Weichai WP6T130E20","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/maquinaria-agricola/new-holland-snh1304.jpg'], 20
FROM categories WHERE slug = 'maquinaria-agricola';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'new-holland-snh1354', 'New Holland SNH1354', 'New Holland SNH1354 Tractor',
  'Tractor de 135 HP con motor Weichai WP6T135E20. La potencia más alta de la serie SNH. Transmisión 12+12, tracción 4WD y peso operativo 4.850 kg para las operaciones de mayor exigencia.',
  '{"Potencia del motor":"135 HP","Tipo de tracción":"4WD","Transmisión":"12+12","Peso operativo":"4.850 kg","Motor":"Weichai WP6T135E20","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/maquinaria-agricola/new-holland-snh1354.jpg'], 21
FROM categories WHERE slug = 'maquinaria-agricola';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'new-holland-tm140', 'New Holland TM140', 'New Holland TM140 Tractor',
  'Tractor de alto rendimiento 140 HP con transmisión 20×16 marchas y tracción 4WD. Peso operativo 5.400 kg. Serie TM para las operaciones agrícolas de máxima demanda y productividad intensiva.',
  '{"Potencia del motor":"140 HP","Tipo de tracción":"4WD","Transmisión":"20×16","Peso operativo":"5.400 kg","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/maquinaria-agricola/new-holland-tm140.jpg'], 22
FROM categories WHERE slug = 'maquinaria-agricola';

-- ============================================================
-- MAQUINARIA AGRÍCOLA — John Deere (8 modelos)
-- ============================================================

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'john-deere-5b-704', 'John Deere 5B-704', 'John Deere 5B-704 Tractor',
  'Tractor John Deere serie 5B de 70 HP con tracción 4WD y peso operativo 2.790 kg. Producción certificada en China bajo estándares globales John Deere para mercados emergentes de alta demanda.',
  '{"Potencia del motor":"70 HP","Tipo de tracción":"4WD","Peso operativo":"2.790 kg","Marca":"John Deere","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/maquinaria-agricola/john-deere-5b-704.jpg'], 30
FROM categories WHERE slug = 'maquinaria-agricola';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'john-deere-5e-854', 'John Deere 5E-854', 'John Deere 5E-854 Tractor',
  'Tractor John Deere serie 5E de 85 HP con motor 4045, transmisión 12+4 y tracción 4WD. Peso operativo 3.488 kg. Plataforma de alta confiabilidad para mercados de desarrollo intensivo.',
  '{"Potencia del motor":"85 HP","Tipo de tracción":"4WD","Transmisión":"12+4","Peso operativo":"3.488 kg","Motor":"John Deere 4045","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/maquinaria-agricola/john-deere-5e-854.jpg'], 31
FROM categories WHERE slug = 'maquinaria-agricola';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'john-deere-5e-954', 'John Deere 5E-954', 'John Deere 5E-954 Tractor',
  'Tractor serie 5E de 95 HP con motor John Deere 4045, transmisión 12+4 y tracción 4WD. Mismo chasis robusto que el 5E-854 con mayor potencia para operaciones de mayor exigencia.',
  '{"Potencia del motor":"95 HP","Tipo de tracción":"4WD","Transmisión":"12+4","Peso operativo":"3.488 kg","Motor":"John Deere 4045","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/maquinaria-agricola/john-deere-5e-954.jpg'], 32
FROM categories WHERE slug = 'maquinaria-agricola';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'john-deere-5e-1104', 'John Deere 5E-1104', 'John Deere 5E-1104 Tractor',
  'Tractor John Deere serie 5E de 110 HP con motor 4045, transmisión 12+4 y tracción 4WD. Potencia de trabajo para labranza intensiva, grandes implementos y cosechadoras de arrastre.',
  '{"Potencia del motor":"110 HP","Tipo de tracción":"4WD","Transmisión":"12+4","Motor":"John Deere 4045","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/maquinaria-agricola/john-deere-5e-1104.jpg'], 33
FROM categories WHERE slug = 'maquinaria-agricola';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'john-deere-5e-1204', 'John Deere 5E-1204', 'John Deere 5E-1204 Tractor',
  'Tractor John Deere 5E de 120 HP con tracción 4WD y peso operativo 3.198 kg. La versión de mayor potencia de la serie 5E para demandas de producción intensiva a gran escala.',
  '{"Potencia del motor":"120 HP","Tipo de tracción":"4WD","Peso operativo":"3.198 kg","Marca":"John Deere","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/maquinaria-agricola/john-deere-5e-1204.jpg'], 34
FROM categories WHERE slug = 'maquinaria-agricola';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'john-deere-6b1204', 'John Deere 6B1204', 'John Deere 6B1204 Tractor',
  'Tractor John Deere serie 6B de 120 HP con tracción 4WD y peso operativo 4.640 kg. Chasis de mayor robustez de la serie 6 para trabajo pesado, remolques de gran tonelaje y implementos de alta demanda.',
  '{"Potencia del motor":"120 HP","Tipo de tracción":"4WD","Peso operativo":"4.640 kg","Marca":"John Deere","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/maquinaria-agricola/john-deere-6b1204.jpg'], 35
FROM categories WHERE slug = 'maquinaria-agricola';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'john-deere-6e1404', 'John Deere 6E1404', 'John Deere 6E1404 Tractor',
  'Tractor John Deere serie 6E de 140 HP con motor 4045, transmisión 12+4 y tracción 4WD. Alta potencia para operaciones en grandes extensiones de cultivo y condiciones de campo extremas.',
  '{"Potencia del motor":"140 HP","Tipo de tracción":"4WD","Transmisión":"12+4","Motor":"John Deere 4045","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/maquinaria-agricola/john-deere-6e1404.jpg'], 36
FROM categories WHERE slug = 'maquinaria-agricola';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'john-deere-6b1404', 'John Deere 6B1404', 'John Deere 6B1404 Tractor',
  'Tractor John Deere serie 6B de 140 HP con transmisión 12+4 y peso operativo 4.860 kg. El modelo de mayor potencia y peso de la serie 6B, para las condiciones más exigentes del campo latinoamericano.',
  '{"Potencia del motor":"140 HP","Tipo de tracción":"4WD","Transmisión":"12+4","Peso operativo":"4.860 kg","Marca":"John Deere","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/maquinaria-agricola/john-deere-6b1404.jpg'], 37
FROM categories WHERE slug = 'maquinaria-agricola';

-- ============================================================
-- MAQUINARIA AGRÍCOLA — Massey Ferguson (4 modelos)
-- ============================================================

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'massey-ferguson-mf1004', 'Massey Ferguson MF1004', 'Massey Ferguson MF1004 Tractor',
  'Tractor Massey Ferguson de 100 HP con motor Perkins de reconocida durabilidad, transmisión 12+4 y tracción 4WD. Peso operativo 3.950 kg. Referente de confiabilidad en el sector agrícola latinoamericano.',
  '{"Potencia del motor":"100 HP","Tipo de tracción":"4WD","Transmisión":"12+4","Peso operativo":"3.950 kg","Motor":"Perkins","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/maquinaria-agricola/massey-ferguson-mf1004.jpg'], 40
FROM categories WHERE slug = 'maquinaria-agricola';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'massey-ferguson-mf1104', 'Massey Ferguson MF1104', 'Massey Ferguson MF1104 Tractor',
  'Tractor MF de 110 HP con motor Perkins internacionalmente certificado, transmisión 12+4 y tracción 4WD. Peso operativo 4.050 kg. Para labranza intensiva y trabajo con implementos de alta demanda.',
  '{"Potencia del motor":"110 HP","Tipo de tracción":"4WD","Transmisión":"12+4","Peso operativo":"4.050 kg","Motor":"Perkins","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/maquinaria-agricola/massey-ferguson-mf1104.jpg'], 41
FROM categories WHERE slug = 'maquinaria-agricola';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'massey-ferguson-mf1204', 'Massey Ferguson MF1204', 'Massey Ferguson MF1204 Tractor',
  'Tractor Massey Ferguson de 120 HP con transmisión 12+4 y tracción 4WD. Peso operativo 4.150 kg. Potencia de serie alta para grandes explotaciones agroindustriales en Perú, Chile y Colombia.',
  '{"Potencia del motor":"120 HP","Tipo de tracción":"4WD","Transmisión":"12+4","Peso operativo":"4.150 kg","Marca":"Massey Ferguson","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/maquinaria-agricola/massey-ferguson-mf1204.jpg'], 42
FROM categories WHERE slug = 'maquinaria-agricola';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'massey-ferguson-s1204c', 'Massey Ferguson S1204-C', 'Massey Ferguson S1204-C Tractor',
  'Tractor Massey Ferguson S1204 versión Cabinado de 120 HP. Cabina cerrada con climatización para el máximo confort del operador en jornadas largas. Transmisión 12+4, 4WD, peso 4.150 kg.',
  '{"Potencia del motor":"120 HP","Tipo de tracción":"4WD","Transmisión":"12+4","Peso operativo":"4.150 kg","Cabina":"Cerrada (climatizada)","Motor":"Perkins","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/maquinaria-agricola/massey-ferguson-s1204c.jpg'], 43
FROM categories WHERE slug = 'maquinaria-agricola';

-- ============================================================
-- MAQUINARIA AGRÍCOLA — Kubota (5 modelos)
-- ============================================================

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'kubota-m704k', 'Kubota M704K', 'Kubota M704K Tractor',
  'Tractor Kubota serie M de 70 HP con motor propio V3800-DI-T-ET19 de 4 cilindros turboalimentado, transmisión 8+8 y peso operativo 2.400 kg. Reconocido por eficiencia y durabilidad de ingeniería japonesa.',
  '{"Potencia del motor":"70 HP","Transmisión":"8+8","Peso operativo":"2.400 kg","Motor":"Kubota V3800-DI-T-ET19","Precio":"A cotizar"}'::jsonb,
  ARRAY['China', 'Japón'], ARRAY['/images/products/maquinaria-agricola/kubota-m704k.jpg'], 50
FROM categories WHERE slug = 'maquinaria-agricola';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'kubota-m854k', 'Kubota M854K', 'Kubota M854K Tractor',
  'Tractor Kubota de 85 HP con motor V3800-DI-T-ES16, transmisión 12+12 y peso operativo 3.060 kg. Mayor potencia sobre la misma base de motor de 4 cilindros turboalimentado que define la serie M.',
  '{"Potencia del motor":"85 HP","Transmisión":"12+12","Peso operativo":"3.060 kg","Motor":"Kubota V3800-DI-T-ES16","Precio":"A cotizar"}'::jsonb,
  ARRAY['China', 'Japón'], ARRAY['/images/products/maquinaria-agricola/kubota-m854k.jpg'], 51
FROM categories WHERE slug = 'maquinaria-agricola';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'kubota-m954k', 'Kubota M954K', 'Kubota M954K Tractor',
  'Tractor Kubota M954K de 95 HP con motor V3800-DI-T, transmisión 12+12 y peso operativo 2.995 kg. Ingeniería japonesa de precisión para máxima eficiencia de combustible en operaciones continuas.',
  '{"Potencia del motor":"95 HP","Transmisión":"12+12","Peso operativo":"2.995 kg","Motor":"Kubota V3800-DI-T","Precio":"A cotizar"}'::jsonb,
  ARRAY['China', 'Japón'], ARRAY['/images/products/maquinaria-agricola/kubota-m954k.jpg'], 52
FROM categories WHERE slug = 'maquinaria-agricola';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'kubota-m954kq', 'Kubota M954KQ', 'Kubota M954KQ Tractor',
  'Tractor Kubota M954KQ de 95 HP con transmisión Quad-Shift 12+12, motor V3800-DI-T y peso operativo 3.245 kg. El sistema Quad-Shift permite cambio de marchas bajo carga para mayor productividad.',
  '{"Potencia del motor":"95 HP","Transmisión":"12+12 Quad-Shift","Peso operativo":"3.245 kg","Motor":"Kubota V3800-DI-T","Precio":"A cotizar"}'::jsonb,
  ARRAY['China', 'Japón'], ARRAY['/images/products/maquinaria-agricola/kubota-m954kq.jpg'], 53
FROM categories WHERE slug = 'maquinaria-agricola';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'kubota-m1004q', 'Kubota M1004Q', 'Kubota M1004Q Tractor',
  'Tractor Kubota M1004Q de 100 HP con motor V3800-DI-TI-ES02 de inyección directa turboalimentada, transmisión 12F+12R y peso 3.135 kg. La máxima expresión tecnológica de la serie M.',
  '{"Potencia del motor":"100 HP","Transmisión":"12F+12R","Peso operativo":"3.135 kg","Motor":"Kubota V3800-DI-TI-ES02","Precio":"A cotizar"}'::jsonb,
  ARRAY['China', 'Japón'], ARRAY['/images/products/maquinaria-agricola/kubota-m1004q.jpg'], 54
FROM categories WHERE slug = 'maquinaria-agricola';

-- ============================================================
-- CAMIONES — KAMA (9 series, 27 modelos disponibles)
-- ============================================================

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'kama-serie-w', 'KAMA Serie W — Gasolina', 'KAMA W Series — Gasoline',
  'Camión ligero KAMA Serie W con motor gasolina Euro-VI y cabina doble. Carga útil 1,5 T, GVW 3.040 kg. Caja de carga 3.050×1.750 mm. Norma de emisiones Euro-VI para zonas urbanas de alta restricción.',
  '{"Carga útil":"1,5 T","Combustible":"Gasolina Euro-VI","Potencia del motor":"122 HP","GVW":"3.040 kg","Caja de carga":"3.050×1.750 mm","Cabina":"Doble","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/camiones/kama-serie-w.jpg'], 10
FROM categories WHERE slug = 'camiones';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'kama-serie-x', 'KAMA Serie X — Multienergía', 'KAMA X Series — Multi-Fuel',
  'Camión KAMA Serie X disponible en gasolina, GNC y diésel Euro-IV/V. Carga útil 2–2,5 T, GVW hasta 4.600 kg. Potencia 107–131 HP. Cabina sencilla 1.750 mm y eje trasero de 2,5 T para alto rendimiento.',
  '{"Carga útil":"2–2,5 T","Combustible":"Gasolina / GNC / Diésel","Potencia del motor":"107–131 HP","GVW":"hasta 4.600 kg","Norma de emisiones":"Euro-IV/V","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/camiones/kama-serie-x.jpg'], 11
FROM categories WHERE slug = 'camiones';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'kama-serie-v', 'KAMA Serie V — Mini Camión', 'KAMA V Series — Mini Truck',
  'Mini camión KAMA Serie V con motor gasolina Euro-VI. Carga útil 1,2–1,5 T, GVW 2.700–3.250 kg. Potencia hasta 148 HP, cabina compacta 1.715 mm. Diseñado para distribución urbana y zonas de acceso restringido.',
  '{"Carga útil":"1,2–1,5 T","Combustible":"Gasolina Euro-VI","Potencia del motor":"hasta 148 HP","GVW":"2.700–3.250 kg","Cabina":"1.715 mm (compacta)","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/camiones/kama-serie-v.jpg'], 12
FROM categories WHERE slug = 'camiones';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'kama-m36f', 'KAMA M36F — Diésel Euro-VI', 'KAMA M36F — Diesel Euro-VI',
  'Camión KAMA M36F con motor Weichai WP2.3 de 148 HP y norma Euro-VI. Carga útil 4 T, GVW 5.580 kg. El único modelo Euro-VI de la serie M3, para zonas urbanas con restricción de emisiones.',
  '{"Modelo":"M36F","Carga útil":"4 T","GVW":"5.580 kg","Motor":"Weichai WP2.3","Potencia del motor":"148 HP","Norma de emisiones":"Euro-VI","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/camiones/kama-m36f.jpg'], 13
FROM categories WHERE slug = 'camiones';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'kama-serie-m6', 'KAMA Serie M6 — Carga Media/Pesada', 'KAMA M6 Series — Medium/Heavy Cargo',
  'Gama KAMA Serie M6 (M61 a M69E) en gas y diésel. Carga útil 3,5–10 T, GVW 6.320–14.870 kg. Potencia 148–201 HP con opción de motor Isuzu. Cabina extra-ancha 2.030 mm para largas distancias.',
  '{"Carga útil":"3,5–10 T","Combustible":"Gas / Diésel","Potencia del motor":"148–201 HP","GVW":"6.320–14.870 kg","Cabina":"2.030 mm (extra-ancha)","Motor (opción)":"Isuzu","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/camiones/kama-serie-m6.jpg'], 14
FROM categories WHERE slug = 'camiones';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'kama-gm67e', 'KAMA GM67E — Diésel Euro-V', 'KAMA GM67E — Diesel Euro-V',
  'Camión KAMA GM67E con motor Yunnei YNF40E1 de 168 HP. Carga útil 10 T, GVW 16.620 kg, caja de alta pared de 800 mm. Norma Euro-V. Para transporte de carga pesada en rutas de larga distancia.',
  '{"Modelo":"GM67E","Carga útil":"10 T","GVW":"16.620 kg","Motor":"Yunnei YNF40E1","Potencia del motor":"168 HP","Norma de emisiones":"Euro-V","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/camiones/kama-gm67e.jpg'], 15
FROM categories WHERE slug = 'camiones';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'kama-serie-ew-ev', 'KAMA EW/EV — Eléctrico Mini', 'KAMA EW/EV — Electric Mini Truck',
  'Mini camiones eléctricos KAMA Serie EW/EV (5 modelos BEV). Carga útil 1–1,5 T, GVW 2.100–3.390 kg. Motor 35 kW (70 kW pico). Autonomía 130–280 km WLTP. Baterías GOTION/EVE/CATL certificadas.',
  '{"Carga útil":"1–1,5 T","Tipo":"Eléctrico BEV","Motor":"35 kW / 70 kW pico","GVW":"2.100–3.390 kg","Autonomía":"130–280 km (WLTP)","Baterías":"GOTION / EVE / CATL","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/camiones/kama-serie-ew-ev.jpg'], 16
FROM categories WHERE slug = 'camiones';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'kama-serie-es-esp', 'KAMA ES/ESP — Furgón Eléctrico', 'KAMA ES/ESP — Electric Van',
  'Furgones eléctricos KAMA ES (carga) y ESP (pasajeros, 11–18 pax). 6 modelos BEV, GVW 3.050–3.350 kg, motor 35–70 kW. Puertas corredizas, escotillas 270°. Conformidad ECE para mercado regulado.',
  '{"Tipo":"Eléctrico BEV","Capacidad carga":"1–1,5 T","Pasajeros (ESP)":"11–18","GVW":"3.050–3.350 kg","Motor":"35–70 kW","Cumplimiento":"ECE","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/camiones/kama-serie-es-esp.jpg'], 17
FROM categories WHERE slug = 'camiones';

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'kama-serie-ex-em', 'KAMA EX/EM — Eléctrico Pesado', 'KAMA EX/EM — Heavy Electric Truck',
  'Camiones eléctricos KAMA EX/EM (5 modelos BEV) de hasta 8 T de carga. Cabinas 1.750 y 1.900 mm, GVW 3.510–8.000 kg, motor 35–70 kW (140 kW pico). Baterías hasta 141 kWh, sistema de frenado EHB.',
  '{"Carga útil":"hasta 8 T","Tipo":"Eléctrico BEV","Motor":"35–70 kW / 140 kW pico","GVW":"3.510–8.000 kg","Batería":"hasta 141 kWh","Frenado":"EHB","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'], ARRAY['/images/products/camiones/kama-serie-ex-em.jpg'], 18
FROM categories WHERE slug = 'camiones';
