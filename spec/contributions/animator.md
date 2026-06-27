# Mister — Animator Contribution
**Role:** Animator
**Standard:** Awwwards Site of the Year
**Library:** Framer Motion ^11 (installed)
**Date:** June 2026
**Status:** Load-bearing motion decisions. Every pattern includes production-ready Framer Motion variant objects. No decoration. No hedging.

---

## DESIGN CONTRACT — READ BEFORE IMPLEMENTING

The designer has established the governing thesis: **"A certified trade document that happens to respond in real time."** The brand strategist confirms: **"Expert. Direct. Commercial."**

Motion must serve both. The test for any animation:

> If this motion were performed by a person laying a document on a desk, would a senior import specialist find it appropriate?

Passing motion: deliberate, weighted, final. A document placed. A table revealed. A stamp applied.
Failing motion: bouncy ease, playful spring, overshoot, elastic, or any animation that says "I am a friendly chatbot."

**What the existing canvas animations establish (respect these):**

- `MisterWaveform` (`useMisterWaveform`): three superimposed gold sine waves, `rgba(196,147,63,0.35)`, amplitude lerps between 0 (streaming) and BASE_AMPLITUDE (idle). At rest the waveform breathes at amplitude 8. During streaming it collapses to near-zero — the signal goes flat while Mister thinks, then returns. This is the only ambient animation in the system. Do not add particle fields, shimmer effects, or any other ambient motion layer. The waveform is sufficient and already correct.

---

## 1. Motion Personality — Three Words

**Deliberate. Weighted. Final.**

- **Deliberate:** Motion never starts without cause. Every element appears because something was decided, not to fill time.
- **Weighted:** Objects have mass. The window arrives from below because gravity. Documents don't float in.
- **Final:** Exits are conclusive. When Mister closes, it is closed — no linger, no fade-to-transparent.

---

## 2. Easing Signature

All cubic-bezier values are named and exported from a single source of truth: `src/lib/mister/motion.ts`.

### The Seven Easings

```
EASE_MESSAGE_APPEAR:     cubic-bezier(0.20, 0.00, 0.00, 1.00)
EASE_QUICK_ACTION:       cubic-bezier(0.16, 1.00, 0.30, 1.00)
EASE_WINDOW_OPEN:        cubic-bezier(0.22, 1.00, 0.36, 1.00)
EASE_WINDOW_CLOSE:       cubic-bezier(0.55, 0.00, 1.00, 0.45)
EASE_SURFACE_SLIDE:      cubic-bezier(0.20, 0.00, 0.00, 1.00)
EASE_TYPING_INDICATOR:   cubic-bezier(0.45, 0.05, 0.55, 0.95)
EASE_STREAMING_TEXT:     cubic-bezier(0.00, 0.00, 0.20, 1.00)
```

### Rationale

- `EASE_MESSAGE_APPEAR` — Fast initial acceleration, near-zero terminal deceleration. The document arrives quickly and parks with precision. No overshoot.
- `EASE_QUICK_ACTION` — Aggressive deceleration tail (0.30, 1.00). Quick-action buttons snap in as if placed on a desk surface. The fast mid-section means they appear before the eye expects them.
- `EASE_WINDOW_OPEN` — The window open is the most dramatic motion in the system. Very fast rise (0.22, 1.00), long deceleration (0.36, 1.00). The window arrives with momentum and settles with authority.
- `EASE_WINDOW_CLOSE` — Inverse. Slow start, fast exit. The specialist picks up the document and removes it quickly. There is no ceremony in closing.
- `EASE_SURFACE_SLIDE` — Identical to message appear. Surface cards (ProductCard, Waterfall, ComparisonView) behave exactly like documents — they don't have a special easing that makes them feel "card-like."
- `EASE_TYPING_INDICATOR` — Symmetric ease-in-out. The thinking dots pulse with physiological rhythm, not mechanical tick.
- `EASE_STREAMING_TEXT` — Near-zero initial ease, gentle exit. Each token appears with almost no entry delay — text should feel like it is being written, not arriving in packets.

---

## 3. Duration Scale

```typescript
// src/lib/mister/motion.ts

export const DURATION = {
  instant:    80,   // State indicator transitions (archetype dot, session ref color)
  micro:     120,   // Border-color hover transitions, send arrow color
  quick:     160,   // Quick-action hover/press feedback
  standard:  220,   // Message appear (user), quick-action reveal
  deliberate:300,   // Message appear (assistant), surface card slide-in
  window:    380,   // MisterWindow open/close — the full weight of the document arriving
  waterfall: 480,   // LandedCostWaterfall bar build — the signature moment, unhurried
  stagger:    40,   // Per-item stagger offset for quick-actions and waterfall bars
} as const
```

**Rules:**
- Nothing exceeds `waterfall` (480ms). The waterfall earns the longest duration because it is the signature moment.
- `window` (380ms) is the next longest. The window arrival communicates authority through duration.
- `micro` (120ms) for all CSS transition properties (border-color, background-color, color) — matches the designer's `0.15s ease` specification precisely.
- No animation below `instant` (80ms) — below this threshold motion becomes noise.

---

## 4. prefers-reduced-motion — System-Wide Strategy

All Framer Motion variants include a `reducedMotion` guard. The pattern is applied once at the provider level and accessed via a hook.

### Hook

```typescript
// src/hooks/useReducedMotion.ts
'use client'
import { useReducedMotion as useFramerReducedMotion } from 'framer-motion'

export function useReducedMotion(): boolean {
  return useFramerReducedMotion() ?? false
}
```

### Fallback principle

When `prefers-reduced-motion: reduce` is active:
- All `y` / `x` translate values collapse to `0`
- All `opacity` animations from `0` collapse to `1` (elements are immediately visible)
- Duration overrides to `instant` (80ms) or `0` for pure opacity
- The waveform already handles this: draws a static horizontal line
- Waterfall bars appear at full width immediately with no stagger

**In every variant object below, the reduced-motion path is marked with `// REDUCED`.**

---

## 5. MisterLauncher — Hover, Click-to-Open, Close

The launcher is a 96×36px rectangular manifold tab. Motion only on opacity and transform (translateY for open/close, none for hover — the hover is CSS only per designer spec).

### Launcher entrance (on mount, after 800ms page load delay)

```typescript
// MisterLauncher.tsx
export const launcherVariants = {
  hidden: {
    opacity: 0,
    y: 12,        // rises from below — gravity
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.deliberate / 1000,       // 0.30s
      ease: [0.20, 0.00, 0.00, 1.00],             // EASE_MESSAGE_APPEAR
      delay: 0.8,
    },
  },
  // REDUCED
  visibleReduced: {
    opacity: 1,
    y: 0,
    transition: { duration: 0 },
  },
}
```

### Launcher exit (when window is open — launcher disappears, window takes the position)

The launcher does not hide when the window opens in floating mode. It remains as the close affordance anchor. No animation on the launcher itself during open/close — the window animates.

### State indicator (the 4×4 gold square — archetype resolved)

This is CSS-only. `transition: opacity 0.12s ease, background-color 0.12s ease`. No Framer Motion — it is a ::after pseudo-element or a `<span>` driven by a className toggle. The instant-class change is the animation.

### Session reference color shift (WGT-XXXX ghost → gold)

CSS-only: `transition: color 0.08s ease, opacity 0.08s ease`. Applied on archetype resolution via className.

---

## 6. MisterWindow — Open/Close Choreography

### Floating mode — Open

The window enters from below, rising into its anchored position above the launcher. No fade-in from transparent — it enters with opacity 1 but below its final position. The mass of the window is communicated through the translate distance (20px) and the duration (380ms).

```typescript
// MisterWindow.tsx
export const windowFloatingVariants = {
  closed: {
    opacity: 0,
    y: 20,
    pointerEvents: 'none' as const,
  },
  open: {
    opacity: 1,
    y: 0,
    pointerEvents: 'auto' as const,
    transition: {
      duration: DURATION.window / 1000,           // 0.38s
      ease: [0.22, 1.00, 0.36, 1.00],            // EASE_WINDOW_OPEN
    },
  },
  // REDUCED: opacity only, no y movement
  openReduced: {
    opacity: 1,
    y: 0,
    pointerEvents: 'auto' as const,
    transition: {
      duration: DURATION.instant / 1000,          // 0.08s
      ease: 'linear',
    },
  },
  closedReduced: {
    opacity: 0,
    y: 0,
    pointerEvents: 'none' as const,
    transition: {
      duration: DURATION.instant / 1000,
      ease: 'linear',
    },
  },
}

// For the close direction — window moves down and exits
export const windowFloatingCloseTransition = {
  duration: DURATION.window / 1000,              // 0.38s
  ease: [0.55, 0.00, 1.00, 0.45],               // EASE_WINDOW_CLOSE
}
```

**Implementation note:** Use `AnimatePresence` with `mode="wait"` wrapping the `MisterWindow`. On `isOpen` false, apply the close transition by setting `y: 16` in the `exit` variant.

```typescript
export const windowFloatingExitVariant = {
  opacity: 0,
  y: 16,
  transition: windowFloatingCloseTransition,
}
```

### Embedded mode — Open

In embedded mode the window is not floating — it is mounted inline in the product page layout. The entrance is a height reveal rather than a translate, because embedded windows don't "fly in" from the launcher.

```typescript
export const windowEmbeddedVariants = {
  collapsed: {
    opacity: 0,
    scaleY: 0.96,
    originY: 0,             // expand from the top edge
  },
  expanded: {
    opacity: 1,
    scaleY: 1,
    originY: 0,
    transition: {
      duration: DURATION.deliberate / 1000,       // 0.30s
      ease: [0.20, 0.00, 0.00, 1.00],            // EASE_MESSAGE_APPEAR
    },
  },
  // REDUCED
  expandedReduced: {
    opacity: 1,
    scaleY: 1,
    transition: { duration: DURATION.instant / 1000 },
  },
}
```

---

## 7. Message Appear — User vs Assistant

The two message types communicate different relationships to the conversation. The user message is an input — it appears with immediate confidence. The assistant message is a response — it arrives with a fraction more weight, from a slightly lower position, as if being placed on the desk rather than typed.

### User message

Fast, confident, no translation distance. The user knows what they sent.

```typescript
export const userMessageVariants = {
  hidden: {
    opacity: 0,
    y: 6,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.standard / 1000,         // 0.22s
      ease: [0.20, 0.00, 0.00, 1.00],            // EASE_MESSAGE_APPEAR
    },
  },
  // REDUCED
  visibleReduced: {
    opacity: 1,
    y: 0,
    transition: { duration: 0 },
  },
}
```

### Assistant message

Heavier translate distance, longer duration. The document arrives. The left-rule (the institutional stamp) is already present when the message becomes visible — it does not animate in separately.

```typescript
export const assistantMessageVariants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.deliberate / 1000,       // 0.30s
      ease: [0.20, 0.00, 0.00, 1.00],            // EASE_MESSAGE_APPEAR
    },
  },
  // REDUCED
  visibleReduced: {
    opacity: 1,
    y: 0,
    transition: { duration: 0 },
  },
}
```

**Implementation note:** Both message types wrap in `<AnimatePresence>` inside `MisterMessageList`. The `key` is the message `id`. Framer Motion handles list insertion automatically. Do not use `layout` prop on message items — it creates reflow calculations that fight with the scroll behavior of the message list.

---

## 8. Streaming Text — Token-by-Token Appearance

Streaming text via SSE is the most technically constrained animation surface. Tokens arrive as deltas — individual characters or word fragments. The animation must not create a new DOM element per token (performance), must not produce jarring visual gaps between tokens, and must not feel like a typewriter effect (too theatrical).

### Approach: Word-group reveal with immediate opacity

Each streaming token is appended to a single `<span>` in `MisterStreamingMessage`. The text itself simply appears — no per-character animation. The only animated element is the MisterWaveform (already exists: amplitude collapses to near-zero during streaming).

The streaming message container gets a subtle entrance:

```typescript
export const streamingContainerVariants = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  streaming: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.standard / 1000,         // 0.22s
      ease: [0.00, 0.00, 0.20, 1.00],            // EASE_STREAMING_TEXT
    },
  },
  // REDUCED
  streamingReduced: {
    opacity: 1,
    y: 0,
    transition: { duration: 0 },
  },
}
```

When streaming completes, the `MisterStreamingMessage` is replaced by a fully-rendered `MisterMessage` (assistant). This swap uses `AnimatePresence` with the streaming container exiting at `opacity: 0` over `instant` (80ms) and the full message entering with `assistantMessageVariants`.

### The cursor

During streaming, a blinking cursor `|` appears at the end of the text. This is CSS-only:

```css
.mister-stream-cursor {
  display: inline-block;
  width: 1px;
  height: 1em;
  background: var(--mister-gold);
  opacity: 1;
  margin-left: 1px;
  vertical-align: text-bottom;
  animation: mister-blink 900ms ease-in-out infinite;
}

@keyframes mister-blink {
  0%, 45%  { opacity: 1; }
  55%, 100% { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .mister-stream-cursor { animation: none; opacity: 1; }
}
```

The cursor disappears when streaming completes (remove the element from DOM, no animation needed).

---

## 9. Quick Actions — Reveal and Tap Feedback

Quick actions appear as a group of three after each assistant message completes (never during streaming). They enter as a staggered sequence — not simultaneously — because they are being placed, one after another, as document action options.

### Group reveal

```typescript
export const quickActionsContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: DURATION.stagger / 1000,  // 0.04s between each button
      delayChildren: 0.06,                       // 60ms after message settles
    },
  },
  // REDUCED — all appear at once
  visibleReduced: {
    opacity: 1,
    transition: { staggerChildren: 0, delayChildren: 0 },
  },
}

export const quickActionItemVariants = {
  hidden: {
    opacity: 0,
    y: 4,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.standard / 1000,         // 0.22s
      ease: [0.16, 1.00, 0.30, 1.00],            // EASE_QUICK_ACTION
    },
  },
  // REDUCED
  visibleReduced: {
    opacity: 1,
    y: 0,
    transition: { duration: 0 },
  },
}
```

### Tap feedback (pressed state)

Quick-action buttons use `whileTap` for immediate press feedback. No bounce. A compress-only scale that confirms the tap and returns.

```typescript
export const quickActionTapProps = {
  whileHover: {
    // Hover is handled by CSS (border-color, background-color)
    // No scale on hover — documents don't grow when you look at them
  },
  whileTap: {
    scale: 0.97,
    transition: {
      duration: DURATION.quick / 1000,           // 0.16s
      ease: [0.55, 0.00, 1.00, 0.45],           // EASE_WINDOW_CLOSE (fast out)
    },
  },
}
// REDUCED: omit whileTap entirely (wrap in conditional based on useReducedMotion())
```

### Quick action exit (when new message arrives)

The existing quick-action row for the previous turn fades out as the user's reply message appears.

```typescript
export const quickActionsExitVariants = {
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: DURATION.quick / 1000,           // 0.16s
      ease: [0.55, 0.00, 1.00, 0.45],
    },
  },
  // REDUCED
  exitReduced: {
    opacity: 0,
    transition: { duration: DURATION.instant / 1000 },
  },
}
```

---

## 10. Surface Cards — Slide-In from Below

`ProductCard`, `ComparisonView`, `LandedCostWaterfall`, `MoqTable`, `SpecSheet`, `ContactCard`, and `DocumentLink` all enter using the same surface pattern. They are not special — they are documents being placed on the desk below the message that introduced them.

```typescript
export const surfaceCardVariants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.deliberate / 1000,       // 0.30s
      ease: [0.20, 0.00, 0.00, 1.00],            // EASE_SURFACE_SLIDE
    },
  },
  // REDUCED
  visibleReduced: {
    opacity: 1,
    y: 0,
    transition: { duration: 0 },
  },
}
```

**Implementation note:** Surface cards appear after the assistant message that triggered them. The entry delay is `deliberate` (300ms) after the message itself finishes entering. Do not add a separate delay prop — sequence it through `AnimatePresence` or `delayChildren` on the message container.

The surface card does NOT animate internally on entry (no individual row reveals, no column fade-in). The card arrives as a complete document. Only the `LandedCostWaterfall` has internal entry animation — see Section 11.

---

## 11. Typing / Thinking Indicator

**The designer has ruled the ellipsis indicator dead.** Mister streams or it is silent. There is no "Mister is typing..." state. The `MisterWaveform` is the only ambient signal that something is happening — its amplitude collapses to near-flat during streaming (already implemented in `useMisterWaveform`).

For the gap between the user sending a message and the first streaming token arriving (typically 300–800ms), the only visual state is:

1. The user message appears (via `userMessageVariants`)
2. The waveform amplitude drops toward zero (already implemented, lerp factor 0.07)
3. The streaming message container appears (via `streamingContainerVariants`) when the first token arrives

No spinner. No pulsing dots. No "thinking" skeleton. The waveform is sufficient. If the specialist has nothing to say yet, the document is blank.

---

## 12. LandedCostWaterfall — Signature Animation

This is the most important animation in the system. The designer calls it "the physical expression of the brand's core claim." The animation must match that weight.

### The concept

The five waterfall bars (Product, Freight, Insurance, Duties, Last-mile) build left-to-right in sequence, one after the other. Not simultaneously. Each bar grows from zero width to its proportional width, staggered. The viewer watches the cost structure being constructed, layer by layer — which is exactly what Mister is doing conceptually.

The base-100 Product bar leads. Then Freight arrives. Then Insurance. Then Duties (gold-tinted — the SUNAT variable). Then Last-mile. The total band fades in only after the last bar completes.

### Implementation

The `LandedCostWaterfall` component has two animated regions: **the strip** (Part A) and the **breakdown table rows** (Part B). Both animate on first reveal.

#### Part A — The Indexed Strip (horizontal, width-based)

Width cannot be animated directly in Framer Motion without layout thrashing. Use `scaleX` with `transformOrigin: 'left'` on each segment `<div>`. This animates the visual width without affecting document flow.

```typescript
// Each segment in the strip
export function getWaterfallStripSegmentVariants(index: number) {
  return {
    hidden: {
      scaleX: 0,
      opacity: 0,
      originX: 0,          // grow from left edge
    },
    visible: {
      scaleX: 1,
      opacity: 1,
      originX: 0,
      transition: {
        duration: DURATION.waterfall / 1000,       // 0.48s per segment
        ease: [0.20, 0.00, 0.00, 1.00],           // EASE_SURFACE_SLIDE
        delay: index * (DURATION.waterfall / 1000) * 0.55,
        // Segments overlap by 45% — the next begins before the current finishes.
        // This reads as "flowing" construction, not robotic tick-tock.
      },
    },
    // REDUCED
    visibleReduced: {
      scaleX: 1,
      opacity: 1,
      transition: { duration: 0 },
    },
  }
}
```

**Stagger timing at waterfall (480ms per segment, 45% overlap):**
```
Segment 0 (Product):   starts at 0ms,    completes at 480ms
Segment 1 (Freight):   starts at 264ms,  completes at 744ms
Segment 2 (Insurance): starts at 528ms,  completes at 1008ms
Segment 3 (Duties):    starts at 792ms,  completes at 1272ms
Segment 4 (Last-mile): starts at 1056ms, completes at 1536ms
```
Total strip build time: ~1.54 seconds. This is intentional and correct. The senior specialist is watching the cost structure assemble itself. This is not too slow — it is exactly weighted enough to communicate that something important is happening.

#### Part B — The Breakdown Table Rows

Table rows appear staggered, beginning when their corresponding strip segment is at 50% completion. Each row slides up from 8px below.

```typescript
export const waterfallTableContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: (DURATION.waterfall / 1000) * 0.55,  // same gap as strip
      delayChildren: (DURATION.waterfall / 1000) * 0.25,    // starts at 25% of first bar
    },
  },
  // REDUCED
  visibleReduced: {
    opacity: 1,
    transition: { staggerChildren: 0, delayChildren: 0 },
  },
}

export const waterfallTableRowVariants = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.deliberate / 1000,                  // 0.30s per row
      ease: [0.20, 0.00, 0.00, 1.00],
    },
  },
  // REDUCED
  visibleReduced: {
    opacity: 1,
    y: 0,
    transition: { duration: 0 },
  },
}
```

#### Total band — appears after last row

```typescript
export const waterfallTotalVariants = {
  hidden: {
    opacity: 0,
    y: 4,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.standard / 1000,
      ease: [0.20, 0.00, 0.00, 1.00],
      delay: (DURATION.waterfall / 1000) * 0.55 * 5 + 0.1,  // after all 5 rows + 100ms
    },
  },
  // REDUCED
  visibleReduced: {
    opacity: 1,
    y: 0,
    transition: { duration: 0 },
  },
}
```

### Trigger: `useInView`

The waterfall animation triggers on first entry into the viewport (once only — no repeat). Use Framer Motion's `useInView` hook with `once: true` and `margin: '0px 0px -40px 0px'` (trigger 40px before fully in view).

```typescript
// Inside LandedCostWaterfall.tsx
const ref = useRef(null)
const isInView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' })
const reducedMotion = useReducedMotion()

const animate = isInView
  ? (reducedMotion ? 'visibleReduced' : 'visible')
  : 'hidden'
```

### The Duties segment — gold pulse

After the Duties segment strip bar completes its entry, it pulses once in opacity (from 0.08 to 0.18 and back to 0.08) to signal "this is the variable one." This is the only secondary animation in the entire waterfall system and it earns its place by flagging the SUNAT-variable segment.

```typescript
export const waterfallDutiesSegmentPulseVariants = {
  idle: { opacity: undefined },          // inherits CSS token value
  pulse: {
    opacity: [
      'var(--mister-wf-strip-duties)',   // Note: CSS variables can't be animated by Framer Motion
    ],
  },
}
```

**Implementation correction:** Framer Motion cannot animate CSS custom property values directly. Use a numeric opacity and map it to the token range:

```typescript
export const waterfallDutiesStripPulse = {
  // Applied as a separate motion.div wrapping only the duties segment
  // after the strip segment's entry animation completes
  animate: {
    opacity: [0.08, 0.20, 0.08],
  },
  transition: {
    duration: 0.60,
    ease: [0.45, 0.05, 0.55, 0.95],     // EASE_TYPING_INDICATOR — symmetric
    delay: 1.30,                          // fires after duties strip bar finishes (at ~1272ms)
    times: [0, 0.5, 1],
    repeat: 0,                            // once only
  },
}
// REDUCED: do not apply this animation at all
```

---

## 13. Source of Truth File — `src/lib/mister/motion.ts`

All variant objects and constants belong in a single file. Components import from here, never define their own animation values inline.

```typescript
// src/lib/mister/motion.ts
// Mister Motion System — Animator Contribution, June 2026
// Every animation constant, easing value, and variant object in this file.
// Components import from here only. No inline animation values.

import type { Variants, Transition } from 'framer-motion'

// ─── Duration Scale ──────────────────────────────────────────────────────────

export const DURATION = {
  instant:    0.080,
  micro:      0.120,
  quick:      0.160,
  standard:   0.220,
  deliberate: 0.300,
  window:     0.380,
  waterfall:  0.480,
  stagger:    0.040,
} as const

// ─── Easing Signature ────────────────────────────────────────────────────────

export const EASE = {
  messageAppear:     [0.20, 0.00, 0.00, 1.00] as const,
  quickAction:       [0.16, 1.00, 0.30, 1.00] as const,
  windowOpen:        [0.22, 1.00, 0.36, 1.00] as const,
  windowClose:       [0.55, 0.00, 1.00, 0.45] as const,
  surfaceSlide:      [0.20, 0.00, 0.00, 1.00] as const,
  typingIndicator:   [0.45, 0.05, 0.55, 0.95] as const,
  streamingText:     [0.00, 0.00, 0.20, 1.00] as const,
} as const

// ─── Launcher ────────────────────────────────────────────────────────────────

export const launcherVariants: Variants = {
  hidden:        { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.deliberate, ease: EASE.messageAppear, delay: 0.8 },
  },
  visibleReduced: { opacity: 1, y: 0, transition: { duration: 0 } },
}

// ─── Window — Floating ───────────────────────────────────────────────────────

export const windowFloatingVariants: Variants = {
  closed:        { opacity: 0, y: 20, pointerEvents: 'none' },
  open: {
    opacity: 1,
    y: 0,
    pointerEvents: 'auto',
    transition: { duration: DURATION.window, ease: EASE.windowOpen },
  },
  openReduced:   { opacity: 1, y: 0, pointerEvents: 'auto', transition: { duration: DURATION.instant } },
  closedReduced: { opacity: 0, y: 0, pointerEvents: 'none', transition: { duration: DURATION.instant } },
  exit: {
    opacity: 0,
    y: 16,
    transition: { duration: DURATION.window, ease: EASE.windowClose },
  },
  exitReduced:   { opacity: 0, y: 0, transition: { duration: DURATION.instant } },
}

// ─── Window — Embedded ───────────────────────────────────────────────────────

export const windowEmbeddedVariants: Variants = {
  collapsed:       { opacity: 0, scaleY: 0.96 },
  expanded: {
    opacity: 1,
    scaleY: 1,
    transition: { duration: DURATION.deliberate, ease: EASE.messageAppear },
  },
  expandedReduced: { opacity: 1, scaleY: 1, transition: { duration: DURATION.instant } },
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export const userMessageVariants: Variants = {
  hidden:        { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.standard, ease: EASE.messageAppear },
  },
  visibleReduced: { opacity: 1, y: 0, transition: { duration: 0 } },
}

export const assistantMessageVariants: Variants = {
  hidden:        { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.deliberate, ease: EASE.messageAppear },
  },
  visibleReduced: { opacity: 1, y: 0, transition: { duration: 0 } },
}

// ─── Streaming Container ──────────────────────────────────────────────────────

export const streamingContainerVariants: Variants = {
  hidden:          { opacity: 0, y: 8 },
  streaming: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.standard, ease: EASE.streamingText },
  },
  streamingReduced: { opacity: 1, y: 0, transition: { duration: 0 } },
}

// ─── Quick Actions ────────────────────────────────────────────────────────────

export const quickActionsContainerVariants: Variants = {
  hidden:          { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: DURATION.stagger, delayChildren: 0.06 },
  },
  visibleReduced: { opacity: 1, transition: { staggerChildren: 0, delayChildren: 0 } },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: DURATION.quick, ease: EASE.windowClose },
  },
  exitReduced:     { opacity: 0, transition: { duration: DURATION.instant } },
}

export const quickActionItemVariants: Variants = {
  hidden:          { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.standard, ease: EASE.quickAction },
  },
  visibleReduced:  { opacity: 1, y: 0, transition: { duration: 0 } },
}

export const quickActionTapTransition: Transition = {
  duration: DURATION.quick,
  ease: EASE.windowClose,
}

// ─── Surface Cards ────────────────────────────────────────────────────────────

export const surfaceCardVariants: Variants = {
  hidden:          { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.deliberate, ease: EASE.surfaceSlide },
  },
  visibleReduced:  { opacity: 1, y: 0, transition: { duration: 0 } },
}

// ─── LandedCostWaterfall ──────────────────────────────────────────────────────

// Returns per-segment variants with staggered delay baked in.
// index: 0=product, 1=freight, 2=insurance, 3=duties, 4=lastmile
export function getWaterfallStripSegmentVariants(index: number): Variants {
  const OVERLAP = 0.55
  return {
    hidden:         { scaleX: 0, opacity: 0 },
    visible: {
      scaleX: 1,
      opacity: 1,
      transition: {
        duration: DURATION.waterfall,
        ease: EASE.surfaceSlide,
        delay: index * DURATION.waterfall * OVERLAP,
      },
    },
    visibleReduced: { scaleX: 1, opacity: 1, transition: { duration: 0 } },
  }
}

export const waterfallTableContainerVariants: Variants = {
  hidden:          { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: DURATION.waterfall * 0.55,
      delayChildren: DURATION.waterfall * 0.25,
    },
  },
  visibleReduced:  { opacity: 1, transition: { staggerChildren: 0, delayChildren: 0 } },
}

export const waterfallTableRowVariants: Variants = {
  hidden:          { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.deliberate, ease: EASE.messageAppear },
  },
  visibleReduced:  { opacity: 1, y: 0, transition: { duration: 0 } },
}

export const waterfallTotalVariants: Variants = {
  hidden:          { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.standard,
      ease: EASE.messageAppear,
      delay: DURATION.waterfall * 0.55 * 5 + 0.1,
    },
  },
  visibleReduced:  { opacity: 1, y: 0, transition: { duration: 0 } },
}

// Duties segment: one opacity pulse after its strip bar arrives (~1.3s)
// Apply to a motion.div wrapper around the duties segment fill only.
export const waterfallDutiesPulse = {
  animate: { opacity: [0.08, 0.20, 0.08] as number[] },
  transition: {
    duration: 0.60,
    ease: EASE.typingIndicator,
    delay: 1.30,
    times: [0, 0.5, 1],
    repeat: 0,
  } satisfies Transition,
}
```

---

## 14. Animation Prohibited List

These animations are explicitly banned from the Mister system:

| Banned | Reason |
|--------|--------|
| `spring` easing on any UI element | Springs overshoot. Documents don't bounce. |
| `rotate` on any element | No rotation exists in the document metaphor. |
| `scale` on message appear | Messages have mass — they translate, they don't grow. |
| Skeleton loaders with shimmer | The waveform is the loading state. No skeleton shimmer. |
| Scroll-triggered parallax inside the window | The window is a document, not a scroll experience. |
| Gradient animation or glow pulse | Designer has killed gradients. No ambient glow. |
| `layout` prop on message list items | Creates reflow that fights scroll position. |
| Hover scale on any element | Nothing grows when looked at. CSS border-color only. |
| Particle field | The waveform is sufficient. Adding particles contradicts documentary restraint. |
| Any easing with `back` or `anticipate` character | These communicate playfulness. |
| `AnimateSharedLayout` across message and surface | Creates incorrect size interpolation. |

---

## 15. Waveform Integration Notes (Respecting Existing Work)

The `MisterWaveform` / `useMisterWaveform` pair is correct and must not be modified. Key decisions already made:

- Amplitude lerps to near-zero during streaming (factor 0.07), returns during idle (factor 0.15). This is the correct mechanical behavior — faster collapse, slower return, like breath.
- Three superimposed sine waves at different frequencies (0.015, 0.025, 0.04) with phase offsets create organic irregularity without chaos.
- `rgba(196,147,63,0.35)` — gold at 35% opacity. Below the gold threshold where it reads as an active element, above the threshold where it disappears. Correct.
- `prefers-reduced-motion` already handled: static horizontal line.
- Tab visibility handled: RAF pauses on `document.hidden`.

The waveform sits in the `MisterComposer` region or just above the composer input. Its position communicates: the signal is the document being processed, not the document content. The waveform is the infrastructure layer, not the content layer.

---

## 16. CSS Transitions (Designer-Specified, Non-Framer-Motion)

Per the designer spec, these transitions are CSS-only and must not be converted to Framer Motion:

```css
/* Border-color hover states */
.mister-launcher     { transition: border-color 0.15s ease; }
.mister-qa-button    { transition: border-color 0.15s ease, background-color 0.15s ease; }
.mister-composer     { transition: border-top-color 0.15s ease; }
.mister-send-arrow   { transition: color 0.15s ease; }

/* Status indicator transitions */
.mister-session-ref  { transition: color 0.08s ease, opacity 0.08s ease; }
.mister-status-dot   { transition: background-color 0.12s ease, opacity 0.12s ease; }

/* Trade-term underline hover */
.mister-trade-term:hover { border-bottom-color: var(--mister-gold); transition: border-bottom-color 0.15s ease; }

/* Assistant message rule hover */
.mister-message-assistant:hover .mister-rule-left {
  border-left-color: var(--mister-rule-assistant-hover);
  transition: border-left-color 0.15s ease;
}
```

---

## 17. Component Implementation Checklist

For each animated component, implement in this order:

1. Import variant objects from `@/lib/mister/motion`
2. Import `useReducedMotion` from `@/hooks/useReducedMotion`
3. Select the appropriate variant name (`visible` vs `visibleReduced`) based on the hook
4. Wrap with `AnimatePresence` where applicable
5. Never define animation values inline in the component JSX

```typescript
// Pattern — every animated Mister component follows this
import { motion, AnimatePresence } from 'framer-motion'
import { assistantMessageVariants } from '@/lib/mister/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function MisterMessage({ message }: { message: MisterMessage }) {
  const reduced = useReducedMotion()
  const animateTarget = reduced ? 'visibleReduced' : 'visible'

  return (
    <motion.div
      variants={assistantMessageVariants}
      initial="hidden"
      animate={animateTarget}
    >
      {/* message content */}
    </motion.div>
  )
}
```

---

*Animator Contribution · Mister · Wings Global Trade*
*Prepared for conductor synthesis · June 2026*
*Note: The existing MisterWaveform / useMisterWaveform implementation is correct and complete. No modifications required. This document governs all remaining Framer Motion animation in the Mister component tree.*
