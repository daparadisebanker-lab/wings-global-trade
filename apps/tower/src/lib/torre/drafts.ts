// src/lib/torre/drafts.ts
// Mister Torre — the typed layer over tower.ai_drafts for Torre artifact kinds
// (HOJA_COSTOS · COTIZACION · COMUNICACION). It writes/reads the SAME table as the
// existing Intelligence drafts (TRIAGE/LEAD_SCORE/SPEC_EXTRACT/WEEKLY_BRIEF) but
// carries its own kind union + payload typing, so lib/ai/types.ts stays untouched
// and the existing kind-filtered queries never see Torre rows by accident.
//
// The DB kind CHECK is broadened additively in migration tower_48. Row insert +
// audit + append-only + RLS all come free from the ai_drafts table (Directive 7/4/6).
import type {
  TorreArtifactKind,
  TorreArtifactPayload,
  HojaCostosPayload,
  CotizacionPayload,
  ComunicacionPayload,
} from './artifacts'
import { parseTorreArtifact } from './artifacts'

// Model tier stamped on the row's `model` column (the run's reasoning model).
export type { TorreArtifactKind, TorreArtifactPayload } from './artifacts'

/** Payload type for a Torre kind (mirror of the discriminated union). */
export type TorrePayloadFor<K extends TorreArtifactKind> = K extends 'HOJA_COSTOS'
  ? HojaCostosPayload
  : K extends 'COTIZACION'
    ? CotizacionPayload
    : K extends 'COMUNICACION'
      ? ComunicacionPayload
      : never

/** The raw tower.ai_drafts row (snake_case) as PostgREST returns it. */
export interface RawTorreDraftRow {
  id: string
  kind: string
  ref_table: string | null
  ref_id: string | null
  brand_id: string
  lane_id: string | null
  payload: unknown
  confidence: number | string
  status: string
  model: string
  created_by: string | null
  created_at: string
  reviewed_by: string | null
  reviewed_at: string | null
}

export type TorreDraftStatus = 'DRAFT' | 'APPROVED' | 'REJECTED'

/** A Torre draft mapped to camelCase with a validated, typed payload. */
export interface TorreDraftRecord<K extends TorreArtifactKind = TorreArtifactKind> {
  id: string
  kind: K
  refTable: string | null
  refId: string | null
  brandId: string
  laneId: string | null
  payload: TorrePayloadFor<K>
  confidence: number
  status: TorreDraftStatus
  model: string
  createdBy: string | null
  createdAt: string
  reviewedBy: string | null
  reviewedAt: string | null
}

function clamp01(v: number | string): number {
  const n = typeof v === 'string' ? Number(v) : v
  if (!Number.isFinite(n)) return 0
  return Math.min(1, Math.max(0, n))
}

/**
 * PURE: map a raw ai_drafts row into a typed Torre record, VALIDATING the payload
 * against the artifact schema. Returns null when the row isn't a Torre artifact or
 * its payload fails validation — the caller drops it rather than render garbage.
 */
export function mapTorreDraftRow(raw: RawTorreDraftRow): TorreDraftRecord | null {
  const payload = parseTorreArtifact(raw.payload)
  if (!payload) return null
  const status: TorreDraftStatus =
    raw.status === 'APPROVED' || raw.status === 'REJECTED' ? raw.status : 'DRAFT'
  return {
    id: raw.id,
    kind: payload.kind,
    refTable: raw.ref_table,
    refId: raw.ref_id,
    brandId: raw.brand_id,
    laneId: raw.lane_id,
    payload,
    confidence: clamp01(raw.confidence),
    status,
    model: raw.model,
    createdBy: raw.created_by,
    createdAt: raw.created_at,
    reviewedBy: raw.reviewed_by,
    reviewedAt: raw.reviewed_at,
  }
}

/** The snake_case insert object for one Torre draft (status forced to DRAFT). */
export interface TorreDraftInsert {
  kind: TorreArtifactKind
  ref_table: string | null
  ref_id: string | null
  brand_id: string
  lane_id: string | null
  payload: TorreArtifactPayload
  confidence: number
  status: 'DRAFT'
  model: string
  created_by: string | null
}

export interface BuildInsertOpts {
  brandId: string
  laneId: string | null
  refTable?: string | null
  refId?: string | null
  confidence: number
  model: string
  createdBy: string | null
}

/** PURE: assemble the ai_drafts insert row for a Torre artifact payload. */
export function buildTorreInsert(payload: TorreArtifactPayload, opts: BuildInsertOpts): TorreDraftInsert {
  return {
    kind: payload.kind,
    ref_table: opts.refTable ?? null,
    ref_id: opts.refId ?? null,
    brand_id: opts.brandId,
    lane_id: opts.laneId,
    payload,
    confidence: Math.min(1, Math.max(0, opts.confidence)),
    status: 'DRAFT',
    model: opts.model,
    created_by: opts.createdBy,
  }
}

export const TORRE_DRAFT_SELECT_COLS =
  'id,kind,ref_table,ref_id,brand_id,lane_id,payload,confidence,status,model,created_by,created_at,reviewed_by,reviewed_at'
