-- 0020_kama_ex_em_series.sql
-- Replaces kama-serie-ex-em variants with full spec-sheet data.
-- 5 variants: EX1 (1.5T/230km), EX2 (2T/280km), EM31 (2.5T/290km),
--             EM32 (3T/350km), EM61 (4T/360km)
-- Fixes EX2 motor kW (was 35/70, correct is 50/105).
-- EM31/EM32 use EHB (Electronic Hydraulic Brake). EM61 uses Air brake.
-- Corrects pack_kwh precision: EM32 100.464, EM61 141.312.

UPDATE products
SET
  variants = '[
    {
      "model": "EX1",
      "fuel_type": "electric",
      "emission": null,
      "payload_t": 1.5,
      "cabin": "single cabin (1750)",
      "wheelbase_mm": 3180,
      "overall_dims": "5995x1950x2100",
      "cargo_box": "3980x1860x400",
      "curb_weight_kg": 2010,
      "gvw_kg": 3510,
      "max_speed_kmh": 80,
      "tyre": "185R15 6PR",
      "front_rear_overhang_mm": "1190/1625",
      "wheel_track_mm": "1485/1440",
      "final_ratio": null,
      "qty_wheels": "6+1",
      "brake_system": "Hydraulic brake",
      "parking_brake": "Central drum type",
      "gearshift": null,
      "battery_volt": null,
      "engine": null,
      "battery_ev": {
        "voltage_v": 328.44,
        "battery_brand": "EVE",
        "battery_type": "Lithium Iron Phosphate",
        "pack_kwh": 55.17,
        "charger": "Fast/slow",
        "motor_brand": "INOVANCE",
        "rated_peak_kw": "35/70",
        "range_km": 230
      },
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
      "model": "EX2",
      "fuel_type": "electric",
      "emission": null,
      "payload_t": 2.0,
      "cabin": "single cabin (1750)",
      "wheelbase_mm": 3180,
      "overall_dims": "5995x1950x2130",
      "cargo_box": "3980x1860x400",
      "curb_weight_kg": 2200,
      "gvw_kg": 4200,
      "max_speed_kmh": 80,
      "tyre": "185R15 8PR",
      "front_rear_overhang_mm": "1190/1625",
      "wheel_track_mm": "1495/1440",
      "final_ratio": null,
      "qty_wheels": "6+1",
      "brake_system": "Hydraulic brake",
      "parking_brake": "Central drum type",
      "gearshift": null,
      "battery_volt": null,
      "engine": null,
      "battery_ev": {
        "voltage_v": 396.06,
        "battery_brand": "EVE",
        "battery_type": "Lithium Iron Phosphate",
        "pack_kwh": 66.54,
        "charger": "Fast/slow",
        "motor_brand": "INOVANCE",
        "rated_peak_kw": "50/105",
        "range_km": 280
      },
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
      "model": "EM31",
      "fuel_type": "electric",
      "emission": null,
      "payload_t": 2.5,
      "cabin": "single cabin (1900)",
      "wheelbase_mm": 3360,
      "overall_dims": "5995x2200x2390",
      "cargo_box": "4160x2100x400",
      "curb_weight_kg": 2750,
      "gvw_kg": 5250,
      "max_speed_kmh": 90,
      "tyre": "7.00R16LT",
      "front_rear_overhang_mm": "1125/1510",
      "wheel_track_mm": "1625/1575",
      "final_ratio": null,
      "qty_wheels": "6+1",
      "brake_system": "EHB",
      "parking_brake": "Central drum type",
      "gearshift": null,
      "battery_volt": null,
      "engine": null,
      "battery_ev": {
        "voltage_v": 540.96,
        "battery_brand": "EVE",
        "battery_type": "Lithium Iron Phosphate",
        "pack_kwh": 81.14,
        "charger": "Fast/slow",
        "motor_brand": "DANA",
        "rated_peak_kw": "60/115",
        "range_km": 290
      },
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
      "model": "EM32",
      "fuel_type": "electric",
      "emission": null,
      "payload_t": 3.0,
      "cabin": "single cabin (2030)",
      "wheelbase_mm": 3360,
      "overall_dims": "5995x2200x2390",
      "cargo_box": "4160x2100x400",
      "curb_weight_kg": 2870,
      "gvw_kg": 5870,
      "max_speed_kmh": 90,
      "tyre": "7.00R16LT",
      "front_rear_overhang_mm": "1125/1510",
      "wheel_track_mm": "1718/1575",
      "final_ratio": null,
      "qty_wheels": "6+1",
      "brake_system": "EHB",
      "parking_brake": "Central drum type",
      "gearshift": null,
      "battery_volt": null,
      "engine": null,
      "battery_ev": {
        "voltage_v": 502.52,
        "battery_brand": "CATL",
        "battery_type": "Lithium Iron Phosphate",
        "pack_kwh": 100.464,
        "charger": "Fast/slow",
        "motor_brand": "DANA",
        "rated_peak_kw": "60/115",
        "range_km": 350
      },
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
      "model": "EM61",
      "fuel_type": "electric",
      "emission": null,
      "payload_t": 4.0,
      "cabin": "single cabin (2030)",
      "wheelbase_mm": 3600,
      "overall_dims": "6540x2470x2500",
      "cargo_box": "4600x2300x450",
      "curb_weight_kg": 4000,
      "gvw_kg": 8000,
      "max_speed_kmh": 90,
      "tyre": "245/70R19.5",
      "front_rear_overhang_mm": "1150/1790",
      "wheel_track_mm": "1765/1680",
      "final_ratio": null,
      "qty_wheels": "6+1",
      "brake_system": "Air brake",
      "parking_brake": "Spring energy air cut brake",
      "gearshift": null,
      "battery_volt": null,
      "engine": null,
      "battery_ev": {
        "voltage_v": 614.4,
        "battery_brand": "GOTION",
        "battery_type": "Lithium Iron Phosphate",
        "pack_kwh": 141.312,
        "charger": "Fast",
        "motor_brand": "DANA",
        "rated_peak_kw": "70/140",
        "range_km": 360
      },
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
WHERE slug = 'kama-serie-ex-em';
