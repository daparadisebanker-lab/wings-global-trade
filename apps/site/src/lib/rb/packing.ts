// src/lib/rb/packing.ts — RE-EXPORT SHIM (RB Console Wave 0, SPEC R6).
// The ALLOCATION packing math moved to @wings/rb-core so apps/site and apps/tower
// share one implementation. This shim preserves the original import path
// (`@/lib/rb/packing`) for existing callers unchanged; the public surface is
// identical to the original. Re-point callers at @wings/rb-core opportunistically.
export { cascadeForSlots, slotsForQuantity, slotsRemaining, fmt } from '@wings/rb-core'
export type { PackingCascade, QuantityConversion } from '@wings/rb-core'
