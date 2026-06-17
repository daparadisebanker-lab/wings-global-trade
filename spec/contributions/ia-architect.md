# IA Architect Contribution — Wings Global Trade

## Navigation Taxonomy

### Primary Navigation (top-level)

| Label | Route | Notes |
|---|---|---|
| Inicio | / | Logo click = homepage |
| Catálogo | /catalogo | Dropdown on hover/click |
| Motor Accio | /accio | Direct — no dropdown |
| Nosotros | /nosotros | Direct |
| Contacto | /contacto | Direct |
| [Consultar por WhatsApp] | external | CTA button, always rightmost |

### Catalog Dropdown (level 2)

| Label | Route |
|---|---|
| Maquinaria Agrícola | /catalogo/maquinaria-agricola |
| Camiones y Vehículos | /catalogo/camiones-vehiculos |
| Buses | /catalogo/buses |
| Equipamiento Industrial | /catalogo/equipamiento-industrial |
| Repuestos | /catalogo/repuestos |

**Rules:**
- No category-within-category nesting. Flat taxonomy.
- "Motor Accio" is never inside Catálogo — it's a separate navigation item
- Mobile: hamburger reveals same items, Accio gets visual emphasis (gold text or indicator)

---

## URL Structure

```
/                                     Homepage
/catalogo                             All categories (redirect to first or grid view)
/catalogo/maquinaria-agricola         Agricultural machinery grid
/catalogo/camiones-vehiculos          Trucks grid
/catalogo/buses                       Buses grid
/catalogo/equipamiento-industrial     Industrial equipment grid
/catalogo/repuestos                   Spare parts grid
/catalogo/[category]/[slug]           Product detail
/accio                                Accio Engine (chat + TPR)
/nosotros                             About Wings
/contacto                             Contact form
/sitemap.xml                          Auto-generated
/robots.txt                           Auto-generated
```

**Slug convention:** `[brand]-[model]-[variant]` e.g. `new-holland-ch7-cosechadora`, `yuchai-yc6mk-camion-pesado`

Query parameters:
- `/catalogo/[category]?q=[query]` — search pre-filled
- `/accio?context=[query]` — pre-populates Accio opening context

---

## Breadcrumb Logic

Every page except homepage shows breadcrumbs.

```
Homepage:         (no breadcrumb)
Category page:    Inicio > Catálogo > Maquinaria Agrícola
Product detail:   Inicio > Catálogo > Maquinaria Agrícola > CH7 Cosechadora
Accio:            Inicio > Motor Accio
Nosotros:         Inicio > Nosotros
Contacto:         Inicio > Contacto
```

Implementation: `<nav aria-label="breadcrumb">` with `BreadcrumbList` JSON-LD. Separator: `·` (not `/`).

---

## Search and Filter Architecture

### Search Bar (Homepage)

- Single search input, centered in hero or directly below
- Intent detection via `detectSearchIntent()` in `src/lib/routing.ts`
- Routes:
  - Catalog keyword → `/catalogo/[category]?q=[query]`
  - Volume/sourcing keyword → `/accio?context=[query]`
  - HS code (4-8 digits) → `/accio?context=hs:[code]`
  - Ambiguous → `/catalogo?q=[query]` (with Accio CTA)

### Category Page Filters

Order of filters (top → sidebar or horizontal):

| Filter | Type | Options |
|---|---|---|
| Origen | Multi-select checkbox | China · Japón · Tailandia · Dubai |
| Disponibilidad | Single toggle | Disponible · Todo |
| Potencia (maquinaria) | Range slider | 50–400 HP |
| Tonelaje (camiones) | Range slider | 3–50 ton |
| Tipo | Multi-select | Varies by category |

Mobile: filters in collapsible drawer ("Filtrar"). Active filter count shown on button.

**Filter state in URL:** `/catalogo/maquinaria-agricola?origen=china,japon&potencia=80-200`
This ensures shareable, bookmarkable filter states.

---

## Content Hierarchy Per Page

### Homepage
1. Primary: Hero (routing entry point)
2. Primary: Category Grid (routing selector)
3. Secondary: TrustBar (credentials)
4. Secondary: MarketMap (geographic reach)
5. Tertiary: Footer (support + legal)

### Category Page
1. Primary: Product Grid (the content)
2. Secondary: CategoryNav (routing within catalog)
3. Secondary: Filters (refinement)
4. Tertiary: PageHero (context)
5. Tertiary: Accio CTA (alternative flow)

### Product Detail
1. Primary: Product Image Gallery
2. Primary: Product Name + Source Badge
3. Primary: Inquiry Form (conversion)
4. Secondary: Full Specs Table
5. Secondary: Model Variant Selector
6. Tertiary: Related Products (same category, 3 items)
7. Tertiary: "Importar vía Motor Accio" CTA

### Accio Engine
1. Primary: Chat Panel (interaction)
2. Primary: TPR Sheet (output visibility)
3. Secondary: CIF Estimate Card (conversion trigger)
4. Secondary: AccioSubmitForm (conversion)
5. Tertiary: How-it-works sidebar text (first visit only)

---

## Internal Linking Strategy

**Goal:** Every product page links back to its category and to the Accio flow. Every category page links to Accio. Homepage links to all categories.

| From | To | Why |
|---|---|---|
| Product detail | Same-category products (3) | Related discovery |
| Product detail | /accio | Volume sourcing alternative |
| Category page | Other categories (nav) | Cross-category discovery |
| Category page | /accio | Volume sourcing CTA at bottom |
| Homepage | All 5 categories | Direct routing |
| Homepage | /accio | Accio tile |
| Nosotros | /catalogo | After reading about Wings, discover products |
| Nosotros | /accio | After reading about Wings, start sourcing |
| Accio success | /catalogo | Post-submit, explore catalog |
| 404 | /catalogo + /accio | Recovery |

---

## Sitemap Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset>
  <url><loc>https://wingsglobaltrade.com/</loc><priority>1.0</priority></url>
  <url><loc>https://wingsglobaltrade.com/accio</loc><priority>0.9</priority></url>
  <url><loc>https://wingsglobaltrade.com/catalogo/maquinaria-agricola</loc><priority>0.8</priority></url>
  <url><loc>https://wingsglobaltrade.com/catalogo/camiones-vehiculos</loc><priority>0.8</priority></url>
  <url><loc>https://wingsglobaltrade.com/catalogo/buses</loc><priority>0.8</priority></url>
  <url><loc>https://wingsglobaltrade.com/catalogo/equipamiento-industrial</loc><priority>0.8</priority></url>
  <url><loc>https://wingsglobaltrade.com/catalogo/repuestos</loc><priority>0.7</priority></url>
  <!-- Product pages: priority 0.7 each, dynamically generated -->
  <url><loc>https://wingsglobaltrade.com/nosotros</loc><priority>0.5</priority></url>
  <url><loc>https://wingsglobaltrade.com/contacto</loc><priority>0.5</priority></url>
</urlset>
```

---

## Category Classification Rules

| Category | What belongs here | What doesn't |
|---|---|---|
| Maquinaria Agrícola | Cosechadoras, tractores, sembradoras, irrigación, trilladoras | Construction equipment |
| Camiones y Vehículos | Camiones ligeros/pesados, pickups de trabajo, volquetes | Buses, agricultural |
| Buses | Minibuses, buses escolares, buses urbanos, interurbanos | Trucks |
| Equipamiento Industrial | Compresores, generadores, montacargas, grúas, soldadoras | Agricultural machinery |
| Repuestos | Filtros, frenos, motores de reemplazo, neumáticos, correas | No complete machines |

**Rule:** When a product could belong to two categories, classify by primary use case, not by construction similarity. A tractor-based loader goes in Maquinaria Agrícola, not Industrial.
