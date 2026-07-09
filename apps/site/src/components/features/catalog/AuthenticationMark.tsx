'use client'

import { detectCertifications } from '@/lib/product-intelligence'

interface AuthenticationMarkProps {
  slug: string
  categoryCode: string
  hp?: number
  payload?: number
  specs?: Record<string, unknown>
}

const ALL_CERTS = [
  'CE', 'Euro II', 'Euro III', 'Euro IV', 'Euro V', 'Euro VI',
  'Stage II', 'Stage III', 'Stage IV', 'EPA Tier 4', 'INDECOPI', 'ISO 9001',
] as const

// hp and payload are kept in the props interface for API compatibility with
// ProductPassport but are no longer used to drive geometry — cert data takes over.
export function AuthenticationMark({ slug, categoryCode, specs }: AuthenticationMarkProps) {
  const detectedCerts = specs ? detectCertifications(specs) : []

  const slugSuffix = slug.slice(-6).toUpperCase()
  const code = categoryCode.toUpperCase()

  // Twelve registration ticks around the seal — like a notary's milled edge.
  // Each tick at index i maps to ALL_CERTS[i]; opacity encodes detection status.
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * Math.PI) / 6
    const inner = 30
    const outer = 33
    const certKey = ALL_CERTS[i]
    const isDetected = detectedCerts.includes(certKey)
    return {
      x1: 40 + inner * Math.cos(angle),
      y1: 40 + inner * Math.sin(angle),
      x2: 40 + outer * Math.cos(angle),
      y2: 40 + outer * Math.sin(angle),
      opacity: isDetected ? 0.85 : 0.15,
    }
  })

  const titleText =
    detectedCerts.length > 0
      ? detectedCerts.join(' · ')
      : 'Sin certificaciones declaradas'

  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      aria-label={`Marca de autenticación ${code} · ${slugSuffix}`}
      role="img"
    >
      <title>{titleText}</title>

      {/* Outer ring */}
      <circle cx="40" cy="40" r="37" fill="none" stroke="#C4933F" strokeWidth="2" />

      {/* Thin inner ring — depth between bezel and field */}
      <circle
        cx="40"
        cy="40"
        r="33"
        fill="none"
        stroke="#C4933F"
        strokeWidth="1"
        strokeOpacity="0.4"
      />

      {/* Milled-edge registration ticks — opacity encodes detected certifications */}
      <g stroke="#C4933F" strokeWidth="0.75">
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            strokeOpacity={t.opacity}
          />
        ))}
      </g>

      {/* Center: cert count replacing the spec-derived hexagon */}
      <text
        x="40"
        y="43"
        textAnchor="middle"
        fill="#C4933F"
        fontFamily="DM Mono"
        fontSize="14"
        fontWeight="500"
      >
        {detectedCerts.length}
      </text>
      <text
        x="40"
        y="52"
        textAnchor="middle"
        fill="#C4933F"
        fillOpacity={0.5}
        fontFamily="DM Mono"
        fontSize="5"
        letterSpacing="0.2em"
      >
        CERTS
      </text>

      {/* Center dot — registration anchor */}
      <circle cx="40" cy="40" r="1.5" fill="#C4933F" />

      {/* Slug suffix — engraved at the crown */}
      <text
        x="40"
        y="13.5"
        textAnchor="middle"
        fill="#C4933F"
        fillOpacity="0.55"
        fontFamily="'DM Mono', 'Courier New', monospace"
        fontSize="5.5"
        letterSpacing="0.2em"
      >
        {slugSuffix}
      </text>

      {/* Category code — stamped at the base */}
      <text
        x="40"
        y="71"
        textAnchor="middle"
        fill="#C4933F"
        fontFamily="'DM Mono', 'Courier New', monospace"
        fontSize="7"
        fontWeight="500"
        letterSpacing="0.2em"
      >
        {code}
      </text>
    </svg>
  )
}
