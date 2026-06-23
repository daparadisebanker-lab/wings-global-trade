-- 0016_kama_k_series.sql
-- Seeds KAMA K Series into the camiones category.
-- 5 variants: GK36E (diesel/Euro-V), K66A (diesel/Euro-I), K67B (diesel/Euro-III),
--             K68B (diesel/Euro-II), K69B (gasoline/Euro-II)
-- Payload 2–4 T. GVW 4.280–6.320 kg. Cabin 1.580–1.680 mm.
-- Engines: Yunnei 1.9L / 2.7L, ISUZU 2.8L, Yuchai 3.0L.

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT
  id,
  'kama-serie-k',
  'KAMA Serie K — Camión Ligero-Medio',
  'KAMA K Series — Light-Medium Truck',
  'Camión KAMA Serie K con 5 configuraciones Euro-I a Euro-V. Carga útil 2–4 T, GVW 4.280–6.320 kg. Motores Yunnei, ISUZU y Yuchai de 57–88 kW. Cabina compacta 1.580–1.680 mm.',
  '{"Carga útil":"2–4 T","Combustible":"Gasolina / Diésel","Norma de emisiones":"Euro-I a Euro-V","Potencia del motor":"57–88 kW","GVW":"4.280–6.320 kg","Cabina":"1.580–1.680 mm","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'],
  ARRAY['/images/products/camiones/kama-serie-k.jpg'],
  22
FROM categories WHERE slug = 'camiones'
ON CONFLICT (slug) DO NOTHING;

UPDATE products
SET
  variants = '[
    {
      "model": "GK36E",
      "fuel_type": "diesel",
      "emission": "Euro-V",
      "payload_t": 2.5,
      "cabin": "single cabin (1580)",
      "wheelbase_mm": 2600,
      "overall_dims": "5015x1900x2300",
      "cargo_box": "3180x1800x400",
      "curb_weight_kg": 2660,
      "gvw_kg": 5160,
      "max_speed_kmh": 90,
      "tyre": "6.00R15LT",
      "front_rear_overhang_mm": "1100/1315",
      "wheel_track_mm": "1385/1395",
      "final_ratio": 5.125,
      "qty_wheels": "6+1",
      "brake_system": "Hydraulic brake",
      "parking_brake": "Central drum type",
      "gearshift": "5+1 speed manually",
      "battery_volt": "24V",
      "engine": {
        "model": "D19TCIE1(YUNNEI)",
        "displacement_cc": 1910,
        "power_kw": 75,
        "power_rpm": 3600,
        "torque_nm": 250,
        "torque_rpm": "1600-2600"
      },
      "battery_ev": null,
      "features": {
        "abs": false,
        "power_steering": true,
        "ac": true,
        "power_window": true,
        "central_lock": true,
        "media": "MP3"
      },
      "notes": "ABS opcional"
    },
    {
      "model": "K66A",
      "fuel_type": "diesel",
      "emission": "Euro-I",
      "payload_t": 2.0,
      "cabin": "single cabin (1680)",
      "wheelbase_mm": 2800,
      "overall_dims": "5420x1900x2300",
      "cargo_box": "3600x1800x390",
      "curb_weight_kg": 2280,
      "gvw_kg": 4280,
      "max_speed_kmh": 90,
      "tyre": "6.50R16LT",
      "front_rear_overhang_mm": "1125/1495",
      "wheel_track_mm": "1500/1505",
      "final_ratio": 6.167,
      "qty_wheels": "6+1",
      "brake_system": "Hydraulic brake",
      "parking_brake": "Central drum type",
      "gearshift": "5+1 speed manually",
      "battery_volt": "12V",
      "engine": {
        "model": "JE493ZQ1(ISUZU)",
        "displacement_cc": 2771,
        "power_kw": 57,
        "power_rpm": 3600,
        "torque_nm": 172,
        "torque_rpm": "2000"
      },
      "battery_ev": null,
      "features": {
        "abs": false,
        "power_steering": true,
        "ac": true,
        "power_window": true,
        "central_lock": true,
        "media": "MP3"
      },
      "notes": "ABS opcional"
    },
    {
      "model": "K67B",
      "fuel_type": "diesel",
      "emission": "Euro-III",
      "payload_t": 2.5,
      "cabin": "single cabin (1680)",
      "wheelbase_mm": 2800,
      "overall_dims": "5420x1900x2300",
      "cargo_box": "3600x1800x390",
      "curb_weight_kg": 2280,
      "gvw_kg": 4780,
      "max_speed_kmh": 95,
      "tyre": "6.50R16LT",
      "front_rear_overhang_mm": "1125/1495",
      "wheel_track_mm": "1500/1505",
      "final_ratio": 6.167,
      "qty_wheels": "6+1",
      "brake_system": "Hydraulic brake",
      "parking_brake": "Central drum type",
      "gearshift": "5+1 speed manually",
      "battery_volt": "12V",
      "engine": {
        "model": "JE493ZLQ3A(ISUZU)",
        "displacement_cc": 2771,
        "power_kw": 75,
        "power_rpm": 3600,
        "torque_nm": 240,
        "torque_rpm": "2000"
      },
      "battery_ev": null,
      "features": {
        "abs": false,
        "power_steering": true,
        "ac": true,
        "power_window": true,
        "central_lock": true,
        "media": "MP5"
      },
      "notes": "ABS opcional"
    },
    {
      "model": "K68B",
      "fuel_type": "diesel",
      "emission": "Euro-II",
      "payload_t": 2.5,
      "cabin": "one and half cabin (1680)",
      "wheelbase_mm": 2600,
      "overall_dims": "5095x1900x2300",
      "cargo_box": "2880x1800x390",
      "curb_weight_kg": 2260,
      "gvw_kg": 4760,
      "max_speed_kmh": 95,
      "tyre": "6.50R16LT",
      "front_rear_overhang_mm": "1125/1370",
      "wheel_track_mm": "1475/1500",
      "final_ratio": 5.833,
      "qty_wheels": "6+1",
      "brake_system": "Hydraulic brake",
      "parking_brake": "Central drum type",
      "gearshift": "5+1 speed manually",
      "battery_volt": "12V",
      "engine": {
        "model": "YN490QZL(YUNNEI)",
        "displacement_cc": 2672,
        "power_kw": 60,
        "power_rpm": 3200,
        "torque_nm": 206,
        "torque_rpm": "2000-2200"
      },
      "battery_ev": null,
      "features": {
        "abs": false,
        "power_steering": true,
        "ac": true,
        "power_window": true,
        "central_lock": true,
        "media": "MP5"
      },
      "notes": "ABS opcional"
    },
    {
      "model": "K69B",
      "fuel_type": "gasoline",
      "emission": "Euro-II",
      "payload_t": 4.0,
      "cabin": "single cabin (1680)",
      "wheelbase_mm": 2800,
      "overall_dims": "5420x1900x2320",
      "cargo_box": "3600x1800x390",
      "curb_weight_kg": 2320,
      "gvw_kg": 6320,
      "max_speed_kmh": 95,
      "tyre": "7.50R16LT",
      "front_rear_overhang_mm": "1125/1495",
      "wheel_track_mm": "1520/1560",
      "final_ratio": 6.167,
      "qty_wheels": "6+1",
      "brake_system": "Air brake",
      "parking_brake": "Spring energy air cut brake",
      "gearshift": "6+1 speed manually",
      "battery_volt": "24V",
      "engine": {
        "model": "YC4FA120-33(YUCHAI)",
        "displacement_cc": 2982,
        "power_kw": 88,
        "power_rpm": 3200,
        "torque_nm": 345,
        "torque_rpm": "1800-2200"
      },
      "battery_ev": null,
      "features": {
        "abs": true,
        "power_steering": true,
        "ac": true,
        "power_window": true,
        "central_lock": true,
        "media": "MP5"
      }
    }
  ]'::jsonb,
  updated_at = now()
WHERE slug = 'kama-serie-k';
