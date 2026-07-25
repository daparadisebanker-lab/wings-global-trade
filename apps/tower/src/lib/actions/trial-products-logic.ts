// src/lib/actions/trial-products-logic.ts
// Pure logic for the rep TRIAL-PRODUCT library (tower_56, WS8). Split from the
// 'use server' file (which may only export async functions): the save schema, the
// row mapper, the private-bucket image-path builder, and the own-prefix check.
// None touch Supabase — exactly what a reviewer wants under test.
import { z } from 'zod'
import type { ProductPromoSpec } from '@wings/rb-core'

// The private bucket trial images live in (provisioned by tower_56). Reachable
// solely via a service-role signed URL — see trial-products.ts.
export const REP_TEST_BUCKET = 'rep-test-assets'

export type TrialImageExt = 'png' | 'jpg' | 'webp'
const uuidSchema = z.string().uuid()

const UUID_RE = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
/** The ONLY valid trial-image key shape: `<owner-uuid>/<image-uuid>.<ext>` — no
 *  path traversal, no extra segments, no bucket escape. Both the save schema and
 *  the own-path gate enforce it, because Supabase's storage client does NOT
 *  normalize keys (a `..` collapses in URL parsing and can escape the prefix AND
 *  the bucket when a service-role signs it). */
export const TRIAL_IMAGE_PATH_RE = new RegExp(`^${UUID_RE}/${UUID_RE}\\.(png|jpg|webp)$`, 'i')

/** A saved trial product as the app consumes it (camelCase over the snake row). */
export interface TrialProduct {
  id: string
  name: string
  category: string | null
  specs: ProductPromoSpec[]
  priceNote: string | null
  moq: string | null
  imagePath: string | null
  createdAt: string
  updatedAt: string
}

interface TrialProductRow {
  id: string
  name: string
  category: string | null
  specs: unknown
  price_note: string | null
  moq: string | null
  image_path: string | null
  created_at: string
  updated_at: string
}

export const TRIAL_ROW_COLUMNS = 'id,name,category,specs,price_note,moq,image_path,created_at,updated_at'

const specSchema = z.object({
  label: z.string().trim().min(1).max(60),
  value: z.string().trim().min(1).max(120),
})

/** Editable fields of a trial product. `id` present → update; absent → insert.
 *  Mirrors the tower_56 column checks. */
export const trialProductSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(200),
  category: z.string().trim().max(120).nullable().optional(),
  specs: z.array(specSchema).max(6).optional(),
  priceNote: z.string().trim().max(80).nullable().optional(),
  moq: z.string().trim().max(40).nullable().optional(),
  // Shape-validated (not just length) so a traversal string can never be stored.
  imagePath: z.string().trim().regex(TRIAL_IMAGE_PATH_RE, 'Ruta de imagen inválida / Invalid image path').nullable().optional(),
})
export type TrialProductInput = z.input<typeof trialProductSchema>

/** PURE: the specs jsonb (unknown) → a validated ProductPromoSpec[]. */
export function parseSpecs(raw: unknown): ProductPromoSpec[] {
  if (!Array.isArray(raw)) return []
  const out: ProductPromoSpec[] = []
  for (const item of raw) {
    if (item && typeof item === 'object') {
      const label = String((item as { label?: unknown }).label ?? '').trim()
      const value = String((item as { value?: unknown }).value ?? '').trim()
      if (label && value) out.push({ label, value })
    }
  }
  return out
}

/** PURE: raw row → the app shape. */
export function mapTrialRow(row: TrialProductRow): TrialProduct {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    specs: parseSpecs(row.specs),
    priceNote: row.price_note,
    moq: row.moq,
    imagePath: row.image_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/**
 * Image path in the `rep-test-assets` bucket. It MUST start with the owner's uuid
 * (the tower_56 CHECK: `image_path like owner_id || '/%'`) so a rep can never
 * point a row at another rep's object. Both ids are validated as uuids so a path
 * segment can never be attacker-chosen.
 */
export function buildTrialImagePath(userId: string, imageId: string, ext: TrialImageExt): string {
  if (!uuidSchema.safeParse(userId).success) throw new Error('buildTrialImagePath: userId must be a uuid')
  if (!uuidSchema.safeParse(imageId).success) throw new Error('buildTrialImagePath: imageId must be a uuid')
  return `${userId}/${imageId}.${ext}`
}

/** PURE: is this a well-formed trial-image key owned by `userId`? Gate for signing
 *  a READ url. Full-SHAPE match (not a prefix test): the key must be exactly
 *  `<userId>/<image-uuid>.<ext>` — so `../` traversal, extra segments, or a bucket
 *  escape can never pass, even though the storage client won't normalize the key. */
export function isOwnTrialImagePath(userId: string, path: string): boolean {
  if (!uuidSchema.safeParse(userId).success) return false
  if (!TRIAL_IMAGE_PATH_RE.test(path)) return false
  return path.startsWith(`${userId}/`)
}
