# Wave M0 · Acceptance-oracle baseline

Captured 2026-07-06 on `chore/monorepo-migration` at tag `pre-monorepo`, against
`pnpm start` (production build) on `http://localhost:3000`. Every later wave's
preview deploy must reproduce these observations exactly.

## Build
- `pnpm build` from repo root: **exit 0** (log: `build-baseline.log`).
- Route inventory (from the build log): `/`, `/catalogo`, `/catalogo/[category]`,
  `/catalogo/[category]/[slug]`, `/catalogo/[category]/aplicacion/[useCase]` (SSG:
  arrozal, frutales, cultivos-surco, ganaderia), `/catalogo/comparar`, `/contacto`,
  `/cotizar`, `/mister`, `/nosotros`, `/proceso`, `/repuestos`, sitemap/robots/OG.
- First Load JS shared: 102 kB. Product detail `/catalogo/[category]/[slug]`: 199 kB.

## Routes rendered (desktop 1440-wide) — visual reference
- **`/`** — navy hero, "Importación técnica para el mercado latinoamericano." in
  NissanOpti display; gold "CONSULTA TÉCNICA" CTA; carousel dots (3); nav:
  CÓMO IMPORTAR · CATÁLOGO · MOTORES · MISTER IA · NOSOTROS · CONTACTO · COTIZAR ·
  green WHATSAPP.
- **`/catalogo/maquinaria-agricola`** — "Maquinaria Agrícola" title, "20 modelos
  disponibles", category chips row (Maquinaria Agrícola active/gold, Camiones, Buses,
  … Importación personalizada highlighted navy).
- **`/catalogo/maquinaria-agricola/new-holland-sh504`** — hero "New Holland SH504",
  spec stat row 50 HP / 2.000 rpm / 8+2 / 766 rpm; right column sticky "Solicitar
  este modelo" inquiry form.
- **`/mister`** — embedded Mister, induction message + 3 quick actions; right rail
  "PERFIL DE TU CONSULTA" (0 de 8 datos), ETAPA ladder (INDUCCIÓN→…→SOPORTE),
  OPERACIÓN collected fields (all PENDIENTE).
- **`/nosotros`** — navy, "NOSOTROS" eyebrow (content loads on scroll).
- **`/contacto`** — "Habla con el equipo." hero; CANALES DIRECTOS + message form.

Screenshots captured in-session (desktop). **390px mobile capture not achievable
through the extension** — Chrome window will not reflow below its minimum width, so
mobile screenshots render at desktop viewport. Mobile reflow to be re-verified per
wave via Vercel preview on a real device / responsive mode. (Recorded as a tooling
limitation, not a site defect.)

## Mister — full SSE conversation exercised end-to-end ✅
Session `#WGT-202607-AKMOY3`. Input: "Importo maquinaria agrícola a Perú para mi
propia operación, tractores de 50 HP" → then quick action "Solicitar cotización".

Observed, all correct:
- **SSE stream**: tokens streamed into the transcript live.
- **Archetype resolution**: header flipped to **COMPRADOR FINAL** (lead_buyer).
- **Stage progression**: INDUCCIÓN ✓ → DESCUBRIMIENTO ✓ → CONSIDERACIÓN ✓ →
  PRE-CALIFICACIÓN (active) across the two turns.
- **collected patch** applied from control block: PAÍS DE DESTINO = **PE**;
  counter advanced 0 → 2 of 8. No second model call.
- **Surfaces rendered** via SurfaceRenderer: product spec cards (New Holland SH504
  + SNH504 with Motor/Altura/PTO RPM/Longitud, CHINA origin badge), then a
  comparison surface (Longitud, RPM motor, Transmisión, "Opción A diferenciada en
  4 ejes"), then the **quotation prefill form** (QuotationFormCTA): Nombre completo,
  Empresa, País, Correo, Teléfono/WhatsApp + "Enviar solicitud".
- **Quick actions** rendered each turn (e.g. Ver especificaciones · Solicitar
  cotización; then 1 unidad / 2 a 5 / Más de 5).
- **HOLD-BACK guardrail intact**: every price field read **"A cotizar"** — no
  absolute price, availability, or lead time appeared anywhere.

## Lead submissions ✅ (non-prod: notifications log server-side, no Twilio/Resend)
Both used clearly-fake test data (Baseline Test — Migración / QA Monorepo SAC /
baseline-test@example.com / +51 999 000 000).
- **Catalog inquiry** (New Holland SH504, país=Perú, cantidad=3): submitted →
  confirmation **"Solicitud enviada."**
- **Contact lead** (`/contacto`): submitted → confirmation **"Mensaje recibido."**
- Notification payloads: `VERCEL_ENV !== 'production'` path logs payload to the
  server console and skips real sends (per CLAUDE.md notification flow). Server
  console log: `server-console.log`.

## Lighthouse
Not run in this pass (no headless Lighthouse in the current toolchain). To be
captured against the M1 preview deploy where the hosted URL enables PageSpeed /
Lighthouse CI as the comparison point for exit gates.
