'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { EASE_OUT, SPRING } from '@/lib/motion'

interface StepData {
  label: string
  value: string
}

export interface StepFaq {
  q: string
  a: string
}

export interface StepCta {
  label: string
  href: string
}

export interface Step {
  id: string
  num: string
  title: string
  body: string
  data: StepData[]
  cta?: StepCta
  faqs?: StepFaq[]
}

export interface Phase {
  id: string
  label: string
  sublabel: string
  steps: Step[]
}

interface AnimatedProcessStepsProps {
  phases: Phase[]
}

function FaqAccordion({ faq }: { faq: StepFaq }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-t border-[rgba(0,30,80,0.05)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-4 py-3 text-left"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] leading-snug text-navy/40">
          {faq.q}
        </span>
        <span
          aria-hidden
          className="mt-0.5 shrink-0 font-mono text-[13px] leading-none text-gold/50 transition-transform duration-200"
          style={{ transform: open ? 'rotate(45deg)' : 'none' }}
        >
          +
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="a"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <p className="pb-4 font-body text-sm leading-relaxed text-navy/55">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StepRow({
  step,
  isLast,
  delay,
  reducedMotion,
}: {
  step: Step
  isLast: boolean
  delay: number
  reducedMotion: boolean
}) {
  const dur = reducedMotion ? 0 : 1
  const d = reducedMotion ? 0 : delay

  return (
    <div
      id={step.id}
      className={`grid grid-cols-1 gap-10 py-16 lg:grid-cols-[80px_1fr_280px] lg:gap-16${
        isLast ? '' : ' border-b border-[rgba(0,30,80,0.05)]'
      }`}
    >
      {/* Step number — thread anchor circle */}
      <div className="flex items-start lg:flex-col lg:items-center lg:pt-2">
        <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-warm-white ring-1 ring-gold/25">
          <span className="font-mono text-[9px] tracking-[0.12em] text-gold/55">{step.num}</span>
        </div>
      </div>

      {/* Title + body + CTA + FAQ */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 * dur, ease: SPRING, delay: d }}
      >
        <h2 className="mb-4 font-display text-display-sm font-light text-navy leading-tight">
          {step.title}
        </h2>
        <p className="font-body text-body-md leading-relaxed text-navy/65">{step.body}</p>

        {step.cta && (
          <Link
            href={step.cta.href}
            className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold transition-colors hover:text-gold-hover"
          >
            <span aria-hidden className="h-px w-4 bg-current" />
            {step.cta.label}
          </Link>
        )}

        {step.faqs && step.faqs.length > 0 && (
          <div className="mt-6">
            {step.faqs.map((faq, i) => (
              <FaqAccordion key={i} faq={faq} />
            ))}
          </div>
        )}
      </motion.div>

      {/* Data block — promoted */}
      <motion.div
        className="flex flex-col gap-5 lg:border-l-2 lg:border-gold/20 lg:pl-10 lg:pt-1"
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.4 * dur, ease: EASE_OUT, delay: d + (reducedMotion ? 0 : 0.1) }}
      >
        {step.data.map((d) => (
          <div key={d.label}>
            <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.15em] text-gold/50">
              {d.label}
            </p>
            <p className="font-body text-[0.9375rem] font-medium leading-snug text-navy/80">
              {d.value}
            </p>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export function AnimatedProcessSteps({ phases }: AnimatedProcessStepsProps) {
  const shouldReduceMotion = useReducedMotion()
  let globalIdx = 0

  return (
    <div>
      {phases.map((phase, pi) => (
        <div key={phase.id} className={pi > 0 ? 'mt-20' : ''}>
          {/* Phase header */}
          <motion.div
            className="mb-2 flex items-center gap-4"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
          >
            <div className="h-px flex-1 bg-gold/15" />
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-[9px] uppercase tracking-[0.20em] text-gold/55">
                {phase.label}
              </span>
              <span className="font-mono text-[9px] text-navy/20">·</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-navy/30">
                {phase.sublabel}
              </span>
            </div>
            <div className="h-px flex-1 bg-gold/15" />
          </motion.div>

          {/* Steps — with vertical gold thread on desktop */}
          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute hidden lg:block"
              style={{
                left: '39px',
                top: '28px',
                bottom: '28px',
                width: '1px',
                background:
                  'linear-gradient(to bottom, rgba(196,147,63,0.18), rgba(196,147,63,0.08))',
              }}
            />
            {phase.steps.map((step, si) => {
              const delay = 0.04 * globalIdx
              globalIdx++
              return (
                <StepRow
                  key={step.num}
                  step={step}
                  isLast={si === phase.steps.length - 1}
                  delay={delay}
                  reducedMotion={shouldReduceMotion ?? false}
                />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
