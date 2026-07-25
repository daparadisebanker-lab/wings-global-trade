#!/usr/bin/env python3
"""Render the Wings ANEXO grid overlay (anexo-grid.pdf), matching the three
official grids (proforma / cotización / ficha técnica) provided by Muaaz.

Same A4 skeleton — 29.5 pt margins, left rail, 17.4 pt gutters, 19.9 pt baseline
— with the anexo's own two content fields marked: Detalle (wide) and Monto
(right). Coordinates are the ones measured from the official overlays, in points.
Run from this directory:  python3 build_anexo_grid.py
"""
from pathlib import Path

HERE = Path(__file__).resolve().parent
PAGE_W, PAGE_H = 595.28, 841.89  # A4 pt

# Shared vertical grid lines (pt) measured from the official overlays.
V_LINES = [29.3, 70.7, 84.6, 154.6, 172.1, 288.7, 306.1, 422.8, 440.2, 565.6]
MARGIN_TOP, MARGIN_BOTTOM = 29.5, 812.3
BASELINE = 19.9  # pt vertical rhythm

# The two fields the anexo's cost table occupies (x0, x1) in pt.
FIELDS = [
    ("Detalle", 84.6, 422.8),
    ("Monto", 440.2, 565.6),
]

# Baseline (green) horizontals from the top margin down to the bottom margin.
h_lines = []
y = MARGIN_TOP
while y <= MARGIN_BOTTOM + 0.1:
    h_lines.append(round(y, 1))
    y += BASELINE

PINK = "#ff3d9a"
GREEN = "#00a15a"
FIELD = "#f1f2f3"
CROP = "#111"


def px(v: float) -> str:
    return f"{v:.2f}pt"


parts = []
# Grey field fills (the anexo's Detalle + Monto columns)
for _label, x0, x1 in FIELDS:
    parts.append(
        f'<div style="position:absolute;left:{px(x0)};top:{px(MARGIN_TOP)};'
        f'width:{px(x1 - x0)};height:{px(MARGIN_BOTTOM - MARGIN_TOP)};background:{FIELD};"></div>'
    )
# Horizontal baseline lines (green)
for hy in h_lines:
    parts.append(
        f'<div style="position:absolute;left:{px(V_LINES[0])};top:{px(hy)};'
        f'width:{px(V_LINES[-1] - V_LINES[0])};height:0.4pt;background:{GREEN};"></div>'
    )
# Vertical column lines (pink)
for vx in V_LINES:
    parts.append(
        f'<div style="position:absolute;left:{px(vx)};top:{px(MARGIN_TOP)};'
        f'width:0.5pt;height:{px(MARGIN_BOTTOM - MARGIN_TOP)};background:{PINK};"></div>'
    )
# Corner crop marks
for cx, cy in [(29.3, 29.5), (565.6, 29.5), (29.3, 812.3), (565.6, 812.3)]:
    parts.append(f'<div style="position:absolute;left:{px(cx - 10)};top:{px(cy)};width:20pt;height:0.6pt;background:{CROP};"></div>')
    parts.append(f'<div style="position:absolute;left:{px(cx)};top:{px(cy - 10)};width:0.6pt;height:20pt;background:{CROP};"></div>')
# Field caption chips (identify the anexo mapping — tiny, at the top margin)
for label, x0, x1 in FIELDS:
    parts.append(
        f'<div style="position:absolute;left:{px(x0 + 3)};top:{px(MARGIN_TOP - 12)};'
        f'font:600 6pt Inter,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:{PINK};">{label}</div>'
    )

HTMLDOC = f"""<!doctype html>
<html><head><meta charset="utf-8" />
<style>
  @page {{ size: A4 portrait; margin: 0; }}
  html, body {{ margin: 0; padding: 0; }}
  .sheet {{ position: relative; width: {PAGE_W}pt; height: {PAGE_H}pt; background: #fff;
           -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
</style></head>
<body><div class="sheet">
{chr(10).join(parts)}
</div></body></html>
"""

out = HERE / "anexo-grid.html"
out.write_text(HTMLDOC, encoding="utf-8")
print(f"wrote {out} · {len(V_LINES)} v-lines · {len(h_lines)} baselines")
