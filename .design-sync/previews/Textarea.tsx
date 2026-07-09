import { Textarea } from '@wings/trade-ui'

const field = { maxWidth: 420, display: 'grid', gap: 8 } as const

export function Default() {
  return (
    <div style={{ ...field, padding: 24, background: '#F8F6F0' }}>
      <Textarea rows={4} placeholder="Especificaciones técnicas adicionales (dimensiones, voltaje, certificaciones requeridas)" />
      <Textarea
        rows={4}
        aria-label="Notas del pedido"
        defaultValue={'Contenedor 40HQ, 18 pallets de compresores de tornillo.\nConfirmar certificación CE antes de emitir la orden de compra.'}
      />
    </div>
  )
}

export function ErrorState() {
  return (
    <div style={{ ...field, padding: 24, background: '#F8F6F0' }}>
      <Textarea hasError rows={3} aria-label="Incoterm" defaultValue="Entrega en almacén de Callao, sin especificar Incoterm" />
      <p style={{ margin: 0, fontFamily: 'Teko', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--error, #DC2626)' }}>
        Falta indicar el Incoterm de la cotización
      </p>
    </div>
  )
}

export function OnNavy() {
  return (
    <div style={{ ...field, padding: 24, background: '#001E50' }}>
      <Textarea onNavy rows={4} placeholder="Comentarios para el equipo de operaciones" />
    </div>
  )
}

export function Disabled() {
  return (
    <div style={{ ...field, padding: 24, background: '#F8F6F0' }}>
      <Textarea disabled rows={3} aria-label="Estado del RFQ" defaultValue={'RFQ WGT-2026-0312 · en revisión por Transportes Andinos S.A.C.'} />
    </div>
  )
}
