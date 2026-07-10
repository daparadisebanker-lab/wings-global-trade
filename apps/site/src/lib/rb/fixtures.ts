// src/lib/rb/fixtures.ts
// Represented Brands — dev fixtures (SPEC §6 fixture rule).
// WS-SITE develops and passes its gates against these; it binds to the real
// TOWER public views (rb_public_brands / rb_public_containers) at integration.
// The shapes below mirror those views — changing them is a cross-workstream
// contract change, flag it.
//
// RB/01 Áladín data source: programs/represented-brands/brands/rb-01-aladin/
// (KIT-INTAKE.md + PRODUCTS.md, ratified 2026-07-10).

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
}

export interface RbProduct {
  slug: string
  name: string
  gtin: string
  unitLabel: string
  /** Spec rows rendered on the product card — exhibited, tabular mono. */
  specs: Array<{ label: string; value: string }>
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
    'La marca fue codificada en el sistema de artículos de Supermercados Peruanos (Plaza Vea / Vivanda), con especificación logística completa por SKU: GTIN, empaque máster, paletizado y validación regulatoria.',
    'Wings Global Trade es su socio comercial oficial para el territorio peruano: gestiona el inventario, consolida la carga en origen y vende exclusivamente por contenedor — completo o por cupos.',
  ],
  mandateScope: [
    'Venta mayorista exclusiva por contenedor para Perú',
    'Gestión de inventario y consolidación en origen',
    'Documentación de importación y entrega en Callao',
  ],
  certificationsNote:
    'Registro sanitario: no requerido para ambas líneas (validación de codificación SPSA). Fichas técnicas por SKU disponibles en la reserva.',
  logo: {
    isologo: '/brands/aladin/isologo.svg',
    positivo: '/brands/aladin/positivo.svg',
    isotipo: '/brands/aladin/isotipo.svg',
    sello: '/brands/aladin/sello.svg',
  },
}

export const ALADIN_PRODUCTS: RbProduct[] = [
  {
    slug: 'papel-higienico-bambu',
    name: 'Papel higiénico de bambú',
    gtin: '0723707931803',
    unitLabel: 'pack × 10 rollos',
    specs: [
      { label: 'Presentación', value: 'Pack × 10 rollos · 30 m · 4 capas' },
      { label: 'Hoja', value: '103 × 102 mm · hoja simple' },
      { label: 'Peso por rollo', value: '160 g' },
      { label: 'Caja máster', value: '6 packs · 60 rollos · 330 × 440 × 535 mm' },
      { label: 'Peso caja', value: '9,7 kg · 0,0777 m³' },
      { label: 'GTIN', value: '0723707931803' },
      { label: 'Origen', value: 'Importado' },
      { label: 'Registro sanitario', value: 'No requerido' },
    ],
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
      { label: 'Presentación', value: 'Empaque × 390 hojas · 3 capas' },
      { label: 'Empaque unitario', value: '70 × 95 × 175 mm · 190 g' },
      { label: 'Caja máster', value: '9 packs × 5 · 45 empaques · 360 × 295 × 555 mm' },
      { label: 'Peso caja', value: '9,7 kg · 0,0590 m³' },
      { label: 'GTIN', value: '0723707931797' },
      { label: 'Origen', value: 'Importado' },
      { label: 'Registro sanitario', value: 'No requerido' },
    ],
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
