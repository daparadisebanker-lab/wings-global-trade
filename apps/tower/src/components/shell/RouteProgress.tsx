'use client'

import { useEffect, useRef, useState } from 'react'
import { useIsFetching } from '@tanstack/react-query'
import { cn } from '@wings/trade-ui'

/**
 * The global activity rail — a 2px gold line pinned to the top edge of the shell
 * that advances while any query is in flight and settles out when the room is
 * quiet. This is TOWER's one honest loading affordance: an *instrument
 * indicator*, not skeleton wallpaper (DESIGN_SYSTEM refuses shimmer — "panels
 * appear laid-out or not at all"). It answers the one question a blank board
 * can't: is the room still working, or is this all there is?
 *
 * Behaviour: eases toward a 90% stall while fetching (so it reads as progress,
 * never as a fixed value it can't know), snaps to 100% and fades on settle.
 * Reduced-motion keeps the state changes but drops the width easing.
 */
export function RouteProgress() {
  const fetching = useIsFetching()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const trickle = useRef<ReturnType<typeof setInterval> | null>(null)
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (fetching > 0) {
      if (settle.current) {
        clearTimeout(settle.current)
        settle.current = null
      }
      setVisible(true)
      setProgress((p) => (p < 8 ? 8 : p)) // jump in so the rail is felt immediately
      if (!trickle.current) {
        trickle.current = setInterval(() => {
          setProgress((p) => (p >= 90 ? p : p + (90 - p) * 0.18))
        }, 200)
      }
    } else {
      if (trickle.current) {
        clearInterval(trickle.current)
        trickle.current = null
      }
      if (visible) {
        setProgress(100)
        settle.current = setTimeout(() => {
          setVisible(false)
          setProgress(0)
        }, 260)
      }
    }
  }, [fetching, visible])

  // Tear down timers only on unmount.
  useEffect(
    () => () => {
      if (trickle.current) clearInterval(trickle.current)
      if (settle.current) clearTimeout(settle.current)
    },
    [],
  )

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px]">
      <div
        className={cn('tower-progress-bar h-full bg-gold', visible ? 'opacity-100' : 'opacity-0')}
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
