# Camiones — Creative Briefs

System: «Documento». *(EN annotations in italics.)*

---

## Concept CM1 — «97 modelos» (KAMA range hero)

**Formats:** Reels 9:16 15s · 4:5 static. **Archetype:** A1. **Destination:** `/catalogo/camiones`.
*(EN: The proven hero line as a paid asset. The Reel is a rapid series montage — twelve series names stamp in sequence like a manifest being typed; the count runs 01→97 in Teko in the corner. Ends on the verbatim hero line.)*

**Hook (first frame):** `01 / 97`
**Sequence:** `SERIE W` → `SERIE X` → `SERIE V` → `SERIE S` → `SERIE M1 · M3 · M6` → `SERIE K · GM` → `SERIE EW · ES · EX` *(all 12 real series, `kama-trucks.json`)* → counter lands on `97` →
**Closing super / Headline:** `97 modelos. Precio CIF sin intermediarios.` *(hero slide 2, verbatim)*
**Primary text:** `La línea KAMA completa — de la serie W a la EX — importada directamente por Wings desde zona franca. Cotización CIF documentada por modelo, sin manos intermedias en el camino.`
**CTA:** Ver catálogo

---

## Concept CM2 — «Tolva 30 m³» (volquete HOWO — minería/obra, A2)

**Formats:** static 4:5 + 1:1 · Reel 9:16 cut. **Archetype:** A2. **Destination:** `/catalogo/camiones/volquete-howo-8x4`.
*(EN: Spec-severity execution for mining procurement. The ad is a load calculation, not a truck glamour shot.)*

**Visual:** HOWO photo/silhouette on navy; gold engineering callouts: `8x4` · `400 HP` · `TOLVA 30 m³` · `CARGA ÚTIL 40 t` *(seed.json, verbatim)*.
**Hook:** `40 toneladas por ciclo. La aritmética de la faena.`
**Headline:** `Volquete HOWO 8x4. 400 HP. Tolva de 30 m³.`
**Primary text:** `Servicio pesado para operación minera y obra. Especificación completa, norma de emisiones y certificados de origen disponibles antes del compromiso. Cotización formal para procurement en 24 horas hábiles.`
**CTA:** Más información

---

## Concept CM3 — «-18 °C, documentado» (furgón refrigerado — cadena de frío, A2)

**Formats:** static 4:5. **Archetype:** A2 agroexport/food. **Destination:** `/catalogo/camiones/furgon-refrigerado-4x2`.
*(EN: Cold-chain compliance angle. The temperature is the hook; the document is the reassurance. Micro-cell budget.)*

**Visual:** navy field; a single gold rule dividing the layout at "temperature zero"; below the rule: `-18 °C` huge in Teko.
**Hook:** `La cadena de frío no acepta aproximaciones.`
**Headline:** `Furgón refrigerado 4x2. Caja de 34 m³ a -18 °C.`
**Primary text:** `Unidad de refrigeración a -18 °C, caja de 6,2 m y 34 m³ para distribución con cadena de frío. Ficha técnica verificada y estructura de costo de internación explicada antes de cotizar.`
**CTA:** Más información

---

## Concept CM4 — «El camino de un camión» (duty-education Reel → Mister)

**Formats:** Reels 9:16 20s. **Archetype:** A1. **Destination:** `/mister`.
*(EN: The landed-cost waterfall as narrative — Mister's own indexed-structure pedagogy, converted to ads. CRITICAL: indexed points only, zero currency figures, disclaimer on-screen — this extends Mister's hard rule 1 into paid media.)*

**Script (supers over blueprint-grid animation of a container route):**
1. `Un camión no cuesta lo que dice la factura.`
2. `Producto → flete → seguro → aranceles → última milla.` *(the five real waterfall segments, `src/types/mister.ts` WaterfallSegment keys)*
3. `Desde zona franca, el arancel se suspende hasta el destino final.`
4. `Mister te explica la estructura completa. El precio real, te lo cotiza el equipo en 24 horas.`
5. Micro-disclaimer footer (verbatim from `WATERFALL_COPY`): `rango ilustrativo — no es cotización`
**Headline:** `Entiende el costo de internación antes de comprometerte.`
**Primary text:** `Mister — la inteligencia comercial de Wings — te muestra cómo se construye el costo de un camión importado, capa por capa, y qué mueve cada capa. Sin registro. Cuando estés listo, el equipo emite la cotización CIF documentada.`
**CTA:** Más información

---

## Concept CM5 — «Serie por serie» (KAMA carousel — retargeting R1)

**Format:** carousel 1:1, up to 12 cards. **Audience:** R1 `/catalogo/camiones` visitors. **Destination:** `/catalogo/camiones`.
Each card: one KAMA series name + segment descriptor (ligero/mediano/eléctrico per series data as it is enriched — note: series specs flagged "verify before production seeding" in `kama-trucks.json`; use only confirmed attributes on cards). Final card → `Mister: ¿qué serie corresponde a tu ruta?`
**Headline:** `Doce series. Una ficha técnica por modelo.`
**Primary text:** `Vuelve a mirar con calma. Cada serie KAMA tiene su ficha completa en el catálogo, y Mister resuelve las dudas que la ficha no responde.`
