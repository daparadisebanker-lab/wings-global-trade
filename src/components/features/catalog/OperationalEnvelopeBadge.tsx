'use client'

import type { FC } from 'react'

interface OperationalEnvelopeBadgeProps {
  categorySlug: string
  className?: string
}

const ENVELOPE: Record<string, { altitude: string; climate: string; terrain: string }> = {
  'maquinaria-agricola': { altitude: 'Hasta 4.200 msnm', climate: 'Andino · Seco · Frío', terrain: 'Ladera · Valle · Llano' },
  'camiones':            { altitude: 'Hasta 4.500 msnm', climate: 'Costa · Sierra · Selva', terrain: 'Vía nacional · Urbano' },
  'buses':               { altitude: 'Hasta 4.200 msnm', climate: 'Costa · Sierra', terrain: 'Interprovincial · Urbano' },
  'equipo-industrial':   { altitude: 'Hasta 4.000 msnm', climate: 'Indoor · Exterior', terrain: 'Zona franca · Almacén' },
}

const OperationalEnvelopeBadge: FC<OperationalEnvelopeBadgeProps> = ({ categorySlug, className }) => {
  const env = ENVELOPE[categorySlug]
  if (!env) return null

  return (
    <div
      className={className}
      style={{
        background: 'rgba(0,30,80,0.82)',
        padding: '5px 8px',
        borderLeft: '1.5px solid rgba(196,147,63,0.5)',
      }}
    >
      <p style={{
        fontFamily: 'DM Mono, monospace',
        fontSize: '6px',
        color: '#C4933F',
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        marginBottom: '4px',
      }}>ENVOLVENTE</p>
      {[
        { label: 'ALT', value: env.altitude },
        { label: 'CLIMA', value: env.climate },
        { label: 'TERRENO', value: env.terrain },
      ].map(({ label, value }) => (
        <div key={label} style={{ display: 'flex', gap: '4px', marginBottom: '2px' }}>
          <span style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '6px',
            color: 'rgba(248,246,240,0.35)',
            display: 'inline-block',
            width: '44px',
            flexShrink: 0,
          }}>{label}</span>
          <span style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '7px',
            color: 'rgba(248,246,240,0.8)',
          }}>{value}</span>
        </div>
      ))}
    </div>
  )
}

export default OperationalEnvelopeBadge
