import { describe, it, expect } from 'vitest'
import { parseProposalDraft } from './proposal-draft'

describe('parseProposalDraft', () => {
  it('extracts a full proposal with channel, subject, and both language bodies', () => {
    const raw = JSON.stringify({
      understood: true,
      channel: 'email',
      subjectEs: 'Propuesta: 200 scooters eléctricos',
      subjectEn: 'Proposal: 200 electric scooters',
      bodyEs: 'Estimado cliente,\n\nGracias por su interés...',
      bodyEn: 'Dear client,\n\nThank you for your interest...',
      note: 'Listo para enviar.',
    })
    const d = parseProposalDraft(raw)
    expect(d).not.toBeNull()
    expect(d!.channel).toBe('email')
    expect(d!.subjectEs).toContain('scooters')
    expect(d!.bodyEs).toContain('Estimado')
    expect(d!.bodyEn).toContain('Dear')
  })

  it('keeps a WhatsApp draft with no subject and null EN mirror', () => {
    const raw = JSON.stringify({
      understood: true,
      channel: 'whatsapp',
      subjectEs: null,
      subjectEn: null,
      bodyEs: 'Hola, le comparto la disponibilidad del contenedor...',
      bodyEn: '',
      note: '',
    })
    const d = parseProposalDraft(raw)
    expect(d).not.toBeNull()
    expect(d!.channel).toBe('whatsapp')
    expect(d!.subjectEs).toBeNull()
    expect(d!.bodyEn).toBeNull()
  })

  it('normalizes an unknown channel to null', () => {
    const raw = JSON.stringify({ channel: 'sms', bodyEs: 'texto' })
    const d = parseProposalDraft(raw)
    expect(d!.channel).toBeNull()
  })

  it('returns null when there is no Spanish body to show', () => {
    expect(parseProposalDraft(JSON.stringify({ understood: true, bodyEs: '', bodyEn: 'x' }))).toBeNull()
    expect(parseProposalDraft('not json at all')).toBeNull()
  })
})
