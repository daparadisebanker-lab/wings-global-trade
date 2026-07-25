'use server'

// Client-media storage broker (tower_59). The private `client-media` bucket
// carries WhatsApp-import attachments; every signed URL is minted with the
// SERVICE ROLE, but only after the caller is authorized here — uploads under
// their OWN prefix, reads gated by an RLS-visible account referencing the object.
// Mirrors trial-products.ts (whose IDOR was fixed the same way).

import { randomUUID } from 'node:crypto'
import { createServerSupabase, createServiceClient } from '@/lib/supabase/server'
import { ok, fail, type ActionResult } from './result'
import {
  CLIENT_MEDIA_BUCKET,
  CLIENT_MEDIA_EXT,
  buildClientMediaPath,
  isClientMediaExt,
} from './client-media-logic'

async function requireUser() {
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false as const, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') }
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') }
  return { ok: true as const, supabase, user }
}

/** Signed UPLOAD url for a client-media object under the caller's own prefix. The
 *  path is built from auth.uid() + a fresh uuid, so it is inherently own-scoped. */
export async function createClientMediaUploadUrl(
  ext: string,
): Promise<ActionResult<{ path: string; signedUrl: string; token: string; mime: string }>> {
  const auth = await requireUser()
  if (!auth.ok) return auth.error
  if (typeof ext !== 'string' || !isClientMediaExt(ext)) {
    return fail('VALIDATION', 'Tipo de archivo no permitido / File type not allowed')
  }
  const e = ext.toLowerCase()
  const path = buildClientMediaPath(auth.user.id, randomUUID(), e)

  const service = createServiceClient()
  if (!service) return fail('UNAUTHORIZED', 'Servicio no configurado / Service not configured')

  const { data, error } = await service.storage.from(CLIENT_MEDIA_BUCKET).createSignedUploadUrl(path)
  if (error || !data) return fail('VALIDATION', 'No se pudo preparar la carga / Could not prepare upload')
  return ok({ path: data.path, signedUrl: data.signedUrl, token: data.token, mime: CLIENT_MEDIA_EXT[e].mime })
}

/** Short-lived signed READ url — authorized by RLS: the caller must be able to
 *  see an account that references this media object. */
export async function getClientMediaUrl(path: string): Promise<ActionResult<string>> {
  const auth = await requireUser()
  if (!auth.ok) return auth.error
  if (typeof path !== 'string' || path.length === 0 || path.length > 300) {
    return fail('VALIDATION', 'Ruta inválida / Invalid path')
  }

  const { data: acct } = await auth.supabase
    .schema('tower')
    .from('accounts')
    .select('id')
    .contains('media', [{ path }])
    .limit(1)
    .maybeSingle()
  if (!acct) return fail('FORBIDDEN_LANE', 'Medio fuera de tu alcance / Media outside your scope')

  const service = createServiceClient()
  if (!service) return fail('UNAUTHORIZED', 'Servicio no configurado / Service not configured')

  const { data, error } = await service.storage.from(CLIENT_MEDIA_BUCKET).createSignedUrl(path, 600)
  if (error || !data) return fail('VALIDATION', 'No se pudo firmar la URL / Could not sign the URL')
  return ok(data.signedUrl)
}
