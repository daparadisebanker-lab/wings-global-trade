import Link from 'next/link'
import { EmptyState } from '@/components/ui/EmptyState'
import { CostCalculator } from '@/components/costing'
import { listCostCalculations, listCostingLanes } from '@/lib/actions/costing'

// Costing module (peru-costing Wave 6.2) — the Peru SUNAT landed-cost desk.
// Server-fetches the lanes the user can cost for + the initial lane's saved
// history, then hands to the client CostCalculator (live preview + append-only
// save). The calculator itself works standalone; a lane is required only to save.
export default async function CostingPage() {
  const lanesResult = await listCostingLanes()

  if (lanesResult.error) {
    return (
      <EmptyState
        tag="CST · Costeo"
        title={{ es: 'Costeo', en: 'Costing' }}
        description={{
          es: 'No se pudo cargar el módulo de costeo. Intenta de nuevo.',
          en: 'Could not load the costing module. Please try again.',
        }}
      />
    )
  }

  const lanes = lanesResult.data
  const firstLane = lanes[0]?.id
  const historyResult = firstLane ? await listCostCalculations(firstLane) : null
  const initialHistory = historyResult && historyResult.data ? historyResult.data : []

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">CST · Costeo SUNAT</span>
          <h1 className="font-display text-t2 text-ink-primary">Costo de importación (Perú)</h1>
        </div>
        {/* Sub-tools surfaced as clear buttons (were easy-to-miss header text links). */}
        <nav aria-label="Herramientas de costeo / Costing tools" className="flex flex-wrap items-center gap-2">
          <Link
            href="/costing/bulk"
            className="inline-flex items-center rounded-control border border-line bg-surface-1 px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-ink-primary transition-colors hover:border-lane-accent hover:text-lane-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lane-accent"
          >
            Importación masiva
          </Link>
          <Link
            href="/costing/prorrateo"
            className="inline-flex items-center rounded-control border border-line bg-surface-1 px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-ink-primary transition-colors hover:border-lane-accent hover:text-lane-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lane-accent"
          >
            Prorrateo
          </Link>
        </nav>
      </header>
      <CostCalculator lanes={lanes} initialHistory={initialHistory} />
    </div>
  )
}
