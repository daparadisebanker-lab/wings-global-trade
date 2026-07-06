'use client'

import { motion, useReducedMotion } from 'framer-motion'

interface AnimatedRuleProps {
  className?: string
}

export function AnimatedRule({ className }: AnimatedRuleProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      style={{
        display: 'block',
        width: '2.5rem',
        height: '1px',
        backgroundColor: '#C4933F',
        originX: 0,
      }}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
      }
    />
  )
}
