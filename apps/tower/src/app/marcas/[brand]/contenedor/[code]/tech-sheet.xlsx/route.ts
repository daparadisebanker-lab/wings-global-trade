// GET /marcas/[brand]/contenedor/[code]/tech-sheet.xlsx
// A TRUE .xlsx download of the represented-brand CONTAINER technical spec sheet —
// the Excel twin of the print annex on …/cotizacion (RbTechSheet). ALLOCATION
// archetype (root CLAUDE.md §5-bis): the numbers exhibited are container/slot/
// packing facts — brand assets (Directive 5), never a retail listing (Directive 2,
// wholesale only). Force-dynamic + Node runtime: exceljs needs Node, and slot
// availability is live so this must never be statically cached.
//
// Thin by law (result.ts MUTATION LAW): auth → RLS-scoped read → build → stream.
// The RLS-scoped read (getRbContainerQuoteByCode) is the ONLY permission boundary;
// this route never gates by role. The same query params the cotización page reads
// flow through so the Asignación (requested-slots) section matches the document.
import type { NextRequest } from 'next/server'
import { getRbContainerQuoteByCode, type RbQuoteInput } from '@/lib/actions/rb-quotation'
import { buildRbTechSheetWorkbook } from '@/lib/quotation/rb-tech-sheet-workbook'
import type { ActionErrorCode } from '@/lib/actions/result'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const XLSX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

/** Map the typed action error to an HTTP status (raw errors never reach the wire). */
function statusFor(code: ActionErrorCode): number {
  switch (code) {
    case 'UNAUTHORIZED':
      return 401
    case 'VALIDATION':
      return 400
    case 'RATE_LIMITED':
      return 429
    default:
      return 404 // FORBIDDEN_LANE et al. — never disclose existence
  }
}

/** Slugify for a safe attachment filename (ASCII, no quotes/spaces). */
function safeName(s: string): string {
  return s.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'contenedor'
}

/** Query string → the action's input (the action Zod-validates every field). */
function toInput(sp: URLSearchParams): RbQuoteInput {
  const g = (k: string) => sp.get(k) ?? undefined
  return {
    slots: g('slots'),
    quantity: g('quantity'),
    level: g('level') as RbQuoteInput['level'],
    pricePerSlotMinor: g('pricePerSlotMinor'),
    currency: g('currency'),
    taxBps: g('taxBps'),
    taxLabel: g('taxLabel'),
    validityDays: g('validityDays'),
    buyerCompany: g('buyerCompany'),
    buyerTaxId: g('buyerTaxId'),
    buyerAttention: g('buyerAttention'),
    buyerContact: g('buyerContact'),
  } as RbQuoteInput
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brand: string; code: string }> },
) {
  const { brand, code } = await params
  const { searchParams } = new URL(request.url)

  const result = await getRbContainerQuoteByCode(brand, code, toInput(searchParams))
  if (result.error) {
    return new Response(result.error.message, { status: statusFor(result.error.code) })
  }

  const doc = result.data
  const workbook = buildRbTechSheetWorkbook(doc)
  const body = await workbook.xlsx.writeBuffer()

  const filename = `ficha-tecnica-${safeName(doc.brandSlug)}-${safeName(doc.containerCode)}.xlsx`

  return new Response(body as ArrayBuffer, {
    status: 200,
    headers: {
      'Content-Type': XLSX_CONTENT_TYPE,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
