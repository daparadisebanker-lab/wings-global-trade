'use client'

// MagneticButton is a named alias for MagneticWrapper — kept for backwards compatibility.
// magnetRadius / magnetStrength props are intentionally dropped; callers should migrate to
// MagneticWrapper's strength / radius props if they need to tune behaviour.
export { MagneticWrapper as MagneticButton } from '@/components/ui/MagneticWrapper'
