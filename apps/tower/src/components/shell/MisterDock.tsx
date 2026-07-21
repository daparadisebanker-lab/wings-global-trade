'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@wings/trade-ui'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import { MisterMark } from './MisterMark'
import './mister-dock.css'

type Msg = { who: 'mi' | 'op'; text: string }

/**
 * Mister · Interno — the contained copilot dock (World B).
 *
 * This slice is the room and the door: it opens beside the work, greets, takes
 * input, and closes with zero residue. The live tool-belt (container-fit,
 * costing, quote drafting, vision) lands in the next slice — so on send Mister
 * answers honestly that it's still coming online rather than faking a result.
 */
export function MisterDock({
  open,
  onClose,
  locale = DEFAULT_LOCALE,
}: {
  open: boolean
  onClose: () => void
  locale?: Locale
}) {
  const [draft, setDraft] = useState('')
  const [thread, setThread] = useState<Msg[]>([])
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const threadRef = useRef<HTMLDivElement>(null)

  // Open like a door: focus the input. Escape closes (only while open).
  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => inputRef.current?.focus(), 60)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(id)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  // Keep the latest turn in view.
  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight })
  }, [thread])

  function send() {
    const text = draft.trim()
    if (!text) return
    setThread((prev) => [
      ...prev,
      { who: 'op', text },
      {
        who: 'mi',
        text: t(
          {
            es: 'Te leo. Pronto podré resolver esto con las herramientas de TOWER — armar el contenedor, costear, redactar — me estoy conectando.',
            en: "I hear you. Soon I'll resolve this with TOWER's tools — pack the container, cost it, draft it — I'm coming online.",
          },
          locale,
        ),
      },
    ])
    setDraft('')
    inputRef.current?.focus()
  }

  return (
    <div className={cn('mister-dock', open && 'is-open')} aria-hidden={!open}>
      <button
        type="button"
        className="mister-scrim"
        aria-label={t({ es: 'Cerrar Mister', en: 'Close Mister' }, locale)}
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />
      <aside
        className="mister-panel"
        role="dialog"
        aria-modal="false"
        aria-label="Mister"
      >
        <div className="mister-bar">
          <span className="mister-id">
            <MisterMark size={26} className="mark" />
            <span className="name">
              <b>MISTER</b> · {t({ es: 'Interno', en: 'Internal' }, locale)}
            </span>
          </span>
          <button
            type="button"
            className="mister-close"
            onClick={onClose}
            aria-label={t({ es: 'Cerrar', en: 'Close' }, locale)}
            tabIndex={open ? 0 : -1}
          >
            ✕
          </button>
        </div>

        <div className="mister-thread" ref={threadRef}>
          <div className="mister-greet">
            <MisterMark size={64} className="mark" />
            <p className="hi">
              {t({ es: 'Hola, soy ', en: "Hi, I'm " }, locale)}
              <b>Mister</b>
              {t(
                {
                  es: ' — tu versión interna. Puedo armar un contenedor, costear un aterrizaje, redactar una cotización o leer la captura de un proveedor.',
                  en: " — your internal version. I can pack a container, cost a landing, draft a quote, or read a supplier screenshot.",
                },
                locale,
              )}
            </p>
            <span className="cap">{t({ es: '¿Qué necesitas?', en: 'What do you need?' }, locale)}</span>
          </div>

          {thread.map((m, i) => (
            <div key={i} className={cn('mister-row', m.who)}>
              <div className={cn('mister-bubble', m.who)}>{m.text}</div>
            </div>
          ))}
        </div>

        <div className="mister-input">
          <span className="clip" aria-hidden="true">
            📎
          </span>
          <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder={t({ es: 'Escribe aquí… o pega una captura', en: 'Type here… or paste a screenshot' }, locale)}
            aria-label={t({ es: 'Mensaje para Mister', en: 'Message for Mister' }, locale)}
            tabIndex={open ? 0 : -1}
          />
          <button
            type="button"
            className="send"
            onClick={send}
            disabled={!draft.trim()}
            aria-label={t({ es: 'Enviar', en: 'Send' }, locale)}
            tabIndex={open ? 0 : -1}
          >
            ↑
          </button>
        </div>
      </aside>
    </div>
  )
}
