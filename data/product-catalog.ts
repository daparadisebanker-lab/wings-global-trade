export type ListingCondition = "new" | "used" | "refurbished";

export type TractorListingDetails = {
  engine?: {
    manufacturer?: string;
    model?: string;
    displacement_cc?: number;
    cylinders?: number;
    emissions_standard?: string;
    fuel_type?: string;
    rpm_rated?: number;
    max_torque_nm?: number;
  };
  transmission_details?: {
    type?: string;
    forward_gears?: number;
    reverse_gears?: number;
    creeper?: boolean;
    reversible?: boolean;
    drive_type?: string;
    pto_drive?: string;
  };
  cabin?: {
    cabin?: boolean;
    air_conditioning?: boolean;
    heating?: boolean;
    suspension_seat?: boolean;
    radio?: boolean;
    front_loader_ready?: boolean;
    gps_ready?: boolean;
    sunroof?: boolean;
    rear_window_wiper?: boolean;
  };
  pto?: {
    rear_pto?: boolean;
    rear_pto_rpm?: string;
    rear_pto_hp?: number;
    front_pto?: boolean;
    front_pto_rpm?: string;
    front_pto_hp?: number;
  };
  hydraulics?: {
    pump_flow_lpm?: number;
    max_pressure_bar?: number;
    rear_remote_valves?: number;
    front_remote_valves?: number;
    isobus?: boolean;
    load_sensing?: boolean;
    electronic_control?: boolean;
  };
  rear_hitch?: {
    three_point_category?: string;
    lift_capacity_kg?: number;
    quick_hitch?: boolean;
  };
  front_hitch?: {
    front_hitch?: boolean;
    front_hitch_category?: string;
    front_lift_capacity_kg?: number;
  };
  tires?: {
    front_left?: string;
    front_right?: string;
    rear_left?: string;
    rear_right?: string;
    front?: string;
    rear?: string;
    spare?: boolean;
  };
  dimensions?: {
    operating_weight_kg?: number;
    max_allowed_weight_kg?: number;
    wheelbase_mm?: number;
    length_mm?: number;
    width_mm?: number;
    height_mm?: number;
    ground_clearance_mm?: number;
    turning_radius_m?: number;
  };
  electrical?: {
    voltage_v?: number;
    alternator_a?: number;
    battery_ah?: number;
    telematics?: boolean;
    telematics_system?: string;
  };
  vat_excluded?: boolean;
  max_speed_kmh?: number;
  warranty?: string;
  registration_year?: number;
  serial_number?: string;
  service_history?: string;
  first_owner?: boolean;
};

export type TractorListing = {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number | null;
  price: number | null;
  currency: string;
  condition: ListingCondition;
  location: string | null;
  country: string | null;
  description: string;
  images: string[];
  hours_used?: number;
  horsepower?: number;
  transmission?: string;
  drive_type?: string;
  details?: TractorListingDetails;
};

export type ProductCatalog = {
  source: {
    fileName: string;
    originalPath: string;
  };
  productCount: number;
  products: TractorListing[];
};

export const productCatalog: ProductCatalog = {
  "source": {
    "fileName": "product catalog.pdf",
    "originalPath": "C:\\Users\\USER\\Downloads\\EURO GLOBAL CODE\\product catalog.pdf"
  },
  "productCount": 86,
  "products": [
    {
      "id": "unknown-sh504",
      "title": "SH504 Tractor",
      "brand": "SinoHarvest",
      "model": "SH504",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "SH504 Tractor from the product catalog with Horsepower 50, engine 4100B-4a, rated power 37, rated speed 2000, gears 8+2, PTO 766, tyres 8.3-20/11-32, operating weight 2370.",
      "images": [],
      "horsepower": 50,
      "transmission": "8+2",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "4100B-4a",
          "rpm_rated": 2000
        },
        "transmission_details": {
          "type": "8+2",
          "forward_gears": 8,
          "reverse_gears": 2,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "766"
        },
        "tires": {
          "front": "8.3-20",
          "rear": "11-32"
        },
        "dimensions": {
          "length_mm": 3325,
          "width_mm": 1848,
          "height_mm": 2350,
          "operating_weight_kg": 2370,
          "ground_clearance_mm": 334
        }
      }
    },
    {
      "id": "unknown-snh504",
      "title": "SNH504 Tractor",
      "brand": "SinoHarvest",
      "model": "SNH504",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "SNH504 Tractor from the product catalog with Horsepower 50, engine 4100B-3, rated power 37, rated speed 2000, gears 10+2(8+2), PTO 766, tyres 8.3-20/11-32, operating weight 2370.",
      "images": [],
      "horsepower": 50,
      "transmission": "10+2(8+2)",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "4100B-3",
          "rpm_rated": 2000
        },
        "transmission_details": {
          "type": "10+2(8+2)",
          "forward_gears": 10,
          "reverse_gears": 2,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "766"
        },
        "tires": {
          "front": "8.3-20",
          "rear": "11-32"
        },
        "dimensions": {
          "length_mm": 3350,
          "width_mm": 1848,
          "height_mm": 2357,
          "operating_weight_kg": 2370,
          "ground_clearance_mm": 334
        }
      }
    },
    {
      "id": "unknown-snh554",
      "title": "SNH554 Tractor",
      "brand": "SinoHarvest",
      "model": "SNH554",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "SNH554 Tractor from the product catalog with Horsepower 55, engine 4100B-2, rated power 40, rated speed 2000, gears 10+2/8+2, PTO 766, tyres 8.3-20/11-32, operating weight 2370.",
      "images": [],
      "horsepower": 55,
      "transmission": "10+2/8+2",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "4100B-2",
          "rpm_rated": 2000
        },
        "transmission_details": {
          "type": "10+2/8+2",
          "forward_gears": 10,
          "reverse_gears": 2,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "766"
        },
        "tires": {
          "front": "8.3-20",
          "rear": "11-32"
        },
        "dimensions": {
          "length_mm": 3350,
          "width_mm": 1848,
          "height_mm": 2357,
          "operating_weight_kg": 2370,
          "ground_clearance_mm": 334
        }
      }
    },
    {
      "id": "unknown-snh704",
      "title": "SNH704 Tractor",
      "brand": "SinoHarvest",
      "model": "SNH704",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "SNH704 Tractor from the product catalog with Horsepower 70, engine SNH4102, rated power 51.5, rated speed 2400, gears 10+2/8+2, PTO 783, tyres 11.2-24/14.9-30, operating weight 2500.",
      "images": [],
      "horsepower": 70,
      "transmission": "10+2/8+2",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "SNH4102",
          "rpm_rated": 2400
        },
        "transmission_details": {
          "type": "10+2/8+2",
          "forward_gears": 10,
          "reverse_gears": 2,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "783"
        },
        "tires": {
          "front": "11.2-24",
          "rear": "14.9-30"
        },
        "dimensions": {
          "length_mm": 3942,
          "width_mm": 1930,
          "height_mm": 2394,
          "operating_weight_kg": 2500,
          "ground_clearance_mm": 359
        }
      }
    },
    {
      "id": "unknown-snh754",
      "title": "SNH754 Tractor",
      "brand": "SinoHarvest",
      "model": "SNH754",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "SNH754 Tractor from the product catalog with Horsepower 75, engine SNH4102Z, rated power 55.1, rated speed 2400, gears 10+2/8+2, PTO 783, tyres 11.2-24/14.9-30, operating weight 2520.",
      "images": [],
      "horsepower": 75,
      "transmission": "10+2/8+2",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "SNH4102Z",
          "rpm_rated": 2400
        },
        "transmission_details": {
          "type": "10+2/8+2",
          "forward_gears": 10,
          "reverse_gears": 2,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "783"
        },
        "tires": {
          "front": "11.2-24",
          "rear": "14.9-30"
        },
        "dimensions": {
          "length_mm": 4043,
          "width_mm": 1990,
          "height_mm": 2540,
          "operating_weight_kg": 2520,
          "ground_clearance_mm": 359
        }
      }
    },
    {
      "id": "unknown-snh804",
      "title": "SNH804 Tractor",
      "brand": "SinoHarvest",
      "model": "SNH804",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "SNH804 Tractor from the product catalog with Horsepower 80, engine SNH4102Z/LR4B3-24, rated power 58.8, rated speed 2400, gears 10+2, PTO 783, tyres 11.2-24/14.9-30, operating weight 2520.",
      "images": [],
      "horsepower": 80,
      "transmission": "10+2",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "SNH4102Z/LR4B3-24",
          "rpm_rated": 2400
        },
        "transmission_details": {
          "type": "10+2",
          "forward_gears": 10,
          "reverse_gears": 2,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "783"
        },
        "tires": {
          "front": "11.2-24",
          "rear": "14.9-30"
        },
        "dimensions": {
          "length_mm": 4245,
          "width_mm": 1990,
          "height_mm": 2540,
          "operating_weight_kg": 2520,
          "ground_clearance_mm": 360
        }
      }
    },
    {
      "id": "unknown-snh804-2",
      "title": "SNH804 Tractor",
      "brand": "SinoHarvest",
      "model": "SNH804",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "SNH804 Tractor from the product catalog with Horsepower 80, engine SNH4102Z, rated power 58.8, rated speed 2400, gears 10+2, PTO 783, tyres 8.3-24/14.9-30, operating weight 2520.",
      "images": [],
      "horsepower": 80,
      "transmission": "10+2",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "SNH4102Z",
          "rpm_rated": 2400
        },
        "transmission_details": {
          "type": "10+2",
          "forward_gears": 10,
          "reverse_gears": 2,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "783"
        },
        "tires": {
          "front": "8.3-24",
          "rear": "14.9-30"
        },
        "dimensions": {
          "length_mm": 4043,
          "width_mm": 1990,
          "height_mm": 2540,
          "operating_weight_kg": 2520,
          "ground_clearance_mm": 360
        }
      }
    },
    {
      "id": "unknown-snh904",
      "title": "SNH904 Tractor",
      "brand": "SinoHarvest",
      "model": "SNH904",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "SNH904 Tractor from the product catalog with Horsepower 90, engine WP4T90E20, rated power 67, rated speed 2300, gears 12+12, PTO 540/750, tyres 12.4-24/16.9-34, operating weight 3890.",
      "images": [],
      "horsepower": 90,
      "transmission": "12+12",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "WP4T90E20",
          "rpm_rated": 2300
        },
        "transmission_details": {
          "type": "12+12",
          "forward_gears": 12,
          "reverse_gears": 12,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/750"
        },
        "tires": {
          "front": "12.4-24",
          "rear": "16.9-34"
        },
        "dimensions": {
          "length_mm": 4516,
          "width_mm": 2110,
          "height_mm": 2765,
          "operating_weight_kg": 3890,
          "ground_clearance_mm": 416
        }
      }
    },
    {
      "id": "unknown-snh1004",
      "title": "SNH1004 Tractor",
      "brand": "SinoHarvest",
      "model": "SNH1004",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "SNH1004 Tractor from the product catalog with Horsepower 100, engine WP4T90E20, rated power 73.5, rated speed 2300, gears 12+12, PTO 540/750, tyres 12.4-24/16.9-34, operating weight 3890.",
      "images": [],
      "horsepower": 100,
      "transmission": "12+12",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "WP4T90E20",
          "rpm_rated": 2300
        },
        "transmission_details": {
          "type": "12+12",
          "forward_gears": 12,
          "reverse_gears": 12,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/750"
        },
        "tires": {
          "front": "12.4-24",
          "rear": "16.9-34"
        },
        "dimensions": {
          "length_mm": 4516,
          "width_mm": 2110,
          "height_mm": 2765,
          "operating_weight_kg": 3890,
          "ground_clearance_mm": 416
        }
      }
    },
    {
      "id": "unknown-snh1104",
      "title": "SNH1104 Tractor",
      "brand": "SinoHarvest",
      "model": "SNH1104",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "SNH1104 Tractor from the product catalog with Horsepower 110, engine WP6T110E20, rated power 80.9, rated speed 2200, gears 12+12, tyres 13.6-28/16.9-38, operating weight 4720.",
      "images": [],
      "horsepower": 110,
      "transmission": "12+12",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "WP6T110E20",
          "rpm_rated": 2200
        },
        "transmission_details": {
          "type": "12+12",
          "forward_gears": 12,
          "reverse_gears": 12,
          "drive_type": "4WD"
        },
        "tires": {
          "front": "13.6-28",
          "rear": "16.9-38"
        },
        "dimensions": {
          "length_mm": 4115,
          "width_mm": 1910,
          "height_mm": 2657,
          "operating_weight_kg": 4720,
          "ground_clearance_mm": 500
        }
      }
    },
    {
      "id": "unknown-t1104",
      "title": "T1104 Tractor",
      "brand": "Unknown",
      "model": "T1104",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "T1104 Tractor from the product catalog with Horsepower 110, engine IVECO 8045.25D.313T, rated power 80.9, rated speed 2300, gears 12+12, tyres 14.9-24/18.4-34, operating weight 3900.",
      "images": [],
      "horsepower": 110,
      "transmission": "12+12",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "IVECO 8045.25D.313T",
          "rpm_rated": 2300
        },
        "transmission_details": {
          "type": "12+12",
          "forward_gears": 12,
          "reverse_gears": 12,
          "drive_type": "4WD"
        },
        "tires": {
          "front": "14.9-24",
          "rear": "18.4-34"
        },
        "dimensions": {
          "length_mm": 4115,
          "width_mm": 1910,
          "height_mm": 2657,
          "operating_weight_kg": 3900,
          "ground_clearance_mm": 500
        }
      }
    },
    {
      "id": "unknown-snh1204",
      "title": "SNH1204 Tractor",
      "brand": "SinoHarvest",
      "model": "SNH1204",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "SNH1204 Tractor from the product catalog with Horsepower 120, engine WP6T120E20, rated power 91, rated speed 2200, gears 12+12, PTO 540/1000, tyres 14.9-28/18.4-38, operating weight 4850.",
      "images": [],
      "horsepower": 120,
      "transmission": "12+12",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "WP6T120E20",
          "rpm_rated": 2200
        },
        "transmission_details": {
          "type": "12+12",
          "forward_gears": 12,
          "reverse_gears": 12,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/1000"
        },
        "tires": {
          "front": "14.9-28",
          "rear": "18.4-38"
        },
        "dimensions": {
          "length_mm": 4830,
          "width_mm": 2300,
          "height_mm": 3100,
          "operating_weight_kg": 4850,
          "ground_clearance_mm": 407
        }
      }
    },
    {
      "id": "unknown-snh1304",
      "title": "SNH1304 Tractor",
      "brand": "SinoHarvest",
      "model": "SNH1304",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "SNH1304 Tractor from the product catalog with Horsepower 130, engine WP6T130E20, rated power 97.5, rated speed 2200, gears 12+12, PTO 540/1000, tyres 14.9-28/18.4-38, operating weight 4850.",
      "images": [],
      "horsepower": 130,
      "transmission": "12+12",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "WP6T130E20",
          "rpm_rated": 2200
        },
        "transmission_details": {
          "type": "12+12",
          "forward_gears": 12,
          "reverse_gears": 12,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/1000"
        },
        "tires": {
          "front": "14.9-28",
          "rear": "18.4-38"
        },
        "dimensions": {
          "length_mm": 4830,
          "width_mm": 2300,
          "height_mm": 3100,
          "operating_weight_kg": 4850,
          "ground_clearance_mm": 407
        }
      }
    },
    {
      "id": "unknown-snh1354",
      "title": "SNH1354 Tractor",
      "brand": "SinoHarvest",
      "model": "SNH1354",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "SNH1354 Tractor from the product catalog with Horsepower 135, engine WP6T135E20, rated power 100.5, rated speed 2200, gears 12+12, PTO 540/1000, tyres 14.9-28/18.4-38, operating weight 4850.",
      "images": [],
      "horsepower": 135,
      "transmission": "12+12",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "WP6T135E20",
          "rpm_rated": 2200
        },
        "transmission_details": {
          "type": "12+12",
          "forward_gears": 12,
          "reverse_gears": 12,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/1000"
        },
        "tires": {
          "front": "14.9-28",
          "rear": "18.4-38"
        },
        "dimensions": {
          "length_mm": 4830,
          "width_mm": 2300,
          "height_mm": 3100,
          "operating_weight_kg": 4850,
          "ground_clearance_mm": 407
        }
      }
    },
    {
      "id": "unknown-tm140",
      "title": "TM140 Tractor",
      "brand": "SinoHarvest",
      "model": "TM140",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "TM140 Tractor from the product catalog with Horsepower 140, rated speed 2200, gears 20×16, PTO 540/1000, tyres 14.9-28/18.4-38, operating weight 5400.",
      "images": [],
      "horsepower": 140,
      "transmission": "20×16",
      "details": {
        "engine": {
          "rpm_rated": 2200,
          "cylinders": 6
        },
        "transmission_details": {
          "type": "20×16"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/1000"
        },
        "tires": {
          "front": "14.9-28",
          "rear": "18.4-38"
        },
        "dimensions": {
          "operating_weight_kg": 5400,
          "wheelbase_mm": 2723,
          "length_mm": 5789
        },
        "max_speed_kmh": 40
      }
    },
    {
      "id": "yto-me404",
      "title": "YTO ME404 Tractor",
      "brand": "YTO",
      "model": "ME404",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "YTO ME404 Tractor from the product catalog with Horsepower 40, engine C490BT-7/ZN490BT, rated power 22.46, PTO 2300/2400, tyres 7.5-16/11.2-28.",
      "images": [],
      "horsepower": 40,
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "C490BT-7/ZN490BT"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "2300/2400"
        },
        "tires": {
          "front": "7.5-16",
          "rear": "11.2-28"
        },
        "dimensions": {
          "length_mm": 3662,
          "width_mm": 1390,
          "height_mm": 1560,
          "wheelbase_mm": 1970,
          "ground_clearance_mm": 290
        },
        "transmission_details": {
          "drive_type": "4WD"
        }
      }
    },
    {
      "id": "yto-mf454",
      "title": "YTO MF454 Tractor",
      "brand": "YTO",
      "model": "MF454",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "YTO MF454 Tractor from the product catalog with Horsepower 45, engine Yangdong 4100 （Optional:Xinchai495）, rated power 33.08, gears 8+4, PTO 540/720,540/1000, tyres 8.3-20/12.4-28.",
      "images": [],
      "horsepower": 45,
      "transmission": "8+4",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "Yangdong 4100 （Optional:Xinchai495）"
        },
        "transmission_details": {
          "type": "8+4",
          "forward_gears": 8,
          "reverse_gears": 4,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/720,540/1000"
        },
        "tires": {
          "front": "8.3-20",
          "rear": "12.4-28"
        },
        "dimensions": {
          "length_mm": 3740,
          "width_mm": 1645,
          "height_mm": 2420,
          "wheelbase_mm": 1970,
          "ground_clearance_mm": 350
        }
      }
    },
    {
      "id": "yto-me504",
      "title": "YTO ME504 Tractor",
      "brand": "YTO",
      "model": "ME504",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "YTO ME504 Tractor from the product catalog with Horsepower 50, engine Xinchai:A498BT, rated power 36.8, gears 8+4, tyres 8.3-20,8.3-20(paddy wheel)/12.4-28,11-28(paddy wheel).",
      "images": [],
      "horsepower": 50,
      "transmission": "8+4",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "Xinchai:A498BT"
        },
        "transmission_details": {
          "type": "8+4",
          "forward_gears": 8,
          "reverse_gears": 4,
          "drive_type": "4WD"
        },
        "tires": {
          "front": "8.3-20,8.3-20(paddy wheel)",
          "rear": "12.4-28,11-28(paddy wheel)"
        },
        "dimensions": {
          "length_mm": 3675,
          "width_mm": 1515,
          "height_mm": 2735,
          "wheelbase_mm": 1830,
          "ground_clearance_mm": 280,
          "turning_radius_m": 3.4
        }
      }
    },
    {
      "id": "yto-mf554",
      "title": "YTO MF554 Tractor",
      "brand": "YTO",
      "model": "MF554",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "YTO MF554 Tractor from the product catalog with Horsepower 55, engine Yangdong495 （Optional:Xinchai498）, rated power 40.44, gears 8+8, PTO 540/720,540/1000, tyres 8.3-20/12.4-28.",
      "images": [],
      "horsepower": 55,
      "transmission": "8+8",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "Yangdong495 （Optional:Xinchai498）"
        },
        "transmission_details": {
          "type": "8+8",
          "forward_gears": 8,
          "reverse_gears": 8,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/720,540/1000"
        },
        "tires": {
          "front": "8.3-20",
          "rear": "12.4-28"
        },
        "dimensions": {
          "length_mm": 3780,
          "width_mm": 1685,
          "height_mm": 2134,
          "ground_clearance_mm": 350,
          "turning_radius_m": 4.5
        }
      }
    },
    {
      "id": "yto-mf704",
      "title": "YTO MF704 Tractor",
      "brand": "YTO",
      "model": "MF704",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "YTO MF704 Tractor from the product catalog with Horsepower 70, engine Dongchai4108（Optional Yangdong4100、 Xinchai498）, rated power 51.5, gears 12+12, tyres 8.3-24,9.5-20,9.5-24/11-32,14.9-30.",
      "images": [],
      "horsepower": 70,
      "transmission": "12+12",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "Dongchai4108（Optional Yangdong4100、 Xinchai498）"
        },
        "transmission_details": {
          "type": "12+12",
          "forward_gears": 12,
          "reverse_gears": 12,
          "drive_type": "4WD"
        },
        "tires": {
          "front": "8.3-24,9.5-20,9.5-24",
          "rear": "11-32,14.9-30"
        },
        "dimensions": {
          "length_mm": 3910,
          "width_mm": 1780,
          "height_mm": 2565,
          "wheelbase_mm": 2110,
          "ground_clearance_mm": 400,
          "turning_radius_m": 4.5
        }
      }
    },
    {
      "id": "yto-mg704",
      "title": "YTO MG704 Tractor",
      "brand": "YTO",
      "model": "MG704",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "YTO MG704 Tractor from the product catalog with Horsepower 70, engine YTOYTR4108, rated power 51.5, rated speed 2200, gears 10+2, PTO 720/540/1000, tyres 9.5-24/14.9-30(paddy wheel11-32), operating weight 3100.",
      "images": [],
      "horsepower": 70,
      "transmission": "10+2",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "YTOYTR4108",
          "rpm_rated": 2200
        },
        "transmission_details": {
          "type": "10+2",
          "forward_gears": 10,
          "reverse_gears": 2,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "720/540/1000"
        },
        "tires": {
          "front": "9.5-24",
          "rear": "14.9-30(paddy wheel11-32)"
        },
        "dimensions": {
          "length_mm": 4150,
          "width_mm": 2040,
          "height_mm": 2790,
          "operating_weight_kg": 3100,
          "ground_clearance_mm": 390
        }
      }
    },
    {
      "id": "yto-lx804",
      "title": "YTO LX804 Tractor",
      "brand": "YTO",
      "model": "LX804",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "YTO LX804 Tractor from the product catalog with Horsepower 80, engine LR4M5R22/0588、 LR4M5U22/0588E, rated power 58.8, rated speed 2200, gears 12+4, tyres 11.2-28,12.4-26(paddy wheel)/13.6-38,16.9-34(pa ddywheel), operating weight 3675.",
      "images": [],
      "horsepower": 80,
      "transmission": "12+4",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "LR4M5R22/0588、 LR4M5U22/0588E",
          "rpm_rated": 2200
        },
        "transmission_details": {
          "type": "12+4",
          "forward_gears": 12,
          "reverse_gears": 4,
          "drive_type": "4WD"
        },
        "tires": {
          "front": "11.2-28,12.4-26(paddy wheel)",
          "rear": "13.6-38,16.9-34(pa ddywheel)"
        },
        "dimensions": {
          "length_mm": 4350,
          "width_mm": 2170,
          "height_mm": 2740,
          "operating_weight_kg": 3675,
          "ground_clearance_mm": 430,
          "turning_radius_m": 5.6
        }
      }
    },
    {
      "id": "yto-lx904",
      "title": "YTO LX904 Tractor",
      "brand": "YTO",
      "model": "LX904",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "YTO LX904 Tractor from the product catalog with Horsepower 90, engine LR4V5U22/0662E, rated power 66.2, rated speed 2200, gears 12+4, tyres 13.6-24/16.9-34, operating weight 3870.",
      "images": [],
      "horsepower": 90,
      "transmission": "12+4",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "LR4V5U22/0662E",
          "rpm_rated": 2200
        },
        "transmission_details": {
          "type": "12+4",
          "forward_gears": 12,
          "reverse_gears": 4,
          "drive_type": "4WD"
        },
        "tires": {
          "front": "13.6-24",
          "rear": "16.9-34"
        },
        "dimensions": {
          "length_mm": 4315,
          "operating_weight_kg": 3870,
          "ground_clearance_mm": 430,
          "turning_radius_m": 5.6
        }
      }
    },
    {
      "id": "yto-lx954",
      "title": "YTO LX954 Tractor",
      "brand": "YTO",
      "model": "LX954",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "YTO LX954 Tractor from the product catalog with Horsepower 95, engine LR4A3LU22/0700E, rated power 70, rated speed 2200, gears 12+4, tyres 13.6-24/16.9-34, operating weight 3870.",
      "images": [],
      "horsepower": 95,
      "transmission": "12+4",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "LR4A3LU22/0700E",
          "rpm_rated": 2200
        },
        "transmission_details": {
          "type": "12+4",
          "forward_gears": 12,
          "reverse_gears": 4,
          "drive_type": "4WD"
        },
        "tires": {
          "front": "13.6-24",
          "rear": "16.9-34"
        },
        "dimensions": {
          "length_mm": 4315,
          "operating_weight_kg": 3870,
          "ground_clearance_mm": 430,
          "turning_radius_m": 5.6
        }
      }
    },
    {
      "id": "yto-lx1204",
      "title": "YTO LX1204 Tractor",
      "brand": "YTO",
      "model": "LX1204",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "YTO LX1204 Tractor from the product catalog with Horsepower 120, engine LR6B5~23, rated power 88.2, rated speed 2300, gears 12+4, tyres 14.9-26/18.4-38, operating weight 4850.",
      "images": [],
      "horsepower": 120,
      "transmission": "12+4",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "LR6B5~23",
          "rpm_rated": 2300
        },
        "transmission_details": {
          "type": "12+4",
          "forward_gears": 12,
          "reverse_gears": 4,
          "drive_type": "4WD"
        },
        "tires": {
          "front": "14.9-26",
          "rear": "18.4-38"
        },
        "dimensions": {
          "length_mm": 5040,
          "operating_weight_kg": 4850,
          "ground_clearance_mm": 430,
          "turning_radius_m": 7
        }
      }
    },
    {
      "id": "yto-ly1204d",
      "title": "YTO LY1204D Tractor",
      "brand": "YTO",
      "model": "LY1204D",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "YTO LY1204D Tractor from the product catalog with Horsepower 120, engine LR4M3LR22/0882E, rated power 88.2, rated speed 2200, gears 12+12, PTO 540/720720/1000650/720720/800, tyres 13.6-24,12.4-26(paddy wheel)/16.9-34,13.6-38, operating weight 4040.",
      "images": [],
      "horsepower": 120,
      "transmission": "12+12",
      "details": {
        "engine": {
          "model": "LR4M3LR22/0882E",
          "rpm_rated": 2200
        },
        "transmission_details": {
          "type": "12+12",
          "forward_gears": 12,
          "reverse_gears": 12
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/720720/1000650/720720/800"
        },
        "tires": {
          "front": "13.6-24,12.4-26(paddy wheel)",
          "rear": "16.9-34,13.6-38"
        },
        "dimensions": {
          "length_mm": 4350,
          "width_mm": 2150,
          "height_mm": 3030,
          "operating_weight_kg": 4040,
          "ground_clearance_mm": 420
        }
      }
    },
    {
      "id": "yto-lx1304",
      "title": "YTO LX1304 Tractor",
      "brand": "YTO",
      "model": "LX1304",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "YTO LX1304 Tractor from the product catalog with Horsepower 130, engine LR6A3LU22/0920E, rated power 95.6, rated speed 2200, gears 12+4, tyres 14.9-26,12.4-26(paddy wheel)/18.4-38,18.4-34, operating weight 5080.",
      "images": [],
      "horsepower": 130,
      "transmission": "12+4",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "LR6A3LU22/0920E",
          "rpm_rated": 2200
        },
        "transmission_details": {
          "type": "12+4",
          "forward_gears": 12,
          "reverse_gears": 4,
          "drive_type": "4WD"
        },
        "tires": {
          "front": "14.9-26,12.4-26(paddy wheel)",
          "rear": "18.4-38,18.4-34"
        },
        "dimensions": {
          "length_mm": 5010,
          "width_mm": 2360,
          "height_mm": 3030,
          "operating_weight_kg": 5080,
          "ground_clearance_mm": 470,
          "turning_radius_m": 6.5
        }
      }
    },
    {
      "id": "yto-lx1504",
      "title": "YTO LX1504 Tractor",
      "brand": "YTO",
      "model": "LX1504",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "YTO LX1504 Tractor from the product catalog with Horsepower 150, engine LR6A3LU22/1103E, rated power 110.3, rated speed 2200, gears 12+4, PTO 540/1000540/720540720 1000, tyres 14.9-26/18.4-38, operating weight 5280.",
      "images": [],
      "horsepower": 150,
      "transmission": "12+4",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "LR6A3LU22/1103E",
          "rpm_rated": 2200
        },
        "transmission_details": {
          "type": "12+4",
          "forward_gears": 12,
          "reverse_gears": 4,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/1000540/720540720 1000"
        },
        "tires": {
          "front": "14.9-26",
          "rear": "18.4-38"
        },
        "dimensions": {
          "length_mm": 5050,
          "operating_weight_kg": 5280,
          "ground_clearance_mm": 470
        }
      }
    },
    {
      "id": "yto-lx1604",
      "title": "YTO LX1604 Tractor",
      "brand": "YTO",
      "model": "LX1604",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "YTO LX1604 Tractor from the product catalog with Horsepower 160, engine LR6A3LU22/1177E, rated power 117.7, rated speed 2200, gears 12+4, PTO 540/1000540/720540720 1000, tyres 14.9-26/18.4-38, operating weight 5280.",
      "images": [],
      "horsepower": 160,
      "transmission": "12+4",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "LR6A3LU22/1177E",
          "rpm_rated": 2200
        },
        "transmission_details": {
          "type": "12+4",
          "forward_gears": 12,
          "reverse_gears": 4,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/1000540/720540720 1000"
        },
        "tires": {
          "front": "14.9-26",
          "rear": "18.4-38"
        },
        "dimensions": {
          "length_mm": 5050,
          "operating_weight_kg": 5280,
          "ground_clearance_mm": 470
        }
      }
    },
    {
      "id": "yto-lx1804",
      "title": "YTO LX1804 Tractor",
      "brand": "YTO",
      "model": "LX1804",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "YTO LX1804 Tractor from the product catalog with Horsepower 180, engine LR6M3LR22/1324, rated power 132.4, rated speed 2200, gears 12+4, PTO 540/1000540/720540720 1000, tyres 14.9-26/18.4-38, operating weight 5400.",
      "images": [],
      "horsepower": 180,
      "transmission": "12+4",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "LR6M3LR22/1324",
          "rpm_rated": 2200
        },
        "transmission_details": {
          "type": "12+4",
          "forward_gears": 12,
          "reverse_gears": 4,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/1000540/720540720 1000"
        },
        "tires": {
          "front": "14.9-26",
          "rear": "18.4-38"
        },
        "dimensions": {
          "length_mm": 5100,
          "width_mm": 2380,
          "height_mm": 3120,
          "operating_weight_kg": 5400,
          "ground_clearance_mm": 470
        }
      }
    },
    {
      "id": "yto-lx2004",
      "title": "YTO LX2004 Tractor",
      "brand": "YTO",
      "model": "LX2004",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "YTO LX2004 Tractor from the product catalog with Horsepower 200, engine LR6M220-40, rated power 147.5, rated speed 2200, gears 24+8, PTO 650/720540/720540720 1000, tyres 14.9-26/18.4-38, operating weight 5400.",
      "images": [],
      "horsepower": 200,
      "transmission": "24+8",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "LR6M220-40",
          "rpm_rated": 2200
        },
        "transmission_details": {
          "type": "24+8",
          "forward_gears": 24,
          "reverse_gears": 8,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "650/720540/720540720 1000"
        },
        "tires": {
          "front": "14.9-26",
          "rear": "18.4-38"
        },
        "dimensions": {
          "length_mm": 5100,
          "width_mm": 2380,
          "height_mm": 3170,
          "operating_weight_kg": 5400,
          "ground_clearance_mm": 470
        }
      }
    },
    {
      "id": "john-deere-484",
      "title": "John Deere 484 Tractor",
      "brand": "John Deere",
      "model": "484",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "John Deere 484 Tractor from the product catalog with Horsepower 48, engine A498BT-11, rated power 35.3, rated speed 2400, gears 8+2, PTO 540/720,540/1000, tyres 7.5-16/11.2-28, operating weight 1900.",
      "images": [],
      "horsepower": 48,
      "transmission": "8+2",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "A498BT-11",
          "rpm_rated": 2400
        },
        "transmission_details": {
          "type": "8+2",
          "forward_gears": 8,
          "reverse_gears": 2,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/720,540/1000"
        },
        "tires": {
          "front": "7.5-16",
          "rear": "11.2-28"
        },
        "dimensions": {
          "length_mm": 3150,
          "width_mm": 1590,
          "height_mm": 2050,
          "operating_weight_kg": 1900,
          "ground_clearance_mm": 295
        }
      }
    },
    {
      "id": "john-deere-3b-554",
      "title": "John Deere 3B-554 Tractor",
      "brand": "John Deere",
      "model": "3B-554",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "John Deere 3B-554 Tractor from the product catalog with Horsepower 55, engine 4D32ZT31/603, rated power 40.4, rated speed 2300, gears 12+12, tyres 8.3-20/12.4-28, operating weight 2100/2350.",
      "images": [],
      "horsepower": 55,
      "transmission": "12+12",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "4D32ZT31/603",
          "rpm_rated": 2300
        },
        "transmission_details": {
          "type": "12+12",
          "forward_gears": 12,
          "reverse_gears": 12,
          "drive_type": "4WD"
        },
        "tires": {
          "front": "8.3-20",
          "rear": "12.4-28"
        },
        "dimensions": {
          "length_mm": 3680,
          "width_mm": 1700,
          "height_mm": 2440,
          "operating_weight_kg": 2100,
          "wheelbase_mm": 1960,
          "turning_radius_m": 4.6
        }
      }
    },
    {
      "id": "john-deere-5b-704",
      "title": "John Deere 5B-704 Tractor",
      "brand": "John Deere",
      "model": "5B-704",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "John Deere 5B-704 Tractor from the product catalog with Horsepower 70, rated power 51.5, rated speed 2300, gears 4×（2+1）, PTO 540/720,540/1000, operating weight 2790.",
      "images": [],
      "horsepower": 70,
      "transmission": "4×（2+1）",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "rpm_rated": 2300
        },
        "transmission_details": {
          "type": "4×（2+1）",
          "forward_gears": 2,
          "reverse_gears": 1,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/720,540/1000"
        },
        "dimensions": {
          "length_mm": 3920,
          "width_mm": 1990,
          "height_mm": 2140,
          "operating_weight_kg": 2790,
          "wheelbase_mm": 2140
        }
      }
    },
    {
      "id": "john-deere-5-754",
      "title": "John Deere 5-754 Tractor",
      "brand": "John Deere",
      "model": "5-754",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "John Deere 5-754 Tractor from the product catalog with Horsepower 75, engine 4RNT4/LR4A5-23, rated power 65, rated speed 2300, gears 12+4, tyres 11.2-24/16.9-30, operating weight 3310.",
      "images": [],
      "horsepower": 75,
      "transmission": "12+4",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "4RNT4/LR4A5-23",
          "rpm_rated": 2300
        },
        "transmission_details": {
          "type": "12+4",
          "forward_gears": 12,
          "reverse_gears": 4,
          "drive_type": "4WD"
        },
        "tires": {
          "front": "11.2-24",
          "rear": "16.9-30"
        },
        "dimensions": {
          "length_mm": 4217,
          "width_mm": 1890,
          "height_mm": 2760,
          "operating_weight_kg": 3310,
          "wheelbase_mm": 2310,
          "turning_radius_m": 4.3
        }
      }
    },
    {
      "id": "john-deere-5-904",
      "title": "John Deere 5-904 Tractor",
      "brand": "John Deere",
      "model": "5-904",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "John Deere 5-904 Tractor from the product catalog with Horsepower 90, engine 4RMIZT13/LR4A3Z-23, rated power 77, rated speed 2300, gears 12+4, tyres 13.6-24/16.9-34, operating weight 3350.",
      "images": [],
      "horsepower": 90,
      "transmission": "12+4",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "4RMIZT13/LR4A3Z-23",
          "rpm_rated": 2300
        },
        "transmission_details": {
          "type": "12+4",
          "forward_gears": 12,
          "reverse_gears": 4,
          "drive_type": "4WD"
        },
        "tires": {
          "front": "13.6-24",
          "rear": "16.9-34"
        },
        "dimensions": {
          "length_mm": 4217,
          "width_mm": 1890,
          "height_mm": 2782,
          "operating_weight_kg": 3350,
          "wheelbase_mm": 2310,
          "turning_radius_m": 4.3
        }
      }
    },
    {
      "id": "john-deere-5e-804",
      "title": "John Deere 5E-804 Tractor",
      "brand": "John Deere",
      "model": "5E-804",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "John Deere 5E-804 Tractor from the product catalog with Horsepower 80, engine Johndeere4045, rated power 58.8, rated speed 2300, gears 12+4, tyres 13.6-24/16.9-34, operating weight 3350.",
      "images": [],
      "horsepower": 80,
      "transmission": "12+4",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "Johndeere4045",
          "rpm_rated": 2300
        },
        "transmission_details": {
          "type": "12+4",
          "forward_gears": 12,
          "reverse_gears": 4,
          "drive_type": "4WD"
        },
        "tires": {
          "front": "13.6-24",
          "rear": "16.9-34"
        },
        "dimensions": {
          "length_mm": 4217,
          "width_mm": 1890,
          "height_mm": 2782,
          "operating_weight_kg": 3350,
          "wheelbase_mm": 2310,
          "turning_radius_m": 4.3
        }
      }
    },
    {
      "id": "john-deere-5e-854",
      "title": "John Deere 5E-854 Tractor",
      "brand": "John Deere",
      "model": "5E-854",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "John Deere 5E-854 Tractor from the product catalog with Horsepower 85, engine Johndeere4045, rated power 62.5, rated speed 2300, gears 12+4, tyres 13.6-24/16.9-34, operating weight 3488.",
      "images": [],
      "horsepower": 85,
      "transmission": "12+4",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "Johndeere4045",
          "rpm_rated": 2300
        },
        "transmission_details": {
          "type": "12+4",
          "forward_gears": 12,
          "reverse_gears": 4,
          "drive_type": "4WD"
        },
        "tires": {
          "front": "13.6-24",
          "rear": "16.9-34"
        },
        "dimensions": {
          "length_mm": 4372,
          "operating_weight_kg": 3488,
          "wheelbase_mm": 2230,
          "turning_radius_m": 4.3
        }
      }
    },
    {
      "id": "john-deere-5e-954",
      "title": "John Deere 5E-954 Tractor",
      "brand": "John Deere",
      "model": "5E-954",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "John Deere 5E-954 Tractor from the product catalog with Horsepower 95, engine Johndeere4045, rated power 69.9, rated speed 2300, gears 12+4, tyres 13.6-24/16.9-34, operating weight 3488.",
      "images": [],
      "horsepower": 95,
      "transmission": "12+4",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "Johndeere4045",
          "rpm_rated": 2300
        },
        "transmission_details": {
          "type": "12+4",
          "forward_gears": 12,
          "reverse_gears": 4,
          "drive_type": "4WD"
        },
        "tires": {
          "front": "13.6-24",
          "rear": "16.9-34"
        },
        "dimensions": {
          "length_mm": 4372,
          "operating_weight_kg": 3488,
          "wheelbase_mm": 2230,
          "turning_radius_m": 4.3
        }
      }
    },
    {
      "id": "john-deere-5e-1004",
      "title": "John Deere 5E-1004 Tractor",
      "brand": "John Deere",
      "model": "5E-1004",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "John Deere 5E-1004 Tractor from the product catalog with Horsepower 100, engine Johndeere4045, rated power 73.6, rated speed 2300, gears 12+4, tyres 13.6-24/16.9-34, operating weight 3488.",
      "images": [],
      "horsepower": 100,
      "transmission": "12+4",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "Johndeere4045",
          "rpm_rated": 2300
        },
        "transmission_details": {
          "type": "12+4",
          "forward_gears": 12,
          "reverse_gears": 4,
          "drive_type": "4WD"
        },
        "tires": {
          "front": "13.6-24",
          "rear": "16.9-34"
        },
        "dimensions": {
          "length_mm": 4372,
          "operating_weight_kg": 3488,
          "wheelbase_mm": 2230,
          "turning_radius_m": 4.3
        }
      }
    },
    {
      "id": "john-deere-5e-1004-2",
      "title": "John Deere 5E-1004 Tractor",
      "brand": "John Deere",
      "model": "5E-1004",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "John Deere 5E-1004 Tractor from the product catalog with Horsepower 100, engine John deere4045, rated power 73.5, rated speed 2300, gears 12+4.",
      "images": [],
      "horsepower": 100,
      "transmission": "12+4",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "John deere4045",
          "rpm_rated": 2300
        },
        "transmission_details": {
          "type": "12+4",
          "forward_gears": 12,
          "reverse_gears": 4,
          "drive_type": "4WD"
        },
        "dimensions": {
          "length_mm": 4372,
          "width_mm": 1830,
          "height_mm": 2560,
          "wheelbase_mm": 2230
        }
      }
    },
    {
      "id": "john-deere-5e-1104",
      "title": "John Deere 5E-1104 Tractor",
      "brand": "John Deere",
      "model": "5E-1104",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "John Deere 5E-1104 Tractor from the product catalog with Horsepower 110, engine Johndeere4045, rated power 80.9, rated speed 2300, gears 12+4, PTO 540/1000, tyres 13.6-24/18.4-34.",
      "images": [],
      "horsepower": 110,
      "transmission": "12+4",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "Johndeere4045",
          "rpm_rated": 2300
        },
        "transmission_details": {
          "type": "12+4",
          "forward_gears": 12,
          "reverse_gears": 4,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/1000"
        },
        "tires": {
          "front": "13.6-24",
          "rear": "18.4-34"
        },
        "dimensions": {
          "length_mm": 4790,
          "width_mm": 1980,
          "height_mm": 2760,
          "wheelbase_mm": 2560
        }
      }
    },
    {
      "id": "john-deere-5e-1204",
      "title": "John Deere 5E-1204 Tractor",
      "brand": "John Deere",
      "model": "5E-1204",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "John Deere 5E-1204 Tractor from the product catalog with Horsepower 120, rated power 88.2, rated speed 2100, PTO 540/1000, operating weight 3198.",
      "images": [],
      "horsepower": 120,
      "drive_type": "4WD",
      "details": {
        "engine": {
          "rpm_rated": 2100
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/1000"
        },
        "dimensions": {
          "length_mm": 4730,
          "width_mm": 2185,
          "height_mm": 2760,
          "operating_weight_kg": 3198,
          "wheelbase_mm": 2636,
          "ground_clearance_mm": 470,
          "turning_radius_m": 5.45
        },
        "transmission_details": {
          "drive_type": "4WD"
        }
      }
    },
    {
      "id": "john-deere-6b1204",
      "title": "John Deere 6B1204 Tractor",
      "brand": "John Deere",
      "model": "6B1204",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "John Deere 6B1204 Tractor from the product catalog with Horsepower 120, rated power 88.2, rated speed 2200, tyres 14.9-24/18.4-38, operating weight 4640.",
      "images": [],
      "horsepower": 120,
      "drive_type": "4WD",
      "details": {
        "engine": {
          "rpm_rated": 2200
        },
        "tires": {
          "front": "14.9-24",
          "rear": "18.4-38"
        },
        "dimensions": {
          "length_mm": 4800,
          "width_mm": 2180,
          "height_mm": 2760,
          "operating_weight_kg": 4640,
          "wheelbase_mm": 2560,
          "turning_radius_m": 5.5
        },
        "transmission_details": {
          "drive_type": "4WD"
        }
      }
    },
    {
      "id": "john-deere-6b1204-2",
      "title": "John Deere 6B1204 Tractor",
      "brand": "John Deere",
      "model": "6B1204",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "John Deere 6B1204 Tractor from the product catalog with Horsepower 120, rated power 102, rated speed 2100, tyres 14.9-24/18.4-38, operating weight 4570.",
      "images": [],
      "horsepower": 120,
      "drive_type": "4WD",
      "details": {
        "engine": {
          "rpm_rated": 2100
        },
        "tires": {
          "front": "14.9-24",
          "rear": "18.4-38"
        },
        "dimensions": {
          "length_mm": 4730,
          "width_mm": 2185,
          "height_mm": 2760,
          "operating_weight_kg": 4570,
          "wheelbase_mm": 2636,
          "turning_radius_m": 5.45
        },
        "transmission_details": {
          "drive_type": "4WD"
        }
      }
    },
    {
      "id": "john-deere-6e1404",
      "title": "John Deere 6E1404 Tractor",
      "brand": "John Deere",
      "model": "6E1404",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "John Deere 6E1404 Tractor from the product catalog with Horsepower 140, engine Johndeere4045, rated power 103, rated speed 2200, gears 12+4, PTO 540/1000, tyres 14.9-24/18.4-38.",
      "images": [],
      "horsepower": 140,
      "transmission": "12+4",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "Johndeere4045",
          "rpm_rated": 2200
        },
        "transmission_details": {
          "type": "12+4",
          "forward_gears": 12,
          "reverse_gears": 4,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/1000"
        },
        "tires": {
          "front": "14.9-24",
          "rear": "18.4-38"
        },
        "dimensions": {
          "length_mm": 4860,
          "width_mm": 2480,
          "height_mm": 2800,
          "wheelbase_mm": 2560
        }
      }
    },
    {
      "id": "john-deere-6b1404",
      "title": "John Deere 6B1404 Tractor",
      "brand": "John Deere",
      "model": "6B1404",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "John Deere 6B1404 Tractor from the product catalog with Horsepower 140, rated power 103, rated speed 2200, gears 12+4, PTO 540/1000,760/1000, tyres 14.9-24/18.4-38, operating weight 4860.",
      "images": [],
      "horsepower": 140,
      "transmission": "12+4",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "rpm_rated": 2200
        },
        "transmission_details": {
          "type": "12+4",
          "forward_gears": 12,
          "reverse_gears": 4,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/1000,760/1000"
        },
        "tires": {
          "front": "14.9-24",
          "rear": "18.4-38"
        },
        "dimensions": {
          "length_mm": 4900,
          "width_mm": 2180,
          "height_mm": 2760,
          "operating_weight_kg": 4860,
          "wheelbase_mm": 2677,
          "turning_radius_m": 6
        }
      }
    },
    {
      "id": "unknown-m554-b",
      "title": "M554-B Tractor",
      "brand": "YTO",
      "model": "M554-B",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "M554-B Tractor from the product catalog with Horsepower 55, rated power 40.4, gears 12+12, PTO 540/760, tyres 8.3-20/12.4-28, operating weight 2540.",
      "images": [],
      "horsepower": 55,
      "transmission": "12+12",
      "drive_type": "4WD",
      "details": {
        "transmission_details": {
          "type": "12+12",
          "forward_gears": 12,
          "reverse_gears": 12,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/760"
        },
        "tires": {
          "front": "8.3-20",
          "rear": "12.4-28"
        },
        "dimensions": {
          "length_mm": 4030,
          "width_mm": 1650,
          "height_mm": 2520,
          "operating_weight_kg": 2540,
          "wheelbase_mm": 2040,
          "turning_radius_m": 4.3
        }
      }
    },
    {
      "id": "unknown-m554-ba",
      "title": "M554-BA Tractor",
      "brand": "YTO",
      "model": "M554-BA",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "M554-BA Tractor from the product catalog with Horsepower 55, rated power 40.4, gears 4*3*(1+1),4*(2+1)*2, PTO 540/760, operating weight 2360.",
      "images": [],
      "horsepower": 55,
      "transmission": "4*3*(1+1),4*(2+1)*2",
      "drive_type": "4WD",
      "details": {
        "transmission_details": {
          "type": "4*3*(1+1),4*(2+1)*2",
          "forward_gears": 1,
          "reverse_gears": 1,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/760"
        },
        "dimensions": {
          "length_mm": 4030,
          "width_mm": 1650,
          "height_mm": 2150,
          "operating_weight_kg": 2360,
          "wheelbase_mm": 2040,
          "turning_radius_m": 4.3
        }
      }
    },
    {
      "id": "unknown-m604l-e",
      "title": "M604L-E Tractor",
      "brand": "YTO",
      "model": "M604L-E",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "M604L-E Tractor from the product catalog with Horsepower 60, rated power 44.2, gears 8+2, PTO 540/720, operating weight 1485.",
      "images": [],
      "horsepower": 60,
      "transmission": "8+2",
      "details": {
        "transmission_details": {
          "type": "8+2",
          "forward_gears": 8,
          "reverse_gears": 2
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/720"
        },
        "dimensions": {
          "length_mm": 3136,
          "width_mm": 1350,
          "height_mm": 1420,
          "operating_weight_kg": 1485,
          "wheelbase_mm": 1756,
          "turning_radius_m": 3.9
        }
      }
    },
    {
      "id": "unknown-m704-ba",
      "title": "M704-BA Tractor",
      "brand": "YTO",
      "model": "M704-BA",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "M704-BA Tractor from the product catalog with Horsepower 70, engine Quanchai4108, rated power 51.5, gears 12+12, PTO 540/760, tyres 8.3-24/11-32, operating weight 2276.",
      "images": [],
      "horsepower": 70,
      "transmission": "12+12",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "Quanchai4108"
        },
        "transmission_details": {
          "type": "12+12",
          "forward_gears": 12,
          "reverse_gears": 12,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/760"
        },
        "tires": {
          "front": "8.3-24",
          "rear": "11-32"
        },
        "dimensions": {
          "length_mm": 3900,
          "width_mm": 1795,
          "height_mm": 2160,
          "operating_weight_kg": 2276,
          "wheelbase_mm": 2072,
          "ground_clearance_mm": 410
        }
      }
    },
    {
      "id": "unknown-m804-b",
      "title": "M804-B Tractor",
      "brand": "YTO",
      "model": "M804-B",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "M804-B Tractor from the product catalog with Horsepower 80, rated power 58.8, gears 12+12, PTO 540/760, operating weight 2830.",
      "images": [],
      "horsepower": 80,
      "transmission": "12+12",
      "drive_type": "4WD",
      "details": {
        "transmission_details": {
          "type": "12+12",
          "forward_gears": 12,
          "reverse_gears": 12,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/760"
        },
        "dimensions": {
          "length_mm": 4130,
          "width_mm": 1795,
          "height_mm": 2160,
          "operating_weight_kg": 2830,
          "wheelbase_mm": 2072,
          "ground_clearance_mm": 440
        }
      }
    },
    {
      "id": "unknown-m904",
      "title": "M904 Tractor",
      "brand": "YTO",
      "model": "M904",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "M904 Tractor from the product catalog with Horsepower 90, rated power 66.2, gears 12+12, PTO 540/760.",
      "images": [],
      "horsepower": 90,
      "transmission": "12+12",
      "drive_type": "4WD",
      "details": {
        "transmission_details": {
          "type": "12+12",
          "forward_gears": 12,
          "reverse_gears": 12,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/760"
        },
        "dimensions": {
          "length_mm": 4180,
          "width_mm": 1795,
          "height_mm": 2210,
          "wheelbase_mm": 2122,
          "ground_clearance_mm": 460,
          "turning_radius_m": 4.6
        }
      }
    },
    {
      "id": "unknown-m1004-aa",
      "title": "M1004-AA Tractor",
      "brand": "YTO",
      "model": "M1004-AA",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "M1004-AA Tractor from the product catalog with Horsepower 110, rated power 80.8, gears 16+8, PTO 760/1000, operating weight 3780.",
      "images": [],
      "horsepower": 110,
      "transmission": "16+8",
      "drive_type": "4WD",
      "details": {
        "transmission_details": {
          "type": "16+8",
          "forward_gears": 16,
          "reverse_gears": 8,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "760/1000"
        },
        "dimensions": {
          "operating_weight_kg": 3780,
          "wheelbase_mm": 2380
        }
      }
    },
    {
      "id": "unknown-m1004-a",
      "title": "M1004-A Tractor",
      "brand": "YTO",
      "model": "M1004-A",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "M1004-A Tractor from the product catalog with Horsepower 100, engine YC4A11, rated power 73.5, gears 16+8, PTO 540/760, operating weight 3855.",
      "images": [],
      "horsepower": 100,
      "transmission": "16+8",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "YC4A11"
        },
        "transmission_details": {
          "type": "16+8",
          "forward_gears": 16,
          "reverse_gears": 8,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/760",
          "rear_pto_hp": 62.5
        },
        "dimensions": {
          "length_mm": 4200,
          "width_mm": 1910,
          "height_mm": 2760,
          "operating_weight_kg": 3855,
          "wheelbase_mm": 2273,
          "turning_radius_m": 4
        },
        "rear_hitch": {
          "lift_capacity_kg": 20
        }
      }
    },
    {
      "id": "unknown-m1204-a",
      "title": "M1204-A Tractor",
      "brand": "YTO",
      "model": "M1204-A",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "M1204-A Tractor from the product catalog with Horsepower 120, engine YC4A11, rated power 88.2, gears 10+10, PTO 540/760.",
      "images": [],
      "horsepower": 120,
      "transmission": "10+10",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "YC4A11"
        },
        "transmission_details": {
          "type": "10+10",
          "forward_gears": 10,
          "reverse_gears": 10,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/760",
          "rear_pto_hp": 88.2
        },
        "dimensions": {
          "wheelbase_mm": 2380,
          "turning_radius_m": 4.9
        },
        "rear_hitch": {
          "lift_capacity_kg": 21.2
        }
      }
    },
    {
      "id": "unknown-m1204-4x",
      "title": "M1204-4X Tractor",
      "brand": "YTO",
      "model": "M1204-4X",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "M1204-4X Tractor from the product catalog with Horsepower 120, engine Weichai, rated power 88.2, gears 12+12, PTO 540/760.",
      "images": [],
      "horsepower": 120,
      "transmission": "12+12",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "Weichai"
        },
        "transmission_details": {
          "type": "12+12",
          "forward_gears": 12,
          "reverse_gears": 12,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/760",
          "rear_pto_hp": 88.2
        },
        "dimensions": {
          "wheelbase_mm": 2380,
          "turning_radius_m": 4.9
        },
        "rear_hitch": {
          "lift_capacity_kg": 21.2
        }
      }
    },
    {
      "id": "unknown-m1304-a-u",
      "title": "M1304-A/U Tractor",
      "brand": "YTO",
      "model": "M1304-A/U",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "M1304-A/U Tractor from the product catalog with Horsepower 130, engine YC4A150-T304, rated power 95.6, rated speed 2200, gears 10+10, operating weight 4100.",
      "images": [],
      "horsepower": 130,
      "transmission": "10+10",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "YC4A150-T304",
          "rpm_rated": 2200
        },
        "transmission_details": {
          "type": "10+10",
          "forward_gears": 10,
          "reverse_gears": 10,
          "drive_type": "4WD"
        },
        "dimensions": {
          "length_mm": 4580,
          "width_mm": 2070,
          "height_mm": 2800,
          "operating_weight_kg": 4100,
          "ground_clearance_mm": 490
        }
      }
    },
    {
      "id": "unknown-m1404-d",
      "title": "M1404-D Tractor",
      "brand": "YTO",
      "model": "M1404-D",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "M1404-D Tractor from the product catalog with Horsepower 140, engine Yuchai, rated power 95.6, rated speed 2200, gears 16+8, operating weight 4100.",
      "images": [],
      "horsepower": 140,
      "transmission": "16+8",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "Yuchai",
          "rpm_rated": 2200
        },
        "transmission_details": {
          "type": "16+8",
          "forward_gears": 16,
          "reverse_gears": 8,
          "drive_type": "4WD"
        },
        "dimensions": {
          "length_mm": 4580,
          "width_mm": 2070,
          "height_mm": 2800,
          "operating_weight_kg": 4100,
          "ground_clearance_mm": 490
        }
      }
    },
    {
      "id": "unknown-m1604-5g",
      "title": "M1604-5G Tractor",
      "brand": "YTO",
      "model": "M1604-5G",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "M1604-5G Tractor from the product catalog with Horsepower 160, engine Weichai, rated power 117.6, rated speed 2200, gears 12+12, PTO 540/760.",
      "images": [],
      "horsepower": 160,
      "transmission": "12+12",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "Weichai",
          "rpm_rated": 2200
        },
        "transmission_details": {
          "type": "12+12",
          "forward_gears": 12,
          "reverse_gears": 12,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/760"
        },
        "dimensions": {
          "length_mm": 5000,
          "wheelbase_mm": 2600
        }
      }
    },
    {
      "id": "unknown-m1854-g",
      "title": "M1854-G Tractor",
      "brand": "YTO",
      "model": "M1854-G",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "M1854-G Tractor from the product catalog with Horsepower 185, rated power 136, gears 16+16, tyres 16.9-28/18.4-42, operating weight 7800.",
      "images": [],
      "horsepower": 185,
      "transmission": "16+16",
      "drive_type": "4WD",
      "details": {
        "transmission_details": {
          "type": "16+16",
          "forward_gears": 16,
          "reverse_gears": 16,
          "drive_type": "4WD"
        },
        "tires": {
          "front": "16.9-28",
          "rear": "18.4-42"
        },
        "dimensions": {
          "length_mm": 5420,
          "width_mm": 2400,
          "height_mm": 3110,
          "operating_weight_kg": 7800,
          "wheelbase_mm": 2760
        }
      }
    },
    {
      "id": "unknown-m2004-q",
      "title": "M2004-Q Tractor",
      "brand": "YTO",
      "model": "M2004-Q",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "M2004-Q Tractor from the product catalog with Horsepower 200, engine YC6J220-T301/weichai, rated power 147, gears 16+8, operating weight 5600.",
      "images": [],
      "horsepower": 200,
      "transmission": "16+8",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "YC6J220-T301/weichai"
        },
        "transmission_details": {
          "type": "16+8",
          "forward_gears": 16,
          "reverse_gears": 8,
          "drive_type": "4WD"
        },
        "dimensions": {
          "length_mm": 5060,
          "width_mm": 2400,
          "height_mm": 3110,
          "operating_weight_kg": 5600,
          "wheelbase_mm": 2700,
          "ground_clearance_mm": 500
        }
      }
    },
    {
      "id": "unknown-sh554-c",
      "title": "SH554-C Tractor",
      "brand": "SinoHarvest",
      "model": "SH554-C",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "SH554-C Tractor from the product catalog with Horsepower 55, engine 4C5-55U31, rated power 40.4, rated speed 2300, gears 12+12, operating weight 2540.",
      "images": [],
      "horsepower": 55,
      "transmission": "12+12",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "4C5-55U31",
          "rpm_rated": 2300
        },
        "transmission_details": {
          "type": "12+12",
          "forward_gears": 12,
          "reverse_gears": 12,
          "drive_type": "4WD"
        },
        "dimensions": {
          "length_mm": 3970,
          "width_mm": 1620,
          "height_mm": 2510,
          "operating_weight_kg": 2540,
          "ground_clearance_mm": 304
        }
      }
    },
    {
      "id": "unknown-sh704-1",
      "title": "SH704-1 Tractor",
      "brand": "SinoHarvest",
      "model": "SH704-1",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "SH704-1 Tractor from the product catalog with Horsepower 70, engine A4K43T70A, rated power 51.5, rated speed 2300, gears 12+12, PTO 540/760, operating weight 2660.",
      "images": [],
      "horsepower": 70,
      "transmission": "12+12",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "A4K43T70A",
          "rpm_rated": 2300
        },
        "transmission_details": {
          "type": "12+12",
          "forward_gears": 12,
          "reverse_gears": 12,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/760"
        },
        "dimensions": {
          "length_mm": 3970,
          "width_mm": 1640,
          "height_mm": 2130,
          "operating_weight_kg": 2660,
          "ground_clearance_mm": 354
        }
      }
    },
    {
      "id": "unknown-cd904-1",
      "title": "CD904-1 Tractor",
      "brand": "SinoHarvest",
      "model": "CD904-1",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "CD904-1 Tractor from the product catalog with Horsepower 90, rated power 66.2, rated speed 2300, gears 12+12, operating weight 2870.",
      "images": [],
      "horsepower": 90,
      "transmission": "12+12",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "rpm_rated": 2300
        },
        "transmission_details": {
          "type": "12+12",
          "forward_gears": 12,
          "reverse_gears": 12,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/760,540/1000"
        },
        "dimensions": {
          "length_mm": 4050,
          "width_mm": 1828,
          "height_mm": 2654,
          "operating_weight_kg": 2870,
          "ground_clearance_mm": 354
        }
      }
    },
    {
      "id": "unknown-cd904-s",
      "title": "CD904-S Tractor",
      "brand": "SinoHarvest",
      "model": "CD904-S",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "CD904-S Tractor from the product catalog with Horsepower 90, rated power 66.2, rated speed 2300, gears 12+12, operating weight 2870.",
      "images": [],
      "horsepower": 90,
      "transmission": "12+12",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "rpm_rated": 2300
        },
        "transmission_details": {
          "type": "12+12",
          "forward_gears": 12,
          "reverse_gears": 12,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/760,540/1000"
        },
        "dimensions": {
          "length_mm": 4050,
          "width_mm": 1828,
          "height_mm": 2654,
          "operating_weight_kg": 2870,
          "ground_clearance_mm": 354
        }
      }
    },
    {
      "id": "unknown-cd1004-s",
      "title": "CD1004 S Tractor",
      "brand": "SinoHarvest",
      "model": "CD1004 S",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "CD1004 S Tractor from the product catalog with Horsepower 100, engine YC4DK110-T301, rated power 73.5, rated speed 2200, gears 16F+8R, operating weight 3994.",
      "images": [],
      "horsepower": 100,
      "transmission": "16F+8R",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "YC4DK110-T301",
          "rpm_rated": 2200
        },
        "transmission_details": {
          "type": "16F+8R",
          "forward_gears": 16,
          "reverse_gears": 8,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "760/1000"
        },
        "dimensions": {
          "length_mm": 4110,
          "width_mm": 2010,
          "height_mm": 2830,
          "operating_weight_kg": 3994,
          "ground_clearance_mm": 480
        }
      }
    },
    {
      "id": "unknown-cd1304-1",
      "title": "CD1304-1 Tractor",
      "brand": "SinoHarvest",
      "model": "CD1304-1",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "CD1304-1 Tractor from the product catalog with Horsepower 130, engine YC4A150-T313, rated power 95.6, rated speed 2200, gears 16F+8R, operating weight 4350.",
      "images": [],
      "horsepower": 130,
      "transmission": "16F+8R",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "YC4A150-T313",
          "rpm_rated": 2200
        },
        "transmission_details": {
          "type": "16F+8R",
          "forward_gears": 16,
          "reverse_gears": 8,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/760选装 760/850, 540/1000,760/1000"
        },
        "dimensions": {
          "length_mm": 4350,
          "width_mm": 2100,
          "height_mm": 2900,
          "operating_weight_kg": 4350,
          "ground_clearance_mm": 420
        }
      }
    },
    {
      "id": "unknown-cd1504",
      "title": "CD1504 Tractor",
      "brand": "SinoHarvest",
      "model": "CD1504",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "CD1504 Tractor from the product catalog with Horsepower 150, engine YC6J175-T311, rated power 110.3, rated speed 2300, gears 16F+8R, operating weight 5760.",
      "images": [],
      "horsepower": 150,
      "transmission": "16F+8R",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "YC6J175-T311",
          "rpm_rated": 2300
        },
        "transmission_details": {
          "type": "16F+8R",
          "forward_gears": 16,
          "reverse_gears": 8,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/1000"
        },
        "dimensions": {
          "length_mm": 4880,
          "width_mm": 2356,
          "height_mm": 3010,
          "operating_weight_kg": 5760,
          "ground_clearance_mm": 480
        }
      }
    },
    {
      "id": "unknown-df1404",
      "title": "DF1404 Tractor",
      "brand": "SinoHarvest",
      "model": "DF1404",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "DF1404 Tractor from the product catalog with Horsepower 140, engine YC6J155L-T20, rated power 114, rated speed 2300, gears 24F+ 12R, operating weight 6200.",
      "images": [],
      "horsepower": 140,
      "transmission": "24F+ 12R",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "YC6J155L-T20",
          "rpm_rated": 2300
        },
        "transmission_details": {
          "type": "24F+ 12R",
          "forward_gears": 24,
          "reverse_gears": 12,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/1000"
        },
        "dimensions": {
          "length_mm": 5038,
          "width_mm": 2344,
          "height_mm": 3025,
          "operating_weight_kg": 6200,
          "ground_clearance_mm": 450
        }
      }
    },
    {
      "id": "unknown-cd1604-1",
      "title": "CD1604-1 Tractor",
      "brand": "SinoHarvest",
      "model": "CD1604-1",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "CD1604-1 Tractor from the product catalog with Horsepower 160, engine YC6J190-T301, rated power 117.6, rated speed 2300, gears 24F+ 12R, operating weight 6380.",
      "images": [],
      "horsepower": 160,
      "transmission": "24F+ 12R",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "YC6J190-T301",
          "rpm_rated": 2300
        },
        "transmission_details": {
          "type": "24F+ 12R",
          "forward_gears": 24,
          "reverse_gears": 12,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/1000"
        },
        "dimensions": {
          "length_mm": 5108,
          "width_mm": 2466,
          "height_mm": 3075,
          "operating_weight_kg": 6380,
          "ground_clearance_mm": 450
        }
      }
    },
    {
      "id": "unknown-df1704",
      "title": "DF1704 Tractor",
      "brand": "SinoHarvest",
      "model": "DF1704",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "DF1704 Tractor from the product catalog with Horsepower 170, engine YC6J175L-T21, rated power 125, rated speed 2300, gears 24F+ 12R, operating weight 6200.",
      "images": [],
      "horsepower": 170,
      "transmission": "24F+ 12R",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "YC6J175L-T21",
          "rpm_rated": 2300
        },
        "transmission_details": {
          "type": "24F+ 12R",
          "forward_gears": 24,
          "reverse_gears": 12,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/1000"
        },
        "dimensions": {
          "length_mm": 5038,
          "width_mm": 2466,
          "height_mm": 3057,
          "operating_weight_kg": 6200,
          "ground_clearance_mm": 450
        }
      }
    },
    {
      "id": "unknown-cd1804e",
      "title": "CD1804E Tractor",
      "brand": "SinoHarvest",
      "model": "CD1804E",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "CD1804E Tractor from the product catalog with Horsepower 180, engine YC6J190-T306, rated power 132.4, rated speed 2300, gears 16+8, operating weight 5750.",
      "images": [],
      "horsepower": 180,
      "transmission": "16+8",
      "details": {
        "engine": {
          "model": "YC6J190-T306",
          "rpm_rated": 2300
        },
        "transmission_details": {
          "type": "16+8",
          "forward_gears": 16,
          "reverse_gears": 8
        },
        "dimensions": {
          "length_mm": 4880,
          "width_mm": 2356,
          "height_mm": 3010,
          "operating_weight_kg": 5750,
          "ground_clearance_mm": 480
        }
      }
    },
    {
      "id": "unknown-cd2004",
      "title": "CD2004 Tractor",
      "brand": "SinoHarvest",
      "model": "CD2004",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "CD2004 Tractor from the product catalog with Horsepower 200, engine YCA07P220-T401, rated power 147, rated speed 2300, gears 24+12, operating weight 6880.",
      "images": [],
      "horsepower": 200,
      "transmission": "24+12",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "YCA07P220-T401",
          "rpm_rated": 2300
        },
        "transmission_details": {
          "type": "24+12",
          "forward_gears": 24,
          "reverse_gears": 12,
          "drive_type": "4WD"
        },
        "dimensions": {
          "length_mm": 5150,
          "width_mm": 2510,
          "height_mm": 3207,
          "operating_weight_kg": 6880,
          "ground_clearance_mm": 480
        }
      }
    },
    {
      "id": "unknown-cd2104",
      "title": "CD2104 Tractor",
      "brand": "SinoHarvest",
      "model": "CD2104",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "CD2104 Tractor from the product catalog with Horsepower 210, engine YC6J210-T305, rated power 154.4, rated speed 2300, gears 24+12, operating weight 6610.",
      "images": [],
      "horsepower": 210,
      "transmission": "24+12",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "YC6J210-T305",
          "rpm_rated": 2300
        },
        "transmission_details": {
          "type": "24+12",
          "forward_gears": 24,
          "reverse_gears": 12,
          "drive_type": "4WD"
        },
        "dimensions": {
          "length_mm": 5108,
          "width_mm": 2466,
          "height_mm": 3075,
          "operating_weight_kg": 6610,
          "ground_clearance_mm": 450
        }
      }
    },
    {
      "id": "massey-ferguson-mf1004",
      "title": "Massey Ferguson MF1004 Tractor",
      "brand": "Massey Ferguson",
      "model": "MF1004",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "Massey Ferguson MF1004 Tractor from the product catalog with Horsepower 100, engine Perkins, rated power 73.5, rated speed 2200, gears 12+4, tyres 14.9-24/18.4-34, operating weight 3950.",
      "images": [],
      "horsepower": 100,
      "transmission": "12+4",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "Perkins",
          "rpm_rated": 2200
        },
        "transmission_details": {
          "type": "12+4",
          "forward_gears": 12,
          "reverse_gears": 4,
          "drive_type": "4WD"
        },
        "tires": {
          "front": "14.9-24",
          "rear": "18.4-34"
        },
        "dimensions": {
          "length_mm": 4330,
          "width_mm": 2235,
          "height_mm": 2965,
          "operating_weight_kg": 3950,
          "wheelbase_mm": 2370,
          "ground_clearance_mm": 380
        }
      }
    },
    {
      "id": "massey-ferguson-mf1104",
      "title": "Massey Ferguson MF1104 Tractor",
      "brand": "Massey Ferguson",
      "model": "MF1104",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "Massey Ferguson MF1104 Tractor from the product catalog with Horsepower 110, engine Perkins, rated power 80.8, rated speed 2200, gears 12+4, PTO 540/1000, tyres 14.9-24/18.4-34,12.4-28/18.4-34,14.9-24/18.4-34, operating weight 4050.",
      "images": [],
      "horsepower": 110,
      "transmission": "12+4",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "Perkins",
          "rpm_rated": 2200
        },
        "transmission_details": {
          "type": "12+4",
          "forward_gears": 12,
          "reverse_gears": 4,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/1000"
        },
        "tires": {
          "front": "14.9-24",
          "rear": "18.4-34,12.4-28/18.4-34,14.9-24/18.4-34"
        },
        "dimensions": {
          "length_mm": 4330,
          "width_mm": 2235,
          "height_mm": 2965,
          "operating_weight_kg": 4050,
          "wheelbase_mm": 2486,
          "ground_clearance_mm": 380
        }
      }
    },
    {
      "id": "massey-ferguson-mf1204",
      "title": "Massey Ferguson MF1204 Tractor",
      "brand": "Massey Ferguson",
      "model": "MF1204",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "Massey Ferguson MF1204 Tractor from the product catalog with Horsepower 120, rated power 88.2, rated speed 2200, gears 12+4, tyres 14.9-24/18.4-34, operating weight 4150.",
      "images": [],
      "horsepower": 120,
      "transmission": "12+4",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "rpm_rated": 2200
        },
        "transmission_details": {
          "type": "12+4",
          "forward_gears": 12,
          "reverse_gears": 4,
          "drive_type": "4WD"
        },
        "tires": {
          "front": "14.9-24",
          "rear": "18.4-34"
        },
        "dimensions": {
          "length_mm": 4330,
          "width_mm": 2235,
          "height_mm": 2965,
          "operating_weight_kg": 4150,
          "ground_clearance_mm": 380
        }
      }
    },
    {
      "id": "massey-ferguson-s1204-c",
      "title": "Massey Ferguson S1204-C Tractor",
      "brand": "Massey Ferguson",
      "model": "S1204-C",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "Massey Ferguson S1204-C Tractor from the product catalog with Horsepower 120, rated power 88.2, rated speed 2200, gears 12+4, tyres 14.9-24/18.4-34, operating weight 4150.",
      "images": [],
      "horsepower": 120,
      "transmission": "12+4",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "rpm_rated": 2200
        },
        "transmission_details": {
          "type": "12+4",
          "forward_gears": 12,
          "reverse_gears": 4,
          "drive_type": "4WD"
        },
        "tires": {
          "front": "14.9-24",
          "rear": "18.4-34"
        },
        "dimensions": {
          "length_mm": 4330,
          "width_mm": 2235,
          "height_mm": 2965,
          "operating_weight_kg": 4150,
          "ground_clearance_mm": 380
        }
      }
    },
    {
      "id": "massey-ferguson-iseki-t954",
      "title": "Massey Ferguson ISEKI T954 Tractor",
      "brand": "Massey Ferguson",
      "model": "ISEKI T954",
      "year": 2016,
      "price": null,
      "currency": "USD",
      "condition": "used",
      "location": null,
      "country": null,
      "description": "Massey Ferguson ISEKI T954 Tractor from the product catalog with Horsepower 95, engine 1104D-44T(Perkins), rated power 70, rated speed 2200, gears 12+12, PTO 540/750, tyres 9.5-24,12.4-24/16.9-30, operating weight 3015.",
      "images": [],
      "hours_used": 900,
      "horsepower": 95,
      "transmission": "12+12",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "1104D-44T(Perkins)",
          "rpm_rated": 2200,
          "displacement_cc": 4400
        },
        "transmission_details": {
          "type": "12+12",
          "forward_gears": 12,
          "reverse_gears": 12,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/750"
        },
        "tires": {
          "front": "9.5-24,12.4-24",
          "rear": "16.9-30"
        },
        "dimensions": {
          "length_mm": 3830,
          "width_mm": 1985,
          "height_mm": 2600,
          "operating_weight_kg": 3015,
          "wheelbase_mm": 2260,
          "ground_clearance_mm": 460,
          "turning_radius_m": 3.6
        },
        "registration_year": 2016
      }
    },
    {
      "id": "massey-ferguson-iseki-t804",
      "title": "Massey Ferguson ISEKI T804 Tractor",
      "brand": "Massey Ferguson",
      "model": "ISEKI T804",
      "year": 2016,
      "price": null,
      "currency": "USD",
      "condition": "used",
      "location": null,
      "country": null,
      "description": "Massey Ferguson ISEKI T804 Tractor from the product catalog with Horsepower 80, engine 1104D-44T(Perkins), rated power 58.8, rated speed 2200, gears 12+12, PTO 540/750, tyres 9.5-24,12.4-24/16.9-30, operating weight 3015.",
      "images": [],
      "hours_used": 900,
      "horsepower": 80,
      "transmission": "12+12",
      "drive_type": "4WD",
      "details": {
        "engine": {
          "model": "1104D-44T(Perkins)",
          "rpm_rated": 2200,
          "displacement_cc": 4400
        },
        "transmission_details": {
          "type": "12+12",
          "forward_gears": 12,
          "reverse_gears": 12,
          "drive_type": "4WD"
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/750"
        },
        "tires": {
          "front": "9.5-24,12.4-24",
          "rear": "16.9-30"
        },
        "dimensions": {
          "length_mm": 3830,
          "width_mm": 1985,
          "height_mm": 2600,
          "operating_weight_kg": 3015,
          "wheelbase_mm": 2260,
          "ground_clearance_mm": 460,
          "turning_radius_m": 3.6
        },
        "registration_year": 2016
      }
    },
    {
      "id": "kubota-m704k",
      "title": "Kubota M704K Tractor",
      "brand": "Kubota",
      "model": "M704K",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "Kubota M704K Tractor from the product catalog with Horsepower 70, engine V3800-DI-T-ET19, rated power 51.5, rated speed 2500, gears 8+8, PTO 540/720, tyres 14.9-26,12.4-28/18.4-38,16.9-34,18.4- 34,18.4-38, operating weight 2400.",
      "images": [],
      "horsepower": 70,
      "transmission": "8+8",
      "details": {
        "engine": {
          "model": "V3800-DI-T-ET19",
          "rpm_rated": 2500
        },
        "transmission_details": {
          "type": "8+8",
          "forward_gears": 8,
          "reverse_gears": 8
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/720"
        },
        "tires": {
          "front": "14.9-26,12.4-28",
          "rear": "18.4-38,16.9-34,18.4- 34,18.4-38"
        },
        "dimensions": {
          "length_mm": 4110,
          "width_mm": 1950,
          "height_mm": 2530,
          "operating_weight_kg": 2400,
          "ground_clearance_mm": 490
        }
      }
    },
    {
      "id": "kubota-m854k",
      "title": "Kubota M854K Tractor",
      "brand": "Kubota",
      "model": "M854K",
      "year": null,
      "price": 15000,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "Kubota M854K Tractor from the product catalog with Horsepower 85, engine V3800-DI-T-ES16, rated power 62.5, rated speed 2500, gears 12+12, PTO 540/720, tyres 12.4-24/18.4-30, operating weight 3060.",
      "images": [],
      "horsepower": 85,
      "transmission": "12+12",
      "details": {
        "engine": {
          "model": "V3800-DI-T-ES16",
          "rpm_rated": 2500,
          "cylinders": 4
        },
        "transmission_details": {
          "type": "12+12",
          "forward_gears": 12,
          "reverse_gears": 12
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/720"
        },
        "tires": {
          "front": "12.4-24",
          "rear": "18.4-30"
        },
        "dimensions": {
          "length_mm": 4445,
          "width_mm": 2215,
          "height_mm": 2605,
          "operating_weight_kg": 3060,
          "wheelbase_mm": 1660,
          "ground_clearance_mm": 485,
          "turning_radius_m": 4.5
        }
      }
    },
    {
      "id": "kubota-m954k",
      "title": "Kubota M954K Tractor",
      "brand": "Kubota",
      "model": "M954K",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "Kubota M954K Tractor from the product catalog with Horsepower 95, engine V3800-DI-T, rated power 69.9, rated speed 2600, gears 12+12, tyres 12.4-24/16.9-34, operating weight 2995/2755.",
      "images": [],
      "horsepower": 95,
      "transmission": "12+12",
      "details": {
        "engine": {
          "model": "V3800-DI-T",
          "rpm_rated": 2600
        },
        "transmission_details": {
          "type": "12+12",
          "forward_gears": 12,
          "reverse_gears": 12
        },
        "tires": {
          "front": "12.4-24",
          "rear": "16.9-34"
        },
        "dimensions": {
          "length_mm": 4210,
          "width_mm": 2120,
          "height_mm": 2650,
          "operating_weight_kg": 2995,
          "wheelbase_mm": 2250,
          "ground_clearance_mm": 460
        }
      }
    },
    {
      "id": "kubota-m954kq",
      "title": "Kubota M954KQ Tractor",
      "brand": "Kubota",
      "model": "M954KQ",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "Kubota M954KQ Tractor from the product catalog with Horsepower 95, engine V3800-DI-T, rated power 69.9, rated speed 2600, gears 12+12, tyres 12.4-24(paddywheel： 9.5-24)/16.9-34(paddy wheel：16.9-30）, operating weight 3245/3270.",
      "images": [],
      "horsepower": 95,
      "transmission": "12+12",
      "details": {
        "engine": {
          "model": "V3800-DI-T",
          "rpm_rated": 2600
        },
        "transmission_details": {
          "type": "12+12",
          "forward_gears": 12,
          "reverse_gears": 12
        },
        "tires": {
          "front": "12.4-24(paddywheel： 9.5-24)",
          "rear": "16.9-34(paddy wheel：16.9-30）"
        },
        "dimensions": {
          "length_mm": 4445,
          "width_mm": 2215,
          "height_mm": 2620,
          "operating_weight_kg": 3245,
          "wheelbase_mm": 2250,
          "ground_clearance_mm": 460
        }
      }
    },
    {
      "id": "kubota-m1004q",
      "title": "Kubota M1004Q Tractor",
      "brand": "Kubota",
      "model": "M1004Q",
      "year": null,
      "price": null,
      "currency": "USD",
      "condition": "new",
      "location": null,
      "country": null,
      "description": "Kubota M1004Q Tractor from the product catalog with Horsepower 100, engine V3800-DI-TI-ES02, rated power 73.5, rated speed 2600, gears 12F+12R, PTO 540/720, tyres 12.4-24/16.9-34,paddy wheel：9.5-24/16.9-30, operating weight 3135.",
      "images": [],
      "horsepower": 100,
      "transmission": "12F+12R",
      "details": {
        "engine": {
          "model": "V3800-DI-TI-ES02",
          "rpm_rated": 2600
        },
        "transmission_details": {
          "type": "12F+12R",
          "forward_gears": 12,
          "reverse_gears": 12
        },
        "pto": {
          "rear_pto": true,
          "rear_pto_rpm": "540/720"
        },
        "tires": {
          "front": "12.4-24",
          "rear": "16.9-34,paddy wheel：9.5-24/16.9-30"
        },
        "dimensions": {
          "length_mm": 4200,
          "width_mm": 2130,
          "height_mm": 2670,
          "operating_weight_kg": 3135,
          "wheelbase_mm": 2250,
          "ground_clearance_mm": 490,
          "turning_radius_m": 4.2
        }
      }
    }
  ]
};
