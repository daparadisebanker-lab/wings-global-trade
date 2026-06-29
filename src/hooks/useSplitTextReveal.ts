'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(SplitText, ScrollTrigger)

interface UseSplitTextRevealOptions {
  type?: 'lines' | 'words'
  trigger?: 'scroll' | 'mount'
  delay?: number
  stagger?: number
  duration?: number
}

export function useSplitTextReveal<T extends HTMLElement>(
  options: UseSplitTextRevealOptions = {},
) {
  const {
    type = 'lines',
    trigger = 'mount',
    delay = 0.1,
    stagger = 0.08,
    duration = 0.75,
  } = options

  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const split = new SplitText(el, { type })
    const targets = type === 'words' ? split.words : split.lines

    // Wrap each target in overflow:hidden for baseline clip masking.
    // Track wrappers explicitly — split.revert() only removes split spans, not these.
    const wrappers: HTMLSpanElement[] = []
    targets.forEach((target) => {
      const wrapper = document.createElement('span')
      wrapper.style.cssText = 'display:block;overflow:hidden;'
      target.parentNode?.insertBefore(wrapper, target)
      wrapper.appendChild(target)
      wrappers.push(wrapper)
    })

    const fromVars: gsap.TweenVars = {
      y: '110%',
      duration,
      stagger,
      ease: 'power3.out',
    }

    const ctx = gsap.context(() => {
      if (trigger === 'scroll') {
        gsap.from(targets, {
          ...fromVars,
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
        })
      } else {
        gsap.from(targets, { ...fromVars, delay })
      }
    }, el)

    return () => {
      ctx.revert()
      // Unwrap before split.revert() — prevents orphaned overflow:hidden spans in the DOM
      wrappers.forEach((wrapper) => {
        while (wrapper.firstChild) {
          wrapper.parentNode?.insertBefore(wrapper.firstChild, wrapper)
        }
        wrapper.remove()
      })
      split.revert()
    }
  }, [type, trigger, delay, stagger, duration])

  return ref
}
