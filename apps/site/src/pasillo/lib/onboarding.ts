// The teaching layer's content and its memory. No components here — copy
// changes must never require touching a component, which is also what makes
// this translatable when the lane reaches Phase 5 and needs EN.
//
// WHAT WAS FIXED INSTEAD OF TAUGHT, because a tour is a tax paid for an
// interface that failed to explain itself, and the honest move is to pay less:
//
//   · "Which format?" became /formatos — a comparison built from real packing
//     arithmetic. It is a missing tool, not a missing explanation; a step
//     anchored to the format chips would have taught the location of a control
//     the buyer had already found.
//   · The muestrario and Trade Desk empty states already teach their own next
//     action, so no step spends itself on either. Every empty state in a
//     product is a free onboarding slot, and these two were already taken.
//   · Pasar / Guardar serie are named buttons in the thumb zone, so a
//     first-timer succeeds without ever learning the swipe. The swipe is an
//     accelerator, and accelerators are taught by hints, not by tours.
//
// What is left is a genuine sequence — walk, save, resolve — where order
// matters and one thing is truly non-obvious: a save takes the WHOLE series.
// That is three steps, which is the mobile ceiling, and this catalogue is
// thumb-first at 390px.

export const TOUR_VERSION = 1

export interface TourStep {
  id: string
  /** data-tour attribute value. Never a class or a DOM path: class names change
   *  under refactor and take the tour with them, silently. */
  target: string
  title: string
  body: string
  /** Skip silently when the target is absent rather than pointing at nothing. */
  optional?: boolean
}

/**
 * Three steps, in the order the task actually happens — the only justification
 * for forcing a sequence at all. No welcome step: it would spend the buyer's
 * highest-attention moment saying nothing.
 */
export const AISLE_TOUR: { id: string; version: number; steps: TourStep[] } = {
  id: 'azulejos-aisle',
  version: TOUR_VERSION,
  steps: [
    {
      id: 'walk',
      target: 'lane-actions',
      title: 'Una serie por pantalla',
      body: 'Pasa las que no sirven. Guarda las que sí. Puedes volver a cualquiera.',
    },
    {
      id: 'whole-series',
      target: 'lane-collect',
      title: 'Guardar toma la serie entera',
      body: 'Con todos sus diseños marcados. En el muestrario quitas los que no van.',
    },
    {
      id: 'record',
      target: 'record-tab',
      title: 'El muestrario hace las cuentas',
      body: 'Indica cantidades y salen m², cajas, kilos y cuánto contenedor ocupan.',
      optional: true,
    },
  ],
}

// ── Persistence ────────────────────────────────────────────────────────────
// localStorage only, and that is a real limitation worth naming: this site has
// no accounts, so the tour reappears on a new device or a cleared browser. When
// TOWER brings authenticated buyers, this moves server-side and localStorage
// becomes the anonymous fallback — the key format below is already the one that
// migration wants.
//
// Version lives IN the key so "show it again after the aisle changes" is a
// constant bump rather than a migration. Bump it only when the thing being
// taught actually changed; re-showing a completed tour after an unrelated
// release is how a teaching channel gets trained into noise.

export type TourOutcome = 'completed' | 'skipped' | 'dismissed'

interface TourRecord {
  status: TourOutcome
  lastStep: number
  at: string
}

const key = (id: string, version: number) => `onboarding:${id}:v${version}`

/** Outcome, or null when this version has never been resolved. Client-only. */
export function readTour(id: string, version: number): TourRecord | null {
  try {
    const raw = localStorage.getItem(key(id, version))
    if (!raw) return null
    const p: unknown = JSON.parse(raw)
    if (typeof p === 'object' && p !== null && typeof (p as TourRecord).status === 'string') {
      return p as TourRecord
    }
    return null
  } catch {
    return null
  }
}

/** Record the OUTCOME, not merely that it was seen — skipped and completed
 *  deserve different futures, and "where they left" is the only signal that
 *  says which step is the bad one. */
export function writeTour(
  id: string,
  version: number,
  status: TourOutcome,
  lastStep: number,
): void {
  try {
    const rec: TourRecord = { status, lastStep, at: new Date().toISOString() }
    localStorage.setItem(key(id, version), JSON.stringify(rec))
  } catch {
    // Storage blocked (Safari private mode). The tour simply runs again next
    // visit; it must never throw into the aisle.
  }
}

// ── Hints ──────────────────────────────────────────────────────────────────
// A hint differs from clutter by having a RETIREMENT CONDITION. Each of these
// disappears permanently the moment the buyer demonstrates the knowledge, so
// nobody is lectured about something they are already doing.

// One hint, deliberately. A second was drafted for the swipe gesture and cut:
// Pasar and Guardar serie are named buttons in the thumb zone, so the swipe is
// an accelerator, and a permanent note about an accelerator on the most
// space-constrained screen in the product is clutter with a retirement date.
export type HintId = 'formato'

export function readHint(id: HintId): boolean {
  try {
    return localStorage.getItem(`onboarding:hint:${id}`) === 'retired'
  } catch {
    return false
  }
}

export function retireHint(id: HintId): void {
  try {
    localStorage.setItem(`onboarding:hint:${id}`, 'retired')
  } catch {
    /* storage blocked — the hint stays for this session only */
  }
}

/** Clears the record so the tour runs again. The way back in — a teaching layer
 *  with no replay path fails exactly the buyer who wanted it. */
export function replayTour(id: string, version: number): void {
  try {
    localStorage.removeItem(key(id, version))
  } catch {
    /* storage blocked; the tour would run again anyway */
  }
}
