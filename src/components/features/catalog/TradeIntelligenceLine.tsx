'use client'

import { useState } from 'react'
import { useTradeIntelligence } from '@/hooks/useTradeIntelligence'

interface TradeIntelligenceLineProps {
  intelligence?: string
  categorySlug: string
  sourceMarket: string
  slug?: string
}

const FALLBACK_INTELLIGENCE: Record<string, string> = {
  'maquinaria-agricola':
    'Segmento de mayor crecimiento en importaciones vía ZOFRATACNA, Q4 2023.',
  camiones: 'Modelo con mayor rotación en operaciones de última milla, ZOFRATACNA 2023.',
  buses: 'Alta demanda en rutas interprovinciales de sierra central, 2023–2024.',
  'equipo-industrial': 'Activo en operaciones de zona franca Chile y Perú, 2023.',
}

const DEFAULT_INTELLIGENCE =
  'Origen verificado · Documentación completa · Disponible vía zona franca.'

function Skeleton() {
  return (
    <div className="relative flex items-center pl-3">
      <span
        aria-hidden
        className="absolute left-0 top-1/2 h-[60%] w-[2px] -translate-y-1/2 bg-gold/70"
      />
      <style>{`
        @keyframes ti-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ti-shimmer { animation: none !important; }
        }
      `}</style>
      <div
        aria-hidden
        className="ti-shimmer h-[11px] w-56 rounded-sm"
        style={{
          background:
            'linear-gradient(90deg,rgba(196,147,63,.12) 25%,rgba(196,147,63,.28) 50%,rgba(196,147,63,.12) 75%)',
          backgroundSize: '200% 100%',
          animation: 'ti-shimmer 1.4s ease-in-out infinite',
        }}
      />
    </div>
  )
}

export function TradeIntelligenceLine({
  intelligence: staticIntelligence,
  categorySlug,
  sourceMarket,
  slug,
}: TradeIntelligenceLineProps) {
  const { intelligence: dynamicIntelligence, isLoading } = useTradeIntelligence(slug ?? '')
  const [expanded, setExpanded] = useState(false)

  const resolvedText =
    (slug ? dynamicIntelligence : null) ??
    staticIntelligence ??
    FALLBACK_INTELLIGENCE[categorySlug] ??
    DEFAULT_INTELLIGENCE

  if (slug && isLoading) return <Skeleton />

  const match = resolvedText?.match(
    /^(TENDENCIA|DEMANDA|REGULACIÓN|RUTA|ZONA FRANCA)\s+(.*?)(?:\s·\s(Q\d\s\d{4}))?$/
  )
  const tag = match?.[1] ?? null
  const body = match?.[2] ?? resolvedText ?? ''
  const period = match?.[3] ?? null

  const sentences = resolvedText?.split(/\.\s+/).filter(Boolean) ?? []

  return (
    <div>
      <p
        aria-label="Inteligencia comercial"
        data-source-market={sourceMarket}
        className="relative flex items-center pl-3 font-mono text-[11px] leading-snug text-navy/60 transition-opacity duration-300"
        style={{ opacity: 1 }}
      >
        <span
          aria-hidden
          className="absolute left-0 top-1/2 h-[60%] w-[2px] -translate-y-1/2 bg-gold/70"
        />
        {tag && (
          <span
            style={{
              display: 'inline-block',
              fontFamily: 'DM Mono, monospace',
              fontSize: '7px',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.14em',
              color: 'rgba(196,147,63,0.85)',
              border: '1px solid rgba(196,147,63,0.3)',
              padding: '1px 4px',
              marginRight: '6px',
              verticalAlign: 'middle',
            }}
          >
            {tag}
          </span>
        )}
        {body}
        {period && (
          <span
            style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '9px',
              color: 'rgba(0,30,80,0.3)',
              marginLeft: '6px',
            }}
          >
            {period}
          </span>
        )}
        <button
          onClick={() => setExpanded((e) => !e)}
          style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '9px',
            color: '#C4933F',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginLeft: '8px',
            padding: 0,
            verticalAlign: 'middle',
          }}
        >
          {expanded ? '↑ cerrar' : '↓ ver análisis'}
        </button>
      </p>

      {expanded && (
        <div
          style={{
            borderLeft: '2px solid rgba(196,147,63,0.4)',
            paddingLeft: '10px',
            paddingTop: '6px',
            paddingBottom: '6px',
            marginTop: '6px',
          }}
        >
          {sentences.map((s, i) => (
            <p
              key={i}
              style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '10px',
                color: 'rgba(0,30,80,0.7)',
                marginBottom: '4px',
                lineHeight: 1.5,
              }}
            >
              · {s}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
