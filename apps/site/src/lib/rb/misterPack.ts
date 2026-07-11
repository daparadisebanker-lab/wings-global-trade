// src/lib/rb/misterPack.ts
// The Mister brand data loop (SPEC §5): a compact, auto-compiled knowledge
// pack per represented brand — zero manual pack-writing. Compiled from the
// same rb_public_* views the shelf reads, so Mister and the site can never
// disagree. Availability enters as STRUCTURE (a container exists and is
// filling), never as promises — remaining counts stay out of the pack so
// they can never be narrated; the live number lives in the configurator.
//
// Injected per-turn via buildMisterContext. Cached ~60 s (same staleness
// rule as the shelf). Server-side only.

import { RB_BRANDS } from '@/lib/rb/fixtures'
import { getRbContainers, getRbTemplateForBrand } from '@/lib/rb/data'
import { fmt } from '@/lib/rb/packing'

export interface RbMisterPack {
  code: string
  brand: string
  category: string
  /** Unit-math vocabulary Mister may state verbatim — it is packing data, not price/availability. */
  unit_math: string[]
  /** Structural availability: a container exists and is open — no counts, no dates. */
  availability_shape: string
  products: string[]
  configurator_url: string
  forbidden_reminder: string
}

let cache: { packs: RbMisterPack[]; at: number } | null = null
const TTL_MS = 60_000

export async function getRbMisterPacks(): Promise<RbMisterPack[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.packs

  const packs: RbMisterPack[] = []
  for (const brand of RB_BRANDS) {
    try {
      const [template, containers] = await Promise.all([
        getRbTemplateForBrand(brand.slug),
        getRbContainers(brand.slug),
      ])
      if (!template) continue

      const perSlotPackets = template.packagesPerSlot * template.packetsPerPackage
      const perSlotUnits = template.packagesPerSlot * template.unitsPerPackage
      const perSlotKg = Math.round(template.packagesPerSlot * template.packageKg)

      packs.push({
        code: brand.code,
        brand: brand.name,
        category: brand.categoryLabel,
        unit_math: [
          `contenedor ${template.kind}: ${template.totalSlots} cupos = ${fmt(template.totalPackages)} cajas máster`,
          `1 cupo = ${template.packagesPerSlot} cajas = ${fmt(perSlotPackets)} paquetes = ${fmt(perSlotUnits)} ${template.unitNamePlural} = ${fmt(perSlotKg)} kg`,
        ],
        availability_shape:
          containers.length > 0
            ? 'hay un contenedor en llenado — la disponibilidad en vivo se ve en el configurador'
            : 'sin contenedor abierto ahora — el equipo avisa cuando abra el siguiente',
        products: brand.slug === 'aladin'
          ? ['papel higiénico de bambú (pack ×10 rollos, 30 m, 4 capas)', 'papel facial de bambú (empaque ×390 hojas, 3 capas)']
          : [],
        configurator_url: `/marcas/${brand.slug}/contenedor`,
        forbidden_reminder:
          'precio del cupo: a cotizar — nunca cifras; nunca fechas de cierre ni conteos de cupos en prosa',
      })
    } catch (err) {
      // A pack failure must never break a Mister turn — degrade to no pack.
      console.error('[rb/misterPack]', brand.slug, err)
    }
  }

  cache = { packs, at: Date.now() }
  return packs
}
