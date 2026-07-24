'use server'
// src/lib/actions/torre-revise.ts
// Mister Torre — the revise action (Loop L1: inline edit + comment-to-revise). Given an
// existing Torre draft and an edited payload, it persists the VERSIONED successor as a
// new ai_drafts DRAFT linked to its predecessor (ref_table='ai_drafts', ref_id=original),
// and returns the semantic diff. Governance: the successor is still a DRAFT (nothing is
// sent/applied — approval remains a separate human action); the money/blockers ride
// through unchanged, so a revision that introduces a blocker is unapprovable like any other.
import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase/server'
import { fail, ok, type ActionResult } from './result'
import { INTELLIGENCE_MODELS } from '@/lib/ai/types'
import { torreArtifactPayloadSchema, isApprovable } from '@/lib/torre/artifacts'
import {
  buildTorreInsert,
  mapTorreDraftRow,
  TORRE_DRAFT_SELECT_COLS,
  type RawTorreDraftRow,
} from '@/lib/torre/drafts'
import { reviseTorreArtifact, type ArtifactChange } from '@/lib/torre/revise'

const inputSchema = z.object({
  /** The draft being revised (its successor links back to it). */
  draftId: z.string().uuid(),
  /** The full edited payload (inline edit result, or a model-proposed revision). */
  edited: z.unknown(),
})
export type ReviseTorreDraftInput = z.infer<typeof inputSchema>

export interface ReviseTorreDraftResult {
  /** The new successor DRAFT id. */
  draftId: string
  /** Its version (predecessor + 1). */
  version: number
  /** What changed old→new. */
  diff: ArtifactChange[]
  /** Whether the successor is approvable (no open blockers). */
  approvable: boolean
}

async function requireUser() {
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false as const, error: fail('UNAUTHORIZED', 'Auth no configurado / Auth not configured') }
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') }
  return { ok: true as const, supabase: supabase.schema('tower'), user }
}

export async function reviseTorreDraft(input: ReviseTorreDraftInput): Promise<ActionResult<ReviseTorreDraftResult>> {
  const parsed = inputSchema.safeParse(input)
  if (!parsed.success) return fail('VALIDATION', 'Entrada inválida / Invalid input')

  const auth = await requireUser()
  if (!auth.ok) return auth.error
  const db = auth.supabase

  // Load the predecessor (RLS-scoped: a draft the operator can't see returns nothing).
  const { data: row } = await db
    .from('ai_drafts')
    .select(TORRE_DRAFT_SELECT_COLS)
    .eq('id', parsed.data.draftId)
    .maybeSingle()
  if (!row) return fail('FORBIDDEN_LANE', 'Borrador no encontrado / Draft not found')
  const original = mapTorreDraftRow(row as unknown as RawTorreDraftRow)
  if (!original) return fail('VALIDATION', 'El borrador no es un artefacto de Torre / Not a Torre artifact')

  // Validate the edit, then produce the versioned successor + diff (pure, tested).
  const editedParsed = torreArtifactPayloadSchema.safeParse(parsed.data.edited)
  if (!editedParsed.success) return fail('VALIDATION', 'La edición no es válida / The edit is invalid')
  if (editedParsed.data.kind !== original.payload.kind) {
    return fail('VALIDATION', 'No se puede cambiar el tipo de artefacto / Cannot change the artifact kind')
  }

  let revision
  try {
    revision = reviseTorreArtifact(original.payload, editedParsed.data)
  } catch {
    return fail('VALIDATION', 'No se pudo generar la revisión / Could not build the revision')
  }

  // Persist the successor as a DRAFT, linked to its predecessor (lineage via ref_id).
  const insertRow = buildTorreInsert(revision.payload, {
    brandId: original.brandId,
    laneId: original.laneId,
    refTable: 'ai_drafts',
    refId: original.id,
    confidence: original.confidence,
    model: INTELLIGENCE_MODELS.reason,
    createdBy: auth.user.id,
  })
  const { data: saved, error } = await db.from('ai_drafts').insert(insertRow).select(TORRE_DRAFT_SELECT_COLS).single()
  if (error || !saved) return fail('FORBIDDEN_LANE', 'No se pudo guardar la revisión / Could not save the revision')
  const successor = mapTorreDraftRow(saved as unknown as RawTorreDraftRow)
  if (!successor) return fail('VALIDATION', 'Revisión inválida / Invalid revision')

  return ok({
    draftId: successor.id,
    version: revision.payload.version,
    diff: revision.diff,
    approvable: isApprovable(revision.payload),
  })
}
