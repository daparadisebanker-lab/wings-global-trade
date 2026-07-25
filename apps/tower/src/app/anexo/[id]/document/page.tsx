// /anexo/[id]/document — the landed-cost annex as a print-ready page. Outside the
// (shell) group: a white A4 surface the operator prints or saves as the client's
// PDF. RLS-scoped read via getAnexoDocument; force-dynamic (prices are live);
// never indexed. Mirrors /proforma/[id]/document.
import type { Metadata } from 'next'
import { getAnexoDocument } from '@/lib/actions/anexo'
import { AnexoDocument } from '@/components/pipeline/anexo-document'
import { PrintBar } from './PrintBar'
import './document-page.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Anexo — Wings Global Trade',
  robots: { index: false, follow: false },
}

export default async function AnexoDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getAnexoDocument(id)

  if (result.error) {
    return (
      <div className="adoc-page">
        <div className="adoc-error">
          <p>No se pudo cargar el anexo.</p>
          <p className="adoc-error-sub">No existe o no tienes acceso a este documento.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="adoc-page">
      <PrintBar anexoOf={result.data.anexoOf} />
      <AnexoDocument doc={result.data} />
    </div>
  )
}
