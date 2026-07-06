// @wings/trade-ui — the frozen skeleton organs.
// Pure TypeScript/React, token-styled, react peer-dep. This package MUST NOT
// import from apps/* (enforced by lint). Each organ renders correctly from tokens
// alone (verified by the swap test, ecosystem §4 QA-6).

export { SpecSheet } from './organs/SpecSheet'
export { TrustFooter } from './organs/TrustFooter'
export type {
  TrustFooterProps,
  FooterCategory,
  FooterLink,
  FooterZone,
} from './organs/TrustFooter'

// Shared UI primitives the organs are built from (exported for reuse/testing).
export { useReducedMotion } from './hooks/useReducedMotion'
export { surfaceCardVariants } from './motion/surface'
