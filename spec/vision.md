# Wings Global Trade — Product Vision

## Product Identity

**Name:** Wings Global Trade
**Tagline:** Precision. Proximity. Trust.
**Domain (assumed):** wingsglobaltrade.com
**Language:** Spanish-first. All UI copy in Spanish. Backend field names in English.
**Current date of spec:** 2026-06-17

---

## What This Is

Wings Global Trade is a B2B trade intelligence and inquiry platform for Latin American importers. It surfaces curated inventory across heavy machinery, commercial vehicles, and industrial equipment — and offers a managed free zone import service (Accio Engine) for buyers who need custom sourcing at volume.

It is not an e-commerce platform. No cart. No checkout. No payment processing.

The platform has one job: convert a qualified visitor into a documented, actionable lead — delivered to Wings ops via WhatsApp and email within seconds of submission.

---

## The Two Business Models

### Model 1 — Catalog (Standard Trade)

Wings maintains a curated inventory across five categories:

| Category | Source Markets |
|----------|---------------|
| Agricultural machinery | China, Thailand |
| Trucks and commercial vehicles | China, Japan |
| Buses | China, Japan |
| Industrial equipment | China, Dubai |
| Spare parts | China, Dubai, Thailand |

Buyers browse the catalog, select products and quantities, and submit an inquiry. Wings ops receive the lead and follow up directly.

The catalog is not a live stock feed. It is a structured product directory with Wings-curated specs, images, and reference pricing. Stock availability is confirmed manually post-inquiry.

### Model 2 — Accio Engine (Managed Free Zone Import)

Wings operates through two free trade zones:
- **ZOFRATACNA** — Tacna, Peru
- **ZOFRI** — Iquique, Chile

Resellers and wholesalers with specific, high-volume import needs engage the Accio Engine. The AI chat collects a Technical Product Requirement (TPR) — a structured brief covering specs, quantity, certifications, packaging, destination market, and target price.

The engine calculates an estimated CIF (Cost, Insurance, Freight) price and customs duty estimate via the free zone corridor, then packages the TPR as a qualified lead brief.

Wings handles end-to-end: sourcing, freight, customs clearance, free zone processing, and last-mile coordination.

---

## Positioning

**Who Wings is not competing with:**
- Alibaba / Global Sources (raw sourcing directories — too unfiltered, no Latin American context)
- Local importers operating on relationships — Wings offers the digital front door they lack

**What Wings uniquely offers:**
- Pre-vetted product catalog with real source markets (not generic)
- Free zone infrastructure that reduces landed cost by 15–40% vs. standard import
- Human follow-up within 24 hours
- Spanish-language experience designed for LATAM buyers

---

## Target Markets

Primary: Peru, Chile
Secondary: Colombia, Panama, Costa Rica, Bolivia, Dominican Republic
Horizon: Broader LATAM

---

## User Personas

### Persona A — The Catalog Buyer

**Who:** Peruvian or Chilean SME owner or purchasing manager. Importing agricultural machinery or trucks for their own operation or resale. Has a specific product type in mind but needs specs and pricing before committing to an inquiry.

**Behavior:** Lands on homepage, scans categories, clicks through to a product. Reads specs. Submits an inquiry with quantity and destination.

**What they need from the platform:**
- Clear product specs and source market transparency
- Simple inquiry form — no account required
- Fast acknowledgment that their inquiry was received
- Trust signals: free zone credentials, markets served, company presence

**Conversion action:** Submits catalog inquiry form.

### Persona B — The Free Zone Reseller

**Who:** Wholesaler, distributor, or trading company in Peru, Chile, or Colombia. Importing at volume — 20+ units or container loads. Has specific technical requirements, certifications, or packaging specs. Knows what they want but needs a sourcing partner with free zone access and logistics capability.

**Behavior:** Arrives via referral or targeted search. Immediately recognizes the Accio Engine as their path. Engages the AI chat, provides detailed TPR. Wants a CIF estimate before committing to a conversation with Wings.

**What they need from the platform:**
- AI that understands trade terminology (HS codes, CIF, FOB, incoterms)
- Real-time CIF and duty estimate — even if preliminary
- Structured output they can share with their finance team
- Confidence that Wings has free zone operational reality, not just marketing

**Conversion action:** Completes Accio Engine TPR and receives estimate.

---

## North Star Metric

**Inquiry conversion rate:** qualified submissions / unique visitors

This is the single metric everything is optimized for. A visitor who reads product specs but does not submit is not a conversion. A visitor who completes the Accio Engine flow and receives a CIF estimate is a conversion regardless of whether they proceed.

Secondary: Lead quality score (TPR completeness percentage for Accio leads).

---

## Success Definition

The platform is successful when:

1. A buyer can arrive on the homepage, find their entry point, and submit a qualified inquiry in under 4 minutes — without speaking to anyone.
2. Wings ops receive a WhatsApp message and email with full lead details within 30 seconds of submission.
3. The Accio Engine collects a TPR complete enough that Wings can source the product without a follow-up clarification call.
4. The catalog communicates enough technical detail that buyers self-qualify before submitting.

---

## What This Platform Explicitly Does Not Do (MVP Scope)

- No user accounts or buyer authentication
- No live inventory management or stock tracking
- No payment processing or pricing commitments
- No admin dashboard (Supabase table + notifications only)
- No multi-language toggle (Spanish-first, English metadata for SEO)
- No shipping tracking or order management post-inquiry
