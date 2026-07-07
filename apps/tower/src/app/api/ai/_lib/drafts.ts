// src/app/api/intelligence/_lib/drafts.ts
// Shared helpers for the Intelligence route handlers: persist an AiDraft envelope
// as a tower.ai_drafts row (status DRAFT) and shape typed JSON responses. Routes
// are authenticated and write through the RLS-scoped client — Directive 7: the
// endpoint's job ends at "a reviewable draft exists"; applying it is a separate
// human server action (lib/actions/intelligence.ts).
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { createServerSupabase } from '@/lib/supabase/server'
import { mapDraftRow, type RawAiDraftRow } from '@/lib/actions/intelligence-logic'
import type { AiDraft, AiDraftRecord, DraftKind, DraftPayloadFor } from '@/lib/ai'

export const DRAFT_SELECT_COLS =
  'id,kind,ref_table,ref_id,brand_id,lane_id,payload,confidence,status,model,created_by,created_at,reviewed_by,reviewed_at'

export type TowerClient = ReturnType<SupabaseClient['schema']>

/** Auth gate for Intelligence routes → RLS-scoped `tower` client + the user. */
export async function requireApiUser(): Promise<
  { ok: true; supabase: TowerClient; user: User } | { ok: false; response: Response }
> {
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false, response: jsonError('UNAUTHORIZED', 'Auth no configurado / Auth not configured') }
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, response: jsonError('UNAUTHORIZED', 'Sesión requerida / Session required') }
  return { ok: true, supabase: supabase.schema('tower'), user }
}

export interface InsertDraftInput<K extends DraftKind> {
  kind: K
  refTable: string | null
  refId: string | null
  brandId: string
  laneId: string | null
  envelope: AiDraft<DraftPayloadFor<K>>
  createdBy: string | null
}

/** Insert one pending draft. Returns null on any DB error (never leaks it). */
export async function insertDraft<K extends DraftKind>(
  supabase: TowerClient,
  input: InsertDraftInput<K>,
): Promise<AiDraftRecord<K> | null> {
  const { data, error } = await supabase
    .from('ai_drafts')
    .insert({
      kind: input.kind,
      ref_table: input.refTable,
      ref_id: input.refId,
      brand_id: input.brandId,
      lane_id: input.laneId,
      payload: input.envelope.draft,
      confidence: input.envelope.confidence,
      status: 'DRAFT',
      model: input.envelope.model,
      created_by: input.createdBy,
    })
    .select(DRAFT_SELECT_COLS)
    .single()
  if (error || !data) return null
  return mapDraftRow<K>(data as unknown as RawAiDraftRow)
}

// ── Typed JSON responses ({ data } | { error: { code, message } }) ───────────

export type IntelErrorCode =
  | 'UNAUTHORIZED'
  | 'VALIDATION'
  | 'FORBIDDEN_LANE'
  | 'AI_UNAVAILABLE'
  | 'AI_ERROR'
  | 'INTERNAL'

const STATUS: Record<IntelErrorCode, number> = {
  UNAUTHORIZED: 401,
  VALIDATION: 400,
  FORBIDDEN_LANE: 403,
  AI_UNAVAILABLE: 503,
  AI_ERROR: 502,
  INTERNAL: 500,
}

export function jsonError(code: IntelErrorCode, message: string): Response {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status: STATUS[code],
    headers: { 'content-type': 'application/json' },
  })
}

export function jsonOk(data: unknown, status = 200): Response {
  return new Response(JSON.stringify({ data }), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}
