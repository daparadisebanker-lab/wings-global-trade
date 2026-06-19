'use client'

import { useRef, useState, useEffect } from 'react'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProductSpecTableProps {
  specs: Record<string, string>
}

type ViewMode = 'list' | 'grid'

// Operational context, rewarded to the curious buyer who lingers on a value.
// Keyed by normalized spec identity so it matches both English snake_case keys
// and the Spanish display labels the catalog actually uses.
const SPEC_CONTEXT: Record<string, string> = {
  gvw: 'Determina la categoría de licencia de conducir requerida.',
  hp: 'Potencia en condiciones estándar. Reducir 15–20% para altitud >3,000 msnm.',
  payload: 'Capacidad de carga útil sin superar el GVW declarado.',
  wheelbase: 'Mayor distancia entre ejes = mayor estabilidad en curvas.',
  max_speed: 'Velocidad máxima en llano. Reducir para operación en sierra.',
  fuel_tank: 'Autonomía estimada según consumo típico de categoría.',
}

// Maps a raw spec key (snake_case or Spanish label) to a SPEC_CONTEXT identity.
function specContextFor(key: string): string | null {
  const k = key.toLowerCase()
  if (/gvw|peso bruto|peso_bruto/.test(k)) return SPEC_CONTEXT.gvw
  if (/\bhp\b|potencia|power|\bcv\b/.test(k)) return SPEC_CONTEXT.hp
  if (/payload|carga[ _]?útil|carga[ _]?util/.test(k)) return SPEC_CONTEXT.payload
  if (/wheelbase|distancia[ _]?ejes|batalla/.test(k)) return SPEC_CONTEXT.wheelbase
  if (/max[ _]?speed|velocidad[ _]?máx|velocidad[ _]?max/.test(k)) return SPEC_CONTEXT.max_speed
  if (/fuel[ _]?tank|depósito|deposito|tanque/.test(k)) return SPEC_CONTEXT.fuel_tank
  return null
}

// Inspection Mode — the deep-investigation depth, reached by deliberate click
// (distinct from the 1.5s hover tooltip reward above). Extended explanation plus
// the market range a procurement buyer wants when assessing a number.
interface SpecInspection {
  name: string
  explanation: string
  marketRange?: string
}

function specInspectionFor(key: string): SpecInspection | null {
  const k = key.toLowerCase()
  if (/gvw|peso bruto|peso_bruto/.test(k))
    return {
      name: 'Peso bruto vehicular',
      explanation:
        'Masa máxima autorizada del vehículo cargado. Define la categoría de licencia, los límites por eje y la homologación de neumáticos. Verificar contra normativa MTC antes de nacionalizar.',
      marketRange: '3.5–26 t en vehículos comerciales',
    }
  if (/\bhp\b|potencia|power|\bcv\b/.test(k))
    return {
      name: 'Potencia del motor',
      explanation:
        'Potencia en condiciones estándar de fábrica. Cae cerca de 1% por cada 100 m de altitud: sobre 3,000 msnm, contar con 15–20% menos en faena de sierra.',
      marketRange: '25–180 HP según segmento',
    }
  if (/payload|carga[ _]?útil|carga[ _]?util/.test(k))
    return {
      name: 'Carga útil',
      explanation:
        'Carga máxima transportable sin superar el peso bruto declarado. Restar siempre carrocería e implementos antes de calcular la carga comercial real.',
      marketRange: '1–18 t según configuración de eje',
    }
  if (/wheelbase|distancia[ _]?ejes|batalla/.test(k))
    return {
      name: 'Distancia entre ejes',
      explanation:
        'Separación entre eje delantero y trasero. Mayor distancia entrega estabilidad en ruta; menor distancia mejora la maniobrabilidad y el radio de giro en faena.',
    }
  if (/max[ _]?speed|velocidad[ _]?máx|velocidad[ _]?max/.test(k))
    return {
      name: 'Velocidad máxima',
      explanation:
        'Velocidad tope en llano a plena carga. En sierra y altiplano la potencia disponible reduce esta cifra; no usar como referencia para rutas de altura.',
    }
  if (/fuel[ _]?tank|depósito|deposito|tanque/.test(k))
    return {
      name: 'Capacidad de combustible',
      explanation:
        'Volumen del depósito. Determina la autonomía entre reabastecimientos, factor crítico en rutas largas o zonas con baja densidad de estaciones.',
    }
  return null
}

// The 4 specs that matter first to a procurement professional. Detection is
// label-agnostic so it works on both snake_case and Spanish display labels.
const PRIORITY_MATCHERS: RegExp[] = [
  /\bhp\b|potencia|power|\bcv\b/i,
  /payload|carga[ _]?útil|carga[ _]?util/i,
  /gvw|peso bruto|peso_bruto/i,
  /transmis|transmission/i,
]

function isPrioritySpec(key: string): boolean {
  return PRIORITY_MATCHERS.some((re) => re.test(key))
}

const HOVER_DELAY_MS = 1500

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
    if (!isNaN(n)) return { num: n, suffix: numericMatch[2] }
  }
  return { num: null, suffix: val }
}

function isMotorKey(key: string): boolean {
  return /HP|Potencia|CV/i.test(key)
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
  const [mode, setMode] = useState<ViewMode>('grid')
  const [progress, setProgress] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [hoveredSpec, setHoveredSpec] = useState<string | null>(null)
  const [clickedSpec, setClickedSpec] = useState<string | null>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  useEffect(() => {
    return () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current)
    }
  }, [])

  // Inspection Mode dismissal: Escape, or any click outside the spec table.
  useEffect(() => {
    if (!clickedSpec) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setClickedSpec(null)
    }
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setClickedSpec(null)
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onPointerDown)
    }
  }, [clickedSpec])

  function toggleInspection(key: string) {
    if (!specInspectionFor(key)) return
    setClickedSpec((prev) => (prev === key ? null : key))
  }

  function handleSpecEnter(key: string) {
    if (!specContextFor(key)) return
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => setHoveredSpec(key), HOVER_DELAY_MS)
  }

  function handleSpecLeave() {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    setHoveredSpec(null)
  }

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

  // Spec Deep Dive Unlock: surface only the 4 priority specs first. The first
  // four entries matching a priority matcher (in spec order) are always shown;
  // the rest stay behind the reveal. This rewards the act of digging deeper.
  const priorityEntries: [string, string][] = []
  const restEntries: [string, string][] = []
  for (const entry of entries) {
    if (priorityEntries.length < 4 && isPrioritySpec(entry[0])) {
      priorityEntries.push(entry)
    } else {
      restEntries.push(entry)
    }
  }

  // Spec Deep Dive Unlock: when collapsed, render only the priority specs;
  // expanding reveals the rest (revelation micro-reward). When there's nothing
  // to gate, render every spec as before.
  const hasHiddenSpecs = priorityEntries.length > 0 && restEntries.length > 0
  const visibleEntries =
    hasHiddenSpecs && !isExpanded
      ? priorityEntries
      : [...priorityEntries, ...restEntries]

  const groups = groupEntries(visibleEntries)

  function renderTooltip(key: string) {
    const context = specContextFor(key)
    if (!context || hoveredSpec !== key) return null
    return (
      <span
        role="tooltip"
        className="absolute left-0 top-full z-20 mt-1 block max-w-[240px] border-l-2 border-gold bg-[#F8F6F0] px-2.5 py-1.5 font-mono text-[10px] leading-snug text-navy shadow-[0_4px_12px_rgba(0,30,80,0.12)]"
      >
        {context}
      </span>
    )
  }

  // Inspection Mode panel — opens inline below the inspected spec on click.
  function renderInspection(key: string) {
    const inspection = specInspectionFor(key)
    return (
      <AnimatePresence initial={false}>
        {inspection && clickedSpec === key && (
          <motion.div
            key={`inspect-${key}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-1.5 border-l-2 border-gold bg-[#F8F6F0] px-3 py-2.5">
              <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
                {inspection.name}
              </p>
              <p className="font-body text-[13px] leading-snug text-navy">
                {inspection.explanation}
              </p>
              {inspection.marketRange && (
                <p className="mt-1.5 font-mono text-[10px] text-navy/55">
                  Rango de mercado: {inspection.marketRange}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  return (
    <div ref={ref}>
      {/* Header + mode toggle */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-display-sm font-semibold text-navy">
          Especificaciones técnicas
        </h2>
        <div className="flex items-center gap-4">
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
                const motorGroup = /HP|Potencia|CV/i.test(key)
                const { num } = splitValueSuffix(val)
                const isBigValue = motorGroup && num !== null

                const hasContext = specContextFor(key) !== null
                const hasInspection = specInspectionFor(key) !== null

                return (
                  <div key={key}>
                    <div
                      onMouseEnter={() => handleSpecEnter(key)}
                      onMouseLeave={handleSpecLeave}
                      className={cn(
                        'group relative flex items-baseline justify-between gap-4 border-b border-[rgba(0,30,80,0.05)] py-3 transition-colors hover:bg-gold/[0.03]',
                        hasContext && 'cursor-help',
                      )}
                    >
                      <span
                        className="absolute left-0 top-0 h-full w-0.5 scale-y-0 bg-gold transition-transform group-hover:scale-y-100"
                        aria-hidden="true"
                      />
                      <dt className="min-w-0 flex-1 pl-3 font-mono text-[11px] text-navy/50 truncate">
                        {key}
                      </dt>
                      <dd
                        className={cn(
                          'shrink-0 font-mono font-medium text-navy text-right transition-opacity duration-500',
                          isBigValue ? 'text-[14px]' : 'text-[12px]',
                          inView ? 'opacity-100' : 'opacity-0',
                        )}
                      >
                        {hasInspection ? (
                          <button
                            type="button"
                            onClick={() => toggleInspection(key)}
                            aria-expanded={clickedSpec === key}
                            className="spec-value-inspectable font-mono font-medium text-navy"
                          >
                            {renderValue(val)}
                          </button>
                        ) : (
                          renderValue(val)
                        )}
                      </dd>
                      {renderTooltip(key)}
                    </div>
                    {renderInspection(key)}
                  </div>
                )
              })}
            </div>
          ))}
        </dl>
      )}

      {/* GRID MODE — compact: all specs visible at once */}
      {mode === 'grid' && (
        <div>
          {groups.map(({ label, items }, groupIndex) => (
            <div key={label}>
              <div
                className={cn(
                  'pb-1 pt-3',
                  groupIndex === 0 ? '' : 'border-t border-[rgba(0,30,80,0.06)] mt-1',
                )}
              >
                <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-gold/40">
                  {label}
                </span>
              </div>

              <div className="mb-1 grid grid-cols-3 gap-1.5 sm:grid-cols-4">
                {items.map(([key, val]) => {
                  const motorCard = isMotorKey(key)
                  const { num, suffix } = splitValueSuffix(val)

                  const displayValue =
                    num !== null
                      ? String(Math.round(num * progress)) + suffix
                      : val

                  const hasContext = specContextFor(key) !== null
                  const hasInspection = specInspectionFor(key) !== null
                  const inspectionOpen = clickedSpec === key

                  return (
                    <div
                      key={key}
                      onMouseEnter={() => handleSpecEnter(key)}
                      onMouseLeave={handleSpecLeave}
                      className={cn(
                        'relative flex flex-col gap-0.5 border px-2.5 py-2',
                        inspectionOpen && 'col-span-full',
                        motorCard
                          ? 'border-gold/25 bg-gold/[0.04]'
                          : 'border-[rgba(0,30,80,0.07)] bg-surface-card',
                        hasContext && 'cursor-help',
                      )}
                    >
                      {hasInspection ? (
                        <button
                          type="button"
                          onClick={() => toggleInspection(key)}
                          aria-expanded={inspectionOpen}
                          className={cn(
                            'spec-value-inspectable text-left font-mono text-[13px] font-medium leading-tight text-navy transition-opacity duration-500',
                            motorCard && 'text-gold',
                            inView ? 'opacity-100' : 'opacity-0',
                          )}
                        >
                          {displayValue}
                        </button>
                      ) : (
                        <span
                          className={cn(
                            'font-mono text-[13px] font-medium leading-tight text-navy transition-opacity duration-500',
                            motorCard && 'text-gold',
                            inView ? 'opacity-100' : 'opacity-0',
                          )}
                        >
                          {displayValue}
                        </span>
                      )}
                      <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-navy/35 leading-tight">
                        {key}
                      </span>
                      {renderTooltip(key)}
                      {renderInspection(key)}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Spec Deep Dive Unlock — the buyer chooses to dig deeper. The act of
          revealing is the reward (revelation mechanic). */}
      {hasHiddenSpecs && (
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          aria-expanded={isExpanded}
          className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] text-gold transition-colors hover:text-gold/80"
        >
          {isExpanded
            ? 'Ocultar especificaciones'
            : 'Ver especificaciones completas'}
          <svg
            width="9"
            height="9"
            viewBox="0 0 10 10"
            fill="none"
            aria-hidden="true"
            className="transition-transform duration-300"
            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <path
              d="M2 3.5L5 6.5L8 3.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
