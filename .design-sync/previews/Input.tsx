import { Input } from '@wings/trade-ui'

const field = { maxWidth: 360, display: 'grid', gap: 8 } as const

export function Default() {
  return (
    <div style={{ ...field, padding: 24, background: '#F8F6F0' }}>
      <Input placeholder="Nombre de su empresa" />
      <Input defaultValue="Transportes Andinos S.A.C." aria-label="Empresa" />
    </div>
  )
}

export function ErrorState() {
  return (
    <div style={{ ...field, padding: 24, background: '#F8F6F0' }}>
      <Input hasError defaultValue="RUC 2054" aria-label="RUC" />
      <p style={{ margin: 0, fontFamily: 'Teko', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--error, #DC2626)' }}>
        RUC incompleto — debe tener 11 dígitos
      </p>
    </div>
  )
}

export function OnNavy() {
  return (
    <div style={{ ...field, padding: 24, background: '#001E50' }}>
      <Input onNavy placeholder="Correo corporativo" />
      <Input onNavy defaultValue="operaciones@transandinos.pe" aria-label="Correo" />
    </div>
  )
}

export function Disabled() {
  return (
    <div style={{ ...field, padding: 24, background: '#F8F6F0' }}>
      <Input disabled defaultValue="WGT-2026-0147" aria-label="Código de proyecto" />
    </div>
  )
}
