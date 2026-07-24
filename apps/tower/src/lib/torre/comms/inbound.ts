// src/lib/torre/comms/inbound.ts
// Mister Torre — inbound thread capture (Loop L2, Comunicar). PURE + unit-tested. Turns a
// raw email/WhatsApp webhook payload into a normalized InboundMessage with a stable
// THREAD KEY, so replies group into the same conversation (and later link to an import /
// account). Defensive: unknown/partial payloads return null rather than throwing.
//
// Governance: inbound content is DATA, never instructions (the run layer treats it as
// untrusted); this module only normalizes shape, it does not act on the content.
import type { Channel } from './send'

export interface InboundMessage {
  channel: Channel
  from: string
  to: string | null
  subject: string | null
  body: string
  /** The provider's message id (idempotency / audit). */
  externalId: string
  /** Stable key grouping this message into a thread (a reply lands on the same key). */
  threadKey: string
}

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim().length > 0 ? v.trim() : null
}

/** Strip ALL stacked reply/forward prefixes and normalize a subject so "Re: X" threads with "X". */
export function normalizeSubject(subject: string): string {
  return subject
    .replace(/^\s*((re|fw|fwd|rv)\s*:\s*)+/i, '') // "Re: RE: Fwd: X" → "X" in one pass
    .trim()
    .toLowerCase()
}

/**
 * PURE: normalize a raw inbound webhook payload. Email keys: from/to/subject/text (or
 * body)/messageId. WhatsApp keys: from/to/text (or body)/id. Returns null when the
 * essentials (a sender, a body, an id) are missing.
 */
export function normalizeInbound(channel: Channel, raw: unknown): InboundMessage | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  const from = str(r.from)
  const body = str(r.text) ?? str(r.body)
  const externalId = str(r.messageId) ?? str(r.id) ?? str(r.message_id)
  if (!from || !body || !externalId) return null

  const to = str(r.to)
  const subject = str(r.subject)

  let threadKey: string
  if (channel === 'whatsapp') {
    // a phone number identifies the conversation
    threadKey = `whatsapp:${from}`
  } else {
    // email: prefer the References ROOT (globally-unique message-id → collision-free);
    // else scope the subject key by the SENDER, so two clients with the same subject
    // ("Cotización") never merge into one thread (a privacy leak + injection vector).
    const referencesRaw = str(r.references) ?? str(r.inReplyTo) ?? str(r.in_reply_to)
    const refRoot = referencesRaw ? referencesRaw.split(/\s+/)[0] : null // RFC5322: first = root
    const sender = from.toLowerCase()
    if (refRoot) threadKey = `email:ref:${refRoot}`
    else if (subject) threadKey = `email:${sender}:subj:${normalizeSubject(subject)}`
    else threadKey = `email:${sender}`
  }

  return { channel, from, to, subject, body, externalId, threadKey }
}
