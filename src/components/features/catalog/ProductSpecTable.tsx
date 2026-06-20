'use client'

import { useRef, useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProductSpecTableProps {
  specs: Record<string, string>
}

// ── Intelligence layer ─────────────────────────────────────────────────────
// Hover tooltip: brief operational context rewarded after 800ms hover.
// Click inspection: extended explanation + market range on deliberate click.
// Both are Wings differentiators — competitors show raw data with no context.

const HOVER_DELAY_MS = 800

const SPEC_CONTEXT: Record<string, string> = {
  hp: 'Potencia en condiciones estándar. Reducir 15–20% para altitud >3.000 msnm.',
  payload: 'Capacidad de carga útil sin superar el GVW declarado.',
  gvw: 'Determina la categoría de licencia de conducir requerida.',
  wheelbase: 'Mayor distancia entre ejes = mayor estabilidad en curvas.',
  max_speed: 'Velocidad máxima en llano. Reducir para operación en sierra.',
  fuel_tank: 'Autonomía estimada según consumo típico de categoría.',
}

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
      marketRange: '3,5–26 t en vehículos comerciales',
    }
  if (/\bhp\b|potencia|power|\bcv\b/.test(k))
    return {
      name: 'Potencia del motor',
      explanation:
        'Potencia en condiciones estándar de fábrica. Cae cerca de 1% por cada 100 m de altitud: sobre 3.000 msnm, contar con 15–20% menos en faena de sierra.',
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

// ── Taxonomy ──────────────────────────────────────────────────────────────
// Covers both agricultural machinery (tractor) and commercial vehicle (truck)
// spec keys. Order = buyer decision sequence.
//
// PTO is first-class (not under Hidráulica).
// Neumáticos is first-class (implement compatibility for tractors; tyre choice
// for trucks).
// Capacidad group handles truck payload/GVW/tare specs that have no tractor
// equivalent — avoids them falling into the General catch-all.
//
// Pattern matching is evaluated top-to-bottom; first match wins.
// "PTO RPM" → PTO (not Motor) because PTO comes before Motor and \bPTO\b
// matches. "Par motor" → Motor via \bMotor\b. "Vel. máxima" → Transmisión
// via Vel\.

const SPEC_GROUPS = [
  {
    id: 'pto',
    label: 'PTO',
    // Must come before Motor so "PTO RPM" → PTO, not Motor
    pattern: /\bPTO\b|Toma de fuerza/i,
  },
  {
    id: 'motor',
    label: 'Motor',
    // \bMotor\b catches "Motor / Batería" (truck) and "Par motor" (torque)
    // Norma emisión is an engine spec (emission standard)
    pattern: /\bHP\b|Potencia|RPM motor|Cilindros?|Desplazamiento|Combustible|Aspiración|\bCV\b|Norma emisión|Par motor|Torque|\bMotor\b/i,
  },
  {
    id: 'transmision',
    label: 'Transmisión',
    // Caja de cambios (truck gearbox), Vel\. (Vel. máxima → max speed)
    pattern: /Transmisión|Tracción|Embrague|Marcha|Velocidad|Caja de cambios|Vel\./i,
  },
  {
    id: 'hidraulica',
    label: 'Hidráulica',
    pattern: /Hidráulic|Caudal|Presión|Enganche|Bomba/i,
  },
  {
    id: 'capacidad',
    label: 'Capacidad',
    // Truck-specific: payload, GVW, tare weight — no tractor equivalent
    pattern: /Carga útil|Carga util|GVW|Peso total|Peso bruto|Tara/i,
  },
  {
    id: 'neumaticos',
    label: 'Neumáticos',
    pattern: /Neumático|Llanta|Rueda/i,
  },
  {
    id: 'dimensiones',
    label: 'Dimensiones',
    // Dim\. catches "Dim. ext. (L×A×H)"; Cabina and Caja de carga are truck
    // structural specs that belong here
    pattern: /Longitud|Ancho|Altura|Batalla|Distancia|Radio|Libre al suelo|Dim\.|Cabina|Caja de carga/i,
  },
  {
    id: 'general',
    label: 'General',
    pattern: null,
  },
] as const

function assignGroup(key: string): string {
  for (const group of SPEC_GROUPS) {
    if (group.pattern && group.pattern.test(key)) return group.id
  }
  return 'general'
}

interface SpecGroup {
  id: string
  label: string
  items: [string, string][]
}

// Returns groups in canonical SPEC_GROUPS order, skipping empty groups.
function buildGroups(entries: [string, string][]): SpecGroup[] {
  const map = new Map<string, [string, string][]>()

  for (const entry of entries) {
    const gid = assignGroup(entry[0])
    if (!map.has(gid)) map.set(gid, [])
    map.get(gid)!.push(entry)
  }

  return SPEC_GROUPS.filter((g) => map.has(g.id)).map((g) => ({
    id: g.id,
    label: g.label,
    items: map.get(g.id)!,
  }))
}

// ── Component ─────────────────────────────────────────────────────────────

export function ProductSpecTable({ specs }: ProductSpecTableProps) {
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null)
  const [hoveredSpec, setHoveredSpec] = useState<string | null>(null)
  const [clickedSpec, setClickedSpec] = useState<string | null>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current)
    }
  }, [])

  // Dismiss inspection on Escape or click outside
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

  const entries = Object.entries(specs)
  if (entries.length === 0) return null

  const groups = buildGroups(entries)
  if (groups.length === 0) return null

  const currentGroupId = activeGroupId ?? groups[0].id
  const currentGroup = groups.find((g) => g.id === currentGroupId) ?? groups[0]

  function renderTooltip(key: string) {
    const context = specContextFor(key)
    if (!context || hoveredSpec !== key) return null
    return (
      <span
        role="tooltip"
        className="absolute left-0 top-full z-20 mt-1 block max-w-[260px] border-l-2 border-gold bg-warm-white px-3 py-2 font-mono text-[10px] leading-snug text-navy shadow-[0_4px_16px_rgba(0,30,80,0.10)]"
      >
        {context}
      </span>
    )
  }

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
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-l-2 border-gold bg-warm-white px-4 py-3">
              <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-gold">
                {inspection.name}
              </p>
              <p className="font-body text-[13px] leading-snug text-navy">
                {inspection.explanation}
              </p>
              {inspection.marketRange && (
                <p className="mt-1.5 font-mono text-[10px] text-navy/50">
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

      {/* ── Section header ──────────────────────────────────────────── */}
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-body text-sm font-medium tracking-tight text-navy">
          Especificaciones técnicas
        </h2>
        <span className="font-mono text-[10px] tabular-nums text-navy/35">
          {entries.length} especificaciones
        </span>
      </div>

      {/* ── Tab navigation ──────────────────────────────────────────── */}
      {groups.length > 1 && (
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex min-w-max items-end border-b border-navy/10">
            {groups.map((group) => {
              const isActive = group.id === currentGroupId
              return (
                <button
                  key={group.id}
                  onClick={() => {
                    setActiveGroupId(group.id)
                    setClickedSpec(null)
                  }}
                  className={cn(
                    '-mb-px shrink-0 border-b-2 pb-2.5 pr-5 pt-0 text-left',
                    'font-mono text-[10px] uppercase tracking-[0.12em] whitespace-nowrap',
                    'transition-colors duration-150',
                    isActive
                      ? 'border-gold text-navy'
                      : 'border-transparent text-navy/35 hover:text-navy/65',
                  )}
                >
                  {group.label}
                  <span
                    className={cn(
                      'ml-1.5 tabular-nums',
                      isActive ? 'text-gold' : 'text-navy/25',
                    )}
                  >
                    {group.items.length}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Spec list ────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.dl
          key={currentGroupId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
        >
          {currentGroup.items.map(([key, val]) => {
            const hasContext = specContextFor(key) !== null
            const hasInspection = specInspectionFor(key) !== null
            const isInspected = clickedSpec === key

            return (
              <div key={key}>
                <div
                  onMouseEnter={() => handleSpecEnter(key)}
                  onMouseLeave={handleSpecLeave}
                  className={cn(
                    'group relative flex items-baseline justify-between gap-6',
                    'border-b border-navy/[0.06] py-3',
                    'transition-colors duration-100 hover:bg-gold/[0.03]',
                    hasContext && 'cursor-help',
                    isInspected && 'bg-gold/[0.04]',
                  )}
                >
                  {/* Gold left accent — appears on hover */}
                  <span
                    className="absolute left-0 top-0 h-full w-0.5 origin-top scale-y-0 bg-gold transition-transform duration-150 group-hover:scale-y-100"
                    aria-hidden="true"
                  />

                  {/* Label */}
                  <dt className="min-w-0 flex-1 truncate pl-3 font-mono text-xs leading-none text-navy/75">
                    {key}
                  </dt>

                  {/* Value — clickable when inspection is available */}
                  <dd className="shrink-0 text-right font-mono text-sm font-medium leading-none text-navy">
                    {hasInspection ? (
                      <button
                        type="button"
                        onClick={() => toggleInspection(key)}
                        aria-expanded={isInspected}
                        className={cn(
                          'spec-value-inspectable font-mono text-sm font-medium',
                          isInspected ? 'text-gold' : 'text-navy',
                        )}
                      >
                        {val}
                      </button>
                    ) : (
                      val
                    )}
                  </dd>

                  {renderTooltip(key)}
                </div>

                {renderInspection(key)}
              </div>
            )
          })}
        </motion.dl>
      </AnimatePresence>

    </div>
  )
}
