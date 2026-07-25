import { describe, it, expect } from 'vitest'
import { parseWhatsappExport, parseClientExtract } from './whatsapp'

describe('parseWhatsappExport', () => {
  it('parses the iOS bracket format, drops the encryption notice, folds media', () => {
    const raw = [
      '[2/7/26, 2:29:00 p. m.] Renata Revol: Messages and calls are end-to-end encrypted.',
      '[2/7/26, 2:30:15 p. m.] Renata Revol: Hola, busco molduras 600x120',
      '[2/7/26, 2:31:00 p. m.] Asesor Wings: Perfecto, ¿qué volumen manejas?',
      '[2/7/26, 2:31:20 p. m.] Renata Revol: <Media omitted>',
      '[2/7/26, 2:31:40 p. m.] Renata Revol: 2 contenedores al mes',
    ].join('\n')
    const p = parseWhatsappExport(raw)
    expect(p.hasContent).toBe(true)
    expect(p.messageCount).toBe(4) // encryption line dropped
    expect(p.senders).toEqual(['Renata Revol', 'Asesor Wings'])
    expect(p.transcript).toContain('Renata Revol: Hola, busco molduras 600x120')
    expect(p.transcript).toContain('[media]')
    expect(p.transcript).not.toMatch(/end-to-end/i)
  })

  it('parses the Android dash format and folds a multi-line message', () => {
    const raw = ['2/7/26, 14:30 - Renata: Hola', '2/7/26, 14:31 - Renata: necesito cotizar', 'para un proyecto en Bolivia'].join(
      '\n',
    )
    const p = parseWhatsappExport(raw)
    expect(p.messageCount).toBe(2)
    expect(p.transcript).toContain('necesito cotizar\npara un proyecto en Bolivia')
  })

  it('detects phone-number senders (unsaved contacts)', () => {
    const raw = ['[2/7/26, 2:30 p. m.] +591 68173247: Hola', '[2/7/26, 2:31 p. m.] +591 68173247: precio?'].join('\n')
    const p = parseWhatsappExport(raw)
    expect(p.phones).toEqual(['+591 68173247'])
  })

  it('returns no content for junk / a single line', () => {
    expect(parseWhatsappExport('').hasContent).toBe(false)
    expect(parseWhatsappExport('not a chat at all').hasContent).toBe(false)
    expect(parseWhatsappExport('[2/7/26, 2:30 p. m.] X: sola').hasContent).toBe(false)
  })
})

describe('parseClientExtract', () => {
  it('reads a clean JSON profile and validates the archetype', () => {
    const raw = JSON.stringify({
      name: 'Renata Revol',
      country: 'Bolivia',
      city: 'Santa Cruz',
      category: 'Molduras',
      archetype: 'PROJECT',
      demand: '2 contenedores/mes de molduras 600x120',
      currency: 'usd',
      contactName: 'Renata Revol',
      contactWhatsapp: '+591 68173247',
      contactRole: 'Compras',
      summary: 'Prospecto de Bolivia interesado en molduras.',
      confidence: 0.82,
    })
    const d = parseClientExtract(raw)
    expect(d.hasContent).toBe(true)
    expect(d.name).toBe('Renata Revol')
    expect(d.archetype).toBe('PROJECT')
    expect(d.currency).toBe('USD')
    expect(d.confidence).toBeCloseTo(0.82, 2)
  })

  it('tolerates a ```json fence, drops an invalid archetype, and uses the fallback phone', () => {
    const raw = '```json\n{ "name": "ACME", "demand": "cables", "archetype": "NOPE" }\n```'
    const d = parseClientExtract(raw, '+51 999')
    expect(d.name).toBe('ACME')
    expect(d.archetype).toBeNull()
    expect(d.contactWhatsapp).toBe('+51 999')
    expect(d.hasContent).toBe(true)
  })

  it('is empty (no content) for non-JSON or a profile with nothing usable', () => {
    expect(parseClientExtract('sorry, no idea').hasContent).toBe(false)
    expect(parseClientExtract(JSON.stringify({ summary: 'nada', confidence: 0.1 })).hasContent).toBe(false)
  })
})
