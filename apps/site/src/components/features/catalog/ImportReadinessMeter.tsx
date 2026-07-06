'use client'

import { useEffect, useState } from 'react'

interface ImportReadinessMeterProps {
  step: 1 | 2 | 3 | 4 | 5
}

const STEP_LABELS = ['PRODUCTO', 'EXPLORADO', 'VARIANTE', 'CONSULTA', 'ENVIADO'] as const

const STEP_ACTIONS: Record<number, string> = {
  1: '→ Revisa variantes',
  2: '→ Selecciona un modelo',
  3: '→ Abre el formulario',
  4: '→ Envía tu consulta',
  5: '',
}

export default function ImportReadinessMeter({ step }: ImportReadinessMeterProps) {
  const [displayedStep, setDisplayedStep] = useState(0)

  // Mount at 0 then advance, so the very first segment reads as forward motion
  // rather than appearing pre-filled (momentum, not a static loading bar).
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayedStep(step)
    }, 50)
    return () => clearTimeout(timer)
  }, [step])

  return (
    <div
      role="progressbar"
      aria-valuenow={step}
      aria-valuemin={1}
      aria-valuemax={5}
      aria-label="Progreso de consulta"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 0,
        boxShadow: displayedStep === 5 ? '0 0 0 1px rgba(196,147,63,0.22)' : 'none',
        transition: 'box-shadow 400ms ease',
        padding: '8px',
        margin: '-8px',
      }}
    >
      {/* Progress bar segments */}
      <div className="flex gap-[2px] w-full max-w-[200px]">
        {Array.from({ length: 5 }, (_, i) => {
          const segmentIndex = i + 1
          const isFilled = segmentIndex <= displayedStep
          // The leading edge is the segment most recently filled — it carries the
          // momentum. Settled segments sit quiet; only the frontier glows.
          const isLeadingEdge = segmentIndex === displayedStep
          // Segment 5 is the decision moment (submission). It earns more weight.
          const isDecision = segmentIndex === 5

          return (
            <div
              key={i}
              className="flex-1 h-1 rounded-sm overflow-hidden"
              style={{
                backgroundColor: isFilled
                  ? '#C4933F'
                  : 'rgba(0, 30, 80, 0.18)',
                // The decision segment, once reached, sits slightly taller in
                // presence via a subtle inner glow — the buyer is at the threshold.
                boxShadow:
                  isFilled && isDecision
                    ? '0 0 0 1px rgba(196, 147, 63, 0.35)'
                    : 'none',
                transition:
                  'background-color 450ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 450ms ease-out',
                transitionDelay: isFilled ? `${(segmentIndex - 1) * 70}ms` : '0ms',
                animation: isLeadingEdge
                  ? 'import-meter-advance 1.4s ease-in-out infinite'
                  : 'none',
              }}
            />
          )
        })}
      </div>

      {/* Label strip — one label per step segment */}
      <div style={{ display: 'flex', gap: '2px', width: '100%', maxWidth: '200px', marginTop: '4px' }}>
        {STEP_LABELS.map((label, i) => {
          const segN = i + 1
          const isActive = segN === displayedStep
          const isPast = segN < displayedStep
          return (
            <div key={i} style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
              <span style={{
                display: 'block',
                fontFamily: 'DM Mono, monospace',
                fontSize: '6px',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.06em',
                color: (isActive || isPast) ? 'rgba(0,30,80,0.65)' : 'rgba(0,30,80,0.18)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>{label}</span>
            </div>
          )
        })}
      </div>

      {/* Action prompt — contextual next-step nudge */}
      {displayedStep < 5 && STEP_ACTIONS[displayedStep] && (
        <p style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '9px',
          color: '#C4933F',
          textAlign: 'right',
          width: '100%',
          maxWidth: '200px',
          marginTop: '4px',
          opacity: displayedStep > 0 ? 1 : 0,
          transition: 'opacity 300ms ease',
        }}>
          {STEP_ACTIONS[displayedStep]}
        </p>
      )}

      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes import-meter-advance {
            0%   { opacity: 1; transform: translateX(0); }
            50%  { opacity: 0.78; transform: translateX(0.5px); }
            100% { opacity: 1; transform: translateX(0); }
          }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes import-meter-advance {
            0%, 100% { opacity: 1; transform: none; }
          }
        }
      `}</style>
    </div>
  )
}
