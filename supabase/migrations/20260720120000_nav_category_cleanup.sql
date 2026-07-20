-- ============================================================
-- Wings Global Trade — Navigation category cleanup
-- Migration 20260720120000
-- Depends on: 0006_expand_categories.sql
--
-- Requested 2026-07-20 (Muaaz). Two changes:
--
-- 1. Consolidate the two overlapping bus categories into ONE canonical
--    "Buses y Transporte". Live state has both:
--      - 'buses'               → 29 products, 0 subcategories  (the real one)
--      - 'buses-y-transporte'  → 0 products, 4 subcategories   (empty shadow)
--    The populated row ('buses', 29 products) becomes canonical so no product
--    is reassigned; it is renamed and given the two intended subcategories.
--    The empty shadow is deactivated (its already-hidden by the app's nav
--    filter, this makes it explicit and keeps it out of the sitemap too).
--    Final subcategories: Buses Urbanos + Buses Interprovinciales.
--
-- 2. Give the UTV category its icon_key (was NULL → generic gear fallback).
--
-- Idempotent (safe to re-run). Do NOT run manually against prod — apply via
-- the Supabase migration pipeline (root CLAUDE.md: "Never manual prod SQL").
-- ============================================================

BEGIN;

-- ── 1. Buses consolidation ──────────────────────────────────────────────────

-- 1a. Canonical bus category = the populated slug 'buses'.
UPDATE categories
SET name_es = 'Buses y Transporte',
    name_en = 'Buses & Transport'
WHERE slug = 'buses';

-- 1b. Move + rename the two intended subcategories onto the canonical category.
--     'buses-urbanos' stays; reparent it to 'buses'.
UPDATE subcategories
SET category_id = (SELECT id FROM categories WHERE slug = 'buses'),
    name_es = 'Buses Urbanos',
    name_en = 'Urban Buses',
    sort_order = 1
WHERE slug = 'buses-urbanos';

--     Repurpose 'buses-interurbanos' → 'buses-interprovinciales'.
UPDATE subcategories
SET category_id = (SELECT id FROM categories WHERE slug = 'buses'),
    slug = 'buses-interprovinciales',
    name_es = 'Buses Interprovinciales',
    name_en = 'Intercity Buses',
    sort_order = 2
WHERE slug = 'buses-interurbanos';

-- 1c. Drop the leftover subcategories of the old shadow (0 products reference them).
DELETE FROM subcategories WHERE slug IN ('minibuses', 'buses-escolares');

-- 1d. Deactivate the empty shadow category.
UPDATE categories
SET is_active = false
WHERE slug = 'buses-y-transporte';

-- ── 2. UTV icon ─────────────────────────────────────────────────────────────

UPDATE categories
SET icon_key = 'utv'
WHERE slug = 'utv' AND icon_key IS NULL;

COMMIT;
