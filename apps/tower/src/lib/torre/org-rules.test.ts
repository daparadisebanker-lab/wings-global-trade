// src/lib/torre/org-rules.test.ts
import { describe, it, expect } from 'vitest'
import { resolveMarginFraction, rolesForKind, canRolesApprove, type OrgRules } from './org-rules'

const rules: OrgRules = {
  marginDefaultBps: 1800,
  marginRules: { EQUIPMENT: 1800, COMMODITY: 1000, PROGRAM: 0 },
  incotermDefault: 'FOB',
  validityDays: 15,
  approvalMatrix: { COTIZACION: ['LANE_DIRECTOR', 'SALES'], HOJA_COSTOS: ['LANE_DIRECTOR', 'TRADE_OPS'] },
}

describe('resolveMarginFraction', () => {
  it('uses the archetype override when present', () => {
    expect(resolveMarginFraction(rules, 'COMMODITY')).toBe(0.1)
    expect(resolveMarginFraction(rules, 'EQUIPMENT')).toBe(0.18)
  })
  it('honours a 0% override (never coerced to the default)', () => {
    expect(resolveMarginFraction(rules, 'PROGRAM')).toBe(0)
  })
  it('falls back to the default for an unknown/absent archetype', () => {
    expect(resolveMarginFraction(rules, 'MEDICAL')).toBe(0.18)
    expect(resolveMarginFraction(rules, null)).toBe(0.18)
  })
})

describe('approval matrix', () => {
  it('lists the roles for a kind', () => {
    expect(rolesForKind(rules.approvalMatrix, 'COTIZACION')).toEqual(['LANE_DIRECTOR', 'SALES'])
    expect(rolesForKind(rules.approvalMatrix, 'BRIEF')).toEqual([])
  })
  it('permits an operator whose role is allowed', () => {
    expect(canRolesApprove(rules.approvalMatrix, 'COTIZACION', ['SALES'], false)).toBe(true)
    expect(canRolesApprove(rules.approvalMatrix, 'COTIZACION', ['TRADE_OPS'], false)).toBe(false)
  })
  it('group admin may always approve', () => {
    expect(canRolesApprove(rules.approvalMatrix, 'COTIZACION', [], true)).toBe(true)
  })
  it('defers to RLS (true) when there is no matrix entry — never over-restricts', () => {
    expect(canRolesApprove(rules.approvalMatrix, 'ACTA', ['VIEWER'], false)).toBe(true)
  })
})
