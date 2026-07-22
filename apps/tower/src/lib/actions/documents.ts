'use server'

// Documents / Drive hub data layer (tower_47). A per-brand (optionally per-lane)
// store for spec sheets, supplier docs, certificates, and saved quotations —
// what Mister will pull from (Slice 3D). Mirrors media.ts's storage model: the
// `lane-documents` bucket is private with no storage RLS; the caller is
// authorized against the shipped predicates, then a signed URL is minted with
// the service role. The documents table carries its own RLS (tower_47).

import { z } from 'zod'
import { createServerSupabase, createServiceClient } from '@/lib/supabase/server'
import { ok, fail, type ActionResult } from './result'
import {
  mapDocumentRow,
  sanitizeFileName,
  DOCUMENT_KINDS,
  DOCUMENT_SELECT,
  DOCUMENTS_BUCKET,
  type DocumentKind,
  type DocumentListItem,
  type RawDocumentRow,
} from './documents-logic'

const uuidSchema = z.string().uuid()

async function requireUser() {
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') } as const
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') } as const
  return { ok: true, supabase: supabase.schema('tower'), user } as const
}

// ── List ─────────────────────────────────────────────────────────────────────
export async function listDocuments(): Promise<ActionResult<DocumentListItem[]>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error

  const { data, error } = await gate.supabase
    .from('documents')
    .select(DOCUMENT_SELECT)
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) return fail('VALIDATION', 'No se pudieron listar los documentos / Could not list documents')
  return ok(((data ?? []) as unknown as RawDocumentRow[]).map(mapDocumentRow))
}

/**
 * Search the drive (RLS-scoped) — a title ILIKE, optionally filtered by kind.
 * The seam Mister reads through (Slice 3D). Bounded to 8 hits.
 */
export async function searchDocuments(
  query: string,
  kind?: DocumentKind | null,
): Promise<ActionResult<DocumentListItem[]>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error

  let q = gate.supabase
    .from('documents')
    .select(DOCUMENT_SELECT)
    .order('created_at', { ascending: false })
    .limit(8)

  const trimmed = (query ?? '').trim()
  if (trimmed) q = q.ilike('title', `%${trimmed}%`)
  if (kind) q = q.eq('kind', kind)

  const { data, error } = await q
  if (error) return fail('VALIDATION', 'No se pudo buscar en el drive / Could not search the drive')
  return ok(((data ?? []) as unknown as RawDocumentRow[]).map(mapDocumentRow))
}

// ── Upload URL (service-role signed, after a read-authorization) ─────────────
const uploadInputSchema = z.object({
  brandId: uuidSchema,
  kind: z.enum(DOCUMENT_KINDS),
  fileName: z.string().trim().min(1).max(200),
  laneId: uuidSchema.nullable().optional(),
})
export type CreateDocumentUploadInput = z.input<typeof uploadInputSchema>

export interface DocumentUploadTicket {
  path: string
  token: string
  signedUrl: string
  bucket: string
}

export async function createDocumentUploadUrl(
  input: CreateDocumentUploadInput,
): Promise<ActionResult<DocumentUploadTicket>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const parsed = uploadInputSchema.safeParse(input)
  if (!parsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data')

  // Authorize: the caller must be able to SEE the brand (RLS read). The real
  // write gate is the RLS insert at attachDocument — an unattached upload is an
  // orphan the store never surfaces.
  const { data: brand, error: brandError } = await gate.supabase
    .from('brands')
    .select('id')
    .eq('id', parsed.data.brandId)
    .maybeSingle()
  if (brandError || !brand) {
    return fail('FORBIDDEN_LANE', 'Marca no encontrada o sin acceso / Brand not found or no access')
  }

  const path = `docs/${parsed.data.brandId}/${parsed.data.laneId ?? '_'}/${parsed.data.kind}/${Date.now()}-${sanitizeFileName(parsed.data.fileName)}`

  const service = createServiceClient()
  if (!service) return fail('UNAUTHORIZED', 'Servicio no configurado / Service not configured')

  const { data, error } = await service.storage.from(DOCUMENTS_BUCKET).createSignedUploadUrl(path)
  if (error || !data) return fail('VALIDATION', 'No se pudo generar la URL de carga / Could not create the upload URL')

  return ok({ path: data.path, token: data.token, signedUrl: data.signedUrl, bucket: DOCUMENTS_BUCKET })
}

// ── Attach (the real write — RLS insert = has_brand_role) ────────────────────
const attachInputSchema = z.object({
  brandId: uuidSchema,
  laneId: uuidSchema.nullable().optional(),
  title: z.string().trim().min(1).max(300),
  kind: z.enum(DOCUMENT_KINDS),
  storagePath: z.string().trim().min(1).max(500),
  mimeType: z.string().trim().max(200).nullable().optional(),
  sizeBytes: z.number().int().nonnegative().nullable().optional(),
})
export type AttachDocumentInput = z.input<typeof attachInputSchema>

export async function attachDocument(input: AttachDocumentInput): Promise<ActionResult<DocumentListItem>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const parsed = attachInputSchema.safeParse(input)
  if (!parsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data')

  const { data, error } = await gate.supabase
    .from('documents')
    .insert({
      brand_id: parsed.data.brandId,
      lane_id: parsed.data.laneId ?? null,
      title: parsed.data.title,
      kind: parsed.data.kind,
      storage_path: parsed.data.storagePath,
      mime_type: parsed.data.mimeType ?? null,
      size_bytes: parsed.data.sizeBytes ?? null,
      uploaded_by: gate.user.id,
    })
    .select(DOCUMENT_SELECT)
    .single()

  if (error || !data) return fail('FORBIDDEN_LANE', 'No se pudo guardar el documento / Could not save the document')
  return ok(mapDocumentRow(data as unknown as RawDocumentRow))
}

// ── Signed download URL (after an RLS read of the row) ───────────────────────
export async function getDocumentUrl(documentId: string): Promise<ActionResult<{ url: string }>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const parsed = uuidSchema.safeParse(documentId)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const { data: row, error: readError } = await gate.supabase
    .from('documents')
    .select('storage_path')
    .eq('id', parsed.data)
    .maybeSingle()
  if (readError) return fail('VALIDATION', 'No se pudo leer el documento / Could not read the document')
  if (!row) return fail('FORBIDDEN_LANE', 'Documento no encontrado o sin acceso / Document not found or no access')

  const service = createServiceClient()
  if (!service) return fail('UNAUTHORIZED', 'Servicio no configurado / Service not configured')

  const { data, error } = await service.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl((row as { storage_path: string }).storage_path, 300)
  if (error || !data) return fail('VALIDATION', 'No se pudo abrir el documento / Could not open the document')

  return ok({ url: data.signedUrl })
}

// ── Remove (RLS delete + best-effort storage cleanup) ────────────────────────
export async function removeDocument(documentId: string): Promise<ActionResult<true>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const parsed = uuidSchema.safeParse(documentId)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const { data: row, error: readError } = await gate.supabase
    .from('documents')
    .select('storage_path')
    .eq('id', parsed.data)
    .maybeSingle()
  if (readError) return fail('VALIDATION', 'No se pudo leer el documento / Could not read the document')
  if (!row) return fail('FORBIDDEN_LANE', 'Documento no encontrado o sin acceso / Document not found or no access')

  const { error: deleteError } = await gate.supabase.from('documents').delete().eq('id', parsed.data)
  if (deleteError) return fail('FORBIDDEN_LANE', 'No se pudo eliminar el documento / Could not remove the document')

  // Best-effort object cleanup — the row is the source of truth; a dangling
  // object is a cheap leak, an orphan row is not.
  try {
    const service = createServiceClient()
    if (service) {
      await service.storage.from(DOCUMENTS_BUCKET).remove([(row as { storage_path: string }).storage_path])
    }
  } catch {
    // no-op
  }

  return ok(true as const)
}
