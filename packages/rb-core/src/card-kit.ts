// @wings/rb-core · card-kit.ts
// Shared brand primitives for the off-white share cards (container + product).
// The three livery constants, the DERIVED card palette, the Wings type system,
// WCAG colour math, and SVG escaping live here ONCE so BRAND never drifts between
// card renderers. resvg can't read CSS custom properties, so these mirror
// packages/liveries/wings/livery.css (--livery-warm-white / navy / gold) — keep
// them in sync with the livery; every other card colour is DERIVED from these.

// ── Colour math (so the palette is derived, never invented) ──────────────────
function hxToRgb(h: string): [number, number, number] {
  const s = h.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16)) as [number, number, number]
}
function rgbToHex(rgb: number[]): string {
  return '#' + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')
}
/** Flatten `fg` at alpha `a` over opaque `bg` — a provably in-family tint. */
export function mix(fg: string, bg: string, a: number): string {
  const F = hxToRgb(fg)
  const B = hxToRgb(bg)
  return rgbToHex(F.map((v, i) => B[i] * (1 - a) + v * a))
}
function _lin(c: number): number {
  const x = c / 255
  return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
}
export function luminance(h: string): number {
  const [r, g, b] = hxToRgb(h)
  return 0.2126 * _lin(r) + 0.7152 * _lin(g) + 0.0722 * _lin(b)
}
/** WCAG contrast ratio between two solid hex colours. */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

export const BRAND = { warmWhite: '#F8F6F0', navy: '#001E50', gold: '#C4933F' }

export const CARD = {
  size: 1080,
  bg: BRAND.warmWhite,
  ink: BRAND.navy, // edges, labels, headline
  gold: BRAND.gold, // default fill
  sub: mix(BRAND.navy, BRAND.warmWhite, 0.55), // secondary text — muted navy, flattened
  line: mix(BRAND.navy, BRAND.warmWhite, 0.2), // hairline divider
  tint: mix(BRAND.gold, BRAND.warmWhite, 0.08), // faint warm paper
}

/** Accent is safe as text only if it clears 4.5:1 on the ground (livery Phase-2
 *  law); otherwise fall back to navy ink. */
export function accentText(accent: string): string {
  return contrast(accent, CARD.bg) >= 4.5 ? accent : CARD.ink
}
/** Highest-contrast label colour for text sitting ON a filled shape. */
export function onFill(fill: string): string {
  return contrast('#ffffff', fill) >= contrast(CARD.ink, fill) ? '#ffffff' : CARD.ink
}

/** A safe accent hex (6-digit) or the brand gold fallback. */
export function safeAccent(accent?: string): string {
  return accent && /^#[0-9a-fA-F]{6}$/.test(accent) ? accent : CARD.gold
}

// Wings brand type system (apps/site/public/fonts, self-hosted): NissanOpti =
// display, Flexo = body, Teko = labels + numerals. Family names match both the
// font files' internal names (for resvg) and the @font-face declarations (for
// the browser preview/canvas). Arial is only the last-ditch fallback.
export const FONT_DISPLAY = "'NissanOpti', Arial, sans-serif"
export const FONT_BODY = "'Flexo', Arial, sans-serif"
export const FONT_LABEL = "'Teko', 'Arial Narrow', Arial, sans-serif"

export function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
