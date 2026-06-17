// src/types/database.ts
// Mirrors the Supabase schema in /spec/data-model.md.

export type LeadFlow = 'catalog' | 'accio' | 'contact'
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

export interface Category {
  id: string
  slug: string
  name_es: string
  name_en: string
  description_es: string | null
  icon_key: string | null
  sort_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
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
  is_active: boolean
  sort_order: number
  meta_title_es: string | null
  meta_desc_es: string | null
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
  accio_project_id: string | null
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

export interface AccioProject {
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
