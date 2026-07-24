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
import { prepareSend, resolveSendAdapter, buildSendRow } from '@/lib/torre/comms/send'
import { corpusRowsFromArtifact } from '@/lib/torre/ingest'
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

  // COMUNICACION: send-on-approve (L2). Order matters for the SACRED side effect:
  //   pre-validate sendability (read-only) → CLAIM the draft (the atomic DRAFT→APPROVED
  //   lock) → send ONLY after claiming. So a concurrent second approve fails the claim
  //   and never sends twice, and a reject that wins the race means the claim fails and
  //   nothing is sent. The connector is MOCK_CONNECTORS — the adapter RECORDS the send.
  let preparedMessage: ReturnType<typeof prepareSend> | null = null
  if (payload.kind === 'COMUNICACION') {
    preparedMessage = prepareSend(payload, record.id)
    if (!preparedMessage.ok) {
      const reason: Record<typeof preparedMessage.reason, string> = {
        'has-blockers': 'La comunicación tiene bloqueos / The message has blockers',
        'no-recipient': 'Falta el destinatario / Missing recipient',
        'empty-body': 'El cuerpo está vacío / The body is empty',
      }
      return fail('VALIDATION', reason[preparedMessage.reason])
    }
  }

  const approved = await markReviewed(db, record.id, 'APPROVED', auth.user.id)
  if (!approved) return fail('VALIDATION', 'No se pudo aprobar (¿ya revisado?) / Could not approve')

  // Now that WE own the approval, perform the send (only the claim winner reaches here).
  let sent: ApproveTorreResult['sent']
  if (preparedMessage?.ok) {
    const result = await resolveSendAdapter(preparedMessage.message.channel).send(preparedMessage.message)

    // Outbox (L2): record EVERY send attempt — SENT or FAILED — for audit + retry. Best-effort
    // and non-blocking: the draft is already APPROVED and the message already left, so a failed
    // ledger write must NEVER unwind that (it would strand an approval with no way back). The
    // UNIQUE(draft_id) index makes this at-most-once even if this path were somehow re-entered.
    try {
      const { error: outboxError } = await db.from('torre_sends').insert(
        buildSendRow(preparedMessage.message, result, {
          brandId: record.brandId,
          laneId: record.laneId,
          draftId: record.id,
        }),
      )
      if (outboxError) console.error('[torre/approve] outbox write failed (non-blocking)', outboxError)
    } catch (e) {
      console.error('[torre/approve] outbox write threw (non-blocking)', e)
    }

    if (result.ok) {
      sent = { channel: result.channel, to: result.to, providerId: result.providerId, mocked: result.mocked }
    } else {
      // A real adapter could fail post-claim; the draft is already APPROVED. Surface it — the
      // outbox row above carries the FAILED status for retry; the mock never reaches this branch.
      console.error('[torre/approve] send failed post-claim', result.error)
    }
  }

  // Learned-on-approval (L6): the approved artifact becomes precedent in the corpus.
  // Best-effort + mock-first — the embedding is null until the embed job runs (keyword
  // retrieval works meanwhile), and a failure here must NEVER unwind an approval. A DRAFT
  // is never ingested (we only reach here after the artifact is APPROVED).
  try {
    const rows = corpusRowsFromArtifact(payload, {
      brandId: record.brandId,
      laneId: record.laneId,
      docId: record.id,
      // approval date = when the content became precedent (drives the recency tiebreak)
      date: (approved.reviewedAt ?? record.createdAt)?.slice(0, 10) ?? null,
      // link the source record so the entity-filter retrieval leg has something to match
      entityRefs: record.refId ? [record.refId] : [],
    })
    if (rows.length) {
      // supabase-js resolves { error } on a Postgres/RLS failure — it does NOT throw, so
      // the error MUST be read or a dead ingest (RLS/constraint drift) goes silent forever.
      const { error: ingestError } = await db.from('knowledge_chunks').insert(rows)
      if (ingestError) console.error('[torre/approve] corpus ingest failed (non-blocking)', ingestError)
    }
  } catch (e) {
    console.error('[torre/approve] corpus ingest threw (non-blocking)', e)
  }

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
