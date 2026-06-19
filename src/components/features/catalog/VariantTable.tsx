'use client'

import { useRef } from 'react'
import { cn } from '@/lib/utils'
import type { ProductVariant } from '@/types/database'

interface VariantTableProps {
  variants: ProductVariant[]
  selectedModel?: string
  onSelectVariant: (model: string) => void
}

const FUEL_LABELS: Record<string, string> = {
  gasoline: 'Gasolina',
  diesel: 'Diésel',
  cng: 'GNC',
  bev: 'Eléctrico',
}

interface SpecRow {
  key: string
  label: string
  group: string
  getValue: (v: ProductVariant) => string | null
}

const SPEC_ROWS: SpecRow[] = [
  // Capacidad
  { key: 'payload', label: 'Carga útil', group: 'Capacidad', getValue: (v) => `${v.payload_t} T` },
  { key: 'gvw', label: 'Peso total (GVW)', group: 'Capacidad', getValue: (v) => `${v.gvw_kg.toLocaleString('es-PE')} kg` },
  { key: 'curb', label: 'Tara', group: 'Capacidad', getValue: (v) => `${v.curb_weight_kg.toLocaleString('es-PE')} kg` },
  // Motor / Batería
  { key: 'fuel', label: 'Combustible', group: 'Motor', getValue: (v) => FUEL_LABELS[v.fuel_type] ?? v.fuel_type },
  { key: 'emission', label: 'Norma emisión', group: 'Motor', getValue: (v) => v.emission ?? '—' },
  {
    key: 'engine_disp',
    label: 'Motor / Batería',
    group: 'Motor',
    getValue: (v) =>
      v.engine
        ? `${v.engine.displacement_cc} cc`
        : v.battery_ev
          ? `${v.battery_ev.pack_kwh} kWh`
          : '—',
  },
  {
    key: 'power',
    label: 'Potencia',
    group: 'Motor',
    getValue: (v) =>
      v.engine
        ? `${v.engine.power_kw} kW`
        : v.battery_ev
          ? `${v.battery_ev.rated_peak_kw} kW`
          : '—',
  },
  {
    key: 'torque',
    label: 'Par motor',
    group: 'Motor',
    getValue: (v) => (v.engine ? `${v.engine.torque_nm} Nm` : null),
  },
  // BEV only
  {
    key: 'range',
    label: 'Autonomía (WLTP)',
    group: 'Batería',
    getValue: (v) => (v.battery_ev ? `${v.battery_ev.range_km} km` : null),
  },
  {
    key: 'battery_brand',
    label: 'Marca batería',
    group: 'Batería',
    getValue: (v) => (v.battery_ev ? v.battery_ev.battery_brand : null),
  },
  {
    key: 'charger',
    label: 'Carga',
    group: 'Batería',
    getValue: (v) => (v.battery_ev ? v.battery_ev.charger : null),
  },
  // Dimensiones
  { key: 'wheelbase', label: 'Batalla', group: 'Dimensiones', getValue: (v) => `${v.wheelbase_mm} mm` },
  { key: 'cabin', label: 'Cabina', group: 'Dimensiones', getValue: (v) => v.cabin },
  {
    key: 'overall',
    label: 'Dim. ext. (L×A×H)',
    group: 'Dimensiones',
    getValue: (v) => v.overall_dims.replace(/x/g, '×') + ' mm',
  },
  {
    key: 'cargo',
    label: 'Caja de carga',
    group: 'Dimensiones',
    getValue: (v) => (v.cargo_box ? v.cargo_box.replace(/x/g, '×') + ' mm' : '—'),
  },
  // Transmisión
  { key: 'gearshift', label: 'Caja de cambios', group: 'Transmisión', getValue: (v) => v.gearshift ?? '—' },
  { key: 'tyre', label: 'Neumático', group: 'Transmisión', getValue: (v) => v.tyre ?? '—' },
  { key: 'max_speed', label: 'Vel. máxima', group: 'Transmisión', getValue: (v) => `${v.max_speed_kmh} km/h` },
]

function getMostCommon(values: (string | null)[]): string | null {
  const freq = new Map<string, number>()
  for (const v of values) {
    if (v !== null) freq.set(v, (freq.get(v) ?? 0) + 1)
  }
  if (freq.size === 0) return null
  return [...freq.entries()].sort((a, b) => b[1] - a[1])[0][0]
}

function isDifferent(values: (string | null)[]): boolean[] {
  const nonNull = values.filter((v): v is string => v !== null)
  if (new Set(nonNull).size <= 1) return values.map(() => false)
  const base = getMostCommon(values)
  return values.map((v) => v !== null && v !== base)
}

export function VariantTable({ variants, selectedModel, onSelectVariant }: VariantTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Filter out rows where all variants return null (e.g. BEV rows for gasoline trucks)
  const activeRows = SPEC_ROWS.filter((row) =>
    variants.some((v) => row.getValue(v) !== null),
  )

  const groups = [...new Set(activeRows.map((r) => r.group))]

  return (
    <div className="relative">
      {/* Scroll shadow indicators */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-warm-white to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-warm-white to-transparent" />

      <div
        ref={scrollRef}
        className="overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none' }}
      >
        <table className="w-full border-collapse" style={{ minWidth: `${Math.max(640, variants.length * 160)}px` }}>
          <thead>
            <tr>
              {/* Spec label column */}
              <th
                className="sticky left-0 z-20 min-w-[140px] bg-warm-white py-4 pr-4 text-left align-bottom"
                aria-label="Especificación"
              />
              {/* Variant columns */}
              {variants.map((v) => {
                const isSelected = v.model === selectedModel
                return (
                  <th
                    key={v.model}
                    className={cn(
                      'min-w-[140px] px-3 py-4 text-left align-bottom transition-colors',
                      isSelected && 'bg-gold/[0.05]',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectVariant(v.model)}
                      className={cn(
                        'group flex flex-col gap-1 text-left transition-all duration-200',
                        isSelected ? 'cursor-default' : 'hover:opacity-80',
                      )}
                    >
                      <span
                        className={cn(
                          'font-mono text-xs uppercase tracking-[0.15em] transition-colors',
                          isSelected ? 'text-gold' : 'text-navy/35',
                        )}
                      >
                        {FUEL_LABELS[v.fuel_type] ?? v.fuel_type}
                      </span>
                      <span
                        className={cn(
                          'font-display text-xl font-light leading-none transition-colors',
                          isSelected ? 'text-gold' : 'text-navy',
                        )}
                      >
                        {v.model}
                      </span>
                      <span className="font-mono text-[10px] text-navy/35">
                        {v.payload_t}T · GVW {(v.gvw_kg / 1000).toFixed(1)}t
                      </span>
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody>
            {groups.map((group, gi) => {
              const rows = activeRows.filter((r) => r.group === group)
              return (
                <>
                  {/* Group header row */}
                  <tr key={`g-${group}`}>
                    <td
                      colSpan={variants.length + 1}
                      className={cn(
                        'sticky left-0 bg-warm-white pb-1 pt-5',
                        gi === 0 && 'pt-3',
                      )}
                    >
                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-gold/50">
                        {group}
                      </span>
                      <div className="mt-1 h-px w-full bg-[rgba(0,30,80,0.06)]" />
                    </td>
                  </tr>

                  {rows.map((row) => {
                    const values = variants.map((v) => row.getValue(v))
                    const diffs = isDifferent(values)

                    return (
                      <tr
                        key={row.key}
                        className="group border-b border-[rgba(0,30,80,0.04)] transition-colors hover:bg-gold/[0.02]"
                      >
                        {/* Spec label */}
                        <td className="sticky left-0 z-10 bg-warm-white py-3 pr-4 group-hover:bg-[#f4f2ec]">
                          <span className="font-mono text-[11px] text-navy/45">{row.label}</span>
                        </td>

                        {/* Values */}
                        {variants.map((v, vi) => {
                          const val = values[vi]
                          const isSelected = v.model === selectedModel
                          const isDiff = diffs[vi]

                          return (
                            <td
                              key={v.model}
                              className={cn(
                                'py-3 pl-3 pr-2 align-middle transition-colors',
                                isSelected && 'bg-gold/[0.04]',
                              )}
                            >
                              {val !== null ? (
                                <span
                                  className={cn(
                                    'font-mono text-[12px] leading-tight',
                                    isDiff
                                      ? 'font-medium text-gold'
                                      : 'text-navy/70',
                                  )}
                                >
                                  {val}
                                </span>
                              ) : (
                                <span className="font-mono text-[11px] text-navy/20">—</span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </>
              )
            })}

            {/* CTA row */}
            <tr>
              <td className="sticky left-0 bg-warm-white pt-6" />
              {variants.map((v) => {
                const isSelected = v.model === selectedModel
                return (
                  <td key={v.model} className="pl-3 pr-2 pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectVariant(v.model)
                        // Scroll to inquiry form on mobile
                        document.getElementById('inquiry-form')?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        })
                      }}
                      className={cn(
                        'w-full py-2.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-all duration-200',
                        isSelected
                          ? 'bg-gold text-navy'
                          : 'border border-gold/30 text-gold/70 hover:border-gold hover:text-gold',
                      )}
                    >
                      {isSelected ? 'Seleccionado' : 'Solicitar'}
                    </button>
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-none bg-gold/60" />
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-navy/30">
          Valor diferente al de referencia
        </span>
      </div>
    </div>
  )
}
