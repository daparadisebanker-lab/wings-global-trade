#!/usr/bin/env python3
"""
La Escalera — catalog build.

Turns the two supplier PDFs (Hua zhuan 艺术瓷砖, 150×150 and 300×300 product
catalogs) into the app's tile dataset:

    PDF page  ->  one full-bleed sheet image
              ->  recursive XY-cut finds every tile swatch on the sheet
              ->  each swatch is cropped and written to apps/escalera/public/tiles
              ->  the printed SKU codes + packing banners are transcribed
              ->  apps/escalera/src/data/tiles.ts

Only the transcription step needs a human (or a model) in the loop; everything
else is deterministic and re-runnable. The transcription is checked in as
`transcription.json` next to this file so a rebuild does not require redoing it.

Usage (from the repo root):

    python infrastructure/escalera/build_catalog.py \
        --pdf-a /path/to/150x150-catalog.pdf \
        --pdf-b /path/to/300x300-catalog.pdf

Run with --data-only to regenerate tiles.ts from the checked-in transcription
without touching the images (the common case — no PDFs required).

Packing provenance is the point of this script. Values printed on the supplier's
banner are 'catalog'. m²/carton is 'derived' (format area × pcs/carton, exact).
cartons/pallet is 'assumed' — the catalogs do not publish it — and every
consumer surfaces that.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
TRANSCRIPTION = HERE / "transcription.json"
APP = REPO / "apps" / "escalera"
IMG_OUT = APP / "public" / "tiles"
TS_OUT = APP / "src" / "data" / "tiles.ts"

# Keep in step with PALLET_CAPACITY_KG in apps/escalera/src/lib/packing.ts.
PALLET_CAPACITY_KG = 1200

# Sheets that carry no tiles (front and back covers).
COVER_PAGES = {"A01", "A05", "B01", "B14"}


# ── image extraction ───────────────────────────────────────────────────────


def mask_of(path, threshold=8):
    import numpy as np
    from PIL import Image

    a = np.asarray(Image.open(path).convert("RGB")).astype(np.int16)
    strip = np.concatenate([a[:, :30].reshape(-1, 3), a[:, -30:].reshape(-1, 3)])
    vals, counts = np.unique(strip, axis=0, return_counts=True)
    bg = vals[counts.argmax()]
    return np.abs(a - bg).max(axis=2) > threshold


def _runs(prof, gap):
    import numpy as np

    idx = np.where(prof)[0]
    if len(idx) == 0:
        return []
    out, s, p = [], idx[0], idx[0]
    for i in idx[1:]:
        if i - p > gap:
            out.append((s, p + 1))
            s = i
        p = i
    out.append((s, p + 1))
    return out


def _xycut(m, x0, y0, axis, depth, leaves, gap=16):
    h, w = m.shape
    if h < 8 or w < 8 or depth > 12:
        leaves.append((x0, y0, w, h))
        return
    for ax in (axis, 1 - axis):
        prof = (m.sum(axis=1) > 0) if ax == 0 else (m.sum(axis=0) > 0)
        rs = _runs(prof, gap)
        if not rs:
            return
        span = h if ax == 0 else w
        if len(rs) > 1 or (rs[0][1] - rs[0][0]) < span:
            for (s, e) in rs:
                sub = m[s:e, :] if ax == 0 else m[:, s:e]
                nx = x0 if ax == 0 else x0 + s
                ny = y0 + s if ax == 0 else y0
                _xycut(sub, nx, ny, 1 - ax, depth + 1, leaves, gap)
            return
    leaves.append((x0, y0, w, h))


def find_swatches(path, min_sz=300, max_sz=900, ar_lo=0.90, ar_hi=1.12):
    """Every tile swatch on a sheet, in reading order."""
    m = mask_of(path)
    leaves: list = []
    _xycut(m, 0, 0, 0, 0, leaves)
    sw = [
        (x, y, w, h)
        for (x, y, w, h) in leaves
        if min_sz <= w <= max_sz and min_sz <= h <= max_sz and ar_lo <= w / h <= ar_hi
    ]
    sw.sort(key=lambda r: (round(r[1] / 40), r[0]))
    return sw


def extract_images(pdf_a: str, pdf_b: str, workdir: Path) -> dict:
    import pymupdf
    from PIL import Image

    workdir.mkdir(parents=True, exist_ok=True)
    IMG_OUT.mkdir(parents=True, exist_ok=True)
    (IMG_OUT / "thumb").mkdir(parents=True, exist_ok=True)

    index: dict = {}
    for tag, pdf_path in (("A", pdf_a), ("B", pdf_b)):
        doc = pymupdf.open(pdf_path)
        for i in range(len(doc)):
            page = doc[i]
            key = f"{tag}{i + 1:02d}"
            # A page's resource dict lists every image in the file; only the one
            # with a placement rect is actually on THIS page.
            placed = [x[0] for x in page.get_images(full=True) if page.get_image_rects(x[0])]
            if len(placed) != 1:
                raise SystemExit(f"{key}: expected 1 placed image, got {len(placed)}")
            blob = doc.extract_image(placed[0])
            sheet = workdir / f"{key}.{blob['ext']}"
            sheet.write_bytes(blob["image"])

            if key in COVER_PAGES:
                continue

            boxes = find_swatches(str(sheet))
            im = Image.open(sheet).convert("RGB")
            recs = []
            for n, (x, y, w, h) in enumerate(boxes, 1):
                name = f"{key}-{n:02d}"
                crop = im.crop((x + 2, y + 2, x + w - 2, y + h - 2))
                card = crop.copy()
                card.thumbnail((512, 512), Image.LANCZOS)
                card.save(IMG_OUT / f"{name}.jpg", "JPEG", quality=82, optimize=True, progressive=True)
                th = crop.copy()
                th.thumbnail((160, 160), Image.LANCZOS)
                th.save(IMG_OUT / "thumb" / f"{name}.jpg", "JPEG", quality=78, optimize=True)
                recs.append({"n": n, "box": [int(x), int(y), int(w), int(h)]})
            index[key] = recs
            print(f"  {key}: {len(recs)} swatches", file=sys.stderr)
        doc.close()
    return index


# ── data assembly ──────────────────────────────────────────────────────────


def parse_format(label: str):
    """'300X300X8.8MM' -> ((300, 300), 8.8)"""
    nums = re.findall(r"\d+(?:\.\d+)?", label or "")
    if len(nums) < 3:
        raise ValueError(f"unparseable format label: {label!r}")
    return (int(float(nums[0])), int(float(nums[1]))), float(nums[2])


def cartons_per_pallet(kg_per_carton: float) -> int:
    if not kg_per_carton or kg_per_carton <= 0:
        return 1
    return max(1, math.floor(PALLET_CAPACITY_KG / kg_per_carton))


def material_for(series: str):
    """Only what the supplier actually names. Never inferred from a photo."""
    s = (series or "").lower()
    if "terrazzo" in s:
        return "terrazzo"
    return None


def ts_str(v) -> str:
    if v is None:
        return "undefined"
    return json.dumps(str(v), ensure_ascii=False)


def build_tiles(transcription: dict) -> list[dict]:
    tiles: list[dict] = []
    group_seq: dict[tuple, int] = {}

    for page in sorted(transcription):
        sheet = transcription[page]
        series_by_name = {s["name"]: s for s in sheet["series"]}

        for t in sorted(sheet["tiles"], key=lambda r: r["n"]):
            series = series_by_name.get(t["series"]) or sheet["series"][0]
            fmt, thickness = parse_format(series["format_label"])
            pcs = int(series["pcs_per_carton"])
            kg = float(series["kg_per_carton"])
            m2 = round(fmt[0] / 1000 * fmt[1] / 1000 * pcs, 4)

            code = t["code"].strip()
            grouped = t.get("label_kind") == "series_group"
            if grouped:
                k = (page, code)
                group_seq[k] = group_seq.get(k, 0) + 1
                tile_id = f"{code}-p{group_seq[k]}"
            else:
                tile_id = code

            asset = f"{page}-{t['n']:02d}"
            tiles.append(
                {
                    "id": tile_id,
                    "code": code,
                    "name": code,
                    "series": series["name"],
                    "format_mm": list(fmt),
                    "thickness_mm": thickness,
                    "material": material_for(series["name"]),
                    "finish": (t.get("finish") or "").strip(),
                    "note": (t.get("note") or "").strip() or None,
                    "packing": {
                        "pcs_per_carton": pcs,
                        "m2_per_carton": m2,
                        "kg_per_carton": kg,
                        "cartons_per_pallet": cartons_per_pallet(kg),
                    },
                    "image": f"/tiles/{asset}.jpg",
                    "thumb": f"/tiles/thumb/{asset}.jpg",
                    "patterns": t.get("patterns") if grouped else None,
                    "variantOf": code if grouped else None,
                    "source": {"catalog": page[0], "page": page, "n": t["n"]},
                }
            )

    ids = [t["id"] for t in tiles]
    dupes = {i for i in ids if ids.count(i) > 1}
    if dupes:
        raise SystemExit(f"duplicate tile ids: {sorted(dupes)}")
    return tiles


def emit_ts(tiles: list[dict]) -> str:
    L: list[str] = []
    L.append("// GENERATED FILE — do not edit by hand.")
    L.append("// Source: infrastructure/escalera/build_catalog.py, from the two")
    L.append("// Hua zhuan (艺术瓷砖) supplier catalogs — 150×150 and 300×300.")
    L.append("//")
    L.append("// Packing provenance:")
    L.append("//   pcs_per_carton / kg_per_carton  'catalog' — printed on the series banner")
    L.append("//   m2_per_carton                   'derived' — format area × pcs, exact")
    L.append("//   cartons_per_pallet              'assumed' — not published by the supplier;")
    L.append(f"//                                   pallets built to {PALLET_CAPACITY_KG} kg.")
    L.append("//")
    L.append("// Fields the catalogs do not state (material, PEI, slip rating, water")
    L.append("// absorption, shade variation) are deliberately absent rather than invented.")
    L.append("")
    L.append("import type { Tile } from '@/types/tile'")
    L.append("")
    L.append("const CATALOG = {")
    L.append("  pcs_per_carton: 'catalog',")
    L.append("  m2_per_carton: 'derived',")
    L.append("  kg_per_carton: 'catalog',")
    L.append("  cartons_per_pallet: 'assumed',")
    L.append("} as const")
    L.append("")
    L.append("export const TILES: Tile[] = [")
    for t in tiles:
        p = t["packing"]
        L.append("  {")
        L.append(f"    id: {ts_str(t['id'])},")
        L.append(f"    code: {ts_str(t['code'])},")
        L.append(f"    name: {ts_str(t['name'])},")
        L.append(f"    series: {ts_str(t['series'])},")
        L.append(f"    format_mm: [{t['format_mm'][0]}, {t['format_mm'][1]}],")
        L.append(f"    thickness_mm: {t['thickness_mm']},")
        if t["material"]:
            L.append(f"    material: {ts_str(t['material'])},")
        L.append(f"    finish: {ts_str(t['finish'])},")
        if t["note"]:
            L.append(f"    note: {ts_str(t['note'])},")
        L.append("    packing: {")
        L.append(f"      pcs_per_carton: {p['pcs_per_carton']},")
        L.append(f"      m2_per_carton: {p['m2_per_carton']},")
        L.append(f"      kg_per_carton: {p['kg_per_carton']},")
        L.append(f"      cartons_per_pallet: {p['cartons_per_pallet']},")
        L.append("      provenance: CATALOG,")
        L.append("    },")
        L.append(f"    image: {ts_str(t['image'])},")
        L.append(f"    thumb: {ts_str(t['thumb'])},")
        if t["patterns"]:
            L.append(f"    patterns: {t['patterns']},")
        if t["variantOf"]:
            L.append(f"    variantOf: {ts_str(t['variantOf'])},")
        L.append(
            f"    source: {{ catalog: {ts_str(t['source']['catalog'])}, "
            f"page: {ts_str(t['source']['page'])}, n: {t['source']['n']} }},"
        )
        L.append("  },")
    L.append("]")
    L.append("")
    L.append(f"/** {len(tiles)} faces read off the printed catalogs. */")
    L.append("export const TILE_COUNT = TILES.length")
    L.append("")
    return "\n".join(L)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--pdf-a", help="150×150 catalog PDF")
    ap.add_argument("--pdf-b", help="300×300 catalog PDF")
    ap.add_argument("--workdir", default="/tmp/escalera-build")
    ap.add_argument("--data-only", action="store_true", help="regenerate tiles.ts only")
    args = ap.parse_args()

    if not args.data_only:
        if not (args.pdf_a and args.pdf_b):
            ap.error("--pdf-a and --pdf-b are required unless --data-only is set")
        print("extracting sheet images + swatches…", file=sys.stderr)
        extract_images(args.pdf_a, args.pdf_b, Path(args.workdir))

    if not TRANSCRIPTION.exists():
        raise SystemExit(f"missing transcription: {TRANSCRIPTION}")
    transcription = json.loads(TRANSCRIPTION.read_text(encoding="utf-8"))

    tiles = build_tiles(transcription)
    TS_OUT.parent.mkdir(parents=True, exist_ok=True)
    TS_OUT.write_text(emit_ts(tiles), encoding="utf-8")
    print(f"wrote {TS_OUT.relative_to(REPO)} — {len(tiles)} tiles", file=sys.stderr)


if __name__ == "__main__":
    main()
