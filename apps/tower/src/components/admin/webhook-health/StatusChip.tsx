// Delivery status chip — uppercase mono, dot + label, readable without color
// (DESIGN_SYSTEM status language). OK reads radar-green, FAILED alarm-red; the
// word carries the state so color is never the only signal.
import type { DeliveryStatus } from '@/lib/actions/webhooks-logic'

const STYLE: Record<DeliveryStatus, { dot: string; text: string }> = {
  OK: { dot: 'bg-positive', text: 'text-positive' },
  FAILED: { dot: 'bg-negative', text: 'text-negative' },
}

export function StatusChip({ status }: { status: DeliveryStatus }) {
  const s = STYLE[status]
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-label uppercase tracking-[0.1em] ${s.text}`}>
      <span aria-hidden className={`inline-block h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  )
}
