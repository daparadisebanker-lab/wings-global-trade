'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  magnetRadius?: number
  magnetStrength?: number
}

export function MagneticButton({
  children,
  className,
  magnetRadius = 60,
  magnetStrength = 20,
}: MagneticButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isCoarse, setIsCoarse] = useState(true)

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  const x = useSpring(rawX, { stiffness: 200, damping: 20 })
  const y = useSpring(rawY, { stiffness: 200, damping: 20 })

  useEffect(() => {
    if (typeof window === 'undefined') return
    setIsCoarse(window.matchMedia('(pointer: coarse)').matches)
  }, [])

  useEffect(() => {
    if (isCoarse) return

    const container = containerRef.current
    if (!container) return

    function handleMouseMove(e: MouseEvent) {
      const rect = container!.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const dx = e.clientX - centerX
      const dy = e.clientY - centerY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < magnetRadius) {
        const pull = (1 - distance / magnetRadius) * magnetStrength
        rawX.set((dx / distance) * pull)
        rawY.set((dy / distance) * pull)
      } else {
        rawX.set(0)
        rawY.set(0)
      }
    }

    function handleMouseLeave() {
      rawX.set(0)
      rawY.set(0)
    }

    // Listen on document so magnetic pull works before cursor is over the button
    document.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [isCoarse, magnetRadius, magnetStrength, rawX, rawY])

  return (
    <div ref={containerRef} className={className}>
      <motion.div style={isCoarse ? {} : { x, y }}>
        {children}
      </motion.div>
    </div>
  )
}
