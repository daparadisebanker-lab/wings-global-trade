// src/types/database.ts
// Mirrors the Supabase schema in /spec/data-model.md.

export type LeadFlow = 'catalog' | 'mister' | 'contact'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed_won' | 'closed_lost'
// Phase 2A: added 'standard' level per ai-engineer.md §REGLAS DE COMPLETENESS
// partial: 1-2 fields | minimum: fields 1,3,4,5 | standard: fields 1-6 | complete: all 10
export type TprCompleteness = 'partial' | 'minimum' | 'standard' | 'complete'
export type NotificationChannel = 'whatsapp' | 'email'
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'retried'
export type FreeZone = 'ZOFRATACNA' | 'ZOFRI'

export interface ProductModel {
  name: string
  specs_override: Record<string, string>
}

// Option B — typed variant system (replaces flat models[] for multi-config products)
export interface VariantEngine {
  model: string
  displacement_cc: number
  power_kw: number
  power_rpm: number
  torque_nm: number
  torque_rpm: string
}

export interface VariantBatteryEV {
  pack_kwh: number
  range_km: number
  voltage_v: number
  battery_brand: string
  battery_type: string
  motor_brand: string
  rated_peak_kw: string  // "35/70" = rated/peak
  charger: string
}

export interface VariantFeatures {
  abs: boolean
  power_steering: boolean
  ac: boolean
  power_window: boolean
  central_lock: boolean
  media: string | null
}

export interface ProductVariant {
  model: string                                       // "W11", "GM67E", "EV2"
  fuel_type: 'gasoline' | 'diesel' | 'cng' | 'bev'
  emission: string | null                             // "Euro-V", null for BEV
  payload_t: number
  cabin: string
  wheelbase_mm: number
  overall_dims: string                                // "4290x1690x2030"
  cargo_box: string | null
  curb_weight_kg: number
  gvw_kg: number
  max_speed_kmh: number
  tyre: string | null
  front_rear_overhang_mm?: string | null              // "1190/1490" (front/rear mm)
  wheel_track_mm?: string | null                      // "1485/1440" (front/rear mm)
  final_ratio?: number | null                         // 5.375
  qty_wheels?: string | null                          // "6+1"
  brake_system?: string | null                        // "Hydraulic brake"
  parking_brake?: string | null                       // "Central drum type"
  gearshift: string | null
  battery_volt?: string                               // "12V" / "24V" for ICE
  engine: VariantEngine | null
  battery_ev: VariantBatteryEV | null
  features: VariantFeatures
  notes?: string
}

export interface Category {
  id: string
  slug: string
  name_es: string
  name_en: string
  description_es: string | null
  icon_key: string | null
  image_url?: string | null
  sort_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

/** Subcategory row — belongs to a category, used for second-level filtering. */
export interface Subcategory {
  id: string
  category_id: string
  slug: string
  name_es: string
  name_en: string
  sort_order: number
  created_at?: string
}

export interface Product {
  id: string
  category_id: string
  slug: string
  name_es: string
  name_en: string
  description_es: string
  description_en: string | null
  specs: Record<string, string>
  source_markets: string[]
  images: string[]
  models: ProductModel[]
  variants?: ProductVariant[] | null
  is_active: boolean
  sort_order: number
  meta_title_es: string | null
  meta_desc_es: string | null
  // Added in migration 0005
  subcategory_id?: string | null
  filter_attrs?: Record<string, string | number | string[]>
  created_at?: string
  updated_at?: string
}

export interface ConversationTurn {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  tpr_fields_captured?: string[]
}

export interface Lead {
  id: string
  flow: LeadFlow
  status: LeadStatus
  full_name: string
  company: string | null
  email: string
  phone: string
  destination_country: string
  product_id: string | null
  product_name_snapshot: string | null
  quantity: string | null
  message: string | null
  mister_project_id: string | null
  whatsapp_sent_at: string | null
  whatsapp_error: string | null
  email_sent_at: string | null
  email_error: string | null
  source_url: string | null
  user_agent: string | null
  ip_country: string | null
  created_at: string
  updated_at: string
}

export interface MisterProject {
  id: string
  product_description: string
  hs_code: string | null
  hs_code_confirmed: boolean
  quantity: string
  quantity_units: string | null
  target_price_usd: number | null
  destination_country: string
  destination_port: string | null
  certifications: string[]
  tech_specs: Record<string, string>
  packaging_requirements: string | null
  delivery_timeline: string | null
  free_zone: FreeZone | null
  source_market: string | null
  fob_estimate_usd: number | null
  freight_estimate_usd: number | null
  insurance_estimate_usd: number | null
  cif_total_usd: number | null
  duty_rate_pct: number | null
  duty_amount_usd: number | null
  free_zone_savings_pct: number | null
  estimate_generated_at: string | null
  estimate_disclaimer: string
  completeness: TprCompleteness
  missing_fields: string[]
  conversation_turns: number
  conversation_snapshot: ConversationTurn[]
  created_at: string
  updated_at: string
}
