#!/usr/bin/env python3
"""Build the Wings Global Trade branded CLIENT quotation (Cotización) for
1x Toyota Land Cruiser Prado Híbrida, WITHOUT a named client — per
explicit request ("cotizacion sin nombre") — using the [Nombre del
cliente] / [País] placeholder pattern from the original generic Hilux
Travo Overland Plus cotización template.

Pricing basis: user-supplied costing sheet (2026-09-23), a landed-cost
buildup distinct from the SUNAT-engine costeo used for the Hilux line —
this one is sourced ex-Miami (dealer invoice basis), not the Thailand/
Zofratacna Hilux costeo:

  Sale Price (dealer invoice)          70,979.70
  Predelivery Service Charge            1,298.00
  License and Fees                      1,245.50
  Goods Value (commercial invoice)     73,523.20
  Ocean Freight, Miami → Callao (20ft)  3,250.00
  Cargo Insurance (1.0%)                  735.23
  CIF                                  77,508.43
  Ad Valorem (0%)                           0.00
  IGV importación (18% of CIF)          13,951.52
  Gastos Portuarios (Callao)              375.00
  Agencia de Aduana                       300.00
  Subtotal (before Octavio commission) 92,134.95
  Octavio — dealer transfer/export fee   2,000.00
  TOTAL LANDED COST                    94,134.95
  Markup — Scenario 1 (6.3%)            5,930.50
  SELLING PRICE — Scenario 1          100,065.45

Per client correction (2026-09-23): unlike the Hilux line's SUNAT-engine
costeo, this sheet's "Selling Price — Scenario 1" (100,065.45) ALREADY
INCLUDES IGV — it is NOT a pre-tax Valor de Venta to which a fresh 18%
should be added. So here Valor de Venta is back-calculated as
Precio Total / 1.18, and IGV is the difference — the reverse of the
Hilux-style layering. Internal landed cost, Octavio's fee and the
Peru-dealer comparison are NOT shown to the client (house rule).

Run: python3 build_cotizacion.py
"""
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

HERE = Path(__file__).resolve().parent
LOGO_SVG = HERE / "wings-icon.svg"


def D(x) -> Decimal:
    return Decimal(str(x))


def r2(x: Decimal) -> Decimal:
    return x.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


# ── User-supplied costing sheet inputs (internal, not shown to client) ──
SALE_PRICE_DEALER = D("70979.70")
PDI_CHARGE = D("1298.00")
LICENSE_FEES = D("1245.50")
GOODS_VALUE = D("73523.20")
OCEAN_FREIGHT = D("3250.00")
INSURANCE_RATE = D("0.01")
GASTOS_PORTUARIOS = D("375.00")
AGENCIA_ADUANA = D("300.00")
OCTAVIO_FEE = D("2000.00")
AD_VALOREM_RATE = D("0.00")
IGV_RATE = D("0.18")
MARKUP_RATE = D("0.063")
EXCHANGE_RATE = D("3.70")

UNITS = 1

ORIGEN = "Estados Unidos (Miami)"
PUERTO_LLEGADA = "Callao, Perú"
CONDICION_PRECIO = "Nacionalizado, incluye IGV — puesto en Callao"
DOC_NUMBER = "COT-WGT-2026-0923"
FECHA = "Lima, 23-09-2026"
MODEL_NAME = "Toyota Land Cruiser Prado Híbrida"
MODEL_DESC = "2.4L Turbo Híbrido i-FORCE MAX · Grado \"Land Cruiser\""

# ── Landed-cost buildup (internal, mirrors the source costing sheet) ────
# Insurance is 1.0% of Goods Value only (verified against the sheet: 1% of
# 73,523.20 = 735.23, matching exactly — NOT 1% of Goods Value + Freight).
insurance = r2(GOODS_VALUE * INSURANCE_RATE)
cif = r2(GOODS_VALUE + OCEAN_FREIGHT + insurance)
ad_valorem = r2(cif * AD_VALOREM_RATE)
igv_base = r2(cif + ad_valorem)
igv_importacion = r2(igv_base * IGV_RATE)
subtotal = r2(cif + ad_valorem + igv_importacion + GASTOS_PORTUARIOS + AGENCIA_ADUANA)
landed_cost = r2(subtotal + OCTAVIO_FEE)

margin_usd = r2(landed_cost * MARKUP_RATE)
selling_price = r2(landed_cost + margin_usd)  # Precio total, YA incluye IGV (per client correction)

# ── Client-facing: selling_price is IGV-INCLUSIVE (per client correction),
# so back out Valor de Venta and IGV from it rather than adding IGV on top.
PRECIO_TOTAL_UNIT = selling_price
VALOR_VENTA_UNIT = r2(PRECIO_TOTAL_UNIT / (D(1) + IGV_RATE))
IGV_UNIT = r2(PRECIO_TOTAL_UNIT - VALOR_VENTA_UNIT)

VALOR_VENTA = r2(VALOR_VENTA_UNIT * UNITS)
IGV = r2(IGV_UNIT * UNITS)
PRECIO_TOTAL = r2(PRECIO_TOTAL_UNIT * UNITS)
PRECIO_TOTAL_SOLES = r2(PRECIO_TOTAL * EXCHANGE_RATE)


def fmt(x: Decimal) -> str:
    return f"{x:,.2f}"


LOGO = Path(LOGO_SVG).read_text(encoding="utf-8")
LOGO = LOGO[LOGO.index("<svg"):]
LOGO = LOGO.replace("<svg ", '<svg class="pdoc-logo" ', 1)

HTMLDOC = f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Cotización · Wings Global Trade · Toyota Land Cruiser Prado Híbrida</title>
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
  .pdoc-party-name.pd-placeholder {{ font-weight: 500; font-style: italic; color: var(--pd-muted); }}
  .pdoc-party-meta {{ display: grid; grid-template-columns: 80px 1fr; gap: 3px 12px; margin: 0; font-size: 11.5px; }}
  .pdoc-party-meta dt {{ color: var(--pd-muted); }}
  .pdoc-party-meta dd {{ margin: 0; }}
  .pdoc-party-meta dd.pd-placeholder {{ font-style: italic; color: var(--pd-muted); }}

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
  .pd-desc .pd-motor {{ color: var(--pd-muted); font-size: 10.5px; }}
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
    <span>{FECHA}</span>
    <span>Validez: 15 días</span>
    <span>Puerto de llegada: {PUERTO_LLEGADA}</span>
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

  <div class="pdoc-section-bar">Vehículo cotizado</div>
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
      <tr>
        <td class="pd-item">1</td>
        <td class="pd-desc">
          <span class="pd-model">{MODEL_NAME}</span><br />
          <span class="pd-motor">{MODEL_DESC}</span>
        </td>
        <td class="pd-qty">{UNITS}</td>
        <td class="pd-cell-num">{fmt(VALOR_VENTA_UNIT)}</td>
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
      <span class="pd-total-label">Precio total</span>
      <span class="pd-total-value">USD {fmt(PRECIO_TOTAL)}</span>
    </div>
  </div>
  <p class="pdoc-total-note">Referencial: S/ {fmt(PRECIO_TOTAL_SOLES)} (T.C. {EXCHANGE_RATE})</p>

  <div class="pdoc-section-bar">Condiciones comerciales</div>
  <div class="pdoc-terms">
    <span class="pdoc-term-label">Origen</span><span>{ORIGEN}</span>
    <span class="pdoc-term-label">Puerto de llegada</span><span>{PUERTO_LLEGADA}</span>
    <span class="pdoc-term-label">Condición del precio</span><span>{CONDICION_PRECIO}</span>
    <span class="pdoc-term-label">Forma de pago</span><span>50% a la confirmación del pedido; 50% antes del despacho a nombre del cliente.</span>
    <span class="pdoc-term-label">Tiempo de entrega</span><span>A coordinar según disponibilidad de stock e itinerario de nacionalización.</span>
    <span class="pdoc-term-label">Vigencia de la oferta</span><span>15 días desde la fecha de esta cotización.</span>
  </div>

  <div class="pdoc-section-bar pdoc-section-bar--observaciones">Observaciones</div>
  <ul class="pdoc-observations">
    <li>Precio final nacionalizado en Perú, incluye IGV (18%); no incluye trámites de placa/registro posteriores a la entrega.</li>
    <li>Ad Valorem 0% aplicado por origen Estados Unidos, sujeto a confirmación por partida arancelaria exacta al momento del despacho.</li>
    <li>Tipo de cambio referencial S/ {EXCHANGE_RATE} por USD; el precio final se factura en la moneda acordada al momento del pago.</li>
    <li>Precio sujeto a confirmación de disponibilidad de las unidades y variaciones de tipo de cambio o tributos aduaneros vigentes a la fecha de nacionalización.</li>
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
print(f"--- internal (not shown to client) ---")
print(f"cif={fmt(cif)} igv_importacion={fmt(igv_importacion)} subtotal={fmt(subtotal)} landed_cost={fmt(landed_cost)} margin={fmt(margin_usd)}")
print(f"--- client-facing ---")
print(f"units={UNITS} valor_venta_unit={fmt(VALOR_VENTA_UNIT)} valor_venta_total={fmt(VALOR_VENTA)}")
print(f"igv={fmt(IGV)} precio_total={fmt(PRECIO_TOTAL)} (S/ {fmt(PRECIO_TOTAL_SOLES)})")
