'use client'

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
  isBoolean?: boolean
  showIfAny?: (v: ProductVariant) => boolean
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
      v.engine ? `${v.engine.displacement_cc} cc`
      : v.battery_ev ? `${v.battery_ev.pack_kwh} kWh`
      : '—',
  },
  {
    key: 'power',
    label: 'Potencia',
    group: 'Motor',
    getValue: (v) =>
      v.engine ? `${v.engine.power_kw} kW`
      : v.battery_ev ? `${v.battery_ev.rated_peak_kw} kW`
      : '—',
  },
  {
    key: 'torque',
    label: 'Par motor',
    group: 'Motor',
    getValue: (v) => (v.engine ? `${v.engine.torque_nm} Nm` : null),
  },
  // BEV only
  { key: 'range', label: 'Autonomía (WLTP)', group: 'Batería', getValue: (v) => (v.battery_ev ? `${v.battery_ev.range_km} km` : null) },
  { key: 'battery_brand', label: 'Marca batería', group: 'Batería', getValue: (v) => (v.battery_ev ? v.battery_ev.battery_brand : null) },
  { key: 'charger', label: 'Carga', group: 'Batería', getValue: (v) => (v.battery_ev ? v.battery_ev.charger : null) },
  // Dimensiones
  { key: 'wheelbase', label: 'Batalla', group: 'Dimensiones', getValue: (v) => `${v.wheelbase_mm} mm` },
  { key: 'cabin', label: 'Cabina', group: 'Dimensiones', getValue: (v) => v.cabin },
  { key: 'overall', label: 'Dim. ext. (L×A×H)', group: 'Dimensiones', getValue: (v) => v.overall_dims.replace(/x/g, '×') + ' mm' },
  { key: 'cargo', label: 'Caja de carga', group: 'Dimensiones', getValue: (v) => (v.cargo_box ? v.cargo_box.replace(/x/g, '×') + ' mm' : '—') },
  {
    key: 'overhang', label: 'Voladizo del./tras.', group: 'Dimensiones',
    getValue: (v) => v.front_rear_overhang_mm ? v.front_rear_overhang_mm + ' mm' : null,
    showIfAny: (v) => !!v.front_rear_overhang_mm,
  },
  {
    key: 'wheel_track', label: 'Vía del./tras.', group: 'Dimensiones',
    getValue: (v) => v.wheel_track_mm ? v.wheel_track_mm + ' mm' : null,
    showIfAny: (v) => !!v.wheel_track_mm,
  },
  // Transmisión
  { key: 'gearshift', label: 'Caja de cambios', group: 'Transmisión', getValue: (v) => v.gearshift ?? '—' },
  { key: 'tyre', label: 'Neumático', group: 'Transmisión', getValue: (v) => v.tyre ?? '—' },
  { key: 'max_speed', label: 'Vel. máxima', group: 'Transmisión', getValue: (v) => `${v.max_speed_kmh} km/h` },
  {
    key: 'final_ratio', label: 'Relación final', group: 'Transmisión',
    getValue: (v) => v.final_ratio != null ? v.final_ratio.toString() : null,
    showIfAny: (v) => v.final_ratio != null,
  },
  {
    key: 'qty_wheels', label: 'N.º ruedas', group: 'Transmisión',
    getValue: (v) => v.qty_wheels ?? null,
    showIfAny: (v) => !!v.qty_wheels,
  },
  {
    key: 'battery_volt', label: 'Tensión batería', group: 'Transmisión',
    getValue: (v) => v.battery_volt ?? null,
    showIfAny: (v) => !!v.battery_volt,
  },
  // Frenos — shown only if at least one variant has brake data
  {
    key: 'brake_system', label: 'Sistema de frenos', group: 'Frenos',
    getValue: (v) => v.brake_system ?? null,
    showIfAny: (v) => !!v.brake_system,
  },
  {
    key: 'parking_brake', label: 'Freno de estacionamiento', group: 'Frenos',
    getValue: (v) => v.parking_brake ?? null,
    showIfAny: (v) => !!v.parking_brake,
  },
  // Configuraciones — shown only if at least one variant has the feature
  {
    key: 'abs', label: 'ABS', group: 'Configuraciones', isBoolean: true,
    getValue: (v) => v.features.abs ? '1' : '0',
    showIfAny: (v) => v.features.abs,
  },
  {
    key: 'power_steering', label: 'Dir. asistida', group: 'Configuraciones', isBoolean: true,
    getValue: (v) => v.features.power_steering ? '1' : '0',
    showIfAny: (v) => v.features.power_steering,
  },
  {
    key: 'ac', label: 'Aire acondicionado', group: 'Configuraciones', isBoolean: true,
    getValue: (v) => v.features.ac ? '1' : '0',
    showIfAny: (v) => v.features.ac,
  },
  {
    key: 'power_window', label: 'Vidrios eléctricos', group: 'Configuraciones', isBoolean: true,
    getValue: (v) => v.features.power_window ? '1' : '0',
    showIfAny: (v) => v.features.power_window,
  },
  {
    key: 'central_lock', label: 'Cierre centralizado', group: 'Configuraciones', isBoolean: true,
    getValue: (v) => v.features.central_lock ? '1' : '0',
    showIfAny: (v) => v.features.central_lock,
  },
  {
    key: 'media', label: 'Multimedia', group: 'Configuraciones',
    getValue: (v) => v.features.media,
    showIfAny: (v) => !!v.features.media,
  },
]

// Fixed compositional column backgrounds — applied by column index (vi), never by selection state.
// Odd-indexed columns (vi=0,2,4) are lighter; even-indexed (vi=1,3) are slightly darker.
// This creates vertical scan lanes that help buyers track a single model's specs.
const COL_BG: [string, string] = ['#F8F6F0', '#EEEAE2']

// Mobile-only: row alternation for single-column list layout
const ROW_BG: [string, string] = ['#F8F6F0', '#EEEAE2']

function BoolCircle({ present }: { present: boolean }) {
  return (
    <span
      className={cn(
        'inline-block text-base leading-none',
        present ? 'text-navy' : 'text-navy/20',
      )}
      aria-label={present ? 'Incluido' : 'No incluido'}
    >
      {present ? '●' : '○'}
    </span>
  )
}

export function VariantTable({ variants, selectedModel, onSelectVariant }: VariantTableProps) {
  const activeModel = selectedModel ?? variants[0]?.model

  const activeRows = SPEC_ROWS.filter((row) => {
    if (row.showIfAny) return variants.some(row.showIfAny)
    return variants.some((v) => row.getValue(v) !== null)
  })

  const groups = [...new Set(activeRows.map((r) => r.group))]

  const mobileVariant = variants.find((v) => v.model === activeModel) ?? variants[0]
  const mobileIdx = Math.max(0, variants.findIndex((v) => v.model === activeModel))

  const variantPct = 84 / variants.length

  return (
    <>
      {/* ── DESKTOP TABLE (md+) ─────────────────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto no-scrollbar">
        <table className="w-full border-collapse" style={{ tableLayout: 'fixed', minWidth: '600px' }}>
          <colgroup>
            <col style={{ width: '16%' }} />
            {variants.map((v) => (
              <col key={v.model} style={{ width: `${variantPct}%` }} />
            ))}
          </colgroup>

          {/* Model header row */}
          <thead>
            <tr>
              {/* Label column header — always warm white with right separator */}
              <th
                className="sticky left-0 z-20 py-4 pr-3 text-left align-bottom border-r border-navy/[0.08]"
                style={{ backgroundColor: COL_BG[0] }}
                aria-label="Especificación"
              />
              {variants.map((v, vi) => {
                const isSelected = v.model === activeModel
                return (
                  <th
                    key={v.model}
                    className={cn(
                      'px-3 py-4 text-left align-bottom',
                      isSelected && 'border-t-2 border-gold',
                    )}
                    style={{ backgroundColor: vi % 2 === 0 ? COL_BG[0] : COL_BG[1] }}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectVariant(v.model)}
                      className={cn(
                        'flex flex-col gap-0.5 text-left transition-opacity duration-200',
                        !isSelected && 'hover:opacity-70',
                      )}
                    >
                      <span className={cn(
                        'font-mono text-[10px] uppercase tracking-[0.13em]',
                        isSelected ? 'text-gold' : 'text-navy/35',
                      )}>
                        {FUEL_LABELS[v.fuel_type] ?? v.fuel_type}
                      </span>
                      <span className={cn(
                        'font-mono text-xs font-medium leading-tight',
                        isSelected ? 'text-gold' : 'text-navy',
                      )}>
                        {v.model}
                      </span>
                      <span className="font-mono text-[10px] text-navy/35">
                        {v.payload_t}T · {(v.gvw_kg / 1000).toFixed(1)}t GVW
                      </span>
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody>
            {groups.map((group) => {
              const rows = activeRows.filter((r) => r.group === group)
              return (
                <>
                  {/* Group header — navy full-width band */}
                  <tr key={`g-${group}`}>
                    <td
                      colSpan={variants.length + 1}
                      className="sticky left-0 z-20 bg-navy px-3 py-2"
                    >
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
                        {group}
                      </span>
                    </td>
                  </tr>

                  {rows.map((row) => {
                    const values = variants.map((v) => row.getValue(v))

                    return (
                      <tr key={row.key} className="border-b border-navy/[0.04]">
                        {/* Sticky label cell — fixed warm white with right separator */}
                        <td
                          className="sticky left-0 z-20 py-2.5 pr-3 pl-3 border-r border-navy/[0.08]"
                          style={{ backgroundColor: COL_BG[0] }}
                        >
                          <span className="font-mono text-[11px] text-navy/50">{row.label}</span>
                        </td>

                        {variants.map((v, vi) => {
                          const val = values[vi]

                          return (
                            <td
                              key={v.model}
                              className="py-2.5 pl-3 pr-2 align-middle"
                              style={{ backgroundColor: vi % 2 === 0 ? COL_BG[0] : COL_BG[1] }}
                            >
                              {row.isBoolean ? (
                                <BoolCircle present={val === '1'} />
                              ) : val !== null ? (
                                <span className="font-mono text-[11px] leading-snug break-all text-navy">
                                  {val}
                                </span>
                              ) : (
                                <span className="font-mono text-[10px] text-navy/20">—</span>
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
              <td
                className="sticky left-0 z-20 pt-5 border-r border-navy/[0.08]"
                style={{ backgroundColor: COL_BG[0] }}
              />
              {variants.map((v, vi) => {
                const isSelected = v.model === activeModel
                return (
                  <td
                    key={v.model}
                    className="pl-3 pr-2 pt-5"
                    style={{ backgroundColor: vi % 2 === 0 ? COL_BG[0] : COL_BG[1] }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelectVariant(v.model)
                        document.getElementById('inquiry-form')?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        })
                      }}
                      className={cn(
                        'w-full py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-all duration-200',
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

      {/* ── MOBILE: comparison bar + single-column spec list (<md) ─────── */}
      <div className="block md:hidden">

        {/* Compact comparison bar — all models visible simultaneously.
            Replaces plain tab strip: buyer sees payload + GVW for all variants
            before choosing which model to explore in detail below. */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse" style={{ tableLayout: 'fixed', minWidth: '300px' }}>
            <colgroup>
              <col style={{ width: '13%' }} />
              {variants.map((v) => (
                <col key={v.model} style={{ width: `${87 / variants.length}%` }} />
              ))}
            </colgroup>
            <tbody>
              {/* Model name row — clickable tab buttons */}
              <tr className="border-b-2 border-navy/[0.06]">
                <td className="pb-2.5" />
                {variants.map((v) => {
                  const isActive = v.model === activeModel
                  return (
                    <td
                      key={v.model}
                      className={cn(
                        'pb-2.5 pl-1',
                        isActive ? 'border-t-2 border-gold' : 'border-t-2 border-transparent',
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => onSelectVariant(v.model)}
                        className="w-full text-left"
                        aria-pressed={isActive}
                      >
                        <span className={cn(
                          'block font-mono text-[10px] font-medium uppercase tracking-[0.10em]',
                          isActive ? 'text-gold' : 'text-navy/45',
                        )}>
                          {v.model}
                        </span>
                      </button>
                    </td>
                  )
                })}
              </tr>

              {/* Carga útil row */}
              <tr className="border-b border-navy/[0.05]">
                <td className="py-2 pr-1">
                  <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-navy/30">
                    Carga
                  </span>
                </td>
                {variants.map((v) => {
                  const isActive = v.model === activeModel
                  return (
                    <td key={v.model} className="py-2 pl-1">
                      <span className={cn(
                        'font-mono text-[11px] font-medium',
                        isActive ? 'text-gold' : 'text-navy/50',
                      )}>
                        {v.payload_t}T
                      </span>
                    </td>
                  )
                })}
              </tr>

              {/* GVW row */}
              <tr className="border-b-2 border-navy/[0.10]">
                <td className="py-2 pr-1">
                  <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-navy/30">
                    GVW
                  </span>
                </td>
                {variants.map((v) => {
                  const isActive = v.model === activeModel
                  return (
                    <td key={v.model} className="py-2 pl-1">
                      <span className={cn(
                        'font-mono text-[11px]',
                        isActive ? 'text-gold' : 'text-navy/50',
                      )}>
                        {(v.gvw_kg / 1000).toFixed(1)}t
                      </span>
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Selected model caption */}
        {mobileVariant && (
          <div className="mt-3 mb-4 flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold">
              {FUEL_LABELS[mobileVariant.fuel_type] ?? mobileVariant.fuel_type}
            </span>
            <span className="font-mono text-[10px] text-navy/25">·</span>
            <span className="font-mono text-[10px] text-navy/40">
              {mobileVariant.payload_t}T · GVW {(mobileVariant.gvw_kg / 1000).toFixed(1)}t
            </span>
          </div>
        )}

        {/* Grouped spec list */}
        {groups.map((group, gi) => {
          const rows = activeRows.filter((r) => r.group === group)
          return (
            <div key={group}>
              <div className={cn('bg-navy px-3 py-2', gi === 0 ? 'mt-1' : 'mt-4')}>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
                  {group}
                </span>
              </div>

              <dl>
                {rows.map((row, ri) => {
                  const val = row.getValue(variants[mobileIdx])
                  const isEven = ri % 2 === 0

                  return (
                    <div
                      key={row.key}
                      className="flex items-center justify-between gap-4 border-b border-navy/[0.05] px-3 py-2.5"
                      style={{ backgroundColor: isEven ? ROW_BG[0] : ROW_BG[1] }}
                    >
                      <dt className="shrink-0 font-mono text-[11px] text-navy/50">{row.label}</dt>
                      <dd className="text-right">
                        {row.isBoolean ? (
                          <BoolCircle present={val === '1'} />
                        ) : (
                          <span className="font-mono text-sm text-navy">
                            {val ?? '—'}
                          </span>
                        )}
                      </dd>
                    </div>
                  )
                })}
              </dl>
            </div>
          )
        })}

        {/* Mobile CTA */}
        <button
          type="button"
          onClick={() =>
            document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
          className="mt-6 w-full bg-gold py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-navy"
        >
          Solicitar {activeModel}
        </button>
      </div>
    </>
  )
}
