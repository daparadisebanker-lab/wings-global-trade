'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useSplitTextReveal } from '@/hooks/useSplitTextReveal'

interface AnimatedInteriorHeroProps {
  overline: string
  headline: string[]
  subtitle?: string
  dark?: boolean
}

export function AnimatedInteriorHero({
  overline,
  headline,
  subtitle,
  dark = false,
}: AnimatedInteriorHeroProps) {
  const shouldReduceMotion = useReducedMotion()

  const headlineRef = useSplitTextReveal<HTMLHeadingElement>({
    type: 'lines',
    trigger: 'mount',
    delay: 0.2,
    stagger: 0.1,
    duration: 0.85,
  })

  const textColor = dark ? 'text-warm-white' : 'text-navy'
  const overlineColor = dark ? 'text-warm-white/30' : 'text-navy/40'
  const subtitleColor = dark ? 'text-warm-white/60' : 'text-navy/60'

  if (shouldReduceMotion) {
    return (
      <div>
        <p className={`font-mono text-[10px] uppercase tracking-[0.15em] ${overlineColor} mb-6`}>
          {overline}
        </p>
        <h1
          className={`font-display text-display-xl font-light ${textColor} leading-[0.95] tracking-[-0.02em]`}
        >
          {headline.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
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

      <h1
        ref={headlineRef}
        className={`font-display text-display-xl font-light ${textColor} leading-[0.95] tracking-[-0.02em]`}
      >
        {headline.map((line, i) => (
          <span key={i} className="block">
            {line}
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
