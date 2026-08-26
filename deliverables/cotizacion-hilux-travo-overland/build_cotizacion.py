#!/usr/bin/env python3
"""Build a Wings Automóviles branded CLIENT quotation TEMPLATE (Cotización)
for 2× Toyota Hilux Travo Overland, priced from TOWER's own SUNAT
import-cost engine — a faithful port of
apps/tower/src/lib/costing/engine.ts (computeImportCost), the same port
used in ../costeo-hilux-travo-overland/build_costeo.py. Fixes the prior
version of this document, which used a hand-approximated cost buildup
(no Zofratacna freight leg, S/ 3.50 TC guessed rather than TOWER's own
S/ 3.70 default) instead of running the actual engine:

  Costo (landed, per unit) = CIF + Ad Valorem + ISC + Gastos vinculados
    where CIF = FOB + Flete/unidad + Seguro (1.5%); Gastos vinculados =
    Flete Zofratacna + Gastos portuarios + Agencia de aduana + Manipuleo
  Margen = Costo × 10% (Wings Global Trade's standard rate, per instruction)
  Valor de venta = Costo + Margen
  IGV ventas = Valor de venta × 18%
  Precio final = Valor de venta + IGV ventas

No client was specified — this is a reusable TEMPLATE with placeholder
Comprador fields (bracketed, muted) to be filled in per deal. The client sees
only Valor de Venta + IGV; Wings' internal landed cost and margin are never
shown, per house rule. Reuses the `pdoc` grid/layout/logo from the Wings
quotation family. Run:
  python3 build_cotizacion.py
"""
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

HERE = Path(__file__).resolve().parent
LOGO_SVG = HERE / "wings-icon.svg"  # icon-only mark — see the Prado cotización
# for why the full "WINGS GLOBAL TRADE" lockup SVG isn't used for this entity.


def d(x) -> Decimal:
    return Decimal(str(x))


def r2(x: Decimal) -> Decimal:
    return x.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


# ── ImportInputs — TOWER field names kept verbatim for traceability;
# same inputs as ../costeo-hilux-travo-overland/build_costeo.py ─────────────
UNITS = 2
FOB_UNIT = d(46000)
FREIGHT_UNIT = d(8000) / UNITS       # container fits 2 units, freight split
FREIGHT_ZOFRATACNA = d(500)          # TOWER DEFAULT_INPUTS — not specified for this deal
GASTOS_PORTUARIOS = d(375)           # TOWER DEFAULT_INPUTS
AGENCIA_ADUANA = d(300)              # TOWER DEFAULT_INPUTS
MANIPULEO_ESTIBA = d(0)              # TOWER DEFAULT_INPUTS
AD_VALOREM_RATE = d(0)               # TOWER DEFAULT_INPUTS (China origin)
IGV_RATE = d("0.18")
INSURANCE_RATE = d("0.015")
MARKUP_PCT = d("0.10")               # Wings Global Trade's standard margin, per instruction
TIPO_CAMBIO = d("3.7")               # TOWER DEFAULT_INPUTS (was guessed as 3.5 before — the fix)
ISC_RATE = d(0)                      # deriveISCRate: diesel -> 0

# ── computeImportCost (FOB incoterm path) — per unit ───────────────────────
cif_base = r2(FOB_UNIT + FREIGHT_UNIT)
insurance = r2(INSURANCE_RATE * cif_base)
cif = r2(cif_base + insurance)
ad_valorem = r2(AD_VALOREM_RATE * cif)
isc = r2(ISC_RATE * (cif + ad_valorem))
gastos_vinculados = r2(FREIGHT_ZOFRATACNA + GASTOS_PORTUARIOS + AGENCIA_ADUANA + MANIPULEO_ESTIBA)
landed_cost_unit = r2(cif + ad_valorem + isc + gastos_vinculados)

margen_unit = r2(landed_cost_unit * MARKUP_PCT)
valor_venta_unit = r2(landed_cost_unit + margen_unit)

VALOR_VENTA_UNIT = valor_venta_unit
VALOR_VENTA = r2(valor_venta_unit * UNITS)
IGV = r2(VALOR_VENTA * IGV_RATE)
PRECIO_TOTAL = r2(VALOR_VENTA + IGV)
PRECIO_TOTAL_SOLES = r2(PRECIO_TOTAL * TIPO_CAMBIO)


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
<title>Cotización · Wings Automóviles · Toyota Hilux Travo Overland</title>
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
  .pdoc-party-name.pd-placeholder {{ font-weight: 500; font-style: italic; color: var(--pd-muted); }}
  .pdoc-party-meta {{ display: grid; grid-template-columns: 80px 1fr; gap: 3px 12px; margin: 0; font-size: 11.5px; }}
  .pdoc-party-meta dt {{ color: var(--pd-muted); }}
  .pdoc-party-meta dd {{ margin: 0; }}
  .pdoc-party-meta dd.pd-placeholder {{ font-style: italic; color: var(--pd-muted); }}

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
      <p class="pdoc-number">COT-WA-2026-0826</p>
    </div>
    <div class="pdoc-brand">
      {LOGO}
      <span class="pdoc-brand-name">WINGS AUTOMÓVILES</span>
      <span class="pdoc-tagline">SOLUCIONES INTEGRALES EN IMPORTACIÓN</span>
    </div>
  </header>
  <div class="pdoc-rule" aria-hidden="true"></div>

  <div class="pdoc-dateline">
    <span>Lima, 26-08-2026</span>
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
      <div class="pdoc-party-name pd-placeholder">[Nombre del cliente]</div>
      <dl class="pdoc-party-meta">
        <dt>País</dt><dd class="pd-placeholder">[País]</dd>
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
        <th>Valor unit. (USD)</th>
        <th>Importe (USD)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="pd-item">1</td>
        <td class="pd-desc">
          <span class="pd-model">Toyota Hilux Travo Overland</span>
          <span class="pd-spec">2.8 Turbodiésel · 4WD · Automática de 6 velocidades · Origen: China · Nacionalizado, puesto en Callao</span>
        </td>
        <td class="pd-cell-num">{UNITS} unidades</td>
        <td class="pd-cell-num">{fmt(VALOR_VENTA_UNIT)}</td>
        <td class="pd-cell-num">{fmt(VALOR_VENTA)}</td>
      </tr>
      <tr class="pd-row-total">
        <td class="pd-item"></td>
        <td class="pd-desc">Valor de venta</td>
        <td class="pd-cell-num">{UNITS} unidades</td>
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
    <li>Precio sujeto a confirmación de disponibilidad de las unidades y variaciones de tipo de cambio o tributos aduaneros vigentes a la fecha de nacionalización.</li>
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
print(f"FOB/unit={fmt(FOB_UNIT)} Flete/unit={fmt(FREIGHT_UNIT)} Seguro/unit={fmt(insurance)}")
print(f"CIF/unit={fmt(cif)} Gastos_vinculados/unit={fmt(gastos_vinculados)} Landed_cost/unit={fmt(landed_cost_unit)}")
print(f"Margen(10%)/unit={fmt(margen_unit)} Valor_venta/unit={fmt(VALOR_VENTA_UNIT)}")
print(f"units={UNITS} valor_venta_total={fmt(VALOR_VENTA)} igv={fmt(IGV)} precio_total={fmt(PRECIO_TOTAL)}")
