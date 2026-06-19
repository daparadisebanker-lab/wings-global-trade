'use client'

interface AuthenticationMarkProps {
  slug: string
  categoryCode: string
  hp?: number
  payload?: number
}

function hexagonPoints(cx: number, cy: number, r: number, rotationDeg: number): string {
  const rotationRad = (rotationDeg * Math.PI) / 180
  return Array.from({ length: 6 }, (_, i) => {
    const angle = rotationRad + (i * Math.PI) / 3
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    return `${x.toFixed(2)},${y.toFixed(2)}`
  }).join(' ')
}

export function AuthenticationMark({ slug, categoryCode, hp, payload }: AuthenticationMarkProps) {
  // Geometry derived from the product's own specs — the mark is earned, not assigned.
  const rotation = (hp ?? 50) % 360
  const innerRadius = Math.min(Math.max((payload ?? 500) / 3000, 0.3), 0.9) * 22
  const slugSuffix = slug.slice(-6).toUpperCase()
  const code = categoryCode.toUpperCase()

  // Twelve registration ticks around the seal — like a notary's milled edge.
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * Math.PI) / 6
    const inner = 30
    const outer = 33
    return {
      x1: 40 + inner * Math.cos(angle),
      y1: 40 + inner * Math.sin(angle),
      x2: 40 + outer * Math.cos(angle),
      y2: 40 + outer * Math.sin(angle),
    }
  })

  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      aria-label={`Marca de autenticación ${code} · ${slugSuffix}`}
      role="img"
    >
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

      {/* Milled-edge registration ticks */}
      <g stroke="#C4933F" strokeWidth="0.75" strokeOpacity="0.5">
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
        ))}
      </g>

      {/* Spec-derived hexagon — the authenticated core */}
      <polygon
        points={hexagonPoints(40, 40, innerRadius, rotation)}
        fill="none"
        stroke="#C4933F"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
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
