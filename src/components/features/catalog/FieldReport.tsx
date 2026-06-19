'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface FieldReportProps {
  categorySlug: string
  className?: string
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

export default function FieldReport({ categorySlug, className }: FieldReportProps) {
  const [open, setOpen] = useState(false)
  const content = REPORTS[categorySlug] ?? FALLBACK

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
          <span style={{ fontSize: '8px', letterSpacing: '0.12em', color: 'rgba(0, 30, 80, 0.4)' }}>
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
          <path d="M2.5 5L7 9.5L11.5 5" stroke="#001E50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
            style={{ overflow: 'hidden' }}
          >
            <p
              style={{
                fontFamily: 'Flexo, sans-serif',
                fontSize: '13px',
                lineHeight: 1.6,
                color: '#001E50',
                padding: '0 16px 14px',
                margin: 0,
              }}
            >
              {content}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
