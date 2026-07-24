// The single source of truth for Mister's artifact palette (dark "World B"). The
// renderers draw inside the dock's fixed navy world, which DELIBERATELY does NOT
// follow the light/dark instrument tokens — a ratified token-system exemption, the
// same principle as the endorsed-brand palettes (CLAUDE.md §5): World B is a fixed
// identity, not a theme-following surface. So its colors live here, once, and its
// bespoke micro-geometry/type (the small in-bubble radii + font sizes inline in the
// artifact renderers) are intentionally hand-tuned for the chat-bubble context —
// they are the exemption, not token debt, and must NOT be converted to the app
// scale (that would make World B follow the theme). Changing the dock's look is a
// one-file edit here. (P8e centralized the last four stray hex into this constant.)
export const MISTER_ARTIFACT = {
  text: '#eef4fb',
  body: '#dbe6f3',
  muted: '#a8c0dc',
  gold: '#e0b866',
  steel: '#9db4d4',
  error: '#ee8888',
  ink: '#00112e', // the bubble navy — used as ink on the gold buttons
  panelBg: 'rgba(0,17,46,0.55)',
  fieldBg: 'rgba(0,17,46,0.5)',
  border: '1px solid rgba(168,192,220,0.2)',
  steelLine: 'rgba(168,192,220,0.3)', // steel border color, one step stronger than `border`
  mono: 'var(--font-mono)',
} as const
