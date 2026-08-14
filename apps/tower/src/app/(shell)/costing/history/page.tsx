import { EmptyState } from '@/components/ui/EmptyState'
import { CostingHistoryView } from '@/components/costing'
import { listAllCostCalculations, listCostingLanes } from '@/lib/actions/costing'

// Full, filterable archive of saved cost calculations, across every lane the
// caller can read — the "browse the whole fleet" surface (peru-costing
// follow-up). Distinct from the in-calculator history list, which is one lane
// and capped for quick "reopen my last few" access. Also the bundling surface
// (multi-brand-dealer follow-up): a rep can select several saved calculations
// — even across brands, as long as they share a lane — and assemble them into
// one multi-line RFQ/quote in one step, instead of retyping each model's
// price by hand into QuoteComposer. `lanes` is fetched here (not derived from
// `rows`) so the bundling panel has each lane's brandId (for the client
// picker) and archetype (for the line unit) even for lanes with zero history.
export const dynamic = 'force-dynamic'

export default async function CostingHistoryPage() {
  const [result, lanesResult] = await Promise.all([listAllCostCalculations(), listCostingLanes()])

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

  return <CostingHistoryView rows={result.data} lanes={lanesResult.error ? [] : lanesResult.data} />
}
