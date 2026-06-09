-- ─────────────────────────────────────────────────────────────────────────────
-- MIGRATION: Fix New Holland brand, images, and T1104 ID
-- Wings sells the entire SinoHarvest / SNH / SH / TM / CD range under the
-- commercial "New Holland" brand name. Supabase was seeded with the factory
-- manufacturer name instead of the commercial brand name.
-- ─────────────────────────────────────────────────────────────────────────────

-- 0. Condition — all current inventory is used/pre-owned
UPDATE listings SET condition = 'used';

-- 1. Brand name — fix all SinoHarvest → New Holland
UPDATE listings
SET brand = 'New Holland'
WHERE brand = 'SinoHarvest';

-- 2. Titles — add "New Holland" prefix to all affected model titles
UPDATE listings SET title = 'New Holland SH504 Tractor'    WHERE id = 'unknown-sh504';
UPDATE listings SET title = 'New Holland SNH504 Tractor'   WHERE id = 'unknown-snh504';
UPDATE listings SET title = 'New Holland SNH554 Tractor'   WHERE id = 'unknown-snh554';
UPDATE listings SET title = 'New Holland SNH704 Tractor'   WHERE id = 'unknown-snh704';
UPDATE listings SET title = 'New Holland SNH754 Tractor'   WHERE id = 'unknown-snh754';
UPDATE listings SET title = 'New Holland SNH804 Tractor'   WHERE id = 'unknown-snh804';
UPDATE listings SET title = 'New Holland SNH804 Tractor'   WHERE id = 'unknown-snh804-2';
UPDATE listings SET title = 'New Holland SNH904 Tractor'   WHERE id = 'unknown-snh904';
UPDATE listings SET title = 'New Holland SNH1004 Tractor'  WHERE id = 'unknown-snh1004';
UPDATE listings SET title = 'New Holland SNH1104 Tractor'  WHERE id = 'unknown-snh1104';
UPDATE listings SET title = 'New Holland T1104 Tractor'    WHERE id = 'sinoharvest-t1104';
UPDATE listings SET title = 'New Holland SNH1204 Tractor'  WHERE id = 'unknown-snh1204';
UPDATE listings SET title = 'New Holland SNH1304 Tractor'  WHERE id = 'unknown-snh1304';
UPDATE listings SET title = 'New Holland SNH1354 Tractor'  WHERE id = 'unknown-snh1354';
UPDATE listings SET title = 'New Holland TM140 Tractor'    WHERE id = 'unknown-tm140';
UPDATE listings SET title = 'New Holland SH554-C Tractor'  WHERE id = 'unknown-sh554-c';
UPDATE listings SET title = 'New Holland SH704-1 Tractor'  WHERE id = 'unknown-sh704-1';
UPDATE listings SET title = 'New Holland CD904-1 Tractor'  WHERE id = 'unknown-cd904-1';
UPDATE listings SET title = 'New Holland CD904-S Tractor'  WHERE id = 'unknown-cd904-s';

-- 3. Hero images — populate images array for all models that have photos
UPDATE listings SET images = ARRAY['/images/listings/unknown-sh504/hero.png']     WHERE id = 'unknown-sh504';
UPDATE listings SET images = ARRAY['/images/listings/unknown-snh504/hero.png']    WHERE id = 'unknown-snh504';
UPDATE listings SET images = ARRAY['/images/listings/unknown-snh554/hero.png']    WHERE id = 'unknown-snh554';
UPDATE listings SET images = ARRAY['/images/listings/unknown-snh704/hero.png']    WHERE id = 'unknown-snh704';
UPDATE listings SET images = ARRAY['/images/listings/unknown-snh754/hero.png']    WHERE id = 'unknown-snh754';
UPDATE listings SET images = ARRAY['/images/listings/unknown-snh804/hero.png']    WHERE id = 'unknown-snh804';
UPDATE listings SET images = ARRAY['/images/listings/unknown-snh804-2/hero.png']  WHERE id = 'unknown-snh804-2';
UPDATE listings SET images = ARRAY['/images/listings/unknown-snh1004/hero.png']   WHERE id = 'unknown-snh1004';
UPDATE listings SET images = ARRAY['/images/listings/unknown-snh1104/hero.png']   WHERE id = 'unknown-snh1104';
UPDATE listings SET images = ARRAY['/images/listings/unknown-snh1204/hero.png']   WHERE id = 'unknown-snh1204';
UPDATE listings SET images = ARRAY['/images/listings/unknown-snh1304/hero.png']   WHERE id = 'unknown-snh1304';
UPDATE listings SET images = ARRAY['/images/listings/unknown-snh1354/hero.png']   WHERE id = 'unknown-snh1354';
UPDATE listings SET images = ARRAY['/images/listings/unknown-tm140/hero.png']     WHERE id = 'unknown-tm140';

-- T1104 image is set AFTER the ID rename below (step 4)

-- 4. Fix T1104 ID mismatch — rename sinoharvest-t1104 to match JSON catalog ID
--    (JSON uses 'New Holland-t1104'; this deduplication is needed so the
--    listings merge logic doesn't show two T1104 cards)
UPDATE listings
SET id = 'New Holland-t1104'
WHERE id = 'sinoharvest-t1104';

-- Now set T1104 image using the corrected ID
UPDATE listings
SET images = ARRAY['/images/listings/New Holland-t1104/hero.png']
WHERE id = 'New Holland-t1104';

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFY — run these SELECTs after applying the migration to confirm results
-- ─────────────────────────────────────────────────────────────────────────────
-- SELECT id, brand, title, array_length(images, 1) AS image_count
-- FROM listings
-- WHERE brand = 'New Holland'
-- ORDER BY id;
--
-- SELECT COUNT(*) FROM listings WHERE brand = 'SinoHarvest';  -- should return 0
