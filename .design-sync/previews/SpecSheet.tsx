import { SpecSheet } from '@wings/trade-ui'

// Capture-determinism patch (preview pages only, never ships in the bundle):
// the organ has a 0.3s framer-motion entrance that races the screenshot.
// Forcing prefers-reduced-motion makes it take its own visibleReduced path
// (duration 0) — the same rendering real reduced-motion users get.
if (typeof window !== 'undefined') {
  const orig = window.matchMedia.bind(window)
  window.matchMedia = (q: string) =>
    q.includes('prefers-reduced-motion')
      ? ({ matches: true, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false } as MediaQueryList)
      : orig(q)
}

export function FichaTecnica() {
  return (
    <div style={{ maxWidth: 420, padding: 24, background: '#000C1F' }}>
      <SpecSheet
        payload={{
          name: 'AsiaStar JS6108GH',
          category: 'Buses · Transporte de pasajeros',
          hs_code: '8702.10',
          Longitud: '10.5 m',
          Capacidad: '45+1 asientos',
          Motor: 'Yuchai YC6L280-30',
          Potencia: '206 kW',
          Transmisión: 'Manual · 6 velocidades',
          Norma: 'Euro V',
          Origen: 'Wuxi, China',
        }}
      />
    </div>
  )
}

export function Compacta() {
  return (
    <div style={{ maxWidth: 420, padding: 24, background: '#000C1F' }}>
      <SpecSheet
        payload={{
          name: 'Compresor de tornillo 75 kW',
          category: 'Equipos industriales',
          Caudal: '13.5 m³/min',
          Presión: '8 bar',
          Peso: '1 850 kg',
        }}
      />
    </div>
  )
}
