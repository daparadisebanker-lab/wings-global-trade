// src/lib/actions/containers-types.ts
// Runtime constants + row types shared by the Container Desk server actions
// (containers.ts) and client components. Kept out of containers.ts
// deliberately: a `'use server'` file may only export async functions (see
// media-types.ts's identical rationale from Wave 2).
export const CONTAINER_KINDS = ['20GP', '40GP', '40HC', 'REEFER'] as const
export type ContainerKind = (typeof CONTAINER_KINDS)[number]

export const CONTAINER_MODES = ['DEDICATED', 'SHARED'] as const
export type ContainerMode = (typeof CONTAINER_MODES)[number]

/** DATABASE_SCHEMA.sql `containers.status` check constraint, in pipeline order. */
export const CONTAINER_STATUSES = [
  'OPEN',
  'FILLING',
  'BOOKED',
  'IN_TRANSIT',
  'ARRIVED',
  'CLEARED',
  'CLOSED',
] as const
export type ContainerStatus = (typeof CONTAINER_STATUSES)[number]

export const COMMITMENT_STATUSES = ['RESERVED', 'CONFIRMED', 'LOADED', 'RELEASED'] as const
export type CommitmentStatus = (typeof COMMITMENT_STATUSES)[number]

/** CBM committed against a container's capacity — RELEASED commitments free
 * their volume back (CLAUDE.md capacity law: "committed CBM (sum of its
 * commitments in RESERVED/CONFIRMED/LOADED)"). Mirrors the SQL function's
 * status filter exactly — the two must never drift apart. */
export const CBM_BEARING_COMMITMENT_STATUSES: CommitmentStatus[] = ['RESERVED', 'CONFIRMED', 'LOADED']

/** DATABASE_SCHEMA.sql `purchase_orders.status` check constraint, in flow order. */
export const PO_STATUSES = [
  'ISSUED',
  'CONFIRMED',
  'IN_PRODUCTION',
  'QC_PENDING',
  'QC_PASSED',
  'SHIPPED',
  'CANCELLED',
] as const
export type PoStatus = (typeof PO_STATUSES)[number]

export const QC_RESULTS = ['PASS', 'FAIL', 'CONDITIONAL'] as const
export type QcResult = (typeof QC_RESULTS)[number]

/** `trade_documents.kind` — free text in the schema; this is TOWER's closed
 * vocabulary for the DocumentVault's completeness checklist (COMPONENT_TREE
 * "completeness checklist"). New kinds may be added without a migration. */
export const DOCUMENT_KINDS = ['BL', 'PACKING_LIST', 'CO', 'PHYTO', 'INVOICE', 'CERT'] as const
export type DocumentKind = (typeof DOCUMENT_KINDS)[number]

/** Private storage bucket for trade documents — see components/containers/README.md
 * for the exact spec the Conductor provisions this against. */
export const TRADE_DOCUMENTS_BUCKET = 'trade-documents'

export interface ContainerRow {
  id: string
  brandId: string
  laneId: string
  laneCode: string
  laneSlug: string
  code: string
  kind: ContainerKind
  capacityCbm: number
  mode: ContainerMode
  status: ContainerStatus
  route: { origin?: string; destination?: string; etd?: string; eta?: string }
  publicFillVisible: boolean
  createdAt: string
  /** Sum of RESERVED/CONFIRMED/LOADED commitments — computed, not stored. */
  committedCbm: number
  /** 0–100, rounded — computed via containers-logic#computeFillPercent. */
  fillPercent: number
}

export interface ContainerCommitmentRow {
  id: string
  containerId: string
  orderId: string | null
  accountId: string | null
  accountName: string | null
  cbm: number
  status: CommitmentStatus
  createdAt: string
}

export interface PurchaseOrderRow {
  id: string
  containerId: string | null
  supplierId: string
  supplierName: string | null
  laneId: string
  lines: unknown
  totalMinor: number
  currency: string
  status: PoStatus
}

export interface QcCheckRow {
  id: string
  purchaseOrderId: string
  checkpoint: string
  result: QcResult | null
  evidence: unknown[]
  checkedBy: string | null
  checkedAt: string | null
}

export interface TradeDocumentRow {
  id: string
  containerId: string | null
  orderId: string | null
  kind: string
  storagePath: string
  uploadedBy: string | null
  uploadedAt: string
  /** Signed read URL, issued at request time (private bucket — never a public path). */
  signedUrl: string | null
}

export interface LandedCostRow {
  containerId: string
  fobMinor: number
  freightMinor: number
  insuranceMinor: number
  dutiesMinor: number
  handlingMinor: number
  currency: string
  totalMinor: number
  computedAt: string
}
