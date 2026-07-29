'use client'

// One media query, SSR-safe, no dependency — the same shape as
// useReducedMotion next door and for the same reason: the deck route is
// deliberately shedding libraries, and a hook that reads matchMedia is nine
// lines.
//
// It ALWAYS returns false on the server and on the first client render, and
// corrects in an effect. That is not a limitation to work around: a hook that
// guessed `true` during SSR would render the desktop branch into HTML and then
// tear it down on a phone, which is a hydration mismatch on the one route where
// the speed is the product. Every consumer must therefore be a progressive
// enhancement — the false branch has to be a complete, correct UI on its own.

import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(query)
    setMatches(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/** The width at which the aisle stops being one column and can hold a booth and
 *  a spec panel side by side. Same 1024 as the `lg` step the rest of the aisle's
 *  desktop layout hangs off — stated here as a constant so the JS branch and the
 *  CSS breakpoint cannot drift apart. */
export const SPLIT_QUERY = '(min-width: 1024px)'
