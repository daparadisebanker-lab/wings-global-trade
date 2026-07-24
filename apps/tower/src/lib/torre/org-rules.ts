// src/lib/torre/org-rules.ts
// Pure readers over the brand's org_rules policy (Mister Torre A3). The quote run and
// the review layer read these instead of hardcoded constants. All pure + unit-tested.

export interface OrgRules {
  marginDefaultBps: number
  /** archetype → margin bps override. */
  marginRules: Record<string, number>
  incotermDefault: string
  validityDays: number
  /** artifact kind → approving roles. */
  approvalMatrix: Record<string, string[]>
}

export const ORG_RULES_FALLBACK: OrgRules = {
  marginDefaultBps: 1800,
  marginRules: {},
  incotermDefault: 'FOB',
  validityDays: 15,
  approvalMatrix: {},
}

/**
 * Margin fraction for an archetype: its override if present (0% is a valid override —
 * never coerced to the default), else the brand default.
 */
export function resolveMarginFraction(rules: OrgRules, archetype: string | null): number {
  const override = archetype ? rules.marginRules[archetype] : undefined
  const bps = typeof override === 'number' ? override : rules.marginDefaultBps
  return bps / 10_000
}

/** The roles allowed to approve an artifact kind (empty = no matrix entry). */
export function rolesForKind(matrix: Record<string, string[]>, kind: string): string[] {
  return matrix[kind] ?? []
}

/**
 * Can this operator (their lane/brand roles) approve this artifact kind, per the
 * matrix? Group admin always may. An ABSENT matrix entry defers to RLS (returns true)
 * rather than over-restricting — the DB is the final gate either way.
 */
export function canRolesApprove(
  matrix: Record<string, string[]>,
  kind: string,
  roles: string[],
  isGroupAdmin: boolean,
): boolean {
  if (isGroupAdmin) return true
  const allowed = rolesForKind(matrix, kind)
  if (allowed.length === 0) return true
  return roles.some((r) => allowed.includes(r))
}
