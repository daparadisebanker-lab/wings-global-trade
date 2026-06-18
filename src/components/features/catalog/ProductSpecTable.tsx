'use client'

import { useRef, useState, useEffect } from 'react'
import { useInView } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProductSpecTableProps {
  specs: Record<string, string>
}

type ViewMode = 'list' | 'grid'

const GROUPS: { label: string; pattern: RegExp }[] = [
  { label: 'Motor',       pattern: /HP|Potencia|RPM|Motor|Cilindro|Desplazamiento|Combustible|Aspiración|CV/i },
  { label: 'Transmisión', pattern: /Transmisión|Velocidad|Tracción|Embrague|Marcha/i },
  { label: 'Hidráulica',  pattern: /Hidráulico|Caudal|Presión|Enganche|PTO|Bomba/i },
  { label: 'Dimensiones', pattern: /Largo|Ancho|Alto|Peso|Longitud|Anchura|Altura|Batalla|Distancia/i },
  { label: 'Capacidad',   pattern: /Capacidad|Depósito|Tanque|Litro|Carga/i },
]

function getGroup(key: string): string {
  for (const g of GROUPS) {
    if (g.pattern.test(key)) return g.label
  }
  return 'General'
}

function splitValueSuffix(val: string): { num: number | null; suffix: string } {
  const numericMatch = val.match(/^([\d,]+\.?\d*)(.*)$/)
  if (numericMatch) {
    const n = parseFloat(numericMatch[1].replace(',', ''))
    if (!isNaN(n)) {
      return { num: n, suffix: numericMatch[2] }
    }
  }
  return { num: null, suffix: val }
}

function isMotorKey(key: string): boolean {
  return /HP|Potencia|CV/i.test(key)
}

function isMotorGroup(key: string): boolean {
  return GROUPS[0].pattern.test(key)
}

function groupEntries(
  entries: [string, string][],
): { label: string; items: [string, string][] }[] {
  const groupMap = new Map<string, [string, string][]>()
  const groupOrder: string[] = []

  for (const entry of entries) {
    const g = getGroup(entry[0])
    if (!groupMap.has(g)) {
      groupMap.set(g, [])
      groupOrder.push(g)
    }
    groupMap.get(g)!.push(entry)
  }

  return groupOrder.map((label) => ({ label, items: groupMap.get(label)! }))
}

export function ProductSpecTable({ specs }: ProductSpecTableProps) {
  const [mode, setMode] = useState<ViewMode>('list')
  const [progress, setProgress] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const duration = 900
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setProgress(eased)
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView])

  function renderValue(val: string): string {
    const { num, suffix } = splitValueSuffix(val)
    if (num === null) return val
    return String(Math.round(num * progress)) + suffix
  }

  const entries = Object.entries(specs)
  if (entries.length === 0) return null
  const groups = groupEntries(entries)

  return (
    <div ref={ref}>
      {/* Header + mode toggle */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-display-sm font-semibold text-navy">
          Especificaciones técnicas
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMode('list')}
            className={cn(
              'font-mono text-[10px] uppercase tracking-[0.15em] transition-colors',
              mode === 'list'
                ? 'border-b border-gold pb-0.5 text-navy'
                : 'text-navy/35 hover:text-navy/60',
            )}
          >
            Lista
          </button>
          <button
            onClick={() => setMode('grid')}
            className={cn(
              'font-mono text-[10px] uppercase tracking-[0.15em] transition-colors',
              mode === 'grid'
                ? 'border-b border-gold pb-0.5 text-navy'
                : 'text-navy/35 hover:text-navy/60',
            )}
          >
            Cuadrícula
          </button>
        </div>
      </div>

      {/* LIST MODE */}
      {mode === 'list' && (
        <dl className="space-y-6">
          {groups.map(({ label, items }) => (
            <div key={label}>
              {/* Group header */}
              <div className="mb-1">
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-gold/50">
                  {label}
                </span>
                <div className="mt-1 h-px w-full bg-[rgba(0,30,80,0.06)]" />
              </div>

              {/* Spec rows */}
              {items.map(([key, val]) => {
                const motorGroup = isMotorGroup(key)
                const { num } = splitValueSuffix(val)
                const isBigValue = motorGroup && num !== null

                return (
                  <div
                    key={key}
                    className="group relative flex items-center justify-between border-b border-[rgba(0,30,80,0.05)] py-3 px-0 transition-colors hover:bg-gold/[0.03]"
                  >
                    {/* Left gold accent on hover */}
                    <span
                      className="absolute left-0 top-0 h-full w-0.5 scale-y-0 bg-gold transition-transform group-hover:scale-y-100"
                      aria-hidden="true"
                    />
                    <dt className="pl-3 font-mono text-[11px] text-navy/50">{key}</dt>
                    <dd
                      className={cn(
                        'font-mono font-medium text-navy text-right transition-opacity duration-500',
                        isBigValue ? 'text-[14px]' : 'text-[12px]',
                        inView ? 'opacity-100' : 'opacity-0',
                      )}
                    >
                      {renderValue(val)}
                    </dd>
                  </div>
                )
              })}
            </div>
          ))}
        </dl>
      )}

      {/* GRID MODE */}
      {mode === 'grid' && (
        <div>
          {groups.map(({ label, items }, groupIndex) => (
            <div key={label}>
              {/* Group header */}
              <div
                className={cn(
                  'col-span-full pb-1 pt-4',
                  groupIndex === 0 ? '' : 'border-t border-[rgba(0,30,80,0.06)]',
                )}
              >
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-gold/40">
                  {label}
                </span>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {items.map(([key, val]) => {
                  const motorCard = isMotorKey(key)
                  const { num, suffix } = splitValueSuffix(val)

                  const displayValue =
                    num !== null
                      ? String(Math.round(num * progress)) + suffix
                      : val

                  return (
                    <div
                      key={key}
                      className={cn(
                        'flex flex-col gap-1 border p-4',
                        motorCard
                          ? 'border-gold/25 bg-gold/[0.04]'
                          : 'border-[rgba(0,30,80,0.08)] bg-surface-card',
                      )}
                    >
                      <span
                        className={cn(
                          'font-mono text-2xl font-light leading-none text-navy transition-opacity duration-500',
                          motorCard && 'text-gold',
                          inView ? 'opacity-100' : 'opacity-0',
                        )}
                      >
                        {displayValue}
                      </span>
                      <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-navy/40">
                        {key}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
