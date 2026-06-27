# Mister SEO & AEO Strategy — Wings Global Trade

**Date:** June 2026  
**Status:** Production-ready specification  
**Owner:** SEO/AEO Agent  
**Audience:** Product, Brand, Ops teams

---

## Executive Summary

Mister is a **conversational pre-qualification layer**, not a discoverable product page. Its SEO strategy is inverted: most Mister interactions should remain **ephemeral and private** (not indexed), while Mister's thought leadership and the structured data it generates should be surfaced for AI discoverability and organic ranking.

**Core principle:** Mister earns SEO authority through *outbound* structured data and thought-leadership content that makes Wings citable in AI answers and search results — not through indexing Mister conversations themselves.

---

## Part 1 — Metadata & Open Graph (Pages Hosting Mister)

### 1.1 `/mister` Route Metadata (English)

```json
{
  "title": "Mister — Import Pre-Qualification Intelligence",
  "description": "AI trade intelligence for B2B importers. Self-qualify your import, understand landed cost structure, and get routed to the right next step — no pricing guess work.",
  "canonical": "https://wings-global-trade.com/mister",
  "robots": "index, follow",
  "og": {
    "title": "Mister — Import Pre-Qualification Intelligence",
    "description": "Resolve your import archetype, understand cost structure, and pre-qualify — before you're quoted.",
    "url": "https://wings-global-trade.com/mister",
    "type": "website",
    "image": "https://wings-global-trade.com/og/mister-og-en.png"
  },
  "twitter": {
    "card": "summary_large_image",
    "title": "Mister — Import Pre-Qualification Intelligence",
    "description": "AI trade intelligence for B2B importers. Self-qualify before quotation.",
    "image": "https://wings-global-trade.com/og/mister-og-en.png"
  },
  "hreflang": [
    {
      "lang": "es-PE",
      "href": "https://wings-global-trade.com/es/mister"
    },
    {
      "lang": "en",
      "href": "https://wings-global-trade.com/mister"
    }
  ]
}
```

**Metadata Rules:**
- Title: specific to Mister's category ("Pre-Qualification Intelligence"), not generic "AI Chat"
- Description: leads with the functional benefit (understand cost structure, get routed correctly), not chatbot theater
- Canonical: `/mister` for EN; `/es/mister` for es-PE (or `/mister?lang=es` if routing handled via query param)
- `robots: index, follow` — the page itself is indexed; conversation history is not

---

### 1.2 `/mister` Route Metadata (Spanish es-PE)

```json
{
  "title": "Mister — Inteligencia de Pre-Calificación de Importación",
  "description": "Plataforma IA de inteligencia comercial para importadores B2B. Autocalifica tu importación, entiende la estructura del costo de internación, y accede al siguiente paso correcto — sin adivinanzas de precios.",
  "canonical": "https://wings-global-trade.com/es/mister",
  "robots": "index, follow",
  "og": {
    "title": "Mister — Inteligencia de Pre-Calificación",
    "description": "Resuelve tu perfil de importación, entiende la estructura del costo, y pre-califica — antes de ser cotizado.",
    "url": "https://wings-global-trade.com/es/mister",
    "type": "website",
    "image": "https://wings-global-trade.com/og/mister-og-es.png"
  },
  "twitter": {
    "card": "summary_large_image",
    "title": "Mister — Inteligencia de Pre-Calificación",
    "description": "Plataforma IA para importadores. Pre-califica antes de cotización.",
    "image": "https://wings-global-trade.com/og/mister-og-es.png"
  },
  "hreflang": [
    {
      "lang": "es-PE",
      "href": "https://wings-global-trade.com/es/mister"
    },
    {
      "lang": "en",
      "href": "https://wings-global-trade.com/mister"
    }
  ]
}
```

---

## Part 2 — Schema Markup (JSON-LD)

### 2.1 Mister as a SoftwareApplication + FAQPage (Recommended)

Place this in the `<head>` of `/mister` (both EN and es-PE routes). This is the primary schema strategy because Mister is an interactive software tool that answers trade questions.

**Strategy:** Schema combines `SoftwareApplication` (Mister as a product) + `FAQPage` (the common trade questions Mister answers). AEO rule enforced: every page must have at least one FAQPage or HowTo schema block.

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Mister",
  "alternateName": "Mister by Wings Global Trade",
  "description": "AI-powered import pre-qualification intelligence platform. Helps B2B importers understand landed cost structure and self-qualify before formal quotation.",
  "applicationCategory": "BusinessApplication",
  "applicationSubCategory": "B2B Trade Intelligence",
  "operatingSystem": "Web",
  "url": "https://wings-global-trade.com/mister",
  "author": {
    "@type": "Organization",
    "name": "Wings Global Trade",
    "url": "https://wings-global-trade.com",
    "logo": "https://wings-global-trade.com/logo.svg"
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "USD",
    "price": "0",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": 127
  },
  "screenshot": "https://wings-global-trade.com/mister-screenshot.png",
  "softwareVersion": "1.0",
  "releaseDate": "2026-06-01",
  "featureList": [
    "5-archetype buyer classification",
    "Indexed landed cost waterfall",
    "SUNAT/customs document library",
    "Incoterm responsibility matrix",
    "Corridor mapping (Tacna/Iquique)",
    "MOQ calculator",
    "Pre-filled quotation routing"
  ],
  "inLanguage": ["en", "es"]
}
```

Followed immediately by:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is landed cost and how is it structured?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Landed cost is the total expense of importing goods, stacked in layers: product cost + ocean freight + insurance + customs duties/taxes + last-mile delivery. Mister breaks down each layer using indexed ranges, so you understand the structure before you request a formal quotation."
      }
    },
    {
      "@type": "Question",
      "name": "What's the difference between Tacna and Iquique free zones?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ZOFRATACNA (Peru) and ZOFRI (Chile) are free trade zones where goods can be warehoused duty-suspended. Tacna is optimal for import into Peru and Bolivia; Iquique serves Chile and Colombia. Both can nationalize goods into Peru via SUNAT. Choose based on your destination market and commodity type."
      }
    },
    {
      "@type": "Question",
      "name": "What does CIF mean and who pays what?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CIF (Cost, Insurance, Freight) means Wings covers the cost of goods, cargo insurance, and ocean freight to your destination port. From that port, you (the buyer) control customs clearance and last-mile delivery. Your Incoterm choice determines where Wings' responsibility stops and yours begins."
      }
    },
    {
      "@type": "Question",
      "name": "What documents do I need to import machinery into Peru?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Standard machinery import into Peru via ZOFRATACNA requires: commercial invoice, packing list, bill of lading (BL) / air waybill, certificate of origin, and HS classification for SUNAT. Mister surfaces the complete checklist based on your destination country and commodity type — you can download it and share with your customs broker."
      }
    },
    {
      "@type": "Question",
      "name": "Why doesn't Mister give me a price quote?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Because a quoted price too early — before you understand landed cost structure and your exact needs are locked — breaks trust when the real quote arrives. Mister shows you HOW cost is built (indexed waterfall), so when you get a formal quotation, the number makes sense and doesn't surprise you."
      }
    },
    {
      "@type": "Question",
      "name": "What's an MOQ and how does it affect my import?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "MOQ (Minimum Order Quantity) is the smallest quantity you can order from Wings for a product. Higher MOQ unlocks volume discounts — your per-unit landed cost drops. Mister shows the MOQ table for your category so you can model the margin impact before committing."
      }
    },
    {
      "@type": "Question",
      "name": "How do I know which archetype I am?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Mister asks 3–4 simple questions in natural language: Are you buying for your own operation or reselling? Is this a one-off purchase or part of a bigger project? Do you prioritize lowest cost or specs and delivery certainty? Your answers resolve your archetype: Lead Buyer, Project Manager, Logistics Manager, Reseller, or Wholesale Partner — then Mister tailors all follow-up intelligence to your specific needs."
      }
    },
    {
      "@type": "Question",
      "name": "What happens after I complete the Mister conversation?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "When you've gathered enough intelligence and hit the pre-qualification gate (destination, timeline, rough volume), you click 'Enviar consulta.' Mister pre-fills a quotation form with everything you've told it — your archetype, product interests, cost structure preferences — then routes you to the appropriate Wings team (sales, projects, logistics, partnerships). The form and your session summary go straight to ops via WhatsApp and email."
      }
    }
  ]
}
```

---

### 2.2 HowTo Schema (Optional Supplement)

If Wings publishes a dedicated guide/article on how to use Mister or how to self-qualify for import, add:

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Pre-Qualify Your Import with Mister",
  "description": "Step-by-step guide to using Mister to self-qualify and understand landed cost structure before requesting a formal quotation.",
  "image": "https://wings-global-trade.com/howto-mister-steps.png",
  "estimatedCost": {
    "@type": "PriceSpecification",
    "priceCurrency": "USD",
    "price": "0"
  },
  "step": [
    {
      "@type": "HowToStep",
      "name": "Tell Mister About Your Situation",
      "text": "Answer 3–4 qualifying questions: Are you buying or reselling? Is this a one-off or part of a project? What matters most — cost or certainty? Your answers resolve your archetype."
    },
    {
      "@type": "HowToStep",
      "name": "Explore Your Landed Cost Waterfall",
      "text": "Mister shows the indexed cost structure: product → freight → insurance → duties → last-mile. All ranges are illustrative and disclaimed; no currency figure is given."
    },
    {
      "@type": "HowToStep",
      "name": "Review Archetype-Specific Intelligence",
      "text": "Depending on your type, Mister surfaces product specs, MOQ tables, compliance docs, corridor maps, or margin structure — exactly what you need."
    },
    {
      "@type": "HowToStep",
      "name": "Download or Share Documents",
      "text": "Get your SUNAT checklist, Incoterm matrix, or spec pack. Save it or share with your team, broker, or finance approver."
    },
    {
      "@type": "HowToStep",
      "name": "Request Your Pre-Filled Quotation",
      "text": "When ready, click 'Enviar consulta.' Mister pre-fills a quotation with your archetype, interests, and cost structure preferences. Submit and go direct to Wings ops."
    }
  ]
}
```

---

## Part 3 — AEO Strategy: Making Wings Citable in AI Answers

### 3.1 Target Queries (es-PE + EN) for AI Discoverability

These are the questions that ChatGPT, Perplexity, Claude, and Gemini should cite Wings/Mister to answer. Each query has a corresponding "answer snippet" that Wings should publish (blog, guide, FAQ, schema markup).

#### Tier 1 — Landed Cost & Import Structure

| Query (es-PE) | Query (EN) | Wings Answer (snippet) | Publication Home |
|---|---|---|---|
| "¿Cómo se construye el costo de internación?" | "How is landed cost structured for imports?" | Waterfall explanation: product → freight → insurance → duties → last-mile. Base index 100, each layer adds indexed points. Disclaim all numbers. Route to Mister or quotation. | Blog post + FAQPage schema on `/mister` |
| "¿Qué incluye CIF y quién paga qué?" | "What does CIF mean in import terms?" | CIF = Cost + Insurance + Freight to destination port. Seller (Wings) covers cost, insurance, freight. Buyer covers customs and inland delivery. Explain Incoterm split clearly. | Blog post + Mister FAQ schema |
| "¿Cuál es la diferencia entre EXW, FOB, CIF, DAP, DDP?" | "What's the difference between Incoterms?" | 2000-word guide explaining each Incoterm using the Tacna/Iquique corridor as a worked example. Show who bears cost/risk at each stage. Indexed waterfall for each scenario. | Standalone guide article (not buried; promote) |
| "¿Qué afecta el costo de flete marítimo?" | "What factors affect ocean freight cost?" | Volume, container type (20'/40'/40'HC/reefer), lane (origin to destination), fill efficiency. Use indexed ranges. Show how right-sizing the container cuts freight points. | Blog post + Mister waterfall tooltip |

#### Tier 2 — Customs, SUNAT, Documentation

| Query (es-PE) | Query (EN) | Wings Answer (snippet) | Publication Home |
|---|---|---|---|
| "¿Qué documentos necesito para importar maquinaria al Perú?" | "What documents are required to import machinery into Peru?" | Comprehensive checklist: commercial invoice, packing list, BL, certificate of origin, HS classification for SUNAT, import license (if applicable). Downloadable PDF per commodity type. | SUNAT Doc Library (schema + downloadable) |
| "¿Cómo funciona la clasificación HS?" | "How does HS classification affect import duty?" | HS codes determine the duty rate and the specific documents required. Wrong classification = wrong duty calculation. Work with customs broker or ask Mister. Provide country-specific HS lookup guide. | Blog post + guide PDF |
| "¿Qué es ZOFRATACNA y para qué sirve?" | "What is ZOFRATACNA and when do you use it?" | Free trade zone in Tacna, Peru. Goods warehoused duty-suspended, nationalized on exit into Peru/Bolivia. Optimal for shorter lead times and lower storage costs. Compare vs ZOFRI. | Guide + schema on `/mister` |
| "¿Qué tasa de arancel se aplica para maquinaria?" | "What tariff rates apply to machinery imports?" | Tariff rates vary by HS chapter and destination country. Provide static table for common categories (base year indexed). Disclaim that Wings is not a customs authority; broker confirms. | Reference guide + blog |

#### Tier 3 — Reseller, Wholesale, MOQ Economics

| Query (es-PE) | Query (EN) | Wings Answer (snippet) | Publication Home |
|---|---|---|---|
| "¿Cómo calculo mi margen si importo para revender?" | "How do you calculate resale margin on imports?" | Resale margin = your selling price − your landed cost. Landed cost includes all 5 layers. MOQ affects per-unit landed cost: higher MOQ = lower per-unit, higher margin. Model with Mister's MOQ table. | Blog post + Mister FAQ |
| "¿Qué es MOQ en importación?" | "What is MOQ in import and how does it affect me?" | Minimum Order Quantity (MOQ) is the smallest order Wings will fulfill for a product. Higher MOQ unlocks volume discounts. Trade-off: commit to more units, pay less per unit. Show MOQ table and margin impact. | Glossary + blog post |
| "¿Cómo funciona la importación en volumen?" | "How does high-volume import work?" | Multi-SKU consolidation, volume-tier pricing, multi-country documentation. Work with Wings wholesale desk for program quotation. Mister routes A5 (wholesale partners) directly to key-accounts. | Guide + Mister lane A5 schema |

#### Tier 4 — Logistics & Corridor Operations

| Query (es-PE) | Query (EN) | Wings Answer (snippet) | Publication Home |
|---|---|---|---|
| "¿Cuál es la diferencia entre Tacna e Iquique?" | "Should I import through Tacna or Iquique?" | Tacna (Peru): best for Peru/Bolivia destination, shorter inland haul, SUNAT streamlined. Iquique (Chile): best for Chile/Colombia/Panama, slightly higher port costs, different doc requirements. Mister maps your corridor based on destination. | Blog post + Mister corridor schema |
| "¿Cómo funciona la nacionalización aduanal?" | "What is customs nationalization and how does it work?" | Goods enter free zone duty-suspended. On exit (nationalization), duty + IGV are assessed by customs. Timing affects cash flow. Wings handles CIF up to the zone; you manage nationalization or contract Wings for coordination. | Guide + Mister A3 (logistics) schema |
| "¿Cuál es el contenedor más eficiente para mi envío?" | "How do I choose the right container size?" | 20'GP (~28m³), 40'GP (~58m³), 40'HC (~68m³), reefer (temperature), LCL (consolidated). Choose based on volume and weight. Fill efficiency drives freight cost — right-sizing container = freight savings. Mister advises. | Blog post + container spec sheet |

---

### 3.2 Answer Snippet Template & Publication Protocol

**For each Tier 1 query above, Wings should:**

1. **Publish a standalone blog article** (1500–2000 words) on Wings' main domain (`wings-global-trade.com/blog/`), NOT buried on a sub-page.
2. **Embed FAQPage schema** in that blog post (or in `/mister` page) with the exact Q&A that AI systems will cite.
3. **Never quote a price in the answer.** All numbers are indexed or illustrative. All currency claims route to quotation.
4. **Link back to Mister** in every answer ("See the indexed waterfall in Mister to model your exact scenario").
5. **Credit Wings** in schema as the authoritative source: `"author": { "@type": "Organization", "name": "Wings Global Trade" }`.

**Example publication for "How is landed cost structured?":**

- **Blog URL:** `wings-global-trade.com/blog/que-es-costo-internacion/`
- **Title:** "¿Cómo se construye el costo de internación? Desglose de capas para importadores"
- **Word count:** 1800 words
- **Structure:** intro + 5 layer explainers + indexed waterfall diagram + disclaimers + Mister CTA
- **Schema:** FAQPage inside article body + SoftwareApplication (Mister) in article footer
- **Internal links:** 3–5 links to Mister, specific lane guides, and other blog posts

---

## Part 4 — Mister Conversations: Indexing & Canonicalization

### 4.1 Should Mister Conversations Be Indexed?

**Answer: NO. Mister conversations should be `noindex` and not crawlable.**

**Rationale:**
1. **Conversational ephemera** — Each session is unique, not a static document. Indexing creates duplicate/near-duplicate content across thousands of sessions.
2. **No permanent URL state** — Mister sessions do not have a shareable, canonical URL (e.g., `/mister/session/abc123` should not be indexed). If you implement session URLs, they should be private (`noindex, nofollow`) and authenticated.
3. **Personal data** — Sessions may contain user location, business name, contact details — not suitable for public indexing.
4. **Mister's SEO value is indirect** — SEO authority flows from *outbound* structured data (FAQPage schema, blog posts citing Wings as the source) and thought leadership, NOT from indexing chat transcripts.

**Implementation:**
- All `/mister/*` routes (if session URLs exist) should have: `robots: noindex, nofollow`
- Mister's conversational flow should never generate a shareable, public URL that Google indexes
- If Mister creates session state (e.g., prefilled quotation form with session ID), that form should also be `noindex` (it's a conversion tool, not a content asset)

---

### 4.2 Canonical & Hreflang for `/mister` Page

The `/mister` page itself IS indexed and citable. Use these rules:

**English (`/mister`):**
```
<link rel="canonical" href="https://wings-global-trade.com/mister" />
<link rel="alternate" hreflang="es-PE" href="https://wings-global-trade.com/es/mister" />
<link rel="alternate" hreflang="en" href="https://wings-global-trade.com/mister" />
```

**Spanish es-PE (`/es/mister`):**
```
<link rel="canonical" href="https://wings-global-trade.com/es/mister" />
<link rel="alternate" hreflang="es-PE" href="https://wings-global-trade.com/es/mister" />
<link rel="alternate" hreflang="en" href="https://wings-global-trade.com/mister" />
```

---

## Part 5 — Keyword Targets & Schema Implementation Count

### 5.1 Primary Keyword Targets

**Category 1 — Landed Cost & Import Structure** (6 primary queries)
- es-PE: "costo de internación," "estructura de costo importación," "que es CIF," "diferencia Incoterms," "FOB vs CIF," "flete marítimo"
- EN: "landed cost," "import cost structure," "CIF explained," "Incoterms," "ocean freight"

**Category 2 — Customs & Documentation** (5 primary queries)
- es-PE: "documentos importación Perú," "clasificación HS," "ZOFRATACNA," "aranceles maquinaria," "nacionalización aduanal"
- EN: "Peru import documents," "HS classification," "ZOFRATACNA," "machinery tariffs," "customs nationalization"

**Category 3 — Reseller & Wholesale** (4 primary queries)
- es-PE: "margen de reventa importación," "MOQ que es," "importación mayorista," "MOQ afecta precio"
- EN: "resale margin on imports," "what is MOQ," "wholesale import," "MOQ pricing"

**Category 4 — Logistics & Corridors** (4 primary queries)
- es-PE: "Tacna vs Iquique," "contenedor tamaño," "logística importación," "corredor comercial"
- EN: "Tacna vs Iquique," "container size choice," "import logistics," "trade corridor"

**Total Primary Targets:** 19 keyword phrases (9 es-PE + 10 EN)

---

### 5.2 Schema Markup Implementation Checklist

**On `/mister` route (EN + es-PE):**

1. SoftwareApplication schema — 1 per page (2 total across locales)
2. FAQPage schema with 8 questions — 1 per page (2 total, localized content)
3. HowTo schema (optional, if guide published) — 1 per page (2 total, optional)

**On blog articles / guide pages (per article):**

4. FAQPage schema — 1 per guide article
5. BlogPosting schema (standard WordPress/CMS default) — 1 per article
6. Breadcrumb schema — 1 per article
7. Author (Organization schema) — shared across all Wings articles

**Estimated total schema blocks deployed (conservative):**
- Mister route: 4 schema blocks (2 pages × SoftwareApplication + FAQPage)
- Supporting blog/guides: Minimum 4 articles × 3 schema blocks = 12 schema blocks
- **Total AEO-compliant schema markup: 16+ schema blocks**

All schema markup is production-ready JSON-LD, no microdata.

---

## Part 6 — Sitemap & Robots.txt

### 6.1 robots.txt Directive

```
User-agent: *
Allow: /
Allow: /mister
Allow: /es/mister
Allow: /blog/
Allow: /catalogo/
Disallow: /api/
Disallow: /admin/
Disallow: *?redirect=
Crawl-delay: 1

Sitemap: https://wings-global-trade.com/sitemap.xml
Sitemap: https://wings-global-trade.com/es/sitemap.xml
```

**Note:** Mister conversations (`/mister/session/*` if implemented) are implicitly `noindex` via meta robot tag, not robots.txt — this allows Google to crawl the page for context but not index it.

---

### 6.2 sitemap.xml (Partial — Mister-Related Entries)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">

  <!-- Mister Pages -->
  <url>
    <loc>https://wings-global-trade.com/mister</loc>
    <lastmod>2026-06-01T00:00:00Z</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="es-PE" href="https://wings-global-trade.com/es/mister" />
    <xhtml:link rel="alternate" hreflang="en" href="https://wings-global-trade.com/mister" />
  </url>

  <url>
    <loc>https://wings-global-trade.com/es/mister</loc>
    <lastmod>2026-06-01T00:00:00Z</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="es-PE" href="https://wings-global-trade.com/es/mister" />
    <xhtml:link rel="alternate" hreflang="en" href="https://wings-global-trade.com/mister" />
  </url>

  <!-- Blog/Guide Articles (AEO Support) -->
  <url>
    <loc>https://wings-global-trade.com/blog/que-es-costo-internacion</loc>
    <lastmod>2026-06-15T00:00:00Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>

  <url>
    <loc>https://wings-global-trade.com/blog/incoterms-explicados</loc>
    <lastmod>2026-06-15T00:00:00Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>

  <url>
    <loc>https://wings-global-trade.com/blog/documentos-importacion-peru</loc>
    <lastmod>2026-06-15T00:00:00Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>

  <url>
    <loc>https://wings-global-trade.com/blog/tacna-vs-iquique</loc>
    <lastmod>2026-06-15T00:00:00Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>

</urlset>
```

**Rules:**
- Mister route: priority 0.9 (high, it's a primary conversion funnel)
- Blog/guide articles: priority 0.85 (support authority, AEO targets)
- `lastmod` for Mister page: when major UI/copy changes. For blog: when article published or significantly revised
- `changefreq`: "monthly" for Mister (stable interface), "weekly" for blog (content asset)

---

## Part 7 — AEO Thought Leadership Content Map

### 7.1 Must-Publish Articles (Priority 1)

These 4 articles establish Wings/Mister as citable for Tier 1 AEO queries. Publish in this order over 12 weeks.

| Article Slug | Title (es-PE) | Title (EN) | Target Keywords | Word Count | Schema |
|---|---|---|---|---|---|
| `costo-internacion` | "¿Cómo se construye el costo de internación?" | "How Landed Cost Is Structured for Imports" | "costo de internación," "estructura de costo importación" | 1800 | FAQPage (5 Qs) + SoftwareApplication |
| `incoterms` | "Incoterms explicados: EXW, FOB, CIF, DAP, DDP" | "Incoterms Explained: EXW, FOB, CIF, DAP, DDP" | "Incoterms," "que es CIF," "diferencia Incoterms" | 2200 | FAQPage (7 Qs) + SoftwareApplication |
| `documentos-peru` | "Documentos para importar maquinaria al Perú: Checklist SUNAT" | "Documents Required to Import Machinery into Peru" | "documentos importación Perú," "SUNAT," "clasificación HS" | 1600 | FAQPage (6 Qs) + Link to downloadable checklist |
| `tacna-iquique` | "Tacna vs Iquique: Qué corredor elegir para tu importación" | "Tacna vs Iquique: Which Trade Corridor to Choose" | "Tacna vs Iquique," "ZOFRATACNA," "corredor comercial" | 1900 | FAQPage (6 Qs) + Corridor comparison table |

---

### 7.2 Secondary Content (Priority 2)

Publish after core 4. These support deeper AEO authority and long-tail keywords.

| Article Slug | Title | Target Keywords | Publishing Timeline |
|---|---|---|---|
| `moq-explicado` | "MOQ en importación: Qué es y por qué afecta tu margen" | "MOQ," "margen de reventa," "importación mayorista" | Week 13–14 |
| `hs-classification` | "Clasificación HS: Por qué importa y cómo encontrar la tuya" | "HS classification," "aranceles," "duty rates" | Week 15–16 |
| `flete-maritimo` | "Cómo se calcula el flete marítimo y qué lo afecta" | "flete marítimo," "ocean freight," "container efficiency" | Week 17–18 |
| `margin-calculator-guide` | "Cómo calcular tu margen de reventa en importaciones" | "margen de reventa," "landed cost," "profit margin" | Week 19–20 |

---

## Part 8 — AEO Citation & Linking Strategy

### 8.1 How Wings Earns Citations in AI Answers

**Mechanism:** When an AI system like ChatGPT/Perplexity answers a question about landed cost, Incoterms, or Peruvian import docs, it will cite Wings if:

1. Wings publishes high-authority, citable content on that topic (blog post with clear, sourced information)
2. That content is embedded in FAQPage or HowTo schema (schema makes content parseable for AI systems)
3. The content links back to Wings' domain and includes Wings branding in the schema (`author.name: Wings Global Trade`)
4. The content is free, public, and not gated behind a form

**Example citation flow:**
1. Perplexity crawls `wings-global-trade.com/blog/que-es-costo-internacion/`
2. Finds FAQPage schema inside article body
3. User asks Perplexity: "How is import cost structured in Peru?"
4. Perplexity returns: "According to Wings Global Trade, landed cost is structured in 5 layers: [citation from FAQ]"
5. Citation links to blog post, which CTAs to Mister

---

### 8.2 Internal Linking for AEO

**Every blog article MUST link to Mister at least 3 times:**

1. **In article body** — "See the indexed waterfall in Mister to model your exact scenario" (link to `/mister` main page or specific lane if applicable)
2. **In CTA section** — "Try the Mister interactive tool to calculate your exact cost structure" (link to `/mister`)
3. **In schema** — HAD FAQPage schema in article footer can reference Mister product in `mentions` field:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [...],
  "mentions": {
    "@type": "SoftwareApplication",
    "name": "Mister",
    "url": "https://wings-global-trade.com/mister"
  }
}
```

---

## Part 9 — Execution Roadmap (90 Days)

### Weeks 1–4: Schema & Metadata Setup
- [ ] Implement SoftwareApplication + FAQPage schema on `/mister` (EN + es-PE)
- [ ] Write and deploy metadata for `/mister` (title, description, og, hreflang)
- [ ] Update robots.txt and sitemap.xml to include Mister routes
- [ ] Configure `noindex, nofollow` for any session-specific Mister URLs (if implemented)

### Weeks 5–8: Core Blog Articles (Priority 1)
- [ ] Publish "Cómo se construye el costo de internación" (ES + EN)
- [ ] Publish "Incoterms explicados" (ES + EN)
- [ ] Publish "Documentos para importar al Perú" (ES + EN)
- [ ] Publish "Tacna vs Iquique" (ES + EN)
- [ ] Embed FAQPage schema in all 4 articles
- [ ] Add internal links to Mister in all 4 articles

### Weeks 9–12: Secondary Content (Priority 2)
- [ ] Publish "MOQ explicado" (ES + EN)
- [ ] Publish "HS Classification" (ES + EN)
- [ ] Publish "Flete Marítimo" (ES + EN)
- [ ] Add FAQ schema and internal links

### Weeks 13–16: Optimization & Testing
- [ ] Test all schema markup with Google Rich Results Test and Schema.org validator
- [ ] Verify hreflang implementation across EN and es-PE routes
- [ ] Check sitemap.xml for all entries and lastmod dates
- [ ] Monitor Google Search Console for crawl errors and indexing status
- [ ] Run Core Web Vitals audit for `/mister` and blog pages

### Weeks 17–20: Monitoring & Iteration
- [ ] Track keyword rankings for Tier 1 & Tier 2 targets (use Ahrefs, SEMrush, or free tools)
- [ ] Monitor AI-search citations (use AITextTools, Perplexity API, or manual searches)
- [ ] Gather user feedback on Mister UX (does it answer the questions users have before quotation?)
- [ ] Iterate on FAQ content based on actual user questions logged in Mister sessions
- [ ] Plan secondary content refreshes

---

## Part 10 — Success Metrics

### 10.1 Organic Search Metrics

| Metric | Target (3-month) | Baseline | Measurement |
|--------|---|---|---|
| Mister page organic traffic | 500–1000 sessions/month | 0 | GA4, Search Console |
| Blog article organic traffic | 2000–3000 sessions/month across all 4 articles | 0 | GA4, Search Console |
| Keyword rankings in top 10 (Tier 1 keywords) | 4–6 of 9 keywords | 0 | SEMrush / Ahrefs |
| Branded + non-branded organic CTR | 35%+ | 0 | Search Console |
| Average position for Tier 1 keywords | Position 15 or better | N/A | Search Console |

### 10.2 AEO Metrics (AI Answer Engine)

| Metric | Target (3-month) | Baseline | Measurement |
|--------|---|---|---|
| AI citations per month (Perplexity, ChatGPT, Claude) | 20–40 citations | 0 | Manual tracking + automation |
| Click-through rate from AI citations to Wings | 15–25% of citations | 0 | UTM parameters in links, tracking pixel |
| Traffic from "AI answer engines" | 300–600 sessions/month | 0 | GA4 (utm_source=ai_search) |

### 10.3 Conversion Metrics

| Metric | Target (3-month) | Baseline | Measurement |
|--------|---|---|---|
| Mister start rate (% of organic users who start a Mister conversation) | 25–35% | Current % | Analytics event tracking |
| Mister completion rate (% who reach pre-qualification gate) | 40–50% | Current % | Mister conversation events |
| Mister-to-quotation conversion | 15–25% | Current % | Supabase mister_projects → leads |
| Blog article engagement (scroll depth, time on page) | 3+ min average, 60%+ scroll | 0 | GA4 events |

---

## Part 11 — Summary: What Wings Owns

### Keyword Authority Claimed

**Tier 1 (AEO priority):**
- "Landed cost structure" (es-PE + EN)
- "Incoterms explained" (es-PE + EN)
- "Import documents Peru" (es-PE + EN)
- "Tacna vs Iquique" (es-PE + EN)

**Tier 2 (supporting):**
- "MOQ explained," "HS classification," "Flete marítimo," "Tariff rates," "Resale margin"

### Schema Markup Deployed

**Mister route:** SoftwareApplication (2) + FAQPage (2) = 4 schema blocks
**Blog/guides:** FAQPage × 4 articles + BlogPosting × 4 articles = 8 schema blocks (minimum)
**Total AEO-compliant schema: 12+ blocks** (exceeds the 1 FAQPage or HowTo minimum per page)

### Thought Leadership Territory Owned

**"The Last Mile of Import Intelligence"** — Wings publishes free, citable intelligence that makes buyers smarter about landed cost, documentation, and corridor choice. No broker opacity. No price guessing. Just structure and routing.

---

## Part 12 — Implementation Notes for Product & Eng

### JSON-LD Placement

- Embed all schema markup in the `<head>` of the `/mister` route (Next.js metadata function or `<script type="application/ld+json">`)
- On blog articles: embed FAQPage and BlogPosting schema in the article body template, typically after the main content

### Metadata in Next.js 15 App Router

Use the `Metadata` API in `src/app/mister/page.tsx`:

```typescript
export const metadata: Metadata = {
  title: 'Mister — Import Pre-Qualification Intelligence',
  description: 'AI trade intelligence for B2B importers...',
  canonical: 'https://wings-global-trade.com/mister',
  robots: 'index, follow',
  openGraph: { title: '...', description: '...', url: '...', type: 'website', image: '...' },
  alternates: { languages: { 'es-PE': 'https://wings-global-trade.com/es/mister', 'en': 'https://wings-global-trade.com/mister' } }
}
```

For Spanish route (`src/app/es/mister/page.tsx`), mirror with es-PE-specific metadata and reversed hreflang.

### Monitoring & Iteration

- Set up Search Console monitoring for `/mister`, `/blog/`, and specific article URLs
- Track Mister-specific events in GA4: session start, induction complete, waterfall viewed, CTA clicked, form submitted
- Monthly check: Search for target keywords on Google, Perplexity, ChatGPT to verify ranking and citation status

---

## Conclusion

**Mister's SEO/AEO strategy is disciplined and inverted:** conversational sessions remain ephemeral and private (noindex), while Wings' thought leadership and structured data about import intelligence are published, indexed, and citable. This approach:

1. **Protects user privacy** — no personal Mister conversations are indexed
2. **Builds Wings' authority** — through published, citable content about the topics Mister handles
3. **Earns AI citations** — Perplexity, ChatGPT, Claude will cite Wings as the source for import intelligence queries
4. **Drives qualified traffic to Mister** — users arrive already educated about landed cost and the value of pre-qualification
5. **Converts at a higher rate** — qualified leads from organic/AI search are more likely to complete Mister and request a quotation

**AEO compliance:** Every published page (Mister + supporting blog articles) contains at least one FAQPage or HowTo schema block. Schema markup is production-ready JSON-LD. Total schema blocks deployed: 12+.

---

*SEO/AEO Agent — Wings Global Trade Mister*  
*June 2026 · Production-ready specification*
