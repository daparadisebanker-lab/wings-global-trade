// handoffs.ts — where each Mister artifact redirects into the system of record
// (Phase E slice 1). Mister composes; the modules commit. When the canvas holds
// an artifact, the commit rail offers the module(s) where that artifact becomes
// a durable record. Pure data (no React) so the rail stays declarative and a new
// capability wires its hand-off with one line. Keyed by CopilotResult.renderer.
import type { Localized } from '@/lib/i18n'

export interface HandoffLink {
  href: string
  label: Localized
}

/** Renderer key → the modules where this artifact lands. */
const BY_RENDERER: Record<string, HandoffLink[]> = {
  fit: [{ href: '/containers', label: { es: 'Abrir Contenedores', en: 'Open Containers' } }],
  'landed-cost': [{ href: '/costing', label: { es: 'Abrir Costeo', en: 'Open Costing' } }],
  'reverse-quote': [
    { href: '/quotations', label: { es: 'Abrir Cotizaciones', en: 'Open Quotations' } },
    { href: '/costing', label: { es: 'Ver Costeo', en: 'View Costing' } },
  ],
  'quote-proposal': [{ href: '/quotations', label: { es: 'Abrir Cotizaciones', en: 'Open Quotations' } }],
  'torre-quote': [
    { href: '/intelligence/revision', label: { es: 'Cola de revisión', en: 'Review queue' } },
    { href: '/quotations', label: { es: 'Abrir Cotizaciones', en: 'Open Quotations' } },
  ],
  proposal: [
    { href: '/quotations', label: { es: 'Abrir Cotizaciones', en: 'Open Quotations' } },
    { href: '/pipeline', label: { es: 'Ver Pipeline', en: 'View Pipeline' } },
  ],
  'supplier-extract': [{ href: '/catalog', label: { es: 'Abrir Catálogo', en: 'Open Catalog' } }],
  documents: [{ href: '/documents', label: { es: 'Abrir Documentos', en: 'Open Documents' } }],
}

/** The starting modules shown when the canvas is still empty. */
export const DEFAULT_HANDOFFS: HandoffLink[] = [
  { href: '/containers', label: { es: 'Contenedores', en: 'Containers' } },
  { href: '/costing', label: { es: 'Costeo', en: 'Costing' } },
  { href: '/quotations', label: { es: 'Cotizaciones', en: 'Quotations' } },
  { href: '/catalog', label: { es: 'Catálogo', en: 'Catalog' } },
]

/** Hand-offs for a given renderer, or the default starting set. */
export function handoffsFor(renderer: string | null | undefined): HandoffLink[] {
  if (renderer && BY_RENDERER[renderer]) return BY_RENDERER[renderer]
  return DEFAULT_HANDOFFS
}

/** A short ES/EN name for a renderer, for the canvas/rail headers. */
export function artifactLabel(renderer: string | null | undefined): Localized {
  switch (renderer) {
    case 'fit':
      return { es: 'Cubicaje de contenedor', en: 'Container fit' }
    case 'landed-cost':
      return { es: 'Costo de aterrizaje', en: 'Landed cost' }
    case 'reverse-quote':
      return { es: 'Cotización inversa', en: 'Reverse quote' }
    case 'quote-proposal':
      return { es: 'Propuesta de cotización', en: 'Quote proposal' }
    case 'torre-quote':
      return { es: 'Par de cotización', en: 'Quote pair' }
    case 'proposal':
      return { es: 'Propuesta', en: 'Proposal' }
    case 'supplier-extract':
      return { es: 'Lectura de proveedor', en: 'Supplier read' }
    case 'documents':
      return { es: 'Documentos', en: 'Documents' }
    default:
      return { es: 'Artefacto', en: 'Artifact' }
  }
}
