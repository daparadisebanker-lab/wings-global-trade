'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createDocumentUploadUrl, attachDocument } from '@/lib/actions/documents'
import { DOCUMENT_KINDS, type DocumentKind } from '@/lib/actions/documents-logic'
import { listClientBrands, type ClientBrandOption } from '@/lib/actions/clients'
import { listPipelineLanes } from '@/lib/actions/pipeline'
import type { EditableLane } from '@/lib/actions/catalog'
import { t, type Locale } from '@/lib/i18n'

/**
 * Upload to the Drive: brand (+ optional lane) + kind + file → a service-role
 * signed upload URL → PUT direct to storage → attachDocument records it. The
 * write is RLS-gated at attach; a rejection shows inline.
 */
const KIND_LABEL: Record<DocumentKind, { es: string; en: string }> = {
  SPEC_SHEET: { es: 'Ficha técnica', en: 'Spec sheet' },
  QUOTATION: { es: 'Cotización', en: 'Quotation' },
  SUPPLIER_DOC: { es: 'Doc. proveedor', en: 'Supplier doc' },
  CERTIFICATE: { es: 'Certificado', en: 'Certificate' },
  DOCUMENT: { es: 'Documento', en: 'Document' },
}

export function DocumentUploader({ locale }: { locale: Locale }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [brands, setBrands] = useState<ClientBrandOption[]>([])
  const [lanes, setLanes] = useState<EditableLane[]>([])
  const [brandId, setBrandId] = useState('')
  const [laneId, setLaneId] = useState('')
  const [kind, setKind] = useState<DocumentKind>('SPEC_SHEET')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, startUpload] = useTransition()

  useEffect(() => {
    if (!open) return
    let live = true
    listClientBrands().then((res) => {
      if (live && !res.error) {
        setBrands(res.data)
        if (res.data.length === 1) setBrandId(res.data[0].id)
      }
    })
    listPipelineLanes().then((res) => {
      if (live && !res.error) setLanes(res.data)
    })
    return () => {
      live = false
    }
  }, [open])

  const laneOptions = useMemo(() => lanes.filter((l) => l.brandId === brandId), [lanes, brandId])

  function onUpload() {
    if (!file || !brandId) return
    setError(null)
    startUpload(async () => {
      const ticket = await createDocumentUploadUrl({ brandId, laneId: laneId || null, kind, fileName: file.name })
      if (ticket.error) {
        setError(ticket.error.message)
        return
      }
      const supabase = createClient()
      const up = await supabase.storage
        .from(ticket.data.bucket)
        .uploadToSignedUrl(ticket.data.path, ticket.data.token, file)
      if (up.error) {
        setError(t({ es: 'No se pudo subir el archivo.', en: 'Could not upload the file.' }, locale))
        return
      }
      const attached = await attachDocument({
        brandId,
        laneId: laneId || null,
        title: title.trim() || file.name,
        kind,
        storagePath: ticket.data.path,
        mimeType: file.type || null,
        sizeBytes: file.size,
      })
      if (attached.error) {
        setError(attached.error.message)
        return
      }
      setTitle('')
      setFile(null)
      setOpen(false)
      router.refresh()
    })
  }

  const field =
    'rounded-card border border-line bg-surface-0 px-3 py-2 font-ui text-t0 text-ink-primary outline-none focus-visible:border-lane-accent placeholder:text-ink-secondary'

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0"
      >
        {t({ es: '+ Subir documento', en: '+ Upload document' }, locale)}
      </button>
    )
  }

  const canUpload = Boolean(brandId) && Boolean(file) && !busy

  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-card border border-line bg-surface-1 p-4">
      <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
        {t({ es: 'Nuevo documento', en: 'New document' }, locale)}
      </span>

      <select className={field} value={brandId} onChange={(e) => setBrandId(e.target.value)}>
        <option value="">{t({ es: '— Marca —', en: '— Brand —' }, locale)}</option>
        {brands.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>

      <select className={field} value={laneId} onChange={(e) => setLaneId(e.target.value)} disabled={!brandId}>
        <option value="">{t({ es: '— Toda la marca —', en: '— Whole brand —' }, locale)}</option>
        {laneOptions.map((l) => (
          <option key={l.laneId} value={l.laneId}>
            {l.laneCode} · {l.laneName}
          </option>
        ))}
      </select>

      <select className={field} value={kind} onChange={(e) => setKind(e.target.value as DocumentKind)}>
        {DOCUMENT_KINDS.map((k) => (
          <option key={k} value={k}>
            {t(KIND_LABEL[k], locale)}
          </option>
        ))}
      </select>

      <input
        className={field}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t({ es: 'Título (opcional)', en: 'Title (optional)' }, locale)}
      />

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="font-ui text-body-sm text-ink-secondary file:mr-3 file:rounded-card file:border file:border-line file:bg-surface-0 file:px-3 file:py-1.5 file:font-mono file:text-label file:uppercase file:tracking-[0.1em] file:text-ink-secondary"
      />

      {error ? <p className="font-ui text-t0 text-negative">{error}</p> : null}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onUpload}
          disabled={!canUpload}
          className="rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-50"
        >
          {busy ? t({ es: 'Subiendo…', en: 'Uploading…' }, locale) : t({ es: 'Subir', en: 'Upload' }, locale)}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            setError(null)
          }}
          className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary hover:text-ink-primary"
        >
          {t({ es: 'Cancelar', en: 'Cancel' }, locale)}
        </button>
      </div>
    </div>
  )
}
