-- 0008_product_variants.sql
-- Option B: typed variant system for products with multiple configurations.
-- Adds a `variants` JSONB column alongside the existing `models` column.
-- KAMA truck series are the primary use case: each series = one product row,
-- each model within the series = one ProductVariant object in the array.

ALTER TABLE products ADD COLUMN IF NOT EXISTS variants jsonb NULL;

COMMENT ON COLUMN products.variants IS
  'Typed ProductVariant[] — for products with multiple model configs (e.g. KAMA series). '
  'When present, VariantTable renders in ProductDetail and InquiryForm shows a model selector. '
  'Source of truth: src/data/kama-trucks.json';

CREATE INDEX IF NOT EXISTS products_variants_gin ON products USING gin (variants);

-- Seed KAMA W Series
INSERT INTO products (
  id, category_id, slug, name_es, name_en, description_es, description_en,
  specs, source_markets, images, models, variants, is_active, sort_order
)
SELECT
  gen_random_uuid(),
  c.id,
  'kama-serie-w',
  'KAMA Serie W — Mini Camiones Gasolina',
  'KAMA W Series — Gasoline Mini Trucks',
  'Mini camiones de 1 a 1.5 toneladas con cabina de 1600mm, disponibles en versión sencilla y doble. Motor a gasolina con norma Euro-V y Euro-VI. 5 variantes: W11, W12, W15S, W21, W25S.',
  'Gasoline mini trucks 1–1.5T payload, 1600mm cab, Euro-V/VI, 5 variants.',
  '{"Carga útil":"1–1.5 T","GVW máx":"3.040 kg","Motor":"Gasolina 1249–1590 cc","Potencia":"61–91 kW","Transmisión":"5+1 manual","Batalla":"2700–3600 mm","Norma emisión":"Euro-V / Euro-VI"}'::jsonb,
  ARRAY['China'],
  ARRAY[]::text[],
  '[]'::jsonb,
  '[{"model":"W11","fuel_type":"gasoline","emission":"Euro-V","payload_t":1.0,"cabin":"single cabin 1600mm","wheelbase_mm":2700,"overall_dims":"4290x1690x2030","cargo_box":"1200x1600x360","curb_weight_kg":1260,"gvw_kg":2260,"max_speed_kmh":100,"tyre":"175R14LT","gearshift":"5+1 speed manually","battery_volt":"12V","engine":{"model":"LJ469Q-1AE(IIJUI)","displacement_cc":1249,"power_kw":61,"power_rpm":6000,"torque_nm":115,"torque_rpm":"3500-4400"},"battery_ev":null,"features":{"abs":true,"power_steering":true,"ac":true,"power_window":false,"central_lock":true,"media":"MP5"}},{"model":"W12","fuel_type":"gasoline","emission":"Euro-V","payload_t":1.0,"cabin":"single cabin 1600mm","wheelbase_mm":2700,"overall_dims":"4655x1690x2030","cargo_box":"1960x1600x360","curb_weight_kg":1320,"gvw_kg":2520,"max_speed_kmh":100,"tyre":"175R14LT","gearshift":"5+1 speed manually","battery_volt":"12V","engine":{"model":"LJ469Q-1AE(IIJUI)","displacement_cc":1249,"power_kw":61,"power_rpm":6000,"torque_nm":115,"torque_rpm":"3500-4400"},"battery_ev":null,"features":{"abs":true,"power_steering":true,"ac":true,"power_window":true,"central_lock":true,"media":"MP5"}},{"model":"W15S","fuel_type":"gasoline","emission":"Euro-VI","payload_t":1.5,"cabin":"double cabin 1600mm","wheelbase_mm":3300,"overall_dims":"5560x1840x2040","cargo_box":"3235x1750x560","curb_weight_kg":1500,"gvw_kg":3000,"max_speed_kmh":100,"tyre":"185R14LT","gearshift":"5+1 speed manually","battery_volt":"12V","engine":{"model":"LJ469Q-1AE(IIJUI)","displacement_cc":1249,"power_kw":61,"power_rpm":6000,"torque_nm":115,"torque_rpm":"3500-4400"},"battery_ev":null,"features":{"abs":true,"power_steering":true,"ac":true,"power_window":true,"central_lock":true,"media":"MP5"}},{"model":"W21","fuel_type":"gasoline","emission":"Euro-VI","payload_t":1.0,"cabin":"single cabin 1600mm","wheelbase_mm":3300,"overall_dims":"5240x1840x2040","cargo_box":"2880x1750x560","curb_weight_kg":1450,"gvw_kg":2950,"max_speed_kmh":100,"tyre":"185R14LT","gearshift":"5+1 speed manually","battery_volt":"12V","engine":{"model":"LJ4A160G(IIJUI)","displacement_cc":1590,"power_kw":91,"power_rpm":6000,"torque_nm":161,"torque_rpm":"3750-4250"},"battery_ev":null,"features":{"abs":true,"power_steering":true,"ac":true,"power_window":true,"central_lock":true,"media":"MP5"}},{"model":"W25S","fuel_type":"gasoline","emission":"Euro-VI","payload_t":1.5,"cabin":"double cabin 1600mm","wheelbase_mm":3600,"overall_dims":"5855x1840x2040","cargo_box":"3050x1750x360","curb_weight_kg":1540,"gvw_kg":3040,"max_speed_kmh":100,"tyre":"185R14LT","gearshift":"5+1 speed manually","battery_volt":"12V","engine":{"model":"LJ4A160G(IIJUI)","displacement_cc":1590,"power_kw":91,"power_rpm":6000,"torque_nm":161,"torque_rpm":"3750-4250"},"battery_ev":null,"features":{"abs":true,"power_steering":true,"ac":true,"power_window":true,"central_lock":true,"media":"MP5"}}]'::jsonb,
  true,
  10
FROM categories c
WHERE c.slug = 'camiones'
ON CONFLICT (slug) DO UPDATE SET
  variants = EXCLUDED.variants,
  updated_at = now();

-- Seed KAMA GM Series (Dumper Trucks)
INSERT INTO products (
  id, category_id, slug, name_es, name_en, description_es, description_en,
  specs, source_markets, images, models, variants, is_active, sort_order
)
SELECT
  gen_random_uuid(),
  c.id,
  'kama-serie-gm',
  'KAMA Serie GM — Volquetes Diésel',
  'KAMA GM Series — Diesel Dumper Trucks',
  'Volquetes diésel de 6.5 a 12 toneladas. Motor YUCHAI o YUNNEI, frenos de aire, caja 8+2. GVW hasta 18.3 toneladas. 4 variantes: GM36B, GM37D, GM66B, GM67E.',
  'Diesel dumper trucks 6.5–12T payload, YUCHAI/YUNNEI engines, air brakes, 4 variants.',
  '{"Carga útil":"6.5–12 T","GVW máx":"18.300 kg","Motor":"Diésel 2982–4210 cc","Potencia":"88–125 kW","Transmisión":"8+2 manual","Frenos":"Aire","Cabina":"1900 / 2030 mm"}'::jsonb,
  ARRAY['China'],
  ARRAY[]::text[],
  '[]'::jsonb,
  '[{"model":"GM36B","fuel_type":"diesel","emission":"Euro-II","payload_t":6.5,"cabin":"one-and-half cabin 1900mm","wheelbase_mm":3260,"overall_dims":"5850x2280x2400","cargo_box":"3650x2100x600","curb_weight_kg":4700,"gvw_kg":11200,"max_speed_kmh":100,"tyre":"8.25R16","gearshift":"8+2 speed manually","battery_volt":"24V","engine":{"model":"YC4FA120-33(YUCHAI)","displacement_cc":2982,"power_kw":88,"power_rpm":3200,"torque_nm":345,"torque_rpm":"1800-2200"},"battery_ev":null,"features":{"abs":true,"power_steering":true,"ac":true,"power_window":true,"central_lock":true,"media":"MP5"}},{"model":"GM37D","fuel_type":"diesel","emission":"Euro-IV","payload_t":6.5,"cabin":"one-and-half cabin 1900mm","wheelbase_mm":3260,"overall_dims":"5850x2280x2400","cargo_box":"3650x2100x600","curb_weight_kg":4700,"gvw_kg":11200,"max_speed_kmh":100,"tyre":"8.25R16","gearshift":"8+2 speed manually","battery_volt":"24V","engine":{"model":"YC4FA120-40(YUCHAI)","displacement_cc":2982,"power_kw":88,"power_rpm":2800,"torque_nm":345,"torque_rpm":"1600-2400"},"battery_ev":null,"features":{"abs":true,"power_steering":true,"ac":true,"power_window":true,"central_lock":true,"media":"MP5"}},{"model":"GM66B","fuel_type":"diesel","emission":"Euro-II","payload_t":12.0,"cabin":"one-and-half cabin 2030mm","wheelbase_mm":3400,"overall_dims":"6350x2440x2640","cargo_box":"4000x2300x800","curb_weight_kg":6300,"gvw_kg":18300,"max_speed_kmh":90,"tyre":"8.25R20","gearshift":"8+2 speed manually","battery_volt":"24V","engine":{"model":"YC4D130-33(YUCHAI)","displacement_cc":4210,"power_kw":96,"power_rpm":2800,"torque_nm":380,"torque_rpm":"1400-1700"},"battery_ev":null,"features":{"abs":false,"power_steering":true,"ac":true,"power_window":true,"central_lock":true,"media":"MP5"}},{"model":"GM67E","fuel_type":"diesel","emission":"Euro-V","payload_t":10.0,"cabin":"single cabin 2030mm","wheelbase_mm":3600,"overall_dims":"6500x2440x2640","cargo_box":"4200x2300x800","curb_weight_kg":6620,"gvw_kg":16620,"max_speed_kmh":90,"tyre":"9.00R20","gearshift":"8+2 speed manually","battery_volt":"24V","engine":{"model":"YNF40E1(YUNNEI)","displacement_cc":3920,"power_kw":125,"power_rpm":2600,"torque_nm":600,"torque_rpm":"1300-1900"},"battery_ev":null,"features":{"abs":true,"power_steering":true,"ac":true,"power_window":true,"central_lock":true,"media":"MP5"}}]'::jsonb,
  true,
  20
FROM categories c
WHERE c.slug = 'camiones'
ON CONFLICT (slug) DO UPDATE SET
  variants = EXCLUDED.variants,
  updated_at = now();

-- Seed KAMA EX/EM Series (BEV Heavy Trucks)
INSERT INTO products (
  id, category_id, slug, name_es, name_en, description_es, description_en,
  specs, source_markets, images, models, variants, is_active, sort_order
)
SELECT
  gen_random_uuid(),
  c.id,
  'kama-serie-ex-em',
  'KAMA Serie EX/EM — Camiones Eléctricos',
  'KAMA EX/EM Series — BEV Trucks',
  'Camiones eléctricos medianos-pesados de 1.5 a 4 toneladas. Batería LFP EVE/CATL/GOTION hasta 141 kWh. Motor DANA hasta 140 kW pico. Autonomía WLTP: 230 a 360 km. 5 variantes: EX1, EX2, EM31, EM32, EM61.',
  'BEV medium-heavy trucks 1.5–4T, LFP battery up to 141 kWh, DANA motor up to 140kW peak, 230–360km WLTP range.',
  '{"Tipo":"Eléctrico BEV","Carga útil":"1.5–4 T","GVW máx":"8.000 kg","Batería":"LFP 55–141 kWh","Autonomía WLTP":"230–360 km","Motor":"35–70 / 140 kW pico","Cabina":"1750–2030 mm"}'::jsonb,
  ARRAY['China'],
  ARRAY[]::text[],
  '[]'::jsonb,
  '[{"model":"EX1","fuel_type":"bev","emission":null,"payload_t":1.5,"cabin":"single cabin 1750mm","wheelbase_mm":3180,"overall_dims":"5995x1950x2100","cargo_box":"3980x1860x400","curb_weight_kg":2010,"gvw_kg":3510,"max_speed_kmh":80,"tyre":"185R15 6PR","gearshift":null,"battery_volt":null,"engine":null,"battery_ev":{"pack_kwh":55.17,"range_km":230,"voltage_v":328,"battery_brand":"EVE","battery_type":"Lithium Iron Phosphate","motor_brand":"INOVANCE","rated_peak_kw":"35/70","charger":"Fast/slow"},"features":{"abs":true,"power_steering":true,"ac":true,"power_window":true,"central_lock":true,"media":"MP5"}},{"model":"EX2","fuel_type":"bev","emission":null,"payload_t":2.0,"cabin":"single cabin 1750mm","wheelbase_mm":3180,"overall_dims":"5995x1950x2130","cargo_box":"3980x1860x400","curb_weight_kg":2200,"gvw_kg":4200,"max_speed_kmh":80,"tyre":"185R15 8PR","gearshift":null,"battery_volt":null,"engine":null,"battery_ev":{"pack_kwh":66.54,"range_km":280,"voltage_v":396,"battery_brand":"EVE","battery_type":"Lithium Iron Phosphate","motor_brand":"INOVANCE","rated_peak_kw":"35/70","charger":"Fast/slow"},"features":{"abs":true,"power_steering":true,"ac":true,"power_window":true,"central_lock":true,"media":"MP5"}},{"model":"EM31","fuel_type":"bev","emission":null,"payload_t":2.5,"cabin":"single cabin 1900mm","wheelbase_mm":3360,"overall_dims":"5995x2200x2390","cargo_box":"4160x2100x400","curb_weight_kg":2750,"gvw_kg":5250,"max_speed_kmh":90,"tyre":"7.00R16LT","gearshift":null,"battery_volt":null,"engine":null,"battery_ev":{"pack_kwh":81.14,"range_km":290,"voltage_v":541,"battery_brand":"EVE","battery_type":"Lithium Iron Phosphate","motor_brand":"DANA","rated_peak_kw":"60/115","charger":"Fast/slow"},"features":{"abs":true,"power_steering":true,"ac":true,"power_window":true,"central_lock":true,"media":"MP5"}},{"model":"EM32","fuel_type":"bev","emission":null,"payload_t":3.0,"cabin":"single cabin 2030mm","wheelbase_mm":3360,"overall_dims":"5995x2200x2390","cargo_box":"4160x2100x400","curb_weight_kg":2870,"gvw_kg":5870,"max_speed_kmh":90,"tyre":"7.00R16LT","gearshift":null,"battery_volt":null,"engine":null,"battery_ev":{"pack_kwh":100.46,"range_km":350,"voltage_v":502,"battery_brand":"CATL","battery_type":"Lithium Iron Phosphate","motor_brand":"DANA","rated_peak_kw":"60/115","charger":"Fast/slow"},"features":{"abs":true,"power_steering":true,"ac":true,"power_window":true,"central_lock":true,"media":"MP5"}},{"model":"EM61","fuel_type":"bev","emission":null,"payload_t":4.0,"cabin":"single cabin 2030mm","wheelbase_mm":3600,"overall_dims":"6540x2470x2500","cargo_box":"4600x2300x450","curb_weight_kg":4000,"gvw_kg":8000,"max_speed_kmh":90,"tyre":"245/70R19.5","gearshift":null,"battery_volt":null,"engine":null,"battery_ev":{"pack_kwh":141.31,"range_km":360,"voltage_v":614,"battery_brand":"GOTION","battery_type":"Lithium Iron Phosphate","motor_brand":"DANA","rated_peak_kw":"70/140","charger":"Fast"},"features":{"abs":true,"power_steering":true,"ac":true,"power_window":true,"central_lock":true,"media":"MP5"}}]'::jsonb,
  true,
  30
FROM categories c
WHERE c.slug = 'camiones'
ON CONFLICT (slug) DO UPDATE SET
  variants = EXCLUDED.variants,
  updated_at = now();

-- Seed KAMA EW/EV Series (BEV Mini Trucks)
INSERT INTO products (
  id, category_id, slug, name_es, name_en, description_es, description_en,
  specs, source_markets, images, models, variants, is_active, sort_order
)
SELECT
  gen_random_uuid(),
  c.id,
  'kama-serie-ew-ev',
  'KAMA Serie EW/EV — Mini Camiones Eléctricos',
  'KAMA EW/EV Series — BEV Mini Trucks',
  'Mini camiones eléctricos de 1 a 1.5 toneladas. Batería LFP GOTION/EVE/CATL. Motor 35/70 kW. Autonomía WLTP: 130 a 280 km. 5 variantes: EW1, EW2, EV1, EV2, EV3.',
  'BEV mini trucks 1–1.5T, GOTION/EVE/CATL LFP battery, 35/70kW motor, 130–280km WLTP.',
  '{"Tipo":"Eléctrico BEV","Carga útil":"1–1.5 T","GVW máx":"3.390 kg","Batería":"LFP 24–54 kWh","Autonomía WLTP":"130–280 km","Motor":"35/70 kW","Cabina":"1600 mm"}'::jsonb,
  ARRAY['China'],
  ARRAY[]::text[],
  '[]'::jsonb,
  '[{"model":"EW1","fuel_type":"bev","emission":null,"payload_t":1.0,"cabin":"single cabin 1600mm RHD","wheelbase_mm":2500,"overall_dims":"4140x1690x2030","cargo_box":"3050x1600x360","curb_weight_kg":1100,"gvw_kg":2100,"max_speed_kmh":80,"tyre":"175R13LT","gearshift":null,"battery_volt":null,"engine":null,"battery_ev":{"pack_kwh":24.01,"range_km":130,"voltage_v":358,"battery_brand":"GOTION","battery_type":"Lithium Iron Phosphate","motor_brand":"INOVANCE","rated_peak_kw":"35/70","charger":"Fast/slow"},"features":{"abs":true,"power_steering":true,"ac":true,"power_window":true,"central_lock":true,"media":"MP3"}},{"model":"EW2","fuel_type":"bev","emission":null,"payload_t":1.5,"cabin":"single cabin 1600mm RHD","wheelbase_mm":3050,"overall_dims":"4960x1780x2055","cargo_box":"3050x1690x360","curb_weight_kg":1250,"gvw_kg":2750,"max_speed_kmh":80,"tyre":"195R14C","gearshift":null,"battery_volt":null,"engine":null,"battery_ev":{"pack_kwh":38.64,"range_km":200,"voltage_v":309,"battery_brand":"EVE","battery_type":"Lithium Iron Phosphate","motor_brand":"INOVANCE","rated_peak_kw":"35/70","charger":"Fast/slow"},"features":{"abs":true,"power_steering":true,"ac":true,"power_window":true,"central_lock":true,"media":"MP5"}},{"model":"EV1","fuel_type":"bev","emission":null,"payload_t":1.5,"cabin":"single cabin","wheelbase_mm":3450,"overall_dims":"5595x1770x2070","cargo_box":"3300x1680x360","curb_weight_kg":1600,"gvw_kg":3150,"max_speed_kmh":90,"tyre":"185R14LT","gearshift":null,"battery_volt":null,"engine":null,"battery_ev":{"pack_kwh":41.93,"range_km":220,"voltage_v":333,"battery_brand":"GOTION","battery_type":"Lithium Iron Phosphate","motor_brand":"Wuhan Lincontrol","rated_peak_kw":"35/70","charger":"Fast/slow (CCS2)"},"features":{"abs":true,"power_steering":true,"ac":true,"power_window":true,"central_lock":true,"media":"MP5"}},{"model":"EV2","fuel_type":"bev","emission":null,"payload_t":1.5,"cabin":"single cabin","wheelbase_mm":3450,"overall_dims":"5595x1910x2070","cargo_box":"3300x1680x360","curb_weight_kg":1625,"gvw_kg":3150,"max_speed_kmh":90,"tyre":"185R14LT","gearshift":null,"battery_volt":null,"engine":null,"battery_ev":{"pack_kwh":53.58,"range_km":280,"voltage_v":335,"battery_brand":"CATL","battery_type":"Lithium Iron Phosphate","motor_brand":"Wuhan Lincontrol","rated_peak_kw":"35/70","charger":"Fast/slow (CCS2)"},"features":{"abs":true,"power_steering":true,"ac":true,"power_window":true,"central_lock":true,"media":"MP5"}},{"model":"EV3","fuel_type":"bev","emission":null,"payload_t":1.5,"cabin":"single cabin","wheelbase_mm":3600,"overall_dims":"5595x1910x2120","cargo_box":"3700x1820x360","curb_weight_kg":1690,"gvw_kg":3390,"max_speed_kmh":90,"tyre":"185R14LT","gearshift":null,"battery_volt":null,"engine":null,"battery_ev":{"pack_kwh":51.46,"range_km":260,"voltage_v":384,"battery_brand":"GOTION","battery_type":"Lithium Iron Phosphate","motor_brand":"Wuhan Lincontrol","rated_peak_kw":"35/70","charger":"Fast/slow"},"features":{"abs":true,"power_steering":true,"ac":true,"power_window":true,"central_lock":true,"media":"MP5"}}]'::jsonb,
  true,
  40
FROM categories c
WHERE c.slug = 'camiones'
ON CONFLICT (slug) DO UPDATE SET
  variants = EXCLUDED.variants,
  updated_at = now();
