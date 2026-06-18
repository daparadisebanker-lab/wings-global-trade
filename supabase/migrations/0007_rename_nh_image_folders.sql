-- ============================================================
-- Wings Global Trade — Rename New Holland image folder paths
-- Migration 0007
--
-- The overnight agent stored New Holland images under
-- "unknown-*" folder prefixes instead of "new-holland-*".
-- This migration corrects all 12 image paths in the DB to
-- match the renamed public/images/listings/ directories.
-- ============================================================

UPDATE products SET images = ARRAY['/images/listings/new-holland-sh504/hero.png']    WHERE slug = 'new-holland-sh504';
UPDATE products SET images = ARRAY['/images/listings/new-holland-snh504/hero.png']   WHERE slug = 'new-holland-snh504';
UPDATE products SET images = ARRAY['/images/listings/new-holland-snh554/hero.png']   WHERE slug = 'new-holland-snh554';
UPDATE products SET images = ARRAY['/images/listings/new-holland-snh704/hero.png']   WHERE slug = 'new-holland-snh704';
UPDATE products SET images = ARRAY['/images/listings/new-holland-snh754/hero.png']   WHERE slug = 'new-holland-snh754';
UPDATE products SET images = ARRAY['/images/listings/new-holland-snh804/hero.png']   WHERE slug = 'new-holland-snh804';
UPDATE products SET images = ARRAY['/images/listings/new-holland-snh1004/hero.png']  WHERE slug = 'new-holland-snh1004';
UPDATE products SET images = ARRAY['/images/listings/new-holland-snh1104/hero.png']  WHERE slug = 'new-holland-snh1104';
UPDATE products SET images = ARRAY['/images/listings/new-holland-snh1204/hero.png']  WHERE slug = 'new-holland-snh1204';
UPDATE products SET images = ARRAY['/images/listings/new-holland-snh1304/hero.png']  WHERE slug = 'new-holland-snh1304';
UPDATE products SET images = ARRAY['/images/listings/new-holland-snh1354/hero.png']  WHERE slug = 'new-holland-snh1354';
UPDATE products SET images = ARRAY['/images/listings/new-holland-tm140/hero.png']    WHERE slug = 'new-holland-tm140';
