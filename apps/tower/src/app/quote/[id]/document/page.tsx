// /quote/[id]/document — the official quotation as a print-ready page. Lives
// OUTSIDE the (shell) route group: no dark control-room chrome, a white A4
// surface the operator prints or saves as the client's PDF. RLS-scoped read via
// getQuotationDocument; force-dynamic because prices/validity are live and this
// must never be statically cached. Internal-only (never indexed).
import type { Metadata } from 'next'
import { getQuotationDocument } from '@/lib/actions/quotation'
import { QuotationDocument } from '@/components/pipeline/quotation-document'
import { PrintBar } from './PrintBar'
import './document-page.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Cotización — Wings Global Trade',
  robots: { index: false, follow: false },
}

export default async function QuotationDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getQuotationDocument(id)

  if (result.error) {
    return (
      <div className="qdoc-page">
        <div className="qdoc-error">
          <p>No se pudo cargar la cotización.</p>
          <p className="qdoc-error-sub">No existe o no tienes acceso a este documento.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="qdoc-page">
      <PrintBar quoteNo={result.data.quoteNo} />
      <QuotationDocument doc={result.data} />
    </div>
  )
}
