'use client'

import { useEffect, useRef, useState } from 'react'

interface NavSection {
  id: string
  label: string
}

const DEFAULT_SECTIONS: NavSection[] = [
  { id: 'variantes', label: 'Variantes' },
  { id: 'especificaciones', label: 'Especificaciones' },
  { id: 'usos', label: 'Usos' },
  { id: 'consultar', label: 'Consultar' },
]

interface JumpNavigationProps {
  sections?: NavSection[]
}

export default function JumpNavigation({ sections = DEFAULT_SECTIONS }: JumpNavigationProps) {
  const [visible, setVisible] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const prefersReducedMotion = useRef(false)

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches

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

  const shouldAnimate = visible && !prefersReducedMotion.current
  const activeIndex = sections.findIndex((s) => s.id === activeId)
  const position = activeIndex >= 0 ? activeIndex + 1 : 1

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        width: '100%',
        backgroundColor: 'rgba(248, 246, 240, 0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(0, 30, 80, 0.10)',
        opacity: visible ? 1 : 0,
        transform: shouldAnimate ? 'translateY(0)' : visible ? 'translateY(0)' : 'translateY(-8px)',
        transition: 'opacity 200ms ease, transform 200ms ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}
      aria-label="Índice del documento de producto"
    >
      <div
        style={{
          maxWidth: '72rem',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          height: '44px',
        }}
      >
        {/* Document register — the buyer reads where they are in the document */}
        <span
          style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: '9px',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'rgba(0, 30, 80, 0.4)',
            whiteSpace: 'nowrap',
            marginRight: '28px',
            fontVariantNumeric: 'tabular-nums',
          }}
          aria-hidden="true"
        >
          {String(position).padStart(2, '0')} / {String(sections.length).padStart(2, '0')}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {sections.map(({ id, label }) => {
            const isActive = activeId === id
            return (
              <button
                key={id}
                onClick={() => handleClick(id)}
                aria-current={isActive ? 'true' : undefined}
                style={{
                  fontFamily: '"DM Mono", monospace',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: isActive ? '#C4933F' : '#001E50',
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #C4933F' : '2px solid transparent',
                  paddingBottom: '2px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'color 150ms ease, border-color 150ms ease',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
