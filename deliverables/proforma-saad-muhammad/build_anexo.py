#!/usr/bin/env python3
"""Build the branded Anexo (annex) to proforma PF-WGT-2026-0723.

A SEPARATE, self-contained Wings-branded document that enlists the *approximate*
logistic handling costs to the port of destination (Iquique, Chile). Shares the
proforma's livery (same logo, fonts, section bars, footer). Spanish only.
Run from this directory:  python3 build_anexo.py
"""
from pathlib import Path

HERE = Path(__file__).resolve().parent
LOGO_SVG = "/home/user/wings-global-trade/apps/tower/public/brand/wings-imagotipo.svg"

PROFORMA_NO = "PF-WGT-2026-0723"
CBM_RT = "10.30 RT"

# ── Cost lines (approximations). amount None → shown as "No incluido". ─────────
LOGISTICS = [
    ("Flete marítimo", 927.00),
    ("Carga en puerto de origen", 230.00),
    ("Gastos del puerto Iquique, Chile", 1742.76),
    ("Costo de carga, descarga y almacenaje", None),  # No incluido
]
PROFORMA_SALE = 5051.00


def fmt(v: float) -> str:
    return f"{v:,.2f}"


LOGISTICS_SUBTOTAL = sum(a for _, a in LOGISTICS if a is not None)  # 2,899.76
GRAND_TOTAL = LOGISTICS_SUBTOTAL + PROFORMA_SALE                    # 7,950.76

LOGO = Path(LOGO_SVG).read_text(encoding="utf-8")
LOGO = LOGO[LOGO.index("<svg"):]
LOGO = LOGO.replace("<svg ", '<svg class="pdoc-logo" ', 1)
SIGNATURE = (HERE / "signature.svg").read_text(encoding="utf-8")


def cost_rows() -> str:
    rows = []
    for label, amount in LOGISTICS:
        monto = (
            f'<td class="pd-cell-num">{fmt(amount)}</td>'
            if amount is not None
            else '<td class="pd-cell-num pd-muted">No incluido</td>'
        )
        rows.append(f'<tr><td class="pd-desc">{label}</td>{monto}</tr>')
    return "\n      ".join(rows)


HTMLDOC = f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Anexo · Costos logísticos · {PROFORMA_NO}</title>
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
    --pd-ink: #0f1216; --pd-muted: #6b7280; --pd-line: #d1d5db; --pd-bar: #ececec;
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

  .pdoc-section-bar {{ background: var(--pd-bar); padding: 8px 12px; margin: 8px 0 14px; font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }}

  .pdoc-table {{ width: 100%; border-collapse: collapse; table-layout: fixed; }}
  .pdoc-table thead th {{ background: var(--pd-bar); font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; padding: 10px 10px; border: 1px solid var(--pd-line); }}
  .pdoc-table th.pd-col-desc {{ width: 70%; text-align: left; }}
  .pdoc-table th.pd-col-monto {{ text-align: right; }}
  .pdoc-table tbody td {{ border: 1px solid var(--pd-line); padding: 10px 10px; vertical-align: middle; font-size: 12px; }}
  .pd-desc {{ text-align: left; }}
  .pd-cell-num {{ text-align: right; font-family: var(--font-mono, monospace); font-variant-numeric: tabular-nums; }}
  .pd-muted {{ color: var(--pd-muted); font-family: var(--font-ui); font-style: italic; }}
  .pd-row-emph td {{ font-weight: 700; background: #fafafa; }}

  .pdoc-totals {{ margin: 14px 0 8px auto; width: 380px; }}
  .pdoc-total-row {{ display: flex; justify-content: space-between; gap: 24px; padding: 9px 6px; border-top: 1px solid var(--pd-line); }}
  .pdoc-total-row .pd-total-label {{ font-weight: 600; }}
  .pdoc-total-row .pd-total-value {{ font-family: var(--font-mono, monospace); font-variant-numeric: tabular-nums; }}
  .pdoc-total-row[data-emphasis='true'] {{ border-top: 2px solid var(--pd-ink); }}
  .pdoc-total-row[data-emphasis='true'] .pd-total-label, .pdoc-total-row[data-emphasis='true'] .pd-total-value {{ font-size: 15px; font-weight: 700; }}

  .pdoc-observations {{ margin: 0; padding: 0 4px; list-style: none; font-size: 12px; }}
  .pdoc-observations li {{ position: relative; padding-left: 18px; margin-bottom: 4px; }}
  .pdoc-observations li::before {{ content: '•'; position: absolute; left: 4px; }}

  .pdoc-issuedby {{ margin: 22px 0 0; max-width: 300px; }}
  .pdoc-issuedby-label {{ font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--pd-muted); margin-bottom: 6px; }}
  .pdoc-signature {{ height: 52px; margin-bottom: 2px; }}
  .pdoc-signature svg {{ display: block; height: 100%; width: auto; max-width: 260px; }}
  .pdoc-issuedby-name {{ font-weight: 600; padding-top: 6px; border-top: 1px solid var(--pd-line); }}
  .pdoc-issuedby-title {{ margin-top: 2px; font-size: 12px; color: var(--pd-muted); }}

  .pdoc-footer {{ display: flex; justify-content: space-between; gap: 24px; margin-top: 28px; padding-top: 14px; border-top: 1px solid var(--pd-line); color: var(--pd-muted); font-size: 12px; break-inside: avoid; }}
  .pdoc-footer .pd-foot-right {{ text-align: right; }}

  @media (max-width: 640px) {{
    .pdoc {{ padding: 28px 22px 32px; }}
    .pdoc-title {{ font-size: 34px; }}
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
  }}
</style>
</head>
<body>
<div class="pdoc-page">
<article class="pdoc">

  <header class="pdoc-header">
    <div>
      <span class="pdoc-kicker">Anexo a la proforma {PROFORMA_NO}</span>
      <h1 class="pdoc-title">Anexo</h1>
      <p class="pdoc-number" data-draft="false">Aproximación de costos logísticos</p>
    </div>
    <div class="pdoc-brand">
      {LOGO}
      <span class="pdoc-tagline">SOLUCIONES INTEGRALES EN IMPORTACIÓN</span>
    </div>
  </header>
  <div class="pdoc-rule" aria-hidden="true"></div>

  <div class="pdoc-dateline">
    <span>Iquique, 23-07-2026</span>
    <span>Ruta: China → Iquique, Chile</span>
    <span>CBM total: {CBM_RT}</span>
    <span>Moneda: USD</span>
  </div>

  <div class="pdoc-section-bar">Costos logísticos aproximados hasta el puerto de destino</div>
  <table class="pdoc-table">
    <thead>
      <tr>
        <th class="pd-col-desc">Detalle</th>
        <th class="pd-col-monto">Monto (USD)</th>
      </tr>
    </thead>
    <tbody>
      {cost_rows()}
      <tr class="pd-row-emph"><td class="pd-desc">Subtotal costos logísticos</td><td class="pd-cell-num">{fmt(LOGISTICS_SUBTOTAL)}</td></tr>
    </tbody>
  </table>

  <div class="pdoc-totals">
    <div class="pdoc-total-row">
      <span class="pd-total-label">Venta total a cliente (acuerdo proforma)</span>
      <span class="pd-total-value">{fmt(PROFORMA_SALE)}</span>
    </div>
    <div class="pdoc-total-row" data-emphasis="true">
      <span class="pd-total-label">Costo total hasta Iquique (IQQ), Chile para el cliente</span>
      <span class="pd-total-value">{fmt(GRAND_TOTAL)}</span>
    </div>
  </div>

  <div class="pdoc-section-bar">Observaciones</div>
  <ul class="pdoc-observations">
    <li>Los montos son aproximaciones sujetas a variación según tarifas vigentes, tipo de cambio y condiciones portuarias.</li>
    <li>El costo de carga, descarga y almacenaje en destino no está incluido.</li>
    <li>CBM total considerado: {CBM_RT}.</li>
    <li>Este anexo es referencial y complementa la proforma {PROFORMA_NO}; no constituye una factura.</li>
  </ul>

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

out = HERE / "anexo.html"
out.write_text(HTMLDOC, encoding="utf-8")
print(f"wrote {out} ({len(HTMLDOC):,} bytes) · subtotal {fmt(LOGISTICS_SUBTOTAL)} · total {fmt(GRAND_TOTAL)}")
