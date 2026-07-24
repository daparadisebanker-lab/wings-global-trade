// src/lib/torre/agent/profiles.test.ts
import { describe, it, expect, vi } from 'vitest'
import { buildTorreToolBelt, TORRE_TOOL_NAMES, type TorreToolProvider } from './tools'
import { TORRE_TOOL_SYSTEM } from './anthropic-runner'
import {
  TORRE_PROFILES,
  TORRE_PROFILE_IDS,
  getProfile,
  profileSystem,
  selectProfileTools,
  type TorreProfileId,
} from './profiles'

function fakeProvider(): TorreToolProvider {
  return {
    getImport: vi.fn(async () => null),
    getParties: vi.fn(async () => []),
    getRates: vi.fn(async () => []),
    getTariff: vi.fn(async () => []),
    getCostingConfig: vi.fn(async () => ({
      igvRate: 0.18, percepcionRate: 0.035, insuranceRate: 0.015, exchangeRate: 3.7, adValoremDefault: 0.06, sources: [],
    })),
    searchKnowledge: vi.fn(async () => []),
    proposeQuote: vi.fn(async () => ({ draftIds: null, approvable: false, blockers: [], persisted: false })),
    draftMessage: vi.fn(async () => ({ draftId: 'd' })),
  }
}
const belt = buildTorreToolBelt(fakeProvider(), { today: '2026-07-24' })

describe('profile registry', () => {
  it('defines all four specialisms', () => {
    expect(Object.keys(TORRE_PROFILES).sort()).toEqual([...TORRE_PROFILE_IDS].sort())
  })

  it("every profile's tools are real belt tools", () => {
    const names = new Set<string>(TORRE_TOOL_NAMES)
    for (const p of Object.values(TORRE_PROFILES)) {
      for (const t of p.tools) expect(names.has(t)).toBe(true)
    }
  })

  it('every profile can emit a draft (a writer tool: propose_quote or draft_message)', () => {
    for (const p of Object.values(TORRE_PROFILES)) {
      const hasWriter = p.tools.includes('propose_quote') || p.tools.includes('draft_message')
      expect(hasWriter).toBe(true)
    }
  })

  it('cotizador owns the full quoting surface and the server pricer', () => {
    const c = TORRE_PROFILES.cotizador.tools
    expect(c).toEqual(expect.arrayContaining(['get_tariff', 'get_rates', 'get_costing_config', 'compute_landed_cost', 'propose_quote']))
    // it prices via the server, so it does not itself hold draft_message
    expect(c).not.toContain('draft_message')
  })

  it('redactor is DENIED money tools — it cannot fabricate a price (facts-from-state)', () => {
    const r = TORRE_PROFILES.redactor.tools
    expect(r).not.toContain('compute_landed_cost')
    expect(r).not.toContain('get_rates')
    expect(r).not.toContain('get_tariff')
    expect(r).not.toContain('propose_quote')
  })

  it('operaciones does not quote (no compute, no tariff, no propose_quote)', () => {
    const o = TORRE_PROFILES.operaciones.tools
    expect(o).not.toContain('compute_landed_cost')
    expect(o).not.toContain('get_tariff')
    expect(o).not.toContain('propose_quote')
  })

  it('cotizador chains to redactor for the cover message', () => {
    expect(TORRE_PROFILES.cotizador.chainsTo).toContain('redactor')
  })
})

describe('profileSystem', () => {
  it('layers the specialism on top of the governance floor', () => {
    const sys = profileSystem(TORRE_PROFILES.cotizador)
    expect(sys.startsWith(TORRE_TOOL_SYSTEM)).toBe(true)
    expect(sys).toContain('PERFIL: COTIZADOR')
    // the money law from the floor is still present
    expect(sys).toContain('compute_landed_cost')
  })
})

describe('selectProfileTools', () => {
  it('returns only the allowed tools, in belt order', () => {
    const tools = selectProfileTools(TORRE_PROFILES.redactor, belt)
    const names = tools.map((t) => t.name)
    expect(names).toEqual(['get_import', 'get_client', 'get_supplier', 'search_knowledge', 'draft_message'])
    // belt order preserved (get_import precedes draft_message in the belt)
    expect(names.indexOf('get_import')).toBeLessThan(names.indexOf('draft_message'))
  })

  it('scopes redactor away from the money tools at the belt level too', () => {
    const names = selectProfileTools(TORRE_PROFILES.redactor, belt).map((t) => t.name)
    expect(names).not.toContain('compute_landed_cost')
  })

  it('throws if the belt is missing a tool the profile requires', () => {
    const short = belt.filter((t) => t.name !== 'propose_quote')
    expect(() => selectProfileTools(TORRE_PROFILES.cotizador, short)).toThrow(/propose_quote/)
  })
})

describe('getProfile', () => {
  it('returns the profile for a known id', () => {
    expect(getProfile('analista').id).toBe('analista')
  })
  it('throws on an unknown id', () => {
    expect(() => getProfile('nope' as TorreProfileId)).toThrow(/unknown Torre profile/)
  })
})
