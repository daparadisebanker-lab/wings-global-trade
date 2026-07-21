// src/lib/quotation/ficha.ts
// The FichaTecnicaDocument model — the shape the "Ficha técnica" (technical spec
// sheet) renderer consumes — plus the PURE logistics math behind it. A ficha is
// per product / represented-brand container: it EXHIBITS the trade numbers (CBM,
// MOQ, HS code, pallet/packing counts) as brand assets in tabular mono
// (CLAUDE.md Directive 5 · Numbers are exhibited, not hidden).
//
// Mirrors document.ts: presentation-agnostic and DB-agnostic. The server action
// (lib/actions/ficha.ts) assembles a FichaTecnicaDocument from a persisted
// tower.products row (name/specs/hs_code/moq/cbm_per_unit — no new migration),
// and the renderer (components/pipeline/ficha-document) draws it. There is no
// money on a ficha, so no minor-unit math lives here — only container/pack math.
import type { CompanyInfo } from './company'

// ── Spec + highlight content ─────────────────────────────────────────────────
/** One row of the ESPECIFICACIONES table (a product attribute). */
export interface FichaSpecRow {
  label: string
  value: string
}

/** One CARACTERÍSTICAS DESTACADAS highlight (a selling point). */
export interface FichaHighlight {
  title: string
  body: string
}

/** Optional overall dimensions block (mm), rendered as a numbers strip. */
export interface FichaDimensions {
  lengthMm: number | null
  widthMm: number | null
  heightMm: number | null
}

// ── The exhibited logistics numbers (the brand assets) ───────────────────────
export interface FichaLogistics {
  /** Customs classification (HS / partida arancelaria). */
  hsCode: string | null
  /** Minimum order quantity. */
  moq: number | null
  /** Unit the MOQ / packing counts are expressed in (e.g. "unidades", "cajas"). */
  moqUnit: string | null
  /** Cubic metres per unit — the container-planning number. */
  cbmPerUnit: number | null
  /** Packing: units per (export) carton. */
  unitsPerCarton: number | null
  /** Packing: cartons per pallet. */
  cartonsPerPallet: number | null
}

export interface FichaDocument {
  productId: string
  /** Spec-sheet reference (FT-WGT-YYYY-NNNN). null on an unsaved preview. */
  fichaNo: string | null
  /** Product name — ES primary. */
  nameEs: string
  /** Product name — EN secondary (bilingual header). */
  nameEn: string | null
  /** Human category path, e.g. "Chasis / Buses". */
  category: string | null
  status: string
  specs: FichaSpecRow[]
  highlights: FichaHighlight[]
  logistics: FichaLogistics
  dimensions: FichaDimensions | null
  issuer: CompanyInfo
}

// ── Pure math + formatting ───────────────────────────────────────────────────

/** FT-WGT-YYYY-NNNN — the ficha's spec-sheet reference (mirrors formatQuoteNo). */
export function formatFichaNo(year: number, seq: number): string {
  return `FT-WGT-${year}-${String(seq).padStart(4, '0')}`
}

/**
 * Fixed-decimal number for the tabular-mono exhibits. No currency, no locale
 * grouping ambiguity — a plain grouped decimal so CBM/MOQ read as brand assets.
 * Never used for money (that is always minor units via lib/money).
 */
export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/** CBM shown to 3 decimals with its unit, e.g. 2.35 -> "2.350 m³". */
export function formatCbm(cbm: number): string {
  return `${formatNumber(cbm, 3)} m³`
}

/**
 * Standard usable interior volume (CBM) of the common ocean containers — the
 * denominators for the container-fit exhibit. Conservative stowage figures, not
 * nominal box volume.
 */
export const CONTAINER_CBM: Record<string, number> = {
  '20GP': 33.2,
  '40GP': 67.7,
  '40HC': 76.4,
}

/**
 * How many whole units of a given per-unit CBM fit in a container volume.
 * Floors (no partial unit ships) and guards a zero/negative per-unit CBM.
 */
export function unitsPerContainer(cbmPerUnit: number, containerCbm: number): number {
  if (cbmPerUnit <= 0 || containerCbm <= 0) return 0
  return Math.floor(containerCbm / cbmPerUnit)
}

/** Units per pallet from packing counts (integer product, guards nulls). */
export function unitsPerPallet(unitsPerCarton: number | null, cartonsPerPallet: number | null): number | null {
  if (unitsPerCarton == null || cartonsPerPallet == null) return null
  if (!Number.isFinite(unitsPerCarton) || !Number.isFinite(cartonsPerPallet)) return null
  return Math.max(0, Math.round(unitsPerCarton * cartonsPerPallet))
}

/** A rendered exhibit row: bilingual label + tabular value (or an em dash). */
export interface FichaExhibit {
  label: string
  labelEn: string
  value: string
}

const EM_DASH = '—'

/**
 * Ordered exhibit rows for the logistics block — the numbers exhibited as brand
 * assets, in a fixed order, bilingual labels, tabular values. Absent numbers
 * render as "—" so the block is always complete (never a collapsed table).
 * Pure: given the same logistics it always returns the same rows.
 */
export function buildLogisticsExhibits(logistics: FichaLogistics): FichaExhibit[] {
  const moqUnit = logistics.moqUnit ?? 'unidades'
  const perPallet = unitsPerPallet(logistics.unitsPerCarton, logistics.cartonsPerPallet)
  return [
    {
      label: 'Código HS',
      labelEn: 'HS code',
      value: logistics.hsCode ?? EM_DASH,
    },
    {
      label: 'MOQ',
      labelEn: 'MOQ',
      value: logistics.moq != null ? `${formatNumber(logistics.moq)} ${moqUnit}` : EM_DASH,
    },
    {
      label: 'CBM por unidad',
      labelEn: 'CBM per unit',
      value: logistics.cbmPerUnit != null ? formatCbm(logistics.cbmPerUnit) : EM_DASH,
    },
    {
      label: 'Unidades por caja',
      labelEn: 'Units per carton',
      value: logistics.unitsPerCarton != null ? formatNumber(logistics.unitsPerCarton) : EM_DASH,
    },
    {
      label: 'Cajas por pallet',
      labelEn: 'Cartons per pallet',
      value: logistics.cartonsPerPallet != null ? formatNumber(logistics.cartonsPerPallet) : EM_DASH,
    },
    {
      label: 'Unidades por pallet',
      labelEn: 'Units per pallet',
      value: perPallet != null ? formatNumber(perPallet) : EM_DASH,
    },
    {
      label: 'Unidades por 40′ HC',
      labelEn: 'Units per 40′ HC',
      value:
        logistics.cbmPerUnit != null && logistics.cbmPerUnit > 0
          ? formatNumber(unitsPerContainer(logistics.cbmPerUnit, CONTAINER_CBM['40HC']))
          : EM_DASH,
    },
  ]
}
