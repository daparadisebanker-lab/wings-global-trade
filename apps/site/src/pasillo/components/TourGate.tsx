'use client'

// Decides whether the tour runs, and loads it only if so.
//
// LAZY, because most buyers have already learned this aisle and none of them
// should pay for a teaching layer in the bundle of a page they understand. The
// gate is a few lines of persistence read; the sheet, the spotlight and the
// content arrive in a separate chunk that a returning buyer never requests.
//
// The gate is also the queue. One teaching layer at a time is a hard rule — a
// tour stacked under a hint is two things asking for the same attention — and
// keeping the decision in one component is what makes that enforceable when the
// second layer arrives.

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { AISLE_TOUR, readTour } from '@/pasillo/lib/onboarding'

const Tour = dynamic(() => import('@/pasillo/components/Tour').then((m) => m.Tour), {
  ssr: false,
})

/**
 * @param ready lift until the aisle's data has resolved and painted. Starting on
 *   mount is the #1 tour bug: the spotlight measures targets that do not exist
 *   yet and lands on the wrong coordinates, or on nothing.
 */
export function TourGate({ ready }: { ready: boolean }) {
  const [run, setRun] = useState(false)

  useEffect(() => {
    if (!ready) return
    // Read persistence in an effect, never during render: the server has no
    // localStorage and a read at render time is a hydration mismatch.
    if (readTour(AISLE_TOUR.id, AISLE_TOUR.version)) return

    // 700ms after the aisle settles. Instant teaching reads as a popup — the
    // buyer has not seen the page it is talking about yet.
    const t = window.setTimeout(() => setRun(true), 700)
    return () => window.clearTimeout(t)
  }, [ready])

  if (!run) return null
  return <Tour onEnd={() => setRun(false)} />
}
