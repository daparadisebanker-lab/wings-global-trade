-- 0010_kama_x_series.sql
-- KAMA X Series: mid-size mini trucks 2–2.5T payload, 1750mm single cabin.
-- 3 gasoline/CNG variants (LIUJI, Euro-VI) + 2 diesel (ISUZU/WEICHAI, Euro-III to Euro-V).
-- 5 variants: X11, X12CNG, X31C, X32D, X33E.

INSERT INTO products (
  id, category_id, slug, name_es, name_en, description_es, description_en,
  specs, source_markets, images, models, variants, is_active, sort_order
)
SELECT
  gen_random_uuid(),
  c.id,
  'kama-serie-x',
  'KAMA Serie X — Mini Camiones Gasolina/Diésel',
  'KAMA X Series — Gasoline/Diesel Mini Trucks',
  'Mini camiones de 2 a 2.5 toneladas con cabina sencilla de 1750mm. Motor a gasolina LIUJI Euro-VI o diésel ISUZU/WEICHAI Euro-III a Euro-V. Frenos hidráulicos, transmisión 5+1 manual. 5 variantes: X11, X12CNG, X31C, X32D, X33E.',
  'Mini trucks 2–2.5T payload, 1750mm single cabin, LIUJI gasoline Euro-VI or ISUZU/WEICHAI diesel Euro-III to Euro-V. 5 variants: X11, X12CNG, X31C, X32D, X33E.',
  '{"Carga útil":"2–2.5 T","GVW máx":"4.600 kg","Motor":"Gasolina/Diésel 1962–2771 cc","Potencia":"75–98 kW","Transmisión":"5+1 manual","Batalla":"2650–3180 mm","Norma emisión":"Euro-III / Euro-VI","Frenos":"Hidráulicos"}'::jsonb,
  ARRAY['China'],
  ARRAY[]::text[],
  '[]'::jsonb,
  '[{"model":"X11","fuel_type":"gasoline","emission":"Euro-VI","payload_t":2.0,"cabin":"single cabin 1750mm","wheelbase_mm":2900,"overall_dims":"5580x1950x2100","cargo_box":"3510x1860x360","curb_weight_kg":1980,"gvw_kg":3980,"max_speed_kmh":100,"tyre":"185R14LT","gearshift":"5+1 speed manually","battery_volt":"12V","engine":{"model":"LJ481Q6(LIUJI)","displacement_cc":1962,"power_kw":98,"power_rpm":5600,"torque_nm":200,"torque_rpm":"3600-4400"},"battery_ev":null,"features":{"abs":true,"power_steering":true,"ac":true,"power_window":true,"central_lock":true,"media":"MP5"}},{"model":"X12CNG","fuel_type":"cng","emission":"Euro-VI","payload_t":2.0,"cabin":"single cabin 1750mm","wheelbase_mm":3180,"overall_dims":"5995x1840x2120","cargo_box":"3950x1750x360","curb_weight_kg":2040,"gvw_kg":4040,"max_speed_kmh":100,"tyre":"185R14LT","gearshift":"5+1 speed manually","battery_volt":"12V","engine":{"model":"LJ481QS6(LIUJI)","displacement_cc":1962,"power_kw":90,"power_rpm":5600,"torque_nm":172,"torque_rpm":"3600-4400"},"battery_ev":null,"features":{"abs":true,"power_steering":true,"ac":true,"power_window":true,"central_lock":true,"media":"MP5"}},{"model":"X31C","fuel_type":"diesel","emission":"Euro-III","payload_t":2.0,"cabin":"single cabin 1750mm","wheelbase_mm":2650,"overall_dims":"5305x1840x2100","cargo_box":"3235x1750x360","curb_weight_kg":2120,"gvw_kg":4120,"max_speed_kmh":90,"tyre":"6.00R15LT","gearshift":"5+1 speed manually","battery_volt":"12V","engine":{"model":"JE493ZLQ3A(ISUZU)","displacement_cc":2771,"power_kw":75,"power_rpm":3600,"torque_nm":240,"torque_rpm":"2000"},"battery_ev":null,"features":{"abs":true,"power_steering":true,"ac":true,"power_window":true,"central_lock":true,"media":"MP5"}},{"model":"X32D","fuel_type":"diesel","emission":"Euro-IV","payload_t":2.5,"cabin":"single cabin 1750mm","wheelbase_mm":2850,"overall_dims":"5615x1840x2120","cargo_box":"3575x1750x360","curb_weight_kg":2090,"gvw_kg":4590,"max_speed_kmh":90,"tyre":"6.00R15LT","gearshift":"5+1 speed manually","battery_volt":"12V","engine":{"model":"JE493ZLQ4(ISUZU)","displacement_cc":2771,"power_kw":80,"power_rpm":3400,"torque_nm":260,"torque_rpm":"2000"},"battery_ev":null,"features":{"abs":true,"power_steering":true,"ac":true,"power_window":true,"central_lock":true,"media":"MP5"}},{"model":"X33E","fuel_type":"diesel","emission":"Euro-V","payload_t":2.5,"cabin":"single cabin 1750mm","wheelbase_mm":2850,"overall_dims":"5640x1840x2120","cargo_box":"3600x1750x360","curb_weight_kg":2100,"gvw_kg":4600,"max_speed_kmh":90,"tyre":"185R15LT","gearshift":"5+1 speed manually","battery_volt":"24V","engine":{"model":"WP2.3Q110E50(WEICHAI)","displacement_cc":2290,"power_kw":81,"power_rpm":3200,"torque_nm":280,"torque_rpm":"1600-2400"},"battery_ev":null,"features":{"abs":true,"power_steering":true,"ac":true,"power_window":true,"central_lock":true,"media":"MP5"},"notes":"ABS + ESC"}]'::jsonb,
  true,
  15
FROM categories c
WHERE c.slug = 'camiones'
ON CONFLICT (slug) DO UPDATE SET
  variants = EXCLUDED.variants,
  updated_at = now();
