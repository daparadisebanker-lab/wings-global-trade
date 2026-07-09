// src/lib/actions/admin-logic.ts
// Pure, dependency-free logic for the Admin module (UserManager, LaneRegistry,
// BrandManager). Split out of admin.ts for the same reason as catalog-logic.ts:
// a `'use server'` file may only export async functions, and the append-only
// code math + status state-machines below are the load-bearing rules a reviewer
// most needs covered by tests (admin-logic.test.ts) — none of them touch
// Supabase, so they test without mocking a client.
import type { DbLaneRole } from './catalog-logic'

// ── Lane roles (the matrix columns) ──────────────────────────────────────────
// Single runtime source for the five membership roles. catalog-logic.ts owns the
// `DbLaneRole` *type* (uppercase, matching tower.lane_memberships.role); this is
// the value list the UserManager grid and the setMemberships Zod enum both read,
// so the two never drift from the DB check constraint. Group admin is NOT here:
// it is profiles.is_group_admin, never a lane role (D-11).
export const LANE_ROLES: readonly DbLaneRole[] = [
  'LANE_DIRECTOR',
  'CATALOG_EDITOR',
  'TRADE_OPS',
  'SALES',
  'VIEWER',
] as const

export function isLaneRole(value: string): value is DbLaneRole {
  return (LANE_ROLES as readonly string[]).includes(value)
}

// ── Lane status (OPENING → ACTIVE → ARCHIVED) ────────────────────────────────
// The lane lifecycle from the ecosystem CLAUDE.md (Phase 1: "OPENING → ACTIVE →
// (never deleted; ARCHIVED at most)"). Forward-only: a lane never regresses, and
// codes are never reused even after ARCHIVED (append-only, Directive 4).
export const LANE_STATUSES = ['OPENING', 'ACTIVE', 'ARCHIVED'] as const
export type LaneStatus = (typeof LANE_STATUSES)[number]

/** A status flip is legal only strictly forward along OPENING→ACTIVE→ARCHIVED.
 * Permits skipping (OPENING→ARCHIVED: a lane abandoned before launch) but never
 * a reversal or a no-op. */
export function canTransitionLaneStatus(from: LaneStatus, to: LaneStatus): boolean {
  return LANE_STATUSES.indexOf(to) > LANE_STATUSES.indexOf(from)
}

/** The status flips offered in the UI for a lane currently at `from` (empty when
 * ARCHIVED — a terminal state). Keeps the picker honest: it only ever shows a
 * legal next state. */
export function nextLaneStatuses(from: LaneStatus): LaneStatus[] {
  return LANE_STATUSES.filter((s) => canTransitionLaneStatus(from, s))
}

// ── Brand status (append-only spirit: retire, never delete) ──────────────────
// The brands table ships without a status column (DATABASE_SCHEMA.sql) — adding
// one is proposed in wave5-admin.sql. These helpers encode the intended
// lifecycle so the UI + action are ready the moment the column lands.
export const BRAND_STATUSES = ['ACTIVE', 'RETIRED'] as const
export type BrandStatus = (typeof BRAND_STATUSES)[number]

/** Brands are retired, never deleted (Directive 4 append-only spirit). A retired
 * brand may be reinstated (RETIRED→ACTIVE) — retirement hides, it doesn't erase.
 * A no-op flip is rejected so the action never writes an audit row for nothing. */
export function canTransitionBrandStatus(from: BrandStatus, to: BrandStatus): boolean {
  return from !== to
}

// ── Lane code allocation (append-only WGT/NN) ────────────────────────────────
// Lane codes are append-only and never reused, reordered, edited, or deleted
// (root CLAUDE.md §6, Directive 4). A brand's codes share an alpha prefix and a
// zero-padded integer suffix: WGT/01, WGT/02, … ; Áladín is ALD/01, …

const CODE_RE = /^([A-Z]{2,5})\/(\d+)$/

/** First-lane prefix hints for brands that predate this registry. For any brand
 * that already has lanes, the prefix is derived from those codes instead (so
 * this map only affects a brand's very first lane). */
const KNOWN_BRAND_PREFIXES: Record<string, string> = {
  wings: 'WGT',
  aladin: 'ALD',
}

/** Best-effort prefix suggestion for a new lane in a brand. An existing code
 * wins (authoritative); else a known-brand hint; else the brand slug's leading
 * letters, uppercased. Always shown editable in the form — a suggestion, never a
 * silent decision. */
export function suggestLanePrefix(brandSlug: string, existingBrandCodes: string[]): string {
  for (const code of existingBrandCodes) {
    const m = CODE_RE.exec(code)
    if (m) return m[1]
  }
  const known = KNOWN_BRAND_PREFIXES[brandSlug.toLowerCase()]
  if (known) return known
  const alpha = brandSlug.toUpperCase().replace(/[^A-Z]/g, '')
  return (alpha.slice(0, 3) || 'LN').padEnd(2, 'X')
}

/** The next append-only code for `prefix`, given every existing code (across all
 * brands — codes are globally unique). Scans only codes with this prefix, takes
 * max suffix + 1, zero-pads to two digits (WGT/01 … WGT/99, then WGT/100).
 * Starting fresh yields prefix/01. Never reuses a retired lane's number. */
export function nextLaneCode(existingCodes: string[], prefix: string): string {
  let max = 0
  for (const code of existingCodes) {
    const m = CODE_RE.exec(code)
    if (m && m[1] === prefix) max = Math.max(max, Number(m[2]))
  }
  return `${prefix}/${String(max + 1).padStart(2, '0')}`
}

export const LANE_CODE_PREFIX_RE = /^[A-Z]{2,5}$/

// ── Membership grid diff ─────────────────────────────────────────────────────
// setMemberships receives the FULL desired set of (lane, role) pairs for one
// user; the diff turns that into the minimal add/remove the write must apply.
// lane_memberships is NOT an append-only world (Directive 4 lists lane codes /
// container codes / product_versions / audit_log / events — not memberships), so
// revoking a role is a real row delete; the schema has no soft-delete column.
export interface MembershipKey {
  laneId: string
  role: DbLaneRole
}

function keyOf(k: MembershipKey): string {
  return `${k.laneId}::${k.role}`
}

/** Minimal change set between a user's current memberships and the desired grid.
 * De-duplicates both sides so a doubled cell never produces a duplicate insert
 * (the PK is (user_id, lane_id, role) — a dup would 23505). */
export function diffMemberships(
  current: MembershipKey[],
  desired: MembershipKey[],
): { toAdd: MembershipKey[]; toRemove: MembershipKey[] } {
  const currentMap = new Map(current.map((k) => [keyOf(k), k]))
  const desiredMap = new Map(desired.map((k) => [keyOf(k), k]))

  const toAdd: MembershipKey[] = []
  for (const [key, k] of desiredMap) if (!currentMap.has(key)) toAdd.push(k)

  const toRemove: MembershipKey[] = []
  for (const [key, k] of currentMap) if (!desiredMap.has(key)) toRemove.push(k)

  return { toAdd, toRemove }
}

// ── Slug helpers (brands + lanes) ────────────────────────────────────────────
/** kebab-case a human label into a slug (shared shape with catalog.ts's own
 * slugify — kept local so admin-logic stays dependency-free and testable). */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
