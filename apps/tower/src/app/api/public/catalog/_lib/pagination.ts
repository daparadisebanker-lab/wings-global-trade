// _lib/pagination.ts
// Opaque cursor for the catalog list endpoint. `products` has no `created_at`
// column (only `updated_at`), so the keyset is `(updated_at, id)` descending —
// `id` breaks ties when two products share a timestamp, guaranteeing a stable,
// gap-free page boundary (API_MAP: "all list endpoints cursor-paginated").
export interface CatalogCursor {
  updatedAt: string
  id: string
}

// The cursor is attacker-controllable (base64url in `?cursor=`) and its fields
// are interpolated into a PostgREST `.or()` keyset filter in data.ts. Validate
// the exact shapes here so a tampered value can never smuggle `,`/`(`/`)` into
// that filter string: `id` is a products UUID, `updatedAt` is a Postgres
// timestamptz render. Anything else fails the check and the cursor degrades to
// "start from the top" — the same contract a malformed cursor already had.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const TIMESTAMP_RE = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(\.\d+)?([+-]\d{2}:?\d{2}|Z)?$/

export function encodeCursor(cursor: CatalogCursor): string {
  return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url')
}

/** Never throws — a malformed/tampered/ill-shaped cursor degrades to "start
 *  from the top". Enforces UUID `id` + timestamptz `updatedAt` so the values are
 *  safe to interpolate into the keyset `.or()` filter (no filter injection). */
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
      if (!UUID_RE.test(id) || !TIMESTAMP_RE.test(updatedAt)) return null
      return { updatedAt, id }
    }
    return null
  } catch {
    return null
  }
}
