# Animator Contribution — Wings Global Trade

## Motion Personality

**Precise. Grounded. Efficient.**

Wings motion never bounces, never springs, never surprises. Every animation is purposeful: it reveals information, confirms an action, or guides attention. This is a trade platform — motion communicates operational precision, not playfulness.

Awwwards motion standard on a B2B trade platform means: the animations are almost invisible to a casual user, but their absence would feel cheap. Micro-transitions. Intentional reveals. No decorative motion.

---

## Easing Signature

```typescript
// Every ease derives from these four
const ease = {
  enter:       [0.0, 0.0, 0.2, 1.0],  // Decelerate — things entering a scene slow to stop
  exit:        [0.4, 0.0, 1.0, 1.0],  // Accelerate — things leaving pick up speed
  interaction: [0.25, 0.1, 0.25, 1.0], // Standard — hover, focus, toggle
  transition:  [0.4, 0.0, 0.2, 1.0],  // Symmetric — page transitions, large reveals
}
```

Never use spring physics. Never use bounce. `ease` strings only when cubic-bezier is overkill (hover: `'easeOut'`).

---

## Duration Scale

```typescript
const duration = {
  instant:    0,      // State changes that must feel immediate (button active state)
  fast:       150,    // Hover states, focus rings, micro-interactions
  normal:     300,    // Component reveals, drawer open/close
  slow:       500,    // Page section entrances, hero elements
  cinematic:  800,    // Page hero — the opening sequence only
}
```

No animation should exceed 800ms. If it does, split it into two animations.

---

## Page Load Choreography

### Homepage
```
0ms     Nav fades in (opacity 0→1, 300ms, ease.enter)
0ms     Hero tagline slides up (y:16→0, opacity 0→1, 500ms, ease.enter)
100ms   Hero headline slides up (y:24→0, opacity 0→1, 600ms, ease.enter)
300ms   Hero subheadline slides up (y:16→0, opacity 0→1, 500ms, ease.enter)
500ms   Hero CTA fades in (opacity 0→1, 400ms, ease.enter)
—       Category grid: each tile fades up on scroll-enter (stagger 80ms, 400ms each)
—       TrustBar: fades in on scroll-enter (400ms)
—       MarketMap: fades in on scroll-enter (600ms)
```

### Accio Engine
```
0ms     Nav fades in
0ms     Left panel (chat) fades in (opacity 0→1, 400ms)
0ms     Right panel (TPR Sheet) slides in from right (x:32→0, opacity 0→1, 400ms, ease.enter)
200ms   First AI message renders (text appears as if typed — but actually instant fade-in, 300ms)
—       Each subsequent AI message: fade-up (y:8→0, opacity 0→1, 300ms)
—       Each TPR field captured: gold dot pulses (scale 1→1.2→1, 200ms) + value fades in
```

### Product Detail
```
0ms     Hero image fades in (opacity 0→1, 400ms)
0ms     Product name slides up (y:16→0, opacity 0→1, 500ms)
100ms   Source badge fades in (opacity 0→1, 300ms)
200ms   Spec summary fades up (y:8→0, opacity 0→1, 400ms)
300ms   Inquiry form fades in (opacity 0→1, 400ms)
—       Spec table rows: stagger 40ms on scroll-enter
```

---

## Scroll Behavior

Use Framer Motion's `whileInView` with `once: true`. Every section entrance happens once.

```typescript
const scrollReveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5, ease: [0.0, 0.0, 0.2, 1.0] }
}
```

**What animates on scroll:**
- Section headings (y:24, stagger from left)
- Product grid items (stagger 60ms per item, y:16)
- TrustBar items (stagger 80ms)
- MarketMap (fade only, no y-movement — it's a visual anchor)

**What never animates:**
- Navigation (always visible, no scroll-based changes except background)
- Form fields (static — don't animate what the user is trying to fill)
- Error messages (instant — delay on errors feels broken)

---

## Hover States — Every Interactive Component

| Component | Hover Animation |
|---|---|
| Category tile | `translateY(-3px)`, shadow deepens, gold top-border appears (0.2s) |
| Product card | `translateY(-2px)`, `box-shadow` deepens (0.2s) |
| Button Primary | `background: #B8842E` (0.15s), no transform |
| Button Secondary | `background: rgba(0,30,80,0.06)` (0.15s) |
| Ghost button | `color: #B8842E`, underline appears (0.15s) |
| Nav link | opacity 0.7→1, gold underline slides in from left (0.2s) |
| TPR field row | edit button fades in at opacity 0→1 (0.15s) |
| WhatsApp button | `scale(1.02)` (0.15s) |

---

## Page Transitions

Using Next.js `<AnimatePresence>` on route changes.

```typescript
const pageTransition = {
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0, 0, 0.2, 1] } }
}
```

Keep transitions short — 350ms total. No slide-in from left/right (too flashy for a trade platform).

---

## Loading States and Skeletons

### Chat typing indicator
```typescript
// Three dots, staggered opacity pulse
const dot = {
  animate: { opacity: [0.3, 1, 0.3] },
  transition: { duration: 0.6, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }
}
// Stagger: dot1 delay:0, dot2 delay:0.2s, dot3 delay:0.4s
```

### CIF card skeleton (while estimate loads)
- 4 skeleton rows: `bg-gray-200` + shimmer animation (CSS `@keyframes shimmer`)
- Width varies per row (60%, 80%, 45%, 70%) to look like real data
- Shimmer: 1.5s loop, gradient sweep left to right

### Product image skeleton
- Same background as card, `animate-pulse` (Tailwind built-in)
- Aspect-ratio: 4/3 maintained

---

## THE SOUL LAYER — Wings' Motion Identity

**The TPR field capture pulse.**

When the AI captures a TPR field and updates the sheet, the gold indicator dot:
1. Pulses: `scale(1)` → `scale(1.4)` → `scale(1)`, 250ms, ease out
2. The row's value text fades in: `opacity: 0` → `opacity: 1`, 300ms
3. A subtle gold shimmer sweeps across the row background: `rgba(196,147,63,0.0)` → `rgba(196,147,63,0.08)` → `rgba(196,147,63,0.0)`, 400ms

This is the heartbeat of the Accio Engine. Every time Wings captures your requirement, there's a micro-celebration. It communicates: **"We got that. You're making progress."**

No other interface element has this animation. It belongs exclusively to the TPR capture event.

```typescript
// In TprField.tsx
const captureAnimation = {
  dot: {
    animate: { scale: [1, 1.4, 1] },
    transition: { duration: 0.25, ease: 'easeOut' }
  },
  value: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3, delay: 0.1 }
  },
  rowShimmer: {
    animate: { backgroundColor: ['rgba(196,147,63,0)', 'rgba(196,147,63,0.08)', 'rgba(196,147,63,0)'] },
    transition: { duration: 0.4, ease: 'easeInOut' }
  }
}
```

---

## `prefers-reduced-motion` Fallbacks

Wrap ALL animation variants with:

```typescript
import { useReducedMotion } from 'framer-motion'

function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion()
  
  const variants = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.01 } }
    : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: [0.0, 0.0, 0.2, 1.0] } }
  
  return <motion.div variants={variants}>...</motion.div>
}
```

The TPR capture pulse is the only animation exempt from reduced-motion suppression — reduce its scale to `[1, 1.1, 1]` instead of `[1, 1.4, 1]`.

---

## Complete Framer Motion Variant Objects

```typescript
// src/lib/motion.ts — REPLACE existing file with:

export const FADE_UP = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.0, 0.0, 0.2, 1.0] }
}

export const FADE_UP_SLOW = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.0, 0.0, 0.2, 1.0] }
}

export const FADE_IN = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3, ease: [0.0, 0.0, 0.2, 1.0] }
}

export const SCROLL_REVEAL = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5, ease: [0.0, 0.0, 0.2, 1.0] }
}

export const STAGGER_CONTAINER = {
  animate: { transition: { staggerChildren: 0.08 } }
}

export const STAGGER_ITEM = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.0, 0.0, 0.2, 1.0] }
}

export const SLIDE_FROM_RIGHT = {
  initial: { opacity: 0, x: 32 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.4, ease: [0.0, 0.0, 0.2, 1.0] }
}

export const PAGE_ENTER = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.35, ease: [0.0, 0.0, 0.2, 1.0] }
}

export const TPR_CAPTURE_DOT = {
  animate: { scale: [1, 1.4, 1] },
  transition: { duration: 0.25, ease: 'easeOut' }
}

export const TPR_CAPTURE_VALUE = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3, delay: 0.1 }
}
```
