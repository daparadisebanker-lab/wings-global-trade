// src/lib/actions/containers-cursor.ts
// Cursor pagination for the container list (API_MAP: "all list endpoints
// cursor-paginated"). Split out of containers-logic.ts deliberately: this
// file uses Node's `Buffer` global, and containers-logic.ts's pure math
// (canAdvancePoStatus, parseDecimalToMinor, landedCostPerUnitMinor, …) is
// imported by CLIENT components (POPanel, CostSheet) for presentation-layer
// computation. Keeping `Buffer`-touching code in a server-only sibling file
// means importing containers-logic.ts from a client component never risks
// pulling a Node global into the browser bundle.
//
// `containers` has no `updated_at` column (only `created_at`), so the keyset
// is `(created_at, id)` descending — same tie-break rationale as the public
// catalog's `_lib/pagination.ts`.
export interface ContainerListCursor {
  createdAt: string
  id: string
}

export function encodeContainerCursor(cursor: ContainerListCursor): string {
  return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url')
}

export function decodeContainerCursor(raw: string | null | undefined): ContainerListCursor | null {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'))
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      typeof (parsed as Record<string, unknown>).createdAt === 'string' &&
      typeof (parsed as Record<string, unknown>).id === 'string'
    ) {
      const { createdAt, id } = parsed as { createdAt: string; id: string }
      return { createdAt, id }
    }
    return null
  } catch {
    return null
  }
}
