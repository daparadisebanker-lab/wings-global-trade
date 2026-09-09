#!/usr/bin/env python3
"""Build the Wings Global Trade branded CLIENT quotation (Cotización) for
1x Camión Cisterna para Combustible (chasis Isuzu QL1073BUKAY + tanque
5,000L), client Sergio.

Source data: uploaded cost sheet screenshot ("PUESTO EN ZOFRI IQUIQUE" /
"CAMION CON TANQUE PARA PETROLEO"): FOB 27,300 + Flete CN-IQQ 8,000/unidad
(QTY 1) + gastos portuario y aduana hasta IQQ 1,000 = TOTAL 36,300; profit
16% = 5,808; PRECIO FINAL X UNIDAD (calculado) = 42,108 — but the sheet's
own final line, "PRECIO DE OFERTA CON CHASSIS DE MARCA ISUZU", rounds this
up to 42,500.00, confirmed by the user as the quoted price. Only that
final commercial price is shown to the client (house rule: never expose
FOB/flete/margin breakdown).

Technical specifications table (client explicitly asked for one, single-
item order): ported from the uploaded "ISUZU Chassis Specifications" +
"Superstructure Specifications" sheet — chassis model QL1073BUKAY, 4x2,
GVW 7,300kg, wheelbase 3,815mm, engine 4KB1-TCG60 diesel 130HP, manual
transmission, max speed 90km/h, 700R16 tires; tank 5,000L Q235 carbon
steel (4mm shell / 5mm heads, 1 baffle), European-style manhole, gear
pump + fuel dispenser with 20m hose, two 4kg fire extinguishers, static
grounding strap.

Client-specified inputs (2026-09-09):
  Cliente: Sergio · Puesto en: Zofri, Iquique, Chile · Moneda: USD
  País del cliente no especificado — se omite el campo para no inventar
  el dato (a diferencia de las dos cotizaciones chilenas previas, donde
  el cliente sí indicó su país).

Vendedor: misma entidad chilena emisora que las dos cotizaciones previas
para Chile (RAV4 Híbrido / Corolla Cross, cliente Jhonny Carrasco) —
IMPORT - EXPORT SHINING STAR LIMITADA, RUT 76029544-2, Iquique, Chile
(SHINING_STAR_CL en apps/tower/src/lib/quotation/issuers.ts). Contacto
actualizado con los datos del perfil de WhatsApp Business "Wings Global
Trade Chile" que el cliente compartió (captura de pantalla): WhatsApp
+56 9 3730 5608, correo importaciones@wingsglobaltrade.com — añadidos al
bloque del vendedor y al pie de página (las cotizaciones chilenas
anteriores no llevaban estos datos de contacto).

Reuses the `pdoc` grid/layout finalized on the Chile cotizaciones (icon-
only logo, "WINGS GLOBAL TRADE" letterhead, centered section bars, single
line item with sum shown, no IGV line per house rule for this Chilean-
import route), plus a new compact "Especificaciones Técnicas" section
(definition-list style, same grid as Condiciones comerciales) since this
is a single, technical, one-off product rather than a catalog vehicle.
Run: python3 build_cotizacion.py
"""
from decimal import Decimal
from pathlib import Path

HERE = Path(__file__).resolve().parent
LOGO_SVG = HERE / "wings-icon.svg"


def D(x) -> Decimal:
    return Decimal(str(x))


def fmt(x: Decimal) -> str:
    return f"{x:,.2f}"


# ── Client / commercial terms ───────────────────────────────────────────
CLIENTE = "Sr. Sergio"
PUERTO_LLEGADA = "Iquique, Chile"
CONDICION_PRECIO = "Puesto en Zofri, Iquique, Chile"
DOC_NUMBER = "COT-WGT-2026-0909"
DOC_DATE = "09-09-2026"

PRODUCTO = "Camión Cisterna para Combustible — Chasis Isuzu QL1073BUKAY, Tanque 5,000 L"
PRECIO_UNIT = D("42500.00")
CANTIDAD = 1
IMPORTE = PRECIO_UNIT * CANTIDAD

# ── Especificaciones técnicas (etiqueta, valor) ─────────────────────────
ESPECIFICACIONES = [
    ("Marca y modelo de chasis", "Isuzu QL1073BUKAY"),
    ("Tipo de tracción", "4x2"),
    ("Peso bruto vehicular (PBV)", "7,300 kg"),
    ("Distancia entre ejes", "3,815 mm"),
    ("Motor", "4KB1-TCG60, diésel, 130 HP"),
    ("Transmisión", "Manual"),
    ("Velocidad máxima", "90 km/h"),
    ("Neumáticos", "6 unidades, especificación 700R16"),
    ("Tanque", "5,000 L, acero al carbono Q235 (casco 4 mm / cabezales 5 mm, 1 mamparo), boca de inspección tipo europeo"),
    ("Equipamiento del tanque", "Bomba de engranajes y surtidor de combustible (manguera de 20 m), 2 extintores de 4 kg, correa de puesta a tierra estática"),
]

ESPECIFICACIONES_HTML = "\n    ".join(
    f"<span class=\"pdoc-term-label\">{label}</span><span>{value}</span>"
    for label, value in ESPECIFICACIONES
)

LOGO = Path(LOGO_SVG).read_text(encoding="utf-8")
LOGO = LOGO[LOGO.index("<svg"):]
LOGO = LOGO.replace("<svg ", '<svg class="pdoc-logo" ', 1)

HTMLDOC = f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Cotización · Wings Global Trade · Camión Cisterna Isuzu · Sergio</title>
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
    padding: 16px 52px 10px; background: #ffffff; color: var(--pd-ink);
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
  .pdoc-table tbody td {{ border: 1px solid var(--pd-line); padding: 9px 9px; vertical-align: top; font-size: 11.5px; }}
  .pd-item {{ font-weight: 600; text-align: center; }}
  .pd-desc {{ text-align: left; }}
  .pd-desc .pd-model {{ font-weight: 600; }}
  .pd-qty {{ text-align: center; font-weight: 600; }}
  .pd-cell-num {{ text-align: right; font-family: var(--font-mono, monospace); font-variant-numeric: tabular-nums; }}

  .pdoc-totals {{ margin: 12px 0 4px auto; width: 360px; }}
  .pdoc-total-row {{ display: flex; justify-content: space-between; gap: 24px; padding: 10px 6px; border-top: 1px solid var(--pd-line); }}
  .pdoc-total-row .pd-total-label {{ font-weight: 600; }}
  .pdoc-total-row .pd-total-value {{ font-family: var(--font-mono, monospace); font-variant-numeric: tabular-nums; }}
  .pdoc-total-row[data-emphasis='true'] {{ border-top: 2px solid var(--pd-ink); }}
  .pdoc-total-row[data-emphasis='true'] .pd-total-label, .pdoc-total-row[data-emphasis='true'] .pd-total-value {{ font-size: 14.5px; font-weight: 700; white-space: nowrap; }}

  .pdoc-section-bar {{ background: var(--pd-bar); padding: 6px 12px; margin: 10px 0 6px; font-size: 11.5px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; text-align: center; }}
  .pdoc-section-bar--observaciones {{ margin-top: 8px; }}
  .pdoc-terms {{ display: grid; grid-template-columns: 210px 1fr; gap: 4px 16px; padding: 0 4px; font-size: 11.5px; }}
  .pdoc-term-label {{ font-weight: 600; }}
  .pdoc-observations {{ margin: 0; padding: 0 4px; list-style: none; font-size: 11.5px; }}
  .pdoc-observations li {{ position: relative; padding-left: 18px; margin-bottom: 2px; }}
  .pdoc-observations li::before {{ content: '•'; position: absolute; left: 4px; }}

  .pdoc-tail {{ margin-top: 4px; padding-top: 4px; }}
  .pdoc-close-row {{ display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; }}
  .pdoc-close-signoff {{ margin-top: 2px; font-weight: 600; }}

  .pdoc-footer {{ display: flex; justify-content: space-between; gap: 24px; margin-top: 3px; padding-top: 4px; border-top: 1px solid var(--pd-line); color: var(--pd-muted); font-size: 11.5px; break-inside: avoid; }}
  .pdoc-footer .pd-foot-right {{ text-align: right; }}

  @media (max-width: 640px) {{
    .pdoc {{ padding: 26px 20px 28px; }}
    .pdoc-title {{ font-size: 32px; }}
    .pdoc-parties {{ grid-template-columns: 1fr; }}
    .pdoc-terms {{ grid-template-columns: 1fr; gap: 0; }}
    .pdoc-totals {{ width: 100%; }}
    .pdoc-close-row {{ flex-direction: column; align-items: flex-start; gap: 16px; }}
    .pdoc-footer {{ flex-direction: column; gap: 12px; }}
  }}

  @media print {{
    @page {{ size: A4 portrait; margin: 8mm; }}
    body {{ background: #ffffff; }}
    .pdoc-page {{ min-height: 0; padding: 0; }}
    .pdoc-page .pdoc {{ box-shadow: none; }}
    .pdoc {{
      max-width: none; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact;
      display: flex; flex-direction: column; min-height: 281mm;
    }}
    .pdoc-tail {{ margin-top: auto; }}
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
        <dt>WhatsApp</dt><dd>+56 9 3730 5608</dd>
      </dl>
    </div>
    <div class="pdoc-party">
      <div class="pdoc-party-head">Comprador / Cliente</div>
      <div class="pdoc-party-name">{CLIENTE}</div>
    </div>
  </div>

  <div class="pdoc-section-bar">Producto cotizado</div>
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
          <span class="pd-model">{PRODUCTO}</span>
        </td>
        <td class="pd-qty">{CANTIDAD}</td>
        <td class="pd-cell-num">{fmt(PRECIO_UNIT)}</td>
        <td class="pd-cell-num">{fmt(IMPORTE)}</td>
      </tr>
    </tbody>
  </table>

  <div class="pdoc-totals">
    <div class="pdoc-total-row" data-emphasis="true">
      <span class="pd-total-label">Precio total (1 unidad)</span>
      <span class="pd-total-value">USD {fmt(IMPORTE)}</span>
    </div>
  </div>

  <div class="pdoc-section-bar">Especificaciones Técnicas</div>
  <div class="pdoc-terms">
    {ESPECIFICACIONES_HTML}
  </div>

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
    <li>Precio puesto en Zofri, Iquique, Chile — incluye flete internacional hasta destino.</li>
    <li>Los precios están calculados según la tarifa de flete internacional vigente a la fecha de esta cotización. El precio podría variar si el flete cambia al momento en que el cliente decida proceder con el pedido.</li>
    <li>Precio sujeto a confirmación de disponibilidad de la unidad.</li>
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
      <div>Wings Global Trade Chile · WhatsApp +56 9 3730 5608</div>
    </div>
    <div class="pd-foot-right">
      <div>RUT 76029544-2</div>
      <div>importaciones@wingsglobaltrade.com</div>
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
print(f"  {PRODUCTO}: {fmt(PRECIO_UNIT)} x{CANTIDAD}")
print(f"precio_total={fmt(IMPORTE)}")
