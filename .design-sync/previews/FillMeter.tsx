import { FillMeter } from '@wings/trade-ui'

// Capture-determinism patch (preview pages only, never ships in the bundle):
// FillMeter runs a ~400ms sequential framer-motion fill (scaleX 0 → 1) that
// races the screenshot and captures blank segments. Forcing prefers-reduced-
// motion routes the organ through useReducedMotion → doAnimate=false, so every
// segment renders at rest — the same output real reduced-motion users get.
if (typeof window !== 'undefined') {
  const orig = window.matchMedia.bind(window)
  window.matchMedia = (q: string) =>
    q.includes('prefers-reduced-motion')
      ? ({ matches: true, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false } as MediaQueryList)
      : orig(q)
}

// FillMeter lives on warm ground across the shared-container surfaces (invite
// landing, group workspace, lead console). The organ's card/border/mono tokens
// are tuned for that ground, so each cell mirrors the site's warm wrapper.
const ground = { padding: 24, background: '#F8F6F0', color: '#001E50' } as const

export function Apertura() {
  return (
    <div style={ground}>
      <FillMeter totalSlots={12} committedSlots={2} reservedSlots={1} size="md" />
    </div>
  )
}

export function MedioLleno() {
  return (
    <div style={ground}>
      <FillMeter totalSlots={12} committedSlots={6} reservedSlots={2} size="md" showLegend />
    </div>
  )
}

export function PorCerrar() {
  return (
    <div style={ground}>
      <FillMeter totalSlots={12} committedSlots={9} reservedSlots={2} size="lg" />
    </div>
  )
}

export function ConLeyenda() {
  return (
    <div style={ground}>
      <FillMeter totalSlots={10} committedSlots={4} reservedSlots={2} size="lg" showLegend />
    </div>
  )
}
