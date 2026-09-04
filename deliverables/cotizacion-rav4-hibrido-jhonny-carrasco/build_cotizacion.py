#!/usr/bin/env python3
"""Build the Wings Global Trade branded CLIENT quotation (Cotización) for
3x Toyota RAV4 Híbrido 2026, client Jhonny Carrasco, Chile.

Source data: uploaded workbook COSTO_DE_LOS_VEHICULOS_2026_CLADEY_01.09.26.xlsx,
sheet "Hoja3" (2026-09-04). That sheet is headed "PRECIO POR 3 CARROS / UN
CONTENEDOR DE 40 HQ" / "PRECIO PUESTO EN IQQ CHILE (USD)" — i.e. these three
unit prices are already the landed, puesto-en-Iquique sell price per the
Chilean-market pricing tab (as opposed to the Peru-market "COSTO HILUX" tab
or the "CHANGAN"/"PARA BOLIVIA" tabs in the same workbook). Values are plain
hardcoded cells in the source (no formulas), so they are ported as-is —
no landed-cost/margin engine applied here, unlike the Peru cotizaciones.
Trim naming cross-checked against the Joice catalog (not printed on the
client doc — internal sourcing reference only).

Client-specified inputs (2026-09-04):
  Cliente: Jhonny Carrasco · Puesto en: Iquique, Chile · Moneda: USD
  Sin IGV — importación chilena (Peruvian IGV does not apply to a sale
  landed and sold into Chile; any Chilean import taxes are the buyer's
  responsibility, disclosed in Observaciones).
  Orden de ítems: 2.0L Deluxe → 2.5L 4x4 Deluxe → 4x4 Full Equipada.

Vendedor: this is issued by the group's Chilean entity — "the chilean
company" per the user (2026-09-04 correction; the first draft wrongly
kept the Peru entity). Ported from the SHINING_STAR_CL issuer record in
apps/tower/src/lib/quotation/issuers.ts (id 'shining-star-cl'):
IMPORT - EXPORT SHINING STAR LIMITADA, RUT 76029544-2, Iquique, Chile —
the same entity TOWER uses for the Iquique/ZOFRI export route.

Reuses the `pdoc` grid/layout finalized on the Prado/Travo cotizaciones
(icon-only logo, "WINGS GLOBAL TRADE" letterhead, centered section bars),
with the totals block simplified to a single Precio Total row (no IGV/
soles-referencial lines, since this sale carries no IGV and is quoted
purely in USD). Run: python3 build_cotizacion.py
"""
from decimal import Decimal
from pathlib import Path

HERE = Path(__file__).resolve().parent
LOGO_SVG = HERE / "wings-icon.svg"


def D(x) -> Decimal:
    return Decimal(str(x))


def fmt(x: Decimal) -> str:
    return f"{x:,.2f}"


# ── Source data — Hoja3, "PRECIO PUESTO EN IQQ CHILE (USD)" ────────────
CLIENTE = "Jhonny Carrasco"
PAIS_CLIENTE = "Chile"
PUERTO_LLEGADA = "Iquique, Chile"
CONDICION_PRECIO = "Puesto en Iquique, Chile — no incluye IGV (importación chilena)"
DOC_NUMBER = "COT-WGT-2026-0904"
DOC_DATE = "04-09-2026"

VEHICLES = [
    ("RAV4 Híbrido 2026 Doble Turbo 2.0L 2WD (4x2) Deluxe Edition", D(33660)),
    ("RAV4 Híbrido 2026 Doble Turbo 2.5L 4WD (4x4) Versión Deluxe", D(38280)),
    ("RAV4 Híbrido 2026 Doble Turbo 2.5L 4WD (4x4) Full Equipado", D(41200)),
]

PRECIO_TOTAL = sum(v[1] for v in VEHICLES)

ROWS_HTML = "\n".join(
    f"""      <tr>
        <td class="pd-item">{i}</td>
        <td class="pd-desc">
          <span class="pd-model">{name}</span>
        </td>
        <td class="pd-qty">1</td>
        <td class="pd-cell-num">{fmt(price)}</td>
        <td class="pd-cell-num">{fmt(price)}</td>
      </tr>"""
    for i, (name, price) in enumerate(VEHICLES, start=1)
)

LOGO = Path(LOGO_SVG).read_text(encoding="utf-8")
LOGO = LOGO[LOGO.index("<svg"):]
LOGO = LOGO.replace("<svg ", '<svg class="pdoc-logo" ', 1)

HTMLDOC = f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Cotización · Wings Global Trade · Toyota RAV4 Híbrido 2026 · Jhonny Carrasco</title>
<style>
  :root {{
    --font-ui: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    --font-mono: 'Inter', ui-monospace, 'SF Mono', Menlo, monospace;
  }}
  html, body {{ margin: 0; padding: 0; }}
  body {{ background: #52555a; }}
  .pdoc-page {{ min-height: 100vh; padding: 28px 16px 48px; }}
  .pdoc-page .pdoc {{ box-shadow: 0 8px 40px rgba(0, 0, 0, 0.35); }}

  .pdoc {{
    --pd-ink: #0f1216; --pd-muted: #6b7280; --pd-line: #d1d5db;
    --pd-bar: #ececec; --pd-tint: #f7f8f9;
    box-sizing: border-box; width: 100%; max-width: 820px; margin: 0 auto;
    padding: 22px 52px 20px; background: #ffffff; color: var(--pd-ink);
    font-family: var(--font-ui, system-ui, sans-serif); font-size: 12px; line-height: 1.35;
  }}
  .pdoc *, .pdoc *::before, .pdoc *::after {{ box-sizing: border-box; }}

  .pdoc-header {{ display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; }}
  .pdoc-title {{ margin: 0; font-size: 30px; font-weight: 600; letter-spacing: -0.01em; line-height: 0.95; }}
  .pdoc-number {{ margin-top: 10px; font-family: var(--font-mono, monospace); font-size: 12.5px; letter-spacing: 0.02em; color: var(--pd-ink); }}
  .pdoc-brand {{ display: flex; flex-direction: column; align-items: flex-end; text-align: right; gap: 4px; flex-shrink: 0; }}
  .pdoc-logo {{ height: 56px; width: auto; }}
  .pdoc-brand-name {{ font-size: 15px; font-weight: 700; letter-spacing: 0.01em; margin-top: 2px; }}
  .pdoc-tagline {{ font-size: 10.5px; letter-spacing: 0.02em; color: var(--pd-muted); text-transform: uppercase; }}

  .pdoc-rule {{ position: relative; height: 3px; margin: 16px 0 16px; background: var(--pd-line); }}
  .pdoc-rule::before {{ content: ''; position: absolute; left: 0; top: 0; height: 100%; width: 168px; background: var(--pd-ink); }}

  .pdoc-dateline {{ display: flex; flex-wrap: wrap; gap: 5px 16px; margin-bottom: 14px; font-size: 11.5px; color: var(--pd-muted); }}
  .pdoc-dateline span:not(:last-child)::after {{ content: '|'; margin-left: 16px; color: var(--pd-line); }}

  .pdoc-parties {{ display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }}
  .pdoc-party {{ border: 1px solid var(--pd-line); padding: 14px 16px; }}
  .pdoc-party-head {{ font-size: 10.5px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 7px; }}
  .pdoc-party-name {{ font-weight: 600; margin-bottom: 7px; }}
  .pdoc-party-meta {{ display: grid; grid-template-columns: 80px 1fr; gap: 3px 12px; margin: 0; font-size: 11.5px; }}
  .pdoc-party-meta dt {{ color: var(--pd-muted); }}
  .pdoc-party-meta dd {{ margin: 0; }}

  .pdoc-table {{ width: 100%; border-collapse: collapse; table-layout: fixed; }}
  .pdoc-table thead th {{ background: var(--pd-bar); font-size: 10.5px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; padding: 6px 9px; text-align: center; border: 1px solid var(--pd-line); }}
  .pdoc-table th.pd-col-item {{ width: 7%; }}
  .pdoc-table th.pd-col-desc {{ width: 45%; }}
  .pdoc-table th.pd-col-qty {{ width: 13%; }}
  .pdoc-table tbody tr {{ break-inside: avoid; }}
  .pdoc-table tbody td {{ border: 1px solid var(--pd-line); padding: 12px 9px; vertical-align: top; font-size: 11.5px; }}
  .pd-item {{ font-weight: 600; text-align: center; }}
  .pd-desc {{ text-align: left; }}
  .pd-desc .pd-model {{ font-weight: 600; }}
  .pd-qty {{ text-align: center; font-weight: 600; }}
  .pd-cell-num {{ text-align: right; font-family: var(--font-mono, monospace); font-variant-numeric: tabular-nums; }}

  .pdoc-totals {{ margin: 18px 0 6px auto; width: 360px; }}
  .pdoc-total-row {{ display: flex; justify-content: space-between; gap: 24px; padding: 10px 6px; border-top: 1px solid var(--pd-line); }}
  .pdoc-total-row .pd-total-label {{ font-weight: 600; }}
  .pdoc-total-row .pd-total-value {{ font-family: var(--font-mono, monospace); font-variant-numeric: tabular-nums; }}
  .pdoc-total-row[data-emphasis='true'] {{ border-top: 2px solid var(--pd-ink); }}
  .pdoc-total-row[data-emphasis='true'] .pd-total-label, .pdoc-total-row[data-emphasis='true'] .pd-total-value {{ font-size: 14.5px; font-weight: 700; white-space: nowrap; }}
  .pdoc-total-note {{ margin: 4px 0 0 auto; width: 360px; text-align: right; font-size: 10.5px; color: var(--pd-muted); }}

  .pdoc-section-bar {{ background: var(--pd-bar); padding: 7px 12px; margin: 12px 0 8px; font-size: 11.5px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; text-align: center; }}
  .pdoc-section-bar--observaciones {{ margin-top: 60px; }}
  .pdoc-terms {{ display: grid; grid-template-columns: 210px 1fr; gap: 4px 16px; padding: 0 4px; font-size: 11.5px; }}
  .pdoc-term-label {{ font-weight: 600; }}
  .pdoc-observations {{ margin: 0; padding: 0 4px; list-style: none; font-size: 11.5px; }}
  .pdoc-observations li {{ position: relative; padding-left: 18px; margin-bottom: 2px; }}
  .pdoc-observations li::before {{ content: '•'; position: absolute; left: 4px; }}

  .pdoc-tail {{ margin-top: 26px; padding-top: 10px; }}
  .pdoc-close-row {{ display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; }}
  .pdoc-close-signoff {{ margin-top: 2px; font-weight: 600; }}

  .pdoc-footer {{ display: flex; justify-content: space-between; gap: 24px; margin-top: 6px; padding-top: 6px; border-top: 1px solid var(--pd-line); color: var(--pd-muted); font-size: 11.5px; break-inside: avoid; }}
  .pdoc-footer .pd-foot-right {{ text-align: right; }}

  @media (max-width: 640px) {{
    .pdoc {{ padding: 26px 20px 28px; }}
    .pdoc-title {{ font-size: 32px; }}
    .pdoc-parties {{ grid-template-columns: 1fr; }}
    .pdoc-terms {{ grid-template-columns: 1fr; gap: 0; }}
    .pdoc-totals, .pdoc-total-note {{ width: 100%; }}
    .pdoc-close-row {{ flex-direction: column; align-items: flex-start; gap: 16px; }}
    .pdoc-footer {{ flex-direction: column; gap: 12px; }}
  }}

  @media print {{
    @page {{ size: A4 portrait; margin: 8mm; }}
    body {{ background: #ffffff; }}
    .pdoc-page {{ min-height: 0; padding: 0; }}
    .pdoc-page .pdoc {{ box-shadow: none; }}
    .pdoc {{ max-width: none; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
    .pdoc-close-row, .pdoc-footer {{ break-inside: avoid; }}
  }}
</style>
</head>
<body>
<div class="pdoc-page">
<article class="pdoc">

  <header class="pdoc-header">
    <div>
      <h1 class="pdoc-title">Cotización</h1>
      <p class="pdoc-number">{DOC_NUMBER}</p>
    </div>
    <div class="pdoc-brand">
      {LOGO}
      <span class="pdoc-brand-name">WINGS GLOBAL TRADE</span>
      <span class="pdoc-tagline">SOLUCIONES INTEGRALES EN IMPORTACIÓN</span>
    </div>
  </header>
  <div class="pdoc-rule" aria-hidden="true"></div>

  <div class="pdoc-dateline">
    <span>Iquique, {DOC_DATE}</span>
    <span>Validez: 15 días</span>
    <span>Puerto de llegada: {PUERTO_LLEGADA}</span>
    <span>Moneda: USD</span>
  </div>

  <div class="pdoc-parties">
    <div class="pdoc-party">
      <div class="pdoc-party-head">Vendedor</div>
      <div class="pdoc-party-name">IMPORT - EXPORT SHINING STAR LIMITADA</div>
      <dl class="pdoc-party-meta">
        <dt>RUT</dt><dd>76029544-2</dd>
        <dt>País</dt><dd>Chile</dd>
      </dl>
    </div>
    <div class="pdoc-party">
      <div class="pdoc-party-head">Comprador / Cliente</div>
      <div class="pdoc-party-name">{CLIENTE}</div>
      <dl class="pdoc-party-meta">
        <dt>País</dt><dd>{PAIS_CLIENTE}</dd>
      </dl>
    </div>
  </div>

  <div class="pdoc-section-bar">Vehículos cotizados</div>
  <table class="pdoc-table">
    <thead>
      <tr>
        <th class="pd-col-item">Ítem</th>
        <th class="pd-col-desc">Descripción</th>
        <th class="pd-col-qty">Cantidad</th>
        <th>Valor Unitario</th>
        <th>Importe</th>
      </tr>
    </thead>
    <tbody>
{ROWS_HTML}
    </tbody>
  </table>

  <div class="pdoc-totals">
    <div class="pdoc-total-row" data-emphasis="true">
      <span class="pd-total-label">Precio total (3 unidades)</span>
      <span class="pd-total-value">USD {fmt(PRECIO_TOTAL)}</span>
    </div>
  </div>
  <p class="pdoc-total-note">Precio sin IGV — importación chilena</p>

  <div class="pdoc-section-bar">Condiciones comerciales</div>
  <div class="pdoc-terms">
    <span class="pdoc-term-label">Puerto de llegada</span><span>{PUERTO_LLEGADA}</span>
    <span class="pdoc-term-label">Condición del precio</span><span>{CONDICION_PRECIO}</span>
    <span class="pdoc-term-label">Forma de pago</span><span>50% adelantado y 50% al embarque en el puerto de origen.</span>
    <span class="pdoc-term-label">Tiempo de entrega</span><span>Embarque dentro de 30 días naturales tras recibir el pago final.</span>
    <span class="pdoc-term-label">Vigencia de la oferta</span><span>15 días desde la fecha de esta cotización.</span>
  </div>

  <div class="pdoc-section-bar pdoc-section-bar--observaciones">Observaciones</div>
  <ul class="pdoc-observations">
    <li>Precios puestos en Iquique, Chile; no incluyen IGV — corresponden a una importación chilena. Los tributos y trámites de nacionalización en Chile son de cargo del comprador.</li>
    <li>Los precios están calculados según la tarifa de flete internacional vigente a la fecha de esta cotización. Los precios podrían variar si el flete cambia al momento en que el cliente decida proceder con el pedido.</li>
    <li>Precio sujeto a confirmación de disponibilidad de las unidades.</li>
  </ul>

  <div class="pdoc-tail">
  <div class="pdoc-close-row">
    <div class="pdoc-close">
      <div>Atentamente,</div>
      <div class="pdoc-close-signoff">WINGS GLOBAL TRADE</div>
    </div>
  </div>

  <footer class="pdoc-footer">
    <div>
      <div>IMPORT - EXPORT SHINING STAR LIMITADA</div>
    </div>
    <div class="pd-foot-right">
      <div>RUT 76029544-2</div>
    </div>
  </footer>
  </div>

</article>
</div>
</body>
</html>
"""

out = HERE / "cotizacion.html"
out.write_text(HTMLDOC, encoding="utf-8")
print(f"wrote {out} ({len(HTMLDOC):,} bytes)")
print(f"--- client-facing ---")
for name, price in VEHICLES:
    print(f"  {name}: {fmt(price)}")
print(f"precio_total={fmt(PRECIO_TOTAL)}")
