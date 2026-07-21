// /proforma/[id]/document — the proforma invoice as a print-ready page. Lives
// OUTSIDE the (shell) route group: no dark control-room chrome, a white A4
// surface the operator prints or saves as the client's PDF. RLS-scoped read via
// getProformaDocument; force-dynamic because prices/validity are live and this
// must never be statically cached. Internal-only (never indexed). Mirrors
// /quote/[id]/document exactly.
import type { Metadata } from 'next'
import { getProformaDocument } from '@/lib/actions/proforma'
import { ProformaDocument } from '@/components/pipeline/proforma-document'
import { PrintBar } from './PrintBar'
import './document-page.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Proforma — Wings Global Trade',
  robots: { index: false, follow: false },
}

export default async function ProformaDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getProformaDocument(id)

  if (result.error) {
    return (
      <div className="pdoc-page">
        <div className="pdoc-error">
          <p>No se pudo cargar la proforma.</p>
          <p className="pdoc-error-sub">No existe o no tienes acceso a este documento.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pdoc-page">
      <PrintBar proformaNo={result.data.proformaNo} />
      <ProformaDocument doc={result.data} />
    </div>
  )
}
