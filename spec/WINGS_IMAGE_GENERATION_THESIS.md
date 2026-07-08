# Wings Global Trade — Image Generation Thesis
**v2.0 · Authority document for all AI-generated and AI-processed imagery.
Subordinate to `WINGS_VISUAL_THESIS.md` v2.0 — where they conflict, the
parent thesis wins.**

---

## THE THESIS

> **"The dossier is drawn; the campaign is shot; the evidence is real.
> Wings generates scenario, restores documentation, and never fabricates
> proof."**

And the campaign register now has a name and a law:

> **WORKING DAYLIGHT — the world of Wings is photographed at 09:00 on a
> working day, in mineral light, with one color mass per frame. The brand
> does not do dusk. The brand does not do mood. The brand does work.**

Three registers, three laws:

| Register | Surface | Law |
|---|---|---|
| **A — The Document** | apps/site product surfaces: catalog, spec sheets, lane pages, FillMeter, stamps | Constructed graphics only — plates, charts, seals. Nothing photographic-passing is *generated* here. |
| **B — The Campaign** | Marketing: Meta ads, social, decks, landing heroes | Photorealism permitted — governed by the Working Daylight standard below. |
| **C — The Evidence** | Supplier product photography, wherever it appears | Always real photography at origin. Restored and staged by pipeline — never reinvented. |

**The rule in one line: scenario may be generated; evidence may not.**
(Full rationale preserved in §WHY below — do not relitigate.)

---

## WHY THE LINE SITS WHERE IT DOES

The reader Wings is built for *"trusts data and distrusts marketing."* The
one thing that can never be generated is **evidence** — an image that makes
a factual claim about the goods, a supplier's facility, or work Wings has
done. A buyer who discovers one fabricated weld seam distrusts every number
on the page, and the asset Wings sells is certainty.

A campaign image of a machine on a working road makes no factual claim — it
sets a register. Generated photorealism is legitimate there for the same
reason commissioned brand photography would be: it is art direction, not
proof.

---

## REGISTER A — THE DOCUMENT (constructed graphics)

Unchanged law: on product-truth surfaces, generated imagery is openly
constructed — the engraved-certificate register (banknote engraving, Lloyd's
documents, patent plates, nautical charts). Its authority comes from visible
craft, not simulation.

| # | Class | What it is | Route |
|---|---|---|---|
| A1 | **Technical plates** | Machinery line-art, exploded views, cutaways | `recraftv4_1_vector`; V3 `Digital engraving`/`Crosshatch` |
| A2 | **Cartography** | Trade lanes, ports, routes, terrain as chart drawings | `recraftv4_1` / `recraftv4` |
| A3 | **Stamps, seals, emblems** | LaneStamp material, marks *of Wings' own devising* | V3 `Stamp`/`Prestige Emblem`, or `recraftv4_1_vector` |
| A4 | **Cargo illustration** | FillMeter cargo sets to the shared container grammar | `recraftv4_1_utility_vector` → vectorize → manual grammar cleanup |
| A5 | **Flat system diagrams** | Process/feature illustration in the flat 2-color idiom (canon ref: EV-charging plate — one livery red→**gold** mass, line-drawn subject, neutral field) | `recraftv4_1_vector` |
| A6 | **Texture grounds** | Texture-library members only, ≤ perceptual 5% | `recraftv4_1` seamless prompts |
| A7 | **Diagram bases** | Infographic/poster compositions, ES text in quotes | `recraftv4` or V3 + `text_layout` |

*A5 is new (2026-07-08): the canon's flat charging diagram demonstrates the
target idiom — one saturated mass, grey line-work, no gradients, no depth
theater. Wings executes it in navy line + single gold mass on warm white.*

---

## REGISTER B — THE CAMPAIGN: THE WORKING DAYLIGHT STANDARD

The founding canon (ingested 2026-07-08, twenty frames of Scandinavian and
Japanese industrial commercial photography) was decoded into the laws below.
The canon is studied for register only — third-party vehicles, marks, and
trade dress are never reproduced (see REFUSED).

### The Nine Laws

1. **EXPOSURE LAW — daylight is the default state of the brand.**
   Reference hour: 09:00–11:00 working light, or bright thin overcast (the
   sky is a softbox). Shadows are open — detail survives in them. Whites are
   luminous, never blown. Machine-checkable target: mean luminance of an
   accepted asset falls between **45–65%**; no more than **2%** of pixels
   below 5% luminance (calibrate thresholds against canon, then freeze).
   *Navy is the hue of shadow, never the level of exposure.*
   Exception: **one** high-key dusk frame per campaign (canon ref: fleet
   lineup at sunrise — luminous sky, readable midtones), designated in the
   brief in advance. Night exists only for product-feature interiors and
   reads clean, never moody.

2. **MINERAL WORLD, ONE SATURATED MASS.**
   Environments are desaturated minerals: concrete, gravel, steel, overcast
   sky, arid Andean terrain, warm-white haze. Exactly **one** color mass per
   frame carries saturation, and it is the livery: navy on the machine (the
   dark-tractor canon move) or gold as the single accent object (the
   yellow-loader canon move — a strap, a painted line, a marking). Two
   saturated masses = regenerate.

3. **PRODUCT AS PROTAGONIST.**
   The machine is sharp, occupies 20–40% of frame, sits at 3/4 angle with
   camera at hood height. The environment states the job; the product states
   the answer. No machine floating in abstraction; no environment swallowing
   the subject.

4. **REAL-WORK STAGING.**
   Sites look mid-shift: cargo strapped, cones placed, surfaces used. Never
   showroom-sterile, never staged-lifestyle. The wholesale register holds —
   capacity and certainty, not unboxings.

5. **HUMANS CLAUSE** *(amended 2026-07-08 — supersedes the categorical
   refusal; ratified by founder or this clause reverts).*
   Generated human figures are permitted **only** as workers at working
   distance: mid-task, backs turned or in profile, wearing PPE, faces never
   resolvable at 200% zoom, never addressing camera, never the focal
   subject. Hands and faces are never the subject of a generated frame.
   Close-range portraits, teams, testimonials, and any identifiable person
   remain **real photography only** — raise it, don't generate it. All
   generated anatomy passes the 200% artifact gate or the frame dies.

6. **LENS VOCABULARY.**
   Heroes: 35–50mm at hood height. Detail plates: 85–105mm macro, shallow
   depth, neutral out-of-focus industrial ground. Aerials: high wide, roads
   and corridors reading as drawn lines. Prompts name the lens and camera
   height — concreteness is the anti-drift mechanism.

7. **BANNED VOCABULARY** — in prompts, briefs, and file names:
   *cinematic, moody, dramatic, atmospheric, epic, stunning, volumetric,
   fog, haze (except "thin morning haze" in aerials), golden hour, dusk,
   sunset, night, neon, lens flare, teal and orange.* The banned list is
   enforced programmatically (Gate M2).

8. **MOTION THROUGH ENVIRONMENT.**
   Speed is a panned, blurred world behind a sharp machine — never a blurred
   subject, never speed lines, never particle theater.

9. **GRADE, DON'T TINT.**
   The livery arrives through grading targets — navy shadows *in hue*,
   warm-white highlights, gold scarce — stated in the prompt. Hard color
   controls are not forced onto naturalistic scenery (see PALETTE LAW).

### The Five Shot Classes

| # | Class | Compositional law | Canon anchors |
|---|---|---|---|
| B1 | **Hero-in-environment** | 3/4 front, hood height, machine sharp, working road or site, generous sky, optional panned blur | highway heroes; mint crane truck; SUV on mountain road |
| B2 | **Detail plate** | Macro on one component, shallow DOF, neutral blurred ground — engineering as jewelry | mirror-cam; headlamp; wheel set |
| B3 | **Aerial corridor** | High aerial, infrastructure aligned to frame geometry, arid terrain, thin morning haze | desert interchange (directly transferable to Andean corridors) |
| B4 | **Fleet / lineup statement** | Formation on concrete apron, elevated 3/4, bright overcast; studio cutout variant on warm white for spec surfaces | four-truck lineup; navy tractor cutout |
| B5 | **Working scene** | Workers at working distance under Law 5, cargo mid-handling, candid documentary | stone-block loading; urban crane delivery |

### House Prompt Architecture

Every Register B generation is assembled as:
**[SUBJECT] + [CLASS BLOCK] + [BASE BLOCK] + [GRADE BLOCK]**, with the
negative block attached where the model supports it.

```
BASE BLOCK (mandatory, verbatim):
"Commissioned commercial photography for an industrial trade company.
Bright diffuse daylight, high thin overcast sky, open shadows, even
exposure, clean luminous whites, natural desaturated color, mineral
environment, 09:00 working light."

GRADE BLOCK (mandatory, verbatim):
"Color restrained to one saturated mass: deep navy machine livery or a
single gold accent object. Shadows lean navy in hue, highlights warm
white. No color washes."

NEGATIVE BLOCK:
"dark, underexposed, moody, dramatic, cinematic, atmospheric, dusk,
sunset, night, fog, volumetric light, teal and orange, heavy vignette,
HDR glow, lens flare, oversaturated"

CLASS BLOCKS:
B1 "Three-quarter front view, camera at hood height, 35mm lens, machine
    sharp against a softly blurred working road or site."
B2 "Macro detail of [component], 100mm lens, shallow depth of field,
    neutral out-of-focus industrial background."
B3 "High aerial view, logistics corridor aligned to frame geometry, arid
    Andean terrain, roads reading as drawn lines, thin morning haze."
B4 "Machines in formation on a concrete apron, elevated three-quarter
    view." / cutout: "studio product photograph, seamless warm-white
    sweep, soft even light."
B5 "Workers at working distance securing cargo, backs to camera or in
    profile, PPE, no legible faces, candid documentary framing."
```

Routes: explore on `recraftv4_1` (`n` 3–6, short prompts within the
architecture); `_pro` for print/large-format. Meta formats: generate the
closest supported size to 1:1 (1080²), 4:5 (1080×1350), 9:16 (1080×1920);
`crisp_upscale` to final pixel size.

---

## REGISTER C — THE EVIDENCE (supplier photo restoration)

Supplier photography is **restored, never reinvented**:

- **Pipeline:** original → `crisp_upscale` (faithful enlargement) →
  `remove_background` where staging is needed → `replace_background` onto
  livery-consistent grounds → export.
- **Staging grounds now follow the mineral world:** warm-white studio sweep
  (canon: cutout idiom) or desaturated concrete apron. Grounds obey the
  Exposure Law — no dusk staging, ever.
- **`creative_upscale` is refused on product surfaces.** It invents detail;
  invented detail on goods offered wholesale is misrepresentation.
- **Never alter the product:** no geometry, color, badge, or condition
  changes. `image_to_image` on a supplier photo is refused.
- Restored-and-staged supplier photos may serve as primary product images.
- Manifest logs the original file, every operation, and the supplier source.

---

## REFUSED — all registers, categorical

- Fabricated evidence — anywhere, including decks.
- Generated faces, portraits, or identifiable people (working-distance
  figures per Law 5 only).
- Real-world marks: certification logos, port-authority signage, client,
  competitor, or **canon-source** brands and trade dress. Wings' own stamps
  only. Canon is studied, never sampled.
- `creative_upscale` or generative editing on supplier product photography.
- Gradient meshes, ambient decoration, retail-lifestyle scenes.
- Low-key, dusk-default, or mood-first art direction (Exposure Law).
- In-image UI text. Only *drawn* type (stamps, plates, chart labels) or
  campaign display type may be baked in — Spanish first, verified
  character-by-character including diacritics (ñ á é í ó ú).

---

## PALETTE LAW v2

House livery (source of truth: `packages/liveries/wings/livery.css`):

| Token | Hex | RGB | Role in imagery |
|---|---|---|---|
| Navy | `#001E50` | `{r:0, g:30, b:80}` | The machine's color; the hue of shadow |
| Gold | `#C4933F` | `{r:196, g:147, b:63}` | The single accent object; never a wash |
| Warm white | `#F8F6F0` | `{r:248, g:246, b:240}` | Highlight target; studio grounds; paper |

**Per-register controls policy:**

- **Register A:** strict — pass all applicable tokens via `controls.colors`
  on every generation; palette restated in the prompt.
- **Register B:** palette enforced through the GRADE BLOCK and the
  one-saturated-mass law, **not** hard `controls.colors` — forcing three
  tokens onto naturalistic terrain fights realism and muddies exposure.
  Optional: pass navy alone when the machine is the subject.
- **Register C:** grounds sampled from tokens directly; product colors
  untouched by definition.
- **Compatibility clause:** `controls` support must be verified per model
  generation before reliance; where unsupported (verify on V4.1), the
  fallback is prompt-side grade language + post-grade, and the MANIFEST
  notes which mechanism enforced palette.

Pure black and pure white stay refused. When lanes WGT/01–06 onboard, each
lane substitutes its registered livery (`packages/liveries/registry.md`)
into the same laws — the laws do not change, only the tokens.

---

## THE CANON

`assets/image-generation/CANON/` is the case law of this thesis. Verbal law
drifts without exemplars; every judged gate is judged **against canon**.

- Founding canon: the 2026-07-08 reference ingest (20 frames), filed by
  shot class (B1–B5, A5). Third-party material — register study only.
- Every class carries 5–10 **accepted Wings specimens** as it matures, plus
  3–4 **instructive rejections** annotated with the gate that killed them.
- An asset class without canon cannot pass Gate J3 and therefore cannot
  ship at volume — exploration only.

---

## CONSISTENCY MECHANISM v2 — canon first

1. Explore with V4.1 (`n` 3–6) through the House Prompt Architecture until
   a class language settles.
2. At **≥5 accepted assets** of a class: file them to CANON, freeze the
   class prompt block, and *optionally* distill a V3 custom style
   (`create_style`, base `realistic_image`, the 5 best frames as PNG
   references; reference filenames logged in MANIFEST).
3. **Validation clause:** the distilled V3 style must beat or tie the
   V4.1 + frozen-block baseline in a three-subject side-by-side (B1, B2,
   B3 subjects) — adopted only if preferred in ≥2 of 3. Otherwise the
   class remains on V4.1 with its frozen block as the consistency
   mechanism. V3's tonal drift is a known regression risk; the Exposure
   Law gate applies to style-distilled output with no exemptions.
4. A `style_id` is bound to the model and base style at creation — reuse
   only with the same model; record the binding in MANIFEST.
5. New exploration requires a reason, not a mood.

---

## ACCEPTANCE GATES v2

Split into **machine gates** (run by hook/script, deterministic, no
discretion) and **judged gates** (human or LLM-judged against canon).
All must pass before an asset leaves `assets/`.

**Machine gates** (PostToolUse hook; rules in `thesis.lint.json`):

- **M1 — Exposure:** mean luminance 45–65%; ≤2% of pixels below 5%
  luminance (Register B; thresholds frozen after canon calibration).
- **M2 — Vocabulary:** prompt and filename contain no banned terms.
- **M3 — Format:** size/aspect matches destination spec; upscale route
  correct (`crisp` only on Register C).
- **M4 — Provenance:** MANIFEST row exists and is complete, or the asset
  does not ship.
- **M5 — Palette (Register A only):** dominant colors within tolerance of
  livery tokens.

**Judged gates** (against CANON specimens):

- **J1 — Register test.** A: could it be tipped into a certified dossier?
  B: could it hang in the founding canon without flinching? C: faithful to
  the original in every product detail?
- **J2 — Evidence test.** Does it make a factual claim it cannot back?
  Kill it.
- **J3 — Canon match.** Does it obey the Nine Laws and its class's
  compositional law?
- **J4 — Artifact scan at 200%.** Melted lines, phantom letters, impossible
  mechanics; hydraulics, cables, tread patterns, and all generated anatomy
  get special scrutiny.
- **J5 — Parent test.** Certified document, not marketplace listing.
- **J6 — Tension clause** *(rewritten — was the "Awwwards clause")*: the
  frame contains **exactly one** deliberate tension device: a ≥5:1 scale
  contrast between product and an environment element, the single
  saturated mass placed off-center, an off-axis composition, or a panned
  motion field behind a sharp subject. Zero devices = flat, regenerate.
  Two or more = theater, regenerate.

Machine-gate rules ship as `assets/image-generation/thesis.lint.json`:

```json
{
  "version": "2.0",
  "banned_terms": ["cinematic","moody","dramatic","atmospheric","epic",
    "stunning","volumetric","fog","golden hour","dusk","sunset","night",
    "neon","lens flare","teal and orange"],
  "exposure": {"register":"B","mean_luma":[0.45,0.65],
    "shadow_floor":{"below":0.05,"max_pct":0.02}},
  "palette_strict_registers": ["A"],
  "livery": {"navy":"#001E50","gold":"#C4933F","warm_white":"#F8F6F0",
    "tolerance_deltaE": 12},
  "upscale": {"register_C": "crisp_upscale_only"},
  "manifest_required_fields": ["file","class","register","lane","model",
    "seed","prompt_or_source_ops","style_id","date","destination"]
}
```

---

## PROVENANCE

Every accepted asset gets a MANIFEST.md row: file, class, register, lane,
model, seed, prompt (or source file + operations for Register C),
style_id + reference filenames where applicable, date, destination. An
asset without a manifest row does not ship.

**Rejection log (new):** every asset killed at a gate gets a REJECTED.md
row — file, gate that killed it, one-line reason. Rejection reasons feed
the prompt library monthly; the pipeline learns from its dead.

Generated scenario imagery is never captioned or alt-texted as documentary
photography of Wings operations.

---

## AMENDMENT PROTOCOL

Only the founder amends this document. Agents propose amendments via
`DEFERRED.md` with rationale; inline edits by agents are void. Every
amendment lands as a changelog row and a version bump.

## CHANGELOG

| Date | Ver | Clause | Change | Reason |
|---|---|---|---|---|
| 2026-07 | 1.0 | — | Created; registers restructured; photorealism + supplier restoration added | Founding |
| 2026-07-08 | 2.0 | Register B | Rewritten as the Working Daylight standard: Nine Laws, five shot classes, House Prompt Architecture | Founding canon ingested; prior output failed the brand's own character (dark/dull drift); reference anchors (Salgado, dusk grading) identified as root cause and replaced |
| 2026-07-08 | 2.0 | Law 5 | Humans clause: categorical refusal → bounded working-distance permission; faces still refused | Canon feel requires human presence; anti-detection logic preserved. **Pending founder ratification** |
| 2026-07-08 | 2.0 | Gates | Split machine/judged; Gate 6 rewritten as operational tension clause; exposure gate added; `thesis.lint.json` introduced | Autonomous-agent enforceability |
| 2026-07-08 | 2.0 | Palette | Per-register controls policy; controls-compatibility clause | Hard token controls on naturalistic scenes fight realism; V4.1 controls support unverified |
| 2026-07-08 | 2.0 | Consistency | Canon-first; V3 style distillation now optional and validation-gated | V3 tonal drift regression risk |
| 2026-07-08 | 2.0 | Register A | A5 flat system diagrams added | Canon flat-diagram idiom adopted |
| 2026-07-08 | 2.0 | Provenance | REJECTED.md log added | Close the learning loop |

---

*Maintained in: `spec/WINGS_IMAGE_GENERATION_THESIS.md` · v2.0, 2026-07-08.*
*Operations: `assets/image-generation/CLAUDE.md` · Models:
`assets/image-generation/RECRAFT-MODELS.md` · Canon:
`assets/image-generation/CANON/` · Lint: `thesis.lint.json`*
