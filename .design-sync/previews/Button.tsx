import { Button } from '@wings/trade-ui'

// Site reality: light (warm-white) sections carry navy ink; navy sections
// carry warm-white ink. `secondary` styles itself from the inherited color
// (border-current), so each ground states its ink explicitly.
const light = { padding: 24, background: '#F8F6F0', color: '#001E50' } as const
const navy = { padding: 24, background: '#001E50', color: '#F8F6F0' } as const
const row = { display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' } as const

export function Variants() {
  return (
    <div style={{ ...row, ...light }}>
      <Button variant="primary">Solicitar cotización</Button>
      <Button variant="secondary">Ver catálogo</Button>
      <Button variant="ghost">Descargar ficha</Button>
      <Button variant="whatsapp">Hablar por WhatsApp</Button>
    </div>
  )
}

export function SobreNavy() {
  return (
    <div style={{ ...row, ...navy }}>
      <Button variant="primary">Solicitar cotización</Button>
      <Button variant="secondary">Ver catálogo</Button>
      <Button variant="ghost">Descargar ficha</Button>
    </div>
  )
}

export function Sizes() {
  return (
    <div style={{ ...row, ...light }}>
      <Button variant="primary" size="sm">Consultar</Button>
      <Button variant="primary" size="md">Solicitar cotización</Button>
      <Button variant="primary" size="lg">Iniciar proyecto de importación</Button>
    </div>
  )
}

export function States() {
  return (
    <div style={{ ...row, ...light }}>
      <Button variant="primary" disabled>No disponible</Button>
      <Button variant="primary" isLoading>Enviando solicitud</Button>
      <Button variant="secondary" disabled>Cerrado</Button>
    </div>
  )
}
