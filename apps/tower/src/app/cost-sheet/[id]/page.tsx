// /cost-sheet/[id] — printable SUNAT cost sheet (peru-costing Wave 6.3, PDF path).
// Top-level route (outside the (shell) group): a white sheet ops prints or saves
// as PDF. RLS-scoped read via getCostCalculation; force-dynamic; internal-only.
import type { Metadata } from 'next'
import { getCostCalculation } from '@/lib/actions/costing'
import { CostSheetDocument } from '@/components/costing'
import { PrintBar } from './PrintBar'
import '@/components/costing/cost-sheet.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Costo de importación — Wings Global Trade',
  robots: { index: false, follow: false },
}

export default async function CostSheetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getCostCalculation(id)

  if (result.error) {
    return (
      <div className="csheet-page">
        <div className="csheet-error">No existe o no tienes acceso a esta hoja de costo.</div>
      </div>
    )
  }

  const row = result.data
  const title = row.label || row.inputs.productName || row.inputs.brand || 'Costo de importación'

  return (
    <div className="csheet-page">
      <PrintBar title={title} />
      <CostSheetDocument inputs={row.inputs} result={row.result} label={row.label} createdAt={row.createdAt} />
    </div>
  )
}
