'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import gsap from 'gsap'

interface MagneticWrapperProps {
  children: React.ReactNode
  strength?: number
  className?: string
}

export function MagneticWrapper({ children, strength = 0.28, className }: MagneticWrapperProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * strength
    const y = (e.clientY - rect.top - rect.height / 2) * strength
    gsap.to(ref.current, { x, y, duration: 0.4, ease: 'power2.out', overwrite: 'auto' })
  }, [reduced, strength])

  const handleMouseLeave = useCallback(() => {
    if (reduced || !ref.current) return
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' })
  }, [reduced])

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}
