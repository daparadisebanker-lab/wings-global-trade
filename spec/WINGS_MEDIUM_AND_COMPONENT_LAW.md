# Wings Global Trade — Medium Decision Law & Component Admission Protocol
**v1.0 · Subordinate to `WINGS_VISUAL_THESIS.md` v2.0. Routes every
surface need to its governed medium, and defines how third-party UI
patterns are admitted into Wings interfaces. Sibling standards:
WORKING DAYLIGHT · C-HERO · THE DRAWN REGISTER · Mister expressive layer.**

---

## PART I — THE MEDIUM DECISION LAW

Every surface need is routed by one question: **what is the surface's
claim?** Ask in order; first match wins.

| # | The claim | Medium | Governed by |
|---|---|---|---|
| 1 | *"This is the actual product/work"* (evidence) | Restored real photography | Register C / C-HERO |
| 2 | *"This is the world Wings operates in"* (register, capacity) | Photorealism | Register B, Working Daylight |
| 3 | *"This is how it works / connects / flows"* (explanation) | Drawn diagram or plate | Drawn Register I1–I3 |
| 4 | *"This is a live reading"* (state, demand, progress) | Data visualization / instrument color | INSTRUMENT COLOR amendment; Mister expressive layer on Mister surfaces |
| 5 | *"This is a concept at a glance"* (wayfinding, category) | Pictogram | Drawn Register I4 |
| 6 | *"This lets you act or verify"* (interaction) | UI component | Part II below |
| 7 | *No claim at all* | **Nothing.** A surface with no claim gets whitespace, not imagery — decoration is the enemy of authority. |

Corollaries:

- **Photography shows; drawing explains; instruments read; components
  act.** A how-it-works section rendered as a moody photo is a routing
  error, not a style choice — same for a diagram doing a photo's job.
- Within the Drawn Register: object anatomy → I1 plate; place/route →
  I2 scene; process/connection → I3 diagram (canon anchor: the charging-
  cable plate — neutral field, ink linework, one accent on the subject
  component; Wings executes it as warm white / navy / gold).
- One medium per claim per surface. Mixed media on one surface is
  permitted only when the claims differ (a spec sheet may carry a C-HERO
  photo *and* an I1 cutaway — evidence and explanation are different
  claims).

---

## PART II — COMPONENT ADMISSION PROTOCOL

Third-party patterns (shadcn, Aceternity, 21st.dev, Radix compositions)
may enter Wings UI. The **pattern** is evaluated; the **skin** never
survives intake. Protocol:

### Gate 1 — Admissibility (does the interaction carry information?)

Admit only if the interactive behavior gives the reader data or agency
they didn't have: previewing a destination, revealing a spec, comparing,
filtering, verifying. If the behavior exists to delight — hover theater,
parallax garnish, cursor followers — refuse, whatever the demo looks
like. Test sentence: *"Without this interaction, the reader would not
know ______."* If the blank can't be filled, the component is
decoration.

### Gate 2 — The re-cut (mandatory, every admitted component)

| Law | Requirement |
|---|---|
| Radius | 2px. All `rounded-lg/xl/full` re-cut. |
| Motion | Ease only, 0.3–0.6s tween. Springs, bounces, and overshoot removed — replace `type:"spring"` with `ease` curves. Any motion channel carrying no data (mouse-follow, idle drift) is deleted. |
| Color | Tokens only: navy / gold / warm white (+ `--error`, + Mister livery on Mister surfaces). Gradients, `neutral-*` greys, and demo palettes replaced. |
| Ground | `#F8F6F0`, never `#FFFFFF`. |
| Type | The three-font semantic system; data values in DM Mono. |
| Copy | Specific, Spanish-first, no exclamation marks. Demo copy never ships. |
| Shadow | Functional elevation only (one small value); `shadow-xl` theater removed. |
| Dependencies | Third-party runtime calls audited: cost, privacy, determinism. Prefer self-hosted/static data with provenance. Deprecated APIs fixed at intake. |

### Gate 3 — Placement scope

The admission names *where* the component may appear and where it may
not. Ubiquity is decoration by volume — a preview on every link is noise;
on the right links it is intelligence.

### The register

Every admitted component gets a row in
`spec/COMPONENT_ADMISSIONS.md`: pattern, source, admissibility rationale
(the filled-in test sentence), re-cut applied, scope, date. Un-registered
third-party components do not ship.

---

## RULING 001 — LinkPreview (hover destination preview)

**Verdict: pattern ADMITTED · default skin REFUSED.**

*Admissibility:* "Without this interaction, the reader would not know
**what lies behind an external link before committing to it**." For a
reader who trusts data and distrusts marketing, previewing a source is
verification — the document proving it has nothing to hide.

*Scope — permitted:* external references where verification matters:
supplier and manufacturer sites, port-authority and customs pages,
regulatory sources, cited documentation on lane pages and dossiers.
*Refused:* internal navigation, footer/nav links, marketing flourish,
blanket application to all anchors.

*Re-cut spec (from the intake source):*

1. **Motion:** entrance `opacity/y` tween, `duration: 0.4, ease:
   "easeOut"`; scale pop reduced (0.98 → 1) or removed; exit mirrored.
   The `translateX` mouse-follow spring is **deleted** — carries no data.
2. **Card:** `rounded-[2px]`; border `1px` navy at 15%; ground
   `#F8F6F0`; `shadow-xl` → one small functional shadow.
3. **Data row (addition):** beneath the screenshot, the destination
   domain in DM Mono with a gold annotation tick — e.g.
   `▸ portadetacna.gob.pe · vista previa`. This converts the preview
   from picture to citation.
4. **Trigger text:** document link law — navy, underline; the demo's
   gradient text is refused categorically.
5. **Source of truth:** default to `isStatic` with **Wings-captured
   screenshots** stored in-repo with a capture date (provenance culture;
   no per-hover third-party call, no rate limits, light colorScheme
   guaranteed). The microlink dynamic mode is permitted only on internal
   tools. Stale captures: recapture cadence quarterly or on link change.
6. **Technical:** replace the deprecated Next/Image `layout` prop with
   the current API (`width/height` or `fill`); `alt` text set to the
   destination name, not "preview image".

*Register row:* `LinkPreview · Aceternity/21st.dev · verification of
external sources · re-cut per Ruling 001 · scope: external citations ·
2026-07-08`.

---

## CHANGELOG

| Date | Ver | Change |
|---|---|---|
| 2026-07-08 | 1.0 | Created. Seven-claim routing table; three-gate admission protocol; Ruling 001 (LinkPreview) as founding case. |

*Maintained in: `spec/WINGS_MEDIUM_AND_COMPONENT_LAW.md` · Register:
`spec/COMPONENT_ADMISSIONS.md`*
