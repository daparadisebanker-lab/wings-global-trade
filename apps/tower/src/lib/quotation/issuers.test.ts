import { describe, expect, it } from 'vitest'
import {
  DEFAULT_ISSUER,
  entityTaxPosture,
  hasBankingDetails,
  ISSUER_REGISTRY,
  issuerById,
  resolveIssuer,
  SHINING_STAR_CL,
  WINGS_PE,
  withEntityCommercialTerms,
  withEntityProformaTerms,
} from './issuers'

describe('resolveIssuer — destination drives the issuing entity', () => {
  it('routes an Iquique / Chile destination to the Chilean entity', () => {
    expect(resolveIssuer({ port: 'Iquique, Chile' }).id).toBe(SHINING_STAR_CL.id)
    expect(resolveIssuer({ port: 'ZOFRI' }).id).toBe(SHINING_STAR_CL.id)
  })

  it('routes a Bolivian buyer (Iquique free-zone route) to the Chilean entity', () => {
    expect(resolveIssuer({ country: 'Bolivia' }).id).toBe(SHINING_STAR_CL.id)
  })

  it('routes Callao / Perú to the default Wings entity', () => {
    expect(resolveIssuer({ port: 'Callao, Perú' }).id).toBe(WINGS_PE.id)
    expect(resolveIssuer({ country: 'Perú' }).id).toBe(WINGS_PE.id)
  })

  it('falls back to the default entity when nothing matches or is blank', () => {
    expect(resolveIssuer({}).id).toBe(DEFAULT_ISSUER.id)
    expect(resolveIssuer({ port: '', country: null }).id).toBe(DEFAULT_ISSUER.id)
    expect(resolveIssuer({ port: 'Rotterdam' }).id).toBe(DEFAULT_ISSUER.id)
  })

  it('matches case-insensitively across the combined port+country signal', () => {
    expect(resolveIssuer({ port: 'iquique', country: 'CHILE' }).id).toBe(SHINING_STAR_CL.id)
  })
})

describe('issuerById', () => {
  it('returns the entity for a known id and null otherwise', () => {
    expect(issuerById('shining-star-cl')).toBe(SHINING_STAR_CL)
    expect(issuerById('wgt-pe')).toBe(WINGS_PE)
    expect(issuerById('nope')).toBeNull()
    expect(issuerById(null)).toBeNull()
  })
})

describe('issuer_id precedence (quotes.issuer_id wins over destination)', () => {
  // Mirrors the resolution in lib/actions/proforma.ts:
  //   entity = issuerById(row.issuer_id) ?? resolveIssuer({ port, country })
  const resolve = (issuerId: string | null, port: string | null, country: string | null) =>
    issuerById(issuerId) ?? resolveIssuer({ port, country })

  it('an explicit issuer_id overrides a conflicting destination', () => {
    // Callao/Perú would resolve to WINGS_PE, but the explicit CL choice wins.
    expect(resolve('shining-star-cl', 'Callao, Perú', 'Perú').id).toBe(SHINING_STAR_CL.id)
    // And the reverse: an Iquique destination but an explicit PE choice.
    expect(resolve('wgt-pe', 'Iquique, Chile', 'Bolivia').id).toBe(WINGS_PE.id)
  })

  it('falls back to destination resolution when issuer_id is null', () => {
    expect(resolve(null, 'Iquique, Chile', null).id).toBe(SHINING_STAR_CL.id)
    expect(resolve(null, 'Callao, Perú', null).id).toBe(WINGS_PE.id)
  })

  it('an unknown issuer_id does not crash — it falls through to resolution', () => {
    expect(resolve('ghost-entity', 'Iquique, Chile', null).id).toBe(SHINING_STAR_CL.id)
  })
})

describe('entity data invariants', () => {
  it('every registry entity has a unique id and key', () => {
    const ids = ISSUER_REGISTRY.map((e) => e.id)
    const keys = ISSUER_REGISTRY.map((e) => e.key)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('the Chilean entity carries its saved RUT + Iquique identity, FOB, no bank block', () => {
    expect(SHINING_STAR_CL.exporter.name).toBe('IMPORT - EXPORT SHINING STAR LIMITADA')
    expect(SHINING_STAR_CL.exporter.taxId).toBe('76029544-2')
    expect(SHINING_STAR_CL.taxIdLabel).toBe('RUT')
    expect(SHINING_STAR_CL.taxBps).toBe(0)
    expect(SHINING_STAR_CL.locale).toBe('es')
    expect(SHINING_STAR_CL.banking).toBeNull()
    expect(hasBankingDetails(SHINING_STAR_CL.banking)).toBe(false)
  })

  it('the default Wings entity keeps a bank block and IGV posture', () => {
    expect(hasBankingDetails(WINGS_PE.banking)).toBe(true)
    expect(WINGS_PE.taxBps).toBe(1800)
    expect(DEFAULT_ISSUER).toBe(WINGS_PE)
  })
})

describe('entityTaxPosture (shared by proforma + cotización)', () => {
  it('default entity (PE): stored label/bps win — byte-identical to IGV 18%', () => {
    expect(entityTaxPosture(WINGS_PE, 'IGV 18%', 1800)).toEqual({ taxLabel: 'IGV 18%', taxBps: 1800 })
  })
  it('default entity with null stored → the entity default (IGV 18%)', () => {
    expect(entityTaxPosture(WINGS_PE, null, null)).toEqual({ taxLabel: 'IGV 18%', taxBps: 1800 })
  })
  it('matched entity (CL) imposes FOB / 0 bps even over a stored IGV', () => {
    expect(entityTaxPosture(SHINING_STAR_CL, 'IGV 18%', 1800)).toEqual({ taxLabel: 'FOB', taxBps: 0 })
  })
})

describe('withEntityCommercialTerms (cotización terms shape)', () => {
  it('falls back to the CL entity defaults, incoterm from defaultIncoterm', () => {
    const t = withEntityCommercialTerms(null, SHINING_STAR_CL)
    expect(t.incoterm).toBe('FOB (Incoterms ® 2020)')
    expect(t.paymentTerms).toBe('50% adelantado y 50% al embarque en el puerto de origen.')
    expect(t.validityText).toBe('15 días desde la fecha de esta proforma.')
    expect(t.warranty).toBeNull()
  })
  it('lets a stored field win over the entity default', () => {
    const t = withEntityCommercialTerms({ incoterm: 'CFR - Iquique' }, SHINING_STAR_CL)
    expect(t.incoterm).toBe('CFR - Iquique')
    expect(t.paymentTerms).toBe('50% adelantado y 50% al embarque en el puerto de origen.')
  })
})

describe('withEntityProformaTerms', () => {
  it('falls back to the entity defaults for empty fields', () => {
    const t = withEntityProformaTerms(null, SHINING_STAR_CL)
    expect(t.portOfDestination).toBe('Iquique, Chile')
    expect(t.paymentTerms).toBe('50% adelantado y 50% al embarque en el puerto de origen.')
  })

  it('lets a stored value override the entity default', () => {
    const t = withEntityProformaTerms({ portOfDestination: 'Antofagasta, Chile' }, SHINING_STAR_CL)
    expect(t.portOfDestination).toBe('Antofagasta, Chile')
    // untouched fields still fall back to the entity
    expect(t.portOfOrigin).toBe('Qingdao, China')
  })
})
