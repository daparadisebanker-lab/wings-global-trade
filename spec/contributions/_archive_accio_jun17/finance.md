# Finance Contribution — Wings Global Trade

## Revenue Model

Wings Global Trade is a B2B import operator — revenue is not collected on the platform. The platform exists to generate qualified leads that convert to commercial agreements offline.

**Revenue streams (external to platform):**
1. **Sourcing margin** — embedded in FOB price (18% machinery, 15% vehicles, 22% parts, 20% equipment)
2. **Logistics management fee** — charged per shipment for free zone processing + customs clearance
3. **Retainer agreements** — volume importers on recurring terms (v2 concept)

**Platform's role:** Lead generation and qualification only. No transactions.

---

## CIF Calculation — Complete Validation

### Formula (existing in `src/lib/cif-calculator.ts`)

```
FOB = target_price_usd × quantity × (1 + sourcing_margin)

sourcing_margins:
  maquinaria-agricola:      0.18  (18%)
  camiones-vehiculos:       0.15  (15%)
  buses:                    0.15  (15%)
  equipamiento-industrial:  0.20  (20%)
  repuestos:                0.22  (22%)

Freight = lookup(source_market, destination_port, container_type)
Insurance = (FOB + Freight) × 0.015   (1.5% — standard marine insurance rate)

CIF = FOB + Freight + Insurance
Duty = CIF × duty_rate / 100
Total Landed = CIF + Duty + clearance_fees
```

### Edge Cases to Handle

| Edge Case | Rule |
|---|---|
| `target_price_usd` = 0 or null | Return error: "Por favor ingresa un precio objetivo" |
| `quantity` = 0 | Return error: "La cantidad debe ser mayor a 0" |
| Unknown `hs_code` | Use category-level default duty rate, mark as "tasa estimada" |
| Unknown `destination_country` | Default to Peru duty rates, note "país no especificado" |
| Freight lookup miss | Use $2,800 as default freight estimate (China → LATAM general), flag as estimated |
| Insurance = 0 | Insurance is never 0 — minimum is $150 per shipment |
| `quantity` < MOQ | Show estimate but add disclaimer: "Mínimo típico: [MOQ] unidades. Confirmar con equipo." |

### Freight Table (populate in `duty-rates.ts`)

| Source → Destination | 20' Container | 40' HC Container |
|---|---|---|
| China → Callao (Lima, PE) | $1,800 | $2,400 |
| China → Valparaíso (CL) | $2,000 | $2,600 |
| China → Buenaventura (CO) | $2,200 | $2,900 |
| Japan → Callao | $2,400 | $3,200 |
| Japan → Valparaíso | $2,600 | $3,400 |
| Thailand → Callao | $1,600 | $2,200 |
| Dubai → Callao | $1,400 | $1,900 |

ZOFRATACNA and ZOFRI add port-to-zone transfer: +$200 flat fee.

---

## Number Display Standards

All financial values displayed to users must follow:

### Currency Format

```typescript
// Always USD with comma separators, 0 decimal places for totals
// 2 decimal places for line items only if significant

const formatCIF = (value: number): string =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

// Output: "US$ 47,320" (es-PE locale)
```

### Percentage Format

```typescript
const formatRate = (rate: number): string =>
  `${rate.toFixed(1)}%`

// Output: "9.0%" — never "9%" or "9.00%"
```

### CIF Card Row Labels

```
FOB estimado (en origen):          US$ 41,300
Flete internacional:               US$ 2,400
Seguro de carga (1.5%):            US$ 654
────────────────────────────────────────────
CIF total:                         US$ 44,354
Arancel estimado (9.0%):           US$ 3,992
────────────────────────────────────────────
Costo total estimado en destino:   US$ 48,346
Zona franca:                       ZOFRATACNA (Tacna, Perú)
```

### Disclaimer (always show)

```
Estimado preliminar basado en datos del Motor Accio. 
Los valores finales de flete, arancel y honorarios se 
confirman con la propuesta formal de Wings.
```

---

## Key Metrics (Internal — not displayed in MVP)

For future admin dashboard:

| Metric | Description |
|---|---|
| Estimated CIF value | Sum of all Accio estimates generated (pipeline value indicator) |
| Average CIF per lead | Total estimated CIF / number of Accio leads |
| Category revenue mix | Lead count × average deal size per category |
| Conversion rate by category | Inquiries submitted / product pages visited |
| Lead quality score | TPR completeness % for Accio leads |
