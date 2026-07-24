'use server'
// src/lib/actions/torre-review.ts
// The review side of Mister Torre (spec-torre/03 lifecycle: draft → review →
// approved → [side effect]). Mirrors lib/actions/intelligence.ts.
//
// Constitution enforced here:
//  · An artifact with OPEN BLOCKERS cannot be approved (canApproveTorre).
//  · Approval performs the EXACT side effect named on the control (approveSideEffect):
//    HOJA_COSTOS → persists a cost_calculation; COTIZACION → recorded (issued from
//    Quotations); COMUNICACION → connector is MOCKED (no real send in v1).
//  · Only a still-pending DRAFT transitions (optimistic .eq('status','DRAFT') guard).
//  · Runs in the operator's RLS context; the audit trigger logs the transition.
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServerSupabase } from '@/lib/supabase/server'
import { fail, ok, type ActionResult } from './result'
import { saveCostCalculation } from './costing'
import {
  TORRE_ARTIFACT_KINDS,
  parseTorreArtifact,
} from '@/lib/torre/artifacts'
import { canApproveTorre, approveSideEffect, blockedReason, type Localized } from '@/lib/torre/review-logic'
import {
  mapTorreDraftRow,
  TORRE_DRAFT_SELECT_COLS,
  type RawTorreDraftRow,
  type TorreDraftRecord,
  type TorreDraftStatus,
} from '@/lib/torre/drafts'
import { prepareSend, resolveSendAdapter } from '@/lib/torre/comms/send'
import type { ImportInputs } from '@/lib/costing/types'

const uuid = z.string().uuid()

async function requireUser() {
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false as const, error: fail('UNAUTHORIZED', 'Auth no configurado / Auth not configured') }
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') }
  return { ok: true as const, supabase: supabase.schema('tower'), user }
}

export interface ListTorreDraftsInput {
  laneId?: string
  status?: TorreDraftStatus
}

/** List Torre artifacts (default: pending DRAFTs), newest first, RLS-scoped. */
export async function listTorreDrafts(input: ListTorreDraftsInput = {}): Promise<ActionResult<TorreDraftRecord[]>> {
  const auth = await requireUser()
  if (!auth.ok) return auth.error
  const status = input.status ?? 'DRAFT'
  let query = auth.supabase
    .from('ai_drafts')
    .select(TORRE_DRAFT_SELECT_COLS)
    .in('kind', TORRE_ARTIFACT_KINDS as unknown as string[])
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(100)
  if (input.laneId) {
    const parsed = uuid.safeParse(input.laneId)
    if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')
    query = query.eq('lane_id', parsed.data)
  }
  const { data, error } = await query
  if (error) return fail('FORBIDDEN_LANE', 'No se pudo listar / Could not list')
  const rows = ((data ?? []) as unknown as RawTorreDraftRow[]).map(mapTorreDraftRow).filter((r): r is TorreDraftRecord => r !== null)
  return ok(rows)
}

export interface ApproveTorreResult {
  record: TorreDraftRecord
  sideEffect: Localized
  /** Present when the approved artifact was a COMUNICACION — the (mocked) send outcome. */
  sent?: { channel: string; to: string; providerId?: string; mocked: boolean }
}

/** Approve a Torre draft — gated by blockers; performs the named side effect. */
export async function approveTorreDraft(draftId: string): Promise<ActionResult<ApproveTorreResult>> {
  const parsed = uuid.safeParse(draftId)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')
  const auth = await requireUser()
  if (!auth.ok) return auth.error
  const db = auth.supabase

  const { data: raw } = await db.from('ai_drafts').select(TORRE_DRAFT_SELECT_COLS).eq('id', parsed.data).maybeSingle()
  if (!raw) return fail('FORBIDDEN_LANE', 'Borrador no encontrado / Draft not found')
  const record = mapTorreDraftRow(raw as unknown as RawTorreDraftRow)
  if (!record) return fail('VALIDATION', 'No es un artefacto Torre / Not a Torre artifact')
  if (record.status !== 'DRAFT') return fail('VALIDATION', 'Ya revisado / Already reviewed')

  const payload = parseTorreArtifact(record.payload)
  if (!payload) return fail('VALIDATION', 'Artefacto inválido / Invalid artifact')
  if (!canApproveTorre(payload)) {
    return fail('VALIDATION', blockedReason(payload, 'es') ?? 'Con bloqueos / Has blockers')
  }

  // ── The named side effect ──────────────────────────────────────────────────
  if (payload.kind === 'HOJA_COSTOS') {
    if (!record.laneId) return fail('VALIDATION', 'Falta lane para guardar el costeo / Missing lane')
    const saved = await saveCostCalculation({
      laneId: record.laneId,
      label: payload.title,
      inputs: payload.inputs as unknown as ImportInputs,
    })
    if (saved.error) return fail(saved.error.code, saved.error.message, saved.error.details)
  }
  // COTIZACION: recorded on approval; issuance to tower.quotes happens from the
  // Quotations module (composeQuote/issueQuotation) — a separate human step.
  // COMUNICACION: send-on-approve (L2). The connector is MOCK_CONNECTORS — the adapter
  // RECORDS the send instead of performing it. prepareSend re-gates (no send without a
  // recipient / non-empty body / zero blockers); a message that can't be sent is not
  // approved (the named side effect must be performable).
  let sent: ApproveTorreResult['sent']
  if (payload.kind === 'COMUNICACION') {
    const prepared = prepareSend(payload)
    if (!prepared.ok) {
      const reason: Record<typeof prepared.reason, string> = {
        'has-blockers': 'La comunicación tiene bloqueos / The message has blockers',
        'no-recipient': 'Falta el destinatario / Missing recipient',
        'empty-body': 'El cuerpo está vacío / The body is empty',
      }
      return fail('VALIDATION', reason[prepared.reason])
    }
    const result = await resolveSendAdapter(prepared.message.channel).send(prepared.message)
    if (!result.ok) return fail('VALIDATION', 'No se pudo enviar / Could not send')
    sent = { channel: result.channel, to: result.to, providerId: result.providerId, mocked: result.mocked }
  }

  const approved = await markReviewed(db, record.id, 'APPROVED', auth.user.id)
  if (!approved) return fail('VALIDATION', 'No se pudo aprobar (¿ya revisado?) / Could not approve')
  return ok({ record: approved, sideEffect: approveSideEffect(payload), sent })
}

/** Reject a Torre draft (append-only: status flips, row is kept). */
export async function rejectTorreDraft(draftId: string): Promise<ActionResult<TorreDraftRecord>> {
  const parsed = uuid.safeParse(draftId)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')
  const auth = await requireUser()
  if (!auth.ok) return auth.error
  const rejected = await markReviewed(auth.supabase, parsed.data, 'REJECTED', auth.user.id)
  if (!rejected) return fail('VALIDATION', 'No se pudo rechazar / Could not reject')
  return ok(rejected)
}

type TowerDb = ReturnType<SupabaseClient['schema']>

async function markReviewed(
  db: TowerDb,
  id: string,
  status: Extract<TorreDraftStatus, 'APPROVED' | 'REJECTED'>,
  userId: string,
): Promise<TorreDraftRecord | null> {
  const { data, error } = await db
    .from('ai_drafts')
    .update({ status, reviewed_by: userId, reviewed_at: new Date().toISOString() })
    .eq('id', id)
    .eq('status', 'DRAFT') // optimistic guard: only a still-pending draft transitions
    .select(TORRE_DRAFT_SELECT_COLS)
    .single()
  if (error || !data) return null
  return mapTorreDraftRow(data as unknown as RawTorreDraftRow)
}
