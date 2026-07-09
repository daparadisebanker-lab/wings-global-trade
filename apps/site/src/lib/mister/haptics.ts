// src/lib/mister/haptics.ts
// Web Vibration API wrapper — works on Android Chrome; silently no-ops on iOS Safari
// (iOS does not support navigator.vibrate). Respects prefers-reduced-motion.

type HapticPattern = number | number[]

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const haptic = (pattern: HapticPattern): void => {
  if (typeof navigator === 'undefined') return
  if (!('vibrate' in navigator)) return
  if (prefersReducedMotion()) return
  try {
    navigator.vibrate(pattern)
  } catch {
    // Some browsers block vibrate() — fail silently
  }
}

// ─── Named patterns — calibrated so sub-threshold pulses are sensed, not noticed ───

export const HAPTIC = {
  // Sub-threshold — ambient awareness
  chip:          (): void => haptic(8),
  light:         (): void => haptic(10),
  exit:          (): void => haptic(8),
  stageExpand:   (): void => haptic(10),

  // Threshold — clear confirmation
  medium:        (): void => haptic([15, 10, 15]),
  profileTap:    (): void => haptic(12),
  stageAdvance:  (): void => haptic([15, 5, 15]),
  whatsapp:      (): void => haptic([15, 10, 15]),

  // Form lifecycle
  formSubmit:    (): void => haptic([20, 10, 20, 10, 40]),

  // Error / failure
  error:         (): void => haptic([30, 10, 30]),

  // Confirmations
  confirm:       (): void => haptic([20, 10, 20]),
  fieldCapture:  (): void => haptic([8, 4, 8]),

  // Thinking state — fire-and-forget rhythm while Mister generates
  thinkingStart: (): void => haptic(6),
  thinkingPulse: (): void => haptic(4),
  thinkingEnd:   (): void => haptic([8, 6, 12]),
} as const
