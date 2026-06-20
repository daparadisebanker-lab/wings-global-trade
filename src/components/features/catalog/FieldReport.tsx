'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useFieldReport } from '@/hooks/useFieldReport'

interface FieldReportProps {
  categorySlug: string
  className?: string
  productSlug?: string
  productSpecs?: Record<string, unknown>
}

const REPORTS: Record<string, string> = {
  'maquinaria-agricola':
    'Este modelo opera en condiciones de altitud media hasta 3,200 msnm. Para uso en sierra peruana, verificar especificaciones de carburador con el proveedor antes de nacionalización. Rendimiento de combustible estimado en condiciones de altiplano: reducción del 12–18% respecto a especificaciones de fábrica.',
  camiones:
    'Verificar homologación para circulación en vías urbanas peruanas (Resolución Directoral MTC). Para rutas de costa a sierra, considerar potencia efectiva a altitud. Frenos de motor recomendados en pendientes >8%. Neumáticos: verificar índice de carga para GVW declarado.',
  buses:
    'Cumplimiento de normas SUTRAN para transporte interprovincial. Verificar capacidad de pasajeros declarada vs. homologación local. Para rutas de altura (>3,500 msnm): sistemas de calefacción y sellado de cabina deben ser verificados con el proveedor.',
  'equipo-industrial':
    'Verificar compatibilidad de voltaje (380V trifásico estándar Perú). Certificación INDECOPI requerida para equipos de elevación. Para uso en zonas francas (ZOFRATACNA/ZOFRI): consultar régimen de admisión temporal con agente de aduana.',
}

const FALLBACK =
  'Consulte con nuestro equipo técnico para verificar compatibilidad con su operación específica y requisitos de homologación locales.'

export default function FieldReport({
  categorySlug,
  className,
  productSlug,
  productSpecs: _productSpecs,
}: FieldReportProps) {
  const [open, setOpen] = useState(false)
  const { report, isLoading } = useFieldReport(productSlug ?? '')

  const staticContent = REPORTS[categorySlug] ?? FALLBACK

  const renderBody = () => {
    if (productSlug && isLoading) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <style>{`
            @keyframes shimmer {
              0% { opacity: 0.5; }
              50% { opacity: 1; }
              100% { opacity: 0.5; }
            }
          `}</style>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: '16px',
                background: 'rgba(0,30,80,0.06)',
                borderRadius: '2px',
                width: i === 2 ? '80%' : '100%',
                animation: 'shimmer 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      )
    }

    if (productSlug && report) {
      const lines = report.split('\n').filter(Boolean)
      const parsedLines = lines.map((line) => {
        const m = line.match(/^\[(.+?)\]\s+(.+)/)
        return m ? { tag: m[1], content: m[2] } : { tag: '', content: line }
      })

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {parsedLines.map(({ tag, content }, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span
                style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: '7.5px',
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.1em',
                  color: tag === 'ALTITUD' ? '#C4933F' : 'rgba(0,30,80,0.7)',
                  borderLeft: `2px solid ${tag === 'ALTITUD' ? '#C4933F' : 'rgba(0,30,80,0.3)'}`,
                  paddingLeft: '6px',
                  flexShrink: 0,
                  width: '88px',
                  paddingTop: '1px',
                }}
              >
                {tag}
              </span>
              <p
                style={{
                  fontSize: '13px',
                  color: 'rgba(0,30,80,0.8)',
                  lineHeight: 1.4,
                  margin: 0,
                }}
              >
                {content}
              </p>
            </div>
          ))}
        </div>
      )
    }

    // Static fallback: no productSlug, or productSlug with no report returned
    return (
      <p
        style={{
          fontFamily: 'Flexo, sans-serif',
          fontSize: '13px',
          lineHeight: 1.6,
          color: '#001E50',
          margin: 0,
        }}
      >
        {staticContent}
      </p>
    )
  }

  return (
    <div
      className={className}
      style={{
        borderLeft: '3px solid #C4933F',
        backgroundColor: '#F8F6F0',
        color: '#001E50',
      }}
    >
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '12px 16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#001E50',
        }}
        aria-expanded={open}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '10px',
            fontFamily: '"DM Mono", monospace',
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#001E50',
          }}
        >
          INFORME DE CAMPO
          <span
            style={{ fontSize: '8px', letterSpacing: '0.12em', color: 'rgba(0, 30, 80, 0.4)' }}
          >
            REG · OPS
          </span>
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 200ms ease',
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <path
            d="M2.5 5L7 9.5L11.5 5"
            stroke="#001E50"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="field-report-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden', padding: '0 16px 14px' }}
          >
            {renderBody()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
