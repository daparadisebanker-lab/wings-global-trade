import { RFQFlow } from '@wings/trade-ui'

// Capture-determinism patch (preview pages only, never ships in the bundle):
// RFQFlow gates its focus-on-mount, field-pulse, and valid-border framer-motion
// behind matchMedia checks. Forcing prefers-reduced-motion holds the form in its
// static first-step state (empty required fields, invisible pathLength-0 border)
// so the screenshot captures a stable render.
if (typeof window !== 'undefined') {
  const orig = window.matchMedia.bind(window)
  window.matchMedia = (q: string) =>
    q.includes('prefers-reduced-motion')
      ? ({ matches: true, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false } as MediaQueryList)
      : orig(q)
}

// Wings destination options + adapter config, ported from the site's InquiryForm.
// RFQFlow renders a surface-card on warm ground, so the cell supplies that ground.
const COUNTRIES = [
  'Perú',
  'Chile',
  'Colombia',
  'Panamá',
  'Costa Rica',
  'Bolivia',
  'R. Dominicana',
  'Otro',
] as const

const ground = { maxWidth: 480, padding: 24, background: '#F8F6F0', color: '#001E50' } as const

// Injected deps: the organ carries no toast/success dependency of its own.
const noop = () => {}
const renderSuccess = () => (
  <p style={{ padding: 24, fontFamily: 'var(--font-mono)', color: '#001E50' }}>
    Solicitud recibida
  </p>
)

export function Solicitud() {
  return (
    <div style={ground}>
      <RFQFlow
        productName="Compresor de tornillo 75 kW"
        productSlug="compresor-tornillo-75kw"
        countries={COUNTRIES}
        endpoint="/api/leads/catalog"
        storageKeyPrefix="wings_preview_solicitud_"
        notify={noop}
        renderSuccess={renderSuccess}
      />
    </div>
  )
}

export function ConModelo() {
  return (
    <div style={ground}>
      <RFQFlow
        productName="Bus AsiaStar JS6108GH"
        productSlug="asiastar-js6108gh"
        selectedVariant="Euro V · 45+1 asientos"
        countries={COUNTRIES}
        endpoint="/api/leads/catalog"
        storageKeyPrefix="wings_preview_modelo_"
        notify={noop}
        renderSuccess={renderSuccess}
      />
    </div>
  )
}
