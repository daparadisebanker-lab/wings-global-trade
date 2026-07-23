// Capability: container-fit from plain Spanish. The model ONLY parses the
// sentence into params; the arithmetic lives in ../container-fit.ts (pure,
// tested). Renders through the 'fit' renderer.

import { INTELLIGENCE_MODELS } from '@/lib/ai/types'
import { extractJsonObject } from '@/lib/ai/parse'
import type { IntelligenceClient } from '@/lib/ai/client'
import { CONTAINER_KINDS, type ContainerKind } from '@/lib/actions/containers-types'
import { computeContainerFit, type ContainerFitInput, type ContainerFitResult } from '../container-fit'
import { textResult, type Capability, type CanvasContext, type CopilotResult } from '../types'

/** The 'fit' renderer payload: the computed fit plus the input that produced it,
 *  so the canvas editor can seed its controls and recompute (read-only renderer
 *  ignores `input`). */
export type ContainerFitPayload = ContainerFitResult & { input: ContainerFitInput }

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
  "containerKind": "20GP"|"40GP"|"40HC"|"REEFER",
  "weightCapKg": number|null,
  "note": string
}

Convierte unidades: cm→m (÷100), toneladas→kg (×1000). Si la frase NO trata de cuántas
unidades entran en un contenedor, devuelve understood=false y una "note" breve en español.`

function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null
}
function kind(v: unknown): ContainerKind {
  return (CONTAINER_KINDS as readonly string[]).includes(v as string)
    ? (v as ContainerKind)
    : '40HC'
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
    const modelKind = (CONTAINER_KINDS as readonly string[]).includes(obj?.containerKind as string)
      ? (obj.containerKind as ContainerKind)
      : null
    const fitInput: ContainerFitInput = {
      itemLengthM: num(obj.itemLengthM) ?? ctx?.itemLengthM ?? 0,
      itemWidthM: num(obj.itemWidthM) ?? ctx?.itemWidthM ?? 0,
      itemHeightM: num(obj.itemHeightM) ?? ctx?.itemHeightM ?? 0,
      weightEachKg: num(obj.weightEachKg) ?? ctx?.weightEachKg ?? null,
      weightCapKg: num(obj.weightCapKg) ?? ctx?.weightCapKg ?? null,
      quantity: num(obj.quantity) ?? ctx?.quantity ?? null,
      containerKind: modelKind ?? ctx?.containerKind ?? kind(obj.containerKind),
    }
    const fit = computeContainerFit(fitInput)
    if (!fit) {
      return textResult(
        'Necesito las medidas de la caja (largo × ancho × alto). / I need the box dimensions (L × W × H).',
      )
    }
    const data: ContainerFitPayload = { ...fit, input: fitInput }
    return { renderer: 'fit', note, data }
  },
}
