-- 0014_kama_m3_series.sql
-- Seeds KAMA M3 Series into the camiones category.
-- 6 variants: M31 (gasoline/Euro-IV), M33CNG (CNG/Euro-VI), M36C (diesel/Euro-III),
--             M36F (diesel/Euro-VI), M37E (diesel/Euro-V), M39B (diesel/Euro-II)
-- Payload 3–4.5 T. GVW up to 7.110 kg. Engines: JM 2.2L, CNG 2.5L, ISUZU 2.8L,
-- Weichai 2.3L, Yuchai 3.0L.
-- Note: M36F also exists as standalone product kama-m36f (separate entry, not replaced).

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT
  id,
  'kama-serie-m3',
  'KAMA Serie M3 — Camión Medio',
  'KAMA M3 Series — Medium Truck',
  'Gama KAMA Serie M3 con 6 configuraciones Euro-II a Euro-VI. Carga útil 3–4,5 T, GVW hasta 7.110 kg. Motores gasolina JM 2.2L, GNC 2.5L, ISUZU 2.8L 75–110 kW, Weichai 2.3L y Yuchai 3.0L. Cabina ancha 1.900 mm.',
  '{"Carga útil":"3–4,5 T","Combustible":"Gasolina / GNC / Diésel","Norma de emisiones":"Euro-II a Euro-VI","Potencia del motor":"75–110 kW","GVW":"hasta 7.110 kg","Cabina":"1.900 mm","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'],
  ARRAY['/images/products/camiones/kama-serie-m3.jpg'],
  21
FROM categories WHERE slug = 'camiones'
ON CONFLICT (slug) DO NOTHING;

UPDATE products
SET
  variants = '[
    {
      "model": "M31",
      "fuel_type": "gasoline",
      "emission": "Euro-IV",
      "payload_t": 3.0,
      "cabin": "one and half cabin (1900)",
      "wheelbase_mm": 3300,
      "overall_dims": "5995x2090x2390",
      "cargo_box": "3800x1920x450",
      "curb_weight_kg": 2280,
      "gvw_kg": 5280,
      "max_speed_kmh": 110,
      "tyre": "7.00R16LT",
      "front_rear_overhang_mm": "1125/1560",
      "wheel_track_mm": "1570/1560",
      "final_ratio": 6.833,
      "qty_wheels": "6+1",
      "brake_system": "Hydraulic brake",
      "parking_brake": "Central drum type",
      "gearshift": "5+1 speed manually",
      "battery_volt": "12V",
      "engine": {
        "model": "JM491Q-ME(JM)",
        "displacement_cc": 2237,
        "power_kw": 76,
        "power_rpm": 4200,
        "torque_nm": 193,
        "torque_rpm": "2800-3200"
      },
      "battery_ev": null,
      "features": {
        "abs": true,
        "power_steering": true,
        "ac": false,
        "power_window": true,
        "central_lock": true,
        "media": "MP5"
      },
      "notes": "A/C opcional"
    },
    {
      "model": "M33CNG",
      "fuel_type": "cng",
      "emission": "Euro-VI",
      "payload_t": 3.0,
      "cabin": "single cabin (1900)",
      "wheelbase_mm": 3360,
      "overall_dims": "5995x2200x2390",
      "cargo_box": "4160x2100x400",
      "curb_weight_kg": 2560,
      "gvw_kg": 5560,
      "max_speed_kmh": 100,
      "tyre": "7.00R16LT",
      "front_rear_overhang_mm": "1125/1510",
      "wheel_track_mm": "1610/1555",
      "final_ratio": 6.167,
      "qty_wheels": "6+1",
      "brake_system": "Hydraulic brake",
      "parking_brake": "Central drum type",
      "gearshift": "5+1 speed manually",
      "battery_volt": "12V",
      "engine": {
        "model": "N25C",
        "displacement_cc": 2476,
        "power_kw": 102,
        "power_rpm": 5200,
        "torque_nm": 230,
        "torque_rpm": "4000"
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
    },
    {
      "model": "M36C",
      "fuel_type": "diesel",
      "emission": "Euro-III",
      "payload_t": 3.5,
      "cabin": "single cabin (1900)",
      "wheelbase_mm": 3300,
      "overall_dims": "5995x2090x2400",
      "cargo_box": "4160x1920x450",
      "curb_weight_kg": 2560,
      "gvw_kg": 5560,
      "max_speed_kmh": 100,
      "tyre": "7.50R16",
      "front_rear_overhang_mm": "1125/1560",
      "wheel_track_mm": "1610/1555",
      "final_ratio": 5.571,
      "qty_wheels": "6+1",
      "brake_system": "Air brake",
      "parking_brake": "Spring energy air cut brake",
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
        "abs": true,
        "power_steering": true,
        "ac": true,
        "power_window": true,
        "central_lock": true,
        "media": "MP5"
      }
    },
    {
      "model": "M36F",
      "fuel_type": "diesel",
      "emission": "Euro-VI",
      "payload_t": 4.0,
      "cabin": "single cabin (1900)",
      "wheelbase_mm": 3360,
      "overall_dims": "5995x2200x2390",
      "cargo_box": "4160x2100x400",
      "curb_weight_kg": 2580,
      "gvw_kg": 5580,
      "max_speed_kmh": 100,
      "tyre": "7.00R16LT",
      "front_rear_overhang_mm": "1125/1510",
      "wheel_track_mm": "1600/1550",
      "final_ratio": 4.875,
      "qty_wheels": "6+1",
      "brake_system": "Air brake",
      "parking_brake": "Spring energy air cut brake",
      "gearshift": "6+1 speed manually",
      "battery_volt": "12V",
      "engine": {
        "model": "JE493ZLQ6A(ISUZU)",
        "displacement_cc": 2771,
        "power_kw": 110,
        "power_rpm": 2800,
        "torque_nm": 300,
        "torque_rpm": "1000"
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
    },
    {
      "model": "M37E",
      "fuel_type": "diesel",
      "emission": "Euro-V",
      "payload_t": 3.5,
      "cabin": "single cabin (1900)",
      "wheelbase_mm": 3300,
      "overall_dims": "5995x2180x2390",
      "cargo_box": "4160x2080x400",
      "curb_weight_kg": 2560,
      "gvw_kg": 5560,
      "max_speed_kmh": 100,
      "tyre": "7.00R16LT",
      "front_rear_overhang_mm": "1125/1560",
      "wheel_track_mm": "1575/1590",
      "final_ratio": 5.571,
      "qty_wheels": "6+1",
      "brake_system": "Air brake",
      "parking_brake": "Spring energy air cut brake",
      "gearshift": "5+1 speed manually",
      "battery_volt": "24V",
      "engine": {
        "model": "WP2.3Q110E50(WEICHAI)",
        "displacement_cc": 2290,
        "power_kw": 81,
        "power_rpm": 3200,
        "torque_nm": 280,
        "torque_rpm": "1600-2400"
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
      "notes": "ESC estándar"
    },
    {
      "model": "M39B",
      "fuel_type": "diesel",
      "emission": "Euro-II",
      "payload_t": 4.5,
      "cabin": "single cabin (1900)",
      "wheelbase_mm": 3360,
      "overall_dims": "5995x2200x2390",
      "cargo_box": "4160x2100x400",
      "curb_weight_kg": 2610,
      "gvw_kg": 7110,
      "max_speed_kmh": 100,
      "tyre": "7.00R16LT",
      "front_rear_overhang_mm": "1125/1510",
      "wheel_track_mm": "1600/1550",
      "final_ratio": 4.875,
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
WHERE slug = 'kama-serie-m3';
