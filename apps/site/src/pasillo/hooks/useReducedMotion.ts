'use client'

// La Escalera — reduced-motion, without pulling in an animation library.
//
// @wings/trade-ui exports a `useReducedMotion`, but it is a thin wrapper around
// framer-motion's. Importing it here would drag framer-motion back onto the deck
// route, which is the one thing lib/spring.ts exists to avoid. Same behaviour,
// same safe default, one media query — this is not a fork of a shared organ,
// it is the same hook without the dependency the deck is shedding.

import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

export function useReducedMotion(): boolean {
  // Default false so the server render and the first client render agree; the
  // effect corrects it before any card can be thrown.
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    setReduced(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}
