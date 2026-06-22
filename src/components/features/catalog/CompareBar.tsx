'use client'

// src/components/features/catalog/CompareBar.tsx
// Circular FAB (bottom-6 right-6) that opens a compare sheet.
// Sheet shows exactly which products are selected (numbered slots, image, name, remove).
// Replaces the old persistent bottom bar.

import Link from 'next/link'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useComparison } from '@/hooks/useComparison'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// CompareSheet — bottom tray showing selected products
// ---------------------------------------------------------------------------

interface CompareSheetProps {
  isOpen: boolean
  onClose: () => void
}

function CompareSheet({ isOpen, onClose }: CompareSheetProps) {
  const { items, remove, clear } = useComparison()
  const canCompare = items.length >= 2

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="compare-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.25 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-[rgba(0,30,80,0.48)] lg:hidden"
            aria-hidden
          />

          <motion.div
            key="compare-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0, transition: { duration: 0.35, ease: [0.0, 0.0, 0.2, 1.0] } }}
            exit={{ y: '100%', transition: { duration: 0.28, ease: [0.4, 0.0, 1.0, 1.0] } }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[8px] bg-warm-white px-5 pb-10 pt-4 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Comparación de productos"
          >
            {/* Drag handle */}
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[rgba(0,30,80,0.12)]" aria-hidden />

            {/* Header */}
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="font-display text-lg font-light text-navy">Comparación</h2>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-navy/45">
                  {items.length > 0
                    ? `${items.length} de 3 productos seleccionados`
                    : 'Sin productos seleccionados'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-navy/45 transition-colors hover:text-navy"
                aria-label="Cerrar comparación"
              >
                Cerrar
              </button>
            </div>

            {/* Empty state */}
            {items.length === 0 && (
              <div className="mb-6 py-6 text-center">
                <div className="mb-4 flex items-center justify-center gap-3">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-wings border border-dashed border-[rgba(0,30,80,0.12)]"
                      aria-hidden
                    >
                      <span className="font-mono text-[11px] text-navy/25">{n}</span>
                    </div>
                  ))}
                </div>
                <p className="font-body text-sm text-navy/50">
                  Selecciona hasta 3 productos para comparar
                </p>
                <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.10em] text-navy/30">
                  Usa &quot;+ Comparar&quot; en cada ficha de producto
                </p>
              </div>
            )}

            {/* Product slots — always show 3, filled or empty */}
            {items.length > 0 && (
              <div className="mb-5 space-y-2">
                {/* Filled slots */}
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-wings bg-[rgba(0,30,80,0.03)] px-3 py-2.5"
                  >
                    <span className="w-4 shrink-0 text-center font-mono text-[10px] text-navy/30">
                      {idx + 1}
                    </span>
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-wings bg-white">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name_es}
                          fill
                          sizes="40px"
                          className="object-contain p-1"
                        />
                      ) : null}
                    </div>
                    <span className="flex-1 truncate font-body text-sm leading-tight text-navy">
                      {item.name_es}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      aria-label={`Quitar ${item.name_es} de la comparación`}
                      className="shrink-0 font-mono text-lg leading-none text-navy/30 transition-colors hover:text-navy"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {/* Empty slots */}
                {Array.from({ length: 3 - items.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="flex h-[52px] items-center rounded-wings border border-dashed border-[rgba(0,30,80,0.09)] px-3"
                    aria-hidden
                  >
                    <span className="w-4 text-center font-mono text-[10px] text-navy/20">
                      {items.length + i + 1}
                    </span>
                    <span className="ml-3 font-mono text-[10px] uppercase tracking-[0.10em] text-navy/18">
                      Vacío
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              {canCompare ? (
                <Link
                  href={`/catalogo/comparar?ids=${items.map((i) => i.id).join(',')}`}
                  onClick={onClose}
                  className="flex w-full items-center justify-center gap-2 rounded-wings bg-navy px-6 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-warm-white transition-colors hover:bg-navy-light"
                >
                  Comparar {items.length} productos →
                </Link>
              ) : items.length > 0 ? (
                <div className="flex w-full items-center justify-center py-3 font-mono text-[10px] uppercase tracking-[0.10em] text-navy/35">
                  Agrega {2 - items.length} producto{2 - items.length > 1 ? 's' : ''} más para comparar
                </div>
              ) : null}

              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    clear()
                    onClose()
                  }}
                  className="flex w-full items-center justify-center py-2 font-mono text-[10px] uppercase tracking-[0.10em] text-navy/35 transition-colors hover:text-navy"
                >
                  Limpiar selección
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ---------------------------------------------------------------------------
// DesktopCompareBar — sticky bottom bar, visible on lg+ only
// Slides up from bottom when items are selected.
// ---------------------------------------------------------------------------

function DesktopCompareBar() {
  const { items, remove, clear } = useComparison()
  const canCompare = items.length >= 2

  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.32, ease: [0.0, 0.0, 0.2, 1.0] }}
          className="fixed bottom-0 left-0 right-0 z-40 hidden border-t border-warm-white/[0.08] bg-[#000C1F] lg:block"
          role="region"
          aria-label="Comparación de productos"
        >
          <div className="mx-auto flex max-w-6xl items-center gap-6 px-10 py-4">
            {/* Label */}
            <p className="shrink-0 font-mono text-[10px] uppercase tracking-[0.15em] text-warm-white/35">
              Comparando
            </p>

            {/* Product slots */}
            <div className="flex flex-1 items-center gap-3">
              {[0, 1, 2].map((idx) => {
                const item = items[idx]
                return item ? (
                  <div
                    key={item.id}
                    className="flex items-center gap-2.5 rounded border border-warm-white/[0.08] bg-warm-white/[0.04] px-3 py-2"
                  >
                    {item.image && (
                      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded bg-white/10">
                        <Image
                          src={item.image}
                          alt={item.name_es}
                          fill
                          sizes="32px"
                          className="object-contain p-0.5"
                        />
                      </div>
                    )}
                    <span className="max-w-[160px] truncate font-mono text-[11px] text-warm-white/75">
                      {item.name_es}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      aria-label={`Quitar ${item.name_es}`}
                      className="ml-1 font-mono text-base leading-none text-warm-white/25 transition-colors hover:text-warm-white/70"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div
                    key={`empty-${idx}`}
                    className="flex h-[44px] w-[180px] items-center rounded border border-dashed border-warm-white/[0.08] px-3"
                    aria-hidden
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-warm-white/20">
                      Slot {idx + 1}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-4">
              <button
                type="button"
                onClick={clear}
                className="font-mono text-[10px] uppercase tracking-[0.12em] text-warm-white/30 transition-colors hover:text-warm-white/60"
              >
                Limpiar
              </button>
              {canCompare ? (
                <Link
                  href={`/catalogo/comparar?ids=${items.map((i) => i.id).join(',')}`}
                  className="flex items-center gap-2 bg-gold px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-navy transition-colors hover:bg-gold-hover"
                >
                  Comparar {items.length} productos →
                </Link>
              ) : (
                <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-warm-white/25">
                  Agrega {2 - items.length} más para comparar
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ---------------------------------------------------------------------------
// CompareBar — circular FAB + animated pulse ring + spring badge
// Rendered in layout.tsx. Mobile: FAB + sheet. Desktop: sticky bottom bar.
// ---------------------------------------------------------------------------

export function CompareBar() {
  const { items } = useComparison()
  const [isOpen, setIsOpen] = useState(false)
  const hasItems = items.length > 0

  // Pulse ring: fires once per count increase
  const prevItemCount = useRef(items.length)
  const [pulseVersion, setPulseVersion] = useState(0)

  useEffect(() => {
    if (items.length > prevItemCount.current) {
      setPulseVersion((v) => v + 1)
    }
    prevItemCount.current = items.length
  }, [items.length])

  return (
    <>
      {/* Mobile FAB — hidden on desktop */}
      <div className="fixed bottom-6 right-6 z-40 lg:hidden">
        {/* Pulse ring — expands + fades each time an item is added */}
        <AnimatePresence>
          {pulseVersion > 0 && (
            <motion.span
              key={pulseVersion}
              initial={{ scale: 0.9, opacity: 0.55 }}
              animate={{ scale: 2.6, opacity: 0 }}
              exit={{}}
              transition={{ duration: 0.55, ease: [0, 0, 0.2, 1] }}
              className="pointer-events-none absolute inset-0 rounded-full bg-gold/30"
              aria-hidden
            />
          )}
        </AnimatePresence>

        {/* FAB button */}
        <motion.button
          type="button"
          onClick={() => setIsOpen(true)}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={cn(
            'relative flex h-12 w-12 items-center justify-center rounded-full shadow-lg',
            'transition-colors duration-200',
            hasItems ? 'bg-navy hover:bg-navy-light' : 'bg-navy/40 hover:bg-navy/60',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
          )}
          aria-label={
            hasItems
              ? `Comparación — ${items.length} producto${items.length > 1 ? 's' : ''} seleccionado${items.length > 1 ? 's' : ''}`
              : 'Comparación de productos'
          }
        >
          {/* Compare icon — two vertical panels */}
          <svg width="18" height="16" viewBox="0 0 18 16" fill="none" aria-hidden>
            <rect x="1" y="1" width="6" height="14" rx="1" stroke="white" strokeWidth="1.5" />
            <rect x="11" y="1" width="6" height="14" rx="1" stroke="white" strokeWidth="1.5" />
          </svg>

          {/* Item count badge — springs in/out on count change */}
          <AnimatePresence mode="wait">
            {hasItems && (
              <motion.span
                key={items.length}
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.3, opacity: 0, transition: { duration: 0.12, ease: [0.4, 0, 1, 1] } }}
                transition={{ type: 'spring', stiffness: 700, damping: 22 }}
                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold leading-none text-navy"
                aria-hidden
              >
                {items.length}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Mobile comparison sheet */}
      <CompareSheet isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/* Desktop sticky bottom bar */}
      <DesktopCompareBar />
    </>
  )
}
