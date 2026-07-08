# Wings Global Trade — Palette Law Amendment: INSTRUMENT COLOR
**Amendment 2026-07-08-B · Patches `WINGS_IMAGE_GENERATION_THESIS.md`
v2.0 → v2.1 and extends `packages/liveries/` with the Mister thermal ramp.
RATIFIED by founder 2026-07-08 — merged into the thesis (v2.1) same day;
this file remains as the amendment record. NOTE: `--ramp-hot` was
subsequently calibrated `#C63A1E` → `#B93400` and the interpolation fixed
as OKLab (thesis v2.2, D-1/D-2) — the thesis is the living law.**

---

## THE CLAUSE

> **A gradient is a reading, never a mood. Multicolor may enter the Wings
> system only as INSTRUMENT COLOR: a frozen ramp bound to a live variable,
> rendered as what a measurement device would draw. A thermal field that
> encodes nothing is the refused gradient background wearing a lab coat.**

This clause does not weaken the parent law ("color signals status, not
emotion") — it is its most literal enforcement. Temperature *is* status.

---

## THE MISTER THERMAL RAMP (tokens frozen pending first-render calibration)

| Stop | Token | Hex | Reading |
|---|---|---|---|
| 0.00 | `--ramp-cold` (Wings navy) | `#001E50` | Base / dormant / abundant |
| 0.25 | `--ramp-active` (Mister azul) | `#1D83F2` | Active / available |
| 0.50 | `--ramp-neutral` (warm white) | `#F8F6F0` | Midpoint / equilibrium |
| 0.72 | `--ramp-warm` (gold) | `#C4933F` | Warming / scarce |
| 1.00 | `--ramp-hot` (signal) | `#C63A1E` | Critical / last units |

Rules of the ramp:

1. **Endpoints are livery.** Three of five stops are existing brand tokens;
   only `--ramp-hot` (and interpolated midtones) are new, and they are
   frozen hexes after calibration — never re-vibed per asset.
2. **Interpolation is code, not eyedropper.** The ramp ships as a function
   in `packages/liveries/mister/ramp.ts` (and a CSS custom-property scale);
   any surface consuming thermal color calls the function with a value in
   [0,1]. If there is no value, there is no color.
3. **The reference's sage interior is retired** — the neutral midpoint is
   warm white `#F8F6F0`, keeping the field on-system.
4. **Grain rides the ramp.** The stipple texture (Mister DNA) is the
   permitted rendering of the ramp; smooth airbrush gradients remain
   refused. Isotherm contour banding (the thermal-imaging register) is the
   second permitted rendering.

---

## BINDING RULE (the law that makes it legal)

Every appearance of the ramp must be driven by a named variable with a
legend, explicit or structural: container fill %, remaining slots, corridor
demand index, group-formation progress. The variable name is recorded in
the asset's MANIFEST row (`encodes:` field).

**The evidence law extends to color.** Rendering a hot state on a container
that is not hot is a fabricated claim — identical in kind to a fabricated
weld seam. Urgency theater through false temperature is refused, gate-level,
no exceptions. (This is also why the ramp converts: the reader Wings serves
trusts instruments and distrusts marketing.)

---

## SCOPE

| Surface | Ruling |
|---|---|
| Mister diagnostic UI (FillMeter, demand maps, slot campaigns) | **Permitted** — primary home |
| Data visualization on any Wings surface, with legend | **Permitted** |
| Mister campaign/social ("the advisor reads the market's temperature") | **Permitted**, variable stated in the creative brief |
| Wings core document surfaces (catalog, spec sheets, lane pages) | **Refused** — navy/gold/warm-white law unchanged |
| Ambient backgrounds, decoration, section fills — anywhere | **Refused** |
| Register B photography grading | **Refused** — Working Daylight law unchanged |

---

## LINT ADDITIONS (`thesis.lint.json` v2.1)

```json
{
  "instrument_color": {
    "ramp": ["#001E50","#1D83F2","#F8F6F0","#C4933F","#C63A1E"],
    "requires_manifest_field": "encodes",
    "permitted_surfaces": ["mister_ui","dataviz","mister_campaign"],
    "refused_surfaces": ["wings_core","backgrounds","register_B_grading"]
  }
}
```

## CHANGELOG ROWS TO MERGE (thesis → v2.1)

| Date | Ver | Clause | Change | Reason |
|---|---|---|---|---|
| 2026-07-08 | 2.1 | Palette Law | INSTRUMENT COLOR clause added; Mister thermal ramp tokenized | Thermal reference ingested; legalized as data-bound instrument color, refused as decoration |
| 2026-07-08 | 2.1 | Evidence law | Extended to color: false temperature = fabricated claim | Urgency theater prevention |

---

*Companion documents: `MISTER_EXPRESSIVE_LAYER_SPEC.md` (application),
`MISTER_LOGO_APPLICATION_STANDARD.md` (mark governance).*
