import Link from 'next/link'
import { EmptyState } from '@/components/ui/EmptyState'
import { CostingWorkbench } from '@/components/costing'
import { getCostCalculation, listCostCalculations, listCostingLanes } from '@/lib/actions/costing'
import { getSupplierOffer } from '@/lib/actions/suppliers'
import { getProduct } from '@/lib/actions/catalog'

// Costing module (peru-costing Wave 6.2) — the Peru SUNAT landed-cost desk.
// Server-fetches the lanes the user can cost for + the initial lane's saved
// history, then hands to the client CostCalculator (live preview + append-only
// save). The calculator itself works standalone; a lane is required only to save.
// `?offerId=` (from the Suppliers price book's "Costear" link) prefills the
// form from that FOB offer — the "any of the 76+ catalog models is one click
// from a full landed cost" hand-off. `?productId=` does the same from a PIM
// product (Catalog's "Costear" action) — no FOB (products don't carry price),
// but identity + HS code + the product's own archetype/profile prefill.
// `?calcId=` reopens a specific saved calculation for revision (the "Revisar →"
// link on /costing/history) — the full saved inputs, not just an identity prefill.
export default async function CostingPage({
  searchParams,
}: {
  searchParams: Promise<{ offerId?: string; productId?: string; calcId?: string }>
}) {
  const { offerId, productId, calcId } = await searchParams
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

  const offerResult = offerId ? await getSupplierOffer(offerId) : null
  const prefillOffer = offerResult && !offerResult.error ? offerResult.data : null

  const productResult = productId ? await getProduct(productId) : null
  const prefillProduct = productResult && !productResult.error ? productResult.data : null

  const calcResult = calcId ? await getCostCalculation(calcId) : null
  const prefillCalc = calcResult && !calcResult.error ? calcResult.data : null

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4 sm:p-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">CST · Costeo</span>
          <h1 className="font-display text-t2 text-ink-primary">Costeo por lane</h1>
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
          <Link
            href="/costing/history"
            className="inline-flex items-center rounded-control border border-line bg-surface-1 px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-ink-primary transition-colors hover:border-lane-accent hover:text-lane-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lane-accent"
          >
            Historial completo →
          </Link>
        </nav>
      </header>
      <CostingWorkbench
        lanes={lanes}
        initialHistory={initialHistory}
        prefillOffer={prefillOffer}
        prefillProduct={prefillProduct}
        prefillCalc={prefillCalc}
      />
    </div>
  )
}
