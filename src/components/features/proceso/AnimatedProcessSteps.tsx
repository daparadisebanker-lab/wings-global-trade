'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { EASE_OUT, SPRING } from '@/lib/motion'

interface StepData {
  label: string
  value: string
}

interface Step {
  num: string
  title: string
  body: string
  data: StepData[]
}

interface AnimatedProcessStepsProps {
  steps: Step[]
}

export function AnimatedProcessSteps({ steps }: AnimatedProcessStepsProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return (
      <div className="flex flex-col divide-y divide-[rgba(0,30,80,0.06)]">
        {steps.map((step, i) => (
          <div
            key={step.num}
            className={`grid grid-cols-1 gap-10 py-14 lg:grid-cols-[80px_1fr_260px] lg:gap-16 ${
              i === 0 ? 'pt-0' : ''
            } ${i === steps.length - 1 ? 'pb-0' : ''}`}
          >
            <div className="flex items-start">
              <span className="font-mono text-[11px] tracking-[0.20em] text-gold/40">{step.num}</span>
            </div>
            <div>
              <h2 className="mb-5 font-display text-display-sm font-light text-navy leading-tight">
                {step.title}
              </h2>
              <p className="font-body text-body-lg leading-relaxed text-navy/65">{step.body}</p>
            </div>
            <div className="flex flex-col gap-4 border-l-0 pt-0 lg:border-l lg:border-[rgba(0,30,80,0.08)] lg:pl-10 lg:pt-1">
              {step.data.map((d) => (
                <div key={d.label}>
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.15em] text-navy/30">
                    {d.label}
                  </p>
                  <p className="font-body text-sm leading-snug text-navy/75">{d.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-[rgba(0,30,80,0.06)]">
      {steps.map((step, i) => (
        <div
          key={step.num}
          className={`grid grid-cols-1 gap-10 py-14 lg:grid-cols-[80px_1fr_260px] lg:gap-16 ${
            i === 0 ? 'pt-0' : ''
          } ${i === steps.length - 1 ? 'pb-0' : ''}`}
        >
          {/* Step number — slides from left */}
          <motion.div
            className="flex items-start"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4, ease: EASE_OUT, delay: 0 }}
          >
            <span className="font-mono text-[11px] tracking-[0.20em] text-gold/40">{step.num}</span>
          </motion.div>

          {/* Title + body */}
          <div>
            <motion.h2
              className="mb-5 font-display text-display-sm font-light text-navy leading-tight"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, ease: SPRING, delay: 0.08 }}
            >
              {step.title}
            </motion.h2>
            <motion.p
              className="font-body text-body-lg leading-relaxed text-navy/65"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.18 }}
            >
              {step.body}
            </motion.p>
          </div>

          {/* Data block */}
          <motion.div
            className="flex flex-col gap-4 border-l-0 pt-0 lg:border-l lg:border-[rgba(0,30,80,0.08)] lg:pl-10 lg:pt-1"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.22 }}
          >
            {step.data.map((d) => (
              <div key={d.label}>
                <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.15em] text-navy/30">
                  {d.label}
                </p>
                <p className="font-body text-sm leading-snug text-navy/75">{d.value}</p>
              </div>
            ))}
          </motion.div>
        </div>
      ))}
    </div>
  )
}
