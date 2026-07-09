// src/components/features/catalog/UseCaseStrip.tsx
// Server component — no 'use client' directive

import Link from 'next/link'

interface UseCase {
  label: string
  slug?: string       // if set → links to /catalogo/[category]/aplicacion/[slug]
  minHp?: number      // ag-only: hide chip if product HP is below this
  requires4wd?: boolean
}

// Use cases keyed by category slug. Only categories listed here render the section.
const CATEGORY_USE_CASES: Record<string, UseCase[]> = {
  'maquinaria-agricola': [
    { label: 'Arrozal',           slug: 'arrozal',        minHp: 90,  requires4wd: true  },
    { label: 'Frutales',          slug: 'frutales',       minHp: 60,  requires4wd: false },
    { label: 'Cultivos en surco', slug: 'cultivos-surco', minHp: 40,  requires4wd: false },
    { label: 'Ganadería',         slug: 'ganaderia',      minHp: 60,  requires4wd: false },
  ],
  'camiones': [
    { label: 'Distribución urbana'      },
    { label: 'Carga regional'           },
    { label: 'Transporte pesado'        },
    { label: 'Construcción y obras'     },
    { label: 'Logística agropecuaria'   },
  ],
  'buses': [
    { label: 'Transporte escolar'    },
    { label: 'Transporte de personal'},
    { label: 'Turismo'               },
    { label: 'Transporte interurbano'},
    { label: 'Transporte rural'      },
  ],
  'equipo-industrial': [
    { label: 'Construcción e infraestructura' },
    { label: 'Minería y canteras'             },
    { label: 'Manufactura industrial'         },
    { label: 'Logística y almacén'            },
  ],
}

interface UseCaseStripProps {
  categorySlug: string
  specs: Record<string, string>
  filterAttrs?: Record<string, string | number | string[]> | null
}

const HP_KEYS = ['Potencia del motor', 'Potencia', 'HP', 'Potencia máxima', 'Motor', 'CV']

function extractHp(
  specs: Record<string, string>,
  filterAttrs?: Record<string, string | number | string[]> | null,
): number | null {
  if (filterAttrs?.hp !== undefined) {
    const raw = filterAttrs.hp
    if (typeof raw === 'number') return raw
    if (typeof raw === 'string') {
      const parsed = parseFloat(raw)
      if (!isNaN(parsed)) return parsed
    }
  }
  for (const key of HP_KEYS) {
    const value = specs[key]
    if (value) {
      const parsed = parseFloat(value.replace(/[^0-9.]/g, ''))
      if (!isNaN(parsed) && parsed > 0) return parsed
    }
  }
  return null
}

function has4wd(
  specs: Record<string, string>,
  filterAttrs?: Record<string, string | number | string[]> | null,
): boolean {
  if (filterAttrs?.traction === '4wd') return true
  if (Array.isArray(filterAttrs?.traction) && filterAttrs.traction.includes('4wd')) return true
  return Object.values(specs).some((v) => /4WD/i.test(v))
}

export function UseCaseStrip({ categorySlug, specs, filterAttrs }: UseCaseStripProps) {
  const useCases = CATEGORY_USE_CASES[categorySlug]
  if (!useCases?.length) return null

  const isAg = categorySlug === 'maquinaria-agricola'
  const hp = isAg ? extractHp(specs, filterAttrs) : null
  const traction4wd = isAg ? has4wd(specs, filterAttrs) : false
  const hpUnknown = hp === null

  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-navy/40 mb-4">
        Aplicaciones compatibles
      </p>

      <div className="flex flex-wrap gap-2">
        {useCases.map((uc) => {
          // Ag: show compatibility signal. Other categories: all chips are informational.
          const compatible = !isAg
            || hpUnknown
            || (hp !== null && hp >= (uc.minHp ?? 0) && (!uc.requires4wd || traction4wd))

          const chip = (
            <span
              className={
                compatible
                  ? 'border border-gold/30 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-navy transition-all'
                  : 'border border-navy/15 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-navy/50 transition-all'
              }
            >
              {isAg ? (compatible ? '✓ ' : '· ') : ''}
              {uc.label}
            </span>
          )

          if (uc.slug) {
            return (
              <Link
                key={uc.slug}
                href={`/catalogo/${categorySlug}/aplicacion/${uc.slug}`}
                className="hover:border-gold hover:bg-gold/[0.03]"
              >
                {chip}
              </Link>
            )
          }

          return <div key={uc.label}>{chip}</div>
        })}
      </div>
    </div>
  )
}
