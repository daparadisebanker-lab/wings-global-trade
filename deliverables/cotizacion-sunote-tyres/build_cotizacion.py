#!/usr/bin/env python3
"""Build the Wings Global Trade branded CLIENT quotation (Cotización) for the
SUNOTE tyre order — issued by the Chilean company (Shining Star), destined for
ZOFRI / Iquique. Prices are the CLIENT (marked-up) prices, never the supplier's
cost, and the supplier (SINOTYRE) is never named to the client.

Reuses the proforma's `pdoc` layout (no image column — tyres). Self-contained
HTML (logo + signature inlined). Run:  python3 build_cotizacion.py
"""
from pathlib import Path

HERE = Path(__file__).resolve().parent
LOGO_SVG = "/home/user/wings-global-trade/apps/tower/public/brand/wings-imagotipo.svg"
SIGNATURE_SVG = "/home/user/wings-global-trade/deliverables/proforma-saad-muhammad/signature.svg"

# ── Client line items (SELLING prices from the client quotation) ──────────────
# (marca, medida, modelo, cantidad, precio unit. FOB Qingdao USD)
ITEMS = [
    ("SUNOTE", "1200R24-20PR", "SN116", 50, 228.85),
    ("SUNOTE", "1200R24-20PR", "SN388", 50, 256.45),
    ("SUNOTE", "295/80R22.5-18PR", "SN228+", 60, 180.55),
    ("SUNOTE", "12R22.5-18PR", "SN116", 56, 169.05),
]
FREIGHT = 6500.00  # flete marítimo Qingdao → ZOFRI (Iquique), a cost pass-through


def fmt(n: float) -> str:
    return f"{n:,.2f}"


def money_rows():
    rows = []
    subtotal = 0.0
    total_qty = 0
    for i, (brand, size, model, qty, unit) in enumerate(ITEMS, start=1):
        amount = round(qty * unit, 2)
        subtotal += amount
        total_qty += qty
        rows.append(
            f'<tr><td class="pd-item">{i}</td>'
            f'<td class="pd-brand">{brand}</td>'
            f'<td class="pd-desc">{size} · {model}</td>'
            f'<td class="pd-cell-num">{qty} pcs</td>'
            f'<td class="pd-cell-num">{fmt(unit)}</td>'
            f'<td class="pd-cell-num">{fmt(amount)}</td></tr>'
        )
    return "\n      ".join(rows), fmt(subtotal), total_qty, subtotal


LOGO = Path(LOGO_SVG).read_text(encoding="utf-8")
LOGO = LOGO[LOGO.index("<svg"):]
LOGO = LOGO.replace("<svg ", '<svg class="pdoc-logo" ', 1)
SIGNATURE = Path(SIGNATURE_SVG).read_text(encoding="utf-8")

ROWS, SUBTOTAL, TOTAL_QTY, subtotal_val = money_rows()
GRAND = fmt(subtotal_val + FREIGHT)
FREIGHT_S = fmt(FREIGHT)
TAIL_SPACER = "24mm"

HTMLDOC = f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Cotización · Wings Global Trade · Neumáticos SUNOTE</title>
<style>
  :root {{
    --font-ui: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    --font-mono: 'Inter', ui-monospace, 'SF Mono', Menlo, monospace;
  }}
  html, body {{ margin: 0; padding: 0; }}
  body {{ background: #52555a; }}
  .pdoc-page {{ min-height: 100vh; padding: 32px 16px 64px; }}
  .pdoc-page .pdoc {{ box-shadow: 0 8px 40px rgba(0, 0, 0, 0.35); }}

  .pdoc {{
    --pd-ink: #0f1216; --pd-muted: #6b7280; --pd-line: #d1d5db;
    --pd-bar: #ececec; --pd-tint: #f7f8f9;
    box-sizing: border-box; width: 100%; max-width: 820px; margin: 0 auto;
    padding: 48px 56px 40px; background: #ffffff; color: var(--pd-ink);
    font-family: var(--font-ui, system-ui, sans-serif); font-size: 13px; line-height: 1.5;
  }}
  .pdoc *, .pdoc *::before, .pdoc *::after {{ box-sizing: border-box; }}

  .pdoc-header {{ display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; }}
  .pdoc-title {{ margin: 0; font-size: 44px; font-weight: 600; letter-spacing: -0.01em; line-height: 0.95; }}
  .pdoc-number {{ margin-top: 12px; font-family: var(--font-mono, monospace); font-size: 13px; letter-spacing: 0.02em; color: var(--pd-ink); }}
  .pdoc-brand {{ display: flex; flex-direction: column; align-items: flex-end; text-align: right; gap: 8px; flex-shrink: 0; }}
  .pdoc-logo {{ height: 52px; width: auto; filter: brightness(0); }}
  .pdoc-tagline {{ font-size: 11px; letter-spacing: 0.02em; color: var(--pd-muted); text-transform: uppercase; }}

  .pdoc-rule {{ position: relative; height: 3px; margin: 14px 0 20px; background: var(--pd-line); }}
  .pdoc-rule::before {{ content: ''; position: absolute; left: 0; top: 0; height: 100%; width: 168px; background: var(--pd-ink); }}

  .pdoc-dateline {{ display: flex; flex-wrap: wrap; gap: 6px 16px; margin-bottom: 24px; font-size: 12px; color: var(--pd-muted); }}
  .pdoc-dateline span:not(:last-child)::after {{ content: '|'; margin-left: 16px; color: var(--pd-line); }}

  .pdoc-parties {{ display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }}
  .pdoc-party {{ border: 1px solid var(--pd-line); padding: 14px 16px; }}
  .pdoc-party-head {{ font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 8px; }}
  .pdoc-party-name {{ font-weight: 600; margin-bottom: 8px; }}
  .pdoc-party-meta {{ display: grid; grid-template-columns: 84px 1fr; gap: 3px 12px; margin: 0; font-size: 12px; }}
  .pdoc-party-meta dt {{ color: var(--pd-muted); }}
  .pdoc-party-meta dd {{ margin: 0; }}
  .pd-fill {{ color: var(--pd-muted); }}

  .pdoc-table {{ width: 100%; border-collapse: collapse; table-layout: fixed; }}
  .pdoc-table thead th {{ background: var(--pd-bar); font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; padding: 10px 10px; text-align: center; border: 1px solid var(--pd-line); }}
  .pdoc-table th.pd-col-item {{ width: 7%; }}
  .pdoc-table th.pd-col-brand {{ width: 15%; }}
  .pdoc-table th.pd-col-desc {{ width: 30%; }}
  .pdoc-table th.pd-col-qty {{ width: 12%; }}
  .pdoc-table tbody tr {{ break-inside: avoid; }}
  .pdoc-table tbody td {{ border: 1px solid var(--pd-line); padding: 8px 10px; vertical-align: middle; font-size: 12px; }}
  .pd-item {{ font-weight: 600; text-align: center; }}
  .pd-brand {{ font-weight: 600; }}
  .pd-desc {{ text-align: left; }}
  .pd-cell-num {{ text-align: right; font-family: var(--font-mono, monospace); font-variant-numeric: tabular-nums; }}
  .pd-row-total td {{ background: var(--pd-tint); font-weight: 700; }}

  .pdoc-totals {{ margin: 0 0 8px auto; width: 360px; }}
  .pdoc-total-row {{ display: flex; justify-content: space-between; gap: 24px; padding: 9px 6px; border-top: 1px solid var(--pd-line); }}
  .pdoc-total-row .pd-total-label {{ font-weight: 600; }}
  .pdoc-total-row .pd-total-value {{ font-family: var(--font-mono, monospace); font-variant-numeric: tabular-nums; }}
  .pdoc-total-row[data-emphasis='true'] {{ border-top: 2px solid var(--pd-ink); }}
  .pdoc-total-row[data-emphasis='true'] .pd-total-label, .pdoc-total-row[data-emphasis='true'] .pd-total-value {{ font-size: 15px; font-weight: 700; }}

  .pdoc-section-bar {{ background: var(--pd-bar); padding: 8px 12px; margin: 26px 0 14px; font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }}
  .pdoc-terms {{ display: grid; grid-template-columns: 220px 1fr; gap: 8px 16px; padding: 0 4px; font-size: 12px; }}
  .pdoc-term-label {{ font-weight: 600; }}
  .pdoc-observations {{ margin: 0; padding: 0 4px; list-style: none; font-size: 12px; }}
  .pdoc-observations li {{ position: relative; padding-left: 18px; margin-bottom: 4px; }}
  .pdoc-observations li::before {{ content: '•'; position: absolute; left: 4px; }}

  .pdoc-close {{ margin: 24px 0 0; }}
  .pdoc-close-signoff {{ margin-top: 2px; font-weight: 600; }}

  .pdoc-issuedby {{ margin: 16px 0 0; max-width: 300px; break-inside: avoid; }}
  .pdoc-issuedby-label {{ font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--pd-muted); margin-bottom: 6px; }}
  .pdoc-signature {{ height: 52px; margin-bottom: 2px; }}
  .pdoc-signature svg {{ display: block; height: 100%; width: auto; max-width: 260px; }}
  .pdoc-issuedby-name {{ font-weight: 600; padding-top: 6px; border-top: 1px solid var(--pd-line); }}
  .pdoc-issuedby-title {{ margin-top: 2px; font-size: 12px; color: var(--pd-muted); }}

  .pdoc-footer {{ display: flex; justify-content: space-between; gap: 24px; margin-top: 24px; padding-top: 14px; border-top: 1px solid var(--pd-line); color: var(--pd-muted); font-size: 12px; break-inside: avoid; }}
  .pdoc-footer .pd-foot-right {{ text-align: right; }}

  @media (max-width: 640px) {{
    .pdoc {{ padding: 28px 22px 32px; }}
    .pdoc-title {{ font-size: 34px; }}
    .pdoc-parties {{ grid-template-columns: 1fr; }}
    .pdoc-terms {{ grid-template-columns: 1fr; gap: 0; }}
    .pdoc-totals {{ width: 100%; }}
    .pdoc-footer {{ flex-direction: column; gap: 12px; }}
  }}

  @media print {{
    @page {{ size: A4 portrait; margin: 12mm; }}
    body {{ background: #ffffff; }}
    .pdoc-page {{ min-height: 0; padding: 0; }}
    .pdoc-page .pdoc {{ box-shadow: none; }}
    .pdoc {{ max-width: none; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
    .pdoc-tailspacer {{ height: {TAIL_SPACER}; }}
  }}
</style>
</head>
<body>
<div class="pdoc-page">
<article class="pdoc">

  <header class="pdoc-header">
    <div>
      <h1 class="pdoc-title">Cotización</h1>
      <p class="pdoc-number">COT-WGT-2026-0728</p>
    </div>
    <div class="pdoc-brand">
      {LOGO}
      <span class="pdoc-tagline">SOLUCIONES INTEGRALES EN IMPORTACIÓN</span>
    </div>
  </header>
  <div class="pdoc-rule" aria-hidden="true"></div>

  <div class="pdoc-dateline">
    <span>Iquique, 28-07-2026</span>
    <span>Validez: 15 días</span>
    <span>Incoterm: FOB Qingdao + flete</span>
    <span>Moneda: USD</span>
  </div>

  <div class="pdoc-parties">
    <div class="pdoc-party">
      <div class="pdoc-party-head">Vendedor / Exportador</div>
      <div class="pdoc-party-name">IMPORT - EXPORT SHINING STAR LIMITADA</div>
      <dl class="pdoc-party-meta">
        <dt>RUT</dt><dd>76029544-2</dd>
        <dt>Dirección</dt><dd>Pasaje Cuatro 2213, Condominio Oasis</dd>
        <dt>Ciudad</dt><dd>Iquique, Chile</dd>
        <dt>Teléfono</dt><dd>+56 937305608</dd>
        <dt>Email</dt><dd>importaciones@wingsglobaltrade.com</dd>
      </dl>
    </div>
    <div class="pdoc-party">
      <div class="pdoc-party-head">Comprador / Cliente</div>
      <div class="pdoc-party-name pd-fill">Por definir</div>
      <dl class="pdoc-party-meta">
        <dt>Nombre</dt><dd class="pd-fill">—</dd>
        <dt>País</dt><dd class="pd-fill">—</dd>
        <dt>Contacto</dt><dd class="pd-fill">—</dd>
      </dl>
    </div>
  </div>

  <div class="pdoc-section-bar">Neumáticos chinos — marca SUNOTE</div>
  <table class="pdoc-table">
    <thead>
      <tr>
        <th class="pd-col-item">Ítem</th>
        <th class="pd-col-brand">Marca</th>
        <th class="pd-col-desc">Descripción</th>
        <th class="pd-col-qty">Cantidad</th>
        <th>Precio unit. FOB Qingdao (USD)</th>
        <th>Importe (USD)</th>
      </tr>
    </thead>
    <tbody>
      {ROWS}
      <tr class="pd-row-total">
        <td class="pd-item"></td>
        <td class="pd-brand"></td>
        <td class="pd-desc">Total FOB puerto</td>
        <td class="pd-cell-num">{TOTAL_QTY} pcs</td>
        <td class="pd-cell-num"></td>
        <td class="pd-cell-num">{SUBTOTAL}</td>
      </tr>
    </tbody>
  </table>

  <div class="pdoc-totals">
    <div class="pdoc-total-row">
      <span class="pd-total-label">Total FOB puerto (Qingdao)</span>
      <span class="pd-total-value">{SUBTOTAL}</span>
    </div>
    <div class="pdoc-total-row">
      <span class="pd-total-label">Flete marítimo Qingdao → ZOFRI (Iquique)</span>
      <span class="pd-total-value">{FREIGHT_S}</span>
    </div>
    <div class="pdoc-total-row" data-emphasis="true">
      <span class="pd-total-label">Total puesto en ZOFRI (Iquique)</span>
      <span class="pd-total-value">{GRAND}</span>
    </div>
  </div>

  <div class="pdoc-section-bar">Condiciones comerciales</div>
  <div class="pdoc-terms">
    <span class="pdoc-term-label">Origen</span><span>China</span>
    <span class="pdoc-term-label">Puerto de embarque</span><span>Qingdao, China</span>
    <span class="pdoc-term-label">Puerto de destino</span><span>Iquique (ZOFRI), Chile</span>
    <span class="pdoc-term-label">Carga</span><span>1 × 40'HQ · 216 neumáticos</span>
    <span class="pdoc-term-label">Forma de pago</span><span>50% a la confirmación del pedido; 50% antes del embarque del contenedor.</span>
    <span class="pdoc-term-label">Tiempo de entrega</span><span>Embarque dentro de 20 días hábiles tras recibir el pago inicial.</span>
    <span class="pdoc-term-label">Vigencia de la oferta</span><span>15 días desde la fecha de esta cotización.</span>
  </div>

  <div class="pdoc-section-bar">Observaciones</div>
  <ul class="pdoc-observations">
    <li>Los precios unitarios corresponden a términos FOB Qingdao; el flete marítimo hasta ZOFRI (Iquique) se detalla por separado.</li>
    <li>Todos los importes están expresados en dólares americanos (USD).</li>
    <li>Garantía de calidad: reposición ante cualquier defecto de fabricación.</li>
    <li>El flete marítimo se confirma antes del embarque; variaciones logísticas o de tipo de cambio podrían afectar el precio final.</li>
  </ul>

  <div class="pdoc-tailspacer" aria-hidden="true"></div>

  <div class="pdoc-close">
    <div>Atentamente,</div>
    <div class="pdoc-close-signoff">WINGS GLOBAL TRADE</div>
  </div>

  <div class="pdoc-issuedby">
    <div class="pdoc-issuedby-label">Atendido por</div>
    <div class="pdoc-signature">{SIGNATURE}</div>
    <div class="pdoc-issuedby-name">Saad Muhammad</div>
    <div class="pdoc-issuedby-title">Representante comercial · Wings Global Trade</div>
    <div class="pdoc-issuedby-title">WhatsApp: +34 674 00 64 38</div>
  </div>

  <footer class="pdoc-footer">
    <div>
      <div>¿Consultas?</div>
      <div>Email: importaciones@wingsglobaltrade.com</div>
      <div>Tel: +507 6025-07</div>
    </div>
    <div class="pd-foot-right">
      <div>wingsglobaltrade.com</div>
    </div>
  </footer>

</article>
</div>
</body>
</html>
"""

out = HERE / "cotizacion.html"
out.write_text(HTMLDOC, encoding="utf-8")
print(f"wrote {out} ({len(HTMLDOC):,} bytes)")
print(f"items={len(ITEMS)} total_qty={TOTAL_QTY} subtotal={SUBTOTAL} freight={FREIGHT_S} grand={GRAND}")
