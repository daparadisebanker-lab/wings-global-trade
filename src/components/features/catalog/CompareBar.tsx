// src/components/features/catalog/CompareBar.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { useComparison } from '@/hooks/useComparison'

export function CompareBar() {
  const { items, remove, clear } = useComparison()

  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.div
          key="compare-bar"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.0, 0.0, 0.2, 1.0] }}
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-gold/40 bg-[#000C1F]"
        >
          <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3 md:px-6">
            {/* Product slots */}
            <div className="flex flex-1 items-center gap-3 overflow-x-auto">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex shrink-0 items-center gap-2 rounded-wings border border-white/10 bg-white/[0.05] px-2 py-1.5"
                >
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-wings bg-[#1a1a2e]">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name_es}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full" />
                    )}
                  </div>
                  <span className="max-w-[120px] truncate font-mono text-[11px] text-warm-white/80">
                    {item.name_es}
                  </span>
                  <button
                    onClick={() => remove(item.id)}
                    aria-label={`Quitar ${item.name_es} de comparación`}
                    className="ml-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-warm-white/40 transition-colors hover:text-warm-white"
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: 3 - items.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex h-12 w-[140px] shrink-0 items-center justify-center rounded-wings border border-dashed border-white/10"
                >
                  <span className="font-mono text-[10px] uppercase tracking-widest-2 text-warm-white/20">
                    + Producto
                  </span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-4">
              <button
                onClick={clear}
                className="font-mono text-[10px] uppercase tracking-widest-2 text-warm-white/40 transition-colors hover:text-warm-white/70"
              >
                Limpiar
              </button>
              <Link
                href={`/catalogo/comparar?ids=${items.map((i) => i.id).join(',')}`}
                className="inline-flex items-center gap-2 rounded-wings bg-gold px-4 py-2 font-mono text-[10px] uppercase tracking-widest-2 text-navy transition-colors hover:bg-gold-hover"
              >
                Comparar {items.length} {items.length === 1 ? 'producto' : 'productos'} →
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
