'use server'

// src/lib/actions/represented-brands-media.ts
// Signed-upload/-download broker for the --rb-* brand-kit assets (RB Console
// Wave 1b — finishes BrandKitPanel's asset slots). Same mutation law as the rest
// of the RB console: auth → Zod → authorize against the shipped predicates
// (is_group_admin / BRAND_MANAGER membership), then the SERVICE ROLE mints the
// signed URL against the private `brand-kits` bucket (tower_34). The bucket has
// no authenticated storage policy by design — the server action IS the boundary,
// exactly as saveBrandKit gates kit_complete through the service role.
//
// The uploaded bytes live in storage; the kit JSON (represented_brands.identity)
// stores only the returned storage PATH. Nothing here writes identity — the panel
// collects the paths and calls saveBrandKit once.
import { z } from 'zod'
import { createServerSupabase, createServiceClient } from '@/lib/supabase/server'
import { fail, ok, type ActionResult } from './result'
import { RB_ASSET_BUCKET, RB_ASSET_SLOTS, buildRbAssetStoragePath } from './represented-brands-logic'

const uuidSchema = z.string().uuid()

export interface RbAssetUploadTicket {
  path: string
  token: string
  signedUrl: string
  bucket: string
}

interface ManageGate {
  slug: string
  code: string
}

/**
 * Authorize the caller to manage `brandId`'s kit assets. The brand read runs
 * under the caller's RLS client, so it returns a row only if they hold some RB
 * role on it (or are a group admin); we then require the editing capability
 * (BRAND_MANAGER or group admin), mirroring the identity-write boundary of
 * saveBrandKit. Returns the brand's slug/code for the storage path on success.
 */
async function requireBrandManager(brandId: string): Promise<ActionResult<ManageGate>> {
  const supabase = await createServerSupabase()
  if (!supabase) return fail('UNAUTHORIZED', 'Auth no configurado / Auth not configured')
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return fail('UNAUTHORIZED', 'Sesión requerida / Session required')

  const tower = supabase.schema('tower')
  const { data: brand } = await tower
    .from('represented_brands')
    .select('slug, code')
    .eq('id', brandId)
    .maybeSingle()
  if (!brand) return fail('FORBIDDEN_LANE', 'Marca no encontrada o sin acceso / Brand not found or no access')

  const { data: profile } = await tower.from('profiles').select('is_group_admin').eq('id', user.id).maybeSingle()
  let canManage = Boolean((profile as { is_group_admin?: boolean } | null)?.is_group_admin)
  if (!canManage) {
    const { data: membership } = await tower
      .from('rb_memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('represented_brand_id', brandId)
      .eq('role', 'BRAND_MANAGER')
      .maybeSingle()
    canManage = Boolean(membership)
  }
  if (!canManage) return fail('FORBIDDEN_LANE', 'Solo el gestor de la marca / Brand manager only')

  const row = brand as { slug: string; code: string }
  return ok({ slug: row.slug, code: row.code })
}

const uploadInputSchema = z.object({
  slot: z.enum(RB_ASSET_SLOTS),
  fileName: z.string().trim().min(1).max(200),
})

/**
 * Issue a signed upload URL for one brand-kit asset. The caller PUTs the file to
 * `signedUrl`, then stores the returned `path` in the kit before saveBrandKit.
 */
export async function createRbAssetUploadUrl(
  brandId: string,
  input: z.input<typeof uploadInputSchema>,
): Promise<ActionResult<RbAssetUploadTicket>> {
  const idParsed = uuidSchema.safeParse(brandId)
  if (!idParsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')
  const parsed = uploadInputSchema.safeParse(input)
  if (!parsed.success) {
    return fail('VALIDATION', 'Datos inválidos / Invalid data', parsed.error.flatten().fieldErrors)
  }

  const gate = await requireBrandManager(idParsed.data)
  if (gate.error) return gate

  const service = createServiceClient()
  if (!service) return fail('UNAUTHORIZED', 'Servicio no configurado / Service not configured')

  const path = buildRbAssetStoragePath({
    brandSlug: gate.data.slug,
    slot: parsed.data.slot,
    fileName: parsed.data.fileName,
  })

  const { data, error } = await service.storage.from(RB_ASSET_BUCKET).createSignedUploadUrl(path)
  if (error || !data) {
    return fail('VALIDATION', 'No se pudo generar la URL de carga / Could not create the upload URL')
  }
  return ok({ path: data.path, token: data.token, signedUrl: data.signedUrl, bucket: RB_ASSET_BUCKET })
}

const downloadInputSchema = z.object({
  path: z.string().min(1).max(400),
})

/**
 * Short-lived signed download URL so the panel can preview an already-saved
 * asset (freshly uploaded ones preview from the local File). The path must sit
 * under this brand's own `rb/{slug}/` prefix — a caller can never point it at
 * another brand's objects.
 */
export async function createRbAssetDownloadUrl(
  brandId: string,
  input: z.input<typeof downloadInputSchema>,
): Promise<ActionResult<{ signedUrl: string }>> {
  const idParsed = uuidSchema.safeParse(brandId)
  if (!idParsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')
  const parsed = downloadInputSchema.safeParse(input)
  if (!parsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data')

  const gate = await requireBrandManager(idParsed.data)
  if (gate.error) return gate

  const prefix = `rb/${gate.data.slug}/`
  if (!parsed.data.path.startsWith(prefix)) {
    return fail('FORBIDDEN_LANE', 'Ruta fuera de la marca / Path outside this brand')
  }

  const service = createServiceClient()
  if (!service) return fail('UNAUTHORIZED', 'Servicio no configurado / Service not configured')

  const { data, error } = await service.storage.from(RB_ASSET_BUCKET).createSignedUrl(parsed.data.path, 600)
  if (error || !data) return fail('VALIDATION', 'No se pudo firmar la URL / Could not sign the URL')
  return ok({ signedUrl: data.signedUrl })
}
