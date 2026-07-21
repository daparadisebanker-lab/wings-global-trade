import Link from 'next/link'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProrrateoTool } from '@/components/costing'
import { listCostingLanes } from '@/lib/actions/costing'

// Prorrateo (peru-costing) — multi-item shared-cost allocation. Server-fetches
// the lanes the user can cost for, hands to the client ProrrateoTool (live
// allocation, validation, save, XLSX export).
export default async function ProrrateoPage() {
  const lanesResult = await listCostingLanes()

  if (lanesResult.error) {
    return (
      <EmptyState
        tag="CST · Prorrateo"
        title={{ es: 'Prorrateo', en: 'Cost allocation' }}
        description={{ es: 'No se pudo cargar el módulo.', en: 'Could not load the module.' }}
      />
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-6">
      <header className="flex flex-col gap-1 border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <Link href="/costing" className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary hover:text-lane-accent">
            ← Calculadora
          </Link>
          <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">CST · Prorrateo</span>
        </div>
        <h1 className="font-display text-t2 text-ink-primary">Prorrateo de gastos por ítem</h1>
      </header>
      <ProrrateoTool lanes={lanesResult.data} />
    </div>
  )
}
