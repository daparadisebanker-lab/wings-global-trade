#!/usr/bin/env python3
"""Build the Wings Global Trade branded proforma (HTML) from the supplier PI.

Reuses TOWER's approved `pdoc` proforma layout. Tile photos are extracted from
the source PI and embedded as data URIs so the HTML is fully self-contained.
Run from this directory:  python3 build_proforma.py
"""
import base64
import html
from pathlib import Path

from pypdf import PdfReader

HERE = Path(__file__).resolve().parent
SRC_PDF = "/root/.claude/uploads/9b3418c8-23ea-51a6-a669-775bbf844870/7afdb45d-fe3752d286bc96791eb2437dfbc35979.pdf"
LOGO_SVG = "/home/user/wings-global-trade/apps/tower/public/brand/wings-imagotipo.svg"

# ── Line items (unit price USD 0.35 for the moldings; frame + logistics as PI) ─
UNIT = 0.35
MODELS = ["603", "713", "643", "628", "9901", "822", "817", "810", "800"]
QTYS = [2500, 1250, 1250, 1250, 1250, 1250, 1250, 1250, 1250]

# ── Pull the raw embedded JPEGs from the PI (Im1..Im9 = tiles, Im10 = frame) ──
def tile_data_uris() -> list[str]:
    reader = PdfReader(SRC_PDF)
    uris = []
    for img in reader.pages[0].images:  # already in document (top-to-bottom) order
        b64 = base64.b64encode(img.data).decode("ascii")
        uris.append(f"data:image/jpeg;base64,{b64}")
    return uris

IMAGES = tile_data_uris()  # index 0..8 -> items 1..9, index 9 -> item 10 (frame)


def fmt(minor_dollars: float) -> str:
    """es-PE display grouping (comma thousands, dot decimals), 2dp, no symbol."""
    return f"{minor_dollars:,.2f}"


def money_rows() -> tuple[str, str]:
    rows = []
    subtotal = 0.0
    # Moldings 1..9
    for i, (model, qty) in enumerate(zip(MODELS, QTYS)):
        amount = round(qty * UNIT, 2)
        subtotal += amount
        img = f'<img class="pd-tile" src="{IMAGES[i]}" alt="Modelo {model}" />'
        rows.append(
            f'<tr><td class="pd-item">{i+1}</td>'
            f'<td class="pd-desc">Moldura decorativa 600 × 120 mm · Modelo {model}</td>'
            f'<td class="pd-pic">{img}</td>'
            f'<td class="pd-cell-num">{qty:,}</td>'
            f'<td class="pd-cell-num">{fmt(UNIT)}</td>'
            f'<td class="pd-cell-num">{fmt(amount)}</td></tr>'
        )
    # Item 10 — wooden frame
    frame_img = f'<img class="pd-tile" src="{IMAGES[9]}" alt="Marco de madera" />'
    subtotal += 336.00
    rows.append(
        '<tr><td class="pd-item">10</td>'
        '<td class="pd-desc">Marco de madera</td>'
        f'<td class="pd-pic">{frame_img}</td>'
        '<td class="pd-cell-num">7</td>'
        '<td class="pd-cell-num">48.00</td>'
        '<td class="pd-cell-num">336.00</td></tr>'
    )
    # Item 11 — logistics (no picture)
    subtotal += 340.00
    rows.append(
        '<tr><td class="pd-item">11</td>'
        '<td class="pd-desc">Flete y gastos varios de aduana en origen (China)</td>'
        '<td class="pd-pic"></td>'
        '<td class="pd-cell-num">1</td>'
        '<td class="pd-cell-num">340.00</td>'
        '<td class="pd-cell-num">340.00</td></tr>'
    )
    return "\n      ".join(rows), fmt(subtotal)


LOGO = Path(LOGO_SVG).read_text(encoding="utf-8")
# Strip the XML prolog if present; keep the <svg>… element only.
LOGO = LOGO[LOGO.index("<svg"):]
# Give it the doc logo class + drop the fixed pixel width/height so CSS sizes it.
LOGO = LOGO.replace("<svg ", '<svg class="pdoc-logo" ', 1)

# Saad's signature — vectorized from IMG_6615.jpeg (potrace); inlined so the
# document stays self-contained. Regenerate signature.svg with make_signature().
SIGNATURE = (HERE / "signature.svg").read_text(encoding="utf-8")

ROWS, SUBTOTAL = money_rows()

# Print-only spacer height that drops the sign-off + footer onto the bottom
# padding of page 2. Calibrated against the rendered layout (see measure step).
TAIL_SPACER = "28mm"

HTMLDOC = f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Proforma · Wings Global Trade · Renata Revol</title>
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
  .pdoc-kicker {{ display: block; font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--pd-muted); margin-bottom: 6px; }}
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
  .pdoc-party-en {{ font-weight: 400; color: var(--pd-muted); text-transform: none; letter-spacing: 0.02em; }}
  .pdoc-party-name {{ font-weight: 600; margin-bottom: 8px; }}
  .pdoc-party-meta {{ display: grid; grid-template-columns: 84px 1fr; gap: 3px 12px; margin: 0; font-size: 12px; }}
  .pdoc-party-meta dt {{ color: var(--pd-muted); }}
  .pdoc-party-meta dd {{ margin: 0; }}

  .pdoc-table {{ width: 100%; border-collapse: collapse; table-layout: fixed; }}
  .pdoc-table thead th {{ background: var(--pd-bar); font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; padding: 10px 10px; text-align: center; border: 1px solid var(--pd-line); }}
  .pdoc-table th.pd-col-item {{ width: 7%; }}
  .pdoc-table th.pd-col-desc {{ width: 30%; }}
  .pdoc-table th.pd-col-pic {{ width: 21%; }}
  .pdoc-table th.pd-col-qty {{ width: 10%; }}
  .pdoc-table tbody tr {{ break-inside: avoid; }}
  .pdoc-table tbody td {{ border: 1px solid var(--pd-line); padding: 8px 10px; vertical-align: middle; font-size: 12px; }}
  .pd-item {{ font-weight: 600; text-align: center; }}
  .pd-desc {{ text-align: left; }}
  .pd-pic {{ text-align: center; padding: 6px; }}
  .pd-tile {{ display: block; width: 100%; height: auto; max-height: 64px; object-fit: contain; margin: 0 auto; }}
  .pd-cell-num {{ text-align: right; font-family: var(--font-mono, monospace); font-variant-numeric: tabular-nums; }}

  .pdoc-totals {{ margin: 0 0 8px auto; width: 320px; }}
  .pdoc-total-row {{ display: flex; justify-content: space-between; gap: 24px; padding: 9px 6px; border-top: 1px solid var(--pd-line); }}
  .pdoc-total-row .pd-total-label {{ font-weight: 600; }}
  .pdoc-total-row .pd-total-value {{ font-family: var(--font-mono, monospace); font-variant-numeric: tabular-nums; }}
  .pdoc-total-row[data-emphasis='true'] .pd-total-label, .pdoc-total-row[data-emphasis='true'] .pd-total-value {{ font-size: 15px; font-weight: 700; }}

  .pdoc-section-bar {{ background: var(--pd-bar); padding: 8px 12px; margin: 26px 0 14px; font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }}
  .pdoc-section-en {{ font-weight: 400; color: var(--pd-muted); text-transform: none; letter-spacing: 0.02em; }}
  .pdoc-terms {{ display: grid; grid-template-columns: 220px 1fr; gap: 8px 16px; padding: 0 4px; font-size: 12px; }}
  .pdoc-term-label {{ font-weight: 600; }}
  .pdoc-term-en {{ font-weight: 400; color: var(--pd-muted); }}
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
    .pdoc-party-name, .pdoc-party-meta dd {{ overflow-wrap: anywhere; }}
    .pdoc-terms {{ grid-template-columns: 1fr; gap: 0; }}
    .pdoc-term-label {{ margin-top: 10px; }}
    .pdoc-terms > span:first-child {{ margin-top: 0; }}
    .pdoc-totals {{ width: 100%; }}
    .pdoc-footer {{ flex-direction: column; gap: 12px; }}
    .pdoc-footer .pd-foot-right {{ text-align: left; }}
  }}

  @media print {{
    @page {{ size: A4 portrait; margin: 12mm; }}
    body {{ background: #ffffff; }}
    .pdoc-page {{ min-height: 0; padding: 0; }}
    .pdoc-page .pdoc {{ box-shadow: none; }}
    .pdoc {{ max-width: none; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
    /* Push the sign-off + footer to the bottom padding of page 2 so the tail
       never reads as dead space. Spacer is print-only; screen keeps flow. */
    .pdoc-tailspacer {{ height: {TAIL_SPACER}; }}
  }}
</style>
</head>
<body>
<div class="pdoc-page">
<article class="pdoc">

  <header class="pdoc-header">
    <div>
      <h1 class="pdoc-title">Proforma</h1>
      <p class="pdoc-number" data-draft="false">PF-WGT-2026-0723</p>
    </div>
    <div class="pdoc-brand">
      {LOGO}
      <span class="pdoc-tagline">SOLUCIONES INTEGRALES EN IMPORTACIÓN</span>
    </div>
  </header>
  <div class="pdoc-rule" aria-hidden="true"></div>

  <div class="pdoc-dateline">
    <span>Iquique, 23-07-2026</span>
    <span>Validez: 15 días</span>
    <span>Incoterm: FOB</span>
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
      <div class="pdoc-party-head">Comprador / Importador</div>
      <div class="pdoc-party-name">Renata Revol</div>
      <dl class="pdoc-party-meta">
        <dt>Origen</dt><dd>Bolivia</dd>
        <dt>Teléfono</dt><dd>+591 68173247</dd>
        <dt>Contacto</dt><dd>Renata Revol</dd>
      </dl>
    </div>
  </div>

  <table class="pdoc-table">
    <thead>
      <tr>
        <th class="pd-col-item">Ítem</th>
        <th class="pd-col-desc">Descripción</th>
        <th class="pd-col-pic">Imagen</th>
        <th class="pd-col-qty">Cant.</th>
        <th>Precio unit. (USD)</th>
        <th>Precio total (USD)</th>
      </tr>
    </thead>
    <tbody>
      {ROWS}
    </tbody>
  </table>

  <div class="pdoc-totals">
    <div class="pdoc-total-row">
      <span class="pd-total-label">Sub total</span>
      <span class="pd-total-value">{SUBTOTAL}</span>
    </div>
    <div class="pdoc-total-row" data-emphasis="true">
      <span class="pd-total-label">Total</span>
      <span class="pd-total-value">{SUBTOTAL}</span>
    </div>
  </div>

  <div class="pdoc-section-bar">Condiciones comerciales</div>
  <div class="pdoc-terms">
    <span class="pdoc-term-label">Puerto de origen</span><span>Qingdao, China</span>
    <span class="pdoc-term-label">Puerto de destino</span><span>Iquique, Chile</span>
    <span class="pdoc-term-label">Forma de pago</span><span>50% adelantado y 50% al embarque en el puerto de origen.</span>
    <span class="pdoc-term-label">Tiempo de entrega</span><span>Embarque dentro de 30 días naturales tras recibir el pago final.</span>
    <span class="pdoc-term-label">Vigencia de la oferta</span><span>15 días desde la fecha de esta proforma.</span>
  </div>

  <div class="pdoc-section-bar">Observaciones</div>
  <ul class="pdoc-observations">
    <li>Los precios indicados corresponden a términos FOB.</li>
    <li>Los precios están expresados en dólares americanos (USD).</li>
    <li>Cualquier variación en costos logísticos, fletes o tipo de cambio podría afectar el precio final.</li>
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

out = HERE / "proforma.html"
out.write_text(HTMLDOC, encoding="utf-8")
print(f"wrote {out} ({len(HTMLDOC):,} bytes)")
