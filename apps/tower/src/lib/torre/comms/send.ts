// src/lib/torre/comms/send.ts
// Mister Torre — the send layer (Loop L2, Comunicar). Sending is the ONE sacred side
// effect: it happens only on a permissioned human's approval, and only for a COMUNICACION
// that is actually sendable. This module is PURE + mock-first (MOCK_CONNECTORS): no real
// email/WhatsApp provider is wired, so the adapters RECORD the send instead of performing
// it. The approve action (later wiring) calls prepareSend → resolveSendAdapter().send.
//
// Governance encoded here (defense-in-depth, even though approval already gated it):
//   · a COMUNICACION with ANY open blocker is unapprovable → prepareSend REFUSES it;
//   · a message with no recipient or empty body cannot be sent;
//   · nothing sends without going through prepareSend first.
import type { ComunicacionPayload } from '@/lib/torre/artifacts'
import type { Audience, CommLanguage } from './tone'

export type Channel = 'email' | 'whatsapp'

export interface OutboundMessage {
  channel: Channel
  to: string
  subject: string | null
  body: string
  audience: Audience
  language: CommLanguage
}

export type SendRefusalReason = 'has-blockers' | 'no-recipient' | 'empty-body'

export type PreparedSend =
  | { ok: true; message: OutboundMessage }
  | { ok: false; reason: SendRefusalReason }

/**
 * PURE: turn an approved COMUNICACION into a sendable message, or refuse. Refuses when the
 * payload still carries blockers (unapprovable → must never send), has no recipient, or
 * has an empty body. The redactor's language rides through as-is.
 */
export function prepareSend(payload: ComunicacionPayload): PreparedSend {
  if ((payload.blockers?.length ?? 0) > 0) return { ok: false, reason: 'has-blockers' }
  const to = payload.to?.trim()
  if (!to) return { ok: false, reason: 'no-recipient' }
  if (!payload.body.trim()) return { ok: false, reason: 'empty-body' }
  return {
    ok: true,
    message: {
      channel: payload.channel,
      to,
      subject: payload.subject,
      body: payload.body,
      audience: payload.audience,
      language: (payload.language === 'en' ? 'en' : 'es') as CommLanguage,
    },
  }
}

export interface SendResult {
  ok: boolean
  channel: Channel
  to: string
  /** Provider message id (a mock id until a real provider is wired). */
  providerId?: string
  error?: string
  /** True when a mock adapter recorded the send instead of performing it. */
  mocked: boolean
}

export interface SendAdapter {
  channel: Channel
  send(message: OutboundMessage): Promise<SendResult>
}

/**
 * A mock adapter: RECORDS sends (deterministic ids) and never touches a real provider.
 * `sent` is the in-memory outbox a test (or the dev queue view) can assert against.
 */
export function mockAdapter(channel: Channel): SendAdapter & { sent: OutboundMessage[] } {
  const sent: OutboundMessage[] = []
  return {
    channel,
    sent,
    async send(message: OutboundMessage): Promise<SendResult> {
      if (message.channel !== channel) {
        return { ok: false, channel, to: message.to, error: `channel mismatch (${message.channel} → ${channel})`, mocked: true }
      }
      sent.push(message)
      return { ok: true, channel, to: message.to, providerId: `mock-${channel}-${sent.length}`, mocked: true }
    },
  }
}

/**
 * Resolve the adapter for a channel. MOCK_CONNECTORS: no real email/WhatsApp provider is
 * configured, so this always returns a mock recorder today. A real adapter is injected
 * here when the connector lands (the send-on-approve call site is unchanged).
 */
export function resolveSendAdapter(channel: Channel): SendAdapter {
  return mockAdapter(channel)
}
