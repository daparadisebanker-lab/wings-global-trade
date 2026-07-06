'use client'

// Signed-URL previews + completeness checklist — COMPONENT_TREE §3
// <DocumentVault>. Upload flow mirrors MediaManager's exact shape (signed
// upload URL -> PUT -> attach), against the private `trade-documents` bucket
// instead of `product-media` (components/containers/README.md).
import { useRef, useState } from 'react'
import { attachDocument, createDocumentUploadUrl, listDocuments } from '@/lib/actions/containers'
import { DOCUMENT_KINDS, type DocumentKind } from '@/lib/actions/containers-types'
import { useDocumentsQuery } from './useDocumentsQuery'

export function DocumentVault({ containerId, canWrite }: { containerId: string; canWrite: boolean }) {
  const query = useDocumentsQuery(containerId)
  const [kind, setKind] = useState<DocumentKind>('BL')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const documents = query.data ?? []
  const presentKinds = new Set(documents.map((d) => d.kind))

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    setError(null)
    try {
      for (const file of Array.from(files)) {
        const ticket = await createDocumentUploadUrl(containerId, { kind, fileName: file.name })
        if (ticket.error) {
          setError(ticket.error.message)
          continue
        }
        const res = await fetch(ticket.data.signedUrl, { method: 'PUT', body: file })
        if (!res.ok) {
          setError(`No se pudo subir ${file.name} / Could not upload ${file.name}`)
          continue
        }
        const attached = await attachDocument(containerId, { kind, storagePath: ticket.data.path })
        if (attached.error) {
          setError(attached.error.message)
        }
      }
      await query.refetch()
    } catch (err) {
      console.error('[document-vault:upload]', err)
      setError('Error inesperado al subir / Unexpected upload error')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">Documentos / Documents</h2>

      <div className="flex flex-wrap gap-2">
        {DOCUMENT_KINDS.map((k) => (
          <span
            key={k}
            className={`rounded-card border px-2 py-1 font-mono text-label uppercase tracking-[0.08em] ${
              presentKinds.has(k) ? 'border-positive text-positive' : 'border-line text-ink-secondary'
            }`}
          >
            {presentKinds.has(k) ? '✓ ' : '— '}
            {k}
          </span>
        ))}
      </div>

      {canWrite ? (
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as DocumentKind)}
            disabled={uploading}
            className="rounded-card border border-line bg-surface-1 px-3 py-2 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
          >
            {DOCUMENT_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="application/pdf,image/*"
            disabled={uploading}
            onChange={(e) => handleFiles(e.target.files)}
            className="font-ui text-t0 text-ink-secondary file:mr-3 file:rounded-card file:border file:border-line file:bg-surface-1 file:px-3 file:py-1.5 file:font-mono file:text-label file:uppercase file:tracking-[0.1em] file:text-ink-primary"
          />
          {uploading ? <span className="font-mono text-label text-ink-secondary">Subiendo… / Uploading…</span> : null}
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="font-ui text-t0 text-negative">
          {error}
        </p>
      ) : null}

      <ul className="flex flex-col gap-2">
        {documents.map((doc) => (
          <li key={doc.id} className="flex items-center justify-between rounded-card border border-line p-3">
            <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">{doc.kind}</span>
            {doc.signedUrl ? (
              <a
                href={doc.signedUrl}
                target="_blank"
                rel="noreferrer"
                className="truncate font-ui text-t0 text-lane-accent underline-offset-2 hover:underline"
              >
                {doc.storagePath.split('/').pop()}
              </a>
            ) : (
              <span className="font-ui text-t0 text-ink-secondary">{doc.storagePath.split('/').pop()}</span>
            )}
          </li>
        ))}
        {!query.isLoading && documents.length === 0 ? (
          <p className="font-ui text-t0 text-ink-secondary">Sin documentos / No documents yet</p>
        ) : null}
      </ul>
    </div>
  )
}
