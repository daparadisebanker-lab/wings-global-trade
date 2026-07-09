// src/lib/mister/archetype.ts
// Archetype resolution helpers.
// Authoritative: MISTER_MASTER_BRIEF.md D1, ai-engineer.md §13

import type { MisterArchetype } from '@/types/mister'

/**
 * Quick-signal keyword detection for archetypes.
 * Used for fast-path resolution before the haiku extraction runs.
 * The model's control block state.archetype is the primary source.
 */
const ARCHETYPE_SIGNALS: Record<MisterArchetype, RegExp[]> = {
  lead_buyer: [
    /\bpara\s+(mi|nuestra?)\s+(empresa|operaci[oó]n|uso)\b/i,
    /\bfor\s+my\s+(own|company|operation)\b/i,
    /\b(comprar?|buy|purchase|quiero\s+(importar|comprar))\b/i,
  ],
  project_manager: [
    /\bproyecto\b/i,
    /\bproject\b/i,
    /\b(especificaci[oó]n|spec|certificaci[oó]n|cumplimiento|compliance)\b/i,
    /\b(obra|sitio|contrato|procurement)\b/i,
  ],
  logistics_manager: [
    /\b(log[ií]stica|logistics|corredor|corridor|incoterm|contenedor|container)\b/i,
    /\b(flete|freight|despacho|clearance|aduanas?)\b/i,
    /\b(muevo|mueve|move|mover)\s+(carga|mercanc[ií]a|freight|goods)\b/i,
  ],
  reseller: [
    /\b(revender?|resel[l]?|distribu[yi]|distribuidor)\b/i,
    /\b(margen|margin|markup|MOQ|exclusividad|exclusivity)\b/i,
    /\b(mis\s+clientes|my\s+customers|my\s+clients)\b/i,
  ],
  wholesale_partner: [
    /\b(mayorista|wholesale|multi[-\s]?pa[ií]s|multi[-\s]?country)\b/i,
    /\b(volumen|volume)\s+(programa|program|alto|large|grande)\b/i,
    /\b(framework|acuerdo\s+marco|supply\s+agreement)\b/i,
  ],
  unresolved: [],
}

/**
 * Detect a strong archetype signal from the user message text.
 * Returns null if no strong signal found (model should resolve via conversation).
 */
export function detectArchetypeSignal(
  text: string,
): MisterArchetype | null {
  // Check strong-signal archetypes first (more specific signals)
  const priority: MisterArchetype[] = [
    'logistics_manager',
    'wholesale_partner',
    'project_manager',
    'reseller',
    'lead_buyer',
  ]

  for (const archetype of priority) {
    const patterns = ARCHETYPE_SIGNALS[archetype]
    if (patterns.some((p) => p.test(text))) {
      return archetype
    }
  }
  return null
}

/**
 * Validate that a string is a valid MisterArchetype.
 */
const VALID_ARCHETYPES = new Set<MisterArchetype>([
  'lead_buyer',
  'project_manager',
  'logistics_manager',
  'reseller',
  'wholesale_partner',
  'unresolved',
])

export function isValidArchetype(value: unknown): value is MisterArchetype {
  return typeof value === 'string' && VALID_ARCHETYPES.has(value as MisterArchetype)
}

/**
 * Validate that a string is a valid MisterStage.
 */
const VALID_STAGES = new Set([
  'induction',
  'discovery',
  'consideration',
  'pre_qualification',
  'support',
])

export function isValidStage(value: unknown): value is string {
  return typeof value === 'string' && VALID_STAGES.has(value)
}
