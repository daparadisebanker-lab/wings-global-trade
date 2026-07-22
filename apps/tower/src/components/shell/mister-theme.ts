// The single source of truth for Mister's artifact palette (dark World-B). The
// renderers draw inside the dock's navy world, which deliberately does NOT use
// the light instrument tokens — so these values live here, once, and every
// artifact reads them. Changing the dock's look is now a one-file edit.
export const MISTER_ARTIFACT = {
  text: '#eef4fb',
  muted: '#a8c0dc',
  gold: '#e0b866',
  steel: '#9db4d4',
  panelBg: 'rgba(0,17,46,0.55)',
  fieldBg: 'rgba(0,17,46,0.5)',
  border: '1px solid rgba(168,192,220,0.2)',
  mono: 'var(--font-mono)',
} as const
