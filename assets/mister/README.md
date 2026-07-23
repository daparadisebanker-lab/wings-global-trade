# Mister — Brand Asset Intake

**Drop zone for uploading Mister brand assets straight from GitHub.**
This folder is a *staging area*, not the registry. Upload here; the assets
are then verified, renamed to convention, and moved into their canonical
home. Governing law: [`spec/MISTER_LOGO_APPLICATION_STANDARD.md`](../../spec/MISTER_LOGO_APPLICATION_STANDARD.md).

---

## How to upload (no local setup needed)

1. Open this folder on GitHub (branch `claude/mister-brand-assets-github-o92ctb`).
2. **Add file → Upload files** (or drag-and-drop onto the page).
3. Commit to this branch. That's it — the files land in `assets/mister/`.

Large binaries (fonts, PNG masters, PSD/AI source) are fine here — this is a
source-asset folder and is **not web-served**.

---

## What to upload, and where it ultimately lands

| Upload | Drop into | Canonical destination after review |
|---|---|---|
| Logo masters / variants (SVG, PNG) | `assets/mister/logo/` | `packages/liveries/mister/logo/` (registered + MANIFEST row) |
| Grain / constellation renders (PNG, RGBA) | `assets/mister/grain/` | `packages/liveries/mister/logo/` |
| Typography (fonts, specimens) | `assets/mister/type/` | `assets/` + wired in livery |
| Mockups / applications | `assets/mister/mockups/` | reference only |
| Photography (with ground/band) | `assets/mister/photography/` | reference only |
| Guidelines / source files (PDF, AI, PSD, Figma exports) | `assets/mister/source/` | reference only |

Create any of the subfolders as you upload — GitHub makes the folder when you
type `logo/your-file.svg` in the file-name field.

---

## Keep uploads compliant (the short version)

From the Logo Application Standard — the mark is **never generated, traced, or
redrawn**; agents load the registered files and recolor via CSS `fill` only.

- **Color law:** MISTER AZUL `#1D83F2` · MISTER CIELO `#65AFFF` (band grounds
  only) · Wings navy `#001E50` · Warm white `#F8F6F0`. One hue per instance.
- **Grain vs. solid:** grain PNG ≥ 64 px; solid SVG below that; `mister-m-solid.svg`
  for favicon/app-icon (16–48 px). Never upscale the raster beyond master size.
- **Refused:** mirror/skew/rotate/non-uniform scale, second hues, outlines,
  shadows or glows on the mark, the mark on gradients or bare photography, and
  retypesetting the wordmark.

Anything you drop that becomes a registered master gets moved into
`packages/liveries/mister/logo/` with a MANIFEST row so the registry stays the
single source of truth.
