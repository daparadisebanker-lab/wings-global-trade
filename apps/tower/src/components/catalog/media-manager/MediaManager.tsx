'use client'

// Upload → signed-URL → variant pipeline stub → kind tagging (COMPONENT_TREE
// §1 <MediaManager>). Real variant generation (resize/optimize) is n8n's job
// per ARCHITECTURE ("attachMedia … signed upload → variants via n8n") — this
// component only issues the signed URL, PUTs the file, and records the row.
import { useRef, useState } from 'react'
import { attachMedia, createMediaUploadUrl, listMedia, removeMedia } from '@/lib/actions/media'
import { MEDIA_KINDS, type MediaKind, type ProductMediaRow } from '@/lib/actions/media-types'

export function MediaManager({
  productId,
  initialMedia,
  disabled = false,
}: {
  productId: string | null
  initialMedia: ProductMediaRow[]
  disabled?: boolean
}) {
  const [media, setMedia] = useState<ProductMediaRow[]>(initialMedia)
  const [kind, setKind] = useState<MediaKind>('GALLERY')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0 || !productId) return
    setUploading(true)
    setError(null)
    try {
      for (const file of Array.from(files)) {
        const ticket = await createMediaUploadUrl(productId, { kind, fileName: file.name })
        if (ticket.error) {
          setError(ticket.error.message)
          continue
        }
        const res = await fetch(ticket.data.signedUrl, { method: 'PUT', body: file })
        if (!res.ok) {
          setError(`No se pudo subir ${file.name} / Could not upload ${file.name}`)
          continue
        }
        const attached = await attachMedia(productId, [{ storagePath: ticket.data.path, kind, sort: media.length }])
        if (attached.error) {
          setError(attached.error.message)
          continue
        }
        setMedia((m) => [...m, ...attached.data])
      }
      const refreshed = await listMedia(productId)
      if (refreshed.data) setMedia(refreshed.data)
    } catch (err) {
      console.error('[media-manager:upload]', err)
      setError('Error inesperado al subir / Unexpected upload error')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleRemove(id: string) {
    const result = await removeMedia(id)
    if (result.error) {
      setError(result.error.message)
      return
    }
    setMedia((m) => m.filter((item) => item.id !== id))
  }

  return (
    <div className="flex flex-col gap-3">
      {!productId ? (
        <p className="font-ui text-t0 text-ink-secondary">
          Guarda el producto como borrador antes de subir material. / Save the product as a draft before uploading
          media.
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as MediaKind)}
            disabled={disabled || uploading}
            className="rounded-card border border-line bg-surface-1 px-3 py-2 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
          >
            {MEDIA_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,application/pdf"
            disabled={disabled || uploading}
            onChange={(e) => handleFiles(e.target.files)}
            className="font-ui text-t0 text-ink-secondary file:mr-3 file:rounded-card file:border file:border-line file:bg-surface-1 file:px-3 file:py-1.5 file:font-mono file:text-label file:uppercase file:tracking-[0.1em] file:text-ink-primary"
          />
          {uploading ? <span className="font-mono text-label text-ink-secondary">Subiendo… / Uploading…</span> : null}
        </div>
      )}

      {error ? (
        <p role="alert" className="font-ui text-t0 text-negative">
          {error}
        </p>
      ) : null}

      {media.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {media.map((item) => (
            <li key={item.id} className="flex flex-col gap-1 rounded-card border border-line bg-surface-1 p-2">
              <span className="truncate font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
                {item.kind}
              </span>
              <span className="truncate font-ui text-t0 text-ink-primary" title={item.storagePath}>
                {item.storagePath.split('/').pop()}
              </span>
              {!disabled ? (
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="mt-1 self-start font-mono text-label uppercase tracking-[0.1em] text-negative hover:underline"
                >
                  Eliminar / Remove
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : productId ? (
        <p className="font-ui text-t0 text-ink-secondary">Sin material todavía / No media yet.</p>
      ) : null}
    </div>
  )
}
