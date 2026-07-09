'use server'

// src/lib/actions/intelligence.ts
// THE contract W4.C's Intelligence review UI consumes (`import from
// '@/lib/actions/intelligence'`). Keep the exported names + types stable.
//
// Every action is the standard mutation shape: auth → Zod parse → RLS-scoped
// query (result.ts). RLS on tower.ai_drafts is the permission boundary — this
// file never gates with `if (role === …)`.
//
// Directive 7 is the whole point of this module: listing surfaces pending drafts
// with their confidence; approving is a SEPARATE, explicit human action that
// applies the draft to the real record (RFQ lane/stage · account score · a DRAFT
// product — never PUBLISHED) and flips the draft to APPROVED. Nothing here is
// automatic.
import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { fail, ok, type ActionResult } from './result'
import { DRAFT_KINDS, DRAFT_STATUSES, type AiDraftRecord, type DraftKind, type DraftStatus } from '@/lib/ai'
import {
  buildLeadScoreApplyPatch,
  buildSpecExtractProductInsert,
  buildTriageApplyPatch,
  canApproveDraft,
  canRejectDraft,
  mapDraftRow,
  type RawAiDraftRow,
} from './intelligence-logic'

const uuidSchema = z.string().uuid()

const DRAFT_SELECT_COLS =
  'id,kind,ref_table,ref_id,brand_id,lane_id,payload,confidence,status,model,created_by,created_at,reviewed_by,reviewed_at'

// ── Auth gate (mirrors pipeline.ts / catalog.ts) ─────────────────────────────
async function requireUser() {
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false, error: fail('UNAUTHORIZED', 'Auth no configurado / Auth not configured') } as const
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') } as const
  return { ok: true, supabase: supabase.schema('tower'), user } as const
}

type TowerClient = ReturnType<SupabaseClient['schema']>

// ── Listing ──────────────────────────────────────────────────────────────────

const listInputSchema = z.object({
  kind: z.enum(DRAFT_KINDS).optional(),
  laneId: uuidSchema.optional(),
  status: z.enum(DRAFT_STATUSES).default('DRAFT'),
  limit: z.number().int().min(1).max(500).default(200),
})
export type ListDraftsInput = z.input<typeof listInputSchema>

/** Generic pending-draft list. The per-kind wrappers below call this. */
export async function listDrafts(input: ListDraftsInput = {}): Promise<ActionResult<AiDraftRecord[]>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const parsed = listInputSchema.safeParse(input)
  if (!parsed.success) return fail('VALIDATION', 'Filtros inválidos / Invalid filters', parsed.error.flatten().fieldErrors)
  const { kind, laneId, status, limit } = parsed.data

  let query = supabase.from('ai_drafts').select(DRAFT_SELECT_COLS).eq('status', status)
  if (kind) query = query.eq('kind', kind)
  if (laneId) query = query.eq('lane_id', laneId)

  const { data, error } = await query.order('created_at', { ascending: false }).limit(limit)
  if (error) return fail('VALIDATION', 'No se pudieron listar los borradores / Could not list drafts')

  return ok(((data ?? []) as unknown as RawAiDraftRow[]).map((r) => mapDraftRow(r)))
}

// Per-kind wrappers — explicit async functions (a 'use server' module may only
// export async functions at runtime; a factory-built const would not qualify).
export async function listTriageDrafts(laneId?: string): Promise<ActionResult<AiDraftRecord[]>> {
  return listDrafts({ kind: 'TRIAGE', laneId })
}
export async function listLeadScoreDrafts(laneId?: string): Promise<ActionResult<AiDraftRecord[]>> {
  return listDrafts({ kind: 'LEAD_SCORE', laneId })
}
export async function listSpecExtractDrafts(laneId?: string): Promise<ActionResult<AiDraftRecord[]>> {
  return listDrafts({ kind: 'SPEC_EXTRACT', laneId })
}
export async function listBriefDrafts(laneId?: string): Promise<ActionResult<AiDraftRecord[]>> {
  return listDrafts({ kind: 'WEEKLY_BRIEF', laneId })
}

// ── Shared load + review helpers ─────────────────────────────────────────────

async function loadDraft(supabase: TowerClient, id: string): Promise<RawAiDraftRow | null> {
  const { data, error } = await supabase.from('ai_drafts').select(DRAFT_SELECT_COLS).eq('id', id).maybeSingle()
  if (error || !data) return null
  return data as unknown as RawAiDraftRow
}

async function markReviewed(
  supabase: TowerClient,
  id: string,
  status: Extract<DraftStatus, 'APPROVED' | 'REJECTED'>,
  userId: string,
): Promise<RawAiDraftRow | null> {
  const { data, error } = await supabase
    .from('ai_drafts')
    .update({ status, reviewed_by: userId, reviewed_at: new Date().toISOString() })
    .eq('id', id)
    .eq('status', 'DRAFT') // optimistic guard: only a still-pending draft transitions
    .select(DRAFT_SELECT_COLS)
    .single()
  if (error || !data) return null
  return data as unknown as RawAiDraftRow
}

/** Load + validate a pending draft of the expected kind. */
async function requirePendingDraft(
  supabase: TowerClient,
  id: string,
  expectedKind: DraftKind,
): Promise<{ ok: true; row: RawAiDraftRow } | { ok: false; error: ActionResult<never> }> {
  const parsed = uuidSchema.safeParse(id)
  if (!parsed.success) return { ok: false, error: fail('VALIDATION', 'ID inválido / Invalid id') }

  const row = await loadDraft(supabase, parsed.data)
  if (!row) return { ok: false, error: fail('FORBIDDEN_LANE', 'Borrador no encontrado o sin acceso / Draft not found or no access') }
  if (row.kind !== expectedKind)
    return { ok: false, error: fail('VALIDATION', `El borrador no es de tipo ${expectedKind} / Draft is not of kind ${expectedKind}`) }
  if (!canApproveDraft(row.status as DraftStatus))
    return { ok: false, error: fail('STAGE_INVALID', 'El borrador ya fue revisado / Draft already reviewed') }

  return { ok: true, row }
}

// ── Reject (any kind) ─────────────────────────────────────────────────────────

export async function rejectDraft(draftId: string): Promise<ActionResult<AiDraftRecord>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase, user } = gate

  const parsed = uuidSchema.safeParse(draftId)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const row = await loadDraft(supabase, parsed.data)
  if (!row) return fail('FORBIDDEN_LANE', 'Borrador no encontrado o sin acceso / Draft not found or no access')
  if (!canRejectDraft(row.status as DraftStatus)) return fail('STAGE_INVALID', 'El borrador ya fue revisado / Draft already reviewed')

  const updated = await markReviewed(supabase, parsed.data, 'REJECTED', user.id)
  if (!updated) return fail('FORBIDDEN_LANE', 'No se pudo rechazar el borrador / Could not reject the draft')
  return ok(mapDraftRow(updated))
}

// ── Approve · Triage → applies RFQ lane/stage/account ────────────────────────

export async function approveTriage(draftId: string): Promise<ActionResult<AiDraftRecord<'TRIAGE'>>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase, user } = gate

  const guard = await requirePendingDraft(supabase, draftId, 'TRIAGE')
  if (!guard.ok) return guard.error
  const draft = mapDraftRow<'TRIAGE'>(guard.row)

  if (!draft.refId) return fail('VALIDATION', 'El borrador de triage no referencia un RFQ / Triage draft has no RFQ ref')

  const patch = buildTriageApplyPatch(draft.payload)
  const { error: applyError } = await supabase.from('rfqs').update(patch).eq('id', draft.refId)
  if (applyError) return fail('FORBIDDEN_LANE', 'No se pudo aplicar el triage al RFQ / Could not apply triage to the RFQ')

  const updated = await markReviewed(supabase, draft.id, 'APPROVED', user.id)
  if (!updated) return fail('FORBIDDEN_LANE', 'No se pudo aprobar el borrador / Could not approve the draft')
  return ok(mapDraftRow<'TRIAGE'>(updated))
}

// ── Approve · Lead score → writes accounts.score ─────────────────────────────

export async function approveLeadScore(draftId: string): Promise<ActionResult<AiDraftRecord<'LEAD_SCORE'>>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase, user } = gate

  const guard = await requirePendingDraft(supabase, draftId, 'LEAD_SCORE')
  if (!guard.ok) return guard.error
  const draft = mapDraftRow<'LEAD_SCORE'>(guard.row)

  if (!draft.refId) return fail('VALIDATION', 'El borrador no referencia una cuenta / Draft has no account ref')

  const patch = buildLeadScoreApplyPatch(draft.payload)
  const { error: applyError } = await supabase.from('accounts').update(patch).eq('id', draft.refId)
  if (applyError) return fail('FORBIDDEN_LANE', 'No se pudo aplicar el puntaje a la cuenta / Could not apply the score to the account')

  const updated = await markReviewed(supabase, draft.id, 'APPROVED', user.id)
  if (!updated) return fail('FORBIDDEN_LANE', 'No se pudo aprobar el borrador / Could not approve the draft')
  return ok(mapDraftRow<'LEAD_SCORE'>(updated))
}

// ── Approve · Spec extract → writes a DRAFT product (never PUBLISHED) ─────────

export interface ApproveSpecExtractResult {
  draft: AiDraftRecord<'SPEC_EXTRACT'>
  productId: string
}

export async function approveSpecExtract(draftId: string): Promise<ActionResult<ApproveSpecExtractResult>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase, user } = gate

  const guard = await requirePendingDraft(supabase, draftId, 'SPEC_EXTRACT')
  if (!guard.ok) return guard.error
  const draft = mapDraftRow<'SPEC_EXTRACT'>(guard.row)

  const insert = buildSpecExtractProductInsert(draft.payload, { brandId: draft.brandId, createdBy: user.id })
  const { data: product, error: insertError } = await supabase
    .from('products')
    .insert(insert)
    .select('id')
    .single()
  if (insertError || !product) return fail('FORBIDDEN_LANE', 'No se pudo crear el producto borrador / Could not create the draft product')

  const updated = await markReviewed(supabase, draft.id, 'APPROVED', user.id)
  if (!updated) return fail('FORBIDDEN_LANE', 'No se pudo aprobar el borrador / Could not approve the draft')

  return ok({ draft: mapDraftRow<'SPEC_EXTRACT'>(updated), productId: (product as { id: string }).id })
}

// ── Approve · Weekly brief → marks APPROVED (the draft IS the deliverable) ────

export async function approveBrief(draftId: string): Promise<ActionResult<AiDraftRecord<'WEEKLY_BRIEF'>>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase, user } = gate

  const guard = await requirePendingDraft(supabase, draftId, 'WEEKLY_BRIEF')
  if (!guard.ok) return guard.error

  // A brief has no downstream record to write — approval is the director
  // accepting the edited digest. It is never auto-published anywhere.
  const updated = await markReviewed(supabase, guard.row.id, 'APPROVED', user.id)
  if (!updated) return fail('FORBIDDEN_LANE', 'No se pudo aprobar el resumen / Could not approve the brief')
  return ok(mapDraftRow<'WEEKLY_BRIEF'>(updated))
}
