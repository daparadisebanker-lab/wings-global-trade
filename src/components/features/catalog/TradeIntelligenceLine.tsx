'use client'

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

function LineText({
  text,
  sourceMarket,
  visible,
}: {
  text: string
  sourceMarket: string
  visible: boolean
}) {
  return (
    <p
      aria-label="Inteligencia comercial"
      data-source-market={sourceMarket}
      className="relative flex items-center pl-3 font-mono text-[11px] leading-snug text-navy/60 transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <span
        aria-hidden
        className="absolute left-0 top-1/2 h-[60%] w-[2px] -translate-y-1/2 bg-gold/70"
      />
      {text}
    </p>
  )
}

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

  const resolvedText =
    (slug ? dynamicIntelligence : null) ??
    staticIntelligence ??
    FALLBACK_INTELLIGENCE[categorySlug] ??
    DEFAULT_INTELLIGENCE

  if (slug && isLoading) return <Skeleton />

  return <LineText text={resolvedText} sourceMarket={sourceMarket} visible />
}
