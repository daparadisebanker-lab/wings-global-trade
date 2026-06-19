'use client'

interface ProvenanceRibbonProps {
  sourceMarket: string
  destination?: string
  /** Free-trade zone node label. Peru/Bolivia → ZOFRATACNA; Chile/Colombia → ZOFRI. */
  freeZone?: string
}

const SHIMMER_ID = 'provenance-shimmer'

export function ProvenanceRibbon({
  sourceMarket,
  destination = 'Destino',
  freeZone = 'ZOFRATACNA',
}: ProvenanceRibbonProps) {
  const nodes = [
    { x: 90, label: `Origen · ${sourceMarket}` },
    { x: 300, label: 'Puerto' },
    { x: 510, label: freeZone },
    { x: 710, label: destination },
  ]

  const lineY = 18
  const lineStart = nodes[0].x
  const lineEnd = nodes[nodes.length - 1].x
  // Pacific midpoint sits between Puerto and the free-zone node — the open-water leg.
  const shipX = (nodes[1].x + nodes[2].x) / 2

  return (
    <svg
      viewBox="0 0 800 52"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="52"
      aria-label={`Cadena de suministro: ${sourceMarket} hacia ${destination} vía ${freeZone}`}
      role="img"
      style={{ display: 'block' }}
    >
      <defs>
        {/* Moving highlight that travels along the manifest line — the cargo in transit. */}
        <linearGradient id={SHIMMER_ID} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#C4933F" stopOpacity="0" />
          <stop offset="45%" stopColor="#C4933F" stopOpacity="0" />
          <stop offset="50%" stopColor="#F8F6F0" stopOpacity="0.9" />
          <stop offset="55%" stopColor="#C4933F" stopOpacity="0" />
          <stop offset="100%" stopColor="#C4933F" stopOpacity="0" />
          <animate
            attributeName="x1"
            values="-1;1"
            dur="4.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="x2"
            values="0;2"
            dur="4.5s"
            repeatCount="indefinite"
          />
        </linearGradient>
      </defs>

      <rect width="800" height="52" fill="#001E50" />

      {/* Registration ticks — corners of the manifest field */}
      <g stroke="#C4933F" strokeWidth="1" strokeOpacity="0.35">
        <line x1="12" y1="8" x2="20" y2="8" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="788" y1="8" x2="780" y2="8" />
        <line x1="788" y1="8" x2="788" y2="16" />
      </g>

      {/* Base dashed manifest line */}
      <line
        x1={lineStart}
        y1={lineY}
        x2={lineEnd}
        y2={lineY}
        stroke="#C4933F"
        strokeWidth="1"
        strokeOpacity="0.55"
        strokeDasharray="3 5"
        strokeLinecap="round"
      />

      {/* Shimmer overlay travelling along the same path */}
      <line
        x1={lineStart}
        y1={lineY}
        x2={lineEnd}
        y2={lineY}
        stroke={`url(#${SHIMMER_ID})`}
        strokeWidth="1.5"
        strokeDasharray="3 5"
        strokeLinecap="round"
      />

      {/* Cargo ship at the Pacific midpoint */}
      <g transform={`translate(${shipX - 9}, ${lineY - 11})`} aria-hidden="true">
        {/* hull */}
        <path
          d="M1 7 L17 7 L15 11 L3 11 Z"
          fill="#001E50"
          stroke="#C4933F"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* deck house */}
        <rect x="6" y="3.5" width="6" height="3.5" fill="#C4933F" />
        {/* stacked containers */}
        <rect x="3" y="5" width="2" height="2" fill="#F8F6F0" fillOpacity="0.85" />
        <rect x="13" y="5" width="2" height="2" fill="#F8F6F0" fillOpacity="0.85" />
        {/* mast */}
        <line x1="9" y1="0.5" x2="9" y2="3.5" stroke="#C4933F" strokeWidth="1" />
      </g>

      {/* Nodes */}
      {nodes.map((node, i) => {
        const terminal = i === 0 || i === nodes.length - 1
        return (
          <g key={node.x}>
            {terminal ? (
              <rect
                x={node.x - 3.5}
                y={lineY - 3.5}
                width="7"
                height="7"
                fill="#001E50"
                stroke="#C4933F"
                strokeWidth="1.25"
              />
            ) : (
              <circle cx={node.x} cy={lineY} r="3.25" fill="#C4933F" />
            )}
            <text
              x={node.x}
              y="42"
              textAnchor="middle"
              fill="#F8F6F0"
              fillOpacity="0.85"
              fontFamily="'DM Mono', 'Courier New', monospace"
              fontSize="8.5"
              letterSpacing="0.08em"
            >
              {node.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
