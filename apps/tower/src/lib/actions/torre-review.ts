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
import { prepareSend, resolveSendAdapter, runSendOnApprove } from '@/lib/torre/comms/send'
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
  /** Present when the approved artifact was a COMUNICACION — the (mocked) send outcome. A
   *  post-claim FAILED send is surfaced HONESTLY (ok:false + reason), never hidden as absence,
   *  so the operator learns the named side effect didn't happen. */
  sent?:
    | { ok: true; channel: string; to: string; providerId?: string; mocked: boolean }
    | { ok: false; channel: string; to: string; error: string; mocked: boolean }
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

  // ── Side effects are performed by the CLAIM WINNER ONLY ─────────────────────
  // The atomic DRAFT→APPROVED claim (markReviewed) is the SINGLE serialization point: every
  // named side effect happens AFTER it, so a concurrent second approve — or a reject that wins
  // the race — fails the claim and performs NOTHING (no double cost-sheet, no double send, no
  // side effect stranded on a draft that was actually rejected). Only cheap READ-ONLY validation
  // runs before the claim, so an unsendable/mis-configured artifact never claims in the first place.
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
  if (payload.kind === 'HOJA_COSTOS' && !record.laneId) {
    return fail('VALIDATION', 'Falta lane para guardar el costeo / Missing lane')
  }

  const approved = await markReviewed(db, record.id, 'APPROVED', auth.user.id)
  if (!approved) return fail('VALIDATION', 'No se pudo aprobar (¿ya revisado?) / Could not approve')

  // HOJA_COSTOS: persist the cost_calculation — the named side effect — as the claim winner, so
  // a concurrent approve can't persist it twice. If it fails here the draft is already APPROVED;
  // the calc is regenerable from payload.inputs, so we surface the failure honestly rather than
  // pretend the sheet was saved.
  if (payload.kind === 'HOJA_COSTOS' && record.laneId) {
    const saved = await saveCostCalculation({
      laneId: record.laneId,
      label: payload.title,
      inputs: payload.inputs as unknown as ImportInputs,
    })
    if (saved.error) return fail(saved.error.code, saved.error.message, saved.error.details)
  }
  // COTIZACION: recorded on approval; issuance to tower.quotes happens from the Quotations
  // module (composeQuote/issueQuotation) — a separate human step.

  // COMUNICACION: send-on-approve + outbox ledger (L2), winner only. runSendOnApprove sends
  // EXACTLY ONCE (we've won the claim) and writes the ledger BEST-EFFORT — a ledger failure
  // never unwinds the send. The connector is MOCK_CONNECTORS: the adapter RECORDS the send.
  let sent: ApproveTorreResult['sent']
  if (preparedMessage?.ok) {
    const { result } = await runSendOnApprove(
      preparedMessage.message,
      { brandId: record.brandId, laneId: record.laneId, draftId: record.id },
      {
        send: (m) => resolveSendAdapter(m.channel).send(m),
        record: async (row) => db.from('torre_sends').insert(row),
      },
    )
    sent = result.ok
      ? { ok: true, channel: result.channel, to: result.to, providerId: result.providerId, mocked: result.mocked }
      : { ok: false, channel: result.channel, to: result.to, error: result.error ?? 'unknown send error', mocked: result.mocked }
    if (!result.ok) {
      // A real adapter could fail post-claim; the draft is already APPROVED and the FAILED
      // outcome is surfaced to the operator via `sent.ok:false` (+ ledgered). MOCK never fails here.
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
