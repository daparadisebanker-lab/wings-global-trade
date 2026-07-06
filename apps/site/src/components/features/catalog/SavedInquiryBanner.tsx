'use client'

import { useEffect, useState } from 'react'

interface SavedInquiryState {
  variantSlug: string
  variantName: string
  formData: Record<string, string>
  savedAt: number
}

interface SavedInquiryBannerProps {
  productSlug: string
  onRestore: (variantSlug: string, formData: Record<string, string>) => void
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export default function SavedInquiryBanner({ productSlug, onRestore }: SavedInquiryBannerProps) {
  const [saved, setSaved] = useState<SavedInquiryState | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`wings_inquiry_${productSlug}`)
      if (!raw) return
      const parsed: SavedInquiryState = JSON.parse(raw)
      if (Date.now() - parsed.savedAt > SEVEN_DAYS_MS) {
        localStorage.removeItem(`wings_inquiry_${productSlug}`)
        return
      }
      setSaved(parsed)
      setVisible(true)
    } catch {
      // malformed localStorage entry — ignore
    }
  }, [productSlug])

  const handleDismiss = () => {
    try {
      localStorage.removeItem(`wings_inquiry_${productSlug}`)
    } catch {
      // ignore
    }
    setVisible(false)
  }

  const handleRestore = () => {
    if (!saved) return
    onRestore(saved.variantSlug, saved.formData)
    setVisible(false)
  }

  if (!visible || !saved) return null

  // Frame elapsed time as service: the platform held the buyer's work for them.
  const daysAgo = Math.floor((Date.now() - saved.savedAt) / (24 * 60 * 60 * 1000))
  const heldLabel =
    daysAgo <= 0
      ? 'Guardamos tu selección'
      : daysAgo === 1
        ? 'Guardamos tu selección desde ayer'
        : `Guardamos tu selección hace ${daysAgo} días`

  return (
    <div
      className="inline-flex items-center gap-3 px-3.5 py-2.5 bg-[#F8F6F0] border-l-[3px] border-[#C4933F] rounded-sm shadow-[0_1px_3px_rgba(0,30,80,0.06)]"
      style={{
        animation: 'saved-banner-slide-down 320ms cubic-bezier(0.22, 1, 0.36, 1) both',
      }}
    >
      <span className="font-mono text-[11px] leading-snug text-[#001E50]">
        <span className="block text-[9px] uppercase tracking-[0.14em] text-[#C4933F]">
          {heldLabel}
        </span>
        Retomar tu consulta sobre el{' '}
        <span className="font-medium">{saved.variantName}</span>
      </span>
      <button
        onClick={handleRestore}
        className="font-mono text-[11px] text-[#001E50] bg-[#C4933F]/[0.12] hover:bg-[#C4933F]/[0.2] px-2.5 py-1 rounded-sm transition-colors"
      >
        Retomar
      </button>
      <button
        onClick={handleDismiss}
        aria-label="Empezar de nuevo"
        title="Empezar de nuevo"
        className="font-mono text-[11px] text-[#001E50]/40 hover:text-[#001E50]/70 transition-colors"
      >
        ×
      </button>
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes saved-banner-slide-down {
            from { opacity: 0; transform: translateY(-6px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes saved-banner-slide-down {
            from { opacity: 1; }
            to   { opacity: 1; }
          }
        }
      `}</style>
    </div>
  )
}
