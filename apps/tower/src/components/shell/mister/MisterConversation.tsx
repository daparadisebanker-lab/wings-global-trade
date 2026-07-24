'use client'

// MisterConversation — the command spine, lifted verbatim out of MisterDock
// (Phase E slice 1). Greeting + suggestion chips + thread + composer, reusing
// the exact mister-dock.css classes so the World-B voice is unchanged. The only
// difference from the old dock body: thread/busy/pending/draft/send now come
// from MisterProvider (shared with the canvas), not local state. Artifacts still
// render inline here (this IS the whole experience on a phone, where the cockpit
// collapses to the spine); on desktop the canvas pins the latest one big.
import { useEffect, useRef, type ChangeEvent, type ClipboardEvent } from 'react'
import { cn } from '@wings/trade-ui'
import { t, type Locale, type Localized } from '@/lib/i18n'
import { MisterMark } from '../MisterMark'
import { MISTER_RENDERERS } from '../mister-renderers'
import { useMister, type Pending } from './MisterProvider'
import { artifactLabel } from './handoffs'
import '../mister-dock.css'

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

/** First-turn starting points — one per capability named in the greeting. A chip
 *  either seeds the composer (`prefill`) or opens the screenshot picker (`attach`).
 *  Never auto-sends: the operator stays in control of the turn. */
const SUGGESTIONS: { label: Localized; prefill?: Localized; attach?: boolean }[] = [
  { label: { es: 'Armar un contenedor', en: 'Pack a container' }, prefill: { es: 'Arma un contenedor con ', en: 'Pack a container with ' } },
  { label: { es: 'Costear un aterrizaje', en: 'Cost a landing' }, prefill: { es: 'Costea el aterrizaje de ', en: 'Cost the landing of ' } },
  { label: { es: 'Redactar una cotización', en: 'Draft a quote' }, prefill: { es: 'Redacta una cotización para ', en: 'Draft a quote for ' } },
  { label: { es: 'Leer una captura', en: 'Read a screenshot' }, attach: true },
]

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

export function MisterConversation() {
  const {
    locale,
    thread,
    busy,
    pending,
    draft,
    setDraft,
    setPending,
    send,
    selectedArtifact,
    selectedSeq,
    hasCanvasContext,
    skipCanvasContext,
    setSkipCanvasContext,
  } = useMister()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const threadRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Keep the latest turn in view — glide to it, unless reduced-motion is asked.
  useEffect(() => {
    const el = threadRef.current
    if (!el) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({ top: el.scrollHeight, behavior: reduce ? 'auto' : 'smooth' })
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

  function submit() {
    void send()
    inputRef.current?.focus()
  }

  return (
    <div className="mister-conversation">
      <div className="mister-thread" ref={threadRef}>
        <div className="mister-greet">
          <MisterMark size={64} className="mark" />
          <p className="hi">
            {t({ es: 'Hola, soy ', en: "Hi, I'm " }, locale)}
            <b>Mister</b>
            {t(
              {
                es: ' — tu versión interna. Puedo armar un contenedor, costear un aterrizaje, redactar una cotización, leer la captura de un proveedor o buscar un documento en el drive.',
                en: ' — your internal version. I can pack a container, cost a landing, draft a quote, read a supplier screenshot, or find a document in the drive.',
              },
              locale,
            )}
          </p>
          <span className="cap">{t({ es: '¿Qué necesitas?', en: 'What do you need?' }, locale)}</span>
          {thread.length === 0 ? (
            <div className="mister-suggests">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label.en}
                  type="button"
                  className="mister-chip"
                  onClick={() => {
                    if (s.attach) {
                      fileRef.current?.click()
                      return
                    }
                    setDraft(t(s.prefill!, locale))
                    inputRef.current?.focus()
                  }}
                >
                  <span aria-hidden className="g" />
                  {t(s.label, locale)}
                </button>
              ))}
            </div>
          ) : null}
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
          const hasArt = m.result.renderer in MISTER_RENDERERS
          return (
            <div key={i} className="mister-row mi">
              <div className={cn('mister-bubble mi', hasArt && 'has-art')}>
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

      {/* Canvas-context chip (Scenario Ledger): discloses that the next ask will
          inherit the artifact on the canvas, with ✕ to send without it. */}
      {hasCanvasContext && selectedArtifact ? (
        <div className="mister-ctx-chip">
          {skipCanvasContext ? (
            <>
              <span className="meta">
                {t({ es: 'Enviar sin heredar', en: 'Sending without inheriting' }, locale)}:{' '}
                {t(artifactLabel(selectedArtifact.renderer), locale)}
                {selectedSeq != null ? ` #${selectedSeq}` : ''}
              </span>
              <button type="button" className="use" onClick={() => setSkipCanvasContext(false)}>
                {t({ es: 'usar lienzo', en: 'use canvas' }, locale)}
              </button>
            </>
          ) : (
            <>
              <span aria-hidden className="g" />
              <span className="meta">
                {t({ es: 'Hereda del lienzo', en: 'Inherits canvas' }, locale)}: {t(artifactLabel(selectedArtifact.renderer), locale)}
                {selectedSeq != null ? ` #${selectedSeq}` : ''}
              </span>
              <button
                type="button"
                className="drop"
                onClick={() => setSkipCanvasContext(true)}
                aria-label={t({ es: 'Enviar sin heredar el lienzo', en: 'Send without inheriting the canvas' }, locale)}
              >
                ✕
              </button>
            </>
          )}
        </div>
      ) : null}

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
              submit()
            }
          }}
          placeholder={t({ es: 'Escribe aquí… o pega una captura', en: 'Type here… or paste a screenshot' }, locale)}
          aria-label={t({ es: 'Mensaje para Mister', en: 'Message for Mister' }, locale)}
        />
        <button
          type="button"
          className="send"
          onClick={submit}
          disabled={(!draft.trim() && !pending) || busy}
          aria-label={t({ es: 'Enviar', en: 'Send' }, locale)}
        >
          ↑
        </button>
      </div>
    </div>
  )
}
