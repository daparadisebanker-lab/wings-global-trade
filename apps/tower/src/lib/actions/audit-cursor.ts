// src/lib/actions/audit-cursor.ts
// Keyset cursor for the audit_log list (API_MAP: "all list endpoints
// cursor-paginated"). Split out of audit-logic.ts for the same reason
// containers-cursor.ts is split from containers-logic.ts: this file uses Node's
// `Buffer` global, and audit-logic.ts's pure diff helpers are imported by a
// CLIENT component (<AuditRowDetail>). Keeping Buffer here means importing
// audit-logic.ts client-side never risks pulling a Node global into the bundle.
//
// audit_log has no updated_at; `at` (timestamptz) + the monotonic bigint `id`
// are the keyset (same tie-break rationale as containers-cursor.ts).
export interface AuditCursor {
  at: string
  id: number
}

export function encodeAuditCursor(cursor: AuditCursor): string {
  return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url')
}

export function decodeAuditCursor(raw: string | null | undefined): AuditCursor | null {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'))
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      typeof (parsed as Record<string, unknown>).at === 'string' &&
      typeof (parsed as Record<string, unknown>).id === 'number'
    ) {
      const { at, id } = parsed as { at: string; id: number }
      return { at, id }
    }
    return null
  } catch {
    return null
  }
}

/** PostgREST `.or()` clause for the keyset step: strictly-older than the cursor. */
export function auditKeysetClause(cursor: AuditCursor): string {
  return `at.lt.${cursor.at},and(at.eq.${cursor.at},id.lt.${cursor.id})`
}
