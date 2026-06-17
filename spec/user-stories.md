# Wings Global Trade — User Stories

All stories follow the format: As a [persona], I want to [action] so that [outcome].
Acceptance criteria are written as testable assertions.

---

## Epic 1 — Homepage & Intelligent Routing

### US-001 — Unified Entry Point
As a first-time visitor, I want to see a single clear entry point on the homepage so that I do not have to understand Wings' internal business model to start browsing.

**Acceptance criteria:**
- Homepage renders a category grid with labeled tiles (minimum: agricultural machinery, trucks, buses, industrial equipment, spare parts, + "Importación personalizada" tile)
- A search bar is visible above or alongside the category grid
- No modal, no explainer popup, no "choose your path" screen
- The page loads in under 2 seconds on a 4G mobile connection

### US-002 — Category Grid Routing (Catalog Flow)
As a catalog buyer, I want clicking a standard product category tile to take me directly into the catalog for that category so that I can browse products immediately.

**Acceptance criteria:**
- Clicking "Maquinaria agrícola", "Camiones", "Buses", "Equipo industrial", or "Repuestos" navigates to `/catalogo/[category-slug]`
- The selected category is visually active/highlighted in the catalog view
- Back navigation returns to the homepage

### US-003 — Custom Import Routing (Accio Engine Flow)
As a free zone reseller, I want clicking the "Importación personalizada" tile (or equivalent) to launch the Accio Engine so that I can describe my specific import requirement.

**Acceptance criteria:**
- Clicking the custom import tile navigates to `/accio` or opens the Accio Engine chat view
- No additional friction between click and chat start
- The first AI message is visible within 1 second of page load

### US-004 — Search Bar Intent Detection
As a buyer searching for a specific product, I want the search bar to route me to the right flow based on what I type so that I do not have to know which of Wings' services applies to my request.

**Acceptance criteria:**
- Searching for a term matching a catalog category (e.g. "tractor", "camión", "bus") navigates to the relevant catalog category filtered view
- Searching for a term that suggests custom sourcing (e.g. "importar 50 unidades", "contenedor", "certificación ISO", specific HS code) routes to Accio Engine with the search term pre-populated as context
- Ambiguous searches show the catalog with a prominent "¿Necesitas algo personalizado?" CTA linking to Accio Engine
- Search is functional with keyboard (Enter key submits)

### US-005 — Trust Signals on Homepage
As a first-time visitor, I want to see credentials that establish Wings' legitimacy so that I am willing to submit my business information.

**Acceptance criteria:**
- Homepage displays: markets served (Peru, Chile, Colombia + 4 others), free zone credentials (ZOFRATACNA + ZOFRI), source markets (China, Thailand, Dubai, Japan)
- No generic stock photography. Product images or abstract geometric treatments only
- Company contact (WhatsApp number) visible in footer and/or header

---

## Epic 2 — Catalog Flow

### US-006 — Browse Products by Category
As a catalog buyer, I want to browse all products in a category so that I can compare options before selecting one to inquire about.

**Acceptance criteria:**
- `/catalogo/[category-slug]` renders a grid of product cards
- Each card shows: product name (Spanish), source market, thumbnail image, and a "Ver detalles" CTA
- Grid is responsive: 1 column mobile, 2 columns tablet, 3 columns desktop
- Empty state: "No tenemos productos en esta categoría todavía. ¿Tienes algo específico en mente?" with Accio Engine CTA

### US-007 — View Product Detail
As a catalog buyer, I want to view full specifications for a product so that I can assess whether it meets my technical requirements before submitting an inquiry.

**Acceptance criteria:**
- `/catalogo/[category-slug]/[product-slug]` renders: product name, full description, technical specifications table, source market, available models (if multiple), image gallery (min 1 image), and inquiry CTA
- Specifications table renders key-value pairs from the product's `specs` JSON field
- "Solicitar cotización" button is sticky on mobile (fixed bottom bar)
- Page includes structured data (JSON-LD) for SEO

### US-008 — Submit Catalog Inquiry
As a catalog buyer, I want to submit an inquiry for a specific product so that Wings can send me a quote.

**Acceptance criteria:**
- Inquiry form fields: nombre completo (required), empresa (optional), email (required), WhatsApp/teléfono (required), país de destino (required, dropdown), cantidad requerida (required, number), producto de interés (pre-filled from product page, editable), mensaje adicional (optional, textarea)
- Form validates all required fields before submission
- On submit: lead record created in Supabase `leads` table with `flow: 'catalog'`
- On submit: WhatsApp message sent to Wings ops number
- On submit: email sent to Wings ops inbox
- On submit: buyer sees success confirmation (not a redirect — inline confirmation within the form container)
- Submission is idempotent — double-clicking does not create duplicate leads

### US-009 — Inquiry Acknowledgment
As a catalog buyer, I want to receive confirmation that my inquiry was received so that I do not wonder whether the form worked.

**Acceptance criteria:**
- Inline success state replaces form on submission: "Tu consulta fue recibida. El equipo de Wings se comunicará contigo en las próximas 24 horas."
- No email sent to the buyer (ops-only notification — MVP simplicity)
- Success state includes: Wings WhatsApp number, invitation to contact directly if urgent

---

## Epic 3 — Accio Engine Flow

### US-010 — Initiate Accio Engine Chat
As a free zone reseller, I want to start the Accio Engine and have the AI understand I am here for a custom import so that I can begin describing my product requirement.

**Acceptance criteria:**
- `/accio` renders a split-screen layout: chat interface (left/primary) + live TPR sheet (right/secondary, collapsed on mobile)
- AI sends first message immediately on page load — no "start chat" button required
- First AI message: "Hola, soy el motor Accio de Wings. Cuéntame qué producto necesitas importar y yo calcularé el costo CIF y los aranceles estimados para tu mercado."
- Chat input is focused on page load

### US-011 — AI Collects TPR (Technical Product Requirement)
As a free zone reseller, I want the AI to guide me through describing my import requirement step by step so that I do not have to know what information Wings needs.

**Acceptance criteria:**
- AI collects the following fields in natural conversation (not a rigid form):
  1. Descripción del producto (required)
  2. Categoría / Código HS (AI infers and confirms)
  3. Cantidad requerida (units or containers)
  4. Precio objetivo por unidad (USD)
  5. Mercado de destino (país)
  6. Certificaciones requeridas (CE, ISO, FDA, SENASA, etc.)
  7. Especificaciones técnicas (dimensions, weight, power, materials — product-specific)
  8. Empaque y etiquetado (requirements if any)
  9. Puerto de destino preferido
  10. Plazo de entrega estimado
- AI never asks for all fields in one message
- AI uses context from previous messages — does not re-ask answered questions
- AI messages are in Spanish

### US-012 — Live TPR Sheet Updates
As a free zone reseller, I want to see the TPR being populated in real time as I answer the AI's questions so that I know my requirements are being captured correctly.

**Acceptance criteria:**
- TPR sheet (right panel) updates after each AI response that captures a new field
- Each field shows: label, captured value, and a status indicator (captured / pending)
- Captured fields are visually distinct from pending fields
- TPR sheet has a "Editar" action per field that re-prompts the AI to ask for that field again
- On mobile: TPR sheet is accessible via a "Ver resumen" toggle button at the bottom of the chat

### US-013 — CIF Estimation
As a free zone reseller, I want to receive a preliminary CIF price estimate and customs duty breakdown before submitting so that I can assess commercial viability.

**Acceptance criteria:**
- Once minimum required fields are captured (product, quantity, destination market, target price), AI triggers CIF calculation
- CIF estimate displayed in TPR sheet as a structured breakdown:
  - FOB estimate (source market)
  - Freight estimate (to ZOFRATACNA or ZOFRI)
  - Insurance estimate (1.5% of CIF standard)
  - CIF total
  - Arancel (customs duty %, sourced from destination country + HS code lookup)
  - Estimated duty payable (USD)
  - Free zone benefit note (% savings vs. standard import corridor, if applicable)
- Estimates include a disclaimer: "Estimación preliminar sujeta a cotización formal."
- Calculation runs via `/api/accio/estimate` API route

### US-014 — Submit Accio Lead
As a free zone reseller, I want to submit my completed TPR so that Wings can begin sourcing my product.

**Acceptance criteria:**
- "Enviar consulta" button becomes active when minimum required fields are complete
- Submission fields: all TPR fields + buyer contact (nombre, empresa, email, WhatsApp, país)
- Contact collection: AI asks for contact info as the final step before submission
- On submit: `accio_projects` record created in Supabase with full TPR JSON
- On submit: `leads` record created with `flow: 'accio'` and foreign key to `accio_projects`
- On submit: WhatsApp message to Wings ops with TPR summary
- On submit: email to Wings ops with full TPR JSON formatted as readable brief
- On submit: buyer sees success state with TPR summary and Wings contact

### US-015 — Accio Conversation Continuity
As a free zone reseller, I want the chat to maintain context throughout my session so that I do not have to repeat myself.

**Acceptance criteria:**
- Full conversation history maintained in React state for the session
- Conversation history passed to Claude API on each turn (sliding window, max 20 turns)
- If buyer refreshes page, session is lost (no persistence — MVP)

---

## Epic 4 — Lead Notification (Ops)

### US-016 — WhatsApp Notification to Wings Ops
As a Wings ops team member, I want to receive a WhatsApp message the moment a lead is submitted so that I can respond within minutes.

**Acceptance criteria:**
- WhatsApp message sent via Twilio WhatsApp API (or WhatsApp Business Cloud API) within 10 seconds of form submission
- Catalog lead message format:
  ```
  Nueva consulta de catálogo — Wings
  Nombre: {name}
  Empresa: {company}
  País: {destination_country}
  Producto: {product_name}
  Cantidad: {quantity}
  WhatsApp: {phone}
  Email: {email}
  Mensaje: {message}
  ```
- Accio lead message format:
  ```
  Nueva consulta Accio — Wings
  Nombre: {name}
  Empresa: {company}
  País destino: {destination_country}
  Producto: {product_description}
  Cantidad: {quantity}
  Precio objetivo: {target_price_usd}
  CIF estimado: {cif_estimate_usd}
  WhatsApp: {phone}
  Email: {email}
  Ver brief completo: [Supabase link or internal URL]
  ```
- Failure to send WhatsApp does NOT block lead save — Supabase write happens first, notification is best-effort

### US-017 — Email Notification to Wings Ops
As a Wings ops team member, I want to receive an email with full lead details so that I have a searchable record.

**Acceptance criteria:**
- Email sent via Resend (transactional email) within 10 seconds of form submission
- Recipient: Wings ops inbox (configured via environment variable `OPS_EMAIL`)
- Catalog lead email: HTML email with all inquiry fields in a structured layout
- Accio lead email: HTML email with TPR fields in a structured table + CIF estimate breakdown
- Email subject line:
  - Catalog: `Nueva consulta: {product_name} — {destination_country}`
  - Accio: `Nueva consulta Accio: {product_description} × {quantity} — {destination_country}`
- Email includes a direct link to the Supabase record (admin URL)

---

## Epic 5 — Navigation & Global UX

### US-018 — Navigation
As any visitor, I want persistent navigation that allows me to access all main sections without returning to the homepage.

**Acceptance criteria:**
- Nav items: Inicio · Catálogo (dropdown with 5 categories) · Accio Engine · Nosotros · Contacto
- Mobile: hamburger menu, full-screen overlay
- Active state on current route
- Wings logo links to homepage
- WhatsApp contact button in nav (top right) — opens WhatsApp directly

### US-019 — Nosotros Page
As a prospective buyer, I want to learn about Wings' credentials and operational presence so that I trust the company before submitting my information.

**Acceptance criteria:**
- `/nosotros` page: company description, free zone credentials (ZOFRATACNA + ZOFRI with map or visual), source markets, markets served, brief team context (no photos required for MVP)
- Page follows navy/warm-white section alternation

### US-020 — Contacto Page
As a visitor who wants to contact Wings directly, I want a contact page with direct channels so that I do not have to submit a formal inquiry.

**Acceptance criteria:**
- `/contacto`: WhatsApp button (deep link), email address, office locations (Tacna + Iquique)
- Simple contact form (name, email, message) that creates a `leads` record with `flow: 'contact'`
