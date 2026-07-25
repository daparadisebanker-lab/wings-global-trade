'use server'

// src/lib/actions/trial-products.ts
// The rep TRIAL-PRODUCT library data layer (tower_56, WS8) — the persisted
// counterpart to the ephemeral "Prueba" composer. A rep saves trial products they
// floated to leads and reuses them later. Mutation law, same as rep-profiles: auth
// → Zod → RLS-scoped query (own-row only). The private `rep-test-assets` bucket
// carries the image; every signed URL is minted with the SERVICE ROLE, but ONLY
// after the caller is authorized to their own object here.
//
// Dormant-safe: until tower_56 is applied every query errors, so the list read
// returns a typed failure (SCHEMA_MISMATCH for the missing table) — the composer
// then hides the library and Prueba stays purely ephemeral.
import { randomUUID } from 'node:crypto'
import { createServerSupabase, createServiceClient } from '@/lib/supabase/server'
import { ok, fail, type ActionResult } from './result'
import {
  trialProductSchema,
  mapTrialRow,
  buildTrialImagePath,
  isOwnTrialImagePath,
  TRIAL_ROW_COLUMNS,
  REP_TEST_BUCKET,
  type TrialProduct,
  type TrialProductInput,
  type TrialImageExt,
} from './trial-products-logic'
import { z } from 'zod'

const extSchema = z.enum(['png', 'jpg', 'webp'])

async function requireUser() {
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false as const, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') }
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') }
  return { ok: true as const, tower: supabase.schema('tower'), user }
}

/** The caller's saved trials, newest first (RLS + explicit own-row). Error →
 *  dormant: SCHEMA_MISMATCH when the table isn't there yet, VALIDATION otherwise. */
export async function listMyTrialProducts(): Promise<ActionResult<TrialProduct[]>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { data, error } = await gate.tower
    .from('rep_test_products')
    .select(TRIAL_ROW_COLUMNS)
    .eq('owner_id', gate.user.id)
    .order('updated_at', { ascending: false })
    .limit(100)
  if (error) {
    const code = (error as { code?: string }).code
    return fail(code === '42P01' ? 'SCHEMA_MISMATCH' : 'VALIDATION', 'Biblioteca no disponible / Library unavailable')
  }
  return ok((data ?? []).map((r) => mapTrialRow(r as never)))
}

/**
 * Create or update a saved trial (own-row). `id` present → update; absent →
 * insert. created_at/updated_at are trigger-stamped (tower_56) — never sent.
 */
export async function saveTrialProduct(input: TrialProductInput): Promise<ActionResult<TrialProduct>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { tower, user } = gate

  const parsed = trialProductSchema.safeParse(input)
  if (!parsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data', parsed.error.flatten().fieldErrors)
  const d = parsed.data

  // A supplied imagePath must be the caller's own object (defense-in-depth with
  // the DB CHECK) — never let a row point at another rep's image.
  if (d.imagePath && !isOwnTrialImagePath(user.id, d.imagePath)) {
    return fail('FORBIDDEN_LANE', 'Imagen fuera de tu espacio / Image outside your space')
  }

  const row = {
    name: d.name,
    category: d.category ?? null,
    specs: d.specs ?? [],
    price_note: d.priceNote ?? null,
    moq: d.moq ?? null,
    image_path: d.imagePath ?? null,
  }

  if (d.id) {
    const { data, error } = await tower
      .from('rep_test_products')
      .update(row)
      .eq('id', d.id)
      .eq('owner_id', user.id)
      .select(TRIAL_ROW_COLUMNS)
      .maybeSingle()
    if (error || !data) return fail('FORBIDDEN_LANE', 'No se pudo guardar / Could not save')
    return ok(mapTrialRow(data as never))
  }

  const { data, error } = await tower
    .from('rep_test_products')
    .insert({ ...row, owner_id: user.id })
    .select(TRIAL_ROW_COLUMNS)
    .single()
  if (error || !data) return fail('FORBIDDEN_LANE', 'No se pudo guardar / Could not save')
  return ok(mapTrialRow(data as never))
}

/** Delete one of the caller's own trials (RLS own-row) and clean up its image
 *  object so it doesn't orphan in the bucket. Fetch-first so a stale / not-yours
 *  id is a real failure, not a false success (RLS filters it to zero rows). */
export async function deleteTrialProduct(id: string): Promise<ActionResult<true>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const idParsed = z.string().uuid().safeParse(id)
  if (!idParsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const { data: row } = await gate.tower
    .from('rep_test_products')
    .select('id,image_path')
    .eq('id', idParsed.data)
    .eq('owner_id', gate.user.id)
    .maybeSingle()
  if (!row) return fail('VALIDATION', 'No se pudo eliminar / Could not delete')
  const imagePath = (row as { image_path: string | null }).image_path

  const { error } = await gate.tower.from('rep_test_products').delete().eq('id', idParsed.data).eq('owner_id', gate.user.id)
  if (error) return fail('VALIDATION', 'No se pudo eliminar / Could not delete')

  // Best-effort image cleanup — own-prefix already proven by the fetched row.
  if (imagePath && isOwnTrialImagePath(gate.user.id, imagePath)) {
    const service = createServiceClient()
    if (service) await service.storage.from(REP_TEST_BUCKET).remove([imagePath])
  }
  return ok(true)
}

/**
 * Signed UPLOAD url for a trial image under the caller's own prefix. The path is
 * built from auth.uid() + a fresh uuid, so it is inherently own-scoped; the URL is
 * minted with the service role after the auth check above.
 */
export async function createTrialImageUploadUrl(
  ext: TrialImageExt,
): Promise<ActionResult<{ path: string; signedUrl: string; token?: string }>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const extParsed = extSchema.safeParse(ext)
  if (!extParsed.success) return fail('VALIDATION', 'Extensión inválida / Invalid extension')

  const path = buildTrialImagePath(gate.user.id, randomUUID(), extParsed.data)
  const service = createServiceClient()
  if (!service) return fail('UNAUTHORIZED', 'Servicio no configurado / Service not configured')

  const { data, error } = await service.storage.from(REP_TEST_BUCKET).createSignedUploadUrl(path)
  if (error || !data) return fail('VALIDATION', 'No se pudo preparar la carga / Could not prepare upload')
  return ok({ path: data.path, signedUrl: data.signedUrl, token: data.token })
}

/** Short-lived signed READ url for a trial image — only for the caller's OWN
 *  object (own prefix), minted with the service role. */
export async function getTrialImageUrl(imagePath: string): Promise<ActionResult<string>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  if (!isOwnTrialImagePath(gate.user.id, imagePath)) {
    return fail('FORBIDDEN_LANE', 'Imagen fuera de tu espacio / Image outside your space')
  }
  const service = createServiceClient()
  if (!service) return fail('UNAUTHORIZED', 'Servicio no configurado / Service not configured')
  const { data, error } = await service.storage.from(REP_TEST_BUCKET).createSignedUrl(imagePath, 600)
  if (error || !data) return fail('VALIDATION', 'No se pudo firmar la URL / Could not sign the URL')
  return ok(data.signedUrl)
}
