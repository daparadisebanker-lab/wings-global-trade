// src/lib/actions/media-types.ts
// Constants + row types shared by the media server actions (media.ts) and
// client components (MediaManager). Kept out of media.ts deliberately: a
// `'use server'` file may only export async functions — a runtime const
// export (even a string/array) breaks the Next.js build. Type-only exports
// are compile-time-erased and would have been fine there, but these two
// values are real runtime constants, so the whole group lives here instead.
export const MEDIA_KINDS = ['HERO', 'GALLERY', 'TECHNICAL', 'CERTIFICATE'] as const
export type MediaKind = (typeof MEDIA_KINDS)[number]

export const MEDIA_BUCKET = 'product-media'

export interface ProductMediaRow {
  id: string
  productId: string
  storagePath: string
  kind: MediaKind
  sort: number
  meta: Record<string, unknown>
}
