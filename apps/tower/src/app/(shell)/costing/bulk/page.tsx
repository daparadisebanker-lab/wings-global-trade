import Link from 'next/link'
import { EmptyState } from '@/components/ui/EmptyState'
import { BulkCostImport } from '@/components/costing'
import { listCostingLanes } from '@/lib/actions/costing'

// Bulk costing (peru-costing Wave 6.4) — file-in → rows-out. Server-fetches the
// lanes the user can cost for, hands to the client BulkCostImport (import,
// live per-row cost, batch save, XLSX export).
export default async function BulkCostingPage() {
  const lanesResult = await listCostingLanes()

  if (lanesResult.error) {
    return (
      <EmptyState
        tag="CST · Costeo masivo"
        title={{ es: 'Costeo masivo', en: 'Bulk costing' }}
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
          <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">CST · Costeo masivo</span>
        </div>
        <h1 className="font-ui text-t2 text-ink-primary">Importación masiva de costos</h1>
      </header>
      <BulkCostImport lanes={lanesResult.data} />
    </div>
  )
}
