// src/lib/torre/review-logic.test.ts
import { describe, it, expect } from 'vitest'
import { canApproveTorre, approveSideEffect, blockedReason } from './review-logic'
import type { ComunicacionPayload, CotizacionPayload, HojaCostosPayload, Blocker } from './artifacts'

const blocker: Blocker = { id: 'fob-missing', field: 'fob', reason: { es: 'x', en: 'x' }, task: { es: 'y', en: 'y' } }

const hoja: HojaCostosPayload = {
  kind: 'HOJA_COSTOS',
  version: 1,
  title: 'Hoja',
  machine: { productName: 'x', brand: '', model: '', fuelType: 'diesel', engineCC: 1, incoterm: 'FOB', origin: 'china' },
  inputs: {},
  result: {},
  currency: 'USD',
  exchangeRate: 3.7,
  marginPercent: 0.18,
  sources: [],
  sensitivity: [],
  cautions: [],
  blockers: [],
}

const comm: ComunicacionPayload = {
  kind: 'COMUNICACION',
  version: 1,
  channel: 'email',
  audience: 'client',
  language: 'es',
  to: null,
  subject: 'x',
  body: 'x',
  sideEffect: { es: 'Enviar a cliente@x por correo', en: 'Send to client@x by email' },
  blockers: [],
  cotizacionRef: null,
}

describe('review-logic', () => {
  it('approvable without blockers, not approvable with them', () => {
    expect(canApproveTorre(hoja)).toBe(true)
    expect(canApproveTorre({ ...hoja, blockers: [blocker] })).toBe(false)
  })

  it('names the exact side effect per kind', () => {
    expect(approveSideEffect(hoja).es).toMatch(/Costeo/)
    // a comunicacion uses its own declared side effect
    expect(approveSideEffect(comm).es).toMatch(/Enviar a cliente@x/)
  })

  it('cotizacion side effect names the Quotations issuance step', () => {
    const cot = { kind: 'COTIZACION' } as unknown as CotizacionPayload
    expect(approveSideEffect(cot).en).toMatch(/Quotations/)
  })

  it('blockedReason is null when clean, a count when blocked', () => {
    expect(blockedReason(hoja, 'es')).toBeNull()
    expect(blockedReason({ ...hoja, blockers: [blocker] }, 'en')).toMatch(/1 open blocker/)
  })
})
