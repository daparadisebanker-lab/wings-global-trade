// Pure, dependency-free logic for the Quotations window — the display type, the
// join-row shapes, and the row mapper. Split out of quotations.ts because a
// `'use server'` file may only export async functions (Next.js constraint —
// mirrors pipeline.ts / pipeline-logic.ts). Unit-tested in quotations.test.ts.

export interface QuotationListItem {
  id: string
  /** COT-WGT-YYYY-NNNN once issued; null while still a draft. */
  quoteNo: string | null
  status: string
  /** Quote total (sum of line extensions), integer minor units. */
  totalMinor: number
  currency: string
  createdAt: string
  issuedOn: string | null
  clientName: string | null
  laneSlug: string | null
}

// ── Raw join shapes (Supabase returns nested relations as object|array) ──────
export type Nested<T> = T | T[] | null
interface RawAccountJoin {
  name: string | null
}
interface RawLaneJoin {
  slug: string | null
}
interface RawRfqJoin {
  accounts: Nested<RawAccountJoin>
  lanes: Nested<RawLaneJoin>
}
export interface RawQuotationRow {
  id: string
  quote_no: string | null
  status: string
  total_minor: number | string
  currency: string
  created_at: string
  issued_on: string | null
  rfqs: Nested<RawRfqJoin>
}

/** First element of a possibly-array nested relation, or null. */
export function one<T>(v: Nested<T>): T | null {
  if (Array.isArray(v)) return v.length > 0 ? v[0] : null
  return v ?? null
}

/** PURE: raw joined row → the flat display item. */
export function mapQuotationRow(row: RawQuotationRow): QuotationListItem {
  const rfq = one(row.rfqs)
  const account = rfq ? one(rfq.accounts) : null
  const lane = rfq ? one(rfq.lanes) : null
  const total = typeof row.total_minor === 'string' ? Number(row.total_minor) : row.total_minor
  return {
    id: row.id,
    quoteNo: row.quote_no,
    status: row.status,
    totalMinor: Number.isFinite(total) ? total : 0,
    currency: row.currency || 'USD',
    createdAt: row.created_at,
    issuedOn: row.issued_on,
    clientName: account?.name ?? null,
    laneSlug: lane?.slug ?? null,
  }
}

export const QUOTATION_SELECT =
  'id,quote_no,status,total_minor,currency,created_at,issued_on,rfqs!inner(accounts(name),lanes(slug))'
