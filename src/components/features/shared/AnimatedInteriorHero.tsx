'use client'

import { motion, useReducedMotion } from 'framer-motion'

interface AnimatedInteriorHeroProps {
  overline: string
  headline: string[]
  subtitle?: string
  dark?: boolean
}

const SPRING: [number, number, number, number] = [0.16, 1, 0.3, 1]

export function AnimatedInteriorHero({
  overline,
  headline,
  subtitle,
  dark = false,
}: AnimatedInteriorHeroProps) {
  const shouldReduceMotion = useReducedMotion()

  const textColor = dark ? 'text-warm-white' : 'text-navy'
  const overlineColor = dark ? 'text-warm-white/30' : 'text-navy/40'
  const subtitleColor = dark ? 'text-warm-white/60' : 'text-navy/60'

  if (shouldReduceMotion) {
    return (
      <div>
        <p className={`font-mono text-[10px] uppercase tracking-[0.15em] ${overlineColor} mb-6`}>
          {overline}
        </p>
        <h1 className={`font-display text-display-xl font-light ${textColor} leading-[0.95] tracking-[-0.02em]`}>
          {headline.map((line, i) => (
            <span key={i} className="block">{line}</span>
          ))}
        </h1>
        {subtitle && (
          <p className={`mt-8 font-body text-body-lg ${subtitleColor} max-w-2xl leading-relaxed`}>
            {subtitle}
          </p>
        )}
      </div>
    )
  }

  return (
    <div>
      <motion.p
        className={`font-mono text-[10px] uppercase tracking-[0.15em] ${overlineColor} mb-6`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.1 }}
      >
        {overline}
      </motion.p>

      <h1 className={`font-display text-display-xl font-light ${textColor} leading-[0.95] tracking-[-0.02em]`}>
        {headline.map((line, i) => (
          <span key={i} className="block overflow-hidden">
            <motion.span
              className="block"
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 0.85, ease: SPRING, delay: 0.2 + i * 0.1 }}
            >
              {line}
            </motion.span>
          </span>
        ))}
      </h1>

      {subtitle && (
        <motion.p
          className={`mt-8 font-body text-body-lg ${subtitleColor} max-w-2xl leading-relaxed`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0, 0, 0.2, 1], delay: 0.55 }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  )
}
