// @wings/trade-ui — reduced-motion hook.
// Self-contained copy of the app hook (framer wrapper with a safe default) so the
// package never imports from apps/*. Behavior byte-identical.
'use client'
import { useReducedMotion as useFramerReducedMotion } from 'framer-motion'

export function useReducedMotion(): boolean {
  return useFramerReducedMotion() ?? false
}
