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
import type { Audience } from './tone'

export type Channel = 'email' | 'whatsapp'

export interface OutboundMessage {
  channel: Channel
  to: string
  subject: string | null
  body: string
  audience: Audience
  /** The message's language verbatim (es/en/pt/…) — no lossy coercion, so audit is honest. */
  language: string
  /** Dedupe token (the draft id) — a real adapter keys on this so an approve-retry is idempotent. */
  idempotencyKey: string
}

export type SendRefusalReason = 'has-blockers' | 'no-recipient' | 'empty-body'

export type PreparedSend =
  | { ok: true; message: OutboundMessage }
  | { ok: false; reason: SendRefusalReason }

/**
 * PURE: turn an approved COMUNICACION into a sendable message, or refuse. Refuses when the
 * payload still carries blockers (unapprovable → must never send), has no recipient, or
 * has an empty body. `idempotencyKey` (the draft id) rides on the message so a retried
 * approve can't send twice. The payload's language rides through VERBATIM (a pt/zh body is
 * never relabeled es) — audit stays honest.
 */
export function prepareSend(payload: ComunicacionPayload, idempotencyKey: string): PreparedSend {
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
      language: payload.language, // verbatim — a 'pt'/'zh' body is never mislabeled 'es'
      idempotencyKey,
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
      // provider id keyed by the idempotency token — unique per message, stable on retry
      return { ok: true, channel, to: message.to, providerId: `mock-${channel}-${message.idempotencyKey}`, mocked: true }
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

/** A persisted outbox row — the audit trail for one approval's send (SENT or FAILED). */
export interface SendRecordRow {
  brand_id: string
  lane_id: string | null
  draft_id: string
  channel: Channel
  to_addr: string
  subject: string | null
  language: string
  provider_id: string | null
  status: 'SENT' | 'FAILED'
  /** The failure reason on a FAILED send (retryable-vs-dead lives here), null on SENT. */
  error: string | null
  mocked: boolean
}

/**
 * PURE: the outbox row for one approval's send. `draft_id` (the approved COMUNICACION) is the
 * idempotency key — a UNIQUE index on it makes the ledger at-most-once PER APPROVAL: a resend
 * is a fresh approval of a fresh (revised) draft with its own id, never a second row here. A
 * mock send records as SENT + mocked:true; a FAILED send keeps its reason for the audit.
 */
export function buildSendRow(
  message: OutboundMessage,
  result: SendResult,
  meta: { brandId: string; laneId: string | null; draftId: string },
): SendRecordRow {
  return {
    brand_id: meta.brandId,
    lane_id: meta.laneId,
    draft_id: meta.draftId,
    channel: message.channel,
    to_addr: message.to,
    subject: message.subject,
    language: message.language,
    provider_id: result.providerId ?? null,
    status: result.ok ? 'SENT' : 'FAILED',
    error: result.ok ? null : (result.error ?? 'unknown send error'),
    mocked: result.mocked,
  }
}

/** The outcome of send-on-approve: the send result + the ledger row that was persisted. */
export interface SendOnApproveOutcome {
  result: SendResult
  row: SendRecordRow
}

/**
 * The post-claim orchestration, extracted so the at-most-once/non-blocking contract is
 * UNIT-TESTABLE (the claim itself is DB, but this — send → build row → best-effort ledger —
 * is pure over injected deps). Ordering: the caller has ALREADY won the atomic DRAFT→APPROVED
 * claim before calling this, so the send happens exactly once. The ledger write is BEST-EFFORT:
 * the message has already left and the draft is APPROVED, so a ledger failure must NEVER throw
 * or unwind that — it is logged and swallowed. A unique-violation (23505) is a benign idempotent
 * no-op; anything else (e.g. an RLS refusal) is a real error worth surfacing in the logs.
 */
export async function runSendOnApprove(
  message: OutboundMessage,
  meta: { brandId: string; laneId: string | null; draftId: string },
  deps: {
    send: (message: OutboundMessage) => Promise<SendResult>
    record: (row: SendRecordRow) => Promise<{ error: unknown } | void>
  },
): Promise<SendOnApproveOutcome> {
  const result = await deps.send(message)
  const row = buildSendRow(message, result, meta)
  try {
    const res = await deps.record(row)
    const err = res && typeof res === 'object' && 'error' in res ? res.error : null
    if (err) {
      const code = typeof err === 'object' && err !== null && 'code' in err ? (err as { code?: string }).code : undefined
      if (code === '23505') console.warn('[torre/approve] outbox row already recorded (idempotent no-op)', message.idempotencyKey)
      else console.error('[torre/approve] outbox write failed (non-blocking)', err)
    }
  } catch (e) {
    console.error('[torre/approve] outbox write threw (non-blocking)', e)
  }
  return { result, row }
}
