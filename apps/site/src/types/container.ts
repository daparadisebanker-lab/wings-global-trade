// src/types/container.ts
// Shared types for the Contenedor Compartido ("Trae tu grupo") system.
// Mirrors supabase/migrations/20260706000001_shared_container_phase1.sql.
// DB row types are the source-of-truth shapes; view models are what the
// UI organs consume (never let a raw row leak into a client component with
// another member's financials — see lib/container/access.ts scoping).

export type ContainerMode = 'private_group' | 'public_slots' | 'hybrid'

export type ContainerStatus =
  | 'draft'
  | 'filling'
  | 'soft_deadline'
  | 'closed'
  | 'booked'
  | 'sailed'
  | 'arrived'
  | 'cleared'
  | 'delivered'
  | 'cancelled'

export type FallbackPolicy = 'wings_tops_up' | 'extend_once' | 'refund'

export type MemberRole = 'lead' | 'member'

export type SlotStatus =
  | 'invited'
  | 'joined'
  | 'reserved'
  | 'committed'
  | 'paid_in_full'
  | 'released'

// ---------------------------------------------------------------------------
// DB row types
// ---------------------------------------------------------------------------

export interface ContainerRow {
  id: string
  short_code: string
  mode: ContainerMode
  status: ContainerStatus
  route_origin: string
  route_destination: string
  container_type: string
  total_cbm: number
  total_slots: number
  cbm_per_slot: number
  slot_price_usd: number
  overage_per_cbm_usd: number | null
  price_includes: string[]
  fill_deadline: string
  fallback: FallbackPolicy
  lead_ref: string | null
  lead_name: string | null
  hybrid_opened_at: string | null
  landing_slug: string | null
  created_at: string
  updated_at: string
}

export interface ContainerMemberRow {
  id: string
  container_id: string
  member_ref: string
  phone: string | null
  display_name: string | null
  role: MemberRole
  slot_status: SlotStatus
  slots_claimed: number
  cbm_allocated: number | null
  cargo_description: string | null
  cost_share_usd: number | null
  deposit_usd: number
  visibility_opt_in: boolean
  whatsapp_opted_in_at: string | null
  joined_via_invite_id: string | null
  created_at: string
  updated_at: string
}

export interface ContainerInviteRow {
  id: string
  container_id: string
  created_by_ref: string
  token: string
  max_uses: number | null
  uses: number
  revoked_at: string | null
  expires_at: string | null
  created_at: string
}

export type InviteEventKind = 'opened' | 'wa_started' | 'account_created' | 'slot_reserved'

export interface MilestoneRow {
  id: string
  container_id: string
  milestone: ContainerStatus
  occurred_at: string
  note: string | null
  document_url: string | null
}

export type PaymentKind = 'deposit' | 'balance' | 'adjustment' | 'refund'
export type PaymentStatus = 'pending' | 'confirmed' | 'refunded'

export interface MemberPaymentRow {
  id: string
  member_id: string
  kind: PaymentKind
  amount_usd: number
  status: PaymentStatus
  proof_url: string | null
  created_at: string
}

export type DocumentStatus = 'pending' | 'approved' | 'rejected'

export interface MemberDocumentRow {
  id: string
  member_id: string
  doc_type: string
  url: string
  status: DocumentStatus
  created_at: string
}

// ---------------------------------------------------------------------------
// Derived / view models (what the UI consumes)
// ---------------------------------------------------------------------------

/** Slot accounting for the FillMeter — mirrors container_slot_counts(). */
export interface SlotCounts {
  committed: number // solid segments
  reserved: number // hatched segments
  open: number // outline segments
  total: number
}

/** Everything the public invite/landing preview needs — no member financials. */
export interface ContainerPreview {
  shortCode: string
  mode: ContainerMode
  status: ContainerStatus
  routeOrigin: string
  routeDestination: string
  containerType: string
  slotPriceUsd: number
  priceIncludes: string[]
  fillDeadline: string
  fallback: FallbackPolicy
  cbmPerSlot: number
  overagePerCbmUsd: number | null
  leadName: string | null
  slots: SlotCounts
}

/** The milestone stepper's canonical order (spec §4.2-B). */
export const MILESTONE_ORDER: ContainerStatus[] = [
  'closed',
  'booked',
  'sailed',
  'arrived',
  'cleared',
  'delivered',
]

/** ES labels for the milestone stepper. */
export const MILESTONE_LABELS_ES: Record<ContainerStatus, string> = {
  draft: 'Configurando',
  filling: 'Llenando',
  soft_deadline: 'Cierre próximo',
  closed: 'Cerrado',
  booked: 'Reservado',
  sailed: 'Zarpó',
  arrived: 'Llegó a destino',
  cleared: 'Nacionalizado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

export const FALLBACK_LABELS_ES: Record<FallbackPolicy, string> = {
  wings_tops_up: 'Wings completa el contenedor con inventario propio.',
  extend_once: 'Ampliamos el plazo una vez; si no cierra, te devolvemos tu depósito.',
  refund: 'Te devolvemos tu depósito completo.',
}
