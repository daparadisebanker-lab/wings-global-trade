// src/lib/quotation/grid.ts
// The single source of truth for the Wings document grid — the pt values the four
// documents (proforma · cotización · ficha técnica · anexo) lay out on. Transcribed
// from programs/tower/doc-templates/grids/GRID_SYSTEM.md (measured from the official
// overlays). Renderer-agnostic: the shared print-CSS layer (document-grid.css) and a
// future @react-pdf StyleSheet both consume these same numbers via docGridCssVars().
//
// All values are PostScript points (pt). A4 portrait = 595.28 × 841.89 pt.

/** Round to one decimal (the spec's precision) — tames float noise on differences. */
export function round1(n: number): number {
  return Math.round(n * 10) / 10
}

export const DOC_GRID = {
  /** A4 portrait, pt. */
  pageW: 595.28,
  pageH: 841.89,
  /** Uniform margin on all four sides. */
  margin: 29.5,
  /** Vertical baseline rhythm — every text/table row snaps to this. */
  baseline: 19.9,
  /** Primary column gutter; the rail→field-A gutter is narrower. */
  gutter: 17.4,
  railGutter: 13.9,
  /** Content box edges. */
  content: { left: 29.3, right: 565.6, top: 29.5, bottom: 812.3 },
  /** The ten shared vertical grid lines, left → right (pt). */
  vlines: [29.3, 70.7, 84.6, 154.6, 172.1, 288.7, 306.1, 422.8, 440.2, 565.6],
  /** Content zones as [x0, x1] (pt): a left rail + four fields A–D. */
  fields: {
    rail: [29.3, 70.7],
    a: [84.6, 154.6],
    b: [172.1, 288.7],
    c: [306.1, 422.8],
    d: [440.2, 565.6],
  },
  /** Per-document interior splits the base skeleton does not carry. */
  extras: {
    proforma: [313.1, 397.8, 535.5], // Cant. / Precio unit. / Precio total column edges
    ficha: [297.4], // the spec-pair split
  },
  /** Alignment law: every currency figure right-aligns on line 10 (565.6), left edge 440.2. */
  moneyRightRail: 565.6,
  fieldDLeft: 440.2,
} as const

/** Width of a [x0, x1] field, pt (1-decimal). */
export function fieldWidth(field: readonly [number, number]): number {
  return round1(field[1] - field[0])
}

/**
 * The grid as CSS custom properties — the object the shared stylesheet mirrors and
 * a future @react-pdf StyleSheet can read, so both renderers stay in lockstep with
 * this file. Keys: --doc-margin, --doc-baseline, --doc-gutter, --doc-page-{w,h},
 * --doc-line-1..10, --doc-money-rail, --doc-field-d-left.
 */
export function docGridCssVars(): Record<string, string> {
  const vars: Record<string, string> = {
    '--doc-page-w': `${DOC_GRID.pageW}pt`,
    '--doc-page-h': `${DOC_GRID.pageH}pt`,
    '--doc-margin': `${DOC_GRID.margin}pt`,
    '--doc-baseline': `${DOC_GRID.baseline}pt`,
    '--doc-gutter': `${DOC_GRID.gutter}pt`,
    '--doc-money-rail': `${DOC_GRID.moneyRightRail}pt`,
    '--doc-field-d-left': `${DOC_GRID.fieldDLeft}pt`,
  }
  DOC_GRID.vlines.forEach((x, i) => {
    vars[`--doc-line-${i + 1}`] = `${x}pt`
  })
  return vars
}
