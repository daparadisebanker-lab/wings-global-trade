// ─── Engine ───────────────────────────────────────────────────────────────────
export interface EngineDetails {
  manufacturer?: string;
  model?: string;
  displacement_cc?: number;
  cylinders?: number;
  emissions_standard?: string;
  fuel_type?: string;        // e.g. "Diesel", "Electric", "Hybrid"
  rpm_rated?: number;
  max_torque_nm?: number;
}

// ─── Transmission ─────────────────────────────────────────────────────────────
export interface TransmissionDetails {
  type?: string;             // e.g. "Manual", "CVT", "PowerShift", "Auto Command"
  forward_gears?: number;
  reverse_gears?: number;
  creeper?: boolean;         // super-low gears
  reversible?: boolean;      // reversible driving direction
  drive_type?: string;       // e.g. "4WD", "2WD", "4x4"
  pto_drive?: string;        // e.g. "Mechanical", "Independent", "Live"
}

// ─── Cabin / Platform ─────────────────────────────────────────────────────────
export interface CabinDetails {
  cabin?: boolean;
  air_conditioning?: boolean;
  heating?: boolean;
  suspension_seat?: boolean;
  radio?: boolean;
  front_loader_ready?: boolean;
  gps_ready?: boolean;
  sunroof?: boolean;
  rear_window_wiper?: boolean;
}

// ─── PTO (Power Take-Off) ─────────────────────────────────────────────────────
export interface PtoDetails {
  rear_pto?: boolean;
  rear_pto_rpm?: string;     // e.g. "540 / 750 / 1000"
  rear_pto_hp?: number;
  front_pto?: boolean;
  front_pto_rpm?: string;
  front_pto_hp?: number;
}

// ─── Hydraulics ───────────────────────────────────────────────────────────────
export interface HydraulicsDetails {
  pump_flow_lpm?: number;
  max_pressure_bar?: number;
  rear_remote_valves?: number;
  front_remote_valves?: number;
  isobus?: boolean;
  load_sensing?: boolean;
  electronic_control?: boolean;
}

// ─── Rear Hitch ───────────────────────────────────────────────────────────────
export interface RearHitchDetails {
  three_point_category?: string;   // e.g. "Category 2", "Category 3"
  lift_capacity_kg?: number;
  quick_hitch?: boolean;
}

// ─── Front Hitch ──────────────────────────────────────────────────────────────
export interface FrontHitchDetails {
  front_hitch?: boolean;
  front_hitch_category?: string;
  front_lift_capacity_kg?: number;
}

// ─── Tires ────────────────────────────────────────────────────────────────────
export interface TiresDetails {
  front_left?: string;
  front_right?: string;
  rear_left?: string;
  rear_right?: string;
  front?: string;            // single front size (when both are identical)
  rear?: string;             // single rear size (when both are identical)
  spare?: boolean;
}

// ─── Weights & Dimensions ─────────────────────────────────────────────────────
export interface DimensionsDetails {
  operating_weight_kg?: number;
  max_allowed_weight_kg?: number;
  front_axle_load_kg?: number;
  rear_axle_load_kg?: number;
  wheelbase_mm?: number;
  length_mm?: number;
  width_mm?: number;
  height_mm?: number;
  ground_clearance_mm?: number;
  turning_radius_m?: number;
}

// ─── Electrical ───────────────────────────────────────────────────────────────
export interface ElectricalDetails {
  voltage_v?: number;
  alternator_a?: number;
  battery_ah?: number;
  telematics?: boolean;
  telematics_system?: string; // e.g. "CLAAS TELEMATICS", "JD Operations Center"
}

// ─── Top-level Listing Details (JSONB in Supabase) ────────────────────────────
export interface ListingDetails {
  // General
  vat_excluded?: boolean;
  max_speed_kmh?: number;
  warranty?: string;            // e.g. "12 months", "Factory warranty remaining"
  registration_year?: number;
  serial_number?: string;
  service_history?: boolean;
  first_owner?: boolean;

  // Spec groups
  engine?: EngineDetails;
  transmission_details?: TransmissionDetails;
  cabin?: CabinDetails;
  pto?: PtoDetails;
  hydraulics?: HydraulicsDetails;
  rear_hitch?: RearHitchDetails;
  front_hitch?: FrontHitchDetails;
  tires?: TiresDetails;
  dimensions?: DimensionsDetails;
  electrical?: ElectricalDetails;
}

// ─── Core Listing ─────────────────────────────────────────────────────────────
export interface Listing {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  hours_used: number | null;
  horsepower: number | null;
  condition: "new" | "used" | "refurbished";
  location: string;
  country: string;
  description: string;
  images: string[];
  transmission: string | null;
  drive_type: string | null;
  details?: ListingDetails;
  // Optional timestamps from Supabase
  created_at?: string;
  updated_at?: string;
}

// ─── Inquiry ──────────────────────────────────────────────────────────────────
export interface InquiryPayload {
  listing_id: string;
  listing_title: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}
