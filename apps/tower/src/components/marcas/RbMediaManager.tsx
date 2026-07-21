'use client'

// RB product media (RB Console Wave 2 tail). Upload → signed URL → PUT → record.
// Parallels components/catalog/media-manager/MediaManager.tsx but writes to
// tower.rb_product_media through the RB actions. Append-only: no remove control —
// tower_26 ships no delete policy on rb_product_media (retire, never delete).
import { useEffect, useRef, useState } from 'react'
import { attachRbMedia, createRbProductMediaUploadUrl, listRbMedia, type RbProductMediaRow } from '@/lib/actions/rb-catalog'
import { MEDIA_KINDS, type MediaKind } from '@/lib/actions/media-types'

const CONTROL =
  'rounded-card border border-line bg-surface-1 px-3 py-2 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent disabled:opacity-50'

export function RbMediaManager({
  productId,
  initialMedia,
  disabled = false,
}: {
  productId: string | null
  initialMedia: RbProductMediaRow[]
  disabled?: boolean
}) {
  const [media, setMedia] = useState<RbProductMediaRow[]>(initialMedia)
  const [kind, setKind] = useState<MediaKind>('GALLERY')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!productId) return
    let active = true
    listRbMedia(productId).then((res) => {
      if (active && res.data) setMedia(res.data)
    })
    return () => {
      active = false
    }
  }, [productId])

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0 || !productId) return
    setUploading(true)
    setError(null)
    try {
      for (const file of Array.from(files)) {
        const ticket = await createRbProductMediaUploadUrl(productId, { kind, fileName: file.name })
        if (ticket.error) {
          setError(ticket.error.message)
          continue
        }
        const res = await fetch(ticket.data.signedUrl, { method: 'PUT', body: file })
        if (!res.ok) {
          setError(`No se pudo subir ${file.name} / Could not upload ${file.name}`)
          continue
        }
        const attached = await attachRbMedia(productId, [{ storagePath: ticket.data.path, kind, sort: media.length }])
        if (attached.error) {
          setError(attached.error.message)
          continue
        }
        setMedia((m) => [...m, ...attached.data])
      }
      const refreshed = await listRbMedia(productId)
      if (refreshed.data) setMedia(refreshed.data)
    } catch (err) {
      console.error('[rb-media-manager:upload]', err)
      setError('Error inesperado al subir / Unexpected upload error')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  if (!productId) {
    return (
      <p className="font-ui text-t0 text-ink-secondary">
        Guarda el producto como borrador antes de subir imágenes. / Save the product as a draft before uploading images.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2">
          <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">Tipo / Kind</span>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as MediaKind)}
            disabled={disabled || uploading}
            className={CONTROL}
          >
            {MEDIA_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          disabled={disabled || uploading}
          onChange={(e) => handleFiles(e.target.files)}
          className="font-ui text-t0 text-ink-secondary file:mr-3 file:rounded-card file:border file:border-line file:bg-surface-1 file:px-3 file:py-1.5 file:font-mono file:text-label file:uppercase file:tracking-[0.1em] file:text-ink-primary"
        />
        {uploading ? <span className="font-mono text-label text-ink-secondary">Subiendo… / Uploading…</span> : null}
      </div>

      {error ? (
        <p role="alert" className="font-ui text-t0 text-negative">
          {error}
        </p>
      ) : null}

      {media.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {media.map((item) => (
            <li key={item.id} className="flex flex-col gap-1 rounded-card border border-line bg-surface-1 p-2">
              <span className="truncate font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">{item.kind}</span>
              <span className="truncate font-ui text-t0 text-ink-primary" title={item.storagePath}>
                {item.storagePath.split('/').pop()}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-ui text-t0 text-ink-secondary">Sin imágenes todavía / No images yet.</p>
      )}
    </div>
  )
}
