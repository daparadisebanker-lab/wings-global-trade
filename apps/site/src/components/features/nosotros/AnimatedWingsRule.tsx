'use client'

import { motion, useReducedMotion } from 'framer-motion'

export function AnimatedWingsRule({ className }: { className?: string }) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={['wings-rule', className].filter(Boolean).join(' ')}
      style={{ transformOrigin: '0% 50%' }}
      initial={reduced ? { scaleX: 1 } : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
    />
  )
}
