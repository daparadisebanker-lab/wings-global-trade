'use client'

interface EnvironmentalContextLayerProps {
  categorySlug: string
}

const STROKE = '#F8F6F0'

/**
 * The machine's environment, rendered as the document it would live inside.
 * Agriculture → nested topographic contour lines (a survey of terrain).
 * Trucks/buses → an orthogonal warehouse / logistics floor plan with bays.
 * Industrial → an engineering registration grid.
 * Held at ~3% so it is felt, never read.
 */
function EnvironmentField({ categorySlug }: EnvironmentalContextLayerProps) {
  if (categorySlug === 'maquinaria-agricola') {
    return (
      <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <pattern id="env-topo" width="320" height="240" patternUnits="userSpaceOnUse">
            {/* Nested contour lines — terrain read as elevation, like a topo survey */}
            <path d="M-20,180 C60,120 140,200 220,140 C300,90 360,170 420,120" fill="none" stroke={STROKE} strokeWidth="1" />
            <path d="M-20,150 C60,96 140,168 220,112 C300,66 360,140 420,96" fill="none" stroke={STROKE} strokeWidth="0.75" />
            <path d="M-20,120 C60,74 140,138 220,86 C300,46 360,112 420,74" fill="none" stroke={STROKE} strokeWidth="0.75" />
            <path d="M-20,210 C60,156 140,228 220,176 C300,128 360,200 420,156" fill="none" stroke={STROKE} strokeWidth="0.75" />
            <path d="M-20,90 C60,52 140,108 220,62 C300,28 360,88 420,54" fill="none" stroke={STROKE} strokeWidth="0.5" />
            {/* Survey spot-height tick */}
            <circle cx="220" cy="112" r="1.5" fill={STROKE} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#env-topo)" />
      </svg>
    )
  }

  if (categorySlug === 'camiones' || categorySlug === 'buses') {
    return (
      <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <pattern id="env-floor" width="220" height="160" patternUnits="userSpaceOnUse">
            {/* Warehouse floor plan: bay grid, dimension ticks, loading bay marks */}
            <rect x="0.5" y="0.5" width="219" height="159" fill="none" stroke={STROKE} strokeWidth="0.75" />
            <line x1="110" y1="0" x2="110" y2="160" stroke={STROKE} strokeWidth="0.5" />
            <line x1="0" y1="80" x2="220" y2="80" stroke={STROKE} strokeWidth="0.5" />
            {/* Bay subdivisions */}
            <line x1="55" y1="0" x2="55" y2="6" stroke={STROKE} strokeWidth="0.75" />
            <line x1="165" y1="0" x2="165" y2="6" stroke={STROKE} strokeWidth="0.75" />
            <line x1="55" y1="160" x2="55" y2="154" stroke={STROKE} strokeWidth="0.75" />
            <line x1="165" y1="160" x2="165" y2="154" stroke={STROKE} strokeWidth="0.75" />
            {/* Loading dock hatching, lower-left bay */}
            <line x1="8" y1="150" x2="48" y2="150" stroke={STROKE} strokeWidth="0.5" />
            <line x1="8" y1="150" x2="14" y2="142" stroke={STROKE} strokeWidth="0.5" />
            <line x1="20" y1="150" x2="26" y2="142" stroke={STROKE} strokeWidth="0.5" />
            <line x1="32" y1="150" x2="38" y2="142" stroke={STROKE} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#env-floor)" />
      </svg>
    )
  }

  if (categorySlug === 'equipo-industrial') {
    return (
      <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <pattern id="env-reg" width="48" height="48" patternUnits="userSpaceOnUse">
            {/* Engineering registration grid with corner crosses */}
            <path d="M48 0H0V48" fill="none" stroke={STROKE} strokeWidth="0.5" />
            <line x1="-3" y1="0" x2="3" y2="0" stroke={STROKE} strokeWidth="0.75" />
            <line x1="0" y1="-3" x2="0" y2="3" stroke={STROKE} strokeWidth="0.75" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#env-reg)" />
      </svg>
    )
  }

  return (
    <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <pattern id="env-dot" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill={STROKE} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#env-dot)" />
    </svg>
  )
}

export default function EnvironmentalContextLayer({ categorySlug }: EnvironmentalContextLayerProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-[0.03]"
    >
      <EnvironmentField categorySlug={categorySlug} />
    </div>
  )
}
