// src/lib/actions/rep-profile-logic.ts
// Pure, dependency-free logic for the rep-identity foundation (tower_39). Split
// out of rep-profile.ts for the same reason as represented-brands-logic.ts: a
// 'use server' file may only export async functions, and these load-bearing rules
// (the signature storage path + the editable-field schema/E.164 gate) are exactly
// what a reviewer needs covered by tests — none touch Supabase.
import { z } from 'zod'

// The private bucket rep signatures live in (provisioned by tower_39). Reachable
// solely via a service-role signed URL — see rep-profile.ts.
export const REP_ASSET_BUCKET = 'rep-assets'

// E.164: a leading '+', a non-zero country digit, then 7..14 more digits. The
// single source of truth mirrored by the DB CHECK in tower_39.
export const E164_REGEX = /^\+[1-9]\d{7,14}$/

const uuidSchema = z.string().uuid()

/**
 * Path for a rep's signature asset in the `rep-assets` bucket. Unlike
 * buildRbAssetStoragePath (timestamped, many-per-slot), a rep has exactly ONE
 * signature, so the path is deterministic and overwrite-in-place:
 *   rep/{userId}/signature.{ext}
 * userId is validated as a uuid so a path segment can never be attacker-chosen.
 */
export function buildRepSignaturePath(userId: string, ext: 'svg' | 'png'): string {
  if (!uuidSchema.safeParse(userId).success) {
    throw new Error('buildRepSignaturePath: userId must be a uuid')
  }
  return `rep/${userId}/signature.${ext}`
}

// The rep-editable fields. signature_path (asset upload) and onboarded_at
// (server-derived) are deliberately NOT here — they are set by their own actions.
export const repProfileUpdateSchema = z.object({
  display_name: z.string().trim().min(1).max(120).nullable().optional(),
  title: z.string().trim().min(1).max(120).nullable().optional(),
  whatsapp_e164: z
    .string()
    .regex(E164_REGEX, 'WhatsApp debe estar en formato E.164 / WhatsApp must be E.164')
    .nullable()
    .optional(),
  whatsapp_label: z.string().trim().min(1).max(80).nullable().optional(),
})
export type RepProfileUpdate = z.infer<typeof repProfileUpdateSchema>
