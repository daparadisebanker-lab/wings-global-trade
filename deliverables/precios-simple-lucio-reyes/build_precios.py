#!/usr/bin/env python3
"""Build a SIMPLE (non-formal) Wings Global Trade price sheet — not a full
cotización/proforma — for Lucio Jesus Reyes Melendez (Ica), per explicit
request: "only about the price of one unit", no IGV/tax breakdown shown
below (just one full price per unit), a note that the price does not
include taxes, and basic per-unit info — logo + header only, no
party boxes / dateline / condiciones comerciales / observaciones sections
from the formal cotización template.

Per-unit prices reused as-is from PRICING_NOTES.md (engine's raw 10%-margin
output, no rounding adjustment):
  · Toyota Hilux Full Manual 4x4 (FOB 44,205.00)   → 56,509.01/unit
  · Toyota Hilux Básica Manual 4x4 (FOB 36,000.00) → 47,348.13/unit
These are Valor de Venta (sin IGV) — shown here as "Precio" per the
request to not itemize IGV separately; the tax-exclusion note explains
that IGV/taxes are calculated separately.

Run: python3 build_precios.py
"""
from decimal import Decimal
from pathlib import Path

HERE = Path(__file__).resolve().parent
LOGO_SVG = HERE / "wings-icon.svg"

CLIENTE = "Lucio Jesus Reyes Melendez"
CLIENTE_CIUDAD = "Ica"
FECHA = "Lima, 21-09-2026"

D = lambda x: Decimal(str(x))


def fmt(x: Decimal) -> str:
    return f"{x:,.2f}"


UNIDADES = [
    {
        "nombre": "Toyota Hilux Full Manual 4x4",
        "specs": [
            ("Motor", "2.8L Turbodiésel, 4 cilindros, 16v DOHC"),
            ("Potencia máxima", "204 PS / 3,000–3,400 rpm"),
            ("Transmisión", "Manual de 6 velocidades con iMT"),
            ("Tracción", "4x4"),
        ],
        "precio": D("56509.01"),
    },
    {
        "nombre": "Toyota Hilux Básica Manual 4x4",
        "specs": [
            ("Motor", "2.8L Turbodiésel, 4 cilindros, 16v DOHC"),
            ("Potencia máxima", "204 PS / 3,000–3,400 rpm"),
            ("Transmisión", "Manual de 6 velocidades"),
            ("Tracción", "4x4"),
        ],
        "precio": D("47348.13"),
    },
]

LOGO = Path(LOGO_SVG).read_text(encoding="utf-8")
LOGO = LOGO[LOGO.index("<svg"):]
LOGO = LOGO.replace("<svg ", '<svg class="pdoc-logo" ', 1)

CARDS_HTML = []
for u in UNIDADES:
    specs_html = "\n".join(
        f'        <div class="spec-row"><span class="spec-label">{label}</span><span class="spec-value">{value}</span></div>'
        for label, value in u["specs"]
    )
    CARDS_HTML.append(f"""    <div class="unit-card">
      <div class="unit-name">{u['nombre']}</div>
      <div class="unit-specs">
{specs_html}
      </div>
      <div class="unit-price-row">
        <span class="unit-price-label">Precio</span>
        <span class="unit-price-value">USD {fmt(u['precio'])}</span>
      </div>
    </div>""")
CARDS_HTML = "\n".join(CARDS_HTML)

HTMLDOC = f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Precios · Wings Global Trade · Toyota Hilux</title>
<style>
  :root {{
    --font-ui: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    --font-mono: 'Inter', ui-monospace, 'SF Mono', Menlo, monospace;
    --ink: #0f1216; --muted: #6b7280; --line: #d1d5db; --tint: #f7f8f9;
  }}
  html, body {{ margin: 0; padding: 0; }}
  body {{ background: #52555a; }}
  .page {{ min-height: 100vh; padding: 28px 16px 48px; }}
  .page .doc {{ box-shadow: 0 8px 40px rgba(0, 0, 0, 0.35); }}

  .doc {{
    box-sizing: border-box; width: 100%; max-width: 760px; margin: 0 auto;
    padding: 28px 48px 26px; background: #ffffff; color: var(--ink);
    font-family: var(--font-ui, system-ui, sans-serif); font-size: 12.5px; line-height: 1.4;
  }}
  .doc *, .doc *::before, .doc *::after {{ box-sizing: border-box; }}

  .header {{ display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; margin-bottom: 6px; }}
  .header-title {{ margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.01em; }}
  .brand {{ display: flex; flex-direction: column; align-items: flex-end; text-align: right; gap: 3px; flex-shrink: 0; }}
  .logo {{ height: 46px; width: auto; }}
  .brand-name {{ font-size: 13.5px; font-weight: 700; letter-spacing: 0.01em; }}
  .tagline {{ font-size: 9.5px; letter-spacing: 0.02em; color: var(--muted); text-transform: uppercase; }}

  .rule {{ height: 2px; background: var(--line); margin: 14px 0 16px; }}

  .meta-line {{ display: flex; flex-wrap: wrap; gap: 4px 18px; margin-bottom: 22px; font-size: 12px; color: var(--muted); }}
  .meta-line strong {{ color: var(--ink); font-weight: 600; }}

  .unit-card {{ border: 1px solid var(--line); border-radius: 4px; padding: 16px 18px; margin-bottom: 16px; break-inside: avoid; }}
  .unit-name {{ font-size: 15px; font-weight: 700; margin-bottom: 10px; }}
  .unit-specs {{ display: grid; grid-template-columns: 150px 1fr; gap: 4px 12px; margin-bottom: 14px; }}
  .spec-row {{ display: contents; }}
  .spec-label {{ color: var(--muted); font-size: 11.5px; }}
  .spec-value {{ font-size: 11.5px; }}
  .unit-price-row {{ display: flex; align-items: baseline; justify-content: space-between; border-top: 1px solid var(--line); padding-top: 10px; }}
  .unit-price-label {{ font-size: 12.5px; font-weight: 600; }}
  .unit-price-value {{ font-size: 19px; font-weight: 700; font-family: var(--font-mono, monospace); font-variant-numeric: tabular-nums; }}

  .tax-note {{ margin-top: 4px; padding: 12px 16px; background: var(--tint); border-left: 3px solid var(--ink); font-size: 11.5px; color: var(--muted); }}
  .tax-note strong {{ color: var(--ink); }}

  .footer {{ display: flex; justify-content: space-between; gap: 24px; margin-top: 22px; padding-top: 10px; border-top: 1px solid var(--line); color: var(--muted); font-size: 11px; }}

  @media (max-width: 640px) {{
    .doc {{ padding: 24px 20px; }}
    .unit-specs {{ grid-template-columns: 1fr; }}
    .footer {{ flex-direction: column; gap: 8px; }}
  }}

  @media print {{
    @page {{ size: A4 portrait; margin: 10mm; }}
    body {{ background: #ffffff; }}
    .page {{ min-height: 0; padding: 0; }}
    .page .doc {{ box-shadow: none; }}
    .doc {{ max-width: none; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
  }}
</style>
</head>
<body>
<div class="page">
<article class="doc">

  <header class="header">
    <h1 class="header-title">Precios — Toyota Hilux</h1>
    <div class="brand">
      {LOGO}
      <span class="brand-name">WINGS GLOBAL TRADE</span>
      <span class="tagline">Soluciones integrales en importación</span>
    </div>
  </header>
  <div class="rule"></div>

  <div class="meta-line">
    <span>{FECHA}</span>
    <span>Cliente: <strong>{CLIENTE}</strong></span>
    <span>Ciudad: <strong>{CLIENTE_CIUDAD}</strong></span>
  </div>

{CARDS_HTML}

  <div class="tax-note">
    <strong>Nota:</strong> los precios mostrados no incluyen impuestos. El monto final con impuestos (IGV) será calculado y confirmado según la normativa vigente al momento de la nacionalización de la unidad.
  </div>

  <footer class="footer">
    <div>IMP. Y EXP. WINGS AUTOMÓVILES S.R.L.</div>
    <div>RUC 20532415650</div>
  </footer>

</article>
</div>
</body>
</html>
"""

out = HERE / "precios.html"
out.write_text(HTMLDOC, encoding="utf-8")
print(f"wrote {out} ({len(HTMLDOC):,} bytes)")
for u in UNIDADES:
    print(f"{u['nombre']}: precio (sin impuestos) = USD {fmt(u['precio'])}")
