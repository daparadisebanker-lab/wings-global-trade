// src/lib/actions/catalog-logic.ts
// Pure, dependency-free logic for the Catalog Studio publish/rollback flow.
// Deliberately split out of catalog.ts: a `'use server'` file may only export
// async functions (Next.js constraint — see session.ts/result.ts split in
// Wave 1), and keeping the state-machine + snapshot math here makes it
// testable without mocking Supabase (see catalog.test.ts).
import type { Localized } from '@/lib/archetypes'

export type ProductStatus = 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'RETIRED'

/** Role values as stored by `tower.lane_memberships.role` (DATABASE_SCHEMA.sql
 * check constraint) — uppercase. NOTE: this intentionally does NOT reuse
 * `lib/rbac.ts`'s `Role` type: that type is lowercase (`'lane_director'`, …)
 * and treats `'group_admin'` as if it were a lane_memberships role, but the
 * DB models group-admin as `profiles.is_group_admin` (a separate boolean, no
 * lane row required) and the five real membership roles are uppercase. Using
 * the mistyped shell type here would silently break every capability check
 * against real data. Flagged for the Conductor to reconcile in rbac.ts. */
export type DbLaneRole = 'LANE_DIRECTOR' | 'CATALOG_EDITOR' | 'TRADE_OPS' | 'SALES' | 'VIEWER'

export interface ProductCapabilities {
  /** Can create a new product in this lane. */
  canCreate: boolean
  /** Can edit fields of a DRAFT/IN_REVIEW product. */
  canEdit: boolean
  canSubmitForReview: boolean
  /** Publish, retire, rollback — Lane Director (or group admin) only, mirrors
   * the `products_update` RLS policy's PUBLISHED/RETIRED branch. */
  canPublish: boolean
  canRetire: boolean
  canRollback: boolean
}

const NO_CAPABILITIES: ProductCapabilities = {
  canCreate: false,
  canEdit: false,
  canSubmitForReview: false,
  canPublish: false,
  canRetire: false,
  canRollback: false,
}

/**
 * Derive UI capabilities from the user's real lane role(s) + group-admin flag.
 * PRESENTATION ONLY (mirrors lib/rbac.ts's own disclaimer): RLS re-checks every
 * mutation server-side regardless of what this returns. This exists so
 * PublishBar can hide (not disable-but-show) actions the user's own
 * memberships prove they don't have — never a hardcoded role gate.
 */
export function computeCapabilities(roles: DbLaneRole[], isGroupAdmin: boolean): ProductCapabilities {
  if (!isGroupAdmin && roles.length === 0) return NO_CAPABILITIES

  const isDirector = isGroupAdmin || roles.includes('LANE_DIRECTOR')
  const isEditor = isDirector || roles.includes('CATALOG_EDITOR')

  return {
    canCreate: isEditor,
    canEdit: isEditor,
    canSubmitForReview: isEditor,
    canPublish: isDirector,
    canRetire: isDirector,
    canRollback: isDirector,
  }
}

/** Status-transition guards — the DRAFT → IN_REVIEW → PUBLISHED law
 * (CLAUDE.md "Publish flow"), plus retire/rollback. Directors may fast-track
 * DRAFT straight to PUBLISHED (skip review); RLS still requires the director
 * role for that write. Rollback may restore from PUBLISHED (re-snapshot) or
 * RETIRED (reinstate) — never from DRAFT/IN_REVIEW, which have no published
 * history to roll back to. */
export function canSubmitForReview(status: ProductStatus): boolean {
  return status === 'DRAFT'
}
export function canPublish(status: ProductStatus): boolean {
  return status === 'DRAFT' || status === 'IN_REVIEW'
}
export function canRetire(status: ProductStatus): boolean {
  return status === 'PUBLISHED'
}
export function canRollback(status: ProductStatus): boolean {
  return status === 'PUBLISHED' || status === 'RETIRED'
}
/** Edits are blocked once a product has gone live — republish (rollback) or a
 * fresh draft is the path back, so `product_versions` snapshots stay truthful
 * to what was actually served publicly at that version. */
export function canEditStatus(status: ProductStatus): boolean {
  return status === 'DRAFT' || status === 'IN_REVIEW'
}

export interface ProductEditableFields {
  slug: string
  categoryPath: string[]
  name: Localized
  specs: Record<string, unknown>
  specSchemaId: string | null
  hsCode: string | null
  moq: number | null
  cbmPerUnit: number | null
}

export interface ProductSnapshot extends ProductEditableFields {
  status: 'PUBLISHED'
}

/** The next `product_versions.version` for a product — max seen + 1, starting
 * at 1. Append-only: never reuses or reorders a version number. */
export function nextVersionNumber(existing: { version: number }[]): number {
  return existing.reduce((max, v) => Math.max(max, v.version), 0) + 1
}

/** Snapshot written on every publish (ADR-4). */
export function buildVersionSnapshot(product: ProductEditableFields): ProductSnapshot {
  return { ...product, status: 'PUBLISHED' }
}

/** Rollback = republish previous version (ADR-4): the restored snapshot
 * becomes the product's new editable fields; the caller re-publishes it
 * (bumping the version forward, never rewriting history). */
export function applyRollbackSnapshot(snapshot: ProductSnapshot): ProductEditableFields {
  const { status: _status, ...fields } = snapshot
  return fields
}

/** Minimum completeness gate before a publish is allowed at all (independent
 * of RLS role checks) — an empty name or an unset category must never reach
 * the public site. */
export function isCompleteForPublish(product: Pick<ProductEditableFields, 'name' | 'categoryPath'>): boolean {
  return (
    product.name.es.trim().length > 0 &&
    product.name.en.trim().length > 0 &&
    product.categoryPath.length > 0
  )
}

/** Derive the distinct, sorted top-level category segments from a set of
 *  product `category_path`s — the facet values for the read-only cross-category
 *  browse (the "pure rep" persona: RB read across the published catalog, no
 *  editable lane). Top-level = `path[0]`, the taxonomy root a rep browses by.
 *  Category is used (not lane) because a pure rep has no `lane_memberships` row,
 *  so RLS (`lanes_read`) hides `tower.lanes` from them entirely — the honest
 *  cross-category dimension lives on the product itself. Pure so it's unit-
 *  tested without a DB. */
export function deriveTopCategories(paths: (string[] | null | undefined)[]): string[] {
  const set = new Set<string>()
  for (const path of paths) {
    const top = path?.[0]?.trim()
    if (top) set.add(top)
  }
  return [...set].sort((a, b) => a.localeCompare(b))
}

// ── Cursor pagination (API_MAP: "all list endpoints cursor-paginated") ──────

export interface ProductListCursor {
  updatedAt: string
  id: string
}

export function encodeCursor(cursor: ProductListCursor): string {
  return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url')
}

export function decodeCursor(raw: string | null | undefined): ProductListCursor | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'))
    if (
      parsed &&
      typeof parsed.updatedAt === 'string' &&
      typeof parsed.id === 'string'
    ) {
      return parsed as ProductListCursor
    }
    return null
  } catch {
    return null
  }
}

/** Storage path convention for product media (see components/catalog/README.md
 * for the bucket spec). Kept pure so it's covered by the same test file. */
export function buildMediaStoragePath(input: {
  brandSlug: string
  laneSlug: string
  productId: string
  kind: string
  fileName: string
}): string {
  const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase()
  const stamp = Date.now()
  return `${input.brandSlug}/${input.laneSlug}/${input.productId}/${input.kind.toLowerCase()}/${stamp}-${safeName}`
}
