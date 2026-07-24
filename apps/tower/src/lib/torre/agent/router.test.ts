// src/lib/torre/agent/router.test.ts
import { describe, it, expect, vi } from 'vitest'
import type { IntelligenceClient } from '@/lib/ai/client'
import { classifyIntent, parseRouterResponse, routeIntent } from './router'

/** A fake IntelligenceClient whose complete() returns a scripted string (or throws). */
function fakeClient(reply: string | (() => Promise<string>)): IntelligenceClient {
  return {
    complete: vi.fn(async () => (typeof reply === 'function' ? reply() : reply)),
    async *stream() {
      yield ''
    },
  }
}

describe('classifyIntent (pure heuristic)', () => {
  it('routes a quoting request to cotizador', () => {
    const d = classifyIntent('Cotiza un grupo electrógeno FOB 10000, margen 18%')
    expect(d.profile).toBe('cotizador')
    expect(d.source).toBe('heuristic')
  })

  it('routes a drafting request to redactor', () => {
    expect(classifyIntent('Redacta un correo al cliente con la cotización').profile).toBe('redactor')
  })

  it('routes a status question to operaciones', () => {
    expect(classifyIntent('¿Dónde está el contenedor? ¿Cuál es la ETA en Callao?').profile).toBe('operaciones')
  })

  it('routes a report request to analista and marks it batch', () => {
    const d = classifyIntent('Necesito un reporte de márgenes del mes y el pipeline')
    expect(d.profile).toBe('analista')
    expect(d.urgency).toBe('batch')
  })

  it('flags urgency inmediato on a demurrage-today request', () => {
    const d = classifyIntent('Hay demurrage en el contenedor, resuélvelo hoy')
    expect(d.profile).toBe('operaciones')
    expect(d.urgency).toBe('inmediato')
  })

  it('defaults to cotizador with normal urgency on no signal', () => {
    const d = classifyIntent('Hola, buenos días')
    expect(d.profile).toBe('cotizador')
    expect(d.urgency).toBe('normal')
    expect(d.reason).toMatch(/por defecto/)
  })
})

describe('parseRouterResponse (pure)', () => {
  it('parses a clean JSON reply', () => {
    expect(parseRouterResponse('{"profile":"redactor","urgency":"inmediato","reason":"x"}')).toEqual({
      profile: 'redactor',
      urgency: 'inmediato',
      reason: 'x',
    })
  })

  it('extracts JSON embedded in prose', () => {
    const out = parseRouterResponse('Claro: {"profile":"analista","urgency":"batch"} listo')
    expect(out).toEqual({ profile: 'analista', urgency: 'batch', reason: undefined })
  })

  it('rejects an unknown profile', () => {
    expect(parseRouterResponse('{"profile":"nope","urgency":"normal"}')).toBeNull()
  })

  it('rejects an unknown urgency', () => {
    expect(parseRouterResponse('{"profile":"cotizador","urgency":"soon"}')).toBeNull()
  })

  it('rejects non-JSON', () => {
    expect(parseRouterResponse('no json here')).toBeNull()
    expect(parseRouterResponse('{ broken')).toBeNull()
  })
})

describe('routeIntent (model-first, heuristic fallback)', () => {
  it('uses the heuristic when no client is configured', async () => {
    const d = await routeIntent(null, 'cotiza esto')
    expect(d.source).toBe('heuristic')
    expect(d.profile).toBe('cotizador')
  })

  it('uses the model reply when it is valid', async () => {
    const client = fakeClient('{"profile":"redactor","urgency":"normal","reason":"pide un correo"}')
    const d = await routeIntent(client, 'algo ambiguo')
    expect(d.source).toBe('model')
    expect(d.profile).toBe('redactor')
    expect(d.reason).toBe('pide un correo')
  })

  it('falls back to the heuristic on an unusable model reply', async () => {
    const client = fakeClient('lo siento, no sé')
    const d = await routeIntent(client, 'Redacta un correo')
    expect(d.source).toBe('heuristic')
    expect(d.profile).toBe('redactor') // heuristic still classifies it
  })

  it('falls back to the heuristic when the model throws', async () => {
    const client = fakeClient(() => Promise.reject(new Error('model-down')))
    const d = await routeIntent(client, 'cotiza un motor')
    expect(d.source).toBe('heuristic')
    expect(d.profile).toBe('cotizador')
  })
})
