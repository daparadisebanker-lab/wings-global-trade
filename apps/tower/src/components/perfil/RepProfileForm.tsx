'use client'

// RepProfileForm — the self-serve onboarding surface for an enrolled rep. Edits
// the rep-editable fields (display_name, title, whatsapp_e164, whatsapp_label —
// validated by repProfileUpdateSchema) and uploads a signature into the private
// `rep-assets` bucket.
//
// SIGNATURE UPLOAD FLOW (foundation contract): createRepSignatureUploadUrl(ext)
// mints a signed upload URL (and persists signature_path server-side); the client
// PUTs the file bytes straight to that URL. PREVIEW is ALWAYS through an <img>
// tag — never inline SVG / dangerouslySetInnerHTML — so an SVG signature runs in
// no script context (the bucket's svg+png allow-list + 512 KiB cap + <img>
// rendering are the defense, per rep-profile.ts).
//
// Tokens only; ES/EN; native inputs keep it fully keyboard reachable.
import { useMemo, useState, useTransition } from 'react'
import {
  createRepSignatureUploadUrl,
  getMyRepProfile,
  upsertMyRepProfile,
  type RepProfile,
} from '@/lib/actions/rep-profile'
import { E164_REGEX } from '@/lib/actions/rep-profile-logic'

const MAX_SIGNATURE_BYTES = 512 * 1024 // mirrors the tower_39 bucket cap.

type Banner = { tone: 'positive' | 'negative'; text: string } | null

/** svg/png only — matches the bucket allow-list. Returns null for anything else. */
function extAndMime(file: File): { ext: 'svg' | 'png'; mime: string } | null {
  const name = file.name.toLowerCase()
  if (file.type === 'image/svg+xml' || name.endsWith('.svg')) return { ext: 'svg', mime: 'image/svg+xml' }
  if (file.type === 'image/png' || name.endsWith('.png')) return { ext: 'png', mime: 'image/png' }
  return null
}

export function RepProfileForm({
  userId,
  initialProfile,
  initialSignatureUrl,
}: {
  userId: string
  initialProfile: RepProfile | null
  initialSignatureUrl: string | null
}) {
  const [displayName, setDisplayName] = useState(initialProfile?.displayName ?? '')
  const [title, setTitle] = useState(initialProfile?.title ?? '')
  const [whatsapp, setWhatsapp] = useState(initialProfile?.whatsappE164 ?? '')
  const [whatsappLabel, setWhatsappLabel] = useState(initialProfile?.whatsappLabel ?? '')

  const [signatureUrl, setSignatureUrl] = useState<string | null>(initialSignatureUrl)
  const [hasSignature, setHasSignature] = useState(Boolean(initialProfile?.signaturePath))
  const [onboardedAt, setOnboardedAt] = useState<string | null>(initialProfile?.onboardedAt ?? null)

  const [banner, setBanner] = useState<Banner>(null)
  const [isSaving, startSave] = useTransition()
  const [isUploading, setIsUploading] = useState(false)

  // Local E.164 hint — the server (repProfileUpdateSchema) is the real gate.
  const whatsappInvalid = whatsapp.trim().length > 0 && !E164_REGEX.test(whatsapp.trim())
  const complete = useMemo(
    () => Boolean(displayName.trim() && title.trim() && whatsapp.trim() && hasSignature),
    [displayName, title, whatsapp, hasSignature],
  )

  function save() {
    if (whatsappInvalid) {
      setBanner({ tone: 'negative', text: 'WhatsApp debe estar en formato E.164 (+51987654321) / WhatsApp must be E.164.' })
      return
    }
    startSave(async () => {
      const result = await upsertMyRepProfile({
        display_name: displayName.trim() || null,
        title: title.trim() || null,
        whatsapp_e164: whatsapp.trim() || null,
        whatsapp_label: whatsappLabel.trim() || null,
      })
      if (result.error) {
        setBanner({ tone: 'negative', text: `No se pudo guardar / Could not save: ${result.error.message}` })
        return
      }
      setOnboardedAt(result.data.onboardedAt)
      setBanner({ tone: 'positive', text: 'Perfil guardado / Profile saved.' })
    })
  }

  async function onPickSignature(file: File) {
    setBanner(null)
    const kind = extAndMime(file)
    if (!kind) {
      setBanner({ tone: 'negative', text: 'Solo SVG o PNG / SVG or PNG only.' })
      return
    }
    if (file.size > MAX_SIGNATURE_BYTES) {
      setBanner({ tone: 'negative', text: 'La firma supera 512 KiB / Signature exceeds 512 KiB.' })
      return
    }
    setIsUploading(true)
    try {
      const ticket = await createRepSignatureUploadUrl(kind.ext)
      if (ticket.error) {
        setBanner({ tone: 'negative', text: `No se pudo preparar la carga / Could not prepare upload: ${ticket.error.message}` })
        return
      }
      const put = await fetch(ticket.data.signedUrl, {
        method: 'PUT',
        headers: { 'content-type': kind.mime },
        body: file,
      })
      if (!put.ok) {
        setBanner({ tone: 'negative', text: 'No se pudo subir la firma / Could not upload the signature.' })
        return
      }
      // Immediate preview from the local file (object URL) — always via <img>.
      setSignatureUrl(URL.createObjectURL(file))
      setHasSignature(true)
      setBanner({ tone: 'positive', text: 'Firma cargada / Signature uploaded.' })
      // Refresh onboarded_at (saving path stamps it once the row is complete).
      const fresh = await getMyRepProfile()
      if (!fresh.error && fresh.data) setOnboardedAt(fresh.data.onboardedAt)
    } catch (err) {
      console.error('[perfil:signature-upload]', err)
      setBanner({ tone: 'negative', text: 'Error inesperado al subir / Unexpected upload error.' })
    } finally {
      setIsUploading(false)
    }
  }

  const inputClass =
    'rounded-card border border-line bg-surface-0 px-3 py-2 font-ui text-t0 text-ink-primary outline-none placeholder:text-ink-secondary focus-visible:border-lane-accent'
  const labelClass = 'font-mono text-label uppercase tracking-[0.1em] text-ink-secondary'

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <span className="font-mono text-label uppercase tracking-[0.15em] text-lane-accent">PERFIL · Profile</span>
        <h1 className="font-display text-t3 text-ink-primary">Tu perfil de rep / Your rep profile</h1>
        <p className="font-ui text-t0 text-ink-secondary">
          Completa tus datos y tu firma; se usan en tus documentos y en tu enlace de WhatsApp. / Complete your details and
          signature; they are used on your documents and WhatsApp link.
        </p>
      </header>

      {/* Onboarding status — reads without color. */}
      <div className="flex items-center gap-3 rounded-card border border-line bg-surface-1 p-3">
        <span aria-hidden className={`inline-block h-2 w-2 ${onboardedAt ? 'bg-positive' : 'bg-gold'}`} />
        <span className="font-ui text-t0 text-ink-primary">
          {onboardedAt
            ? 'Perfil completo / Profile complete'
            : 'Perfil pendiente — completa nombre, cargo, WhatsApp y firma / Pending — add name, title, WhatsApp and signature'}
        </span>
        {!onboardedAt ? (
          <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
            {complete ? 'Listo para guardar / Ready to save' : 'Incompleto / Incomplete'}
          </span>
        ) : null}
      </div>

      <div className="grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Nombre / Display name</span>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={120} className={inputClass} placeholder="Ana Vega" />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Cargo / Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} className={inputClass} placeholder="Trade Manager" />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClass}>WhatsApp (E.164)</span>
          <input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            inputMode="tel"
            aria-invalid={whatsappInvalid}
            className={inputClass}
            placeholder="+51987654321"
          />
          {whatsappInvalid ? (
            <span className="font-ui text-label text-negative">Formato E.164 requerido / E.164 format required.</span>
          ) : null}
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Etiqueta WhatsApp / Label</span>
          <input value={whatsappLabel} onChange={(e) => setWhatsappLabel(e.target.value)} maxLength={80} className={inputClass} placeholder="Lima desk" />
        </label>
      </div>

      {/* Signature */}
      <section className="flex max-w-3xl flex-col gap-3 rounded-card border border-line bg-surface-1 p-4">
        <span className={labelClass}>Firma / Signature (SVG · PNG, ≤ 512 KiB)</span>
        <div className="flex flex-wrap items-center gap-4">
          {signatureUrl ? (
            // Signatures render ONLY through <img> — never inline SVG. See header note.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={signatureUrl} alt="Firma / Signature" className="h-16 w-auto max-w-[240px] border border-line bg-surface-0 p-2" />
          ) : (
            <span className="font-ui text-t0 text-ink-secondary">Sin firma todavía / No signature yet.</span>
          )}
          <label className="cursor-pointer rounded-card border border-line px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary hover:text-ink-primary">
            {isUploading ? 'Subiendo… / Uploading…' : hasSignature ? 'Reemplazar / Replace' : 'Subir firma / Upload'}
            <input
              type="file"
              accept="image/svg+xml,image/png,.svg,.png"
              className="sr-only"
              disabled={isUploading}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void onPickSignature(file)
                e.target.value = ''
              }}
            />
          </label>
        </div>
      </section>

      {banner ? (
        <p role="status" className={`max-w-3xl font-ui text-t0 ${banner.tone === 'positive' ? 'text-positive' : 'text-negative'}`}>
          {banner.text}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={isSaving || whatsappInvalid}
          className="rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
        >
          {isSaving ? 'Guardando… / Saving…' : 'Guardar perfil / Save profile'}
        </button>
      </div>
    </div>
  )
}
