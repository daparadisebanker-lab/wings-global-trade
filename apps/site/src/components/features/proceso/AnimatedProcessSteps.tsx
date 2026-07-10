'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { EASE_OUT, SPRING } from '@/lib/motion'

gsap.registerPlugin(ScrollTrigger)

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
  /** GRANO panel plate (site-graded webp) shown on the desktop phase card. */
  plate?: string
  steps: Step[]
}

interface AnimatedProcessStepsProps {
  phases: Phase[]
}

// ─── Shared sub-components ────────────────────────────────────────────────────

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

// ─── Desktop: horizontal track cards ─────────────────────────────────────────

function PhaseIntroCard({ phase }: { phase: Phase }) {
  if (phase.plate) {
    // Section-entry panel: the GRANO plate is the ground (full-bleed, hard
    // panel edges), type sits on the plate's own shadow pole via the scrim.
    return (
      <div className="relative flex min-w-[440px] shrink-0 basis-[440px] flex-col justify-end self-stretch overflow-hidden">
        {/* sizes overshoots the 440px slot: object-cover fills the full track
            height, so the needed source width is height-driven (~720 CSS px) */}
        <Image
          src={phase.plate}
          alt=""
          aria-hidden
          fill
          className="object-cover"
          sizes="720px"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#000C1F]/90 via-[#000C1F]/40 to-transparent"
        />
        <div className="relative p-10 pb-14">
          <p className="font-mono text-[9px] uppercase tracking-[0.20em] text-gold/80">
            {phase.label}
          </p>
          <p className="mt-3 font-display text-display-sm font-light text-warm-white leading-tight">
            {phase.sublabel}
          </p>
          <div className="mt-5 h-px w-10 bg-gold/40" />
          <p className="mt-3 font-mono text-[10px] tracking-[0.06em] text-warm-white/45">
            {phase.steps.length} {phase.steps.length === 1 ? 'paso' : 'pasos'}
          </p>
        </div>
      </div>
    )
  }
  return (
    <div className="flex min-w-[360px] shrink-0 flex-col justify-center pr-16">
      <p className="font-mono text-[9px] uppercase tracking-[0.20em] text-gold/50">{phase.label}</p>
      <p className="mt-2 font-display text-display-sm font-light text-navy leading-tight">
        {phase.sublabel}
      </p>
      <div className="mt-5 h-px w-10 bg-gold/25" />
      <p className="mt-3 font-mono text-[10px] tracking-[0.06em] text-navy/30">
        {phase.steps.length} {phase.steps.length === 1 ? 'paso' : 'pasos'}
      </p>
    </div>
  )
}

function HorizontalStepCard({ step, phaseLabel }: { step: Step; phaseLabel: string }) {
  return (
    <div className="flex min-w-[620px] shrink-0 flex-col justify-center border-l border-[rgba(0,30,80,0.06)] px-14">
      <div className="mb-7 flex items-center gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F8F6F0] ring-1 ring-gold/25">
          <span className="font-mono text-[9px] tracking-[0.12em] text-gold/55">{step.num}</span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-navy/25">
          {phaseLabel}
        </span>
      </div>
      <h2 className="mb-4 max-w-[360px] font-display text-display-sm font-light text-navy leading-tight">
        {step.title}
      </h2>
      <p className="max-w-[380px] font-body text-body-md leading-relaxed text-navy/65">{step.body}</p>
      <div className="mt-7 grid grid-cols-2 gap-5 border-t border-[rgba(0,30,80,0.05)] pt-6">
        {step.data.map((d) => (
          <div key={d.label}>
            <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.15em] text-gold/50">
              {d.label}
            </p>
            <p className="font-body text-sm font-medium leading-snug text-navy/80">{d.value}</p>
          </div>
        ))}
      </div>
      {step.cta && (
        <Link
          href={step.cta.href}
          className="mt-6 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold transition-colors hover:text-gold-hover"
        >
          <span aria-hidden className="h-px w-4 bg-current" />
          {step.cta.label}
        </Link>
      )}
    </div>
  )
}

// ─── Mobile: vertical step row (original layout) ─────────────────────────────

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
      className={`grid grid-cols-1 gap-10 py-16${isLast ? '' : ' border-b border-[rgba(0,30,80,0.05)]'}`}
    >
      <div className="flex items-start gap-4">
        <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F8F6F0] ring-1 ring-gold/25">
          <span className="font-mono text-[9px] tracking-[0.12em] text-gold/55">{step.num}</span>
        </div>
      </div>

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

      <motion.div
        className="flex flex-col gap-5 border-t border-[rgba(0,30,80,0.05)] pt-6"
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

// ─── Main export ──────────────────────────────────────────────────────────────

export function AnimatedProcessSteps({ phases }: AnimatedProcessStepsProps) {
  const shouldReduceMotion = useReducedMotion()
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  // Unique ID per instance (avoids collision when two instances are on the page)
  const stId = useRef(`h-proc-${phases[0].id}`)

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    const mm = gsap.matchMedia()

    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        gsap.to(track, {
          x: () => -(track.scrollWidth - section.offsetWidth),
          ease: 'none',
          scrollTrigger: {
            id: stId.current,
            trigger: section,
            pin: true,
            pinSpacing: true,
            scrub: 1,
            start: 'top top',
            end: () => `+=${track.scrollWidth - section.offsetWidth}`,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (progressRef.current) {
                gsap.set(progressRef.current, { scaleX: self.progress })
              }
            },
          },
        })
      }, section)

      return () => {
        ScrollTrigger.getById(stId.current)?.kill()
        ctx.revert()
      }
    })

    return () => mm.revert()
  }, [])

  let globalIdx = 0

  return (
    <>
      {/* ─── Desktop: horizontal pinned section ────────────────────────────── */}
      <div
        ref={sectionRef}
        className="relative hidden overflow-hidden bg-[#F8F6F0] lg:block"
        style={{ height: '100svh' }}
      >
        <div
          ref={trackRef}
          className="flex h-full items-center"
          style={{ paddingLeft: '8vw', willChange: 'transform' }}
        >
          {phases.map((phase, pi) => (
            <Fragment key={phase.id}>
              {pi > 0 && (
                <div className="mx-10 h-[38%] w-px shrink-0 bg-gold/15" />
              )}
              <PhaseIntroCard phase={phase} />
              {phase.steps.map((step) => (
                <HorizontalStepCard key={step.id} step={step} phaseLabel={phase.label} />
              ))}
            </Fragment>
          ))}
          {/* Trailing spacer ensures last card can fully enter view */}
          <div className="shrink-0" style={{ minWidth: '8vw' }} />
        </div>

        {/* Gold progress line — scrubbed by ScrollTrigger onUpdate */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-navy/8">
          <div ref={progressRef} className="h-full origin-left bg-gold/40" style={{ transform: 'scaleX(0)' }} />
        </div>
      </div>

      {/* ─── Mobile: original vertical layout ──────────────────────────────── */}
      <div className="bg-[#F8F6F0] px-6 pt-16 pb-16 md:px-10 md:pt-20 md:pb-20 lg:hidden">
        <div className="mx-auto max-w-6xl">
          {phases.map((phase, pi) => (
            <div key={phase.id} className={pi > 0 ? 'mt-20' : ''}>
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
              >
                {phase.plate ? (
                  <div className="relative mb-2 flex h-44 flex-col justify-end overflow-hidden">
                    <Image
                      src={phase.plate}
                      alt=""
                      aria-hidden
                      fill
                      className="object-cover"
                      sizes="100vw"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#000C1F]/90 via-[#000C1F]/40 to-transparent"
                    />
                    <div className="relative flex items-center gap-2.5 p-5">
                      <span className="font-mono text-[9px] uppercase tracking-[0.20em] text-gold/80">
                        {phase.label}
                      </span>
                      <span className="font-mono text-[9px] text-warm-white/30">·</span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-warm-white/60">
                        {phase.sublabel}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-2 flex items-center gap-4">
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
                  </div>
                )}
              </motion.div>

              <div className="relative">
                <div
                  aria-hidden
                  className="pointer-events-none absolute"
                  style={{
                    left: '13px',
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
      </div>
    </>
  )
}
