// src/lib/rb/fixtures.ts
// Represented Brands — dev fixtures (SPEC §6 fixture rule).
// WS-SITE develops and passes its gates against these; it binds to the real
// TOWER public views (rb_public_brands / rb_public_containers) at integration.
// The shapes below mirror those views — changing them is a cross-workstream
// contract change, flag it.
//
// RB/01 Áladín data source: programs/represented-brands/brands/rb-01-aladin/
// (KIT-INTAKE.md + PRODUCTS.md, ratified 2026-07-10).

export interface RbHeroSlide {
  kind: 'image' | 'type' | 'seal'
  /** image slides only */
  src?: string
  alt?: string
  /** §8.7 asset integrity: only brand_supplied | wings_studio may render. */
  source?: 'brand_supplied' | 'wings_studio'
}

export interface RbPublicBrand {
  code: string
  slug: string
  name: string
  claim: string
  categoryLabel: string
  territory: string
  representedSince: number
  /** ES story blocks for the shelf About section. */
  story: string[]
  mandateScope: string[]
  certificationsNote: string
  logo: { isologo: string; positivo: string; isotipo: string; sello: string }
  /** BrandHero slider frames (SPEC §2.7① — Odd Ritual home-hero pattern). */
  heroSlides: RbHeroSlide[]
  /** Marquee vocabulary strip (SPEC §2.7⑥). */
  vocabulary: string[]
  /** Colophon manifesto — the sello band at the foot of the shelf. */
  manifesto: string
}

import type { SpecIconId } from '@/components/features/brands/SpecIcons'
import type { PackingSpec } from '@/components/features/brands/PackingDiagram'
import type { PalletSpec } from '@/components/features/brands/PalletDiagram'

export interface RbProduct {
  slug: string
  name: string
  gtin: string
  unitLabel: string
  /** Spec rows rendered on the product card — exhibited, tabular mono. */
  specs: Array<{ label: string; value: string; icon: SpecIconId }>
  /** Caja-máster interior geometry (SPSA codification dims) for the
   *  technical isometric drawing — true proportions, never decorative. */
  packing: PackingSpec
  /** Explode axis for the assembly view: 'y' lifts pilas, 'z' splits rows. */
  explodeAxis: 'y' | 'z'
  explodeCaption: string
  pallet: PalletSpec
  descriptionEs: string
  highlights: string[]
}

export interface RbContainerTemplate {
  ref: string
  kind: '20GP' | '40GP' | '40HC' | 'REEFER'
  kindLabel: string
  productSlug: string
  /** Commercial capacity (boxes) — 940 of 945 computed; 5 held as ops slack. */
  totalPackages: number
  totalSlots: number
  packagesPerSlot: number
  packetsPerPackage: number
  unitsPerPackage: number
  unitNamePlural: string
  packageKg: number
  governingBound: 'CBM' | 'KG'
}

export interface RbPublicContainer {
  id: string
  /** Ops container code (RB01-40HC-001); absent on fixtures. */
  code?: string
  templateRef: string
  route: { origin: string; destination: string }
  closesAt: string // ISO date
  slots: { total: number; committed: number; reserved: number }
}

export const ALADIN: RbPublicBrand = {
  code: 'RB/01',
  slug: 'aladin',
  name: 'Áladín',
  claim: 'Cuida tu salud',
  categoryLabel: 'Higiene · papel ecológico de bambú',
  territory: 'Perú',
  representedSince: 2026,
  story: [
    'Áladín fabrica papel de higiene a base de fibras 100% vírgenes de bambú: papel higiénico de 4 capas y papel facial de 3 capas, sin químicos ni lejía, biodegradable y de vida útil ilimitada.',
    'Cada SKU viaja con su especificación técnica completa — GTIN, empaque máster, paletizado y ficha logística. Toda esa documentación forma parte del paquete con el que gestionamos su logística desde las zonas francas ZOFRATACNA y ZOFRI de Iquique.',
    'Wings Global Trade es su socio comercial oficial para el territorio peruano: gestiona el inventario, consolida la carga en origen y vende exclusivamente por contenedor — completo o por cupos.',
  ],
  mandateScope: [
    'Venta mayorista exclusiva por contenedor para Perú',
    'Gestión de inventario y consolidación en origen',
    'Documentación de importación y entrega en Callao',
  ],
  certificationsNote:
    'Registro sanitario: no requerido para ambas líneas. Las fichas técnicas por SKU están documentadas e incluidas en el paquete logístico — gestión desde las zonas francas ZOFRATACNA y ZOFRI.',
  logo: {
    isologo: '/brands/aladin/isologo.svg',
    positivo: '/brands/aladin/positivo.svg',
    isotipo: '/brands/aladin/isotipo.svg',
    sello: '/brands/aladin/sello.svg',
  },
  // All three images attested brand_supplied by Muaaz 2026-07-10
  // (extracted from the brand's own brandboard PDFs).
  heroSlides: [
    {
      kind: 'image',
      src: '/brands/aladin/hero-rolls.jpeg',
      alt: 'Papel higiénico Aladín de fibra de bambú, presentación en rollo',
      source: 'brand_supplied',
    },
    {
      kind: 'image',
      src: '/brands/aladin/hero-stack.jpeg',
      alt: 'Rollos de papel de bambú sin blanquear, apilados',
      source: 'brand_supplied',
    },
    { kind: 'type' },
    {
      kind: 'image',
      src: '/brands/aladin/hero-bamboo.jpeg',
      alt: 'Bosque de bambú — el origen de la fibra',
      source: 'brand_supplied',
    },
  ],
  vocabulary: [
    'Cuida tu salud',
    'Fibra 100% virgen de bambú',
    'Sin químicos ni lejía',
    '4 capas · 30 metros por rollo',
    'Biodegradable',
    'RB/01 · Representada desde 2026',
  ],
  manifesto:
    'El bambú crece sin pedir permiso y vuelve a la tierra sin dejar rastro. Papel que cuida tu salud y nuestro planeta — hecho para durar lo que debe y desaparecer cuando debe.',
}

export const ALADIN_PRODUCTS: RbProduct[] = [
  {
    slug: 'papel-higienico-bambu',
    name: 'Papel higiénico de bambú',
    gtin: '0723707931803',
    unitLabel: 'pack × 10 rollos',
    specs: [
      { label: 'Presentación', value: 'Pack × 10 rollos · 30 m · 4 capas', icon: 'package' },
      { label: 'Hoja', value: '103 × 102 mm · hoja simple', icon: 'sheet' },
      { label: 'Peso por rollo', value: '160 g', icon: 'weight' },
      { label: 'Caja máster', value: '6 packs · 60 rollos · 330 × 440 × 535 mm', icon: 'box' },
      { label: 'Peso caja', value: '9,7 kg · 0,0777 m³', icon: 'ruler' },
      { label: 'GTIN', value: '0723707931803', icon: 'barcode' },
      { label: 'Origen', value: 'Importado', icon: 'ship' },
      { label: 'Registro sanitario', value: 'No requerido', icon: 'seal' },
    ],
    packing: {
      // SPSA: alto 330 · ancho 440 · profundo 535. Los paquetes van
      // echados: 2 pilas de 3 (2 a lo ancho × 3 de alto), largo del
      // paquete a lo profundo — 6 paquetes × 10 rollos = 60 rollos.
      box: { w: 440, d: 535, h: 330 },
      cells: { x: 2, z: 1, y: 3 },
      detail: 'rolls',
      title: 'Caja máster · 330 × 440 × 535 mm · vista técnica',
      composition: '6 paquetes (2 pilas de 3) · 10 rollos c/u = 60 rollos · 9,7 kg',
    },
    explodeAxis: 'y',
    explodeCaption: '3 camadas de 2 paquetes · cada paquete lleva 10 rollos',
    pallet: {
      // Pallet tradicional (ops): 5 cajas por camada × 3 camadas = 15.
      // La sexta posición de la retícula queda punteada — posición alterna.
      grid: { x: 3, z: 2, skip: 1 },
      layers: 3,
      boxDims: { w: 440, d: 535, h: 330 },
      note: '5 cajas por camada × 3 camadas = 15 cajas · 900 paquetes · 145,5 kg',
    },
    descriptionEs:
      'Papel higiénico ecológico elaborado a base de fibras 100% vírgenes de bambú. Suave, resistente y antialérgico; biodegradable y libre de químicos.',
    highlights: ['100% fibra virgen de bambú', 'Sin químicos ni lejía', '4 capas · 30 metros por rollo'],
  },
  {
    slug: 'papel-facial-bambu',
    name: 'Papel facial de bambú',
    gtin: '0723707931797',
    unitLabel: 'empaque × 390 hojas',
    specs: [
      { label: 'Presentación', value: 'Empaque × 390 hojas · 3 capas', icon: 'package' },
      { label: 'Empaque unitario', value: '70 × 95 × 175 mm · 190 g', icon: 'ruler' },
      { label: 'Caja máster', value: '9 pilas × 5 · 45 empaques · 360 × 295 × 555 mm', icon: 'box' },
      { label: 'Peso caja', value: '9,7 kg · 0,0590 m³', icon: 'weight' },
      { label: 'GTIN', value: '0723707931797', icon: 'barcode' },
      { label: 'Origen', value: 'Importado', icon: 'ship' },
      { label: 'Registro sanitario', value: 'No requerido', icon: 'seal' },
    ],
    packing: {
      // SPSA: alto 360 · ancho 295 · profundo 555. Los empaques van en
      // 9 pilas (3 columnas × 3 líneas de fondo), 5 unidades por pila
      // (5 × 70 mm ≈ 360 mm de alto) = 45 empaques.
      box: { w: 295, d: 555, h: 360 },
      cells: { x: 3, z: 3, y: 1 },
      detail: 'slabs',
      title: 'Caja máster · 360 × 295 × 555 mm · vista técnica',
      composition: '9 pilas (3 × 3) · 5 empaques c/u = 45 empaques · 9,7 kg',
    },
    explodeAxis: 'z',
    explodeCaption: '3 líneas de fondo × 3 pilas · 5 empaques por pila',
    pallet: {
      // Paletizado del CD (codificación SPSA): 8 bultos/camada × 5 camadas.
      grid: { x: 4, z: 2, skip: 0 },
      layers: 5,
      boxDims: { w: 295, d: 555, h: 360 },
      note: '8 cajas por camada × 5 camadas = 40 cajas · 1.800 empaques · 388 kg',
    },
    descriptionEs:
      'Papel facial ultra suave de fibra de bambú, 3 capas. No irrita ni raspa la piel; fragancia natural, producto ecológico.',
    highlights: ['390 hojas ultra suaves', '3 capas', 'No irrita la piel'],
  },
]

/** Ratified template v2 (Muaaz, 2026-07-10): 40HC · 10 cupos × 94 cajas. */
export const ALADIN_TEMPLATE_40HC: RbContainerTemplate = {
  ref: 'RB01-40HC-A',
  kind: '40HC',
  kindLabel: "40' High Cube · 76 m³",
  productSlug: 'papel-higienico-bambu',
  totalPackages: 940,
  totalSlots: 10,
  packagesPerSlot: 94,
  packetsPerPackage: 6,
  unitsPerPackage: 60,
  unitNamePlural: 'rollos',
  packageKg: 9.7,
  governingBound: 'CBM',
}

/** Fixture container mid-fill (SPEC §6: fixtures ship two containers mid-fill;
 *  one is enough for the v1 shelf — the selector renders a list). */
export const ALADIN_CONTAINERS: RbPublicContainer[] = [
  {
    id: 'rb01-hc-001',
    templateRef: 'RB01-40HC-A',
    route: { origin: 'Qingdao', destination: 'Callao' },
    closesAt: '2026-08-28',
    slots: { total: 10, committed: 3, reserved: 2 },
  },
]

export const RB_BRANDS: RbPublicBrand[] = [ALADIN]

export function getBrand(slug: string): RbPublicBrand | undefined {
  return RB_BRANDS.find((b) => b.slug === slug)
}

export function getTemplate(ref: string): RbContainerTemplate | undefined {
  return ref === ALADIN_TEMPLATE_40HC.ref ? ALADIN_TEMPLATE_40HC : undefined
}

export function getContainer(id: string): RbPublicContainer | undefined {
  return ALADIN_CONTAINERS.find((c) => c.id === id)
}
