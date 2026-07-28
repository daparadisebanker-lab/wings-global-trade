// El Pasillo — the two-tier catalogue type.
//
// A booth is a SERIES, not a product. A series holds 6–97 SKUs that share a
// format, a packing and a coverage. Series truth is stated once in the booth
// header and inherited by every SKU beneath it; a tile carries only what
// differs. Flattening the two tiers would repeat the packing figures dozens of
// times and someone would eventually typo one of them.

export type Finish = 'matte' | 'glossy' | 'massed_glaze'
export type Relief = 'flat' | 'sculptured' | 'uneven' | 'mold'
export type SeriesStatus = 'available' | 'made_to_order' | 'discontinued'

/**
 * How a SKU's printed faces relate to its printed pattern count — the spec's
 * highest-value validation, resolved at build time.
 *
 *  single    one face, one pattern
 *  multi     N faces, N patterns — the repeat may randomise across real faces
 *  composite one printed photo already showing N variants — tile it, never
 *            randomise, because only the one composite exists
 *  review    the two disagree in a way nothing can honestly reconcile; the UI
 *            says so rather than guessing
 */
export type FaceKind = 'single' | 'multi' | 'composite' | 'review'

export interface Series {
  series_uid: string
  supplier: string
  /** exactly as printed on the sheet's banner */
  name_raw: string
  format_mm: [number, number]
  thickness_mm: number
  pcs_per_ctn: number
  kgs_per_ctn: number
  /** computed: pcs × (w/1000) × (h/1000) — never typed */
  m2_per_ctn: number
  /** computed */
  sku_count: number
  status: SeriesStatus
  /** catalogue sheets this series was read from */
  pages: string[]
}

export interface Sku {
  sku_uid: string
  series_uid: string
  /** the code as printed — the string a buyer pastes into WhatsApp at 11pm */
  code: string
  /** factory/OEM line inferred from the code prefix */
  code_class: string
  /** preserved verbatim: when a supplier disputes a spec, this is the evidence */
  finish_raw: string
  finish: Finish
  relief: Relief
  pattern_count: number | null
  face_kind: FaceKind
  review_flag: boolean
  /** the supplier's own colour name, where they printed one */
  colour_name: string | null
  /** k-means dominant colours, most-covering first */
  colours: string[]
  /** one entry per printed face */
  faces: string[]
  thumb: string
}
