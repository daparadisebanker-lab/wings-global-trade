# Wings Category Branding Standard

**Status:** ACTIVE · ratified 2026-07-20
**Scope:** `apps/site` catalog (`/catalogo` + `/catalogo/[category]`)
**Outranks:** `docs/`. Subordinate to root `CLAUDE.md` (ecosystem law) and `apps/site/CLAUDE.md`.

---

## 0 · Why this exists

Each category should feel like a **branded space** the way a represented brand
(Áladín, RB/01) does — an identity you enter and remain inside — while the
skeleton stays family-wide and frozen (root §1 "same box, different livery").
This standard ports the represented-brands "branded space" grammar to the
catalog's categories. It is **derived by rule, not by taste**.

The one decision that makes this cheap: **categories keep the family Wings gold
accent.** No per-category hue. So nothing touches the hue registry
(`packages/liveries/registry.md`) or the Phase-2 livery derivation rules, and
the swap test (root §4 QA-6) passes trivially — put any category's content on
any other category's structure and it still works, because only the icon and
the copy differ.

A category's identity is expressed through exactly three derived signals:

1. **Icon motif** — `Category.icon_key` → `CategoryIcon` (existing SVG set).
2. **Subheader copy** — a tagline + a purchase-logic "register" line.
3. **Texture posture** — from the existing hero utility set only (`hero-mesh`,
   `hero-grain`). No new textures.

Everything else (spacing, type scale, grid, gold accent, navy ground, motion
eases) is the frozen skeleton and is identical in every category.

---

## 1 · The identity contract

Authored in `src/lib/category-identity.ts`. Keyed by slug, but
`getCategoryIdentity(category)` **always returns a complete object**, falling
back to the live `Category` row (`name_es`, `description_es`, `icon_key`) so a
new/unauthored category still renders the full branded structure.

```ts
interface CategoryIdentity {
  iconKey: string        // SVG motif (CategoryIcon)
  tagline: string        // subheader line — one sentence, technical, no "!"
  register: string       // the purchase logic: what the buyer negotiates in
  markets: string        // typical source markets, DISPLAY ONLY
  freeZone: 'ZOFRATACNA' | 'ZOFRI'
  texture: 'mesh' | 'grain' | 'mesh-grain'
}
```

**Copy law (inherited from `apps/site/CLAUDE.md`):** Spanish, no exclamation
marks, specific over generic. **Never** an absolute price, availability, or
lead time in any field — the `register`/`tagline` describe *structure* (unit
math, origin, free zone), never a scalar the buyer could mistake for a quote.

---

## 2 · The four organs

All four live under `src/components/features/catalog/` and consume the shared
gold/navy family tokens only.

| Organ | Ports from | Role |
|-------|-----------|------|
| `CategoryReveal` | `BrandReveal` | Entry loading moment: count-up 0→100 → category mark rises from a clip → navy curtain lifts. Gold-on-navy. |
| `CategoryShelfNav` | `BrandShelfNav` | Sticky identity bar under the Wings chrome: back-to-Catálogo + icon + name + **gold scroll-progress line** + subcategory horizontal-scroll nav. |
| `CategoryIntelligence` | (new) | Exhibits the register statement + hard numbers (modelos / origen / subcategorías / zona franca) as tabular-mono brand assets (root §1.5). |
| Hero motif | `WINGS_CATALOG_HERO_STANDARD` | The category hero carries a faint gold icon watermark. |

### Rules of engagement

- **`CategoryReveal` plays once per browser session** (sessionStorage
  `wgt_category_reveal_seen`) and **never mounts under reduced motion.** It is a
  brand *entry* moment, not a per-page tax — this protects the category LCP gate
  (root §4 QA-4: < 2 s on 4G). It renders through a portal on `document.body`,
  same as `BrandReveal`, so it escapes the route transition and fixed header.
- **`CategoryShelfNav` carries the GOLD progress line**, not a per-category
  accent (the only intentional divergence from `BrandShelfNav`, which uses
  `--rb-accent`). It owns subcategory navigation — the standalone subcategory
  `<nav>` and the in-page `CategoryNav` chip row were removed; the shelf's
  `← Catálogo` + the gateway are the single, coherent category-context surface.
- **Filter params are preserved** when switching subcategory: the shelf reads
  the live query string client-side and re-sets only `sub`.

---

## 3 · Navigation flow (the fix)

`/catalogo` used to `redirect()` straight to the first category
(`maquinaria-agricola`), so every "Catálogo" click landed in Agricultural
Machinery. It is now a real **gateway**: a grid of every active category
(icon + name + tagline + live model count) plus the Mister "importación
personalizada" card. Selecting a category is a deliberate choice that leads into
that category's branded space.

**Desktop vs mobile (deliberately different):**

- **Desktop** keeps the hover **mega-menu** for fast subcategory jumps; the
  gateway is the fallback when the trigger is clicked.
- **Mobile** has no mega-menu, so the gateway *is* the category chooser:
  tap Catálogo → gateway → category → the sticky shelf leads with the
  subcategory horizontal scroll. `SubcategoryGateway` keeps its mobile
  peek-scroll strip for not-yet-catalogued subcategories.

---

## 4 · Adding / editing a category identity

1. Add or edit the slug entry in `src/lib/category-identity.ts`.
2. If it needs a new motif, add the path to `CategoryIcon` (`icon_key`) — inline
   SVG, `stroke=currentColor`, 24×24 viewBox. No raster, no new accent.
3. That's it. The gateway, hero, shelf, reveal, and intelligence block all read
   the identity by rule. No component edits, no token edits.

**Do not:** introduce a per-category accent hue, fork any organ, add a texture
outside the existing set, or put a price/availability/lead-time in identity copy.
Any of these breaks the swap test or the Mister law and is rejected.
