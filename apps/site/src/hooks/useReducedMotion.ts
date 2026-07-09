// src/hooks/useReducedMotion.ts
// Wrapper around Framer Motion's useReducedMotion with a safe default.
// Source: spec/contributions/animator.md §4
'use client'
import { useReducedMotion as useFramerReducedMotion } from 'framer-motion'

export function useReducedMotion(): boolean {
  return useFramerReducedMotion() ?? false
}
