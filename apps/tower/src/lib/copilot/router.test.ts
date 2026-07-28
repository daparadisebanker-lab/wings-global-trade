// Router regression tests for the reported failure: a follow-up that answers a
// question Mister itself asked used to classify as 'none' and get the capability
// menu back. The router is now conversation-aware, and 'none' is a reply.
import { describe, it, expect, vi } from 'vitest'
import type { CompletionRequest, IntelligenceClient } from '@/lib/ai/client'
import { routeAndRun } from './router'
import { capabilityMenu } from './converse'
import { CAPABILITIES } from './registry'
import type { Turn } from './history'

/** A scripted client: `complete` returns the queued replies in order and records
 *  every request, so a test can assert what the router actually sent. */
function fakeClient(replies: string[]): IntelligenceClient & { requests: CompletionRequest[] } {
  const requests: CompletionRequest[] = []
  return {
    requests,
    async complete(req: CompletionRequest) {
      requests.push(req)
      return replies.shift() ?? ''
    },
    async *stream() {
      yield ''
    },
  }
}

/** The screenshot arc: Mister read a supplier offer and asked for the price. */
const HISTORY: Turn[] = [
  { who: 'op', text: '[captura adjunta]' },
  {
    who: 'mi',
    text: '[supplier-extract] Retroexcavadora china · product=Retroexcavadora · moq=1 unidad · unitPrice= · Léelo y pásame el precio para costear la importación',
  },
]

describe('routeAndRun — conversation awareness', () => {
  it('sends the transcript to the classifier ahead of the message', async () => {
    const client = fakeClient(['{"capability":"landed-cost"}', '{"understood":false,"note":"falta el FOB"}'])
    await routeAndRun(client, 'El precio es 25,000', undefined, undefined, HISTORY)

    const classify = client.requests[0]
    expect(classify.user).toContain('Retroexcavadora')
    expect(classify.user).toContain('MENSAJE A CLASIFICAR:\nEl precio es 25,000')
    expect(classify.user.indexOf('Retroexcavadora')).toBeLessThan(classify.user.indexOf('MENSAJE A CLASIFICAR'))
  })

  it('teaches the classifier that a follow-up continues the conversation', async () => {
    const client = fakeClient(['{"capability":"none"}', 'Anotado.'])
    await routeAndRun(client, 'ok', undefined, undefined, HISTORY)
    expect(client.requests[0].system).toContain('CONVERSACIÓN')
    expect(client.requests[0].system).toContain('Ante la duda entre "none" y una capacidad plausible')
  })

  it('hands the conversation to the routed capability, so it can fill the gaps', async () => {
    const cap = CAPABILITIES.find((c) => c.id === 'landed-cost')!
    const spy = vi.spyOn(cap, 'run').mockResolvedValue({ renderer: 'text', text: 'ok' })
    try {
      const client = fakeClient(['{"capability":"landed-cost"}'])
      await routeAndRun(client, 'El precio es 25,000', undefined, undefined, HISTORY)
      expect(spy).toHaveBeenCalledWith(client, 'El precio es 25,000', undefined, undefined, HISTORY)
    } finally {
      spy.mockRestore()
    }
  })

  it('hands the conversation to the vision capability on an attachment too', async () => {
    const cap = CAPABILITIES.find((c) => c.acceptsImage)!
    const spy = vi.spyOn(cap, 'run').mockResolvedValue({ renderer: 'text', text: 'ok' })
    try {
      const client = fakeClient([])
      const attachment = { mediaType: 'image/png', dataBase64: 'AAA' }
      await routeAndRun(client, '', attachment, undefined, HISTORY)
      expect(spy).toHaveBeenCalledWith(client, '', attachment, undefined, HISTORY)
      expect(client.requests).toHaveLength(0) // no classify call on an image
    } finally {
      spy.mockRestore()
    }
  })

  it('still routes with no history at all (the stateless path is unchanged)', async () => {
    const cap = CAPABILITIES.find((c) => c.id === 'container-fit')!
    const spy = vi.spyOn(cap, 'run').mockResolvedValue({ renderer: 'text', text: 'ok' })
    try {
      const client = fakeClient(['{"capability":"container-fit"}'])
      await routeAndRun(client, '¿Cuántas cajas de 1×1×1 entran en un 40HC?')
      expect(spy).toHaveBeenCalled()
      expect(client.requests[0].user).not.toContain('CONVERSACIÓN PREVIA')
    } finally {
      spy.mockRestore()
    }
  })
})

describe('routeAndRun — the "none" branch answers instead of dumping the menu', () => {
  it('replies conversationally, with the transcript in hand', async () => {
    const client = fakeClient(['{"capability":"none"}', 'Anotado: 25,000 USD. ¿Es FOB o CIF?'])
    const result = await routeAndRun(client, 'El precio es 25,000', undefined, undefined, HISTORY)

    expect(result.renderer).toBe('text')
    expect(result.text).toBe('Anotado: 25,000 USD. ¿Es FOB o CIF?')
    expect(result.text).not.toContain('Puedo ayudarte con')
    expect(client.requests[1].user).toContain('Retroexcavadora')
  })

  it('falls back to the deterministic menu when the reply comes back empty', async () => {
    const client = fakeClient(['{"capability":"none"}', '   '])
    const result = await routeAndRun(client, 'hola', undefined, undefined, [])
    expect(result.text).toBe(capabilityMenu())
  })

  it('falls back to the menu when the fallback call itself fails', async () => {
    const client: IntelligenceClient = {
      complete: vi
        .fn()
        .mockResolvedValueOnce('{"capability":"none"}')
        .mockRejectedValueOnce(new Error('transport')),
      async *stream() {
        yield ''
      },
    }
    const result = await routeAndRun(client, 'hola')
    expect(result.text).toBe(capabilityMenu())
  })

  it('the deterministic menu still lists every capability', () => {
    for (const c of CAPABILITIES) expect(capabilityMenu()).toContain(c.router.description)
  })
})
