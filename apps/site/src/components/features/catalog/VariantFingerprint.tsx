// src/components/features/catalog/VariantFingerprint.tsx
'use client'

// VARIANT MORPHING — the spec diff made visual.
//
// When you switch KAMA variants, the fingerprint should *morph* between shapes
// rather than cut. You feel which axes change before you read the numbers.
//
// SpecFingerprint already declares `transition: d 400ms ease-in-out` on its
// polygon, so as long as the same <path> node persists across a specs change,
// the browser interpolates the path data for us. This wrapper's only job is to
// decide whether the platform can honour that:
//   - If CSS `d` path transitions are supported → keep the node mounted (stable
//     `key`) so the morph runs.
//   - If not → bump the `key` on specs change to force a clean remount (snap).

import { useEffect, useRef, useState } from 'react'
import { SpecFingerprint } from './SpecFingerprint'

interface VariantFingerprintProps {
  specs: Record<string, unknown>
  previousSpecs?: Record<string, unknown>
  seed?: string
  size?: number
  className?: string
  showLabels?: boolean
}

/**
 * Feature-detect animatable CSS `d`. `CSS.supports('transition-property', 'd')`
 * is the cleanest signal that the engine treats `d` as an animatable property
 * (Chromium/WebKit yes, Firefox historically no). Defaults to false on the
 * server so SSR markup is the no-animation branch, then upgrades on mount.
 */
function supportsPathTransition(): boolean {
  if (typeof window === 'undefined' || typeof window.CSS?.supports !== 'function') return false
  try {
    return (
      window.CSS.supports('transition-property', 'd') ||
      window.CSS.supports('(d: path("M0 0"))')
    )
  } catch {
    return false
  }
}

export function VariantFingerprint({
  specs,
  previousSpecs,
  seed = 'wings',
  size = 120,
  className,
  showLabels = false,
}: VariantFingerprintProps) {
  const [canMorph, setCanMorph] = useState(false)
  const remountKey = useRef(0)
  const lastSpecsRef = useRef<Record<string, unknown> | undefined>(previousSpecs)

  useEffect(() => {
    setCanMorph(supportsPathTransition())
  }, [])

  // When morphing is unavailable, changing specs bumps the remount counter so a
  // fresh node snaps in. When morphing is available the key stays constant and
  // the single persistent node interpolates its `d`.
  if (lastSpecsRef.current !== specs) {
    if (!canMorph) remountKey.current += 1
    lastSpecsRef.current = specs
  }

  return (
    <SpecFingerprint
      key={canMorph ? 'morph' : `snap-${remountKey.current}`}
      specs={specs}
      seed={seed}
      size={size}
      className={className}
      showLabels={showLabels}
    />
  )
}
