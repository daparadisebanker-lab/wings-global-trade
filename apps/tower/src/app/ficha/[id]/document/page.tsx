// /ficha/[id]/document — the product ficha técnica as a print-ready page. Lives
// OUTSIDE the (shell) route group: no dark control-room chrome, a white A4
// surface the operator prints or saves as the client's spec sheet. RLS-scoped
// read via getFichaDocument; force-dynamic because catalog data is live and this
// must never be statically cached. Internal-only (never indexed). Mirrors
// /quote/[id]/document exactly.
import type { Metadata } from 'next'
import { getFichaDocument } from '@/lib/actions/ficha'
import { FichaTecnicaDocument } from '@/components/pipeline/ficha-document'
import { PrintBar } from './PrintBar'
import './document-page.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Ficha técnica — Wings Global Trade',
  robots: { index: false, follow: false },
}

export default async function FichaDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getFichaDocument(id)

  if (result.error) {
    return (
      <div className="fdoc-page">
        <div className="fdoc-error">
          <p>No se pudo cargar la ficha técnica.</p>
          <p className="fdoc-error-sub">No existe o no tienes acceso a este producto.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fdoc-page">
      <PrintBar fichaNo={result.data.fichaNo} />
      <FichaTecnicaDocument doc={result.data} />
    </div>
  )
}
