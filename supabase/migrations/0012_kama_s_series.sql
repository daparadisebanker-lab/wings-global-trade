-- 0012_kama_s_series.sql
-- Seeds KAMA S Series Mini Van into the camiones category.
-- 6 variants: S6 (cargo), S7CNG (cargo CNG), S8 (cargo large), SP6 (11 pax), SP7 (14 pax), SP8 (18 pax)
-- All Euro-VI. Engine: DAE 1.6 L (77–90 kW) or DAE 2.0 L (110 kW). GVW 2.620–3.300 kg.

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT
  id,
  'kama-serie-s',
  'KAMA Serie S — Mini Van',
  'KAMA S Series — Mini Van',
  'Mini furgonetas y minibuses KAMA Serie S. 6 modelos Euro-VI: S6 (carga 1,5 T), S7CNG (GNC, cabina doble), S8 (carga 7,6 m³), SP6 (11 pax), SP7 (14 pax), SP8 (18 pax). Motor DAE 1,6–2,0 L, 77–110 kW. GVW 2.620–3.300 kg.',
  '{"Carga útil":"1–1,5 T","Pasajeros":"11–18 (variante SP)","Combustible":"Gasolina Euro-VI / GNC","Potencia del motor":"77–110 kW","GVW":"2.620–3.300 kg","Caja de carga":"hasta 7,6 m³ (variante S)","Precio":"A cotizar"}'::jsonb,
  ARRAY['China'],
  ARRAY['/images/products/camiones/kama-serie-s.jpg'],
  19
FROM categories WHERE slug = 'camiones'
ON CONFLICT (slug) DO NOTHING;

UPDATE products
SET
  variants = '[
    {
      "model": "S6",
      "fuel_type": "gasoline",
      "emission": "Euro-VI",
      "payload_t": 1.5,
      "cabin": "single cabin for van",
      "wheelbase_mm": 3050,
      "overall_dims": "4865x1715x1995",
      "cargo_box": "2670x1550x1350 (5.6m3)",
      "curb_weight_kg": 1465,
      "gvw_kg": 2965,
      "max_speed_kmh": 100,
      "tyre": "185R14LT",
      "front_rear_overhang_mm": "750/1065",
      "wheel_track_mm": "1560/1450",
      "final_ratio": 5.125,
      "qty_wheels": "4+1",
      "brake_system": "Hydraulic brake",
      "parking_brake": "Central drum type",
      "gearshift": "5+1 speed manually",
      "battery_volt": "12V",
      "engine": {
        "model": "DAM16KR(DAE)",
        "displacement_cc": 1597,
        "power_kw": 90,
        "power_rpm": 6000,
        "torque_nm": 158,
        "torque_rpm": "4800"
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
      "model": "S7CNG",
      "fuel_type": "cng",
      "emission": "Euro-VI",
      "payload_t": 1.5,
      "cabin": "double cabin for van",
      "wheelbase_mm": 3450,
      "overall_dims": "5265x1715x1995",
      "cargo_box": "3205x1550x1350 (6.7m3)",
      "curb_weight_kg": 1560,
      "gvw_kg": 3060,
      "max_speed_kmh": 100,
      "tyre": "185R14LT",
      "front_rear_overhang_mm": "750/1065",
      "wheel_track_mm": "1560/1450",
      "final_ratio": 5.833,
      "qty_wheels": "4+1",
      "brake_system": "Hydraulic brake",
      "parking_brake": "Central drum type",
      "gearshift": "5+1 speed manually",
      "battery_volt": "12V",
      "engine": {
        "model": "DAM16KRC(DAE)",
        "displacement_cc": 1597,
        "power_kw": 77,
        "power_rpm": 6000,
        "torque_nm": 158,
        "torque_rpm": "4800"
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
      "model": "S8",
      "fuel_type": "gasoline",
      "emission": "Euro-VI",
      "payload_t": 1.5,
      "cabin": "double cabin for van",
      "wheelbase_mm": 3450,
      "overall_dims": "5265x1870x2060",
      "cargo_box": "3225x1705x1380 (7.6m3)",
      "curb_weight_kg": 1600,
      "gvw_kg": 3100,
      "max_speed_kmh": 100,
      "tyre": "195/70R15LT",
      "front_rear_overhang_mm": "750/1065",
      "wheel_track_mm": "1615/1605",
      "final_ratio": 5.375,
      "qty_wheels": "4+1",
      "brake_system": "Hydraulic brake",
      "parking_brake": "Central drum type",
      "gearshift": "5+1 speed manually",
      "battery_volt": "12V",
      "engine": {
        "model": "DAN20R(DAE)",
        "displacement_cc": 1998,
        "power_kw": 110,
        "power_rpm": 6000,
        "torque_nm": 204,
        "torque_rpm": "4400"
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
      "model": "SP6",
      "fuel_type": "gasoline",
      "emission": "Euro-VI",
      "payload_t": 1.0,
      "cabin": "Unitized body-11seats",
      "wheelbase_mm": 3050,
      "overall_dims": "4865x1715x1995",
      "cargo_box": "2+3+3+3 SEATS LINING",
      "curb_weight_kg": 1620,
      "gvw_kg": 2620,
      "max_speed_kmh": 100,
      "tyre": "185R14LT",
      "front_rear_overhang_mm": "750/1065",
      "wheel_track_mm": "1560/1450",
      "final_ratio": 5.125,
      "qty_wheels": "4+1",
      "brake_system": "Hydraulic brake",
      "parking_brake": "Central drum type",
      "gearshift": "5+1 speed manually",
      "battery_volt": "12V",
      "engine": {
        "model": "DAM16KR(DAE)",
        "displacement_cc": 1597,
        "power_kw": 90,
        "power_rpm": 6000,
        "torque_nm": 158,
        "torque_rpm": "4800"
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
      "model": "SP7",
      "fuel_type": "gasoline",
      "emission": "Euro-VI",
      "payload_t": 1.2,
      "cabin": "Unitized body-14seats",
      "wheelbase_mm": 3450,
      "overall_dims": "5265x1715x1995",
      "cargo_box": "2+3+3+3+3 SEATS LINING",
      "curb_weight_kg": 1690,
      "gvw_kg": 2810,
      "max_speed_kmh": 100,
      "tyre": "185R14LT",
      "front_rear_overhang_mm": "750/1065",
      "wheel_track_mm": "1560/1450",
      "final_ratio": 5.125,
      "qty_wheels": "4+1",
      "brake_system": "Hydraulic brake",
      "parking_brake": "Central drum type",
      "gearshift": "5+1 speed manually",
      "battery_volt": "12V",
      "engine": {
        "model": "DAM16KR(DAE)",
        "displacement_cc": 1597,
        "power_kw": 90,
        "power_rpm": 6000,
        "torque_nm": 158,
        "torque_rpm": "4800"
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
      "model": "SP8",
      "fuel_type": "gasoline",
      "emission": "Euro-VI",
      "payload_t": 1.5,
      "cabin": "Unitized body-18seats",
      "wheelbase_mm": 3450,
      "overall_dims": "5265x1870x2060",
      "cargo_box": "2+4+4+4+4 SEATS LINING",
      "curb_weight_kg": 1800,
      "gvw_kg": 3300,
      "max_speed_kmh": 100,
      "tyre": "195/70R15LT",
      "front_rear_overhang_mm": "750/1065",
      "wheel_track_mm": "1615/1605",
      "final_ratio": 5.375,
      "qty_wheels": "4+1",
      "brake_system": "Hydraulic brake",
      "parking_brake": "Central drum type",
      "gearshift": "5+1 speed manually",
      "battery_volt": "12V",
      "engine": {
        "model": "DAN20R(DAE)",
        "displacement_cc": 1998,
        "power_kw": 110,
        "power_rpm": 6000,
        "torque_nm": 204,
        "torque_rpm": "4400"
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
WHERE slug = 'kama-serie-s';
