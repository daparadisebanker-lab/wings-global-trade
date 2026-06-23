-- 0013_kama_m1_series.sql
-- Seeds KAMA M1 Series Light Truck into the camiones category.
-- 6 variants: M11D (gasoline/Euro-IV), M15C (diesel/Euro-III), M16C (diesel/Euro-III),
--             M16D (diesel/Euro-IV, air brake), M18E (diesel/Euro-V), M19E (diesel/Euro-V, 24V)
-- Payload 2.5–3.5 T. Engines: JM 2.2L, ISUZU 2.8L, WEICHAI 2.3L.

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT
  id,
  'kama-serie-m1',
  'KAMA Serie M1 — Camión Ligero',
  'KAMA M1 Series — Light Truck',
  'Camión ligero KAMA Serie M1 con 6 configuraciones Euro-III/IV/V. Carga útil 2,5–3,5 T, GVW 4.280–5.850 kg. Motores ISUZU 2.8L y Weichai 2.3L de hasta 90 kW. Cabina 1.760 mm, caja de carga hasta 3.720×1.920 mm.',
  '{"Carga útil":"2,5–3,5 T","Combustible":"Gasolina / Diésel","Norma de emisiones":"Euro-III / IV / V","Potencia del motor":"75–90 kW","GVW":"4.280–5.850 kg","Cabina":"1.760 mm","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'],
  ARRAY['/images/products/camiones/kama-serie-m1.jpg'],
  20
FROM categories WHERE slug = 'camiones'
ON CONFLICT (slug) DO NOTHING;

UPDATE products
SET
  variants = '[
    {
      "model": "M11D",
      "fuel_type": "gasoline",
      "emission": "Euro-IV",
      "payload_t": 2.5,
      "cabin": "one and half cabin (1760)",
      "wheelbase_mm": 3100,
      "overall_dims": "5915x1960x2300",
      "cargo_box": "3720x1860x400",
      "curb_weight_kg": 2120,
      "gvw_kg": 4620,
      "max_speed_kmh": 100,
      "tyre": "6.50R16LT",
      "front_rear_overhang_mm": "1125/1690",
      "wheel_track_mm": "1475/1485",
      "final_ratio": 5.833,
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
        "torque_nm": 195,
        "torque_rpm": "2600"
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
      "model": "M15C",
      "fuel_type": "diesel",
      "emission": "Euro-III",
      "payload_t": 2.5,
      "cabin": "single cabin (1760)",
      "wheelbase_mm": 2550,
      "overall_dims": "4903x1960x2380",
      "cargo_box": "3000x1860x400",
      "curb_weight_kg": 2200,
      "gvw_kg": 4700,
      "max_speed_kmh": 95,
      "tyre": "7.00R16LT",
      "front_rear_overhang_mm": "1125/1228",
      "wheel_track_mm": "1510/1485",
      "final_ratio": 4.875,
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
        "abs": true,
        "power_steering": true,
        "ac": true,
        "power_window": true,
        "central_lock": true,
        "media": "MP5"
      }
    },
    {
      "model": "M16C",
      "fuel_type": "diesel",
      "emission": "Euro-III",
      "payload_t": 3.0,
      "cabin": "single cabin (1760)",
      "wheelbase_mm": 2860,
      "overall_dims": "5523x1850x2380",
      "cargo_box": "3700x1750x400",
      "curb_weight_kg": 2280,
      "gvw_kg": 4280,
      "max_speed_kmh": 95,
      "tyre": "7.00R16LT",
      "front_rear_overhang_mm": "1125/1538",
      "wheel_track_mm": "1510/1440",
      "final_ratio": 4.875,
      "qty_wheels": "4+1",
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
      }
    },
    {
      "model": "M16D",
      "fuel_type": "diesel",
      "emission": "Euro-IV",
      "payload_t": 3.0,
      "cabin": "single cabin (1760)",
      "wheelbase_mm": 2800,
      "overall_dims": "5420x1950x2380",
      "cargo_box": "3600x1850x400",
      "curb_weight_kg": 2320,
      "gvw_kg": 5320,
      "max_speed_kmh": 95,
      "tyre": "6.50R16LT",
      "front_rear_overhang_mm": "1125/1495",
      "wheel_track_mm": "1485/1500",
      "final_ratio": 5.571,
      "qty_wheels": "6+1",
      "brake_system": "Air brake",
      "parking_brake": "Spring energy air cut brake",
      "gearshift": "6+1 speed manually",
      "battery_volt": "12V",
      "engine": {
        "model": "JE493ZLQ4(ISUZU)",
        "displacement_cc": 2771,
        "power_kw": 80,
        "power_rpm": 3400,
        "torque_nm": 260,
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
      "model": "M18E",
      "fuel_type": "diesel",
      "emission": "Euro-V",
      "payload_t": 3.5,
      "cabin": "single cabin (1760)",
      "wheelbase_mm": 2860,
      "overall_dims": "5525x2020x2380",
      "cargo_box": "3700x1920x400",
      "curb_weight_kg": 2350,
      "gvw_kg": 5850,
      "max_speed_kmh": 95,
      "tyre": "6.50R16LT",
      "front_rear_overhang_mm": "1125/1540",
      "wheel_track_mm": "1530/1485",
      "final_ratio": 4.333,
      "qty_wheels": "6+1",
      "brake_system": "Hydraulic brake",
      "parking_brake": "Central drum type",
      "gearshift": "5+1 speed manually",
      "battery_volt": "12V",
      "engine": {
        "model": "JE493ZLQ4D(ISUZU)",
        "displacement_cc": 2771,
        "power_kw": 90,
        "power_rpm": 3200,
        "torque_nm": 330,
        "torque_rpm": "1600-2400"
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
      "model": "M19E",
      "fuel_type": "diesel",
      "emission": "Euro-V",
      "payload_t": 3.0,
      "cabin": "single cabin (1760)",
      "wheelbase_mm": 2800,
      "overall_dims": "5420x1950x2380",
      "cargo_box": "3600x1850x400",
      "curb_weight_kg": 2330,
      "gvw_kg": 5330,
      "max_speed_kmh": 95,
      "tyre": "6.50R16LT",
      "front_rear_overhang_mm": "1125/1495",
      "wheel_track_mm": "1530/1485",
      "final_ratio": 4.875,
      "qty_wheels": "6+1",
      "brake_system": "Hydraulic brake",
      "parking_brake": "Central drum type",
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
WHERE slug = 'kama-serie-m1';
