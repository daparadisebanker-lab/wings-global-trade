// src/types/mister.ts
// Mister Engine — TPR state, CIF estimate, SSE event shapes.

import type { FreeZone, TprCompleteness, ConversationTurn } from '@/types/database'

/** The 10 TPR fields collected by Mister, all optional during capture. */
export interface TprState {
  product_description?: string
  hs_code?: string
  quantity?: string
  target_price_usd?: number
  destination_country?: string
  destination_port?: string
  certifications?: string[]
  tech_specs?: Record<string, string>
  packaging_requirements?: string
  delivery_timeline?: string
}

export type TprFieldKey = keyof TprState

export interface CifInput {
  product_description: string
  hs_code?: string
  quantity: string
  quantity_units?: string
  quantity_numeric?: number
  target_price_usd: number
  destination_country: string
  destination_port?: string
  certifications?: string[]
  source_market?: string
}

export interface CifEstimate {
  free_zone: FreeZone
  source_market: string
  fob_estimate_usd: number
  freight_estimate_usd: number
  insurance_estimate_usd: number
  cif_total_usd: number
  duty_rate_pct: number
  duty_amount_usd: number
  free_zone_savings_pct: number
  disclaimer: string
  methodology: string
}

/** SSE event types emitted by /api/mister/chat. */
export type MisterStreamEvent =
  | { type: 'delta'; content: string }
  | { type: 'tpr_update'; field: TprFieldKey; value: unknown }
  | { type: 'done'; tpr_completeness: TprCompleteness }
  | { type: 'error'; message: string }

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface MisterChatRequest {
  messages: ChatMessage[]
  tpr_state: TprState
  session_id: string
}

export interface MisterSubmitRequest {
  full_name: string
  company?: string
  email: string
  phone: string
  tpr: TprState & {
    product_description: string
    quantity: string
    destination_country: string
  }
  estimate?: {
    free_zone: string
    cif_total_usd: number
    duty_amount_usd: number
    free_zone_savings_pct: number
  }
  conversation_snapshot: ConversationTurn[]
  session_id: string
}

/** Minimum fields required for an estimate to be generated. */
export const MINIMUM_TPR_FIELDS: TprFieldKey[] = [
  'product_description',
  'quantity',
  'destination_country',
  'target_price_usd',
]

/** Full field ordering used for completeness and TprSheet rendering. */
export const ALL_TPR_FIELDS: TprFieldKey[] = [
  'product_description',
  'hs_code',
  'quantity',
  'target_price_usd',
  'destination_country',
  'certifications',
  'tech_specs',
  'packaging_requirements',
  'destination_port',
  'delivery_timeline',
]
