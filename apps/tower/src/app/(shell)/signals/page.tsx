import { EmptyState } from '@/components/ui/EmptyState'

// Signal Deck (analytics) — Waves 4–5. Placeholder shell surface.
export default function SignalsPage() {
  return (
    <EmptyState
      tag="SIG · Signal Deck"
      title={{ es: 'Señales', en: 'Signals' }}
      description={{
        es: 'Analítica: embudos por lane, tableros desde rollups y el brief semanal. En construcción.',
        en: 'Analytics: per-lane funnels, rollup-backed dashboards, and the weekly brief. Under construction.',
      }}
    />
  )
}
