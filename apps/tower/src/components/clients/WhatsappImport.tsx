'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { t, type Locale } from '@/lib/i18n'
import { extractClientFromWhatsapp } from '@/lib/actions/whatsapp-import'
import type { ClientExtractDraft } from '@/lib/crm/whatsapp'

const STEPS = [
  { es: 'Leyendo la conversación…', en: 'Reading the conversation…' },
  { es: 'Identificando al cliente…', en: 'Identifying the client…' },
  { es: 'Extrayendo el perfil…', en: 'Extracting the profile…' },
]

/**
 * Import a client from an exported WhatsApp chat. Drop (or browse to) the `.txt`
 * WhatsApp produces, or paste the text; Mister reads it and returns a DRAFT
 * profile the operator reviews + saves in the form (Directive 7 — nothing
 * auto-commits). A staged loader covers the ~2s model read.
 */
export function WhatsappImport({
  locale,
  onDraft,
  onCancel,
}: {
  locale: Locale
  onDraft: (draft: ClientExtractDraft) => void
  onCancel: () => void
}) {
  const [text, setText] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [drag, setDrag] = useState(false)
  const [step, setStep] = useState(0)
  const [reading, startRead] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  // Advance the staged loader text while the model reads (perceived progress).
  useEffect(() => {
    if (!reading) {
      setStep(0)
      return
    }
    const id = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 1300)
    return () => clearInterval(id)
  }, [reading])

  async function ingest(file: File | undefined) {
    if (!file) return
    if (!/\.txt$/i.test(file.name) && file.type && file.type !== 'text/plain') {
      setError(t({ es: 'Sube el .txt exportado del chat', en: 'Upload the exported chat .txt' }, locale))
      return
    }
    setFileName(file.name)
    setError(null)
    try {
      setText(await file.text())
    } catch {
      setError(t({ es: 'No se pudo leer el archivo', en: 'Could not read the file' }, locale))
    }
  }

  function onRead() {
    setError(null)
    startRead(async () => {
      const res = await extractClientFromWhatsapp(text)
      if (res.error) {
        setError(res.error.message)
        return
      }
      onDraft(res.data)
    })
  }

  const field =
    'rounded-card border border-line bg-surface-0 px-3 py-2 font-ui text-t0 text-ink-primary outline-none focus-visible:border-lane-accent placeholder:text-ink-secondary'

  return (
    <div className="flex flex-col gap-3 rounded-card-lg border border-line bg-surface-1 p-4 shadow-elevation-2">
      <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
        {t({ es: 'Importar desde WhatsApp', en: 'Import from WhatsApp' }, locale)}
      </span>

      {reading ? (
        /* ── Extraction in progress ── */
        <div className="flex flex-col items-center gap-3 rounded-card border border-line bg-surface-0 px-4 py-8 text-center">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2 w-2 rounded-pill bg-lane-accent motion-safe:animate-pulse" />
            <span className="h-2 w-2 rounded-pill bg-lane-accent motion-safe:animate-pulse [animation-delay:150ms]" />
            <span className="h-2 w-2 rounded-pill bg-lane-accent motion-safe:animate-pulse [animation-delay:300ms]" />
          </span>
          <span role="status" aria-live="polite" className="font-ui text-t0 text-ink-primary">
            {t(STEPS[step], locale)}
          </span>
          <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
            {t({ es: 'Mister', en: 'Mister' }, locale)}
          </span>
        </div>
      ) : (
        <>
          <p className="max-w-prose font-ui text-label text-ink-secondary">
            {t(
              {
                es: 'Exporta la conversación en WhatsApp (sin archivos) y suéltala aquí o pégala. Mister arma un borrador de perfil que revisas antes de guardar.',
                en: 'Export the chat in WhatsApp (without media) and drop it here or paste it. Mister builds a draft profile you review before saving.',
              },
              locale,
            )}
          </p>

          {/* ── Drop zone (also click / keyboard to browse) ── */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                inputRef.current?.click()
              }
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setDrag(true)
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDrag(false)
              void ingest(e.dataTransfer.files?.[0])
            }}
            className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-card-lg border-2 border-dashed px-4 py-8 text-center outline-none transition-colors focus-visible:border-lane-accent ${
              drag ? 'border-lane-accent bg-surface-2' : 'border-line bg-surface-0 hover:border-lane-accent'
            }`}
          >
            <span className="font-ui text-t0 text-ink-primary">
              {fileName ? (
                <span className="font-mono text-label text-ink-primary">{fileName}</span>
              ) : (
                t({ es: 'Suelta el .txt aquí', en: 'Drop the .txt here' }, locale)
              )}
            </span>
            <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
              {t({ es: 'o haz clic para elegir', en: 'or click to choose' }, locale)}
            </span>
            <input
              ref={inputRef}
              type="file"
              accept=".txt,text/plain"
              className="hidden"
              onChange={(e) => void ingest(e.target.files?.[0])}
            />
          </div>

          <details className="group">
            <summary className="cursor-pointer font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:text-ink-primary">
              {t({ es: 'o pegar el texto', en: 'or paste the text' }, locale)}
            </summary>
            <textarea
              className={`${field} mt-2 min-h-[120px] w-full resize-y font-mono text-label`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t(
                { es: 'Pega aquí el texto del chat exportado', en: 'Paste the exported chat text here' },
                locale,
              )}
            />
          </details>

          {error ? (
            <p role="alert" className="font-ui text-t0 text-negative">
              {error}
            </p>
          ) : null}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onRead}
              disabled={text.trim().length < 20}
              className="rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-50"
            >
              {t({ es: 'Leer y crear perfil', en: 'Read & build profile' }, locale)}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary hover:text-ink-primary"
            >
              {t({ es: 'Cancelar', en: 'Cancel' }, locale)}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
