'use server'

// src/lib/actions/media.ts
// Product media — API_MAP "attachMedia(productId, uploads[])". Signed upload
// URLs + kind tagging (HERO/GALLERY/TECHNICAL/CERTIFICATE). Same mutation law
// as catalog.ts: auth → Zod → RLS-scoped query. The storage bucket itself
// (`product-media`, private) is provisioned by the Conductor — see
// components/catalog/README.md for the exact spec this code assumes.
import { z } from 'zod'
import { createServerSupabase, createServiceClient } from '@/lib/supabase/server'
import { fail, ok, type ActionResult } from './result'
import { buildMediaStoragePath } from './catalog-logic'
import { MEDIA_BUCKET, MEDIA_KINDS, type MediaKind, type ProductMediaRow } from './media-types'

export type { MediaKind, ProductMediaRow } from './media-types'

const uuidSchema = z.string().uuid()

function mapMediaRow(row: {
  id: string
  product_id: string
  storage_path: string
  kind: string
  sort: number
  meta: Record<string, unknown> | null
}): ProductMediaRow {
  return {
    id: row.id,
    productId: row.product_id,
    storagePath: row.storage_path,
    kind: row.kind as MediaKind,
    sort: row.sort,
    meta: row.meta ?? {},
  }
}

async function requireUser() {
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false, error: fail('UNAUTHORIZED', 'Auth no configurado / Auth not configured') } as const
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') } as const
  return { ok: true, supabase: supabase.schema('tower'), storage: supabase.storage, user } as const
}

interface ProductLaneContext {
  laneSlug: string
  brandSlug: string
}

/** Extracts { laneSlug, brandSlug } from a `products` row already joined with
 * `lanes(slug)` + `brands(slug)` — kept as a pure mapper (no DB call) so it
 * carries no awkward "type of the scoped client" signature. */
function mapProductLaneContext(row: {
  lanes: { slug: string } | { slug: string }[] | null
  brands: { slug: string } | { slug: string }[] | null
}): ProductLaneContext {
  const laneJoin = Array.isArray(row.lanes) ? row.lanes[0] : row.lanes
  const brandJoin = Array.isArray(row.brands) ? row.brands[0] : row.brands
  return { laneSlug: laneJoin?.slug ?? 'unknown', brandSlug: brandJoin?.slug ?? 'unknown' }
}

const createUploadInputSchema = z.object({
  kind: z.enum(MEDIA_KINDS),
  fileName: z.string().trim().min(1).max(200),
})

export interface MediaUploadTicket {
  path: string
  token: string
  signedUrl: string
  bucket: string
}

/**
 * Issues a signed upload URL for one file. The caller PUTs the file directly
 * to `signedUrl` (or uses supabase-js `uploadToSignedUrl(path, token, file)`
 * client-side), then calls `attachMedia` with the resulting `path` to record
 * it against the product.
 */
export async function createMediaUploadUrl(
  productId: string,
  input: z.input<typeof createUploadInputSchema>,
): Promise<ActionResult<MediaUploadTicket>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const idParsed = uuidSchema.safeParse(productId)
  if (!idParsed.success) return fail('VALIDATION', 'ID de producto inválido / Invalid product id')

  const parsed = createUploadInputSchema.safeParse(input)
  if (!parsed.success) {
    return fail('VALIDATION', 'Datos inválidos / Invalid data', parsed.error.flatten().fieldErrors)
  }

  const { data: productRow, error: productError } = await supabase
    .from('products')
    .select('id, lanes(slug), brands(slug)')
    .eq('id', idParsed.data)
    .maybeSingle()
  if (productError || !productRow) {
    return fail('FORBIDDEN_LANE', 'Producto no encontrado o sin acceso / Product not found or no access')
  }
  const context = mapProductLaneContext(
    productRow as unknown as {
      lanes: { slug: string } | { slug: string }[] | null
      brands: { slug: string } | { slug: string }[] | null
    },
  )

  const path = buildMediaStoragePath({
    brandSlug: context.brandSlug,
    laneSlug: context.laneSlug,
    productId: idParsed.data,
    kind: parsed.data.kind,
    fileName: parsed.data.fileName,
  })

  // Access to the private `product-media` bucket (tower_34) is service-role only;
  // the caller was already authorized by the RLS-scoped product read above, so
  // the signed URL is minted with the privileged client — the bucket carries no
  // authenticated storage policy (see the migration's ACCESS MODEL note).
  const service = createServiceClient()
  if (!service) return fail('UNAUTHORIZED', 'Servicio no configurado / Service not configured')

  const { data, error } = await service.storage.from(MEDIA_BUCKET).createSignedUploadUrl(path)
  if (error || !data) {
    return fail('VALIDATION', 'No se pudo generar la URL de carga / Could not create the upload URL')
  }

  return ok({ path: data.path, token: data.token, signedUrl: data.signedUrl, bucket: MEDIA_BUCKET })
}

const attachMediaInputSchema = z.object({
  storagePath: z.string().min(1),
  kind: z.enum(MEDIA_KINDS),
  sort: z.number().int().min(0).default(0),
  meta: z.record(z.unknown()).default({}),
})

export async function attachMedia(
  productId: string,
  uploads: z.input<typeof attachMediaInputSchema>[],
): Promise<ActionResult<ProductMediaRow[]>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const idParsed = uuidSchema.safeParse(productId)
  if (!idParsed.success) return fail('VALIDATION', 'ID de producto inválido / Invalid product id')

  const parsed = z.array(attachMediaInputSchema).min(1).max(50).safeParse(uploads)
  if (!parsed.success) {
    return fail('VALIDATION', 'Datos inválidos / Invalid data', {
      uploads: parsed.error.issues.map((i) => i.message),
    })
  }

  const { data, error } = await supabase
    .from('product_media')
    .insert(
      parsed.data.map((u) => ({
        product_id: idParsed.data,
        storage_path: u.storagePath,
        kind: u.kind,
        sort: u.sort,
        meta: u.meta,
      })),
    )
    .select('id,product_id,storage_path,kind,sort,meta')

  if (error) return fail('FORBIDDEN_LANE', 'No se pudo adjuntar el archivo / Could not attach media')

  return ok((data ?? []).map(mapMediaRow))
}

export async function listMedia(productId: string): Promise<ActionResult<ProductMediaRow[]>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const idParsed = uuidSchema.safeParse(productId)
  if (!idParsed.success) return fail('VALIDATION', 'ID de producto inválido / Invalid product id')

  const { data, error } = await supabase
    .from('product_media')
    .select('id,product_id,storage_path,kind,sort,meta')
    .eq('product_id', idParsed.data)
    .order('sort', { ascending: true })

  if (error) return fail('VALIDATION', 'No se pudo listar el material / Could not list media')

  return ok((data ?? []).map(mapMediaRow))
}

const reorderInputSchema = z.array(z.object({ id: uuidSchema, sort: z.number().int().min(0) })).min(1)

export async function reorderMedia(
  productId: string,
  order: z.input<typeof reorderInputSchema>,
): Promise<ActionResult<true>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const idParsed = uuidSchema.safeParse(productId)
  if (!idParsed.success) return fail('VALIDATION', 'ID de producto inválido / Invalid product id')

  const parsed = reorderInputSchema.safeParse(order)
  if (!parsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data')

  for (const item of parsed.data) {
    const { error } = await supabase
      .from('product_media')
      .update({ sort: item.sort })
      .eq('id', item.id)
      .eq('product_id', idParsed.data)
    if (error) return fail('FORBIDDEN_LANE', 'No se pudo reordenar el material / Could not reorder media')
  }

  return ok(true as const)
}

export async function removeMedia(mediaId: string): Promise<ActionResult<true>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const idParsed = uuidSchema.safeParse(mediaId)
  if (!idParsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const { data: row, error: readError } = await supabase
    .from('product_media')
    .select('storage_path')
    .eq('id', idParsed.data)
    .maybeSingle()
  if (readError) return fail('VALIDATION', 'No se pudo leer el material / Could not read media')
  if (!row) return fail('FORBIDDEN_LANE', 'Material no encontrado o sin acceso / Media not found or no access')

  const { error: deleteError } = await supabase.from('product_media').delete().eq('id', idParsed.data)
  if (deleteError) return fail('FORBIDDEN_LANE', 'No se pudo eliminar el material / Could not remove media')

  // Best-effort storage cleanup — the DB row is the source of truth; a
  // dangling storage object is a cheap leak, an orphan row is not. The private
  // bucket is service-role only (tower_34), so cleanup uses the privileged
  // client; a failure here is deliberately swallowed rather than surfaced as a
  // mutation failure.
  try {
    const service = createServiceClient()
    if (service) {
      await service.storage.from(MEDIA_BUCKET).remove([(row as { storage_path: string }).storage_path])
    }
  } catch {
    // no-op: see comment above
  }

  return ok(true as const)
}
