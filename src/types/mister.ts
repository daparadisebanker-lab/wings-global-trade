// src/types/mister.ts
// Mister type system — v2 (Mister AI Trade Intelligence).
// ─────────────────────────────────────────────────────────────
// SECTION A: Legacy TPR / Accio Engine types (kept for /accio flow).
//   Do not remove — accio chat, estimate, and submit routes still import these.
// SECTION B: Mister v2 session + stream types (new Mister at /mister).
// SECTION C: Financial layer types (finance.md §8 — anti-price guarantee types).
// ─────────────────────────────────────────────────────────────

import type { FreeZone, TprCompleteness, ConversationTurn } from '@/types/database'

// ─────────────────────────────────────────────────────────────
// SECTION A — Legacy TPR / Accio Engine types
// ─────────────────────────────────────────────────────────────

/** The 10 TPR fields collected by the Accio Engine, all optional during capture. */
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

/** @deprecated — CIF absolute figures are removed from the Mister surface (Decision A). */
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

/** Legacy SSE event types emitted by /api/mister/chat (old TPR flow). */
export type LegacyMisterStreamEvent =
  | { type: 'delta'; content: string }
  | { type: 'tpr_update'; field: TprFieldKey; value: unknown }
  | { type: 'done'; tpr_completeness: TprCompleteness }
  | { type: 'error'; message: string }

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface LegacyMisterChatRequest {
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

// ─────────────────────────────────────────────────────────────
// SECTION B — Mister v2 session + stream types
// ─────────────────────────────────────────────────────────────

export type MisterArchetype =
  | 'lead_buyer'
  | 'project_manager'
  | 'logistics_manager'
  | 'reseller'
  | 'wholesale_partner'
  | 'unresolved'

export type MisterStage =
  | 'induction'
  | 'discovery'
  | 'consideration'
  | 'pre_qualification'
  | 'support'

export type MisterLocale = 'es-PE' | 'en' | 'nl' | 'de'

export type MisterActionId =
  | 'ask_followup'
  | 'show_product'
  | 'show_comparison'
  | 'show_specs'
  | 'show_moq'
  | 'download_document'
  | 'open_quotation'
  | 'book_meeting'
  | 'connect_whatsapp'
  | 'explain_cost'

export interface MisterQuickAction {
  label: string
  action: MisterActionId
}

export interface MisterCollected {
  destinationCountry?: string
  destinationCity?: string
  incoterm?: 'EXW' | 'FOB' | 'CFR' | 'CIF' | 'DAP' | 'DDP'
  containerType?: '20GP' | '40GP' | '40HC' | 'reefer' | 'LCL'
  volume?: string
  ruc?: string
  timeline?: string
  productInterest?: string[] // product UUIDs from products table
  budgetBand?: string
  notes?: string
}

export type MisterSurfaceType =
  | 'product'
  | 'comparison'
  | 'specs'
  | 'moq'
  | 'waterfall'
  | 'document'
  | 'contact'
  | 'quotation_form'

export interface MisterSurface {
  type: MisterSurfaceType
  payload: unknown // narrowed per type at render time
}

/** Named SSE events emitted by /api/mister (v2). */
export type MisterStreamEvent =
  | { event: 'token';   data: { delta: string } }
  | { event: 'surface'; data: { type: MisterSurfaceType; payload: unknown } }
  | { event: 'actions'; data: { quickActions: MisterQuickAction[] } }
  | { event: 'state';   data: { archetype: MisterArchetype; stage: MisterStage } }
  | { event: 'done';    data: { messageId: string } }
  | { event: 'error';   data: { code: string; message?: string; fallback?: string } }

/** POST /api/mister request body. */
export interface MisterChatRequest {
  sessionId: string
  message: string
  actionId?: MisterActionId
  currentPage?: string
  currentProductId?: string | null
  locale?: MisterLocale
}

/** POST /api/mister/submit request body (v2 — no CIF fields). */
export interface MisterLeadSubmitRequest {
  sessionId: string
  full_name: string
  company?: string
  email: string
  phone: string
}

/** mister_projects Supabase row shape. */
export interface MisterProjectRow {
  id: string
  session_id: string
  archetype: MisterArchetype
  archetype_history: { from: MisterArchetype; to: MisterArchetype; at: string }[]
  stage: MisterStage
  locale: MisterLocale
  current_page: string | null
  current_product_id: string | null
  collected: MisterCollected
  history: { role: 'user' | 'assistant'; content: string }[]
  turn_count: number
  flags: string[]
  in_flight: boolean
  lead_id: string | null
  created_at: string
  updated_at: string
}

/** The fenced control block the model emits at the end of each turn. */
export interface MisterControlBlock {
  quick_actions: MisterQuickAction[]
  surfaces: { type: MisterSurfaceType; ref: string }[]
  state: { archetype: MisterArchetype; stage: MisterStage }
  collected: Partial<MisterCollected>
}

// ─────────────────────────────────────────────────────────────
// SECTION C — Financial layer types (finance.md §8)
// Structural anti-price guarantee: no code path can render an
// absolute currency value because no such field exists.
// ─────────────────────────────────────────────────────────────

/**
 * Disclaimer identifier enum.
 * Every indexed value must carry one of these — required, not optional.
 */
export type DisclaimerId =
  | 'illustrative' // Generic illustrative range
  | 'range'        // Multi-segment range emphasizing no total is binding
  | 'duties'       // Duty rate variance (HS-dependent)
  | 'fx'           // Exchange rate exposure
  | 'handoff'      // Final routing to specialist

/**
 * Single source of truth for all disclaimer strings.
 * Render by resolving id → string at component level.
 * Strings per copywriter.md §7.5 (improved register).
 */
export const DISCLAIMERS: Record<DisclaimerId, string> = {
  illustrative: 'Illustrative index only — not a quotation.',
  range: 'An illustrative index range — not a price, offer, or quotation.',
  duties:
    'Illustrative range. Duty rates are set by SUNAT, not by Wings, and are not guaranteed at any classification.',
  fx: 'Indexed because the real landed cost moves with the exchange rate and the date of your order commitment.',
  handoff: 'Real figures require a Wings specialist and your specific order parameters.',
}

/**
 * A single layer in the landed-cost waterfall.
 *
 * STRUCTURAL ENFORCEMENT:
 * - indexLow and indexHigh are ALWAYS paired; no single-value field exists.
 * - disclaimerId is REQUIRED (not optional).
 * - These constraints make rendering an undisclaimed absolute number
 *   impossible at the TypeScript type level.
 */
export interface WaterfallSegment {
  key: 'product' | 'freight' | 'insurance' | 'duties' | 'lastmile'
  label: string          // Bloomberg-precise label
  indexLow: number       // Lower bound (points on base 100)
  indexHigh: number      // Upper bound (points on base 100)
  driverNote: string     // What moves this segment
  tooltip: string        // Teacher-clear explanation
  disclaimerId: DisclaimerId // Required — no segment without it
}

/**
 * A cost factor that affects one or more waterfall segments.
 */
export interface CostDriver {
  id: string
  label: string
  explanation: string
  impact: 'high' | 'medium' | 'low'
}

/**
 * Computed total band for the waterfall.
 * NEVER accepted as a prop — always computed from segments.
 * No scalar total, no priceInUsd, no totalCif.
 */
export interface WaterfallTotal {
  indexLow: number   // sum of all segment.indexLow
  indexHigh: number  // sum of all segment.indexHigh
  disclaimer: string // Always DISCLAIMERS['handoff']
}

/**
 * The complete waterfall for a single scenario.
 * total is computed internally — never a caller-supplied scalar.
 */
export interface LandedCostWaterfall {
  segments: WaterfallSegment[]
  total: WaterfallTotal // Computed from segments, never passed in
  context?: Record<string, string> // Metadata (incoterm, container, etc.)
}

/**
 * A scenario for index comparison (Option A vs Option B).
 */
export interface ScenarioWaterfall {
  label: string
  segments: WaterfallSegment[]
  context?: Record<string, string>
}

/**
 * Side-by-side comparison view with delta callout.
 * Always exactly 2 scenarios. Delta is an index point difference — never a currency delta.
 */
export interface IndexComparisonView {
  scenarios: [ScenarioWaterfall, ScenarioWaterfall]
  deltaCallout: {
    indexDelta: number  // Absolute difference in total index
    driver: string      // Primary factor (e.g., "container efficiency")
    label: string       // Full explanation of delta
  }
  conclusion: string    // Contextual recommendation (no absolute numbers)
}

/**
 * Display microcopy constants for the waterfall component.
 * Per finance.md §8 + copywriter.md §7.
 */
export const WATERFALL_COPY = {
  header: 'How your landed cost is built — illustrative structure, not a quotation.',
  headerEs: 'Cómo se construye tu costo de internación — estructura ilustrativa, no una cotización.',
  footer:
    'Indexed ranges illustrate cost structure only. They are not a price, a quote, or an offer. For real figures, request a formal quotation.',
  footerEs:
    'Los rangos indexados ilustran únicamente la estructura del costo. No son un precio, una cotización, ni una oferta. Para cifras reales, solicita una cotización formal.',
  microDisclaimer: 'illustrative range — not a quote',
  microDisclaimerEs: 'rango ilustrativo — no es cotización',
} as const

/** Surface event payload shapes (for SSE surface events). */
export interface ProductSurface {
  id: string
  name: string
  category: string
  summary: string
  specs: Record<string, string>
  imageUrl?: string
  slug: string
}

export interface ComparisonSurface {
  products: { id: string; name: string; specs: Record<string, string> }[]
  axes: string[]
}

export interface MoqSurface {
  category: string
  tiers: { minQty: number; description: string }[]
}

export interface DocumentSurface {
  available: boolean
  title?: string
  url?: string
  country: string
  productType: string
}

export interface ContactSurface {
  name: string
  role: string
  whatsapp: string
  email?: string
}

export interface WaterfallSurface {
  segments: WaterfallSegment[]
}

/** Pre-fill context passed to the inline quotation collection form. */
export interface QuotationFormSurface {
  summaryFields?: Record<string, string>
}

export type SurfaceEventPayload =
  | { type: 'product'; payload: ProductSurface }
  | { type: 'comparison'; payload: ComparisonSurface }
  | { type: 'moq'; payload: MoqSurface }
  | { type: 'document'; payload: DocumentSurface }
  | { type: 'contact'; payload: ContactSurface }
  | { type: 'waterfall'; payload: WaterfallSurface }
  | { type: 'specs'; payload: Record<string, string> }
  | { type: 'quotation_form'; payload: QuotationFormSurface }
