// Mister copilot orchestrator (slice 1: container-fit from plain Spanish).
// SDK-free — takes an IntelligenceClient (real or fake, so it's testable), asks
// the model ONLY to parse the operator's sentence into fit params, then runs the
// deterministic math in container-fit.ts. The model never invents a count.
//
// Governance: this is a read/compute path — nothing mutates, so no draft is
// created (CLAUDE.md Directive 7 governs *writes*; compute + visualise is free).

import { INTELLIGENCE_MODELS } from '@/lib/ai/types'
import { extractJsonObject } from '@/lib/ai/parse'
import type { IntelligenceClient } from '@/lib/ai/client'
import { CONTAINER_KINDS, type ContainerKind } from '@/lib/actions/containers-types'
import { computeContainerFit, type ContainerFitResult } from './container-fit'

export type MisterReply =
  | { kind: 'fit'; note: string; fit: ContainerFitResult }
  | { kind: 'text'; text: string }

const SYSTEM = `Eres Mister, el copiloto interno de Wings Global Trade. Tu única tarea aquí es
convertir una frase en español (o inglés) sobre cuántas unidades entran en un contenedor
en JSON estructurado. NO calcules cuántas caben — solo extrae los parámetros; el sistema
hace la aritmética.

Responde SOLO con un objeto JSON, sin texto alrededor, con esta forma exacta:
{
  "understood": boolean,        // true solo si es una pregunta de encaje en contenedor
  "itemLengthM": number|null,   // dimensiones de la caja/unidad en METROS
  "itemWidthM": number|null,
  "itemHeightM": number|null,
  "weightEachKg": number|null,  // peso por unidad en kg, si se menciona
  "quantity": number|null,      // cantidad solicitada, si se menciona
  "containerKind": "20GP"|"40GP"|"40HC"|"REEFER",  // por defecto "40HC" si no se dice
  "weightCapKg": number|null,   // tope de peso de carga en kg, si se menciona (ej. "22 t" = 22000)
  "note": string                // una frase breve en español: un supuesto que hiciste o una aclaración
}

Convierte unidades: cm→m (÷100), toneladas→kg (×1000). Si la frase NO trata de cuántas
unidades entran en un contenedor, devuelve understood=false y en "note" ofrece brevemente
en español lo que sí puedes hacer (encaje en contenedor, costeo de aterrizaje, redactar
cotización, leer capturas de proveedor).`

function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null
}

function kind(v: unknown): ContainerKind {
  return (CONTAINER_KINDS as readonly string[]).includes(v as string)
    ? (v as ContainerKind)
    : '40HC'
}

/**
 * Answer a container-fit question. Throws only on a transport error from the
 * client; an unparseable / off-topic message returns a graceful text reply.
 */
export async function runMister(client: IntelligenceClient, text: string): Promise<MisterReply> {
  const raw = await client.complete({
    model: INTELLIGENCE_MODELS.reason,
    system: SYSTEM,
    user: text,
    maxTokens: 500,
  })

  const obj = extractJsonObject(raw)
  const note = typeof obj?.note === 'string' ? obj.note : ''

  if (!obj || obj.understood !== true) {
    return {
      kind: 'text',
      text:
        note ||
        'Puedo ayudarte con encaje en contenedor, costeo de aterrizaje, cotizaciones y lectura de capturas de proveedor. / I can help with container fit, landed cost, quotes, and reading supplier screenshots.',
    }
  }

  const fit = computeContainerFit({
    itemLengthM: num(obj.itemLengthM) ?? 0,
    itemWidthM: num(obj.itemWidthM) ?? 0,
    itemHeightM: num(obj.itemHeightM) ?? 0,
    weightEachKg: num(obj.weightEachKg),
    weightCapKg: num(obj.weightCapKg),
    quantity: num(obj.quantity),
    containerKind: kind(obj.containerKind),
  })

  if (!fit) {
    return {
      kind: 'text',
      text:
        'Necesito las medidas de la caja (largo × ancho × alto). / I need the box dimensions (L × W × H).',
    }
  }

  return { kind: 'fit', note, fit }
}
