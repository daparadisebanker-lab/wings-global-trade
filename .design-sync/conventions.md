# Wings Trade UI — build conventions (read before styling anything)

**What this system is.** B2B trade-intelligence UI (Peru↔China imports),
"certified document, not marketplace listing." Wholesale only: never a cart,
never "comprar/buy," never an absolute price, availability, or lead time —
price slots always read **"A cotizar"**; the primary action of every screen
is starting a quote conversation (RFQFlow or WhatsApp). Copy is Spanish,
technical, direct, **no exclamation marks**.

**Critical styling constraint.** `styles.css` is a *compiled* Tailwind
output — new utility classes you invent will NOT resolve. Style your layout
glue with **inline styles or CSS custom properties**, and use only utilities
that exist in the shipped stylesheet. Safe, verified utility vocabulary:
`bg-navy` `bg-gold` `bg-warm-white` `text-navy` `text-gold` `text-warm-white`
`font-display` `font-body` `font-mono` `rounded-wings` (2px — the system's
only radius; never rounder). For anything else use the tokens directly:

- Brand: `var(--livery-navy)` #001E50 · `var(--livery-gold)` #C4933F ·
  `var(--livery-warm-white)` #F8F6F0 · hovers `--livery-gold-hover/-active`
- Errors: `var(--error)` (+ `--error-70`, `--error-40`, `--error-glow`) —
  failure red. Scarcity/heat is NOT this red: thermal readings use
  `--mister-ramp-0…100` (steps of 10), and only when a live variable drives
  them (a decorative gradient is off-law).
- Mister surfaces (chat/diagnostic UI): `--mister-bg-window/header/inset`,
  `--mister-text-primary/secondary/muted`, `--mister-azul` #1D83F2.
- Type: display = NissanOpti (weight 400 ONLY, never 300), body = Flexo
  (100–900), data/labels = Teko — all self-hosted, already loaded.

**Grounds and ink.** The page ground is navy with warm-white ink. Sections
alternate navy ↔ warm-white, never two same-color sections adjacent; the
footer is always navy. When you place content on a light ground, set the ink
explicitly (`color: var(--livery-navy)`) — several components (Button
variant="secondary") style themselves from the inherited `currentColor` and
are designed to work on both grounds.

**Component notes.**
- No global provider is needed — tokens live at `:root`. Toasts are the one
  context: wrap in `<ToastProvider>` and fire via the `useToast()` hook.
- `TrustFooter` requires a `logoSrc` you supply as an asset — the site's
  `/Wings-logo-imagotipo-color.svg` path does not exist here.
- `MisterMark` is a registered brand mark: place and size it only (`size`
  prop, uniform scale); never redraw, recolor beyond the permitted tokens,
  or add effects. Clearspace is baked into its viewBox.
- `FillMeter` captions are slot counts ("N de M cupos tomados") — never
  attach prices or dates to it.
- Numbers (CBM, MOQ, HS codes, kW, m³/min) are brand assets: exhibit them
  in Teko/`font-mono`, tabular, never hide them.

**Idiomatic composition** (adapted from a verified preview):

```jsx
<section style={{ background: 'var(--livery-navy)', color: 'var(--livery-warm-white)', padding: 48 }}>
  <SpecSheet payload={{ name: 'AsiaStar JS6108GH', category: 'Buses', hs_code: '8702.10', Potencia: '206 kW', Norma: 'Euro V' }} />
  <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
    <Button variant="primary">Solicitar cotización</Button>
    <Button variant="secondary">Ver catálogo</Button>
  </div>
</section>
```

Before styling anything nontrivial, read `styles.css` (its `@import` closure
carries every token) and the component's own `.prompt.md`.
