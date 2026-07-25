import { describe, expect, it } from 'vitest'
import { DOC_GRID, docGridCssVars, fieldWidth, round1 } from './grid'

describe('DOC_GRID — reproduces the GRID_SYSTEM.md spec table', () => {
  it('page + margins + rhythm', () => {
    expect(DOC_GRID.pageW).toBe(595.28)
    expect(DOC_GRID.pageH).toBe(841.89)
    expect(DOC_GRID.margin).toBe(29.5)
    expect(DOC_GRID.baseline).toBe(19.9)
  })

  it('field widths derive exactly from the vertical lines', () => {
    expect(fieldWidth(DOC_GRID.fields.rail)).toBe(41.4)
    expect(fieldWidth(DOC_GRID.fields.a)).toBe(70.0)
    expect(fieldWidth(DOC_GRID.fields.b)).toBe(116.6)
    expect(fieldWidth(DOC_GRID.fields.c)).toBe(116.7)
    expect(fieldWidth(DOC_GRID.fields.d)).toBe(125.4)
  })

  it('rail→A gutter is 13.9; the interior gutters are ~17.4', () => {
    expect(round1(DOC_GRID.fields.a[0] - DOC_GRID.fields.rail[1])).toBe(13.9)
    expect(round1(DOC_GRID.fields.c[0] - DOC_GRID.fields.b[1])).toBe(17.4)
    expect(round1(DOC_GRID.fields.d[0] - DOC_GRID.fields.c[1])).toBe(17.4)
  })

  it('content width = margin-to-margin, and money right-rail = line 10', () => {
    expect(round1(DOC_GRID.content.right - DOC_GRID.content.left)).toBe(536.3)
    expect(DOC_GRID.moneyRightRail).toBe(DOC_GRID.vlines[DOC_GRID.vlines.length - 1])
    expect(DOC_GRID.fieldDLeft).toBe(DOC_GRID.fields.d[0])
  })

  it('vlines are strictly increasing and 10 in count', () => {
    expect(DOC_GRID.vlines).toHaveLength(10)
    for (let i = 1; i < DOC_GRID.vlines.length; i++) {
      expect(DOC_GRID.vlines[i]).toBeGreaterThan(DOC_GRID.vlines[i - 1])
    }
  })
})

describe('docGridCssVars', () => {
  it('emits pt custom properties the CSS layer + @react-pdf mirror', () => {
    const v = docGridCssVars()
    expect(v['--doc-margin']).toBe('29.5pt')
    expect(v['--doc-baseline']).toBe('19.9pt')
    expect(v['--doc-money-rail']).toBe('565.6pt')
    expect(v['--doc-field-d-left']).toBe('440.2pt')
    expect(v['--doc-line-1']).toBe('29.3pt')
    expect(v['--doc-line-10']).toBe('565.6pt')
  })
})
