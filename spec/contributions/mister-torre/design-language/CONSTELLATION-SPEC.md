# La Constelación — Canonical Specification v1.0

**The Mister isotipo as a governed system.** This spec supersedes any hand-approximated particle demo. Geometry was extracted programmatically from `Wings-Mister-isotipo.PNG` (1080×1080, ±1px); per-dot colors sampled from `Wings-Mister-isotipo-degradado.PNG`. Companion files: `constellation-map.json` (canonical data — the single source of truth) and `constellation-reference.html` (living reference; renders every state from the map).

**Scope:** Mister surfaces only (avatar, loading states, brand moments, artifact frames). Never applied to host-app chrome.

## 1. Canonical geometry (from the file, not from taste)

- **17 dots total** in normalized 0–1 space (origin top-left), defined in `constellation-map.json`.
- **Core M — 5 dots** (ids 12–16): two columns (12 top-left, 13 bottom-left · 15 top-right, 14 bottom-right) + center dot 16 sitting at the V. Core radii ≈ 0.0494–0.0498.
- **Bridges — exactly 4, fixed topology:** [12,13], [15,14] (the columns) and [12,16], [15,16] (the central V). Bridges exist **only** between these pairs. Satellites are never bridged.
- **Satellites — 12 dots in 3 radius classes:** large 0.0497 (ids 0, 4, 5, 11 — the N/W/E/S cross), medium 0.032 (ids 1, 2, 9, 10 — diagonals), small 0.0247 (ids 3, 6, 7, 8 — inner ring). The arrangement is symmetric about the vertical axis; preserve it exactly.
- **Reproduction tolerance: position ±1% of canvas, radius ±5%.** A render that fails overlay against the PNG is not the mark.

## 2. Bridge construction (the liquid joins)

Bridges are **metaball tangent shapes** (Hiroyuki Sato construction), never straight lines, never stroked plexus:

| Parameter | Value |
|---|---|
| Waist factor `v` | 0.5 |
| Bezier handle | 2.4 × r |
| Break distance | d > 2.6·(r₁+r₂) → bridge does not render |
| Fill | linear gradient between the two dots' colors |
| Recompute | every frame — bridges re-derive from live dot positions; they never stretch like rubber bands |

## 3. Color law

- **Flat mode:** every element `#3B82F6`. Used 32–96px and monochrome contexts.
- **Gradient mode (≥96px):** per-dot colors are FIXED from the map (sampled from the asset). The underlying field, measured by linear fit on the degradado (clamp 0–255):
  `R = 224.8 − 197.3x − 59.6y  ·  G = 264.4 − 123.0x − 43.1y  ·  B = 280.4 − 96.6x − 31.4y`
  Light enters upper-left (Sky #92C5FC territory) and deepens rightward/down (Horizon #1384AD). Use this formula to color *new* particles (grain, scatter) by position so they always belong to the field.
- **Dots never change hue by state.** Two sanctioned exceptions: ERROR cools the core toward Horizon; CONFIRM adds a Sky halo (stroke, 35% alpha) — the dots themselves stay.
- **< 32px:** render the static PNG asset. Do not run the system below legibility.

## 4. Behavior states (numeric contracts)

Mother rule: **chaos → order in ≤ 1200 ms.** All amplitudes are fractions of canvas size; springs given as stiffness/damping (Framer-style; canvas may use equivalent critically-damped lerp). `prefers-reduced-motion`: always static BASE; state changes become 200 ms crossfades.

| State | Trigger | Contract |
|---|---|---|
| **BASE** | default, small sizes, print, reduced-motion | zero motion; exact map |
| **IDLE** | at rest | noise drift: satellites amp 0.006, core 0.003, freq 0.05–0.15 Hz; breathing on satellite 0 only (scale 1→1.12, 4 s period); bridges recomputed per frame |
| **LISTENING** | user typing | satellites contract 8% toward centroid over 300 ms (ease-water); residual amp 0.002; core still |
| **THINKING** | request in flight | bridges fade 200 ms; dots shrink to 0.38·r; each dot emits 4 grain dots (r×0.28) orbiting at 2.2·r; global vortex 0.4 rad/s; **minimum 400 ms** even for instant answers |
| **SPEAKING** | streaming tokens | core radial pulse amp 0.004 synced to token cadence, throttled ≤ 8 Hz; satellites keep idle drift; settle 300 ms at end |
| **CONFIRM** | action approved/sent | spring return stiffness 120 / damping 26 to exact formation + one Sky halo pulse (1.8·r, 600 ms, once); then → IDLE |
| **ERROR** | failure/uncertainty | field loosens (amp ×2 for 400 ms), dots 2 and 10 drop 0.02 out of formation, core cools toward Horizon; never shakes, never turns red |
| **LOADING** | page/panel/artifact load | condensation cycle: initial scatter radius 0.5; condense 1100 ms cubic ease-in-out with per-dot stagger by distance from centroid (near first, ~40 ms/step); hold 1000 ms; dissolve 1100 ms; total cycle 3200 ms |

## 5. Placement & budget

- One full ConstellationField per viewport max. Avatar instances (≤48px core-only rendering is *not allowed* — avatar uses the full 17-dot map scaled, or the static PNG below 32px).
- Canvas 2D, DPR-aware capped at 2, single rAF loop, pooled particles, zero per-frame allocation; 30fps when tab unfocused.
- The Constellation is the ONLY always-animated element on any screen it inhabits.

## 6. Prohibitions

Straight plexus lines · bridges between satellites · spelling words with dots · recoloring by state (beyond §3 exceptions) · rubber-band bridges (must re-derive) · running the system under 32px · more than one field per viewport · any easing outside ease-water / ease-signal / the springs above.

## 7. Provenance & regeneration

Extraction method: alpha-mask → connected components (satellites = circle fit; core = Euclidean distance-transform maxima) → bridge detection by in-mask line sampling → color sampling at centers → least-squares gradient fit. If the isotipo asset is ever revised, re-run extraction and version the map (`constellation-map.v2.json`); never hand-edit coordinates.
