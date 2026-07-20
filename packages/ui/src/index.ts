// @wings/trade-ui — the frozen skeleton organs.
// Pure TypeScript/React, token-styled, react peer-dep. This package MUST NOT
// import from apps/* (enforced by lint). Each organ renders correctly from tokens
// alone (verified by the swap test, ecosystem §4 QA-6).

export { SpecSheet } from './organs/SpecSheet'
export { TrustFooter } from './organs/TrustFooter'
export { RFQFlow } from './organs/RFQFlow'
export type { RFQFlowProps } from './organs/RFQFlow'
export { FillMeter } from './organs/FillMeter'
export type { FillMeterProps } from './organs/FillMeter'
export { useRFQForm } from './hooks/useRFQForm'
export type { RFQLeadRequest, RFQSubmitResult } from './hooks/useRFQForm'
export type {
  TrustFooterProps,
  FooterCategory,
  FooterLink,
  FooterZone,
} from './organs/TrustFooter'

// UI primitives (M3b) — the app re-exports these from components/ui/*.
export { Input } from './primitives/Input'
export { Textarea } from './primitives/Textarea'
export { Select } from './primitives/Select'
export { Button } from './primitives/Button'
export { ToastProvider, useToast } from './primitives/Toast'

// Shared UI primitives the organs are built from (exported for reuse/testing).
export { useReducedMotion } from './hooks/useReducedMotion'
export { surfaceCardVariants } from './motion/surface'
export { cn } from './lib/cn'

// Diagram organs (RB Console Wave 0) — the parametric technical-drawing family,
// shared by apps/site and apps/tower. See organs/diagrams/*.
export { PackingDiagram } from './organs/diagrams/PackingDiagram'
export type { PackingSpec } from './organs/diagrams/PackingDiagram'
export { ExplodedDiagram } from './organs/diagrams/ExplodedDiagram'
export { PalletDiagram } from './organs/diagrams/PalletDiagram'
export type { PalletSpec } from './organs/diagrams/PalletDiagram'
export { ContainerSliceDiagram } from './organs/diagrams/ContainerSliceDiagram'
export type { ContainerSliceDiagramProps } from './organs/diagrams/ContainerSliceDiagram'
export { ContainerFitDiagram } from './organs/diagrams/ContainerFitDiagram'
export { TechDraw } from './organs/diagrams/TechDraw'
export { isoBox, isoCanvas, isoPoint, isoPt } from './organs/diagrams/iso'
export type { IsoOrigin, IsoBoxFaces } from './organs/diagrams/iso'
export { CONTAINER_KINDS } from './organs/diagrams/containerSpecs'
export type { ContainerKindSpec, FitResult } from './organs/diagrams/containerSpecs'
