-- ============================================================
-- Wings Global Trade — Fix product image paths + add JD 5055E
-- Real images live at /images/listings/{folder}/hero.png
-- ============================================================

-- New Holland (folders use "unknown-" prefix from PDF extractor)
UPDATE products SET images = ARRAY['/images/listings/unknown-sh504/hero.png']    WHERE slug = 'new-holland-sh504';
UPDATE products SET images = ARRAY['/images/listings/unknown-snh504/hero.png']   WHERE slug = 'new-holland-snh504';
UPDATE products SET images = ARRAY['/images/listings/unknown-snh554/hero.png']   WHERE slug = 'new-holland-snh554';
UPDATE products SET images = ARRAY['/images/listings/unknown-snh704/hero.png']   WHERE slug = 'new-holland-snh704';
UPDATE products SET images = ARRAY['/images/listings/unknown-snh754/hero.png']   WHERE slug = 'new-holland-snh754';
UPDATE products SET images = ARRAY['/images/listings/unknown-snh804/hero.png']   WHERE slug = 'new-holland-snh804';
UPDATE products SET images = ARRAY['/images/listings/unknown-snh1004/hero.png']  WHERE slug = 'new-holland-snh1004';
UPDATE products SET images = ARRAY['/images/listings/unknown-snh1104/hero.png']  WHERE slug = 'new-holland-snh1104';
UPDATE products SET images = ARRAY['/images/listings/new-holland-t1104/hero.png'] WHERE slug = 'new-holland-t1104';
UPDATE products SET images = ARRAY['/images/listings/unknown-snh1204/hero.png']  WHERE slug = 'new-holland-snh1204';
UPDATE products SET images = ARRAY['/images/listings/unknown-snh1304/hero.png']  WHERE slug = 'new-holland-snh1304';
UPDATE products SET images = ARRAY['/images/listings/unknown-snh1354/hero.png']  WHERE slug = 'new-holland-snh1354';
UPDATE products SET images = ARRAY['/images/listings/unknown-tm140/hero.png']    WHERE slug = 'new-holland-tm140';

-- John Deere
UPDATE products SET images = ARRAY['/images/listings/john-deere-5b-704/hero.png']  WHERE slug = 'john-deere-5b-704';
UPDATE products SET images = ARRAY['/images/listings/john-deere-5e-854/hero.png']  WHERE slug = 'john-deere-5e-854';
UPDATE products SET images = ARRAY['/images/listings/john-deere-5e-954/hero.png']  WHERE slug = 'john-deere-5e-954';
UPDATE products SET images = ARRAY['/images/listings/john-deere-5e-1104/hero.png'] WHERE slug = 'john-deere-5e-1104';
UPDATE products SET images = ARRAY['/images/listings/john-deere-5e-1204/hero.png'] WHERE slug = 'john-deere-5e-1204';
UPDATE products SET images = ARRAY['/images/listings/john-deere-6b1204/hero.png']  WHERE slug = 'john-deere-6b1204';
UPDATE products SET images = ARRAY['/images/listings/john-deere-6e1404/hero.png']  WHERE slug = 'john-deere-6e1404';
UPDATE products SET images = ARRAY['/images/listings/john-deere-6b1404/hero.png']  WHERE slug = 'john-deere-6b1404';

-- Massey Ferguson (folder uses dash before C: massey-ferguson-s1204-c)
UPDATE products SET images = ARRAY['/images/listings/massey-ferguson-mf1004/hero.png']  WHERE slug = 'massey-ferguson-mf1004';
UPDATE products SET images = ARRAY['/images/listings/massey-ferguson-mf1104/hero.png']  WHERE slug = 'massey-ferguson-mf1104';
UPDATE products SET images = ARRAY['/images/listings/massey-ferguson-mf1204/hero.png']  WHERE slug = 'massey-ferguson-mf1204';
UPDATE products SET images = ARRAY['/images/listings/massey-ferguson-s1204-c/hero.png'] WHERE slug = 'massey-ferguson-s1204c';

-- Kubota
UPDATE products SET images = ARRAY['/images/listings/kubota-m704k/hero.png']   WHERE slug = 'kubota-m704k';
UPDATE products SET images = ARRAY['/images/listings/kubota-m854k/hero.png']   WHERE slug = 'kubota-m854k';
UPDATE products SET images = ARRAY['/images/listings/kubota-m954k/hero.png']   WHERE slug = 'kubota-m954k';
UPDATE products SET images = ARRAY['/images/listings/kubota-m954kq/hero.png']  WHERE slug = 'kubota-m954kq';
UPDATE products SET images = ARRAY['/images/listings/kubota-m1004q/hero.png']  WHERE slug = 'kubota-m1004q';

-- ============================================================
-- Add missing John Deere 5055E (image exists, product was absent)
-- ============================================================
INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id,
  'john-deere-5055e',
  'John Deere 5055E',
  'John Deere 5055E Tractor',
  'Tractor de utilidad John Deere 5055E de 55 HP con tracción 4WD y transmisión 9+3. Peso operativo 2.700 kg. Plataforma ligera y maniobrable para labranza en fincas medianas y cultivos intensivos en LATAM.',
  '{"Potencia del motor":"55 HP","Tipo de tracción":"4WD","Transmisión":"9+3","Peso operativo":"2.700 kg","Marca":"John Deere","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'],
  ARRAY['/images/listings/jd-5055e/hero.png'],
  29
FROM categories WHERE slug = 'maquinaria-agricola';
