# Mister Motion Spec — UI/UX Animation Sequences for Paid Media

**What this is:** the single production spec for every motion-graphics and animation sequence that shows Mister's interface and the Wings process in ads. It feeds asset queue jobs MS1, MS4, MS5, MS6, CM4 (and adds new ones), and it is grounded in the *live* Mister front-end — every sequence cites the real component and the real animation constants it derives from.

**Governing principle:** Mister's motion identity already exists in code (`src/lib/mister/motion.ts` — "Every animation constant, easing value, and variant object in this file"). Ads do not invent a second motion language; they **re-perform the product's own motion at cinematic scale.** Anything an ad shows that the product does not do is either (a) rebuilt faithfully in After Effects from the constants below, or (b) flagged in §6 as a feature to build so the product catches up with the ad.

---

## 1. Motion DNA (extracted from the live system)

### 1.1 Duration scale (`DURATION`, motion.ts — verbatim values)

| Token | Value | Product use |
|---|---|---|
| instant | 0.080s | reduced-motion switches |
| micro | 0.120s | — |
| quick | 0.160s | quick-action tap |
| standard | 0.220s | user message entry |
| deliberate | 0.300s | assistant message, surface cards, launcher |
| window | 0.380s | window open/close, overlay panel |
| waterfall | 0.480s | waterfall strip segments |
| stagger | 0.040s | quick-action children stagger |

### 1.2 Easing signatures (`EASE`, verbatim)

| Signature | Curve | Character |
|---|---|---|
| messageAppear | [0.20, 0, 0, 1] | fast-out, long settle — a document laid on a desk |
| quickAction | [0.16, 1, 0.30, 1] | eager overshoot-free arrival |
| windowOpen | [0.22, 1, 0.36, 1] | confident open |
| windowClose | [0.55, 0, 1, 0.45] | brisk dismissal |
| surfaceSlide | [0.20, 0, 0, 1] | same family as messageAppear |
| typingIndicator | [0.45, 0.05, 0.55, 0.95] | sinusoidal breath (used by duties glow) |
| streamingText | [0, 0, 0.20, 1] | immediate start, soft landing |

### 1.3 Signature visual behaviors (component truth)

- **Waveform** (`MisterWaveform.tsx` + `useMisterWaveform.ts`): a canvas of **three superposed gold sine waves** (frequencies 0.015/0.025/0.04, phase offsets 0/π⁄3/2π⁄3), line width 1.5px. Idle: `rgba(196,147,63,0.22)`, low amplitude (0.35 factor of base 8px). Streaming: `rgba(196,147,63,0.70)`, full amplitude. **This is Mister's "voice" — the single most ownable motion asset in the product.**
- **Document Entry Format** (`MisterStreamingMessage.tsx`): assistant turns carry a 32px left margin column with a **ghost turn index (`01`, `02`…) and a 2px gold rule**; streaming text ends in a CSS blinking cursor (`mister-stream-cursor`). There is deliberately no "typing…" ellipsis — "stream or silence."
- **Quick actions** (`quickActionsContainer/ItemVariants`): exactly 3 chips, staggered 0.040s, children delayed 0.06s, y 4→0.
- **Waterfall** (`LandedCostWaterfall.tsx` + `getWaterfallStripSegmentVariants`): five strips (PRODUCTO · FLETE · SEGURO · ADUANAS · ÚLT. MILLA) scaleX 0→1, 0.48s each, **55% overlapped stagger**; table rows cascade beneath; total band fades in after strip 5 (delay = 0.48 × 0.55 × 5 + 0.1 ≈ 1.42s); **duties strip fires a one-time gold glow pulse at 1.30s** (0.6s sinusoidal). Gold appears ONLY on BASE 100.
- **Progress Panel** (`MisterProgressPanel.tsx`): right sidebar with stage rail (Inducción → Descubrimiento → Consideración → Pre-calificación → Soporte) and **collected-field rows grouped OPERACIÓN / EMPRESA / COMERCIAL that flip from pending to filled** as the conversation captures them.
- **SessionBrief** (`surfaces/SessionBrief.tsx`): the intake document — `RESUMEN DE SESIÓN` header, session id, archetype label in Spanish (`Comprador directo`, `Gerente de proyecto`, `Gerente de logística`, `Revendedor`, `Socio mayorista`), 9 brief fields where "empty fields create the pull."
- **Window/overlay** (`windowFloatingVariants`, `overlayPanelVariants`): open = opacity+y 20→0 over 0.38s windowOpen; close is faster and downward — the window *arrives deliberately, leaves briskly*.

### 1.4 The Ad Time-Dilation Rule

Product timings are tuned for use, not for viewing: 0.22s is imperceptible at feed scroll speed. **Ads may dilate any product duration by ×1.5–×2.0, uniformly within a sequence, never per-element.** Easing curves are never altered — the curve IS the identity; only the clock stretches. Sound (stamp, latch, room tone — brand sound kit) syncs to the dilated timings.

### 1.5 Prohibitions (inherit brand + Mister rules)

No springs, no bounce, no particles, no glow bloom beyond the duties pulse, no cursor-hand skeuomorphism, no fake iOS chrome. No absolute prices anywhere in any frame — captured or composited — and any waterfall frame must keep the micro-disclaimer legible (`rango ilustrativo — no es cotización`, `WATERFALL_COPY.microDisclaimerEs` verbatim). Session ids visible in frame must be demo-mode ids (§5).

---

## 2. The Sequence Library

Ten named sequences. Each lists: job, beats with timings (already time-dilated where noted), source of truth, capture method (**REAL** = screen capture of live UI · **REBUILD** = AE recreation from constants · **HYBRID**), and gaps.

---

### SEQ-01 «Apertura» — the window arrives
**Feeds:** MS1 opening, MS6 opening, any Reel cold-open. **Length:** 2.5s.
1. (0.0s) Navy frame, site visible dimmed beneath.
2. (0.3s) Launcher fades up (launcherVariants: y 12→0, 0.3s, 0.8s delay compressed to 0.3s for ads).
3. (0.8s) Tap → window opens: opacity+y 20→0, windowOpen ease, dilated to 0.6s.
4. (1.6s) First induction message streams in (Document Entry Format: ghost index `01` + gold rule draw), waveform ignites idle→active.
**Method:** REAL (all behaviors exist). **Gap:** none.

### SEQ-02 «La inducción» — three questions, one profile
**Feeds:** MS1 (hero), MS6 (per-lane variants). **Length:** 8–12s.
1. Q0 opener streams (real es-PE surface text), cursor blinking.
2. Quick-action chips stagger in (3 chips, 0.04s stagger dilated ×2).
3. User taps a chip (quickActionTap: 0.16s press) — reply renders as user message (y 6→0).
4. Beat repeats ×2 with lane-specific questions (from the lane question banks, MISTER_MASTER_BRIEF §D2).
5. **Resolution moment:** archetype label appears — `GERENTE DE PROYECTO` stamps into the progress panel / SessionBrief identity block, gold rule underlines it.
**Method:** HYBRID. Beats 1–4 REAL via demo mode (§5). Beat 5 **does not exist as a visible ceremony** — today the archetype label just re-renders with no transition. → **Feature flag F3.** Until F3 ships, beat 5 is REBUILD (AE: label clip-up + 2px gold rule draw left→right, 0.4s, messageAppear ease + stamp sound).

### SEQ-03 «El expediente se llena» — the brief that writes itself
**Feeds:** NEW static+motion concept (add to briefs as MS7); also B-roll for MS1/MS6. **Length:** 6–8s.
The most persuasive process shot in the product: the ProgressPanel / SessionBrief fields flipping from ghost-pending to filled as the conversation advances — `PAÍS DE DESTINO — Perú` · `INCOTERM — CIF` · `CONTENEDOR — 40HC` · `VOLUMEN` · `RUC` … Empty fields "create the pull" (the component's own design note).
1. Split frame: conversation left, brief right (the real embedded desktop layout).
2. Each user answer → matching field flips filled ~0.5s later; camera (digital zoom) drifts toward the brief.
3. Final frame: brief 70% filled, stage rail ticks to `PRE-CALIFICACIÓN`.
**Method:** REAL via demo mode. **Gap (minor):** field-flip today is an unanimated re-render; a 0.22s fill transition (gold dot + value fade-in) would make capture cinematic → **Feature flag F6** (also a genuine UX improvement). Until then REBUILD the flips in AE over a real capture plate.

### SEQ-04 «La cascada» — the landed-cost waterfall builds
**Feeds:** MS1 beat 4, CM4, MS2 motion variant. **Length:** 4.5s (product timing ≈ 2.8s, dilated ×1.6). **The signature sequence.**
1. Surface card slides in (surfaceCardVariants y 16→0).
2. Five strips draw left→right in 55%-overlap stagger: PRODUCTO (gold, BASE 100) → FLETE → SEGURO → ADUANAS → ÚLT. MILLA.
3. (≈2.1s dilated) **Duties glow pulse** — the one sanctioned flourish; sync the stamp sound here.
4. Table rows cascade; total band fades in as `[low – high]` — never a scalar.
5. Hold 1s on footer disclaimer (must be legible: ≥ 24px equivalent in 9:16).
**Method:** REAL — the component does all of this today (`getWaterfallStripSegmentVariants`, `DUTIES_GLOW_*`, `waterfallTotalVariants`). Capture at 0.5× playback speed via demo-mode speed control (F1) OR rebuild in AE for 4K masters. **Gap:** none functionally.

### SEQ-05 «La voz» — waveform idle → speaking
**Feeds:** loopable ident (Stories, thumb-stopper, endcards); MS4. **Length:** 6s seamless loop.
Macro shot of the waveform canvas: three gold sines breathing at idle (0.22 alpha), then a message begins — amplitude and alpha swell to 0.70, text streams beneath with blinking cursor, then settles back to idle. Loop point at idle-crossing.
**Method:** REBUILD (AE/Lottie) from the exact hook constants (frequencies 0.015/0.025/0.04, phases 0/π⁄3/2π⁄3, base amplitude 8, alpha 0.22→0.70, 1.5px stroke) — canvas capture at 1080p would alias; the constants let us re-render at any resolution with zero drift from product truth. **Gap (product, optional):** waveform reacts only to `isStreaming`; a "listening" micro-state while the user types would enrich both product and footage → **Feature flag F5.**

### SEQ-06 «Comparación sin humo» — indexed comparison
**Feeds:** MS3 carousel motion card, A2-targeted variants. **Length:** 5s.
Two scenario columns build side-by-side (IndexComparison surface), delta callout lands as an index-point difference with its driver label ("container efficiency" class of copy) — never a currency delta (`IndexComparisonView` type forbids it).
**Method:** REAL capture of the surface; REBUILD if art direction needs 4K. **Gap:** none (component exists: `surfaces/IndexComparison.tsx`).

### SEQ-07 «El traspaso» — diagnosis becomes a document
**Feeds:** MS5, MS4 endings, SEQ-09 finale. **Length:** 4s. **The conversion money-shot.**
1. Quick action `Conectar por WhatsApp` tapped.
2. The session compresses into the ops WhatsApp document (brand system §10 template): `WINGS GLOBAL TRADE · NUEVA CONSULTA` — rows type on in Teko: `REF · WGT-2847` · `PRODUCTO` · `DESTINO` · `RECIBIDO … PET` · `RESPUESTA ESPERADA < 24H`.
3. Gold seal stamp lands on the REF row + stamp sound. Cut to endcard.
**Method:** REBUILD (the ops notification is a backend artifact — `src/lib/notifications/` — the user never sees it; the ad dramatizes the real payload format truthfully). **Gap (product):** Mister itself has **no visible handoff ceremony** — after submit there is no WGT-stamped success surface inside the conversation. That moment is product gold, not just ad gold → **Feature flag F4.**

### SEQ-08 «Cinco perfiles» — the archetype montage
**Feeds:** MS6 entirely. **Length:** 5 × 3s + close.
Five rapid SEQ-02-style vignettes, one per lane, each closing on its Spanish archetype label from `SessionBrief.ARCHETYPE_LABELS` (verbatim): `COMPRADOR DIRECTO` · `GERENTE DE PROYECTO` · `GERENTE DE LOGÍSTICA` · `REVENDEDOR` · `SOCIO MAYORISTA`. Different opening question per vignette (each lane's real Q1).
**Method:** REAL, but **only viable with demo mode (F1)** — five deterministic scripted sessions; capturing live model output would produce uncontrollable variance and API cost. **Gap:** F1 required; F3 makes the label lands clean.

### SEQ-09 «El proceso completo» — 45s brand-process film
**Feeds:** NEW anchor asset (upgrade of CM4's scope; brand + Mister campaigns share it). **Length:** 45s + 15s cut.
The whole Wings process as one continuous blueprint-mode shot, with Mister UI moments embedded:
1. (0–6s) Corridor map draws (B1 vocabulary) — origin markets converge on the two real coordinates.
2. (6–14s) SEQ-01+02 compressed: window opens, induction resolves a profile.
3. (14–22s) SEQ-03: the brief fills.
4. (22–30s) SEQ-04: the waterfall builds; disclaimer hold.
5. (30–38s) SEQ-07: the WhatsApp document composes, WGT stamp.
6. (38–45s) `RESPUESTA ESPERADA < 24H` ticks like a document timestamp → endcard `Precisión. Proximidad. Confianza.`
**Method:** HYBRID — map/document REBUILD, UI moments from the SEQ-01…07 capture bank. This is the most expensive asset in the program (effort L+); produce after P0 proves the channel.

### SEQ-10 «Micro-loops» — 6–10s idents
**Feeds:** Stories filler, retargeting frequency relief, profile-cover video. Three loops:
- 10a: waveform breath (SEQ-05 idle only).
- 10b: quick-actions stagger in → out (container exit y -4) → in, seamless.
- 10c: waterfall strips draw → hold → dissolve (opacity only) → redraw.
**Method:** REBUILD (loop math needs frame-exact control). **Gap:** none.

---

## 3. Sequence → asset queue mapping

| Sequence | Existing job(s) it feeds | New job to add |
|---|---|---|
| SEQ-01, SEQ-02 | #4 MS1-preguntas | — |
| SEQ-03 | — | **#27 MS7-expediente** (Reel 15s + 4:5 still of the filled brief) — P1 |
| SEQ-04 | #4, #11 CM4-camino | — |
| SEQ-05, SEQ-10 | — | **#28 ident-pack** (3 loops + endcard master) — P1 |
| SEQ-06 | #12 MS3-corredor | — |
| SEQ-07 | #8 MS5-whatsapp | — |
| SEQ-08 | #19 MS6-cinco | — |
| SEQ-09 | — | **#29 proceso-45** — P2, gate on channel proof |

---

## 4. Production standards

- **Masters:** 2160×3840 (9:16) comps; deliver 1080×1920 / 1080×1350 / 1080×1080. 30fps (product easings read cleanly; 60fps only for SEQ-05 loop).
- **UI plates:** capture at devicePixelRatio 2, browser chrome hidden, dark navy backdrop matching `--mister-bg` tokens; never letterbox the window — recompose per format from the capture stage (F2).
- **Type in composites:** NissanOpti 400 display, Flexo body, Teko for every numeral/label — matching the UI's own `font-mono`/`font-body` usage so composited frames are indistinguishable from captured ones.
- **Sound:** brand kit (stamp = SEQ-04 duties pulse + SEQ-07 seal; latch = window open; room tone throughout). Every sequence must survive muted — supers carry meaning, sound rewards.
- **Static fallbacks:** every sequence exports a final-frame still (its "document at rest") for placements/users where video underdelivers — the motion system's equivalent of `prefers-reduced-motion`, which the product itself honors everywhere (`visibleReduced` variants).
- **Localization:** es-PE only at launch (program assumption A7).

## 5. Capture infrastructure (required tooling)

Clean, deterministic, cost-free UI footage requires a **demo/replay mode** that does not exist today. Without it, every capture session burns Claude API tokens, hits the IP rate limiter (`rateLimit.ts`), and produces non-repeatable takes. See F1/F2 — these two flags block SEQ-02/03/08 REAL captures and are the first build items.

## 6. Feature flags — ideated in this spec but NOT in the product today

| Flag | What | Where it would live | Size | Value beyond ads |
|---|---|---|---|---|
| **F1 — Demo/replay mode** | `/mister?demo=<script-id>&speed=<0.5–1>`: plays a scripted conversation (canned SSE event streams, one per archetype lane) with controlled typing cadence; no API call, no rate limit, no DB writes. Env-gated (`NEXT_PUBLIC_MISTER_DEMO=1`, never prod-public). | `src/lib/mister/` demo fixtures + a branch in `useMisterStream` | **M (1–2 days)** | Sales demos, onboarding, QA regression of stream rendering |
| **F2 — Capture stage** | A dev-only route rendering the Mister window alone on a clean navy stage at exact 9:16 / 4:5 / 1:1 canvas sizes, chrome-free, demo-id session labels | dev route + layout wrapper | **S (half day)** | Screenshot generation for docs/OG images |
| **F3 — Archetype resolution ceremony** | When `state.archetype` first leaves `unresolved`: label clip-up + 2px gold rule draw + subtle haptic (haptics.ts exists) in ProgressPanel/SessionBrief identity block. 0.4s, messageAppear ease. | `MisterProgressPanel.tsx`, `SessionBrief.tsx`, variants in `motion.ts` | **S** | Makes the product's core moment *felt* — the diagnosis becomes visible UX, likely improves induction completion |
| **F4 — Handoff ceremony (WGT stamp)** | Post-submit success surface inside the conversation: session compresses to a document card with `REF · WGT-XXXX` stamp animation + `RESPUESTA ESPERADA < 24H`. Mirrors catalog `InquirySuccess` + reference format (`src/lib/reference.ts` pattern). | new surface component + submit flow hook | **M** | Closes the loop the ops WhatsApp template already promises; the ref number gives the lead a durable artifact |
| **F5 — Waveform listening state** | Third waveform state: amplitude ~0.5, alpha ~0.4 while the composer has focus/typing — Mister "leans in" | `useMisterWaveform.ts` (add state), `MisterComposer` focus wiring | **XS** | Perceived attentiveness; footage richness |
| **F6 — Collected-field fill transition** | 0.22s standard-ease fill animation (gold dot scale-in + value fade) when a ProgressPanel/SessionBrief field flips pending→filled | `MisterProgressPanel.tsx` + `motion.ts` variant | **XS** | The "expediente se llena" pull becomes visible in-product, not just in ads |
| **F7 — Stage-rail advance tick** | Animated tick when `stage` advances on the rail (rule extends, label brightens) — verify current behavior first; panel imports framer-motion but transition coverage of stage change is unconfirmed | `MisterProgressPanel.tsx` | **XS (verify first)** | Progress legibility |

**Build order recommendation:** F1 → F2 (unblock capture) → F3 + F6 (cheap, high ad+product value, needed for SEQ-02/03 REAL) → F4 (product feature, schedule with dev roadmap) → F5/F7 (polish batch).

**Constraint honored:** all flags are additive UI/dev-tooling work; none touches Mister's conversation logic, guardrails, or the anti-price architecture. F1's canned streams must themselves pass the same rule — no absolute price, availability, or lead time in any demo script.

## 7. Acceptance gates (per delivered sequence)

1. **Truth gate:** every UI behavior shown either exists in code (cite component) or is an approved F-flag rebuild — no invented interface.
2. **Rules gate:** frame-by-frame scan for currency figures, availability, lead-time claims; waterfall frames show the disclaimer legibly.
3. **Motion gate:** timings are product constants × one uniform dilation factor; easings untouched; no springs.
4. **Brand gate:** navy/gold/warm-white only; gold count per frame ≤ 2 meaning-carrying uses; Teko on every numeral; no exclamation marks in supers.
5. **Mute gate:** the sequence communicates fully with sound off.
