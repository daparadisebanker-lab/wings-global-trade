# Wings Global Trade — Explanatory Visuals Standard: ESQUEMA
**v1.0 · The rule system for every visual whose claim is explanation
("this is how it works / connects / flows"). Sits between
`WINGS_MEDIUM_AND_COMPONENT_LAW.md` Part I (which routes a need here)
and `WINGS_ILLUSTRATION_STANDARD.md` (which styles the drawing).
Subordinate to `WINGS_VISUAL_THESIS.md` v2.0 and the image-generation
thesis v2.1.**

---

## THE THESIS

> **An esquema answers exactly one question the reader actually has, in
> three tiers: context ghosted, subject inked, answer in gold. It may
> simplify the world; it may never falsify it. A drawing that explains
> a mechanism wrongly is a fabricated claim wearing a diagram.**

---

## THE THREE-TIER LAW — GHOST / INK / GOLD
*(decoded from the founding canon: the charging-cable plate — vehicle
ghosted in outline, cable system in full ink, control unit the only
color)*

| Tier | Contains | Rendering |
|---|---|---|
| **GHOST** | Context — everything the reader needs for orientation but is not being explained | Detail-weight line only, screened navy (freeze one value, start 30%), **no fills** |
| **INK** | The subject — the system being explained | Full navy, both stroke weights, flat fills per the Drawn Register |
| **GOLD** | The answer — the one element the question resolves to | Gold `#C4933F`, exactly one element per esquema |

Laws of the tiers:

1. Every esquema contains all three tiers. No ghost = no orientation;
   no gold = no answer; everything inked = nothing explained.
2. **Gold is the answer, not an accent.** It sits on the element the
   ficha (below) names — never on decoration, never on two things.
3. Tier membership is decided in the ficha before drawing, not
   discovered while drawing.
4. Generation approximates tiers; the file enforces them — stroke
   weights, screen values, and the single gold element are corrected in
   vector cleanup. The grammar lives in the SVG, not in hope.

---

## THE QUESTION TAXONOMY — one question, one form

An esquema is commissioned against the reader's question, written in the
reader's words, in Spanish. First match wins:

| Code | The reader's question | Form | Class | Notes |
|---|---|---|---|---|
| **Q-ANAT** | "¿Qué partes tiene?" | Cutaway / exploded plate | I1 | Gold on the part under discussion |
| **Q-CONN** | "¿Cómo se conecta?" | Connection diagram | I3 | The founding canon's form. Interfaces drawn true |
| **Q-SEQ** | "¿Cómo funciona el proceso?" | Step flow, left→right, numbered in DM Mono | I3 | Gold on the step that answers; one row, no snake layouts |
| **Q-MECH** | "¿Por qué pasa esto?" | Mechanism / causal diagram | I3 | e.g. why power derates at 3.200 msnm — cause chain drawn, gold on the cause |
| **Q-COMP** | "¿Cuál es la diferencia?" | Comparative plate, shared baseline & scale | I1/I3 | Same angle, same scale, or the comparison lies |
| **Q-DIM** | "¿Qué tamaño / capacidad?" | Dimension diagram, DM Mono values, ISO-style dimension lines | I1 | Values from the spec record only — a dimension is evidence |
| **Q-ROUTE** | "¿Por dónde viaja?" | Corridor / route map | I2 / A2 | Gold on the active route |
| **Q-STATE** | "¿Cómo va? ¿Cuánto queda?" | **Not an esquema.** Live state is instrument color | — | Boundary: drawn = timeless, ramp = live. A drawing of a live state is a stale reading |

One question per esquema — a visual answering two questions is two
esquemas. Compound surfaces (spec sheets, dossiers) compose multiple
esquemas; they never merge them.

---

## LA FICHA — the brief protocol (no ficha, no esquema)

Every esquema begins as a five-line ficha, filed with the asset:

```
PREGUNTA:   [the reader's question, their words, ES]
RESPUESTA:  [the answer in one sentence]
ORO:        [the single element that carries gold]
TINTA:      [minimum subject elements — everything else is cut]
FANTASMA:   [context elements, ghosted]
```

The ficha is the acceptance contract: gates are judged against it, the
Recraft prompt is assembled from it, and it lands in the MANIFEST row
(`ficha:` field). An esquema without a ficha is decoration with labels.

---

## THE GRAMMAR

1. **Reduction law.** If removing an element does not damage the answer,
   remove it; if it aids orientation only, ghost it. The reader's time
   is the budget.
2. **Simplify, never falsify.** Omission is legal; invention is not.
   Wrong wheel counts, impossible hydraulics, fantasy interfaces, or a
   cause chain that isn't the real cause = fabricated claim, evidence-law
   severity. Simplification collapses detail; it never rearranges truth.
3. **Reading direction.** Left → right, top → bottom. Sequence arrows in
   detail weight; steps numbered in DM Mono.
4. **Label law.** Labels in DM Mono, Spanish first, verified
   character-by-character (ñ á é í ó ú). Callouts in detail-weight line;
   the gold annotation tick marks the answer's label. Label what the
   ficha names; nothing else.
5. **Values are evidence.** Any number on an esquema (dimensions,
   capacities, ratings) comes from the SKU/spec record and is cited in
   the manifest row. No illustrative numbers, ever.
6. **The schematic disclaimer.** When an esquema sits adjacent to a
   specific SKU (spec sheet, product page), it carries "Esquema
   ilustrativo" in DM Mono — the drawing explains the class, it is not
   a blueprint of that unit. This keeps explanation from being read as
   evidence.
7. **Scale honesty.** Within one esquema, relative scale is either true
   or explicitly broken (break marks) — silent scale distortion is
   falsification.

---

## PROMPT ARCHITECTURE (extends the Drawn Register blocks)

Assemble: **[FICHA-derived SUBJECT] + [Q-FORM CLASS BLOCK] + [TIER
BLOCK] + [DRAWN REGISTER BASE BLOCK]**, strict `controls.colors`.

```
TIER BLOCK (mandatory, verbatim):
"Three-tier hierarchy: surrounding context elements as thin ghosted
navy outlines with no fill; the subject system in full navy ink with
two stroke weights and flat fills; exactly one gold element: [ORO from
ficha]. Nothing else carries color."
```

Route: `recraftv4_1_vector`, `n` 3–6 → vector cleanup enforcing tiers,
stroke ratio, single gold, labels re-set in DM Mono (generated text is
never trusted with diacritics). Consistency mechanism per the thesis:
canon-first at ≥5 accepted per Q-form (`CANON/drawn/esquema/<Q-code>/`).

---

## GATES (in addition to Drawn Register gates)

**Machine:** X1 ficha present and complete in manifest; X2 single-gold
audit (exactly one gold element, ΔE-matched); X3 palette/flatness
(inherited M5).

**Judged, against the ficha:** X4 **first-fixation test** — a cold
reader finds the gold element first and can state the RESPUESTA within
seconds; X5 tier audit — membership matches the ficha (nothing inked
that should be ghost, nothing ghosted that carries the answer); X6
**mechanism truth** — operator-eye check that the depicted mechanism,
connection, or sequence is the real one; X7 labels — ES, diacritics,
DM Mono, only what the ficha names.

Failures route to REJECTED.md with the gate code, per the thesis.

---

## WHERE ESQUEMAS LIVE

How-it-works sections; spec-sheet insets (with disclaimer, law 6);
dossiers; lane-page mechanics ("Trae tu grupo" flow, corridor
operation); Mister diagnosis explanations (in Mister livery per its
spec); onboarding surfaces. Never as ambience, never as empty states,
never answering Q-STATE.

## CHANGELOG

| Date | Ver | Change |
|---|---|---|
| 2026-07-08 | 1.0 | Created. Three-tier law decoded from the charging-cable canon; eight-question taxonomy; ficha protocol; grammar + gates. Component admission layer deliberately sequenced after this system. |

*Maintained in: `spec/WINGS_ESQUEMA_STANDARD.md` · Canon:
`assets/image-generation/CANON/drawn/esquema/` · Parents: Medium
Decision Law (routing) · Drawn Register (style) · Visual Thesis (law).*
