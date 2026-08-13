// Pure logic for the Supplier FOB Price Book — display types, the join-row
// shape, row mappers, and the shared vocabularies (source · status). Split from
// suppliers.ts because a 'use server' file may only export async functions
// (mirrors clients.ts / clients-logic.ts). Unit-tested.

export type SupplierOfferSource = 'whatsapp' | 'alibaba' | 'email' | 'manual' | 'other'
export type SupplierOfferStatus = 'ACTIVE' | 'EXPIRED' | 'SUPERSEDED'

export interface SupplierOption {
  id: string
  name: string
  country: string | null
  verified: boolean
}

export interface SupplierListItem extends SupplierOption {
  contactWhatsapp: string | null
  contactEmail: string | null
  notes: string | null
}

export interface SupplierOfferExtra {
  label: string
  value: string
}

export interface SupplierOfferListItem {
  id: string
  supplierId: string
  supplierName: string
  supplierCountry: string | null
  productId: string | null
  productLabel: string
  categoryPath: string[]
  unitPriceMinor: number | null
  currency: string | null
  priceUnit: string | null
  moq: string | null
  incoterm: string | null
  leadTimeDays: number | null
  port: string | null
  hsCode: string | null
  extras: SupplierOfferExtra[]
  source: SupplierOfferSource
  status: SupplierOfferStatus
  validUntil: string | null
  notes: string | null
  createdAt: string
}

// ── Shared vocabularies (ES/EN) ───────────────────────────────────────────────
export const OFFER_SOURCE_OPTIONS: { id: SupplierOfferSource; es: string; en: string }[] = [
  { id: 'manual', es: 'Manual', en: 'Manual' },
  { id: 'whatsapp', es: 'WhatsApp', en: 'WhatsApp' },
  { id: 'alibaba', es: 'Alibaba', en: 'Alibaba' },
  { id: 'email', es: 'Correo', en: 'Email' },
  { id: 'other', es: 'Otro', en: 'Other' },
]

export const OFFER_STATUS_OPTIONS: { id: SupplierOfferStatus; es: string; en: string }[] = [
  { id: 'ACTIVE', es: 'Vigente', en: 'Active' },
  { id: 'EXPIRED', es: 'Vencida', en: 'Expired' },
  { id: 'SUPERSEDED', es: 'Reemplazada', en: 'Superseded' },
]

const SOURCES: ReadonlySet<string> = new Set(OFFER_SOURCE_OPTIONS.map((s) => s.id))
const STATUSES: ReadonlySet<string> = new Set(OFFER_STATUS_OPTIONS.map((s) => s.id))

function label(options: { id: string; es: string; en: string }[], id: string, locale: 'es' | 'en'): string {
  const o = options.find((x) => x.id === id)
  return o ? o[locale] : id
}
export const offerSourceLabel = (id: string, locale: 'es' | 'en') => label(OFFER_SOURCE_OPTIONS, id, locale)
export const offerStatusLabel = (id: string, locale: 'es' | 'en') => label(OFFER_STATUS_OPTIONS, id, locale)

// ── Raw join shape (Supabase returns a nested relation as object|array) ──────
type Nested<T> = T | T[] | null
interface RawSupplierJoin {
  name: string | null
  country: string | null
}

export interface RawSupplierOfferRow {
  id: string
  supplier_id: string
  product_id: string | null
  product_label: string
  category_path: string[] | null
  unit_price_minor: number | string | null
  currency: string | null
  price_unit: string | null
  moq: string | null
  incoterm: string | null
  lead_time_days: number | string | null
  port: string | null
  hs_code: string | null
  extras: unknown
  source: string | null
  status: string | null
  valid_until: string | null
  notes: string | null
  created_at: string
  suppliers: Nested<RawSupplierJoin>
}

export interface RawSupplierRow {
  id: string
  name: string
  country: string | null
  verified: boolean | null
  contact_whatsapp: string | null
  contact_email: string | null
  notes: string | null
}

function one<T>(v: Nested<T>): T | null {
  if (Array.isArray(v)) return v.length > 0 ? v[0] : null
  return v ?? null
}

function num(v: number | string | null): number | null {
  if (v === null) return null
  const n = typeof v === 'string' ? Number(v) : v
  return Number.isFinite(n) ? n : null
}

/** PURE: raw jsonb → the offer's extra label/value rows, dropping malformed entries. */
export function parseOfferExtras(raw: unknown): SupplierOfferExtra[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((e): e is Record<string, unknown> => Boolean(e) && typeof e === 'object')
    .map((e) => ({
      label: typeof e.label === 'string' ? e.label : '',
      value: typeof e.value === 'string' ? e.value : '',
    }))
    .filter((e) => e.label && e.value)
    .slice(0, 8)
}

/** PURE: raw joined row → the flat display item. */
export function mapSupplierOfferRow(row: RawSupplierOfferRow): SupplierOfferListItem {
  const supplier = one(row.suppliers)
  return {
    id: row.id,
    supplierId: row.supplier_id,
    supplierName: supplier?.name ?? '',
    supplierCountry: supplier?.country ?? null,
    productId: row.product_id,
    productLabel: row.product_label,
    categoryPath: row.category_path ?? [],
    unitPriceMinor: num(row.unit_price_minor),
    currency: row.currency,
    priceUnit: row.price_unit,
    moq: row.moq,
    incoterm: row.incoterm,
    leadTimeDays: num(row.lead_time_days),
    port: row.port,
    hsCode: row.hs_code,
    extras: parseOfferExtras(row.extras),
    source: row.source && SOURCES.has(row.source) ? (row.source as SupplierOfferSource) : 'manual',
    status: row.status && STATUSES.has(row.status) ? (row.status as SupplierOfferStatus) : 'ACTIVE',
    validUntil: row.valid_until,
    notes: row.notes,
    createdAt: row.created_at,
  }
}

/** PURE: raw supplier row → the flat display item. */
export function mapSupplierRow(row: RawSupplierRow): SupplierListItem {
  return {
    id: row.id,
    name: row.name,
    country: row.country,
    verified: row.verified ?? false,
    contactWhatsapp: row.contact_whatsapp,
    contactEmail: row.contact_email,
    notes: row.notes,
  }
}

export const SUPPLIER_OFFER_SELECT =
  'id,supplier_id,product_id,product_label,category_path,unit_price_minor,currency,price_unit,moq,incoterm,lead_time_days,port,hs_code,extras,source,status,valid_until,notes,created_at,suppliers(name,country)'

export const SUPPLIER_SELECT = 'id,name,country,verified,contact_whatsapp,contact_email,notes'
