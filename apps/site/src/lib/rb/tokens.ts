// src/lib/rb/tokens.ts
// Represented Brands — the transform that turns a brand's live token bag into
// the inline --rb-* custom-property style the (brands) layout injects. This
// file holds ZERO brand hex: it only reshapes the values handed to it (the
// live TOWER kit manifest, read by getRbLiveBrandBySlug). The swap test lives
// here — any brand's five tokens produce the same seven variables, so no
// component ever carries a brand's identity.
//
// The live bag (RbLiveBrand.tokens, from identity.tokens jsonb) is keyed by
// the five fixed-contract names WITHOUT the --rb- prefix (root law §5-bis
// rule 2; TOWER RbTokenContractForm writes exactly these):
//   accent · accent-ink · accent-2 · ink · surface-tint
// We prefix each into its --rb-* custom property. --rb-accent-soft /
// --rb-accent-border are internal alpha variants (Tailwind slash opacity
// cannot modify var() colours — precedent noted in rb-canvas.css): derived
// here from accent so the derivation matches the CSS exactly and every
// consumer (SlotGrid, PackingDiagram, ContainerConfigurator) keeps working
// under live tokens.
import type { CSSProperties } from 'react'

/** The five contract keys as they arrive in the live token bag. */
const CONTRACT_KEYS = ['accent', 'accent-ink', 'accent-2', 'ink', 'surface-tint'] as const

// Alpha stops for the derived variants — kept identical to rb-canvas.css so
// the live path and the fixture CSS render byte-for-byte the same relief.
const ACCENT_SOFT_ALPHA = 0.1
const ACCENT_BORDER_ALPHA = 0.28

/** #rgb / #rrggbb → "r, g, b", or null when the value is not a plain hex
 *  (e.g. already an rgb()/named colour — then the alpha variants are skipped
 *  and the CSS fallbacks in rb-canvas.css stand). */
function hexChannels(hex: string): string | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return null
  let h = m[1]
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
  const int = parseInt(h, 16)
  return `${(int >> 16) & 255}, ${(int >> 8) & 255}, ${int & 255}`
}

/**
 * Build the inline `--rb-*` custom-property style from a brand's live token
 * bag (RbLiveBrand.tokens). Applied on the existing `[data-brand="{slug}"]`
 * element, it overrides the static fixture rule in rb-canvas.css for that
 * slug. Only the five known contract keys are read — arbitrary keys in the
 * bag are ignored, so a brand can never inject anything but its own theme.
 * Returns undefined when the bag carries none of the contract keys, so the
 * caller injects nothing and the fixture CSS stands (Áladín keeps rendering).
 */
export function rbTokenStyle(tokens: Record<string, string>): CSSProperties | undefined {
  const style: Record<string, string> = {}
  for (const key of CONTRACT_KEYS) {
    const value = tokens[key]
    if (value) style[`--rb-${key}`] = value
  }
  if (Object.keys(style).length === 0) return undefined

  const accent = tokens['accent']
  const channels = accent ? hexChannels(accent) : null
  if (channels) {
    style['--rb-accent-soft'] = `rgba(${channels}, ${ACCENT_SOFT_ALPHA})`
    style['--rb-accent-border'] = `rgba(${channels}, ${ACCENT_BORDER_ALPHA})`
  }
  return style as CSSProperties
}
