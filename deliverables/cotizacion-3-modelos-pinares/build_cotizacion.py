#!/usr/bin/env python3
"""Build the Wings Global Trade branded CLIENT quotation (Cotización) for
Abraham Pinares (DNI 61950001, Arequipa) listing THREE Hilux models side
by side, per-unit pricing only — no summed grand total, same table format
requested for the Inversiones Arompech SRL cotización.

Cost basis, FOB values and model names are identical to
cotizacion-3-modelos-arompech/build_cotizacion.py — see that file's
docstring and `deliverables/PRICING_NOTES.md` for the full derivation and
rationale (shared cost inputs; Overland Plus keeps its standing +48.24/
unit commercial-rounding price; Full Manual 4x4 / Básica Manual 4x4 use
the engine's raw 10%-margin output).

Client provided (no empresa/RUC — individual, DNI only):
  Abraham Pinares · DNI 61950001 · Arequipa

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


# ── Shared cost inputs (identical to the standing Overland Plus costeo) ─
FREIGHT_INT_UNIT = D(5250)
ORIGIN = "Tailandia"
PUERTO_LLEGADA = "Iquique, Chile"
CONDICION_PRECIO = "Nacionalizado, incluye IGV — puesto en Zofratacna, Tacna"
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

DOC_NUMBER = "COT-WGT-2026-0914-B"
FECHA = "Lima, 14-09-2026"

CLIENTE_NOMBRE = "Abraham Pinares"
CLIENTE_DNI = "61950001"
CLIENTE_CIUDAD = "Arequipa"


def compute_sale_price(fob_unit: Decimal):
    """Faithful port of computeImportCost (FOB incoterm path, per unit)."""
    cif_base = r2(fob_unit + FREIGHT_INT_UNIT)
    insurance = r2(INSURANCE_RATE * cif_base)
    cif = r2(cif_base + insurance)
    ad_valorem = r2(AD_VALOREM_RATE * cif)
    isc = D(0)  # diesel → deriveISCRate = 0
    gastos_vinculados = r2(FREIGHT_ZOFRATACNA + PORT_EXPENSES + CUSTOMS_AGENCY + HANDLING_STOWAGE)
    landed_cost = r2(cif + ad_valorem + isc + gastos_vinculados)
    min_by_usd = D(1000) / landed_cost if landed_cost > 0 else D(0)
    margin_rate = max(MARGIN_PCT, min_by_usd)
    margin_usd = r2(landed_cost * margin_rate)
    sale_price_unit = r2(landed_cost + margin_usd)
    return sale_price_unit


FOB_OVERLAND_PLUS = D("43000.00")
FOB_FULL_MANUAL = D("44205.00")
FOB_BASICA_MANUAL = D("36000.00")

ROUNDING_ADJUSTMENT_OVERLAND_PLUS = D("48.24")  # standing one-off commercial rounding, this model only

sale_overland_plus = r2(compute_sale_price(FOB_OVERLAND_PLUS) + ROUNDING_ADJUSTMENT_OVERLAND_PLUS)
sale_full_manual = compute_sale_price(FOB_FULL_MANUAL)
sale_basica_manual = compute_sale_price(FOB_BASICA_MANUAL)

MODELOS = [
    ("Toyota Hilux Travo Overland Plus", "2.8L Diésel 4WD", sale_overland_plus),
    ("Toyota Hilux Full Manual 4x4", "2.8L Diésel Manual 4WD", sale_full_manual),
    ("Toyota Hilux Básica Manual 4x4", "2.8L Diésel Manual 4WD", sale_basica_manual),
]


def fmt(x: Decimal) -> str:
    return f"{x:,.2f}"


ROWS_HTML = []
for i, (nombre, motor, valor_venta) in enumerate(MODELOS, start=1):
    igv = r2(valor_venta * IGV_RATE)
    total = r2(valor_venta + igv)
    ROWS_HTML.append(f"""      <tr>
        <td class="pd-item">{i}</td>
        <td class="pd-desc">
          <span class="pd-model">{nombre}</span><br />
          <span class="pd-motor">{motor}</span>
        </td>
        <td class="pd-cell-num">{fmt(valor_venta)}</td>
        <td class="pd-cell-num">{fmt(igv)}</td>
        <td class="pd-cell-num">{fmt(total)}</td>
      </tr>""")
ROWS_HTML = "\n".join(ROWS_HTML)

LOGO = Path(LOGO_SVG).read_text(encoding="utf-8")
LOGO = LOGO[LOGO.index("<svg"):]
LOGO = LOGO.replace("<svg ", '<svg class="pdoc-logo" ', 1)

HTMLDOC = f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Cotización · Wings Global Trade · Toyota Hilux — 3 modelos</title>
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
    padding: 16px 52px 12px; background: #ffffff; color: var(--pd-ink);
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

  .pdoc-rule {{ position: relative; height: 3px; margin: 10px 0 10px; background: var(--pd-line); }}
  .pdoc-rule::before {{ content: ''; position: absolute; left: 0; top: 0; height: 100%; width: 168px; background: var(--pd-ink); }}

  .pdoc-dateline {{ display: flex; flex-wrap: wrap; gap: 5px 16px; margin-bottom: 10px; font-size: 11.5px; color: var(--pd-muted); }}
  .pdoc-dateline span:not(:last-child)::after {{ content: '|'; margin-left: 16px; color: var(--pd-line); }}

  .pdoc-parties {{ display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }}
  .pdoc-party {{ border: 1px solid var(--pd-line); padding: 10px 14px; }}
  .pdoc-party-head {{ font-size: 10.5px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 5px; }}
  .pdoc-party-name {{ font-weight: 600; margin-bottom: 5px; }}
  .pdoc-party-meta {{ display: grid; grid-template-columns: 92px 1fr; gap: 2px 12px; margin: 0; font-size: 11.5px; }}
  .pdoc-party-meta dt {{ color: var(--pd-muted); }}
  .pdoc-party-meta dd {{ margin: 0; }}

  .pdoc-table {{ width: 100%; border-collapse: collapse; table-layout: fixed; }}
  .pdoc-table thead th {{ background: var(--pd-bar); font-size: 10.5px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; padding: 6px 9px; text-align: center; border: 1px solid var(--pd-line); }}
  .pdoc-table th.pd-col-item {{ width: 7%; }}
  .pdoc-table th.pd-col-desc {{ width: 44%; }}
  .pdoc-table tbody tr {{ break-inside: avoid; }}
  .pdoc-table tbody td {{ border: 1px solid var(--pd-line); padding: 10px 9px; vertical-align: top; font-size: 11.5px; }}
  .pd-item {{ font-weight: 600; text-align: center; }}
  .pd-desc {{ text-align: left; }}
  .pd-desc .pd-model {{ font-weight: 600; }}
  .pd-desc .pd-motor {{ color: var(--pd-muted); font-size: 10.5px; }}
  .pd-cell-num {{ text-align: right; font-family: var(--font-mono, monospace); font-variant-numeric: tabular-nums; }}

  .pdoc-section-bar {{ background: var(--pd-bar); padding: 6px 12px; margin: 10px 0 6px; font-size: 11.5px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; text-align: center; }}
  .pdoc-section-bar--observaciones {{ margin-top: 16px; }}
  .pdoc-terms {{ display: grid; grid-template-columns: 210px 1fr; gap: 4px 16px; padding: 0 4px; font-size: 11.5px; }}
  .pdoc-term-label {{ font-weight: 600; }}
  .pdoc-observations {{ margin: 0; padding: 0 4px; list-style: none; font-size: 11.5px; }}
  .pdoc-observations li {{ position: relative; padding-left: 18px; margin-bottom: 2px; }}
  .pdoc-observations li::before {{ content: '•'; position: absolute; left: 4px; }}

  .pdoc-tail {{ margin-top: 12px; padding-top: 6px; }}
  .pdoc-close-row {{ display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; }}
  .pdoc-close-signoff {{ margin-top: 2px; font-weight: 600; }}

  .pdoc-footer {{ display: flex; justify-content: space-between; gap: 24px; margin-top: 4px; padding-top: 4px; border-top: 1px solid var(--pd-line); color: var(--pd-muted); font-size: 11.5px; break-inside: avoid; }}
  .pdoc-footer .pd-foot-right {{ text-align: right; }}

  @media (max-width: 640px) {{
    .pdoc {{ padding: 26px 20px 28px; }}
    .pdoc-title {{ font-size: 32px; }}
    .pdoc-parties {{ grid-template-columns: 1fr; }}
    .pdoc-terms {{ grid-template-columns: 1fr; gap: 0; }}
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
      <div class="pdoc-party-name">{CLIENTE_NOMBRE}</div>
      <dl class="pdoc-party-meta">
        <dt>DNI</dt><dd>{CLIENTE_DNI}</dd>
        <dt>Ciudad</dt><dd>{CLIENTE_CIUDAD}</dd>
      </dl>
    </div>
  </div>

  <div class="pdoc-section-bar">Modelos cotizados — precio por unidad</div>
  <table class="pdoc-table">
    <thead>
      <tr>
        <th class="pd-col-item">Ítem</th>
        <th class="pd-col-desc">Modelo</th>
        <th>Valor de Venta</th>
        <th>IGV (18%)</th>
        <th>Precio Total</th>
      </tr>
    </thead>
    <tbody>
{ROWS_HTML}
    </tbody>
  </table>

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
    <li>Precios por unidad, nacionalizados en Perú, incluyen IGV (18%); no incluyen trámites de placa/registro posteriores a la entrega.</li>
    <li>Ad Valorem 0% aplicado por origen Tailandia, sujeto a confirmación por partida arancelaria exacta al momento del despacho.</li>
    <li>Tipo de cambio referencial S/ {EXCHANGE_RATE} por USD; el precio final se factura en la moneda acordada al momento del pago.</li>
    <li>Precios sujetos a confirmación de disponibilidad de las unidades y variaciones de tipo de cambio o tributos aduaneros vigentes a la fecha de nacionalización.</li>
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
print("--- client-facing, per unit ---")
for nombre, motor, valor_venta in MODELOS:
    igv = r2(valor_venta * IGV_RATE)
    total = r2(valor_venta + igv)
    print(f"{nombre}: valor_venta={fmt(valor_venta)} igv={fmt(igv)} total={fmt(total)} (S/ {fmt(r2(total*EXCHANGE_RATE))})")
