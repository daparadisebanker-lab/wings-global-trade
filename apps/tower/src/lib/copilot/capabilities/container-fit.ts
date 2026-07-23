// Capability: container-fit from plain Spanish. The model ONLY parses the
// sentence into params; the arithmetic lives in ../container-fit.ts (pure,
// tested). Renders through the 'fit' renderer.

import { INTELLIGENCE_MODELS } from '@/lib/ai/types'
import { extractJsonObject } from '@/lib/ai/parse'
import type { IntelligenceClient } from '@/lib/ai/client'
import { CONTAINER_KINDS, type ContainerKind } from '@/lib/actions/containers-types'
import { computeContainerFit, type ContainerFitInput, type ContainerFitResult } from '../container-fit'
import { inheritedFitLabels, safeSeq } from '../canvas-seed'
import { textResult, type Capability, type CanvasContext, type CopilotResult, type SeededFrom } from '../types'

/** The 'fit' renderer payload: the computed fit plus the input that produced it,
 *  so the canvas editor can seed its controls and recompute (read-only renderer
 *  ignores `input`). `seededFrom` carries provenance for a chained follow-up. */
export type ContainerFitPayload = ContainerFitResult & { input: ContainerFitInput; seededFrom?: SeededFrom }

const SYSTEM = `Eres Mister, el copiloto interno de Wings Global Trade. Tu única tarea aquí es
convertir una frase en español (o inglés) sobre cuántas unidades entran en un contenedor
en JSON estructurado. NO calcules cuántas caben — solo extrae los parámetros; el sistema
hace la aritmética.

Responde SOLO con un objeto JSON, sin texto alrededor, con esta forma exacta:
{
  "understood": boolean,
  "itemLengthM": number|null,
  "itemWidthM": number|null,
  "itemHeightM": number|null,
  "weightEachKg": number|null,
  "quantity": number|null,
  "containerKind": "20GP"|"40GP"|"40HC"|"REEFER"|null,
  "weightCapKg": number|null,
  "note": string
}

Convierte unidades: cm→m (÷100), toneladas→kg (×1000). En una PREGUNTA DE SEGUIMIENTO el operador
puede cambiar UN SOLO dato ("¿y si pesan 950 kg cada una?", "y en un 40HC"); deja en null todo lo
que NO repita — el sistema hereda la caja y el contenedor del cálculo en pantalla. Si la frase NO
trata de cuántas unidades entran en un contenedor, devuelve understood=false y una "note" breve en español.`

function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null
}

export const containerFitCapability: Capability = {
  id: 'container-fit',
  router: {
    description: 'Cuántas unidades/cajas entran en un contenedor (encaje por volumen y peso).',
    examples: [
      '¿Cuántas cajas de 2.1×1.4×1.6 m entran en un 40HC?',
      'Encaje de 200 unidades de 30kg en un contenedor de 20 pies',
      'How many pallets fit in a reefer?',
    ],
  },
  async run(client: IntelligenceClient, text: string, _attachment, context?: CanvasContext): Promise<CopilotResult> {
    const raw = await client.complete({
      model: INTELLIGENCE_MODELS.reason,
      system: SYSTEM,
      user: text,
      maxTokens: 500,
    })
    const obj = extractJsonObject(raw)
    const note = typeof obj?.note === 'string' ? obj.note : ''

    if (!obj || obj.understood !== true) {
      return textResult(
        note ||
          'Dame las medidas de la caja (largo × ancho × alto) y el contenedor. / Give me the box dimensions and the container.',
      )
    }

    // Chained ask ("now pack 4 of these in a 40HC"): inherit the box the operator
    // was fitting from the canvas, overriding only what this message restates.
    const ctx = context?.kind === 'fit' ? context.input : null
    const isKind = (v: unknown): v is ContainerKind => (CONTAINER_KINDS as readonly string[]).includes(v as string)
    // Validate BOTH the model's and the client-supplied kind the same way.
    const modelKind = isKind(obj?.containerKind) ? obj.containerKind : null
    const ctxKind = ctx && isKind(ctx.containerKind) ? ctx.containerKind : null
    const fitInput: ContainerFitInput = {
      itemLengthM: num(obj.itemLengthM) ?? ctx?.itemLengthM ?? 0,
      itemWidthM: num(obj.itemWidthM) ?? ctx?.itemWidthM ?? 0,
      itemHeightM: num(obj.itemHeightM) ?? ctx?.itemHeightM ?? 0,
      weightEachKg: num(obj.weightEachKg) ?? ctx?.weightEachKg ?? null,
      weightCapKg: num(obj.weightCapKg) ?? ctx?.weightCapKg ?? null,
      quantity: num(obj.quantity) ?? ctx?.quantity ?? null,
      containerKind: modelKind ?? ctxKind ?? '40HC',
    }
    const fit = computeContainerFit(fitInput)
    if (!fit) {
      return textResult(
        'Necesito las medidas de la caja (largo × ancho × alto). / I need the box dimensions (L × W × H).',
      )
    }
    // Provenance: which box / container was inherited from the canvas this chained off.
    const statedFit = new Set<string>()
    if (num(obj.itemLengthM) !== null || num(obj.itemWidthM) !== null || num(obj.itemHeightM) !== null) statedFit.add('box')
    if (modelKind !== null) statedFit.add('containerKind')
    if (num(obj.weightEachKg) !== null) statedFit.add('weightEachKg')
    const seq = safeSeq(context?.sourceSeq)
    const fitFields = ctx && seq !== undefined ? inheritedFitLabels(fitInput, statedFit) : []
    const seededFrom: SeededFrom | undefined =
      seq !== undefined && fitFields.length ? { seq, fields: fitFields } : undefined

    const data: ContainerFitPayload = { ...fit, input: fitInput, seededFrom }
    return { renderer: 'fit', note, data }
  },
}
