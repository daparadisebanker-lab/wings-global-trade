#!/usr/bin/env python3
"""
El Pasillo — catalogue build (v2, two-tier).

Turns the supplier PDFs (Hua zhuan, 150x150 and 300x300 art-tile catalogues)
into the structured SERIES -> SKU data every component in the UI spec depends on.

    (1) INTAKE    PDF page -> one full-bleed sheet image
    (2) DETECT    recursive XY-cut -> tile bounding boxes, with grid recovery
    (3) CROP      seam-exact square crops -> WebP derivatives (thumb + face)
    (4) OCR       the printed captions and spec bars  [human/model, checked in
                  as transcription.json - this script does not re-read the PDF text]
    (5) PROPOSE   k-means dominant colours per SKU
    (6) EMIT      apps/site/src/pasillo/data/catalogue.ts

Stages 1-3 and 5-6 are automated and re-runnable; stage 4 is the human gate and
lives in transcription.json. Everything is deterministic, so a rebuild of the
same inputs produces byte-identical output.

Usage from the repo root:

    python infrastructure/escalera/build_catalog.py --data-only
    python infrastructure/escalera/build_catalog.py --pdf-a A.pdf --pdf-b B.pdf

--data-only regenerates catalogue.ts from the checked-in transcription without
touching the images (the common case; no PDFs required).

WHAT THIS SCRIPT WILL NOT DO
  It never invents a spec. PEI, slip rating, water absorption, application and
  commercial terms are absent from these catalogues, so they are emitted as null
  and the UI renders them pending. A field with no printed source is not a field.
"""

from __future__ import annotations

import argparse
import json
import math
import re
import shutil
import sys
from collections import defaultdict
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
TRANSCRIPTION = HERE / "transcription.json"
# The catalogue is mounted inside the live site as the Azulejos catalogue of
# WGT/02 Interiores (see apps/site/src/pasillo/). This pipeline keeps its own
# name because it is the extraction pipeline, not the app.
APP = REPO / "apps" / "site"
IMG_OUT = APP / "public" / "tiles"
TS_OUT = APP / "src" / "pasillo" / "data" / "catalogue.ts"
# The site-wide search router needs to recognise a tile code without importing
# the whole catalogue into the homepage bundle. Emitting a compact index keeps
# the two in lockstep: a rebuild that adds a SKU makes it findable the same day.
CODES_OUT = APP / "src" / "pasillo" / "data" / "codeIndex.ts"

SUPPLIER = "HUAZHUAN"

# Sheets that carry no tiles (front and back covers).
COVER_PAGES = {"A01", "A05", "B01", "B14"}

# Derivative sizes. The source crops are ~450px, so `face` caps at native rather
# than upscaling; there is no 2048 "full" derivative because no such resolution
# exists in the supplier PDFs. WebP throughout: same faces at roughly a third of
# the JPEG weight, which is what keeps the repo and the buyer's data bill sane.
THUMB_PX, FACE_PX = 320, 512
THUMB_Q, FACE_Q = 64, 74


# ── controlled vocabulary (spec 9.5) ───────────────────────────────────────
# The supplier writes free text with an ideographic comma. Left uncanonicalised
# it produces a facet rail with a dozen near-duplicate "matte" entries. finish_raw
# is always preserved beside the canonical value: when a supplier disputes a spec,
# the original string is the evidence.

FINISH_MAP = {
    "Flat, Matte Surface": ("matte", "flat"),
    "Sculptured, Matte Surface": ("matte", "sculptured"),
    "Uneven, Matte": ("matte", "uneven"),
    "Massed glaze, Glossy": ("massed_glaze", "flat"),
    "Mold, Glossy Surface": ("glossy", "mold"),
}

FINISH_ES = {"matte": "Mate", "glossy": "Brillante", "massed_glaze": "Esmalte macizo"}
RELIEF_ES = {
    "flat": "Liso",
    "sculptured": "Esculpido",
    "uneven": "Irregular",
    "mold": "Moldeado",
}


def slug(text: str) -> str:
    return re.sub(r"[^A-Z0-9]", "", text.upper())


def code_class(code: str) -> str:
    """The factory/OEM line a code belongs to. Eleven appear in one catalogue."""
    m = re.match(r"^([A-Za-z]+(?:-[A-Za-z]+)?)", code)
    return m.group(1).upper() if m else "NUM"


def parse_format(label: str) -> tuple[int, int, float]:
    nums = re.findall(r"\d+(?:\.\d+)?", label or "")
    if len(nums) < 3:
        raise ValueError(f"unparseable format label: {label!r}")
    return int(float(nums[0])), int(float(nums[1])), float(nums[2])


def parse_pattern_count(tile: dict) -> int | None:
    if isinstance(tile.get("patterns"), (int, float)) and tile["patterns"]:
        return int(tile["patterns"])
    m = re.search(r"(\d+)\s*Patterns?", tile.get("note") or "", re.I)
    return int(m.group(1)) if m else None


# ── colour extraction (spec 9.5) ───────────────────────────────────────────


def dominant_colours(paths: list[Path], k: int = 3) -> list[str]:
    """k-means over the SKU's faces. Deterministic: seeds are the luminance
    quantiles of the sample, so a rebuild never reshuffles a facet."""
    import numpy as np
    from PIL import Image

    px = []
    for p in paths:
        im = Image.open(p).convert("RGB")
        im.thumbnail((64, 64), Image.LANCZOS)
        px.append(np.asarray(im, dtype=np.float64).reshape(-1, 3))
    data = np.concatenate(px)
    if len(data) < k:
        return ["#%02x%02x%02x" % tuple(int(c) for c in data.mean(0))]

    lum = data @ np.array([0.2126, 0.7152, 0.0722])
    order = np.argsort(lum)
    seeds = np.array([data[order[int(q * (len(data) - 1))]] for q in np.linspace(0.1, 0.9, k)])

    for _ in range(24):
        d = ((data[:, None, :] - seeds[None, :, :]) ** 2).sum(2)
        lab = d.argmin(1)
        new = np.array(
            [data[lab == i].mean(0) if (lab == i).any() else seeds[i] for i in range(k)]
        )
        if np.allclose(new, seeds, atol=0.4):
            seeds = new
            break
        seeds = new

    sizes = [(lab == i).sum() for i in range(k)]
    ranked = sorted(range(k), key=lambda i: -sizes[i])
    return ["#%02x%02x%02x" % tuple(int(round(c)) for c in seeds[i]) for i in ranked]


# ── image stage ────────────────────────────────────────────────────────────


def find_swatches(path: Path) -> list[tuple[int, int, int, int]]:
    """Every tile face on a sheet, in reading order.

    A tile whose lower edge is near-white blends into the page ground, so the
    XY-cut truncates its block and a plain square test drops it. The grid is
    regular, so a truncated block is recovered by snapping it to the row its
    neighbours define. This is what makes the extraction exhaustive rather than
    merely mostly-right - three SKUs on one sheet were lost without it.
    """
    import numpy as np
    from PIL import Image

    a = np.asarray(Image.open(path).convert("RGB")).astype(np.int16)
    strip = np.concatenate([a[:, :30].reshape(-1, 3), a[:, -30:].reshape(-1, 3)])
    vals, counts = np.unique(strip, axis=0, return_counts=True)
    mask = np.abs(a - vals[counts.argmax()]).max(axis=2) > 8

    def runs(prof, gap=16):
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

    leaves: list[tuple[int, int, int, int]] = []

    def cut(m, x0, y0, axis, depth):
        h, w = m.shape
        if h < 8 or w < 8 or depth > 12:
            leaves.append((x0, y0, w, h))
            return
        for ax in (axis, 1 - axis):
            prof = (m.sum(axis=1) > 0) if ax == 0 else (m.sum(axis=0) > 0)
            rs = runs(prof)
            if not rs:
                return
            span = h if ax == 0 else w
            if len(rs) > 1 or (rs[0][1] - rs[0][0]) < span:
                for s, e in rs:
                    sub = m[s:e, :] if ax == 0 else m[:, s:e]
                    cut(sub, x0 if ax == 0 else x0 + s, y0 + s if ax == 0 else y0, 1 - ax, depth + 1)
                return
        leaves.append((x0, y0, w, h))

    cut(mask, 0, 0, 0, 0)

    square, maybe = [], []
    for x, y, w, h in leaves:
        if not 300 <= w <= 900:
            continue
        if 300 <= h <= 900 and 0.90 <= w / h <= 1.12:
            square.append((x, y, w, h))
        elif 0.50 <= h / w <= 1.12:
            maybe.append((x, y, w, h))
    if not square:
        return []

    W = int(np.median([s[2] for s in square]))
    H = int(np.median([s[3] for s in square]))

    tops: list[list[int]] = []
    for t in sorted({s[1] for s in square}):
        if not tops or t - tops[-1][-1] > W * 0.35:
            tops.append([t])
        else:
            tops[-1].append(t)
    row_tops = [int(np.median(r)) for r in tops]

    out = list(square)
    for x, y, w, h in maybe:
        if abs(w - W) > W * 0.12 or h >= H * 0.95:
            continue
        near = [t for t in row_tops if abs(t - y) <= W * 0.55]
        out.append((x, min(near, key=lambda t: abs(t - y)) if near else y, W, H))

    keep: list[tuple[int, int, int, int]] = []
    for b in out:
        if any(abs(b[0] - o[0]) < W * 0.4 and abs(b[1] - o[1]) < H * 0.4 for o in keep):
            continue
        keep.append(b)
    keep.sort(key=lambda r: (round(r[1] / 40), r[0]))
    return keep


def extract_images(pdf_a: str, pdf_b: str, workdir: Path) -> None:
    import pymupdf
    from PIL import Image

    workdir.mkdir(parents=True, exist_ok=True)
    if IMG_OUT.exists():
        shutil.rmtree(IMG_OUT)
    (IMG_OUT / "thumb").mkdir(parents=True)

    for tag, pdf_path in (("A", pdf_a), ("B", pdf_b)):
        doc = pymupdf.open(pdf_path)
        for i in range(len(doc)):
            page, key = doc[i], f"{tag}{i + 1:02d}"
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

            im = Image.open(sheet).convert("RGB")
            boxes = find_swatches(sheet)
            for n, (x, y, w, h) in enumerate(boxes, 1):
                crop = im.crop((x + 2, y + 2, x + w - 2, y + h - 2))
                name = f"{key}-{n:02d}"
                face = crop.copy()
                face.thumbnail((FACE_PX, FACE_PX), Image.LANCZOS)
                face.save(IMG_OUT / f"{name}.webp", "WEBP", quality=FACE_Q, method=6)
                th = crop.copy()
                th.thumbnail((THUMB_PX, THUMB_PX), Image.LANCZOS)
                th.save(IMG_OUT / "thumb" / f"{name}.webp", "WEBP", quality=THUMB_Q, method=6)
            print(f"  {key}: {len(boxes)} faces", file=sys.stderr)
        doc.close()


# ── data stage ─────────────────────────────────────────────────────────────


def build(transcription: dict, with_colours: bool) -> tuple[list[dict], list[dict]]:
    series_by_uid: dict[str, dict] = {}
    faces_by_sku: dict[str, list[dict]] = defaultdict(list)
    sku_meta: dict[str, dict] = {}
    order: list[str] = []

    for page in sorted(transcription):
        sheet = transcription[page]
        by_name = {s["name"]: s for s in sheet["series"]}

        for tile in sorted(sheet["tiles"], key=lambda r: r["n"]):
            s = by_name.get(tile["series"]) or sheet["series"][0]
            w, h, thick = parse_format(s["format_label"])
            # Width is part of the key: this catalogue ships "Massed Glaze" at
            # 150x150 and "Massed Glaze Series" at 300x300 with different packing.
            # Keying on name alone would silently merge them and corrupt the math.
            s_uid = f"WGT-{SUPPLIER}-{slug(s['name'])}-{w}"

            if s_uid not in series_by_uid:
                pcs = int(s["pcs_per_carton"])
                series_by_uid[s_uid] = {
                    "series_uid": s_uid,
                    "supplier": SUPPLIER,
                    "name_raw": s["name"],
                    "format_mm": [w, h],
                    "thickness_mm": thick,
                    "pcs_per_ctn": pcs,
                    "kgs_per_ctn": float(s["kg_per_carton"]),
                    # computed, never typed: 45 x 0.15^2 = 1.0125 - 15 x 0.30^2 = 1.35
                    "m2_per_ctn": round(pcs * (w / 1000) * (h / 1000), 4),
                    "pages": set(),
                    "status": "available",
                }
            series_by_uid[s_uid]["pages"].add(page)

            code = tile["code"].strip()
            uid = f"{s_uid}-{code}"
            raw = (tile.get("finish") or "").strip()
            finish, relief = FINISH_MAP.get(raw, ("matte", "flat"))

            if uid not in sku_meta:
                order.append(uid)
                note = (tile.get("note") or "").strip()
                sku_meta[uid] = {
                    "sku_uid": uid,
                    "series_uid": s_uid,
                    "code": code,
                    "code_class": code_class(code),
                    "finish_raw": raw,
                    "finish": finish,
                    "relief": relief,
                    "pattern_count": parse_pattern_count(tile),
                    # the supplier's own colour name, where they gave one
                    "colour_name": note if note and not re.search(r"Patterns?", note, re.I) else None,
                    "label_kind": tile.get("label_kind", "per_tile"),
                }
            faces_by_sku[uid].append({"page": page, "n": tile["n"]})

    skus = []
    for uid in order:
        meta = sku_meta[uid]
        faces = faces_by_sku[uid]
        n_faces, n_patterns = len(faces), meta["pattern_count"]

        # spec 9.4: face_count vs pattern_count is the highest-value validation.
        # Three honest outcomes plus one that needs a human.
        if n_patterns is None and n_faces == 1:
            # A plain-colour tile prints a colour name where a patterned one
            # prints "(N Patterns)". One face and no printed count is a solid
            # tile, not a defect - flagging it would bury the one real mismatch
            # in six false positives.
            n_patterns, kind, flag = 1, "single", False
        elif n_patterns is None:
            kind, flag = "review", True
        elif n_faces == n_patterns == 1:
            kind, flag = "single", False
        elif n_faces == n_patterns:
            # N crops, N patterns: the repeat can randomise across real faces.
            kind, flag = "multi", False
        elif n_faces == 1 and n_patterns > 1:
            # One printed photo already showing N variants. Tiling it is honest;
            # randomising is not, because we only have the one composite.
            kind, flag = "composite", False
        else:
            kind, flag = "review", True

        assets = [f"{f['page']}-{f['n']:02d}" for f in faces]
        rec = {
            **meta,
            "pattern_count": n_patterns,
            "face_kind": kind,
            "review_flag": flag,
            "faces": [f"/tiles/{a}.webp" for a in assets],
            "thumb": f"/tiles/thumb/{assets[0]}.webp",
            "colours": [],
        }
        if with_colours:
            paths = [IMG_OUT / f"{a}.webp" for a in assets]
            paths = [p for p in paths if p.exists()]
            if paths:
                rec["colours"] = dominant_colours(paths[:4])
        skus.append(rec)

    for s in series_by_uid.values():
        s["pages"] = sorted(s["pages"])
        s["sku_count"] = sum(1 for k in skus if k["series_uid"] == s["series_uid"])

    return list(series_by_uid.values()), skus


def ts(v) -> str:
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        return repr(v)
    if isinstance(v, list):
        return "[" + ", ".join(ts(x) for x in v) + "]"
    return json.dumps(str(v), ensure_ascii=False)


def emit(series: list[dict], skus: list[dict]) -> str:
    L: list[str] = []
    A = L.append
    A("// GENERATED FILE - do not edit by hand.")
    A("// Source: infrastructure/escalera/build_catalog.py, from the two Hua zhuan")
    A("// (art ceramic tile) supplier catalogues - 150x150 and 300x300.")
    A("//")
    A("// Two tiers, because a booth is a SERIES and a series holds many SKUs.")
    A("// Series-level truth (format, packing, coverage) is stated once and inherited;")
    A("// it is never repeated on a tile. That is what lets a grid run dense.")
    A("//")
    A("// Computed, never typed:  m2_per_ctn = pcs x (w/1000) x (h/1000)")
    A("//                         sku_count, face_kind, review_flag")
    A("// Read off the printed sheet:  code, finish_raw, pattern_count, packing")
    A("// Extracted:  colours (k-means, 3 dominant, deterministic)")
    A("// Absent from these catalogues and therefore null, never invented:")
    A("//   PEI, slip rating, water absorption, application, rectified edge, price.")
    A("")
    A("import type { Series, Sku } from '@/pasillo/types/catalogue'")
    A("")
    A("export const SERIES: Series[] = [")
    for s in series:
        A("  {")
        for k in ("series_uid", "supplier", "name_raw"):
            A(f"    {k}: {ts(s[k])},")
        A(f"    format_mm: [{s['format_mm'][0]}, {s['format_mm'][1]}],")
        for k in ("thickness_mm", "pcs_per_ctn", "kgs_per_ctn", "m2_per_ctn", "sku_count"):
            A(f"    {k}: {ts(s[k])},")
        A(f"    status: {ts(s['status'])},")
        A(f"    pages: {ts(s['pages'])},")
        A("  },")
    A("]")
    A("")
    A("export const SKUS: Sku[] = [")
    for k in skus:
        A("  {")
        for f in ("sku_uid", "series_uid", "code", "code_class", "finish_raw", "finish", "relief"):
            A(f"    {f}: {ts(k[f])},")
        A(f"    pattern_count: {ts(k['pattern_count'])},")
        A(f"    face_kind: {ts(k['face_kind'])},")
        A(f"    review_flag: {ts(k['review_flag'])},")
        A(f"    colour_name: {ts(k['colour_name'])},")
        A(f"    colours: {ts(k['colours'])},")
        A(f"    faces: {ts(k['faces'])},")
        A(f"    thumb: {ts(k['thumb'])},")
        A("  },")
    A("]")
    A("")
    A(f"/** {len(series)} series, {len(skus)} SKUs, "
      f"{sum(len(k['faces']) for k in skus)} faces read off the printed catalogues. */")
    A("export const SERIES_COUNT = SERIES.length")
    A("export const SKU_COUNT = SKUS.length")
    A("")
    return "\n".join(L)


def emit_code_index(skus: list[dict]) -> str:
    """A compact, exact index of every printed SKU code.

    Exact rather than heuristic on purpose: this catalogue carries BARE NUMERIC
    codes (1500084 ...), which the site's search router was reading as HS codes
    and routing to the AI advisor. A prefix regex would still misfire; a set of
    the real strings cannot.
    """
    codes = sorted({s["code"] for s in skus})
    body = ",\n  ".join(f'"{c}"' for c in codes)
    return (
        "// GENERATED FILE - do not edit by hand.\n"
        "// Source: infrastructure/escalera/build_catalog.py\n"
        "//\n"
        "// Every printed SKU code in the Azulejos catalogue, so site search can\n"
        "// recognise one exactly. Kept separate from catalogue.ts so the homepage\n"
        "// never pulls the full two-tier dataset into its bundle.\n\n"
        f"export const CATALOGUE_CODES: ReadonlySet<string> = new Set([\n  {body},\n])\n"
    )


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--pdf-a")
    ap.add_argument("--pdf-b")
    ap.add_argument("--workdir", default="/tmp/escalera-build")
    ap.add_argument("--data-only", action="store_true")
    ap.add_argument("--no-colours", action="store_true")
    args = ap.parse_args()

    if not args.data_only:
        if not (args.pdf_a and args.pdf_b):
            ap.error("--pdf-a and --pdf-b are required unless --data-only is set")
        print("extracting sheets + faces...", file=sys.stderr)
        extract_images(args.pdf_a, args.pdf_b, Path(args.workdir))

    if not TRANSCRIPTION.exists():
        raise SystemExit(f"missing transcription: {TRANSCRIPTION}")
    series, skus = build(
        json.loads(TRANSCRIPTION.read_text(encoding="utf-8")), not args.no_colours
    )

    dupes = {s["sku_uid"] for s in skus if [x["sku_uid"] for x in skus].count(s["sku_uid"]) > 1}
    if dupes:
        raise SystemExit(f"duplicate sku_uid: {sorted(dupes)}")

    TS_OUT.parent.mkdir(parents=True, exist_ok=True)
    TS_OUT.write_text(emit(series, skus), encoding="utf-8")
    CODES_OUT.write_text(emit_code_index(skus), encoding="utf-8")

    flagged = [s["sku_uid"] for s in skus if s["review_flag"]]
    print(
        f"wrote {TS_OUT.relative_to(REPO)} - {len(series)} series, {len(skus)} SKUs, "
        f"{sum(len(s['faces']) for s in skus)} faces",
        file=sys.stderr,
    )
    if flagged:
        print(f"review_flag on {len(flagged)}: {', '.join(flagged)}", file=sys.stderr)


if __name__ == "__main__":
    main()
