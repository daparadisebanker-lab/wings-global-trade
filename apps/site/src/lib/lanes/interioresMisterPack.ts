// WGT/02 Interiores — Mister knowledge pack (ecosystem §Phase-4).
//
// Auto-compiled from the catalogue, never hand-written. This follows the same
// rule the RB packs already established (src/lib/rb/misterPack.ts): a pack typed
// by hand drifts from the data the moment either changes, and the drift reaches
// a buyer as a wrong carton count. Every figure below is read from
// src/pasillo/data/catalogue.ts and the shared container specs at module load.
//
// One brain, many mouths (root §1.4): this is a knowledge pack, NOT a second
// bot. Mister's character is unchanged in this lane — only the vocabulary and
// the pace are.
//
// Server-side only. Injected per turn by buildMisterContext.

import { SERIES, SKUS } from '@/pasillo/data/catalogue'
import { CONTAINERS, fmtInt, fmtM2 } from '@/pasillo/lib/packing'
import { lane } from '@wings/liveries/interiores/lane.config'

export interface LaneMisterPack {
  code: string
  lane: string
  archetype: string
  /** How the buyer negotiates — the number they actually argue about. */
  unit_math: string[]
  /** Lane terms, ES and EN, so Mister answers in the buyer's register. */
  vocabulary: string[]
  /** Structural catalogue shape. Quantities only — never a price or a date. */
  catalogue_shape: string[]
  /** Lane-specific qualification questions, layered on the shared engine. */
  diagnosis_set: string[]
  /** Mister's posture here. The character never changes; the pace does. */
  register: string
  /** Claims Mister may never make in this lane. */
  forbidden: string[]
  catalogue_url: string
}

const PAYLOAD_KG = CONTAINERS[0].payload

/** Distinct packings across the catalogue, so the pack quotes the real span. */
const PACKINGS = [
  ...new Map(
    SERIES.map((s) => [
      `${s.format_mm.join('×')}|${s.kgs_per_ctn}`,
      {
        format: s.format_mm.join('×'),
        m2PerCtn: s.m2_per_ctn,
        kgPerCtn: s.kgs_per_ctn,
        pcsPerCtn: s.pcs_per_ctn,
      },
    ]),
  ).values(),
]

let cached: LaneMisterPack[] | null = null

/**
 * The lane packs. Synchronous and pure — the catalogue is a generated module,
 * not a query — but it returns a promise so it composes with the other context
 * loaders and so a future Supabase-backed pack is a drop-in replacement.
 */
export async function getLaneMisterPacks(): Promise<LaneMisterPack[]> {
  if (cached) return cached

  cached = [
    {
      code: lane.code,
      lane: lane.name,
      archetype: lane.archetype,

      unit_math: [
        // The order matters and is the law of this catalogue: every basis
        // resolves to WHOLE CARTONS first, and the other figures follow from
        // that. Stating it here stops Mister narrating a fractional carton.
        'la cantidad SIEMPRE se resuelve primero a cajas enteras (se redondea hacia arriba); m², piezas y kilos se derivan de esa cifra, nunca al revés',
        ...PACKINGS.map(
          (p) =>
            `formato ${p.format} mm: ${p.pcsPerCtn} piezas/caja · ${fmtM2(p.m2PerCtn)} m²/caja · ${fmtM2(p.kgPerCtn)} kg/caja`,
        ),
        `carga útil del contenedor: ${fmtInt(PAYLOAD_KG)} kg — un 40' admite el MISMO peso que un 20', sólo en una caja más larga`,
        'la cerámica llega al límite de peso mucho antes que al de volumen: el llenado se mide en kilos, no en CBM',
        'FF&E por llave (m² o presupuesto por habitación) es la otra base de esta lane; se convierte a m² antes de convertirse a cajas',
      ],

      vocabulary: [
        'serie = series (una serie comparte formato, empaque y cobertura; sus SKU sólo difieren en diseño)',
        'referencia / código = SKU code',
        'caja = carton · m²/caja = m² per carton · piezas/caja = pcs per carton',
        'cobertura = coverage · merma = waste allowance',
        'acabado = finish (mate / brillante / esmalte macizo)',
        'relieve = relief (liso / esculpido / irregular / moldeado)',
        'patrón = pattern · cara = printed face',
        'llenado = container fill · carga útil = payload',
        'muestrario = the buyer’s saved selection, exportable',
      ],

      catalogue_shape: [
        `azulejo de arte cerámico: ${fmtInt(SERIES.length)} series, ${fmtInt(SKUS.length)} referencias`,
        `formatos disponibles: ${[...new Set(SERIES.map((s) => s.format_mm.join('×')))].join(' y ')} mm`,
        'el catálogo declara cantidades, nunca precios — el precio lo cotiza el equipo contra volumen, destino e incoterm',
      ],

      diagnosis_set: [
        '¿qué superficie hay que cubrir, en m²? (o cuántas llaves y cuántos m² por llave)',
        '¿es piso, muro o ambos? (cambia el formato razonable, no el precio)',
        '¿hay una especificación escrita que respetar, o el diseño está abierto?',
        '¿qué formato: 150×150 o 300×300?',
        '¿acabado mate, brillante o esmalte macizo?',
        '¿contra qué fecha de obra? (hito, no promesa: sirve para ordenar la conversación)',
        '¿destino y puerto de entrada?',
        '¿es un contenedor completo o hay que consolidar con otra carga?',
      ],

      register:
        'Técnico y cuantitativo antes que estético. El comprador de esta lane compra contra una especificación que muchas veces no escribió, así que Mister confirma cobertura, empaque y llenado antes de hablar de diseño, y nunca sugiere que una selección estética resuelve una cantidad. Cuando el comprador da m², Mister devuelve cajas enteras y kilos en la misma respuesta. Ritmo pausado: un proyecto se cotiza una vez y se embarca una vez.',

      forbidden: [
        'ningún precio, ni absoluto ni estimado, ni por m² ni por caja ni por contenedor',
        'ningún plazo de entrega, fecha de embarque ni disponibilidad de stock',
        'ningún valor de PEI, resistencia al deslizamiento, absorción de agua, uso recomendado ni canto rectificado: el proveedor NO los imprime en estos catálogos, así que no existen — se responde "pendiente de confirmar con el proveedor"',
        'ninguna garantía de constancia de tono o calibre entre lotes',
        'ningún porcentaje de merma como si fuera dato del catálogo: la merma se acuerda contra el despiece del proyecto',
        'ninguna afirmación sobre certificaciones, normas o aptitud para un uso regulado',
      ],

      catalogue_url: '/interiores/azulejos',
    },
  ]

  return cached
}
