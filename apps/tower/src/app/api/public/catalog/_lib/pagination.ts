// _lib/pagination.ts
// Opaque cursor for the catalog list endpoint. `products` has no `created_at`
// column (only `updated_at`), so the keyset is `(updated_at, id)` descending —
// `id` breaks ties when two products share a timestamp, guaranteeing a stable,
// gap-free page boundary (API_MAP: "all list endpoints cursor-paginated").
export interface CatalogCursor {
  updatedAt: string
  id: string
}

export function encodeCursor(cursor: CatalogCursor): string {
  return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url')
}

/** Never throws — a malformed/tampered cursor degrades to "start from the top". */
export function decodeCursor(raw: string | null | undefined): CatalogCursor | null {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'))
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      typeof (parsed as Record<string, unknown>).updatedAt === 'string' &&
      typeof (parsed as Record<string, unknown>).id === 'string'
    ) {
      const { updatedAt, id } = parsed as { updatedAt: string; id: string }
      return { updatedAt, id }
    }
    return null
  } catch {
    return null
  }
}
