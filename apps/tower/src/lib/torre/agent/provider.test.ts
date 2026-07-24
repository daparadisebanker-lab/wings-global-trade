// src/lib/torre/agent/provider.test.ts
import { describe, it, expect } from 'vitest'
import type { QuoteCoreResult } from '@/lib/torre/quote-core'
import type { QuoteToolInput } from './tools'
import { orderMilestones, specFromQuoteInput, quoteToolResultFromCore } from './provider'

describe('orderMilestones', () => {
  it('marks stages done up to and including the current status', () => {
    const ms = orderMilestones('SHIPPED')
    expect(ms.map((m) => m.label)).toEqual(['CONTRACTED', 'IN_PRODUCTION', 'READY', 'SHIPPED', 'DELIVERED', 'CLOSED'])
    expect(ms.find((m) => m.label === 'READY')?.done).toBe(true)
    expect(ms.find((m) => m.label === 'SHIPPED')?.done).toBe(true)
    expect(ms.find((m) => m.label === 'DELIVERED')?.done).toBe(false)
  })

  it('leaves everything undone for an off-ladder status (e.g. CANCELLED)', () => {
    expect(orderMilestones('CANCELLED').every((m) => !m.done)).toBe(true)
  })

  it('marks only the first stage for a fresh order', () => {
    const ms = orderMilestones('CONTRACTED')
    expect(ms.filter((m) => m.done).map((m) => m.label)).toEqual(['CONTRACTED'])
  })
})

describe('specFromQuoteInput', () => {
  const input: QuoteToolInput = {
    productName: 'Grupo', brand: 'Cummins', model: 'C150', fuelType: 'diesel', engineCC: 5000,
    origin: 'china', incoterm: 'FOB', fob: 10000,
  }

  it('produces an understood spec with the incoterm as its single scenario', () => {
    const spec = specFromQuoteInput(input)
    expect(spec.understood).toBe(true)
    expect(spec.scenarios).toEqual(['FOB'])
    expect(spec.fob).toBe(10000)
    expect(spec.quantity).toBeNull()
  })

  it('ALWAYS forces freight and margin to null (server-sourced, never agent-supplied)', () => {
    // even if a caller somehow set them, the mapping drops them — the fabrication guard
    const spec = specFromQuoteInput({ ...input, quantity: 3, clientName: 'Sur', language: 'en' })
    expect(spec.freightInternational).toBeNull()
    expect(spec.marginPercent).toBeNull()
    // product facts still thread through
    expect(spec.quantity).toBe(3)
    expect(spec.clientName).toBe('Sur')
    expect(spec.language).toBe('en')
  })
})

describe('quoteToolResultFromCore', () => {
  const baseResult = {
    approvable: true,
    hojaCostos: { blockers: [] as { reason: { es: string; en: string } }[] },
  }

  it('maps a persisted, approvable core result', () => {
    const core = {
      result: baseResult,
      draftIds: { hojaCostos: 'h', cotizacion: 'c', comunicacion: 'm' },
      persisted: true,
    } as unknown as QuoteCoreResult
    expect(quoteToolResultFromCore(core)).toEqual({
      draftIds: { hojaCostos: 'h', cotizacion: 'c', comunicacion: 'm' },
      approvable: true,
      blockers: [],
      persisted: true,
      note: undefined,
    })
  })

  it('surfaces blocker reasons (es) and the persist note', () => {
    const core = {
      result: { approvable: false, hojaCostos: { blockers: [{ reason: { es: 'arancel ambiguo', en: 'ambiguous tariff' } }] } },
      draftIds: null,
      persisted: false,
      persistNote: { es: 'no se pudo guardar', en: 'could not save' },
    } as unknown as QuoteCoreResult
    const out = quoteToolResultFromCore(core)
    expect(out.approvable).toBe(false)
    expect(out.blockers).toEqual(['arancel ambiguo'])
    expect(out.note).toBe('no se pudo guardar')
  })
})
