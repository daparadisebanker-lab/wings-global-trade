import { EmptyState } from '@/components/ui/EmptyState'
import { CostingHistoryView } from '@/components/costing'
import { listAllCostCalculations } from '@/lib/actions/costing'

// Full, filterable archive of saved cost calculations, across every lane the
// caller can read — the "browse the whole fleet" surface (peru-costing
// follow-up). Distinct from the in-calculator history list, which is one lane
// and capped for quick "reopen my last few" access.
export const dynamic = 'force-dynamic'

export default async function CostingHistoryPage() {
  const result = await listAllCostCalculations()

  if (result.error) {
    return (
      <EmptyState
        tag="CST · Costeo"
        title={{ es: 'Historial de cálculos', en: 'Saved calculations' }}
        description={{
          es: 'No se pudo cargar el historial. Intenta de nuevo.',
          en: 'Could not load the history. Please try again.',
        }}
      />
    )
  }

  return <CostingHistoryView rows={result.data} />
}
