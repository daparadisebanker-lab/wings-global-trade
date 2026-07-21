// The Mister capability registry. Adding a capability = import it and add it to
// this array (plus a renderer in the dock's renderer map). Nothing else changes.
//
// INTEGRATION NOTE (parallel builds): capability authors create their own file
// under ./capabilities/ and their own renderer component; the registry line and
// the renderer-map line are wired by the integrator so parallel work never
// collides on this file.

import type { Capability } from './types'
import { containerFitCapability } from './capabilities/container-fit'
import { landedCostCapability } from './capabilities/landed-cost'
import { reverseQuoteCapability } from './capabilities/reverse-quote'
import { supplierScreenshotCapability } from './capabilities/supplier-screenshot'
import { proposalDraftCapability } from './capabilities/proposal-draft'

export const CAPABILITIES: Capability[] = [
  containerFitCapability,
  landedCostCapability,
  reverseQuoteCapability,
  supplierScreenshotCapability,
  proposalDraftCapability,
]
