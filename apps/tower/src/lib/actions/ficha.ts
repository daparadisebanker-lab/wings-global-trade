'use server'

// src/lib/actions/ficha.ts
// Ficha técnica — the product-facing "technical spec sheet". Alternate document
// over the EXISTING catalog data (tower.products / tower_02): no new migration.
// Follows the mutation law even for a read: auth → Zod parse → RLS-scoped query.
// RLS on tower.products is the only permission boundary; this file never gates
// with `if (role === …)`. There is no money on a ficha — only exhibited
// logistics numbers (CBM / MOQ / HS / packing), assembled here for the renderer.
import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase/server'
import { fail, ok, type ActionResult } from './result'
import { WINGS_ISSUER } from '@/lib/quotation/company'
import {
  type FichaDimensions,
  type FichaDocument,
  type FichaHighlight,
  type FichaLogistics,
  type FichaSpecRow,
} from '@/lib/quotation/ficha'

const uuidSchema = z.string().uuid()

async function requireUser() {
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false, error: fail('UNAUTHORIZED', 'Auth no configurado / Auth not configured') } as const
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') } as const
  return { ok: true, supabase: supabase.schema('tower'), user } as const
}

// ── Persisted shape (tower.products) ─────────────────────────────────────────
interface RawProductRow {
  id: string
  slug: string
  status: string
  category_path: string[] | null
  name: unknown
  specs: unknown
  hs_code: string | null
  moq: number | string | null
  cbm_per_unit: number | string | null
  /** Minted spec-sheet reference (FT-WGT-YYYY-NNNN); null until first assembled. */
  ficha_no: string | null
}

const PRODUCT_COLS = 'id,slug,status,category_path,name,specs,hs_code,moq,cbm_per_unit,ficha_no'

function num(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = typeof v === 'string' ? Number(v) : v
  return Number.isFinite(n) ? n : null
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/** A jsonb {es,en} localized string, a bare string, or null. */
function localized(v: unknown, locale: 'es' | 'en'): string | null {
  if (typeof v === 'string') return v
  if (isRecord(v)) {
    const val = v[locale] ?? v.es ?? v.en
    return typeof val === 'string' ? val : null
  }
  return null
}

/** Flatten a spec value (string / number / localized / array) to display text. */
function specValue(v: unknown): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'string') return v
  if (typeof v === 'number') return String(v)
  if (typeof v === 'boolean') return v ? 'Sí' : 'No'
  if (Array.isArray(v)) return v.map(specValue).join(', ')
  if (isRecord(v)) return localized(v, 'es') ?? '—'
  return '—'
}

// Keys handled by dedicated blocks (not shown in the generic spec table).
const RESERVED_SPEC_KEYS = new Set(['highlights', 'dimensions', 'packing'])

function extractSpecs(specs: unknown): FichaSpecRow[] {
  if (!isRecord(specs)) return []
  return Object.entries(specs)
    .filter(([key]) => !RESERVED_SPEC_KEYS.has(key))
    .map(([label, value]) => ({ label, value: specValue(value) }))
}

function extractHighlights(specs: unknown): FichaHighlight[] {
  if (!isRecord(specs) || !Array.isArray(specs.highlights)) return []
  return specs.highlights
    .map((h): FichaHighlight | null => {
      if (!isRecord(h)) return null
      const title = localized(h.title, 'es') ?? (typeof h.title === 'string' ? h.title : null)
      const body = localized(h.body, 'es') ?? (typeof h.body === 'string' ? h.body : null)
      if (!title && !body) return null
      return { title: title ?? '', body: body ?? '' }
    })
    .filter((h): h is FichaHighlight => h !== null)
}

function extractDimensions(specs: unknown): FichaDimensions | null {
  if (!isRecord(specs) || !isRecord(specs.dimensions)) return null
  const d = specs.dimensions
  const lengthMm = num(d.lengthMm as number | string | null)
  const widthMm = num(d.widthMm as number | string | null)
  const heightMm = num(d.heightMm as number | string | null)
  if (lengthMm == null && widthMm == null && heightMm == null) return null
  return { lengthMm, widthMm, heightMm }
}

function extractPacking(specs: unknown): { unitsPerCarton: number | null; cartonsPerPallet: number | null } {
  if (!isRecord(specs) || !isRecord(specs.packing)) return { unitsPerCarton: null, cartonsPerPallet: null }
  const p = specs.packing
  return {
    unitsPerCarton: num(p.unitsPerCarton as number | string | null),
    cartonsPerPallet: num(p.cartonsPerPallet as number | string | null),
  }
}

function toDocument(row: RawProductRow, fichaNo: string | null): FichaDocument {
  const packing = extractPacking(row.specs)
  const logistics: FichaLogistics = {
    hsCode: row.hs_code,
    moq: num(row.moq),
    moqUnit: 'unidades',
    cbmPerUnit: num(row.cbm_per_unit),
    unitsPerCarton: packing.unitsPerCarton,
    cartonsPerPallet: packing.cartonsPerPallet,
  }

  const category =
    Array.isArray(row.category_path) && row.category_path.length > 0 ? row.category_path.join(' / ') : null

  return {
    productId: row.id,
    fichaNo,
    nameEs: localized(row.name, 'es') ?? row.slug,
    nameEn: localized(row.name, 'en'),
    category,
    status: row.status,
    specs: extractSpecs(row.specs),
    highlights: extractHighlights(row.specs),
    logistics,
    dimensions: extractDimensions(row.specs),
    issuer: WINGS_ISSUER,
  }
}

/** Assemble the ficha técnica for a product (RLS-scoped read). */
export async function getFichaDocument(productId: string): Promise<ActionResult<FichaDocument>> {
  const parsed = uuidSchema.safeParse(productId)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')
  const auth = await requireUser()
  if (!auth.ok) return auth.error

  const { data, error } = await auth.supabase.from('products').select(PRODUCT_COLS).eq('id', parsed.data).maybeSingle()
  if (error || !data) return fail('FORBIDDEN_LANE', 'Producto no encontrado / Product not found')
  const row = data as unknown as RawProductRow

  // Mint the spec-sheet reference once, atomically, via the SECURITY DEFINER
  // counter fn (tower.mint_ficha_no, tower_38) — mirroring how a quote number is
  // minted (mint_quote_no). The function persists FT-WGT-YYYY-NNNN onto the
  // product and is idempotent (a ficha number is stable for the product's life),
  // so the number never changes across renders and is never re-minted. Persisting
  // lives in the definer function, not here, because a VIEWER/SALES reader cannot
  // write tower.products under RLS (products_upd, tower_08).
  let fichaNo = row.ficha_no
  if (!fichaNo) {
    const { data: minted, error: mintError } = await auth.supabase.rpc('mint_ficha_no', {
      p_product_id: parsed.data,
      p_year: new Date().getFullYear(),
    })
    if (mintError) return fail('VALIDATION', 'No se pudo emitir la ficha / Could not mint ficha number')
    fichaNo = (minted as string | null) ?? null
  }

  return ok(toDocument(row, fichaNo))
}
