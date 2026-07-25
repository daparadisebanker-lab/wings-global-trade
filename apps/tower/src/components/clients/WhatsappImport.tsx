'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { t, type Locale } from '@/lib/i18n'
import { extractClientFromWhatsapp } from '@/lib/actions/whatsapp-import'
import type { ClientExtractDraft } from '@/lib/crm/whatsapp'
import { unzip, findChatEntry, mediaEntries, baseName } from '@/lib/crm/unzip'
import type { ImportMedia } from './ClientForm'

const STEPS = [
  { es: 'Leyendo la conversación…', en: 'Reading the conversation…' },
  { es: 'Identificando al cliente…', en: 'Identifying the client…' },
  { es: 'Extrayendo el perfil…', en: 'Extracting the profile…' },
]

const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  opus: 'audio/ogg',
  ogg: 'audio/ogg',
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  wav: 'audio/wav',
  mp4: 'video/mp4',
}

interface MediaPreview {
  name: string
  kind: 'image' | 'audio'
  ext: string
  blob: Blob
  url: string
}

/**
 * Import a client from an exported WhatsApp chat. Phones export a **.zip**
 * (_chat.txt + media), so the drop zone takes the zip directly — it finds the
 * transcript and surfaces the images/audio inside — or a bare .txt, or pasted
 * text. Mister reads the transcript and returns a DRAFT the operator reviews +
 * saves (Directive 7). A staged loader covers the ~2s model read.
 */
export function WhatsappImport({
  locale,
  onDraft,
  onCancel,
}: {
  locale: Locale
  onDraft: (draft: ClientExtractDraft, media: ImportMedia[]) => void
  onCancel: () => void
}) {
  const [text, setText] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [media, setMedia] = useState<MediaPreview[]>([])
  const [error, setError] = useState<string | null>(null)
  const [drag, setDrag] = useState(false)
  const [step, setStep] = useState(0)
  const [reading, startRead] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  // Free object URLs when the previews change or on unmount.
  useEffect(() => {
    return () => media.forEach((m) => URL.revokeObjectURL(m.url))
  }, [media])

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
    setError(null)
    setFileName(file.name)
    const isZip = /\.zip$/i.test(file.name) || file.type === 'application/zip' || file.type === 'application/x-zip-compressed'
    const isTxt = /\.txt$/i.test(file.name) || file.type === 'text/plain'

    try {
      if (isZip) {
        const entries = await unzip(new Uint8Array(await file.arrayBuffer()))
        const chat = findChatEntry(entries)
        if (!chat) {
          setError(t({ es: 'El .zip no contiene un chat (_chat.txt)', en: 'The .zip has no chat (_chat.txt)' }, locale))
          return
        }
        setText(new TextDecoder().decode(chat.data))
        setMedia(
          mediaEntries(entries)
            .filter((m) => m.kind === 'image' || m.kind === 'audio')
            .map(({ entry, kind }) => {
              const ext = entry.name.slice(entry.name.lastIndexOf('.') + 1).toLowerCase()
              const blob = new Blob([entry.data as BlobPart], { type: MIME[ext] ?? 'application/octet-stream' })
              return { name: baseName(entry.name), kind: kind as 'image' | 'audio', ext, blob, url: URL.createObjectURL(blob) }
            }),
        )
      } else if (isTxt) {
        setText(await file.text())
        setMedia([])
      } else {
        setError(t({ es: 'Sube el .zip o el .txt del chat', en: 'Upload the chat .zip or .txt' }, locale))
      }
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
      onDraft(
        res.data,
        media.map(({ name, kind, ext, blob }) => ({ name, kind, ext, blob })),
      )
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
        <div className="flex flex-col items-center gap-3 rounded-card border border-line bg-surface-0 px-4 py-8 text-center">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2 w-2 rounded-pill bg-lane-accent motion-safe:animate-pulse" />
            <span className="h-2 w-2 rounded-pill bg-lane-accent motion-safe:animate-pulse [animation-delay:150ms]" />
            <span className="h-2 w-2 rounded-pill bg-lane-accent motion-safe:animate-pulse [animation-delay:300ms]" />
          </span>
          <span role="status" aria-live="polite" className="font-ui text-t0 text-ink-primary">
            {t(STEPS[step], locale)}
          </span>
          <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">Mister</span>
        </div>
      ) : (
        <>
          <p className="max-w-prose font-ui text-label text-ink-secondary">
            {t(
              {
                es: 'Exporta la conversación en WhatsApp y suelta el .zip aquí (Mister encuentra el chat y sus adjuntos). También acepta el .txt o texto pegado.',
                en: 'Export the chat in WhatsApp and drop the .zip here (Mister finds the transcript and its attachments). A .txt or pasted text works too.',
              },
              locale,
            )}
          </p>

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
                t({ es: 'Suelta el .zip aquí', en: 'Drop the .zip here' }, locale)
              )}
            </span>
            <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
              {t({ es: 'o haz clic para elegir (.zip / .txt)', en: 'or click to choose (.zip / .txt)' }, locale)}
            </span>
            <input
              ref={inputRef}
              type="file"
              accept=".zip,.txt,application/zip,text/plain"
              className="hidden"
              onChange={(e) => void ingest(e.target.files?.[0])}
            />
          </div>

          {media.length ? (
            <div className="flex flex-col gap-2">
              <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
                {t({ es: 'Adjuntos en el chat', en: 'Attachments in the chat' }, locale)} ({media.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {media.map((m, i) =>
                  m.kind === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={m.url}
                      alt={m.name}
                      title={m.name}
                      className="h-16 w-16 rounded-card border border-line object-cover"
                    />
                  ) : m.kind === 'audio' ? (
                    <audio key={i} controls src={m.url} className="h-9" title={m.name} />
                  ) : (
                    <span
                      key={i}
                      className="rounded-card border border-line px-2 py-1 font-mono text-label text-ink-secondary"
                      title={m.name}
                    >
                      {m.name}
                    </span>
                  ),
                )}
              </div>
            </div>
          ) : null}

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
