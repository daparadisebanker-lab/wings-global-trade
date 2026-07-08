import { Select } from '@wings/trade-ui'

const field = { maxWidth: 360, display: 'grid', gap: 8 } as const

export function Default() {
  return (
    <div style={{ ...field, padding: 24, background: '#F8F6F0' }}>
      <Select aria-label="Incoterm" defaultValue="">
        <option value="" disabled>
          Seleccione Incoterm
        </option>
        <option value="EXW">EXW — Ex Works</option>
        <option value="FOB">FOB — Free On Board</option>
        <option value="CIF">CIF — Cost, Insurance and Freight</option>
        <option value="DAP">DAP — Delivered At Place</option>
      </Select>
      <Select aria-label="País de destino" defaultValue="PE">
        <option value="PE">Perú</option>
        <option value="CL">Chile</option>
        <option value="CO">Colombia</option>
        <option value="MX">México</option>
      </Select>
    </div>
  )
}

export function ErrorState() {
  return (
    <div style={{ ...field, padding: 24, background: '#F8F6F0' }}>
      <Select hasError aria-label="Puerto de destino" defaultValue="">
        <option value="" disabled>
          Seleccione puerto de destino
        </option>
        <option value="callao">Callao, Perú</option>
        <option value="valparaiso">Valparaíso, Chile</option>
      </Select>
      <p style={{ margin: 0, fontFamily: 'Teko', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--error, #DC2626)' }}>
        Seleccione un puerto de destino para continuar
      </p>
    </div>
  )
}

export function OnNavy() {
  return (
    <div style={{ ...field, padding: 24, background: '#001E50' }}>
      <Select onNavy aria-label="Modalidad de transporte" defaultValue="maritimo">
        <option value="maritimo">Marítimo — FCL</option>
        <option value="aereo">Aéreo</option>
        <option value="terrestre">Terrestre</option>
      </Select>
    </div>
  )
}

export function Disabled() {
  return (
    <div style={{ ...field, padding: 24, background: '#F8F6F0' }}>
      <Select disabled aria-label="Naviera asignada" defaultValue="cosco">
        <option value="cosco">COSCO Shipping</option>
      </Select>
    </div>
  )
}
