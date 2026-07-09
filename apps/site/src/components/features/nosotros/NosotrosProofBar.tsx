'use client'

import { useEffect, useRef } from 'react'
import { useInView, animate } from 'framer-motion'

interface StatDef {
  num: number
  pad: number
  suffix: string
  label: string
}

const STATS: StatDef[] = [
  { num: 97, pad: 0,  suffix: '',  label: 'Modelos en catálogo' },
  { num: 5,  pad: 2,  suffix: '',  label: 'Fabricantes en origen' },
  { num: 2,  pad: 2,  suffix: '',  label: 'Zonas francas' },
  { num: 24, pad: 0,  suffix: 'h', label: 'Plazo de respuesta' },
]

function fmt(n: number, pad: number) {
  return pad > 0 ? String(Math.round(n)).padStart(pad, '0') : String(Math.round(n))
}

function StatItem({ num, pad, suffix, label, bordered }: StatDef & { bordered: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const displayRef = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const started = useRef(false)

  useEffect(() => {
    if (!inView || started.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (displayRef.current) displayRef.current.textContent = fmt(num, pad)
      return
    }
    started.current = true
    const controls = animate(0, num, {
      duration: 1.4,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate(v) {
        if (displayRef.current) displayRef.current.textContent = fmt(v, pad)
      },
    })
    return () => controls.stop()
  }, [inView, num, pad])

  return (
    <div
      ref={ref}
      className={bordered ? 'border-l border-warm-white/[0.07] pl-8 md:pl-12' : ''}
    >
      <div className="font-display text-[2.5rem] font-light text-gold leading-none tracking-tight">
        <span ref={displayRef}>{pad > 0 ? '0'.repeat(pad) : '0'}</span>
        {suffix}
      </div>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-warm-white/40">
        {label}
      </p>
    </div>
  )
}

export function NosotrosProofBar() {
  return (
    <div className="border-t border-warm-white/[0.06] px-6 py-10 md:px-10 md:py-12">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-y-10 md:grid-cols-4">
        {STATS.map((s, i) => (
          <StatItem key={s.label} {...s} bordered={i > 0} />
        ))}
      </div>
    </div>
  )
}
