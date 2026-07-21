'use client'

import { useEffect, useRef, useState, type ChangeEvent, type ClipboardEvent } from 'react'
import { cn } from '@wings/trade-ui'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import { askMister } from '@/lib/actions/mister-copilot'
import { textResult, type CopilotResult } from '@/lib/copilot/types'
import { MisterMark } from './MisterMark'
import { MISTER_RENDERERS } from './mister-renderers'
import './mister-dock.css'

type Msg = { who: 'op'; text: string; image?: string } | { who: 'mi'; result: CopilotResult }

/** A screenshot staged for the next turn — base64 for the wire, dataURL for preview. */
type Pending = { mediaType: string; dataBase64: string; preview: string }

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

/** Read a File into a Pending: strip the data: prefix off for the wire, keep it for preview. */
function fileToPending(file: File): Promise<Pending | null> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return Promise.resolve(null)
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result)
      const comma = dataUrl.indexOf(',')
      resolve(comma >= 0 ? { mediaType: file.type, dataBase64: dataUrl.slice(comma + 1), preview: dataUrl } : null)
    }
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}

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
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState<Pending | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const threadRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

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
  }, [thread, busy])

  // Pull an image out of a paste, if one is there; falls through to normal text paste.
  async function onPaste(e: ClipboardEvent<HTMLTextAreaElement>) {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) {
          e.preventDefault()
          const next = await fileToPending(file)
          if (next) setPending(next)
          return
        }
      }
    }
  }

  async function onPickFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // let the same file be chosen again later
    if (!file) return
    const next = await fileToPending(file)
    if (next) setPending(next)
  }

  async function send() {
    const text = draft.trim()
    const attachment = pending
    if ((!text && !attachment) || busy) return
    setThread((prev) => [...prev, { who: 'op', text, image: attachment?.preview }])
    setDraft('')
    setPending(null)
    setBusy(true)
    try {
      const result = await askMister(
        text,
        attachment ? { mediaType: attachment.mediaType, dataBase64: attachment.dataBase64 } : undefined,
      )
      const reply: Msg = {
        who: 'mi',
        result: result.error ? textResult(result.error.message) : result.data,
      }
      setThread((prev) => [...prev, reply])
    } catch {
      setThread((prev) => [
        ...prev,
        {
          who: 'mi',
          result: textResult(t({ es: 'No pude procesarlo ahora.', en: 'Could not process that.' }, locale)),
        },
      ])
    } finally {
      setBusy(false)
      inputRef.current?.focus()
    }
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

          {thread.map((m, i) => {
            if (m.who === 'op') {
              return (
                <div key={i} className="mister-row op">
                  <div className="mister-bubble op">
                    {m.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="mister-shot" src={m.image} alt="" />
                    ) : null}
                    {m.text ? <span>{m.text}</span> : null}
                  </div>
                </div>
              )
            }
            const render = MISTER_RENDERERS[m.result.renderer]
            return (
              <div key={i} className="mister-row mi">
                <div className="mister-bubble mi">
                  {m.result.note ? <p style={{ margin: '0 0 8px' }}>{m.result.note}</p> : null}
                  {render ? render(m.result.data, locale) : <span>{m.result.text ?? ''}</span>}
                </div>
              </div>
            )
          })}

          {busy ? (
            <div className="mister-row mi" aria-live="polite">
              <div className="mister-bubble mi mister-thinking">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          ) : null}
        </div>

        {pending ? (
          <div className="mister-attach">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="thumb" src={pending.preview} alt="" />
            <span className="meta">{t({ es: 'Captura lista', en: 'Screenshot ready' }, locale)}</span>
            <button
              type="button"
              className="drop"
              onClick={() => setPending(null)}
              aria-label={t({ es: 'Quitar captura', en: 'Remove screenshot' }, locale)}
              tabIndex={open ? 0 : -1}
            >
              ✕
            </button>
          </div>
        ) : null}

        <div className="mister-input">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={onPickFile}
            style={{ display: 'none' }}
            tabIndex={-1}
            aria-hidden="true"
          />
          <button
            type="button"
            className="clip"
            onClick={() => fileRef.current?.click()}
            aria-label={t({ es: 'Adjuntar captura', en: 'Attach screenshot' }, locale)}
            tabIndex={open ? 0 : -1}
          >
            📎
          </button>
          <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onPaste={onPaste}
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
            disabled={(!draft.trim() && !pending) || busy}
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
