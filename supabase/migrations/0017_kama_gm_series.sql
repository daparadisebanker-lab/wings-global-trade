-- 0017_kama_gm_series.sql
-- Replaces kama-serie-gm variants with full spec-sheet data.
-- Previous 0008 migration had core fields only. This adds overhang, wheel track,
-- final ratio, qty wheels, brake system, parking brake, battery volt per variant.
-- 4 variants: GM36B (diesel/Euro-II), GM37D (diesel/Euro-IV),
--             GM66B (diesel/Euro-II, 12T), GM67E (diesel/Euro-V, 10T)
-- All: air brake, 8+2 gearbox, 24V. GVW 11.200–18.300 kg.

UPDATE products
SET
  variants = '[
    {
      "model": "GM36B",
      "fuel_type": "diesel",
      "emission": "Euro-II",
      "payload_t": 6.5,
      "cabin": "one and half cabin (1900)",
      "wheelbase_mm": 3260,
      "overall_dims": "5850x2280x2400",
      "cargo_box": "3650x2100x600",
      "curb_weight_kg": 4700,
      "gvw_kg": 11200,
      "max_speed_kmh": 100,
      "tyre": "8.25R16",
      "front_rear_overhang_mm": "1130/1460",
      "wheel_track_mm": "1610/1655",
      "final_ratio": 5.286,
      "qty_wheels": "6+1",
      "brake_system": "Air brake",
      "parking_brake": "Spring energy air cut brake",
      "gearshift": "8+2 speed manually",
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
    },
    {
      "model": "GM37D",
      "fuel_type": "diesel",
      "emission": "Euro-IV",
      "payload_t": 6.5,
      "cabin": "one and half cabin (1900)",
      "wheelbase_mm": 3260,
      "overall_dims": "5850x2280x2400",
      "cargo_box": "3650x2100x600",
      "curb_weight_kg": 4700,
      "gvw_kg": 11200,
      "max_speed_kmh": 100,
      "tyre": "8.25R16",
      "front_rear_overhang_mm": "1130/1460",
      "wheel_track_mm": "1610/1655",
      "final_ratio": 5.286,
      "qty_wheels": "6+1",
      "brake_system": "Air brake",
      "parking_brake": "Spring energy air cut brake",
      "gearshift": "8+2 speed manually",
      "battery_volt": "24V",
      "engine": {
        "model": "YC4FA120-40(YUCHAI)",
        "displacement_cc": 2982,
        "power_kw": 88,
        "power_rpm": 2800,
        "torque_nm": 345,
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
      "model": "GM66B",
      "fuel_type": "diesel",
      "emission": "Euro-II",
      "payload_t": 12.0,
      "cabin": "one and half cabin (2030)",
      "wheelbase_mm": 3400,
      "overall_dims": "6350x2440x2640",
      "cargo_box": "4000x2300x800",
      "curb_weight_kg": 6300,
      "gvw_kg": 18300,
      "max_speed_kmh": 90,
      "tyre": "8.25R20",
      "front_rear_overhang_mm": "1300/1650",
      "wheel_track_mm": "1845/1800",
      "final_ratio": 5.833,
      "qty_wheels": "6+1",
      "brake_system": "Air brake",
      "parking_brake": "Spring energy air cut brake",
      "gearshift": "8+2 speed manually",
      "battery_volt": "24V",
      "engine": {
        "model": "YC4D130-33(YUCHAI)",
        "displacement_cc": 4210,
        "power_kw": 96,
        "power_rpm": 2800,
        "torque_nm": 380,
        "torque_rpm": "1400-1700"
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
      "model": "GM67E",
      "fuel_type": "diesel",
      "emission": "Euro-V",
      "payload_t": 10.0,
      "cabin": "single cabin (2030)",
      "wheelbase_mm": 3600,
      "overall_dims": "6500x2440x2640",
      "cargo_box": "4200x2300x800",
      "curb_weight_kg": 6620,
      "gvw_kg": 16620,
      "max_speed_kmh": 90,
      "tyre": "9.00R20",
      "front_rear_overhang_mm": "1300/1600",
      "wheel_track_mm": "1760/1800",
      "final_ratio": 6.333,
      "qty_wheels": "6+1",
      "brake_system": "Air brake",
      "parking_brake": "Spring energy air cut brake",
      "gearshift": "8+2 speed manually",
      "battery_volt": "24V",
      "engine": {
        "model": "YNF40E1(YUNNEI)",
        "displacement_cc": 3920,
        "power_kw": 125,
        "power_rpm": 2600,
        "torque_nm": 600,
        "torque_rpm": "1300-1900"
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
WHERE slug = 'kama-serie-gm';
