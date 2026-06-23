-- 0018_kama_ew_ev_series.sql
-- Replaces kama-serie-ew-ev variants with full spec-sheet data.
-- Adds missing fields: overhang, wheel track, brake system, parking brake, qty wheels.
-- Corrects voltage precision. Updates battery_ev with exact spec-sheet values.
-- EV2 has dual battery pack option (41.86/53.58 kWh); stores larger pack, notes smaller.
-- All BEV. Motor 35kW rated / 70kW peak. Hydraulic brakes throughout.

UPDATE products
SET
  variants = '[
    {
      "model": "EW1",
      "fuel_type": "electric",
      "emission": null,
      "payload_t": 1.0,
      "cabin": "single cabin (1600) RHD",
      "wheelbase_mm": 2500,
      "overall_dims": "4140x1690x2030",
      "cargo_box": "3050x1600x360",
      "curb_weight_kg": 1100,
      "gvw_kg": 2100,
      "max_speed_kmh": 80,
      "tyre": "175R13LT",
      "front_rear_overhang_mm": "550/1090",
      "wheel_track_mm": "1435/1350",
      "final_ratio": null,
      "qty_wheels": "4+1",
      "brake_system": "Hydraulic brake",
      "parking_brake": "Front drum/rear drum",
      "gearshift": null,
      "battery_volt": null,
      "engine": null,
      "battery_ev": {
        "voltage_v": 358.4,
        "battery_brand": "GOTION",
        "battery_type": "Lithium Iron Phosphate",
        "pack_kwh": 24.01,
        "charger": "Fast/slow",
        "motor_brand": "INOVANCE",
        "rated_peak_kw": "35/70",
        "range_km": 130
      },
      "features": {
        "abs": true,
        "power_steering": true,
        "ac": true,
        "power_window": true,
        "central_lock": true,
        "media": "MP3"
      }
    },
    {
      "model": "EW2",
      "fuel_type": "electric",
      "emission": null,
      "payload_t": 1.5,
      "cabin": "single cabin (1600) RHD",
      "wheelbase_mm": 3050,
      "overall_dims": "4960x1780x2055",
      "cargo_box": "3050x1690x360",
      "curb_weight_kg": 1250,
      "gvw_kg": 2750,
      "max_speed_kmh": 80,
      "tyre": "195R14C",
      "front_rear_overhang_mm": "550/1360",
      "wheel_track_mm": "1435/1440",
      "final_ratio": null,
      "qty_wheels": "4+1",
      "brake_system": "Hydraulic brake",
      "parking_brake": "Front disc/rear drum",
      "gearshift": null,
      "battery_volt": null,
      "engine": null,
      "battery_ev": {
        "voltage_v": 309.12,
        "battery_brand": "EVE",
        "battery_type": "Lithium Iron Phosphate",
        "pack_kwh": 38.64,
        "charger": "Fast/slow",
        "motor_brand": "INOVANCE",
        "rated_peak_kw": "35/70",
        "range_km": 200
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
      "model": "EV1",
      "fuel_type": "electric",
      "emission": null,
      "payload_t": 1.5,
      "cabin": "single cabin",
      "wheelbase_mm": 3450,
      "overall_dims": "5595x1770x2070",
      "cargo_box": "3300x1680x360",
      "curb_weight_kg": 1600,
      "gvw_kg": 3150,
      "max_speed_kmh": 90,
      "tyre": "185R14LT",
      "front_rear_overhang_mm": "750/1395",
      "wheel_track_mm": "1560/1450",
      "final_ratio": null,
      "qty_wheels": "4+1",
      "brake_system": "Hydraulic brake",
      "parking_brake": "Front disc/rear drum",
      "gearshift": null,
      "battery_volt": null,
      "engine": null,
      "battery_ev": {
        "voltage_v": 332.8,
        "battery_brand": "GOTION",
        "battery_type": "Lithium Iron Phosphate",
        "pack_kwh": 41.932,
        "charger": "Fast/slow (CCS2)",
        "motor_brand": "Wuhan Lincontrol",
        "rated_peak_kw": "35/70",
        "range_km": 220
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
      "model": "EV2",
      "fuel_type": "electric",
      "emission": null,
      "payload_t": 1.5,
      "cabin": "single cabin",
      "wheelbase_mm": 3450,
      "overall_dims": "5595x1770x2070",
      "cargo_box": "3300x1680x360",
      "curb_weight_kg": 1650,
      "gvw_kg": 3150,
      "max_speed_kmh": 90,
      "tyre": "185R14LT",
      "front_rear_overhang_mm": "750/1395",
      "wheel_track_mm": "1560/1450",
      "final_ratio": null,
      "qty_wheels": "4+1",
      "brake_system": "Hydraulic brake",
      "parking_brake": "Front disc/rear drum",
      "gearshift": null,
      "battery_volt": null,
      "engine": null,
      "battery_ev": {
        "voltage_v": 334.88,
        "battery_brand": "CATL",
        "battery_type": "Lithium Iron Phosphate",
        "pack_kwh": 53.58,
        "charger": "Fast/slow (CCS2)",
        "motor_brand": "Wuhan Lincontrol",
        "rated_peak_kw": "35/70",
        "range_km": 280
      },
      "features": {
        "abs": true,
        "power_steering": true,
        "ac": true,
        "power_window": true,
        "central_lock": true,
        "media": "MP5"
      },
      "notes": "Disponible en dos configuraciones de batería: 41.86 kWh / 220 km (1600 kg) y 53.58 kWh / 280 km (1650 kg)"
    },
    {
      "model": "EV3",
      "fuel_type": "electric",
      "emission": null,
      "payload_t": 1.5,
      "cabin": "single cabin",
      "wheelbase_mm": 3600,
      "overall_dims": "5595x1910x2120",
      "cargo_box": "3700x1820x360",
      "curb_weight_kg": 1690,
      "gvw_kg": 3390,
      "max_speed_kmh": 90,
      "tyre": "185R14LT",
      "front_rear_overhang_mm": "750/1645",
      "wheel_track_mm": "1440/1400",
      "final_ratio": null,
      "qty_wheels": "6+1",
      "brake_system": "Hydraulic brake",
      "parking_brake": "Front disc/rear drum",
      "gearshift": null,
      "battery_volt": null,
      "engine": null,
      "battery_ev": {
        "voltage_v": 384.0,
        "battery_brand": "GOTION",
        "battery_type": "Lithium Iron Phosphate",
        "pack_kwh": 51.46,
        "charger": "Fast/slow",
        "motor_brand": "Wuhan Lincontrol",
        "rated_peak_kw": "35/70",
        "range_km": 260
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
WHERE slug = 'kama-serie-ew-ev';
