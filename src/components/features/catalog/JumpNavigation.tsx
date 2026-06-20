'use client'

import { useEffect, useState } from 'react'

interface NavSection {
  id: string
  label: string
}

const DEFAULT_SECTIONS: NavSection[] = [
  { id: 'variantes', label: 'Variantes' },
  { id: 'especificaciones', label: 'Especificaciones' },
  { id: 'aplicaciones', label: 'Aplicaciones' },
  { id: 'consultar', label: 'Consultar' },
]

interface JumpNavigationProps {
  sections?: NavSection[]
  variantCount?: number
  specCount?: number
}

export default function JumpNavigation({
  sections = DEFAULT_SECTIONS,
  variantCount,
  specCount,
}: JumpNavigationProps) {
  const [visible, setVisible] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 200)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(id)
        },
        { threshold: 0.3 },
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [sections])

  const handleClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  // Resolves the display label for a section, injecting live counts where available.
  function labelFor(id: string, rawLabel: string): string {
    if (id === 'variantes' && variantCount) return `Variantes (${variantCount})`
    if (id === 'especificaciones' && specCount) return `Specs (${specCount})`
    return rawLabel
  }

  const activeIndex = sections.findIndex((s) => s.id === activeId)
  const position = activeIndex >= 0 ? activeIndex + 1 : 1

  return (
    <nav
      className={[
        'sticky top-0 z-40 w-full',
        'bg-[rgba(248,246,240,0.95)] backdrop-blur-sm',
        'border-b border-navy/10',
        'transition-[opacity,transform] duration-200 ease-[ease]',
        visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none',
      ].join(' ')}
      aria-label="Índice del documento de producto"
    >
      <div className="mx-auto max-w-6xl px-6 flex items-center h-12">
        {/* Document register — the buyer reads where they are in the document */}
        <span
          className="font-mono text-[10px] uppercase tracking-[0.12em] text-navy/40 whitespace-nowrap mr-6 tabular-nums shrink-0"
          aria-hidden="true"
        >
          {String(position).padStart(2, '0')} / {String(sections.length).padStart(2, '0')}
        </span>

        <div className="flex items-center gap-8 overflow-x-auto scrollbar-none">
          {sections.map(({ id, label }) => {
            const isActive = activeId === id
            return (
              <button
                key={id}
                onClick={() => handleClick(id)}
                aria-current={isActive ? 'true' : undefined}
                className={[
                  'font-mono text-[10px] uppercase tracking-[0.08em] whitespace-nowrap',
                  'bg-transparent border-x-0 border-t-0 cursor-pointer',
                  'transition-colors duration-150',
                  'border-b-2 pb-0.5',
                  isActive
                    ? 'text-gold border-gold'
                    : 'text-navy border-transparent hover:text-gold',
                ].join(' ')}
              >
                {labelFor(id, label)}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
