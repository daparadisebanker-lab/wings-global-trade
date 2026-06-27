# Wings Global Trade — Immersive Experience Contribution
**Agent:** Immersion Engineer
**Spec version:** 2026-06-17
**North star constraint:** Inquiry conversion rate. Every immersive decision is evaluated against: does this make a serious LATAM B2B buyer more likely to submit a qualified lead? Nothing here is decoration.

---

## 3D / WebGL Verdict

**Decision: No 3D or WebGL anywhere on this platform.**

This is not a compromise — it is the correct architecture for this specific conversion problem.

A Peruvian purchasing manager or Chilean wholesaler arriving at Wings is evaluating a sourcing partner, not experiencing an art installation. Their mental frame is operational: can this platform confirm what I need exists, at what price range, and how do I engage Wings to proceed. Every millisecond of load time that does not immediately serve that question is friction that costs conversion.

LATAM mobile networks — particularly on 4G in secondary cities like Tacna, Arequipa, Iquique, or Medellín — routinely deliver 5–15 Mbps with 80–200ms latency. A Three.js or R3F scene with a realistic LATAM geography mesh, shipping route particles, and lighting requires a minimum 180–350 KB of compressed JS, plus GPU ramp-up time on mid-range Android devices (Motorola G series, Samsung A series — the dominant hardware for LATAM SME buyers). Even with lazy loading and Suspense boundaries, the perceptual paint cost exceeds what this conversion funnel can absorb before users bounce.

Additionally, 3D on a B2B tool of this type sends the wrong signal. Wings is positioning as a serious trade partner, not a technology showcase. The brand language — Cormorant Garamond, navy, gold, DM Mono, precision copy — is deliberately restrained and documentary. 3D would undermine the clinical-operational credibility that is Wings' actual differentiator against informal importers and raw sourcing directories.

**The immersive strategy for Wings is: use documentary precision as the immersion.** Real port names. Real HS code patterns. Real free zone names with real cities. Real CIF numbers built from real formulas. The data itself creates the sense of operational reality. No mesh required.

**Verdict: Do not use Three.js, R3F, or any WebGL library — not in the hero, not in the MarketMap, not in the free-zone corridor. The full immersive impact is achievable through CSS, SVG, and Canvas 2D at zero additional bundle cost.**

---

## Immersive Opportunities by Section

### 1. Hero Section — Gradient Mesh + Grain Texture

**What it communicates:** Scale, solidity, operational depth. The hero is the first trust signal. It must read as a serious institution in under 0.3 seconds of scanning — like the cover of a trade prospectus, not a startup landing page.

**Implementation: CSS radial gradient mesh + SVG noise filter overlay**

The navy hero background is a layered composition, not a flat `#001E50`.

**Layer 1 — Base:** `#001E50` solid fill.

**Layer 2 — Radial gradient mesh:** Two overlapping `radial-gradient` declarations positioned as if light sources exist above-left and below-right of the panel. The above-left source reaches from `rgba(0, 36, 112, 0.6)` toward transparent across roughly 60% of panel width. The below-right source reaches from `rgba(0, 18, 53, 0.8)` toward transparent across the lower-right third. These create a subtle topographic depth — the surface feels like it has mass.

```css
background:
  radial-gradient(ellipse 80% 60% at 20% 30%, rgba(0,36,112,0.6) 0%, transparent 70%),
  radial-gradient(ellipse 50% 40% at 85% 80%, rgba(0,18,53,0.8) 0%, transparent 60%),
  #001E50;
```

**Layer 3 — SVG grain texture:** A `<feTurbulence>` SVG filter applied as a `background-image` data URI at 4% opacity. `type="fractalNoise"`, `baseFrequency="0.65"`, `numOctaves="4"`. This adds a documentary paper quality — the same grain found on high-end financial prospectuses and shipping manifests. It does not animate. It is static noise that makes the surface feel material and physical.

**Layer 4 — Precision rule:** A single 1px `border-bottom` at `rgba(196, 147, 63, 0.15)` (gold at low opacity) across the full hero width at the section boundary. Not a separator — a precision mark. Signals the transition from brand to content.

**Performance cost:** Zero JS. Pure CSS. No runtime.

---

### 2. Hero Typography — Staggered Word Reveal with Letter-Spacing Compression

**What it communicates:** The text arrives as if being transmitted — each word placed with deliberate precision, not thrown onto screen as a block.

**Implementation: Framer Motion staggered word reveal (Framer Motion already in bundle)**

The hero headline does not fade up as a single unit. It animates word-by-word: each word enters with `opacity: 0 → 1` combined with `letterSpacing: "0.08em" → "0"` — a subtle compression from spaced-out to settled. This mimics the mechanical registration of type being set. Stagger: 60ms per word. Duration per word: 0.4s. Easing: `[0.25, 0.1, 0.25, 1.0]`.

The tagline "Precisión. Proximidad. Confianza." enters 200ms after the final headline word, as a single fade-up. The word "Precisión" renders in gold (`#C4933F`); the remaining two render in warm-white. This tricolor treatment within the tagline creates a subtle hierarchy: precision is the founding promise.

The SearchBar enters last, sliding up from `y: 16` with 100ms delay after the tagline completes.

**Total animation sequence:** approximately 1.6–1.8s from first paint. Acceptable because the content is meaningful during the sequence — each word is readable as it arrives, no content is hidden behind a loading state.

**Performance cost:** Zero additional bundle cost. Framer Motion is already in stack.

---

### 3. MarketMap — Animated SVG Trade-Route Lines with Destination Pulses

**What it communicates:** Wings is not a product directory — it is a freight network with specific, named infrastructure. The map makes the claim "importación directa" visually provable in under five seconds of viewing.

**Implementation: Inline SVG with CSS animations — no JS map library, no WebGL, no Mapbox**

The MarketMap is an inline SVG of Latin America (LATAM outline paths, approximately 12–15KB gzipped). Background: `warm-white (#F8F6F0)`.

**Country fills:** Active markets (Peru, Chile, Colombia, Panama, Costa Rica, Bolivia, Dominican Republic) fill with `#001E50` at 8% opacity. Inactive countries fill at 3% opacity. No border strokes on country outlines — filled only, which reads as continental territory without the busyness of borders.

**Source market indicators:** Small navy square markers at approximate geographic positions for China (Shanghai latitude), Japan (Osaka), Thailand (Bangkok), and Dubai. Each labeled in DM Mono 10px, `fill: #6B7280`. These are not animated — they are fixed origin anchors.

**Destination pins:** Gold circle markers (`fill: #C4933F`, `r="6"`, `stroke: #001E50"`, `stroke-width="1.5"`) at the capital cities of all seven active markets. Each pin carries an SVG `<animate>` element that pulses its radius from 6 to 10 and back (`values="6;10;6"`, `dur="2.4s"`, `repeatCount="indefinite"`, with a second `<animate>` on `opacity` from `1` to `0` to `1` synchronized). Each pin's animation has a staggered `begin` attribute (0s, 0.4s, 0.8s, 1.2s, 1.6s, 2.0s, 2.4s) so the pulses cascade across the map from north to south — Colombia fires first, Chile fires last — creating a sweep that implies network breadth.

**Trade-route lines:** SVG `<path>` elements drawn as quadratic bezier arcs (control point positioned offshore, above and to the right of the straight geographic line). Three corridor groups:

- China / Thailand → ZOFRATACNA (Tacna, Peru): `stroke: #C4933F`, `stroke-width: 1.5`, `stroke-dasharray: "6 4"`, `opacity: 0.45`
- China / Japan → ZOFRI (Iquique, Chile): same spec, `opacity: 0.4`
- Dubai → Both zones (lighter branch): `stroke: #C4933F`, `stroke-width: 1`, `stroke-dasharray: "4 6"`, `opacity: 0.3`

Each route line carries `<animate>` on `stroke-dashoffset` — `from` equal to the total path length, `to="0"`, `dur="3s"`, `repeatCount="indefinite"`. This creates the flowing "freight in transit" effect. The 3-second cycle speed suggests deliberate cargo movement — not frantic particle spam, but the cadence of actual container shipping.

**Scroll-entry activation:** The route line animations begin with `animation-play-state: paused` in CSS. An IntersectionObserver on the `<section>` containing the map sets `animation-play-state: running` when the section reaches 30% viewport visibility. Routes draw in staggered (`animation-delay: 0s, 0.4s, 0.8s` for the three corridors) on first entry. The observer disconnects after first trigger (`once: true` behavior) — routes do not restart on every scroll.

**Accessibility:** The `<svg>` element carries `role="img"` and `<title>Mapa de cobertura de mercados — Wings Global Trade</title>` plus `<desc>Mapa mostrando corredores de importación desde Asia y Medio Oriente hacia zonas francas en Perú y Chile, con destinos activos en América Latina.</desc>`. All animation elements are wrapped in `@media (prefers-reduced-motion: no-preference)` — the static map (gold pins visible, corridor paths rendered without flow animation, no pulse) is the default and accessible fallback.

**Performance cost:** Pure SVG and CSS. No JS map library. No canvas. No external network request if SVG is inlined in the component. Total weight: 15–20KB SVG content. Renders natively on all LATAM mobile browsers including Chrome on Android 10+.

---

### 4. Free-Zone Corridor Visualization — TrustBar Data Reveal

**What it communicates:** Wings has real, documented free-zone infrastructure with named geographic anchors — not a brokerage arrangement, an actual operational network.

**Implementation: Scroll-triggered number counters + zone card staggered entrance**

The TrustBar (navy background) currently lists zones and markets as static text. The immersive treatment activates on scroll intersection.

**Zone identity cards:** Each zone (ZOFRATACNA, ZOFRI) gets a two-line card within the TrustBar:
- Line 1: Zone name in DM Mono 500, 14px, warm-white
- Line 2: City + country in DM Mono 300, 12px, `#94A3B8`
- A gold horizontal rule at 20% opacity below, 24px width (short, precise — not full card width)
- One key fact in DM Mono 400, 12px, gold: "Ahorro estimado: 18–40% vs. importación estándar"

These cards entrance with staggered fade-up (80ms between cards) when the section enters the viewport using Framer Motion `whileInView`, `once: true`, `viewport: { amount: 0.3 }`.

**Animated counters on key operational figures:** Any numeric trust signal in the TrustBar or a dedicated stats section — "7 mercados atendidos", "2 zonas francas", "24h de respuesta", or the savings percentage — animates from 0 to final value over 800ms using `requestAnimationFrame` on intersection. Easing: ease-out cubic (`1 - Math.pow(1 - progress, 3)`). All counter values render in DM Mono at `--text-mono-lg` (16px) in gold. Non-numeric text labels (units, suffixes, copy) are static — only the number itself counts.

**Performance cost:** rAF counter logic adds less than 1KB of JS. Framer Motion already in bundle. No additional libraries.

---

### 5. Product Catalog — Card Depth and Source-Market Badge Lift

**What it communicates:** These are real products with real specifications and real provenance — not stock imagery placeholders.

**Implementation: CSS-only layered hover state**

Product cards use the existing hover spec (`translateY(-2px)`, shadow increase from `0 1px 3px rgba(0,0,32,0.06)` to `0 4px 12px rgba(0,0,32,0.10)`). Two additions:

**Source-market badge lift:** On card hover, the source-market badge (navy background, DM Mono text — "China", "Japón") translates up by 2px with a 150ms `ease-out` transition. This creates visual hierarchy within the card — the badge surfaces to confirm provenance as the card lifts. The motion reads as the product surfacing its most important credential.

**Image scale:** The product image scales to `1.03` (not 1.05 — too dramatic for a B2B tool) over 300ms, `transform-origin: center`, `overflow: hidden` on the image container. The scale is calibrated to feel like a quality catalogue interaction, not a consumer e-commerce bounce. It confirms the image is a real photograph, not a rendered asset.

**Performance cost:** CSS transforms only. GPU-composited via `will-change: transform` on the card element. Zero JS.

---

### 6. Accio Engine — TPR Completion Progress Track

**What it communicates:** Each answered question is real operational intelligence being constructed. The buyer should feel that the system is building something precise and useful on their behalf — not filling out a form, but commissioning a trade brief.

**Implementation: Linear progress track + CIF card arrival flash**

**TPR Progress Track:** A horizontal bar at the top of the TprSheet panel. `height: 2px`, `background: rgba(248, 246, 240, 0.08)` (almost invisible baseline), with a gold fill (`#C4933F`) that grows left-to-right using `width` CSS transition as TPR completeness increases. Width calculated as `(captured_fields / total_fields) × 100%`. Transition: `width 0.6s ease-out`. At `completeness === 'minimum'` (approximately 60% fill), a label appears in DM Mono 12px gold beneath the track: "Mínimo alcanzado — puede continuar".

This track is the only place on the platform where progress is quantified visually in real time. It transforms the chat from a conversation into a document being built — which is precisely the correct mental frame for a buyer engaging the Accio Engine.

**CIF Estimate Card arrival:** When the estimate card enters the TprSheet (after `completeness === 'minimum'`), the existing `y: 16 → 0`, `opacity: 0 → 1` entrance runs as specified. Add: the card's `border-left` transitions from `rgba(196, 147, 63, 0)` to `rgba(196, 147, 63, 1)` over 400ms on entry. This gold pulse on the left edge marks the CIF estimate's arrival as a significant moment — the system has produced something real.

**Performance cost:** CSS transitions. Framer Motion already in bundle. No additional cost.

---

## The ONE Signature Moment — Operational Scale

**The animated MarketMap with cascading destination pulses and flowing freight-corridor lines is the single immersive decision that communicates Wings' operational scale.**

Here is why this is the signature, not the hero or the CIF card:

Wings' core claim — "Importación directa con gestión en zona franca" — is abstract until a buyer sees the network. A purchasing manager in Lima can understand in three seconds of viewing that Wings sources from Shanghai-latitude, routes through a Pacific-coast anchor point, and delivers to their country — because they are looking at a map where gold lines flow along those exact corridors and their destination city pulses as a confirmed, active endpoint.

No paragraph of copy achieves this comprehension. The map does it in one glance.

The MarketMap is not decorative geography. It is the Wings proof-of-network. It answers, without a word, the most fundamental B2B trust question: "Does this company actually operate the infrastructure they claim?" The flowing `stroke-dashoffset` animation on the corridors creates the sense that freight is in motion — not simulated freight, but the actual operational reality of what Wings processes week over week through ZOFRATACNA and ZOFRI.

The map lives in the warm-white section of the homepage (position 4 in the alternation pattern), which means a buyer encounters it after already reading the categories and TrustBar data. By the time they see the map, they understand the business model. The map provides the conviction that converts understanding into action.

Every other immersive element on this platform serves friction reduction. The MarketMap serves conviction. Both are required for conversion, and the MarketMap is where they align as a single moment.

---

## Performance Budget

| Element | Technique | Additional Bundle Cost | Mobile Render Cost |
|---|---|---|---|
| Hero gradient mesh | CSS only | 0 KB | CSS paint — negligible |
| Hero grain texture | Inline SVG data URI filter | < 0.5 KB | CSS filter — negligible |
| Hero text stagger | Framer Motion (already bundled) | 0 KB | < 1ms |
| MarketMap SVG | Inline SVG + CSS `<animate>` | 15–20 KB SVG content | Native SVG render — no JS |
| Destination pin pulses | SVG `<animate>` on `r` and `opacity` | 0 KB additional | Native |
| Trade-route flow | SVG `stroke-dashoffset` animation | 0 KB additional | Native |
| TrustBar zone cards | Framer Motion (bundled) | 0 KB | < 1ms per card |
| Counter animations | rAF, ~80 lines | < 1 KB | Negligible |
| Product card hover | CSS transform | 0 KB | GPU-composited |
| TPR progress track | CSS width transition | 0 KB | CSS paint |
| CIF card border flash | CSS transition | 0 KB | CSS paint |

**Total additional JS from all immersion decisions: 0 KB.** All techniques use CSS, SVG native animation, and rAF — no additional libraries required beyond the existing Framer Motion bundle.

**Total additional asset weight: 15–20 KB** (MarketMap SVG delivered as an inline component in the HTML — zero additional network request on first load).

**First Load JS budget:** Total page JS (Next.js runtime + Framer Motion + app code) must remain under 150 KB gzipped. Immersion adds zero to this figure.

**LCP target on LATAM 4G:** under 2.0s. Achievable because no 3D library, no image-heavy immersive elements, and no blocking animations. The hero gradient is CSS paint — it is visible before any JS executes.

**`prefers-reduced-motion` compliance:** All CSS `animation` declarations must be wrapped in `@media (prefers-reduced-motion: no-preference)`. SVG `<animate>` elements must be conditionally suppressed via a JavaScript check on `window.matchMedia('(prefers-reduced-motion: reduce)')` that sets `animation-play-state: paused` on all SVG animation elements. The static fallback state — gradient mesh visible, grain visible, gold pins visible at full opacity, corridor paths rendered as static dashed lines, no pulse — is always shown and is itself a fully informative, trust-building composition.

---

## What Was Deliberately Excluded

**Parallax scrolling on the hero:** Scroll event listeners (or IntersectionObserver polling for parallax) introduce layout-reflow risk on low-power Android devices, and the hero content on Wings is text-dense. Parallax depth would make the headline and tagline harder to read during scroll. The gradient mesh creates the perception of depth without any scroll coupling. Excluded.

**Interactive MarketMap with tooltips:** Interactive SVG maps require JS event delegation, increase implementation complexity, and the conversion action is the inquiry form — not the map. The map is a trust signal, not a navigation component. Adding interactivity would distract from the scroll-to-CTA flow and introduce tap-target overlap issues on mobile. Excluded in MVP.

**Lottie animations for any element:** Lottie requires a runtime library (approximately 40 KB gzipped) for animations that CSS or SVG native `<animate>` can handle with zero overhead. The performance argument against Lottie is identical to the argument against Three.js on LATAM mobile. Excluded.

**GSAP:** Framer Motion is already in the stack. GSAP adds approximately 25 KB gzipped for capabilities (timeline sequencing, ScrollTrigger) that are not required by this platform's motion design. The existing Framer Motion token set (`FADE_UP`, `STAGGER_CONTAINER`, `STAGGER_ITEM`, `SLIDE_UP`) covers all required motion. Excluded.

**Video backgrounds in the hero:** Video backgrounds on mobile autoplay requires `muted`, `playsinline`, `autoplay` attributes, add 500KB–2MB to first-load weight on cellular, and the motion design brief explicitly states "motion is editorial, not playful." A video of machinery or port operations would contradict the clinical-documentary aesthetic. Excluded.
