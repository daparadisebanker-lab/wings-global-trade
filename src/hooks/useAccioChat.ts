// src/hooks/useAccioChat.ts
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ConversationTurn, TprCompleteness } from '@/types/database'
import type { TprState, TprFieldKey, AccioStreamEvent } from '@/types/accio'
import { ACCIO_GREETING } from '@/lib/claude.client'

interface UseAccioChatOptions {
  initialContext?: string
}

export function useAccioChat({ initialContext }: UseAccioChatOptions = {}) {
  const [messages, setMessages] = useState<ConversationTurn[]>([])
  const [tprState, setTprState] = useState<TprState>({})
  const [completeness, setCompleteness] = useState<TprCompleteness>('partial')
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const sessionId = useRef<string>('')
  const seeded = useRef(false)

  // Seed the hardcoded greeting once on mount.
  useEffect(() => {
    if (seeded.current) return
    seeded.current = true
    sessionId.current = crypto.randomUUID()
    setMessages([
      { role: 'assistant', content: ACCIO_GREETING, timestamp: new Date().toISOString() },
    ])
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim()
      if (!trimmed || isLoading) return

      const userTurn: ConversationTurn = {
        role: 'user',
        content: trimmed,
        timestamp: new Date().toISOString(),
      }

      // Build the outgoing history (exclude empty assistant placeholder).
      const history = [...messages, userTurn]
        .filter((m) => m.content.trim().length > 0)
        .map((m) => ({ role: m.role, content: m.content }))

      setMessages((prev) => [
        ...prev,
        userTurn,
        { role: 'assistant', content: '', timestamp: new Date().toISOString() },
      ])
      setIsLoading(true)
      setIsStreaming(true)

      const capturedThisTurn: TprFieldKey[] = []

      try {
        const res = await fetch('/api/accio/chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            messages: history,
            tpr_state: tprState,
            session_id: sessionId.current,
          }),
        })

        if (!res.ok || !res.body) throw new Error(`Chat request failed: ${res.status}`)

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          const lines = buffer.split('\n\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            const trimmedLine = line.trim()
            if (!trimmedLine.startsWith('data:')) continue
            const json = trimmedLine.slice(5).trim()
            if (!json) continue
            let event: AccioStreamEvent
            try {
              event = JSON.parse(json)
            } catch {
              continue
            }
            switch (event.type) {
              case 'delta':
                setMessages((prev) => {
                  const next = [...prev]
                  const last = next[next.length - 1]
                  if (last && last.role === 'assistant') last.content += event.content
                  return next
                })
                break
              case 'tpr_update':
                capturedThisTurn.push(event.field)
                setTprState((prev) => ({ ...prev, [event.field]: event.value }))
                break
              case 'done':
                setCompleteness(event.tpr_completeness)
                break
              case 'error':
                setMessages((prev) => {
                  const next = [...prev]
                  const last = next[next.length - 1]
                  if (last && last.role === 'assistant' && !last.content) last.content = event.message
                  return next
                })
                break
            }
          }
        }
      } catch (error) {
        console.error('[useAccioChat] sendMessage', error)
        setMessages((prev) => {
          const next = [...prev]
          const last = next[next.length - 1]
          if (last && last.role === 'assistant' && !last.content) {
            last.content =
              'Lo siento, Mister no está disponible en este momento. Intenta nuevamente en unos segundos.'
          }
          return next
        })
      } finally {
        setIsLoading(false)
        setIsStreaming(false)
        // Tag the captured fields on the assistant turn.
        if (capturedThisTurn.length > 0) {
          setMessages((prev) => {
            const next = [...prev]
            const last = next[next.length - 1]
            if (last && last.role === 'assistant') {
              last.tpr_fields_captured = capturedThisTurn
            }
            return next
          })
        }
      }
    },
    [isLoading, messages, tprState],
  )


  /** Mark a field for re-collection by prompting the assistant. */
  const editField = useCallback(
    (field: TprFieldKey) => {
      setTprState((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
      void sendMessage(`Quiero corregir el dato: ${field}.`)
    },
    [sendMessage],
  )

  return {
    messages,
    tprState,
    completeness,
    isLoading,
    isStreaming,
    sessionId: sessionId.current,
    sendMessage,
    editField,
    initialContext,
  }
}
