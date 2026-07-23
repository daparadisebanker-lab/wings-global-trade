// Capability: landed cost from plain Spanish. The model ONLY parses the operator's
// sentence into the fields they actually mentioned; every rate/freight the model
// omits is filled with the app's standard Peru-SUNAT defaults (buildInputs), and
// the SUNAT chain itself is computed by the shared, parity-validated engine
// (computeImportCost). Renders through the 'landed-cost' renderer.

import { INTELLIGENCE_MODELS } from '@/lib/ai/types'
import { extractJsonObject } from '@/lib/ai/parse'
import type { IntelligenceClient } from '@/lib/ai/client'
import { computeImportCost, DEFAULT_INPUTS } from '@/lib/costing/engine'
import type {
  FuelType,
  ImportInputs,
  ImportResult,
  Incoterm,
  Origin,
} from '@/lib/costing/types'
import { textResult, type Capability, type CopilotResult } from '../types'

// ── The renderer payload (ImportResult + display extras) ─────────────────────
/** What the 'landed-cost' renderer receives — the full SUNAT result plus currency +
 *  header context, and the `input` that produced it so the canvas editor can seed
 *  its controls and recompute (the read-only renderer ignores `input`). */
export interface LandedCostData extends ImportResult {
  currency: string
  incoterm: Incoterm
  productName: string
  input: ImportInputs
}

// ── Standard Peru-SUNAT defaults (identity blanked; numbers mirror the app) ──
// Numeric defaults (IGV 0.18, percepción 0.035, seguro 0.015, TC 3.70, Ad Valorem
// 0, freights) are taken verbatim from the engine's reference DEFAULT_INPUTS so the
// copilot's numbers match CostCalculator / BulkCostImport. Only the free-text
// identity is blanked — the model supplies it when the operator names a product.
export const COST_DEFAULTS: ImportInputs = {
  ...DEFAULT_INPUTS,
  productName: '',
  brand: '',
  model: '',
}

const FUEL_TYPES: readonly FuelType[] = ['hybrid', 'gasoline', 'diesel', 'electric']
const ORIGINS: readonly Origin[] = ['china', 'other']
const INCOTERMS: readonly Incoterm[] = ['EXW', 'FOB', 'CFR', 'CIF']

/**
 * Pure mapping helper: apply the standard defaults, letting any field the operator
 * mentioned override. Undefined/null values in `partial` never clobber a default.
 * This is the deterministic seam the test exercises.
 */
export function buildInputs(partial: Partial<ImportInputs>): ImportInputs {
  const out: ImportInputs = { ...COST_DEFAULTS }
  for (const [key, value] of Object.entries(partial)) {
    if (value !== undefined && value !== null) {
      ;(out as unknown as Record<string, unknown>)[key] = value
    }
  }
  return out
}

// ── Extraction guards ────────────────────────────────────────────────────────
function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null
}
function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim().length > 0 ? v.trim() : null
}
function oneOf<T extends string>(v: unknown, allowed: readonly T[]): T | null {
  return typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : null
}

const SYSTEM = `Eres Mister, el copiloto interno de Wings Global Trade. Tu única tarea aquí es
convertir una frase en español (o inglés) sobre el COSTO DE IMPORTACIÓN / landed cost de un
producto en JSON estructurado. NO calcules el costo — solo extrae lo que el operador mencione;
el sistema corre el motor SUNAT del Perú con sus tasas estándar.

Extrae SOLO los campos que el operador nombra explícitamente. Deja en null todo lo que NO diga
— el sistema aplica los valores por defecto (IGV 18%, percepción 3.5%, seguro 1.5%, tipo de
cambio 3.70, Ad Valorem 0). No inventes precio ni tasas.

Responde SOLO con un objeto JSON, sin texto alrededor, con esta forma exacta:
{
  "understood": boolean,
  "productName": string|null,
  "brand": string|null,
  "model": string|null,
  "fuelType": "gasoline"|"diesel"|"hybrid"|"electric"|null,
  "engineCC": number|null,
  "origin": "china"|"other"|null,
  "incoterm": "EXW"|"FOB"|"CFR"|"CIF"|null,
  "fob": number|null,
  "adValoremRate": number|null,
  "igvRate": number|null,
  "percepcionRate": number|null,
  "insuranceRate": number|null,
  "exchangeRate": number|null,
  "marginPercent": number|null,
  "note": string
}

Reglas de unidades: convierte SIEMPRE porcentajes a fracción (18% → 0.18, Ad Valorem 6% → 0.06),
toneladas a kg (×1000), miles a número entero. "fob" es el precio/valor del producto en USD
(FOB, o el valor según el incoterm dado). Si la frase NO trata de un costo de importación /
landed cost, devuelve understood=false con una "note" breve en español.`

export const landedCostCapability: Capability = {
  id: 'landed-cost',
  router: {
    description:
      'Costo de importación / landed cost al Perú desde una frase (cadena SUNAT: CIF, Ad Valorem, ISC, IGV, costo puesto, caja y margen).',
    examples: [
      'Costo de importación de una moto 150cc gasolina FOB 1,200 desde China',
      '¿Cuál es el landed cost de un montacargas a 14,000 FOB con Ad Valorem 6%?',
      'Landed cost for a diesel generator, CIF 8,500, margin 15%',
    ],
  },
  async run(client: IntelligenceClient, text: string): Promise<CopilotResult> {
    const raw = await client.complete({
      model: INTELLIGENCE_MODELS.reason,
      system: SYSTEM,
      user: text,
      maxTokens: 600,
    })
    const obj = extractJsonObject(raw)
    const note = str(obj?.note) ?? ''

    if (!obj || obj.understood !== true) {
      return textResult(
        note ||
          'Dime el producto y su precio FOB (o CIF) para calcular el costo de importación. / Give me the product and its FOB (or CIF) price to compute the landed cost.',
      )
    }

    const fob = num(obj.fob)
    if (fob === null || fob <= 0) {
      return textResult(
        'Necesito el precio FOB o CIF en USD para calcular el landed cost. / I need the FOB or CIF price in USD to compute the landed cost.',
      )
    }

    // Only the fields the operator actually mentioned; the rest fall to defaults.
    const partial: Partial<ImportInputs> = {
      fob,
      productName: str(obj.productName) ?? undefined,
      brand: str(obj.brand) ?? undefined,
      model: str(obj.model) ?? undefined,
      fuelType: oneOf(obj.fuelType, FUEL_TYPES) ?? undefined,
      engineCC: num(obj.engineCC) ?? undefined,
      origin: oneOf(obj.origin, ORIGINS) ?? undefined,
      incoterm: oneOf(obj.incoterm, INCOTERMS) ?? undefined,
      adValoremRate: num(obj.adValoremRate) ?? undefined,
      igvRate: num(obj.igvRate) ?? undefined,
      percepcionRate: num(obj.percepcionRate) ?? undefined,
      insuranceRate: num(obj.insuranceRate) ?? undefined,
      exchangeRate: num(obj.exchangeRate) ?? undefined,
      marginPercent: num(obj.marginPercent) ?? undefined,
    }

    const inputs = buildInputs(partial)
    const result = computeImportCost(inputs)

    const data: LandedCostData = {
      ...result,
      currency: 'USD',
      incoterm: inputs.incoterm,
      productName: inputs.productName,
      input: inputs,
    }
    return { renderer: 'landed-cost', note, data }
  },
}
