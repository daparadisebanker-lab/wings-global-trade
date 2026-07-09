'use client'

import { Fragment } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface MarketTokenStaggerProps {
  markets: string[]
  className?: string
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const token = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const } },
}

export function MarketTokenStagger({ markets, className }: MarketTokenStaggerProps) {
  const reduced = useReducedMotion()

  if (reduced) {
    return <p className={className}>{markets.join(' · ')}</p>
  }

  return (
    <motion.p
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
    >
      {markets.map((m, i) => (
        <Fragment key={m}>
          <motion.span className="inline-block" variants={token}>
            {m}
          </motion.span>
          {i < markets.length - 1 && (
            <span className="opacity-30"> · </span>
          )}
        </Fragment>
      ))}
    </motion.p>
  )
}
