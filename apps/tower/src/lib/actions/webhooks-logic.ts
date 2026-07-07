// src/lib/actions/webhooks-logic.ts
// Pure aggregation for <WebhookHealth> (COMPONENT_TREE §6). Folds a bounded
// window of tower.webhook_deliveries rows into per-source health + overall
// counts. DB-free and deterministic — unit-tested without a client, same shape
// as signals.ts's aggregateSignalDeck.
import type { Localized } from '@/lib/i18n'

export type DeliveryStatus = 'OK' | 'FAILED'
export type DeliveryDirection = 'INBOUND' | 'OUTBOUND'

/** One row of tower.webhook_deliveries (camelCased). */
export interface WebhookDelivery {
  id: string
  source: string
  direction: DeliveryDirection
  status: DeliveryStatus
  reference: string | null
  detail: Record<string, unknown>
  occurredAt: string
}

/** Health of one delivery source over the window. */
export interface SourceHealth {
  source: string
  direction: DeliveryDirection
  ok: number
  failed: number
  total: number
  /** ISO timestamp of the most recent delivery from this source, or null. */
  lastSeen: string | null
  /** Status of that most recent delivery — the at-a-glance health signal. */
  lastStatus: DeliveryStatus | null
}

export interface WebhookHealthSummary {
  windowDays: number
  totalOk: number
  totalFailed: number
  sources: SourceHealth[]
  /** The most recent N deliveries across all sources, newest first. */
  recent: WebhookDelivery[]
}

/** Human labels for the known sources; unknown sources fall back to the key. */
export const SOURCE_LABELS: Record<string, Localized> = {
  REVALIDATE_OUT: { es: 'Revalidación (salida)', en: 'Revalidation (outbound)' },
  REVALIDATE_CALLBACK: { es: 'Revalidación (confirmación)', en: 'Revalidation (callback)' },
  N8N_BRIEF: { es: 'n8n · Resumen semanal', en: 'n8n · Weekly brief' },
  N8N_DOCGEN: { es: 'n8n · Documentos', en: 'n8n · Document gen' },
}

export function sourceLabel(source: string): Localized {
  return SOURCE_LABELS[source] ?? { es: source, en: source }
}

/**
 * Fold delivery rows into the health summary. `recent` is capped to
 * `recentLimit` (already newest-first from SQL, but re-sorted defensively so
 * the fold is order-independent and fully testable).
 */
export function summarizeWebhookHealth(
  rows: WebhookDelivery[],
  opts: { windowDays: number; recentLimit?: number },
): WebhookHealthSummary {
  const recentLimit = opts.recentLimit ?? 50
  const bySource = new Map<string, SourceHealth>()
  let totalOk = 0
  let totalFailed = 0

  for (const r of rows) {
    if (r.status === 'OK') totalOk += 1
    else totalFailed += 1

    let s = bySource.get(r.source)
    if (!s) {
      s = { source: r.source, direction: r.direction, ok: 0, failed: 0, total: 0, lastSeen: null, lastStatus: null }
      bySource.set(r.source, s)
    }
    if (r.status === 'OK') s.ok += 1
    else s.failed += 1
    s.total += 1
    // Track the most-recent delivery per source (max occurredAt wins).
    if (s.lastSeen === null || r.occurredAt > s.lastSeen) {
      s.lastSeen = r.occurredAt
      s.lastStatus = r.status
      s.direction = r.direction
    }
  }

  const sources = [...bySource.values()].sort((a, b) => {
    // Ailing sources first (any failures), then by recency.
    if ((b.failed > 0 ? 1 : 0) !== (a.failed > 0 ? 1 : 0)) return (b.failed > 0 ? 1 : 0) - (a.failed > 0 ? 1 : 0)
    return (b.lastSeen ?? '').localeCompare(a.lastSeen ?? '')
  })

  const recent = [...rows].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).slice(0, recentLimit)

  return { windowDays: opts.windowDays, totalOk, totalFailed, sources, recent }
}
