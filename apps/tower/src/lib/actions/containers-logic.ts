// src/lib/actions/containers-logic.ts
// Pure, dependency-free logic for the Container Desk (ERP) — Wave 3. Split out
// of containers.ts for the same reason catalog-logic.ts is split from
// catalog.ts: a `'use server'` file may only export async functions, and pure
// state-machine/math logic is testable without mocking Supabase.
import { addMinor, type Money } from '@/lib/money'
import {
  CBM_BEARING_COMMITMENT_STATUSES,
  CONTAINER_STATUSES,
  PO_STATUSES,
  type CommitmentStatus,
  type ContainerStatus,
  type PoStatus,
} from './containers-types'

// ── Capacity & fill math (mirrors the SQL function's read-side; the SQL
// function in migration/wave3-container.sql is the sole ENFORCEMENT point —
// this is presentation/optimistic-UI math only, never the real gate) ────────

/** Sum CBM across commitments that actually hold container volume
 * (RESERVED/CONFIRMED/LOADED — RELEASED gives its volume back). */
export function sumCommittedCbm(commitments: { cbm: number; status: CommitmentStatus }[]): number {
  return commitments
    .filter((c) => CBM_BEARING_COMMITMENT_STATUSES.includes(c.status))
    .reduce((total, c) => total + c.cbm, 0)
}

/** 0–100, clamped, rounded to 2 decimals. Zero/negative capacity → 0 (never
 * divide by zero, never a negative or >100 figure the FillBar has to clamp itself). */
export function computeFillPercent(committedCbm: number, capacityCbm: number): number {
  if (!(capacityCbm > 0)) return 0
  const pct = (committedCbm / capacityCbm) * 100
  const clamped = Math.min(100, Math.max(0, pct))
  return Math.round(clamped * 100) / 100
}

/** Client-side optimistic hint mirroring the SQL function's guard
 * (`committed + incoming > capacity`). The atomic truth is the row-locked SQL
 * check — this only lets the UI show "over capacity" before the round trip. */
export function wouldExceedCapacity(committedCbm: number, capacityCbm: number, incomingCbm: number): boolean {
  return committedCbm + incomingCbm > capacityCbm
}

// ── Container code issuance (append-only, never reused — CLAUDE.md
// Directive 4) ───────────────────────────────────────────────────────────────

/** `{laneCode}-C{seq}`, e.g. `WGT/02-C014`. `existingCount` is the count of
 * containers already issued for the lane (any status, since codes are
 * append-only and never reused even for a container that never opened). */
export function computeNextContainerCode(laneCode: string, existingCount: number): string {
  const seq = String(existingCount + 1).padStart(3, '0')
  return `${laneCode}-C${seq}`
}

// ── Container status pipeline (OPEN→FILLING→BOOKED→IN_TRANSIT→ARRIVED→
// CLEARED→CLOSED). Forward-only, no skipping backward, no re-opening a
// CLOSED container — the public FillMeter's state (ADR-4-style: state is the
// truth) must never move backward under an operator's fingers. ─────────────

const CONTAINER_ORDER: Record<ContainerStatus, number> = Object.fromEntries(
  CONTAINER_STATUSES.map((s, i) => [s, i]),
) as Record<ContainerStatus, number>

export function canTransitionContainerStatus(from: ContainerStatus, to: ContainerStatus): boolean {
  return CONTAINER_ORDER[to] > CONTAINER_ORDER[from]
}

// ── Purchase-order status pipeline. CANCELLED is reachable from any
// non-terminal state (never from SHIPPED — a shipped PO is history, not
// cancellable); forward progression otherwise never skips backward. ────────

const PO_FLOW = PO_STATUSES.filter((s) => s !== 'CANCELLED')
const PO_ORDER: Record<Exclude<PoStatus, 'CANCELLED'>, number> = Object.fromEntries(
  PO_FLOW.map((s, i) => [s, i]),
) as Record<Exclude<PoStatus, 'CANCELLED'>, number>

export function canAdvancePoStatus(from: PoStatus, to: PoStatus): boolean {
  if (from === 'CANCELLED' || from === 'SHIPPED') return false
  if (to === 'CANCELLED') return true
  return PO_ORDER[to as Exclude<PoStatus, 'CANCELLED'>] > PO_ORDER[from as Exclude<PoStatus, 'CANCELLED'>]
}

// ── Landed cost (ADR-7: integer minor units, server-computed only). Sums
// through lib/money#addMinor — the ONLY money-math module — rather than
// re-implementing summation here. ───────────────────────────────────────────

export interface LandedCostInputsMinor {
  fobMinor: number
  freightMinor: number
  insuranceMinor: number
  dutiesMinor: number
  handlingMinor: number
  currency: string
}

export function computeLandedCostTotal(input: LandedCostInputsMinor): Money {
  return addMinor([
    { minor: input.fobMinor, currency: input.currency },
    { minor: input.freightMinor, currency: input.currency },
    { minor: input.insuranceMinor, currency: input.currency },
    { minor: input.dutiesMinor, currency: input.currency },
    { minor: input.handlingMinor, currency: input.currency },
  ])
}

/** Landed cost ÷ a quantity (committed CBM, unit count, …), integer minor,
 * rounded to the nearest minor unit. NOTE: `lib/money.ts` (ADR-7's single
 * money-math module) only exposes multiply-and-round (`lineTotalMinor`) and
 * sum (`addMinor`) — no division helper exists there yet. This mirrors
 * `lineTotalMinor`'s exact rounding convention (`Math.round`) rather than
 * duplicating a divergent one; flagged for the Conductor to consider
 * promoting to money.ts if a later wave needs the same division. */
export function landedCostPerUnitMinor(totalMinor: number, quantity: number): number {
  if (!Number.isInteger(totalMinor)) throw new Error(`landedCostPerUnitMinor: non-integer total ${totalMinor}`)
  if (!(quantity > 0)) throw new Error(`landedCostPerUnitMinor: quantity must be > 0, got ${quantity}`)
  return Math.round(totalMinor / quantity)
}

/** Parses a user-typed decimal money string ("1250.5") into integer minor
 * units (125050) for a 2-decimal currency — the ONE parse step every
 * Container Desk money form (CostSheet, POPanel) needs before calling a
 * server action, since `lib/money.ts` itself has no string→minor parser (only
 * arithmetic on already-integer minor values). Returns null for anything that
 * isn't a plain non-negative decimal — callers show a validation message
 * rather than send `NaN` toward the wire. Kept here (not money.ts) because
 * this file, unlike money.ts, is Wave-3-owned. */
export function parseDecimalToMinor(input: string): number | null {
  const trimmed = input.trim()
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null
  return Math.round(Number(trimmed) * 100)
}

// ── Capabilities (presentation-only — mirrors catalog-logic.ts's
// computeCapabilities pattern; RLS + the commit_container_cbm SQL function's
// own has_lane_role check re-verify every mutation regardless of this). CLAUDE.md
// core law: "containers/purchase_orders/qc/documents/landed_costs are
// TRADE_OPS + LANE_DIRECTOR write; commitments TRADE_OPS/SALES/LANE_DIRECTOR." ──

export type DbLaneRole = 'LANE_DIRECTOR' | 'CATALOG_EDITOR' | 'TRADE_OPS' | 'SALES' | 'VIEWER'

export interface ContainerCapabilities {
  /** Open containers, issue POs, record QC, upload documents, compute landed cost. */
  canWrite: boolean
  /** Commit CBM against a container (wider role set than the rest of Container Desk). */
  canCommit: boolean
}

const NO_CAPABILITIES: ContainerCapabilities = { canWrite: false, canCommit: false }

export function computeContainerCapabilities(roles: DbLaneRole[], isGroupAdmin: boolean): ContainerCapabilities {
  if (!isGroupAdmin && roles.length === 0) return NO_CAPABILITIES
  const canWrite = isGroupAdmin || roles.includes('LANE_DIRECTOR') || roles.includes('TRADE_OPS')
  const canCommit = canWrite || roles.includes('SALES')
  return { canWrite, canCommit }
}

// Cursor pagination lives in ./containers-cursor.ts (Buffer-touching code
// kept out of this file — see that file's header for why).

/** Storage path convention for trade documents (see
 * components/containers/README.md for the bucket spec this assumes). */
export function buildTradeDocumentStoragePath(input: {
  brandSlug: string
  laneSlug: string
  containerCode: string
  kind: string
  fileName: string
}): string {
  const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase()
  const safeCode = input.containerCode.replace(/[^a-zA-Z0-9._-]/g, '-')
  const stamp = Date.now()
  return `${input.brandSlug}/${input.laneSlug}/${safeCode}/${input.kind.toLowerCase()}/${stamp}-${safeName}`
}
