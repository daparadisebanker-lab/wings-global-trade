import { describe, expect, it } from 'vitest'
import { sourceLabel, summarizeWebhookHealth, type WebhookDelivery } from './webhooks-logic'

function delivery(over: Partial<WebhookDelivery>): WebhookDelivery {
  return {
    id: Math.random().toString(36).slice(2),
    source: 'REVALIDATE_OUT',
    direction: 'OUTBOUND',
    status: 'OK',
    reference: null,
    detail: {},
    occurredAt: '2026-07-06T10:00:00.000Z',
    ...over,
  }
}

describe('summarizeWebhookHealth', () => {
  it('folds counts, per-source health, and last-seen (max occurredAt wins)', () => {
    const rows: WebhookDelivery[] = [
      delivery({ source: 'REVALIDATE_OUT', status: 'OK', occurredAt: '2026-07-06T10:00:00.000Z' }),
      delivery({ source: 'REVALIDATE_OUT', status: 'FAILED', occurredAt: '2026-07-06T12:00:00.000Z' }),
      delivery({ source: 'REVALIDATE_CALLBACK', direction: 'INBOUND', status: 'OK', occurredAt: '2026-07-06T09:00:00.000Z' }),
    ]
    const s = summarizeWebhookHealth(rows, { windowDays: 14 })

    expect(s.totalOk).toBe(2)
    expect(s.totalFailed).toBe(1)
    expect(s.windowDays).toBe(14)

    const out = s.sources.find((x) => x.source === 'REVALIDATE_OUT')!
    expect(out).toMatchObject({ ok: 1, failed: 1, total: 2 })
    // Most recent REVALIDATE_OUT delivery is the 12:00 FAILED one.
    expect(out.lastSeen).toBe('2026-07-06T12:00:00.000Z')
    expect(out.lastStatus).toBe('FAILED')

    const cb = s.sources.find((x) => x.source === 'REVALIDATE_CALLBACK')!
    expect(cb).toMatchObject({ ok: 1, failed: 0, direction: 'INBOUND', lastStatus: 'OK' })
  })

  it('sorts ailing sources (any failures) ahead of healthy ones', () => {
    const rows: WebhookDelivery[] = [
      delivery({ source: 'HEALTHY', status: 'OK', occurredAt: '2026-07-06T12:00:00.000Z' }),
      delivery({ source: 'AILING', status: 'FAILED', occurredAt: '2026-07-06T08:00:00.000Z' }),
    ]
    const s = summarizeWebhookHealth(rows, { windowDays: 7 })
    expect(s.sources[0].source).toBe('AILING')
  })

  it('caps `recent` at the limit, newest first', () => {
    const rows = Array.from({ length: 5 }, (_, i) =>
      delivery({ source: 'REVALIDATE_OUT', occurredAt: `2026-07-06T0${i}:00:00.000Z` }),
    )
    const s = summarizeWebhookHealth(rows, { windowDays: 7, recentLimit: 2 })
    expect(s.recent).toHaveLength(2)
    expect(s.recent[0].occurredAt).toBe('2026-07-06T04:00:00.000Z')
    expect(s.recent[1].occurredAt).toBe('2026-07-06T03:00:00.000Z')
  })

  it('returns empty health for no rows', () => {
    const s = summarizeWebhookHealth([], { windowDays: 30 })
    expect(s).toMatchObject({ totalOk: 0, totalFailed: 0, sources: [], recent: [] })
  })
})

describe('sourceLabel', () => {
  it('labels known sources and falls back to the raw key', () => {
    expect(sourceLabel('REVALIDATE_OUT').en).toBe('Revalidation (outbound)')
    expect(sourceLabel('UNKNOWN_SRC')).toEqual({ es: 'UNKNOWN_SRC', en: 'UNKNOWN_SRC' })
  })
})
