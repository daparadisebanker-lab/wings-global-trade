#!/usr/bin/env python3
"""Build the Wings Global Trade branded CLIENT quotation (Cotización) for
2x Toyota Hilux Travo Overland Plus, origin Thailand.

Pricing is computed by faithfully porting TOWER's SUNAT import-cost engine
(apps/tower/src/lib/costing/engine.ts — computeImportCost) in Python with
`decimal.Decimal` + ROUND_HALF_UP, matching decimal.js's rounding there.

User-specified inputs (2026-08-27):
  FOB = 43,000 USD/unit · Flete Internacional = 5,250 USD/unit · 2 unidades
  · Origen: Tailandia

Assumed (TOWER defaults / house convention, NOT user-specified — disclosed
in the document's Observaciones, same disclosure pattern as the internal
Hilux Travo Overland costeo):
  · Ad Valorem = 0% — Perú tiene TLC vigente con Tailandia; misma
    convención usada para origen China en cotizaciones previas de este
    mismo vehículo. Sujeto a confirmación por partida arancelaria exacta.
  · Fuel/CC: diésel 2.8L (2,755 cc) → ISC = 0% (regla motor
    diésel/híbrido del engine, deriveISCRate).
  · Flete Zofratacna 500 · Gastos portuarios 375 · Agencia de aduana 300 ·
    Manipuleo y estiba 0 (TOWER DEFAULT_INPUTS).
  · Seguro 1.5% · IGV 18% · Percepción 3.5% · T.C. 3.70 (TOWER DEFAULT_INPUTS).
  · Margen de utilidad 10% — misma tasa usada en la cotización y el costeo
    interno previos de este vehículo (Wings Global Trade).

The client sees only the resulting Valor de Venta + IGV + Precio Total —
Wings' internal landed cost and margin are never shown (house rule).
Reuses the `pdoc` grid/layout finalized on the Prado cotización
(cotizacion-prado-atilio-gargate/build_cotizacion.py — icon-only logo,
"WINGS GLOBAL TRADE" letterhead, centered section bars, no "(USD)"/
"(Callao)" suffixes) with the generic buyer placeholder pattern from the
original Hilux cotización (no client named for this request). Run:
  python3 build_cotizacion.py
"""
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

HERE = Path(__file__).resolve().parent
LOGO_SVG = HERE / "wings-icon.svg"


def D(x) -> Decimal:
    return Decimal(str(x))


def r2(x: Decimal) -> Decimal:
    return x.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


# ── User-specified inputs ───────────────────────────────────────────────
FOB_UNIT = D(43000)
FREIGHT_INT_UNIT = D(5250)
UNITS = 2
ORIGIN = "Tailandia"
PUERTO_LLEGADA = "Iquique, Chile"  # 2026-08-28: was Callao, Perú
CONDICION_PRECIO = "Nacionalizado, incluye IGV — puesto en Zofratacna, Tacna"

# ── Assumed / TOWER defaults (disclosed in Observaciones) ──────────────
FREIGHT_ZOFRATACNA = D(500)
PORT_EXPENSES = D(375)
CUSTOMS_AGENCY = D(300)
HANDLING_STOWAGE = D(0)
AD_VALOREM_RATE = D("0.00")
IGV_RATE = D("0.18")
PERCEPCION_RATE = D("0.035")
INSURANCE_RATE = D("0.015")
EXCHANGE_RATE = D("3.70")
MARGIN_PCT = D("0.10")

# ── computeImportCost — faithful port, FOB incoterm path, per unit ─────
cif_base = r2(FOB_UNIT + FREIGHT_INT_UNIT)
insurance = r2(INSURANCE_RATE * cif_base)
cif = r2(cif_base + insurance)
ad_valorem = r2(AD_VALOREM_RATE * cif)
isc_rate = D(0)  # diesel → deriveISCRate = 0
isc = r2(isc_rate * (cif + ad_valorem))

dutiable_base_soles = r2((cif + ad_valorem + isc) * EXCHANGE_RATE)
igv_importacion = r2(dutiable_base_soles * IGV_RATE / EXCHANGE_RATE)

percepcion_base_soles = r2((cif + ad_valorem + isc + igv_importacion) * EXCHANGE_RATE)
percepcion = r2(percepcion_base_soles * PERCEPCION_RATE / EXCHANGE_RATE)

gastos_vinculados = r2(FREIGHT_ZOFRATACNA + PORT_EXPENSES + CUSTOMS_AGENCY + HANDLING_STOWAGE)
landed_cost = r2(cif + ad_valorem + isc + gastos_vinculados)
cash_outlay = r2(landed_cost + igv_importacion + percepcion)

min_by_usd = D(1000) / landed_cost if landed_cost > 0 else D(0)
margin_rate = max(MARGIN_PCT, min_by_usd)
margin_usd = r2(landed_cost * margin_rate)
sale_price_unit_raw = r2(landed_cost + margin_usd)  # Valor de venta, sin IGV, por unidad

# Commercial rounding: bump the per-unit sale price so the 2-unit, IGV-included
# total lands on a round USD 130,300 (requested 2026-08-27), instead of the
# raw-margin total of USD 130,186.16. +48.24/unit added on top of the 10%
# margin — same rounding-up-to-a-clean-number practice as any other quote.
ROUNDING_ADJUSTMENT_UNIT = D("48.24")
sale_price_unit = r2(sale_price_unit_raw + ROUNDING_ADJUSTMENT_UNIT)

igv_ventas_unit = r2(sale_price_unit * IGV_RATE)
sale_price_final_unit = r2(sale_price_unit + igv_ventas_unit)

# ── Totals for UNITS ─────────────────────────────────────────────────────
VALOR_VENTA_UNIT = sale_price_unit
VALOR_VENTA = r2(sale_price_unit * UNITS)
IGV = r2(igv_ventas_unit * UNITS)
PRECIO_TOTAL = r2(sale_price_final_unit * UNITS)
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
<title>Cotización · Wings Global Trade · Toyota Hilux Travo Overland Plus</title>
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
      <p class="pdoc-number">COT-WGT-2026-0828</p>
    </div>
    <div class="pdoc-brand">
      {LOGO}
      <span class="pdoc-brand-name">WINGS GLOBAL TRADE</span>
      <span class="pdoc-tagline">SOLUCIONES INTEGRALES EN IMPORTACIÓN</span>
    </div>
  </header>
  <div class="pdoc-rule" aria-hidden="true"></div>

  <div class="pdoc-dateline">
    <span>Lima, 28-08-2026</span>
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
      <tr>
        <td class="pd-item">1</td>
        <td class="pd-desc">
          <span class="pd-model">Toyota Hilux Travo Overland Plus — 2.8L Diésel 4WD</span>
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
    <span class="pdoc-term-label">Origen</span><span>{ORIGIN}</span>
    <span class="pdoc-term-label">Puerto de llegada</span><span>{PUERTO_LLEGADA}</span>
    <span class="pdoc-term-label">Condición del precio</span><span>{CONDICION_PRECIO}</span>
    <span class="pdoc-term-label">Forma de pago</span><span>50% a la confirmación del pedido; 50% antes del despacho a nombre del cliente.</span>
    <span class="pdoc-term-label">Tiempo de entrega</span><span>A coordinar según disponibilidad de stock e itinerario de nacionalización.</span>
    <span class="pdoc-term-label">Vigencia de la oferta</span><span>15 días desde la fecha de esta cotización.</span>
  </div>

  <div class="pdoc-section-bar pdoc-section-bar--observaciones">Observaciones</div>
  <ul class="pdoc-observations">
    <li>Precio final nacionalizado en Perú, incluye IGV (18%); no incluye trámites de placa/registro posteriores a la entrega.</li>
    <li>Ad Valorem 0% aplicado por origen Tailandia, sujeto a confirmación por partida arancelaria exacta al momento del despacho.</li>
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
print(f"cif_unit={fmt(cif)} landed_cost_unit={fmt(landed_cost)} margin10%_unit={fmt(margin_usd)}")
print(f"--- client-facing ---")
print(f"units={UNITS} valor_venta_unit={fmt(VALOR_VENTA_UNIT)} valor_venta_total={fmt(VALOR_VENTA)}")
print(f"igv={fmt(IGV)} precio_total={fmt(PRECIO_TOTAL)} (S/ {fmt(PRECIO_TOTAL_SOLES)})")
