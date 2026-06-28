'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  ENGINES,
  BRANDS,
  DISPLACEMENT_RANGES,
  HP_RANGES,
  VEHICLE_TYPE_LABELS,
  FUEL_LABELS,
  CONFIG_LABELS,
  type Engine,
  type Brand,
  type FuelType,
  type VehicleType,
  type EngineConfig,
} from '@/lib/engines-data'

// ── Types ──────────────────────────────────────────────────────────────────

type DisplacementKey = '0' | '1500' | '2000' | '2500' | '3000'
type HpKey = '0' | '100' | '151' | '201'
type TurboKey = 'true' | 'false'

interface Filters {
  brands: Brand[]
  fuels: FuelType[]
  displacements: DisplacementKey[]
  hps: HpKey[]
  vehicleTypes: VehicleType[]
  configs: EngineConfig[]
  turbos: TurboKey[]
  search: string
}

const EMPTY_FILTERS: Filters = {
  brands: [],
  fuels: [],
  displacements: [],
  hps: [],
  vehicleTypes: [],
  configs: [],
  turbos: [],
  search: '',
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDisplacement(cc: number): string {
  return (cc / 1000).toFixed(1) + 'L'
}

function rowKey(engine: Engine, index: number): string {
  return `${engine.brand}-${engine.code}-${engine.variant}-${index}`
}

function toggleItem<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item]
}

function matchesDisplacement(cc: number, key: DisplacementKey): boolean {
  const range = DISPLACEMENT_RANGES.find((r) => String(r.min) === key)
  if (!range) return true
  return cc >= range.min && cc <= range.max
}

function matchesHp(hp: number, key: HpKey): boolean {
  const range = HP_RANGES.find((r) => String(r.min) === key)
  if (!range) return true
  return hp >= range.min && hp <= range.max
}

function applyFilters(engines: Engine[], filters: Filters): Engine[] {
  return engines.filter((e) => {
    if (filters.brands.length > 0 && !filters.brands.includes(e.brand as Brand)) return false
    if (filters.fuels.length > 0 && !filters.fuels.includes(e.fuel)) return false
    if (filters.configs.length > 0 && !filters.configs.includes(e.config)) return false
    if (filters.turbos.length > 0 && !filters.turbos.includes(String(e.turbo) as TurboKey)) return false
    if (filters.displacements.length > 0 && !filters.displacements.some((k) => matchesDisplacement(e.displacement, k))) return false
    if (filters.hps.length > 0 && !filters.hps.some((k) => matchesHp(e.hp, k))) return false
    if (filters.vehicleTypes.length > 0 && !filters.vehicleTypes.some((v) => e.vehicleTypes.includes(v))) return false
    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase()
      const haystack = [e.brand, e.code, e.variant, ...e.commonVehicles].join(' ').toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })
}

function buildWhatsAppLink(engines: Engine[]): string {
  const lines = engines.map(
    (e) => `• ${e.brand} ${e.code}${e.variant ? ' ' + e.variant : ''} (${formatDisplacement(e.displacement)} · ${e.config} · ${e.hp}hp)`,
  )
  const message = [
    'Hola, quisiera cotizar los siguientes motores JDM:',
    '',
    ...lines,
    '',
    '¿Pueden enviarme disponibilidad y precios?',
  ].join('\n')
  return `https://wa.me/50760250735?text=${encodeURIComponent(message)}`
}

// ── Color palette per filter category ─────────────────────────────────────
// Active state is always gold fill (unified selection signal)
// Inactive state is category-specific to aid visual scanning

type ChipVariant = 'brand' | 'application' | 'performance' | 'technical'

const CHIP_INACTIVE: Record<ChipVariant, string> = {
  brand:       'border-[rgba(168,184,200,0.22)] text-[#A8B8C8]/60 hover:border-[rgba(168,184,200,0.42)] hover:text-[#A8B8C8]/90',
  application: 'border-[rgba(126,184,212,0.22)] text-[#7EB8D4]/60 hover:border-[rgba(126,184,212,0.42)] hover:text-[#7EB8D4]/90',
  performance: 'border-[rgba(196,147,63,0.28)]  text-[#C4933F]/65 hover:border-[rgba(196,147,63,0.52)] hover:text-[#C4933F]/95',
  technical:   'border-[rgba(127,175,135,0.22)] text-[#7FAF87]/60 hover:border-[rgba(127,175,135,0.42)] hover:text-[#7FAF87]/90',
}

const LABEL_COLOR: Record<ChipVariant, string> = {
  brand:       'text-[#A8B8C8]/40',
  application: 'text-[#7EB8D4]/40',
  performance: 'text-[#C4933F]/45',
  technical:   'text-[#7FAF87]/40',
}

// ── Chip — category-colored inactive · gold motion fill on activation ──────

function Chip({ active, onClick, children, variant = 'brand' }: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  variant?: ChipVariant
}) {
  const reduced = useReducedMotion()

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={reduced ? {} : { scale: 0.95 }}
      transition={{ duration: 0.12 }}
      className={cn(
        'relative overflow-hidden whitespace-nowrap border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.10em] transition-colors duration-150',
        active ? 'border-gold text-navy' : CHIP_INACTIVE[variant],
      )}
    >
      <AnimatePresence initial={false}>
        {active && (
          <motion.span
            key="gold-fill"
            initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 1.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 bg-gold"
            style={{ transformOrigin: 'center', zIndex: 0 }}
          />
        )}
      </AnimatePresence>
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}

// ── FilterRow — stacks on mobile, label color-coded per category ───────────

function FilterRow({ label, variant = 'brand', children }: {
  label: string
  variant?: ChipVariant
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-warm-white/[0.06] py-4 first:pt-0 last:border-0 last:pb-0 md:flex-row md:items-start md:gap-6">
      <span className={cn(
        'shrink-0 font-mono text-[9px] uppercase tracking-[0.18em] md:w-24 md:pt-1.5',
        LABEL_COLOR[variant],
      )}>
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

// ── Checkbox ──────────────────────────────────────────────────────────────

function Check({ checked, indeterminate = false, onChange, label }: {
  checked: boolean
  indeterminate?: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  label?: string
}) {
  return (
    <label className="flex cursor-pointer items-center" aria-label={label}>
      <input
        type="checkbox"
        checked={checked}
        ref={(el) => { if (el) el.indeterminate = indeterminate }}
        onChange={onChange}
        className="sr-only"
      />
      <span
        className={cn(
          'flex h-4 w-4 shrink-0 items-center justify-center border transition-all duration-150',
          checked || indeterminate
            ? 'border-gold bg-gold'
            : 'border-[rgba(0,30,80,0.20)] bg-transparent',
        )}
      >
        {indeterminate ? (
          <span className="block h-px w-2 bg-navy" />
        ) : checked ? (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none" aria-hidden>
            <path d="M1 3.5L3.5 6L8 1" stroke="#001E50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </span>
    </label>
  )
}

// ── FuelBadge — shared between table and cards ────────────────────────────

function FuelBadge({ fuel, short = false }: { fuel: Engine['fuel']; short?: boolean }) {
  const label = short ? FUEL_LABELS[fuel].slice(0, 3) : FUEL_LABELS[fuel]
  return (
    <span
      className={cn(
        'inline-block border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.10em]',
        fuel === 'diesel'
          ? 'border-navy/25 bg-navy/[0.04] text-navy/65'
          : fuel === 'lpg'
          ? 'border-gold/50 text-gold'
          : 'border-navy/25 bg-navy/[0.04] text-navy/60',
      )}
    >
      {label}
    </span>
  )
}

// ── Scroll-to-top button ──────────────────────────────────────────────────

function ScrollTopButton({ hasBar }: { hasBar: boolean }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 480)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={cn(
            'fixed left-4 z-40 flex h-10 w-10 items-center justify-center border border-[rgba(0,30,80,0.12)] bg-warm-white text-navy shadow-[0_4px_20px_rgba(0,0,0,0.10)] transition-all duration-200 hover:border-gold hover:bg-gold md:left-auto md:right-8',
            hasBar ? 'bottom-24 md:bottom-[72px]' : 'bottom-8',
          )}
          aria-label="Volver arriba"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M7 11V3M3 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  )
}

// ── Mobile engine card ────────────────────────────────────────────────────

function EngineCard({
  engine,
  index,
  selected,
  onToggle,
}: {
  engine: Engine
  index: number
  selected: boolean
  onToggle: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className={cn(
        'border-b border-[rgba(0,30,80,0.07)]',
        selected
          ? 'bg-gold/[0.07]'
          : index % 2 === 0
          ? 'bg-warm-white'
          : 'bg-white',
      )}
    >
      <div className="flex items-center gap-0">
        {/* Checkbox — 44px tap target */}
        <button
          type="button"
          className="flex h-14 w-12 shrink-0 items-center justify-center"
          onClick={(e) => { e.stopPropagation(); onToggle() }}
          aria-label={`Seleccionar ${engine.brand} ${engine.code}`}
        >
          <Check checked={selected} onChange={onToggle} label={`Seleccionar ${engine.brand} ${engine.code}`} />
        </button>

        {/* Main content */}
        <button
          type="button"
          className="flex flex-1 min-w-0 flex-col items-start py-3 pr-2 text-left"
          onClick={() => setOpen((o) => !o)}
        >
          <div className="flex items-baseline gap-1.5 mb-0.5">
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-navy/55">
              {engine.brand}
            </span>
            <span className="font-mono text-[13px] font-semibold tracking-[0.06em] text-navy">
              {engine.code}
            </span>
            {engine.variant && (
              <span className="font-mono text-[10px] text-navy/45">{engine.variant}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-navy/70">
              {formatDisplacement(engine.displacement)} · {engine.config}
            </span>
            <span className="font-mono text-[10px] text-navy/45">{engine.hp}hp</span>
          </div>
        </button>

        {/* Right: fuel + turbo + expand */}
        <button
          type="button"
          className="flex shrink-0 items-center gap-2 py-3 pr-4"
          onClick={() => setOpen((o) => !o)}
        >
          <FuelBadge fuel={engine.fuel} short />
          {engine.turbo && (
            <span className="font-mono text-[9px] uppercase text-gold">T</span>
          )}
          <span
            className={cn(
              'font-mono text-[10px] text-navy/35 transition-transform duration-200',
              open && 'rotate-180',
            )}
          >
            ▾
          </span>
        </button>
      </div>

      {/* Expanded detail */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                'border-t border-[rgba(0,30,80,0.06)] px-4 pb-4 pt-3',
                selected ? 'bg-gold/[0.07]' : index % 2 === 0 ? 'bg-warm-white' : 'bg-white',
              )}
            >
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <p className="mb-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-navy/35">Configuración</p>
                  <p className="font-mono text-[11px] text-navy/75">
                    {CONFIG_LABELS[engine.config]} · {engine.cylinders} cil.
                  </p>
                </div>
                <div>
                  <p className="mb-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-navy/35">Potencia</p>
                  <p className="font-mono text-[11px] text-navy/75">
                    {engine.hp}hp · {engine.turbo ? 'Turbo' : 'Atmosférico'}
                  </p>
                </div>
                <div>
                  <p className="mb-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-navy/35">Combustible</p>
                  <p className="font-mono text-[11px] text-navy/75">{FUEL_LABELS[engine.fuel]}</p>
                </div>
                <div>
                  <p className="mb-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-navy/35">Tipo</p>
                  <p className="font-mono text-[11px] text-navy/75">
                    {engine.vehicleTypes.map((v) => VEHICLE_TYPE_LABELS[v]).join(' · ')}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="mb-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-navy/35">Vehículos compatibles</p>
                  <p className="font-mono text-[11px] leading-relaxed text-navy/65">
                    {engine.commonVehicles.join(' · ')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Desktop engine row ────────────────────────────────────────────────────

function EngineRow({
  engine,
  index,
  selected,
  onToggle,
}: {
  engine: Engine
  index: number
  selected: boolean
  onToggle: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <tr
        className={cn(
          'border-b border-[rgba(0,30,80,0.07)] transition-colors duration-100',
          selected
            ? 'bg-gold/[0.07]'
            : index % 2 === 0
            ? 'bg-warm-white hover:bg-gold/[0.04]'
            : 'bg-white hover:bg-gold/[0.04]',
        )}
      >
        <td className="w-10 py-2.5 pl-4 pr-2" onClick={(e) => e.stopPropagation()}>
          <Check
            checked={selected}
            onChange={(_e) => onToggle()}
            label={`Seleccionar ${engine.brand} ${engine.code}`}
          />
        </td>

        <td className="cursor-pointer py-2.5 pr-4" onClick={() => setOpen((o) => !o)}>
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-navy/60">
            {engine.brand}
          </span>
        </td>

        <td className="cursor-pointer py-2.5 pr-4" onClick={() => setOpen((o) => !o)}>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[13px] font-semibold tracking-[0.06em] text-navy">
              {engine.code}
            </span>
            {engine.variant && (
              <span className="font-mono text-[10px] tracking-[0.04em] text-navy/50">
                {engine.variant}
              </span>
            )}
          </div>
        </td>

        {/* Fix 3: · separator between displacement and config */}
        <td className="cursor-pointer py-2.5 pr-4" onClick={() => setOpen((o) => !o)}>
          <span className="font-mono text-[12px] text-navy/80">{formatDisplacement(engine.displacement)}</span>
          <span className="mx-1 font-mono text-[10px] text-navy/30">·</span>
          {/* Fix 4: config contrast text-navy/45 → text-navy/65 */}
          <span className="font-mono text-[10px] text-navy/65">{engine.config}</span>
        </td>

        <td className="cursor-pointer py-2.5 pr-4" onClick={() => setOpen((o) => !o)}>
          <span className="font-mono text-[12px] text-navy/80">{engine.hp}</span>
          <span className="ml-0.5 font-mono text-[9px] text-navy/40">hp</span>
        </td>

        {/* Fix 5: fuel badge with bg-navy/[0.04] fill for legibility */}
        <td className="cursor-pointer py-2.5 pr-4" onClick={() => setOpen((o) => !o)}>
          <FuelBadge fuel={engine.fuel} />
          {engine.turbo && (
            <span className="ml-1.5 font-mono text-[9px] uppercase tracking-[0.10em] text-gold">T</span>
          )}
        </td>

        <td className="cursor-pointer py-2.5 pr-4" onClick={() => setOpen((o) => !o)}>
          <span className="font-mono text-[10px] text-navy/55">
            {engine.vehicleTypes.map((v) => VEHICLE_TYPE_LABELS[v]).join(' · ')}
          </span>
        </td>

        <td className="w-8 cursor-pointer py-2.5 pr-4 text-center" onClick={() => setOpen((o) => !o)}>
          <span
            className={cn(
              'inline-block font-mono text-[10px] text-navy/35 transition-transform duration-200',
              open && 'rotate-180',
            )}
          >
            ▾
          </span>
        </td>
      </tr>

      {open && (
        <tr className={cn(selected ? 'bg-gold/[0.07]' : index % 2 === 0 ? 'bg-warm-white' : 'bg-white')}>
          <td colSpan={8} className="border-b border-[rgba(0,30,80,0.06)] px-6 pb-5 pt-2">
            <div className="flex flex-wrap gap-x-10 gap-y-3">
              <div>
                <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.15em] text-navy/35">Configuración</p>
                <p className="font-mono text-[12px] text-navy/75">
                  {CONFIG_LABELS[engine.config]} · {engine.cylinders} cil. · {formatDisplacement(engine.displacement)}
                </p>
              </div>
              <div>
                <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.15em] text-navy/35">Potencia</p>
                <p className="font-mono text-[12px] text-navy/75">
                  {engine.hp}hp{engine.turbo ? ' · Turbo' : ' · Atmosférico'}
                </p>
              </div>
              <div>
                <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.15em] text-navy/35">Combustible</p>
                <p className="font-mono text-[12px] text-navy/75">{FUEL_LABELS[engine.fuel]}</p>
              </div>
              <div className="w-full">
                <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.15em] text-navy/35">Vehículos compatibles</p>
                <p className="font-mono text-[12px] text-navy/65">
                  {engine.commonVehicles.join(' · ')}
                </p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ── Main component ────────────────────────────────────────────────────────

export function EngineDatabase() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [filtersOpen, setFiltersOpen] = useState(false)

  const tog = {
    brand:        (v: Brand)          => setFilters((p) => ({ ...p, brands:        toggleItem(p.brands, v) })),
    fuel:         (v: FuelType)        => setFilters((p) => ({ ...p, fuels:         toggleItem(p.fuels, v) })),
    displacement: (v: DisplacementKey) => setFilters((p) => ({ ...p, displacements: toggleItem(p.displacements, v) })),
    hp:           (v: HpKey)           => setFilters((p) => ({ ...p, hps:           toggleItem(p.hps, v) })),
    vehicleType:  (v: VehicleType)     => setFilters((p) => ({ ...p, vehicleTypes:  toggleItem(p.vehicleTypes, v) })),
    config:       (v: EngineConfig)    => setFilters((p) => ({ ...p, configs:       toggleItem(p.configs, v) })),
    turbo:        (v: TurboKey)        => setFilters((p) => ({ ...p, turbos:        toggleItem(p.turbos, v) })),
  }

  const filtered = useMemo(() => applyFilters(ENGINES, filters), [filters])

  const activeCount =
    filters.brands.length +
    filters.fuels.length +
    filters.displacements.length +
    filters.hps.length +
    filters.vehicleTypes.length +
    filters.configs.length +
    filters.turbos.length +
    (filters.search.trim() ? 1 : 0)

  const toggleRow = useCallback((engine: Engine, index: number) => {
    const key = rowKey(engine, index)
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const allFilteredKeys = useMemo(() => filtered.map((e, i) => rowKey(e, i)), [filtered])
  const selectedCount = selected.size
  const allSelected = allFilteredKeys.length > 0 && allFilteredKeys.every((k) => selected.has(k))
  const someSelected = !allSelected && allFilteredKeys.some((k) => selected.has(k))

  function toggleAll(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      setSelected((prev) => { const n = new Set(prev); allFilteredKeys.forEach((k) => n.add(k)); return n })
    } else {
      setSelected((prev) => { const n = new Set(prev); allFilteredKeys.forEach((k) => n.delete(k)); return n })
    }
  }

  const selectedEngines = useMemo(
    () => filtered.filter((e, i) => selected.has(rowKey(e, i))),
    [filtered, selected],
  )

  return (
    <div className="pb-28">

      {/* ── Search + mobile filter toggle ──────────────────────────────── */}
      <div className="mb-6 flex items-center gap-3">
        {/* Fix 7: search bar with visible border and subtle fill */}
        <div className="relative flex-1">
          <input
            type="search"
            value={filters.search}
            onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
            placeholder="Buscar código, marca o vehículo…"
            className="w-full border border-navy/20 bg-[rgba(0,30,80,0.03)] py-2.5 pl-4 pr-10 font-mono text-[16px] md:text-[12px] text-navy placeholder:text-navy/30 outline-none focus:border-gold/60 transition-colors duration-200"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => setFilters((p) => ({ ...p, search: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[13px] text-navy/35 hover:text-navy/65"
            >
              ×
            </button>
          )}
        </div>

        {/* Mobile filter toggle — hidden on desktop */}
        <button
          type="button"
          onClick={() => setFiltersOpen((o) => !o)}
          className={cn(
            'flex shrink-0 items-center gap-2 border px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.10em] transition-colors duration-200 md:hidden',
            filtersOpen || activeCount > 0
              ? 'border-gold bg-gold text-navy'
              : 'border-navy/20 bg-[rgba(0,30,80,0.03)] text-navy/60',
          )}
        >
          {activeCount > 0 ? (
            <>Filtros · {activeCount}</>
          ) : filtersOpen ? (
            <>Cerrar</>
          ) : (
            <>Filtrar</>
          )}
        </button>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-gold hover:text-gold/70 transition-colors md:block"
          >
            Limpiar ({activeCount})
          </button>
        )}
      </div>

      {/* ── Filter panel ───────────────────────────────────────────────── */}
      {/* Fix 2: wings-rule entry ceremony */}
      <div className={cn('mb-2', !filtersOpen && 'hidden md:block')}>
        <div className="wings-rule mb-6" />
      </div>
      <div className={cn('mb-8 bg-[#000C1F] px-5 py-5 md:px-6 md:py-6', !filtersOpen && 'hidden md:block')}>

        <FilterRow label="Marca" variant="brand">
          {BRANDS.map((b) => (
            <Chip key={b} variant="brand" active={filters.brands.includes(b)} onClick={() => tog.brand(b)}>
              {b}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="Aplicación" variant="application">
          {(Object.keys(VEHICLE_TYPE_LABELS) as VehicleType[]).map((v) => (
            <Chip key={v} variant="application" active={filters.vehicleTypes.includes(v)} onClick={() => tog.vehicleType(v)}>
              {VEHICLE_TYPE_LABELS[v]}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="Cilindrada" variant="performance">
          {DISPLACEMENT_RANGES.map((r) => (
            <Chip
              key={r.min}
              variant="performance"
              active={filters.displacements.includes(String(r.min) as DisplacementKey)}
              onClick={() => tog.displacement(String(r.min) as DisplacementKey)}
            >
              {r.label}
            </Chip>
          ))}
          <span className="mx-2 self-center font-mono text-[10px] text-[#C4933F]/20" aria-hidden>·</span>
          {HP_RANGES.map((r) => (
            <Chip
              key={r.min}
              variant="performance"
              active={filters.hps.includes(String(r.min) as HpKey)}
              onClick={() => tog.hp(String(r.min) as HpKey)}
            >
              {r.label}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="Técnico" variant="technical">
          {(['gasoline', 'diesel', 'lpg'] as FuelType[]).map((f) => (
            <Chip key={f} variant="technical" active={filters.fuels.includes(f)} onClick={() => tog.fuel(f)}>
              {FUEL_LABELS[f]}
            </Chip>
          ))}
          <span className="mx-2 self-center font-mono text-[10px] text-[#7FAF87]/20 hidden md:inline" aria-hidden>·</span>
          <Chip variant="technical" active={filters.turbos.includes('false')} onClick={() => tog.turbo('false')}>Atmosférico</Chip>
          <Chip variant="technical" active={filters.turbos.includes('true')}  onClick={() => tog.turbo('true')}>Turbo</Chip>
          <span className="mx-2 self-center font-mono text-[10px] text-[#7FAF87]/20 hidden md:inline" aria-hidden>·</span>
          {(Object.keys(CONFIG_LABELS) as EngineConfig[]).map((c) => (
            <Chip key={c} variant="technical" active={filters.configs.includes(c)} onClick={() => tog.config(c)}>
              {c}
            </Chip>
          ))}
        </FilterRow>

        {/* Mobile: limpiar inside panel */}
        {activeCount > 0 && (
          <div className="mt-4 border-t border-warm-white/[0.06] pt-4 md:hidden">
            <button
              type="button"
              onClick={() => { setFilters(EMPTY_FILTERS); setFiltersOpen(false) }}
              className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold hover:text-gold/70 transition-colors"
            >
              Limpiar filtros ({activeCount})
            </button>
          </div>
        )}
      </div>

      {/* ── Result count ────────────────────────────────────────────────── */}
      {/* Fix 6: result count weight text-[10px]/50 → text-[11px]/70 */}
      <div className="mb-4 flex items-center justify-between border-b border-[rgba(0,30,80,0.07)] pb-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-navy/70">
          <span className="text-navy">{filtered.length}</span> motores
          {filters.brands.length > 0 && (
            <span className="ml-1 text-navy/40">· {filters.brands.join(', ')}</span>
          )}
        </p>
        {selectedCount > 0 && (
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="font-mono text-[10px] uppercase tracking-[0.12em] text-navy/45 hover:text-navy/70 transition-colors"
          >
            Deseleccionar ({selectedCount})
          </button>
        )}
      </div>

      {/* ── Engine list ─────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-navy/40">
            Ningún motor coincide con los filtros seleccionados
          </p>
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="mt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-gold hover:text-gold/70 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <>
          {/* ── Mobile: card list ──────────────────────────────────────── */}
          <div className="md:hidden">
            {/* Mobile select-all strip */}
            <div className="flex items-center gap-3 border-b border-[rgba(0,30,80,0.09)] pb-2 mb-0 px-4">
              <Check
                checked={allSelected}
                indeterminate={someSelected}
                onChange={toggleAll}
                label="Seleccionar todos"
              />
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-navy/40">
                Seleccionar todos
              </span>
            </div>
            {filtered.map((engine, i) => (
              <EngineCard
                key={rowKey(engine, i)}
                engine={engine}
                index={i}
                selected={selected.has(rowKey(engine, i))}
                onToggle={() => toggleRow(engine, i)}
              />
            ))}
          </div>

          {/* ── Desktop: table ─────────────────────────────────────────── */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[rgba(0,30,80,0.09)]">
                  <th className="w-10 py-2 pl-4 pr-2">
                    <Check
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={toggleAll}
                      label="Seleccionar todos"
                    />
                  </th>
                  {['Marca', 'Motor', 'Cilindrada', 'Potencia', 'Combustible', 'Aplicación'].map((h) => (
                    <th key={h} className="py-2 pr-4 text-left font-mono text-[9px] uppercase tracking-[0.16em] text-navy/45">
                      {h}
                    </th>
                  ))}
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((engine, i) => (
                  <EngineRow
                    key={rowKey(engine, i)}
                    engine={engine}
                    index={i}
                    selected={selected.has(rowKey(engine, i))}
                    onToggle={() => toggleRow(engine, i)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Legend ──────────────────────────────────────────────────────── */}
      <div className="mt-8 border-t border-[rgba(0,30,80,0.07)] pt-6">
        <div className="flex flex-wrap gap-x-8 gap-y-1.5">
          {[
            ['CKD', 'Complete Knock Down — kit desmontado sin precio de ensamble'],
            ['T',   'Turbo / sobrealimentado'],
          ].map(([term, def]) => (
            <p key={term} className="font-mono text-[9px] text-navy/35">
              <span className="mr-1.5 font-semibold text-navy/55">{term}</span>{def}
            </p>
          ))}
        </div>
      </div>

      {/* ── Sticky cotización bar ───────────────────────────────────────── */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-0 left-0 right-0 z-50 border-t border-gold/30 bg-navy shadow-[0_-8px_32px_rgba(0,0,0,0.20)]"
          >
            <div className="mx-auto max-w-6xl px-4 py-3 md:px-6 md:py-4">
              {/* Mobile: stacked layout */}
              <div className="flex flex-col gap-2 md:hidden">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-warm-white/60">
                    <span className="text-gold">{selectedCount}</span>{' '}
                    {selectedCount === 1 ? 'motor seleccionado' : 'motores seleccionados'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelected(new Set())}
                    className="font-mono text-[10px] uppercase tracking-[0.12em] text-warm-white/30 hover:text-warm-white/60 transition-colors"
                  >
                    Limpiar
                  </button>
                </div>
                <a
                  href={buildWhatsAppLink(selectedEngines)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-3 bg-gold py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-navy transition-colors duration-200 active:bg-gold/80"
                >
                  <span className="h-px w-5 bg-current" aria-hidden />
                  {selectedCount === 1 ? 'Cotizar motor' : `Cotizar ${selectedCount} motores`}
                </a>
              </div>

              {/* Desktop: inline layout */}
              <div className="hidden items-center justify-between gap-4 md:flex">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-warm-white/60">
                  <span className="text-gold">{selectedCount}</span>{' '}
                  {selectedCount === 1 ? 'motor seleccionado' : 'motores seleccionados'}
                </p>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setSelected(new Set())}
                    className="font-mono text-[10px] uppercase tracking-[0.12em] text-warm-white/30 hover:text-warm-white/60 transition-colors"
                  >
                    Limpiar
                  </button>
                  <a
                    href={buildWhatsAppLink(selectedEngines)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-gold px-8 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-navy transition-colors duration-200 hover:bg-gold/80"
                  >
                    <span className="h-px w-5 bg-current" aria-hidden />
                    {selectedCount === 1 ? 'Cotizar motor' : `Cotizar ${selectedCount} motores`}
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scroll to top ───────────────────────────────────────────────── */}
      <ScrollTopButton hasBar={selectedCount > 0} />
    </div>
  )
}
