// src/hooks/useMisterChat.ts
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ConversationTurn, TprCompleteness } from '@/types/database'
import type { TprState, TprFieldKey, MisterStreamEvent } from '@/types/mister'
import { MISTER_GREETING } from '@/lib/claude.client'

interface UseMisterChatOptions {
  initialContext?: string
}

function generateSessionId(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const buf = new Uint8Array(4)
  crypto.getRandomValues(buf)
  const n = ((buf[0] << 24) | (buf[1] << 16) | (buf[2] << 8) | buf[3]) >>> 0
  const suffix = (n % 2176782336).toString(36).toUpperCase().padStart(6, '0')
  return `WGT-${y}${m}-${suffix}`
}

export function useMisterChat({ initialContext }: UseMisterChatOptions = {}) {
  const [sessionId] = useState(() => generateSessionId())
  const [messages, setMessages] = useState<ConversationTurn[]>(() => [
    { role: 'assistant', content: MISTER_GREETING, timestamp: new Date().toISOString(), isEntryMessage: true },
  ])
  const [tprState, setTprState] = useState<TprState>({})
  const [completeness, setCompleteness] = useState<TprCompleteness>('partial')
  const [isLoading, setIsLoading] = useState(false)
  const contextSent = useRef(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => { abortRef.current?.abort() }
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim()
      if (!trimmed || isLoading) return

      // Seed from ?context= on first user turn
      if (initialContext && !contextSent.current) {
        contextSent.current = true
      }

      const userTurn: ConversationTurn = {
        role: 'user',
        content: trimmed,
        timestamp: new Date().toISOString(),
      }

      const history = [...messages, userTurn]
        .filter((msg) => msg.content.trim().length > 0)
        .map((msg) => ({ role: msg.role, content: msg.content }))

      setMessages((prev) => [...prev, userTurn])
      setIsLoading(true)

      let buffered = ''
      const capturedThisTurn: TprFieldKey[] = []
      let errorMessage = ''

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      const fetchTimeout = setTimeout(() => controller.abort(), 25000)

      try {
        const res = await fetch('/api/mister/chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            messages: history,
            tpr_state: tprState,
            session_id: sessionId,
          }),
          signal: controller.signal,
        })

        if (!res.ok || !res.body) throw new Error(`Chat request failed: ${res.status}`)

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let sseBuffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          sseBuffer += decoder.decode(value, { stream: true })

          const lines = sseBuffer.split('\n\n')
          sseBuffer = lines.pop() ?? ''

          for (const line of lines) {
            const trimmedLine = line.trim()
            if (!trimmedLine.startsWith('data:')) continue
            const json = trimmedLine.slice(5).trim()
            if (!json) continue
            let event: MisterStreamEvent
            try {
              event = JSON.parse(json)
            } catch {
              continue
            }
            switch (event.type) {
              case 'delta':
                buffered += event.content
                break
              case 'tpr_update':
                capturedThisTurn.push(event.field)
                setTprState((prev) => ({ ...prev, [event.field]: event.value }))
                break
              case 'done':
                setCompleteness(event.tpr_completeness)
                break
              case 'error':
                errorMessage = event.message
                break
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          errorMessage = 'La solicitud tardó demasiado. Intenta nuevamente.'
        } else {
          console.error('[useMisterChat] sendMessage', error)
          if (!errorMessage) {
            errorMessage =
              'Lo siento, Mister no está disponible en este momento. Intenta nuevamente en unos segundos.'
          }
        }
      } finally {
        clearTimeout(fetchTimeout)
        const assistantContent =
          buffered ||
          errorMessage ||
          'Lo siento, Mister no está disponible en este momento. Intenta nuevamente.'
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: assistantContent,
            timestamp: new Date().toISOString(),
            tpr_fields_captured: capturedThisTurn.length > 0 ? capturedThisTurn : undefined,
          },
        ])
        setIsLoading(false)
      }
    },
    [isLoading, messages, tprState, sessionId, initialContext],
  )

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
    sessionId,
    sendMessage,
    editField,
    initialContext,
  }
}
