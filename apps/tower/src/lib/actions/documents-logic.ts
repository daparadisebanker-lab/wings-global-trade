// Pure logic for the Documents / Drive hub — kinds, the display type, the join
// mapper, and the storage-path sanitizer. Split from documents.ts because a
// 'use server' file may only export async functions (mirrors quotations/clients).
// Unit-tested in documents.test.ts.

export const DOCUMENT_KINDS = ['SPEC_SHEET', 'QUOTATION', 'SUPPLIER_DOC', 'CERTIFICATE', 'DOCUMENT'] as const
export type DocumentKind = (typeof DOCUMENT_KINDS)[number]

/** The private bucket provisioned in tower_47. */
export const DOCUMENTS_BUCKET = 'lane-documents'

export interface DocumentListItem {
  id: string
  title: string
  kind: DocumentKind
  brandName: string | null
  laneSlug: string | null
  mimeType: string | null
  sizeBytes: number | null
  createdAt: string
}

// ── Raw join shape (Supabase returns nested relations as object|array) ───────
export type Nested<T> = T | T[] | null
interface RawBrandJoin {
  name: string | null
}
interface RawLaneJoin {
  slug: string | null
}
export interface RawDocumentRow {
  id: string
  title: string
  kind: string
  mime_type: string | null
  size_bytes: number | string | null
  created_at: string
  brands: Nested<RawBrandJoin>
  lanes: Nested<RawLaneJoin>
}

function one<T>(v: Nested<T>): T | null {
  if (Array.isArray(v)) return v.length > 0 ? v[0] : null
  return v ?? null
}

function toKind(v: string): DocumentKind {
  return (DOCUMENT_KINDS as readonly string[]).includes(v) ? (v as DocumentKind) : 'DOCUMENT'
}

/** PURE: raw joined row → the flat display item. */
export function mapDocumentRow(row: RawDocumentRow): DocumentListItem {
  const brand = one(row.brands)
  const lane = one(row.lanes)
  const size = typeof row.size_bytes === 'string' ? Number(row.size_bytes) : row.size_bytes
  return {
    id: row.id,
    title: row.title,
    kind: toKind(row.kind),
    brandName: brand?.name ?? null,
    laneSlug: lane?.slug ?? null,
    mimeType: row.mime_type,
    sizeBytes: typeof size === 'number' && Number.isFinite(size) ? size : null,
    createdAt: row.created_at,
  }
}

export const DOCUMENT_SELECT = 'id,title,kind,mime_type,size_bytes,created_at,brands(name),lanes(slug)'

/**
 * PURE: a filesystem-safe segment for a storage path — lowercased, diacritics
 * stripped, non-word runs collapsed to '-'. Never empty.
 */
export function sanitizeFileName(name: string): string {
  const safe = name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
  return safe || 'file'
}
