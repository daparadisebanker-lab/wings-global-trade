// src/components/features/catalog/UseCaseStrip.tsx
// Server component — no 'use client' directive

import Link from 'next/link'

interface UseCaseStripProps {
  specs: Record<string, string>
  filterAttrs?: Record<string, string | number | string[]> | null
}

interface UseCase {
  slug: string
  label: string
  minHp: number
  requires4wd: boolean
}

const USE_CASES: UseCase[] = [
  { slug: 'arrozal',        label: 'Arrozal',           minHp: 90,  requires4wd: true  },
  { slug: 'frutales',       label: 'Frutales',          minHp: 60,  requires4wd: false },
  { slug: 'cultivos-surco', label: 'Cultivos en surco', minHp: 40,  requires4wd: false },
  { slug: 'ganaderia',      label: 'Ganadería',         minHp: 60,  requires4wd: false },
]

const HP_KEYS = ['Potencia', 'HP', 'Potencia máxima', 'Motor', 'CV', 'Horsepower']

function extractHpFromSpecs(specs: Record<string, string>): number | null {
  for (const key of HP_KEYS) {
    const value = specs[key]
    if (value) {
      const parsed = parseFloat(value.replace(/[^0-9.]/g, ''))
      if (!isNaN(parsed) && parsed > 0) {
        return parsed
      }
    }
  }
  return null
}

function hasSpecs4wd(specs: Record<string, string>): boolean {
  return Object.values(specs).some((v) => /4WD/i.test(v))
}

export function UseCaseStrip({ specs, filterAttrs }: UseCaseStripProps) {
  // Extract HP — try filterAttrs.hp first, then parse from specs
  let hp: number | null = null
  if (filterAttrs?.hp !== undefined) {
    const raw = filterAttrs.hp
    if (typeof raw === 'number') {
      hp = raw
    } else if (typeof raw === 'string') {
      const parsed = parseFloat(raw)
      if (!isNaN(parsed)) hp = parsed
    }
  }
  if (hp === null) {
    hp = extractHpFromSpecs(specs)
  }

  // Extract traction
  const has4wd =
    filterAttrs?.traction === '4wd' ||
    (Array.isArray(filterAttrs?.traction) && filterAttrs.traction.includes('4wd')) ||
    hasSpecs4wd(specs)

  const hpUnknown = hp === null

  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-navy/40 mb-4">
        Aplicaciones compatibles
      </p>

      <div className="flex flex-wrap gap-2">
        {USE_CASES.map((uc) => {
          const compatible =
            hpUnknown ||
            (hp !== null && hp >= uc.minHp && (!uc.requires4wd || has4wd))

          return (
            <Link
              key={uc.slug}
              href={`/catalogo/maquinaria-agricola/aplicacion/${uc.slug}`}
              className={
                compatible
                  ? 'border border-gold/30 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-navy hover:border-gold hover:bg-gold/[0.03] transition-all'
                  : 'border border-[rgba(0,30,80,0.08)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-navy/30 hover:text-navy/50 transition-all'
              }
            >
              {compatible ? '✓ ' : '· '}
              {uc.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
