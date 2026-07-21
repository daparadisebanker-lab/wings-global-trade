// /marcas/[brand]/contenedor/[code]/cotizacion — the represented-brand CONTAINER
// quote as a print-ready page (ALLOCATION archetype, root CLAUDE.md §5-bis: sold
// by slot, never by unit). Lives OUTSIDE the (shell) route group: no dark
// control-room chrome, a white A4 surface the operator prints or saves as the
// client's PDF. RLS-scoped read via getRbContainerQuoteByCode; force-dynamic
// because slot availability + pricing are live and this must never be statically
// cached. Internal-only (never indexed). Mirrors /ficha/[id]/document exactly.
//
// The per-slot price + buyer + requested slots/quantity arrive as query params
// (there is no persisted RB slot price and no migration is in scope); the action
// Zod-validates them and converts a requested quantity to slots server-side. With
// no price the document renders a wholesale RFQ posture ("Por cotizar").
//
// This one surface carries BOTH client deliverables: the quote document and, as a
// technical annex, the RB technical spec sheet driven by techSheetSections.
import type { Metadata } from 'next'
import { getRbContainerQuoteByCode, type RbQuoteInput } from '@/lib/actions/rb-quotation'
import { RbContainerQuoteDocument } from '@/components/pipeline/rb-container-quote'
import { RbTechSheet } from '@/components/pipeline/rb-tech-sheet'
import { PrintBar } from './PrintBar'
import './document-page.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Cotización de contenedor — Wings Global Trade',
  robots: { index: false, follow: false },
}

type SearchParams = Record<string, string | string[] | undefined>

function scalar(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v
}

/** Map the raw query string to the action's input (the action Zod-validates it). */
function toInput(sp: SearchParams): RbQuoteInput {
  return {
    slots: scalar(sp.slots),
    quantity: scalar(sp.quantity),
    level: scalar(sp.level) as RbQuoteInput['level'],
    pricePerSlotMinor: scalar(sp.pricePerSlotMinor),
    currency: scalar(sp.currency),
    taxBps: scalar(sp.taxBps),
    taxLabel: scalar(sp.taxLabel),
    validityDays: scalar(sp.validityDays),
    buyerCompany: scalar(sp.buyerCompany),
    buyerTaxId: scalar(sp.buyerTaxId),
    buyerAttention: scalar(sp.buyerAttention),
    buyerContact: scalar(sp.buyerContact),
  } as RbQuoteInput
}

export default async function RbContainerQuotePage({
  params,
  searchParams,
}: {
  params: Promise<{ brand: string; code: string }>
  searchParams: Promise<SearchParams>
}) {
  const { brand, code } = await params
  const sp = await searchParams
  const result = await getRbContainerQuoteByCode(brand, code, toInput(sp))

  if (result.error) {
    return (
      <div className="rbqdoc-page">
        <div className="rbqdoc-error">
          <p>No se pudo cargar la cotización del contenedor.</p>
          <p className="rbqdoc-error-sub">No existe o no tienes acceso a este contenedor.</p>
        </div>
      </div>
    )
  }

  const doc = result.data

  return (
    <div className="rbqdoc-page">
      <PrintBar quoteRef={doc.quoteRef} />
      <RbContainerQuoteDocument doc={doc} />
      <div className="rbqdoc-annex">
        <RbTechSheet
          productName={doc.productName}
          brandName={doc.brandName}
          containerCode={doc.containerCode}
          reference={doc.quoteRef}
          sections={doc.techSheet}
        />
      </div>
    </div>
  )
}
