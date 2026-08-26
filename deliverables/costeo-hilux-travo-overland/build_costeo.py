#!/usr/bin/env python3
"""Build the internal "Costo de importación" cost sheet for 2x Toyota Hilux
Travo Overland, running TOWER's own SUNAT import-cost engine — a faithful
Python port of apps/tower/src/lib/costing/engine.ts (computeImportCost),
matched line-for-line to preserve its exact formula chain and ROUND_HALF_UP
rounding (decimal.js there, decimal.Decimal here). The row set, labels, and
order mirror apps/tower/src/components/costing/export.ts (costSheetRows) and
the document mirrors CostSheetDocument.tsx + cost-sheet.css exactly — this is
TOWER's own internal cost sheet, not the branded client-facing cotización.

Inputs specific to this deal: FOB $46,000/unit, freight $8,000 total for a
2-unit shared container ($4,000/unit), 10% margin (percent mode). Every other
input (freightZofratacna, portExpenses, customsAgency, insuranceRate, igvRate,
percepcionRate, exchangeRate, adValoremRate) uses TOWER's own DEFAULT_INPUTS
since this deal didn't specify them — flagged in the printed notes so they're
easy to override. The engine is inherently per-unit; the "× 2 unidades" block
at the end is this script's own addition (TOWER's sheet has no quantity
field), clearly separated from the stock per-unit cascade above it. Run:
  python3 build_costeo.py
"""
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

HERE = Path(__file__).resolve().parent
LOGO_SVG = "/home/user/wings-global-trade/apps/tower/public/brand/wings-imagotipo.svg"

DOC_DATE = "26-08-2026"


def d(x) -> Decimal:
    return Decimal(str(x))


def r2(x: Decimal) -> Decimal:
    return x.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


# ── ImportInputs — TOWER field names kept verbatim for traceability ───────
inputs = dict(
    productName="Hilux Travo Overland",
    brand="Toyota",
    model="Travo Overland (2.8 Turbodiésel 4x4 AT)",
    fuelType="diesel",
    engineCC=2755,
    origin="china",
    incoterm="FOB",
    fob=d(46000),                    # this deal
    transportOrigin=d(0),
    freightInternational=d(4000),    # this deal: 8,000 / 2 unidades
    freightZofratacna=d(500),        # TOWER DEFAULT_INPUTS — not specified for this deal
    portExpenses=d(375),             # TOWER DEFAULT_INPUTS
    customsAgency=d(300),            # TOWER DEFAULT_INPUTS
    handlingStowage=d(0),            # TOWER DEFAULT_INPUTS
    adValoremRate=d(0),              # TOWER DEFAULT_INPUTS (0 — no Ad Valorem, China origin)
    igvRate=d("0.18"),               # TOWER DEFAULT_INPUTS
    percepcionRate=d("0.035"),       # TOWER DEFAULT_INPUTS
    insuranceRate=d("0.015"),        # TOWER DEFAULT_INPUTS
    exchangeRate=d("3.7"),           # TOWER DEFAULT_INPUTS
    marginMode="percent",
    marginPercent=d("0.10"),         # this deal
)
UNITS = 2


def derive_isc_rate(fuel_type: str) -> Decimal:
    # engine.ts deriveISCRate: hybrid/diesel -> 0 (no explicit iscRate override here)
    if fuel_type in ("hybrid", "diesel"):
        return d(0)
    return d(0)  # not reached for this deal (diesel)


def compute_import_cost(i: dict) -> dict:
    """Faithful line-for-line port of engine.ts computeImportCost (FOB incoterm path)."""
    FOB = i["fob"]
    freight_int = i["freightInternational"]
    ins_rate = i["insuranceRate"]
    ad_val = i["adValoremRate"]
    igv = i["igvRate"]
    perc = i["percepcionRate"]
    tc = i["exchangeRate"]

    cif_base = r2(FOB + freight_int)
    insurance = r2(ins_rate * cif_base)
    cif = r2(cif_base + insurance)

    ad_valorem = r2(ad_val * cif)
    isc_rate = derive_isc_rate(i["fuelType"])
    isc = r2(isc_rate * (cif + ad_valorem))

    dutiable_base_soles = r2((cif + ad_valorem + isc) * tc)
    igv_importacion = r2(dutiable_base_soles * igv / tc)

    percepcion_base_soles = r2((cif + ad_valorem + isc + igv_importacion) * tc)
    percepcion = r2(percepcion_base_soles * perc / tc)

    gastos_vinculados = r2(
        i["freightZofratacna"] + i["portExpenses"] + i["customsAgency"] + i["handlingStowage"]
    )

    landed_cost = r2(cif + ad_valorem + isc + gastos_vinculados)
    cash_outlay = r2(landed_cost + igv_importacion + percepcion)

    min_by_percent = i["marginPercent"]
    min_by_usd = (d(1000) / landed_cost) if landed_cost > 0 else d(0)
    margin_rate = max(min_by_percent, min_by_usd)
    margin_usd = r2(landed_cost * margin_rate)
    sale_price = r2(landed_cost + margin_usd)

    igv_ventas = r2(sale_price * igv)
    sale_price_final = r2(sale_price + igv_ventas)

    impuestos_recuperables_usd = r2(igv_importacion + percepcion)
    margen_neto_caja = r2(margin_usd - impuestos_recuperables_usd)
    margen_neto_caja_pct = (margen_neto_caja / landed_cost) if landed_cost > 0 else d(0)

    return dict(
        insurance=insurance, cif=cif, adValorem=ad_valorem, isc=isc,
        igvImportacion=igv_importacion, percepcion=percepcion,
        gastosVinculados=gastos_vinculados, landedCost=landed_cost, cashOutlay=cash_outlay,
        marginRate=margin_rate, marginUSD=margin_usd, salePrice=sale_price,
        igvVentas=igv_ventas, salePriceFinal=sale_price_final,
        margenBruto=margin_usd, margenBrutoPct=margin_rate,
        impuestosRecuperablesUSD=impuestos_recuperables_usd,
        margenNetoCaja=margen_neto_caja, margenNetoCajaPct=margen_neto_caja_pct,
    )


result = compute_import_cost(inputs)


def money(v) -> str:
    if isinstance(v, Decimal):
        return f"{v:,.2f}"
    return str(v)


def pct(v: Decimal) -> str:
    return f"{v * 100:.1f}%"


# ── costSheetRows() — same shape/order as export.ts ────────────────────────
ROWS: list[tuple[str, str]] = [
    ("Producto", inputs["productName"]),
    ("Marca", inputs["brand"]),
    ("Modelo", inputs["model"]),
    ("Combustible", "diésel"),
    ("Cilindrada CC", str(inputs["engineCC"])),
    ("Incoterm", inputs["incoterm"]),
    ("Tipo de cambio (PEN/USD)", str(inputs["exchangeRate"])),
    ("—", ""),
    ("CASCADA DE COSTOS (USD)", ""),
    ("FOB / valor", money(inputs["fob"])),
    ("Seguro", money(result["insurance"])),
    ("CIF", money(result["cif"])),
    ("Ad Valorem", money(result["adValorem"])),
    ("ISC", money(result["isc"])),
    ("IGV importación", money(result["igvImportacion"])),
    ("Percepción", money(result["percepcion"])),
    ("Gastos vinculados", money(result["gastosVinculados"])),
    ("Landed cost", money(result["landedCost"])),
    ("Desembolso de caja", money(result["cashOutlay"])),
    ("—", ""),
    ("PRECIO Y MÁRGENES (USD)", ""),
    ("Precio de venta (ex-IGV)", money(result["salePrice"])),
    ("IGV ventas", money(result["igvVentas"])),
    ("Precio final", money(result["salePriceFinal"])),
    ("Margen bruto", money(result["margenBruto"])),
    ("Margen bruto %", pct(result["margenBrutoPct"])),
    ("Impuestos recuperables USD", money(result["impuestosRecuperablesUSD"])),
    ("Margen neto de caja", money(result["margenNetoCaja"])),
    ("Margen neto de caja %", pct(result["margenNetoCajaPct"])),
]

# ── This script's own addition — TOWER's engine has no quantity field ─────
QTY_ROWS: list[tuple[str, str]] = [
    ("Landed cost total", money(result["landedCost"] * UNITS)),
    ("Precio de venta total (ex-IGV)", money(result["salePrice"] * UNITS)),
    ("IGV ventas total", money(result["igvVentas"] * UNITS)),
    ("Precio final total (USD)", money(result["salePriceFinal"] * UNITS)),
    ("Precio final total (S/, ref.)", money(r2(result["salePriceFinal"] * UNITS * inputs["exchangeRate"]))),
    ("Margen bruto total", money(result["margenBruto"] * UNITS)),
]


def rows_html(rows: list[tuple[str, str]]) -> str:
    out = []
    for k, v in rows:
        if k == "—":
            out.append('<tr class="csheet-spacer"><td colspan="2"></td></tr>')
        elif v == "" and k == k.upper():
            out.append(f'<tr class="csheet-section"><td colspan="2">{k}</td></tr>')
        else:
            out.append(f'<tr><td>{k}</td><td class="csheet-val">{v}</td></tr>')
    return "\n          ".join(out)


HTMLDOC = f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Costo de importación · Hilux Travo Overland</title>
<style>
  :root {{
    --cs-ink: #0f1216;
    --cs-ink-mid: #374151;
    --cs-ink-soft: #6b7280;
    --cs-surface: #ffffff;
    --cs-line: #e5e7eb;
    --cs-mat: #52555a;
    --cs-accent: #c4933f;
  }}
  html, body {{ margin: 0; padding: 0; }}
  .csheet-page {{ min-height: 100vh; background: var(--cs-mat); padding: 32px 16px 64px; }}
  .csheet-page .csheet {{ box-shadow: 0 8px 40px rgba(0, 0, 0, 0.35); }}

  .csheet {{
    box-sizing: border-box; width: 100%; max-width: 720px; margin: 0 auto;
    padding: 40px 48px; background: var(--cs-surface); color: var(--cs-ink);
    font-family: system-ui, sans-serif; font-size: 13px; line-height: 1.5;
  }}
  .csheet * {{ box-sizing: border-box; }}
  .csheet-title {{ margin: 0; font-size: 30px; font-weight: 600; letter-spacing: -0.01em; }}
  .csheet-sub {{ margin-top: 4px; font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 12px; color: var(--cs-ink-soft); }}
  .csheet-rule {{ height: 2px; background: var(--cs-ink); margin: 14px 0 22px; }}
  .csheet-table {{ width: 100%; border-collapse: collapse; }}
  .csheet-table td {{ padding: 6px 4px; border-bottom: 1px solid var(--cs-line); }}
  .csheet-table tr {{ break-inside: avoid; }}
  .csheet-table td.csheet-val {{ text-align: right; font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-variant-numeric: tabular-nums; }}
  .csheet-table tr.csheet-section td {{ border-bottom: none; padding-top: 16px; font-weight: 700; font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--cs-ink-mid); }}
  .csheet-table tr.csheet-spacer td {{ border-bottom: none; padding: 2px; }}
  .csheet-foot {{ margin-top: 28px; padding-top: 12px; border-top: 1px solid var(--cs-line); color: var(--cs-ink-soft); font-size: 11px; }}
  .csheet-note {{ margin-top: 10px; padding: 10px 12px; background: #f7f8f9; border: 1px dashed var(--cs-line); font-size: 11px; color: var(--cs-ink-soft); }}
  .csheet-note b {{ color: var(--cs-ink-mid); }}

  @media print {{
    @page {{ size: A4 portrait; margin: 14mm; }}
    .csheet {{ max-width: none; padding: 0; }}
    .csheet-page {{ background: var(--cs-surface); padding: 0; }}
    .csheet-page .csheet {{ box-shadow: none; }}
  }}
</style>
</head>
<body>
<div class="csheet-page">
<article class="csheet">
  <h1 class="csheet-title">Costo de importación</h1>
  <p class="csheet-sub">Toyota Hilux Travo Overland · {DOC_DATE} · Perú (SUNAT)</p>
  <div class="csheet-rule" aria-hidden="true"></div>

  <table class="csheet-table">
    <tbody>
      {rows_html(ROWS)}
      <tr class="csheet-spacer"><td colspan="2"></td></tr>
      <tr class="csheet-section"><td colspan="2">× {UNITS} UNIDADES (contenedor compartido)</td></tr>
      {rows_html(QTY_ROWS)}
    </tbody>
  </table>

  <p class="csheet-note">
    <b>Supuestos no especificados en este pedido</b> — tomados de los valores por defecto de TOWER
    (DEFAULT_INPUTS): flete Zofratacna US$500, gastos portuarios US$375, agencia de aduana US$300,
    tipo de cambio S/ 3.70. La cotización previa (COT-WA-2026-0826) había usado S/ 3.50 como
    referencia y no incluía flete Zofratacna — de ahí la diferencia frente a esa cifra. Ajustar estos
    valores si difieren del caso real antes de usar esta hoja para decidir precio.
  </p>

  <p class="csheet-foot">
    Wings Global Trade · Documento interno de costeo. Cifras en USD salvo indicación. Tipo de cambio {inputs["exchangeRate"]} PEN/USD.
  </p>
</article>
</div>
</body>
</html>
"""

out = HERE / "costeo.html"
out.write_text(HTMLDOC, encoding="utf-8")
print(f"wrote {out} ({len(HTMLDOC):,} bytes)")
for k, v in ROWS + QTY_ROWS:
    print(f"{k}: {v}")
