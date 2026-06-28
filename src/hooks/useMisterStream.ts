// src/hooks/useMisterStream.ts
// Raw SSE streaming hook for Mister v2.
// Parses NAMED SSE events from POST /api/mister.
// Contract: AI_COMPLETE.flag §HOOK CONTRACT + ENRICHED_SPEC §7.2
'use client'

import { useCallback, useRef, useState } from 'react'
import type {
  MisterArchetype,
  MisterStage,
  MisterQuickAction,
  MisterSurfaceType,
  MisterChatRequest,
  MisterActionId,
  MisterLocale,
  MisterSurface,
  MisterCollected,
} from '@/types/mister'

export interface StreamCallbacks {
  onToken: (delta: string) => void
  onSurface: (surface: MisterSurface) => void
  onActions: (quickActions: MisterQuickAction[]) => void
  onState: (archetype: MisterArchetype, stage: MisterStage) => void
  onCollected: (collected: MisterCollected) => void
  onDone: (messageId: string) => void
  onError: (code: string, message?: string, fallback?: string) => void
}

export interface StreamOptions {
  sessionId: string
  message: string
  actionId?: MisterActionId
  currentPage?: string
  currentProductId?: string | null
  locale?: MisterLocale
}

const SURFACE_TYPES = new Set<MisterSurfaceType>([
  'product', 'comparison', 'specs', 'moq', 'waterfall', 'document', 'contact',
])

function isSurfaceType(val: unknown): val is MisterSurfaceType {
  return typeof val === 'string' && SURFACE_TYPES.has(val as MisterSurfaceType)
}

function isQuickActionArray(val: unknown): val is MisterQuickAction[] {
  if (!Array.isArray(val)) return false
  return val.every(
    (a) =>
      typeof a === 'object' &&
      a !== null &&
      typeof (a as Record<string, unknown>).label === 'string' &&
      typeof (a as Record<string, unknown>).action === 'string',
  )
}

export function useMisterStream() {
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const stream = useCallback(
    async (options: StreamOptions, callbacks: StreamCallbacks): Promise<void> => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setIsStreaming(true)

      const body: MisterChatRequest = {
        sessionId: options.sessionId,
        message: options.message,
        ...(options.actionId !== undefined && { actionId: options.actionId }),
        ...(options.currentPage !== undefined && { currentPage: options.currentPage }),
        ...(options.currentProductId !== undefined && {
          currentProductId: options.currentProductId,
        }),
        ...(options.locale !== undefined && { locale: options.locale }),
      }

      try {
        const res = await fetch('/api/mister', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        })

        if (!res.ok || !res.body) {
          callbacks.onError('FETCH_ERROR', undefined, `Status: ${res.status}`)
          return
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let sseBuffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          sseBuffer += decoder.decode(value, { stream: true })

          // SSE events are separated by blank lines (\n\n)
          const blocks = sseBuffer.split('\n\n')
          sseBuffer = blocks.pop() ?? ''

          for (const block of blocks) {
            if (!block.trim()) continue

            let eventName = ''
            let dataLine = ''

            for (const line of block.split('\n')) {
              if (line.startsWith('event: ')) {
                eventName = line.slice(7).trim()
              } else if (line.startsWith('data: ')) {
                dataLine = line.slice(6).trim()
              }
            }

            if (!eventName || !dataLine) continue

            let parsed: unknown
            try {
              parsed = JSON.parse(dataLine)
            } catch {
              continue
            }

            if (typeof parsed !== 'object' || parsed === null) continue
            const obj = parsed as Record<string, unknown>

            switch (eventName) {
              case 'token': {
                const delta = typeof obj.delta === 'string' ? obj.delta : ''
                if (delta) callbacks.onToken(delta)
                break
              }
              case 'surface': {
                const type = obj.type
                if (isSurfaceType(type)) {
                  callbacks.onSurface({ type, payload: obj.payload })
                }
                break
              }
              case 'actions': {
                if (isQuickActionArray(obj.quickActions)) {
                  callbacks.onActions(obj.quickActions)
                }
                break
              }
              case 'state': {
                const archetype = obj.archetype
                const stage = obj.stage
                if (typeof archetype === 'string' && typeof stage === 'string') {
                  callbacks.onState(
                    archetype as MisterArchetype,
                    stage as MisterStage,
                  )
                }
                break
              }
              case 'collected': {
                if (obj.collected && typeof obj.collected === 'object') {
                  callbacks.onCollected(obj.collected as MisterCollected)
                }
                break
              }
              case 'done': {
                const messageId =
                  typeof obj.messageId === 'string' ? obj.messageId : ''
                callbacks.onDone(messageId)
                break
              }
              case 'error': {
                const code =
                  typeof obj.code === 'string' ? obj.code : 'UNKNOWN'
                const message =
                  typeof obj.message === 'string' ? obj.message : undefined
                const fallback =
                  typeof obj.fallback === 'string' ? obj.fallback : undefined
                callbacks.onError(code, message, fallback)
                break
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          callbacks.onError('STREAM_ERROR', error.message)
        }
      } finally {
        setIsStreaming(false)
      }
    },
    [],
  )

  const abort = useCallback(() => {
    abortRef.current?.abort()
    setIsStreaming(false)
  }, [])

  return { stream, abort, isStreaming }
}
