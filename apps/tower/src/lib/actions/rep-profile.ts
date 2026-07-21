'use server'

// src/lib/actions/rep-profile.ts
// Rep-identity foundation (tower_39) — the write/read side over tower.rep_profiles
// and the private `rep-assets` signature bucket. Mutation law, same as the rest of
// TOWER: auth → Zod → RLS-scoped query. A rep only ever touches their own row
// (RLS: user_id = auth.uid() OR is_group_admin()); the group-admin read path is
// exercised only by getRepSignatureUrl.
//
// The signature bucket is PRIVATE and carries no authenticated storage policy —
// exactly like tower_34's buckets. Every signed URL is minted with the SERVICE
// ROLE, but ONLY after the caller has been authorized against RLS/own-row here.
// The service-role client lives ONLY inside this file.
import { z } from 'zod'
import { createServerSupabase, createServiceClient } from '@/lib/supabase/server'
import { fail, ok, type ActionResult } from './result'
import {
  buildRepSignaturePath,
  repProfileUpdateSchema,
  REP_ASSET_BUCKET,
} from './rep-profile-logic'

const uuidSchema = z.string().uuid()
const extSchema = z.enum(['svg', 'png'])

/** The rep profile as the app consumes it (camelCase over the snake_case row). */
export interface RepProfile {
  userId: string
  displayName: string | null
  title: string | null
  signaturePath: string | null
  whatsappE164: string | null
  whatsappLabel: string | null
  onboardedAt: string | null
  createdAt: string
  updatedAt: string
}

interface RepProfileRow {
  user_id: string
  display_name: string | null
  title: string | null
  signature_path: string | null
  whatsapp_e164: string | null
  whatsapp_label: string | null
  onboarded_at: string | null
  created_at: string
  updated_at: string
}

const ROW_COLUMNS =
  'user_id,display_name,title,signature_path,whatsapp_e164,whatsapp_label,onboarded_at,created_at,updated_at'

function mapRow(row: RepProfileRow): RepProfile {
  return {
    userId: row.user_id,
    displayName: row.display_name,
    title: row.title,
    signaturePath: row.signature_path,
    whatsappE164: row.whatsapp_e164,
    whatsappLabel: row.whatsapp_label,
    onboardedAt: row.onboarded_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function requireUser() {
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false, error: fail('UNAUTHORIZED', 'Auth no configurado / Auth not configured') } as const
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') } as const
  return { ok: true, supabase: supabase.schema('tower'), user } as const
}

/** The caller's own rep profile (RLS-scoped), or null if they have none yet. */
export async function getMyRepProfile(): Promise<ActionResult<RepProfile | null>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase, user } = gate

  const { data, error } = await supabase
    .from('rep_profiles')
    .select(ROW_COLUMNS)
    .eq('user_id', user.id)
    .maybeSingle()
  if (error) return fail('VALIDATION', 'No se pudo leer el perfil / Could not read the profile')
  return ok(data ? mapRow(data as RepProfileRow) : null)
}

/**
 * Upsert the caller's own rep profile from the editable fields. Undefined fields
 * are left untouched; explicit null clears a field. `onboarded_at` is stamped once
 * — the first time the merged row is "complete" (display_name + title +
 * whatsapp_e164 + a signature) — and never overwritten thereafter.
 */
export async function upsertMyRepProfile(
  input: z.input<typeof repProfileUpdateSchema>,
): Promise<ActionResult<RepProfile>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase, user } = gate

  const parsed = repProfileUpdateSchema.safeParse(input)
  if (!parsed.success) {
    return fail('VALIDATION', 'Datos inválidos / Invalid data', parsed.error.flatten().fieldErrors)
  }

  const { data: existingRow, error: readError } = await supabase
    .from('rep_profiles')
    .select(ROW_COLUMNS)
    .eq('user_id', user.id)
    .maybeSingle()
  if (readError) return fail('VALIDATION', 'No se pudo leer el perfil / Could not read the profile')
  const existing = existingRow as RepProfileRow | null

  // Merge: an omitted (undefined) field keeps the stored value; an explicit null clears it.
  const payload: Record<string, string | null> = { user_id: user.id }
  const editable = ['display_name', 'title', 'whatsapp_e164', 'whatsapp_label'] as const
  for (const key of editable) {
    if (parsed.data[key] !== undefined) payload[key] = parsed.data[key] ?? null
  }

  const merged = {
    display_name: payload.display_name ?? existing?.display_name ?? null,
    title: payload.title ?? existing?.title ?? null,
    whatsapp_e164: payload.whatsapp_e164 ?? existing?.whatsapp_e164 ?? null,
    signature_path: existing?.signature_path ?? null,
  }
  const isComplete = Boolean(
    merged.display_name && merged.title && merged.whatsapp_e164 && merged.signature_path,
  )
  // Stamp onboarded_at once, and never clobber an existing stamp.
  if (!existing?.onboarded_at && isComplete) payload.onboarded_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('rep_profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select(ROW_COLUMNS)
    .maybeSingle()
  if (error || !data) return fail('FORBIDDEN_LANE', 'No se pudo guardar el perfil / Could not save the profile')
  return ok(mapRow(data as RepProfileRow))
}

/**
 * Issue a signed UPLOAD URL for the caller's own signature, then persist the
 * resulting `signature_path` on their row. The caller can only ever address their
 * own object (path is built from auth.uid()), so this is inherently own-row. The
 * bucket has no authenticated storage policy — the URL is minted with the service
 * role after the auth check above.
 */
export async function createRepSignatureUploadUrl(
  ext: 'svg' | 'png',
): Promise<ActionResult<{ path: string; signedUrl: string; token?: string }>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase, user } = gate

  const extParsed = extSchema.safeParse(ext)
  if (!extParsed.success) return fail('VALIDATION', 'Extensión inválida / Invalid extension')

  const path = buildRepSignaturePath(user.id, extParsed.data)

  const service = createServiceClient()
  if (!service) return fail('UNAUTHORIZED', 'Servicio no configurado / Service not configured')

  // upsert:true — a rep has exactly one signature, re-uploaded in place.
  const { data, error } = await service.storage
    .from(REP_ASSET_BUCKET)
    .createSignedUploadUrl(path, { upsert: true })
  if (error || !data) {
    return fail('VALIDATION', 'No se pudo generar la URL de carga / Could not create the upload URL')
  }

  // Persist the path on the caller's own row (RLS-scoped).
  const { error: saveError } = await supabase
    .from('rep_profiles')
    .upsert({ user_id: user.id, signature_path: data.path }, { onConflict: 'user_id' })
  if (saveError) return fail('FORBIDDEN_LANE', 'No se pudo guardar la firma / Could not save the signature')

  return ok({ path: data.path, signedUrl: data.signedUrl, token: data.token })
}

/**
 * Short-lived signed READ URL for a rep's signature. Allowed when `userId` is the
 * caller OR the caller is a group admin. The returned URL is meant for
 * `<img src=...>`: rendering an SVG through an <img> tag neutralizes any embedded
 * script (no DOM/JS context), which — together with the bucket's svg+png mime
 * allow-list and 512 KiB cap (tower_39) — is the defense. Never inline this SVG
 * or feed it to dangerouslySetInnerHTML. Returns null when there is no signature.
 */
export async function getRepSignatureUrl(userId: string): Promise<ActionResult<string | null>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase, user } = gate

  const idParsed = uuidSchema.safeParse(userId)
  if (!idParsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  // Authorize: self, or group admin.
  let allowed = idParsed.data === user.id
  if (!allowed) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_group_admin')
      .eq('id', user.id)
      .maybeSingle()
    allowed = Boolean((profile as { is_group_admin?: boolean } | null)?.is_group_admin)
  }
  if (!allowed) return fail('FORBIDDEN_LANE', 'Sin acceso a esa firma / No access to that signature')

  const { data: row, error } = await supabase
    .from('rep_profiles')
    .select('signature_path')
    .eq('user_id', idParsed.data)
    .maybeSingle()
  if (error) return fail('VALIDATION', 'No se pudo leer el perfil / Could not read the profile')
  const signaturePath = (row as { signature_path: string | null } | null)?.signature_path
  if (!signaturePath) return ok(null)

  const service = createServiceClient()
  if (!service) return fail('UNAUTHORIZED', 'Servicio no configurado / Service not configured')

  const { data: signed, error: signError } = await service.storage
    .from(REP_ASSET_BUCKET)
    .createSignedUrl(signaturePath, 600)
  if (signError || !signed) return fail('VALIDATION', 'No se pudo firmar la URL / Could not sign the URL')
  return ok(signed.signedUrl)
}
