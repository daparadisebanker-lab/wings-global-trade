// src/lib/mister/buildContext.ts
// Context assembly and rendering for the <<MISTER_CONTEXT>> dynamic block.
// Authoritative: ai-engineer.md §4
// Server-side only.

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  MisterProjectRow,
  SurfaceEventPayload,
  ProductSurface,
  ComparisonSurface,
  DocumentSurface,
  ContactSurface,
  MisterActionId,
} from '@/types/mister'
import {
  fetchProduct,
  preloadComparison,
  fetchDocument,
  fetchContact,
  inferProductType,
  isEscalationStage,
} from '@/lib/mister/tools'
import { getRbMisterPacks, type RbMisterPack } from '@/lib/rb/misterPack'

interface AssembledContext {
  product: ProductSurface | null
  comparison: ComparisonSurface | null
  logistics_docs: DocumentSurface | null
  contacts: ContactSurface | null
}

export interface BuildContextResult {
  contextString: string
  surfaces: SurfaceEventPayload[]
}

/**
 * Assemble the per-turn context: run tool fetches in parallel,
 * build the context string for injection, and collect surface events
 * to emit to the client before streaming tokens.
 */
export async function buildMisterContext(
  session: MisterProjectRow,
  request: {
    currentPage: string | null
    currentProductId: string | null
    actionId?: MisterActionId | null
  },
  supabase: SupabaseClient,
): Promise<BuildContextResult> {
  const interests = session.collected.productInterest ?? []

  const [productResult, documentResult, contactResult, rbPacksResult] = await Promise.allSettled([
    request.currentProductId
      ? fetchProduct(request.currentProductId, supabase)
      : Promise.resolve(null),

    session.collected.destinationCountry
      ? fetchDocument(
          session.collected.destinationCountry,
          inferProductType(session.collected),
          supabase,
        )
      : Promise.resolve(null),

    isEscalationStage(session.stage)
      ? fetchContact(session.archetype, supabase)
      : Promise.resolve(null),

    // Represented-brands packs (RB lane) — compiled from the same views the
    // shelf reads; a failure degrades to no pack, never breaks the turn.
    getRbMisterPacks(),
  ])

  let comparisonResult: ComparisonSurface | null = null
  if (interests.length >= 2) {
    comparisonResult = await preloadComparison(interests, supabase).catch(() => null)
  }

  const backend: AssembledContext = {
    product: productResult.status === 'fulfilled' ? productResult.value : null,
    comparison: comparisonResult,
    logistics_docs: documentResult.status === 'fulfilled' ? documentResult.value : null,
    contacts: contactResult.status === 'fulfilled' ? contactResult.value : null,
  }

  // Build surface events to emit before tokens
  const surfaces: SurfaceEventPayload[] = []
  if (backend.product) {
    surfaces.push({ type: 'product', payload: backend.product })
  }
  if (backend.comparison) {
    surfaces.push({ type: 'comparison', payload: backend.comparison })
  }
  if (backend.contacts) {
    surfaces.push({ type: 'contact', payload: backend.contacts })
  }
  if (backend.logistics_docs?.available) {
    surfaces.push({ type: 'document', payload: backend.logistics_docs })
  }

  const contextString = renderContextBlock({
    session,
    currentPage: request.currentPage,
    currentProductId: request.currentProductId,
    actionId: request.actionId ?? null,
    backend,
    rbPacks: rbPacksResult.status === 'fulfilled' ? rbPacksResult.value : [],
    opsWhatsapp: process.env.MISTER_OPS_WHATSAPP ?? '+50760250735',
  })

  return { contextString, surfaces }
}

/**
 * Render the <<MISTER_CONTEXT>> dynamic block injected as the second system block.
 * This block is NOT cached — it changes every turn.
 */
function renderContextBlock(params: {
  session: MisterProjectRow
  currentPage: string | null
  currentProductId: string | null
  actionId: MisterActionId | null
  backend: AssembledContext
  rbPacks: RbMisterPack[]
  opsWhatsapp: string
}): string {
  const { session, currentPage, currentProductId, actionId, backend, rbPacks, opsWhatsapp } = params

  const productLine = backend.product
    ? JSON.stringify({
        id: backend.product.id,
        name: backend.product.name,
        summary: backend.product.summary,
        specs: backend.product.specs,
        slug: backend.product.slug,
      })
    : 'null'

  const comparisonLine = backend.comparison
    ? JSON.stringify(backend.comparison)
    : 'null'

  const logisticsLine = backend.logistics_docs
    ? JSON.stringify(backend.logistics_docs)
    : 'null'

  const contactsLine = backend.contacts
    ? JSON.stringify(backend.contacts)
    : 'null'

  const turnWarning =
    session.turn_count >= 30
      ? 'SYSTEM NOTE: Session approaching limit (30+ turns). Begin routing to human contact.'
      : ''

  return `<<MISTER_CONTEXT>>
archetype: ${session.archetype}
stage: ${session.stage}
locale: ${session.locale}
current_page: ${currentPage ?? 'null'}
current_product_id: ${currentProductId ?? 'null'}
last_action: ${actionId ?? 'null'}
current_product: ${productLine}
collected: ${JSON.stringify(session.collected)}
backend:
  product: ${productLine}
  comparison: ${comparisonLine}
  moq: null
  logistics_docs: ${logisticsLine}
  contacts: ${contactsLine}
represented_brands: ${rbPacks.length > 0 ? JSON.stringify(rbPacks) : 'null'}
ops_whatsapp: ${opsWhatsapp}
${turnWarning}
<<END_CONTEXT>>`
}

/**
 * Trim conversation history to the last N turns before sending to the model.
 * A "turn" = 1 user + 1 assistant message = 2 messages.
 * Store up to 50 turns total; send only 15 to the model.
 */
export function trimHistory(
  messages: { role: 'user' | 'assistant'; content: string }[],
  maxTurns: number = 15,
): {
  trimmed: { role: 'user' | 'assistant'; content: string }[]
  droppedTurns: number
} {
  const maxMessages = maxTurns * 2
  if (messages.length <= maxMessages) {
    return { trimmed: messages, droppedTurns: 0 }
  }

  const excess = messages.length - maxMessages
  const dropCount = excess % 2 === 0 ? excess : excess + 1

  // Ensure the first remaining message is a user message
  let sliceFrom = dropCount
  while (sliceFrom < messages.length && messages[sliceFrom]?.role !== 'user') {
    sliceFrom++
  }

  return {
    trimmed: messages.slice(sliceFrom),
    droppedTurns: Math.ceil(sliceFrom / 2),
  }
}

/**
 * Cap stored history to 50 turns (100 messages).
 */
export function capStoredHistory(
  messages: { role: 'user' | 'assistant'; content: string }[],
): { role: 'user' | 'assistant'; content: string }[] {
  const MAX_STORED = 100 // 50 turns × 2 messages
  if (messages.length <= MAX_STORED) return messages
  return messages.slice(messages.length - MAX_STORED)
}
