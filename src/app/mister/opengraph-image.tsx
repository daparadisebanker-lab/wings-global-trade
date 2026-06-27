import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Mister — Inteligencia de Pre-Calificación de Importación · Wings Global Trade'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#001E50',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
        }}
      >
        {/* Top: Wings wordmark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              color: 'rgba(255,255,255,0.45)',
              fontSize: '14px',
              letterSpacing: '4px',
              fontWeight: '600',
            }}
          >
            WINGS GLOBAL TRADE
          </div>
        </div>

        {/* Center: Mister identity */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Label */}
          <div
            style={{
              color: '#C4933F',
              fontSize: '13px',
              letterSpacing: '5px',
              fontWeight: '700',
            }}
          >
            INTELIGENCIA COMERCIAL B2B
          </div>

          {/* Name */}
          <div
            style={{
              color: 'white',
              fontSize: '96px',
              fontWeight: '700',
              lineHeight: '1',
              letterSpacing: '-3px',
            }}
          >
            Mister
          </div>

          {/* Descriptor */}
          <div
            style={{
              color: 'rgba(255,255,255,0.70)',
              fontSize: '26px',
              lineHeight: '1.35',
              maxWidth: '680px',
            }}
          >
            Pre-califica tu importación. Entiende la estructura de costos. Accede al equipo.
          </div>
        </div>

        {/* Bottom: archetype row */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
          }}
        >
          {['Comprador', 'Project Manager', 'Logística', 'Reseller', 'Wholesale B2B'].map(
            (label) => (
              <div
                key={label}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  color: 'rgba(255,255,255,0.60)',
                  fontSize: '13px',
                  letterSpacing: '0.5px',
                }}
              >
                {label}
              </div>
            )
          )}
        </div>
      </div>
    ),
    { ...size },
  )
}
