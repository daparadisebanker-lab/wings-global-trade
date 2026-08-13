#!/usr/bin/env python3
"""Build the Wings Automóviles branded CLIENT quotation (Cotización) for a
Toyota Land Cruiser Prado 2026 2.4T Híbrido (FULL / Flagship VX), issued to
Atilio Gargate Huayanay, port of arrival Callao, Perú.

Pricing is derived from FORMULA_DE_COSTOS.xlsx (sheet "PRADO", column D —
the only column relevant to this vehicle; the sheet's other columns hold
unrelated reference data for other vehicles/clients and are not used here).
The client sees only the final commercial price — Wings' internal landed
cost and margin are never shown, only the resulting Valor de Venta + IGV,
which is how Peru B2B quotations are conventionally itemized. Reuses the
`pdoc` grid/layout/logo from the Wings quotation family. Run:
  python3 build_cotizacion.py
"""
from pathlib import Path

HERE = Path(__file__).resolve().parent
LOGO_SVG = HERE / "wings-icon.svg"  # icon-only mark — the full lockup SVG spells out
# "WINGS GLOBAL TRADE" as vector artwork, which would misrepresent the issuing
# entity here (Wings Automóviles S.R.L., a distinct Peru RUC). This is the same
# wing icon with the wordmark portion of the source SVG excluded.

# ── Source: FORMULA_DE_COSTOS.xlsx, sheet "PRADO", column D ───────────────
# Costo total de importación (landed cost, pre-nationalization IGV) = D60.
# Internal only — never shown to the client, per house rule.
COSTO_IMPORTACION = 82250.00
MARKUP_PCT = 0.12
IGV_PCT = 0.18
TIPO_CAMBIO = 3.5  # referencial, S/ por USD (D18 en la hoja de costos)

MARGEN = round(COSTO_IMPORTACION * MARKUP_PCT, 2)
VALOR_VENTA = round(COSTO_IMPORTACION + MARGEN, 2)
IGV = round(VALOR_VENTA * IGV_PCT, 2)
PRECIO_TOTAL = round(VALOR_VENTA + IGV, 2)
PRECIO_TOTAL_SOLES = round(PRECIO_TOTAL * TIPO_CAMBIO, 2)


def fmt(n: float) -> str:
    return f"{n:,.2f}"


LOGO = Path(LOGO_SVG).read_text(encoding="utf-8")
LOGO = LOGO[LOGO.index("<svg"):]
LOGO = LOGO.replace("<svg ", '<svg class="pdoc-logo" ', 1)

HTMLDOC = f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Cotización · Wings Automóviles · Toyota Land Cruiser Prado 2026</title>
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
    display: flex; flex-direction: column; min-height: 1040px;
  }}
  .pdoc *, .pdoc *::before, .pdoc *::after {{ box-sizing: border-box; }}

  .pdoc-header {{ display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; }}
  .pdoc-title {{ margin: 0; font-size: 30px; font-weight: 600; letter-spacing: -0.01em; line-height: 0.95; }}
  .pdoc-number {{ margin-top: 10px; font-family: var(--font-mono, monospace); font-size: 12.5px; letter-spacing: 0.02em; color: var(--pd-ink); }}
  .pdoc-brand {{ display: flex; flex-direction: column; align-items: flex-end; text-align: right; gap: 4px; flex-shrink: 0; }}
  .pdoc-logo {{ height: 38px; width: auto; }}
  .pdoc-brand-name {{ font-size: 15px; font-weight: 700; letter-spacing: 0.01em; margin-top: 2px; }}
  .pdoc-tagline {{ font-size: 10.5px; letter-spacing: 0.02em; color: var(--pd-muted); text-transform: uppercase; }}

  .pdoc-rule {{ position: relative; height: 3px; margin: 10px 0 12px; background: var(--pd-line); }}
  .pdoc-rule::before {{ content: ''; position: absolute; left: 0; top: 0; height: 100%; width: 168px; background: var(--pd-ink); }}

  .pdoc-dateline {{ display: flex; flex-wrap: wrap; gap: 5px 16px; margin-bottom: 7px; font-size: 11.5px; color: var(--pd-muted); }}
  .pdoc-dateline span:not(:last-child)::after {{ content: '|'; margin-left: 16px; color: var(--pd-line); }}

  .pdoc-parties {{ display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 6px; }}
  .pdoc-party {{ border: 1px solid var(--pd-line); padding: 10px 12px; }}
  .pdoc-party-head {{ font-size: 10.5px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 7px; }}
  .pdoc-party-name {{ font-weight: 600; margin-bottom: 7px; }}
  .pdoc-party-meta {{ display: grid; grid-template-columns: 80px 1fr; gap: 3px 12px; margin: 0; font-size: 11.5px; }}
  .pdoc-party-meta dt {{ color: var(--pd-muted); }}
  .pdoc-party-meta dd {{ margin: 0; }}

  .pdoc-table {{ width: 100%; border-collapse: collapse; table-layout: fixed; }}
  .pdoc-table thead th {{ background: var(--pd-bar); font-size: 10.5px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; padding: 6px 9px; text-align: center; border: 1px solid var(--pd-line); }}
  .pdoc-table th.pd-col-item {{ width: 7%; }}
  .pdoc-table th.pd-col-desc {{ width: 53%; }}
  .pdoc-table th.pd-col-qty {{ width: 10%; }}
  .pdoc-table tbody tr {{ break-inside: avoid; }}
  .pdoc-table tbody td {{ border: 1px solid var(--pd-line); padding: 8px 9px; vertical-align: top; font-size: 11.5px; }}
  .pd-item {{ font-weight: 600; text-align: center; }}
  .pd-desc {{ text-align: left; }}
  .pd-desc .pd-model {{ font-weight: 600; display: block; margin-bottom: 3px; }}
  .pd-desc .pd-spec {{ color: var(--pd-muted); font-size: 11px; }}
  .pd-cell-num {{ text-align: right; font-family: var(--font-mono, monospace); font-variant-numeric: tabular-nums; }}
  .pd-row-total td {{ background: var(--pd-tint); font-weight: 700; }}

  .pdoc-totals {{ margin: 10px 0 4px auto; width: 360px; }}
  .pdoc-total-row {{ display: flex; justify-content: space-between; gap: 24px; padding: 6px 6px; border-top: 1px solid var(--pd-line); }}
  .pdoc-total-row .pd-total-label {{ font-weight: 600; }}
  .pdoc-total-row .pd-total-value {{ font-family: var(--font-mono, monospace); font-variant-numeric: tabular-nums; }}
  .pdoc-total-row[data-emphasis='true'] {{ border-top: 2px solid var(--pd-ink); }}
  .pdoc-total-row[data-emphasis='true'] .pd-total-label, .pdoc-total-row[data-emphasis='true'] .pd-total-value {{ font-size: 14.5px; font-weight: 700; white-space: nowrap; }}
  .pdoc-total-note {{ margin: 4px 0 0 auto; width: 360px; text-align: right; font-size: 10.5px; color: var(--pd-muted); }}

  .pdoc-section-bar {{ background: var(--pd-bar); padding: 5px 12px; margin: 6px 0 5px; font-size: 11.5px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }}
  .pdoc-terms {{ display: grid; grid-template-columns: 210px 1fr; gap: 4px 16px; padding: 0 4px; font-size: 11.5px; }}
  .pdoc-term-label {{ font-weight: 600; }}
  .pdoc-observations {{ margin: 0; padding: 0 4px; list-style: none; font-size: 11.5px; }}
  .pdoc-observations li {{ position: relative; padding-left: 18px; margin-bottom: 2px; }}
  .pdoc-observations li::before {{ content: '•'; position: absolute; left: 4px; }}

  .pdoc-tail {{ margin-top: auto; padding-top: 10px; }}
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
    .pdoc {{ max-width: none; padding: 0; min-height: 280mm; -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
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
      <p class="pdoc-number">COT-WA-2026-0813</p>
    </div>
    <div class="pdoc-brand">
      {LOGO}
      <span class="pdoc-brand-name">WINGS AUTOMÓVILES</span>
      <span class="pdoc-tagline">SOLUCIONES INTEGRALES EN IMPORTACIÓN</span>
    </div>
  </header>
  <div class="pdoc-rule" aria-hidden="true"></div>

  <div class="pdoc-dateline">
    <span>Lima, 13-08-2026</span>
    <span>Validez: 15 días</span>
    <span>Puerto de llegada: Callao, Perú</span>
    <span>Moneda: USD</span>
  </div>

  <div class="pdoc-parties">
    <div class="pdoc-party">
      <div class="pdoc-party-head">Vendedor</div>
      <div class="pdoc-party-name">IMP. Y EXP. WINGS AUTOMÓVILES S.R.L.</div>
      <dl class="pdoc-party-meta">
        <dt>RUC</dt><dd>20532415650</dd>
        <dt>País</dt><dd>Perú</dd>
      </dl>
    </div>
    <div class="pdoc-party">
      <div class="pdoc-party-head">Comprador / Cliente</div>
      <div class="pdoc-party-name">Atilio Gargate Huayanay</div>
      <dl class="pdoc-party-meta">
        <dt>País</dt><dd>Perú</dd>
      </dl>
    </div>
  </div>

  <div class="pdoc-section-bar">Vehículo cotizado</div>
  <table class="pdoc-table">
    <thead>
      <tr>
        <th class="pd-col-item">Ítem</th>
        <th class="pd-col-desc">Descripción</th>
        <th class="pd-col-qty">Cantidad</th>
        <th>Valor de venta (USD)</th>
        <th>Importe (USD)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="pd-item">1</td>
        <td class="pd-desc">
          <span class="pd-model">Toyota Land Cruiser Prado 2026 — FULL (tope de gama, Flagship VX)</span>
          <span class="pd-spec">2.4T Híbrido · Origen: China · Nacionalizado, puesto en Callao</span>
        </td>
        <td class="pd-cell-num">1 unidad</td>
        <td class="pd-cell-num">{fmt(VALOR_VENTA)}</td>
        <td class="pd-cell-num">{fmt(VALOR_VENTA)}</td>
      </tr>
      <tr class="pd-row-total">
        <td class="pd-item"></td>
        <td class="pd-desc">Valor de venta</td>
        <td class="pd-cell-num">1 unidad</td>
        <td class="pd-cell-num"></td>
        <td class="pd-cell-num">{fmt(VALOR_VENTA)}</td>
      </tr>
    </tbody>
  </table>

  <div class="pdoc-totals">
    <div class="pdoc-total-row">
      <span class="pd-total-label">Valor de venta</span>
      <span class="pd-total-value">{fmt(VALOR_VENTA)}</span>
    </div>
    <div class="pdoc-total-row">
      <span class="pd-total-label">IGV (18%)</span>
      <span class="pd-total-value">{fmt(IGV)}</span>
    </div>
    <div class="pdoc-total-row" data-emphasis="true">
      <span class="pd-total-label">Precio total (Callao)</span>
      <span class="pd-total-value">USD {fmt(PRECIO_TOTAL)}</span>
    </div>
  </div>
  <p class="pdoc-total-note">Referencial: S/ {fmt(PRECIO_TOTAL_SOLES)} (T.C. {TIPO_CAMBIO})</p>

  <div class="pdoc-section-bar">Condiciones comerciales</div>
  <div class="pdoc-terms">
    <span class="pdoc-term-label">Origen</span><span>China</span>
    <span class="pdoc-term-label">Puerto de llegada</span><span>Callao, Perú</span>
    <span class="pdoc-term-label">Condición del precio</span><span>Nacionalizado, incluye IGV — puesto en Callao</span>
    <span class="pdoc-term-label">Forma de pago</span><span>50% a la confirmación del pedido; 50% antes del despacho a nombre del cliente.</span>
    <span class="pdoc-term-label">Tiempo de entrega</span><span>A coordinar según disponibilidad de stock e itinerario de nacionalización.</span>
    <span class="pdoc-term-label">Vigencia de la oferta</span><span>15 días desde la fecha de esta cotización.</span>
  </div>

  <div class="pdoc-section-bar">Observaciones</div>
  <ul class="pdoc-observations">
    <li>Precio final nacionalizado en Perú, incluye IGV (18%); no incluye trámites de placa/registro posteriores a la entrega.</li>
    <li>Tipo de cambio referencial S/ {TIPO_CAMBIO} por USD; el precio final se factura en la moneda acordada al momento del pago.</li>
    <li>Precio sujeto a confirmación de disponibilidad de la unidad y variaciones de tipo de cambio o tributos aduaneros vigentes a la fecha de nacionalización.</li>
  </ul>

  <div class="pdoc-tail">
  <div class="pdoc-close-row">
    <div class="pdoc-close">
      <div>Atentamente,</div>
      <div class="pdoc-close-signoff">WINGS AUTOMÓVILES</div>
    </div>
  </div>

  <footer class="pdoc-footer">
    <div>
      <div>IMP. Y EXP. WINGS AUTOMÓVILES S.R.L.</div>
    </div>
    <div class="pd-foot-right">
      <div>RUC 20532415650</div>
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
print(f"costo_interno={fmt(COSTO_IMPORTACION)} margen_12%={fmt(MARGEN)}")
print(f"valor_venta={fmt(VALOR_VENTA)} igv={fmt(IGV)} precio_total={fmt(PRECIO_TOTAL)}")
