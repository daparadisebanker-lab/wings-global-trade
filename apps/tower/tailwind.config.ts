import type { Config } from 'tailwindcss'

/**
 * TOWER Tailwind — the control-room livery (DESIGN_SYSTEM.md).
 * Every color/font is a CSS custom property defined in globals.css under
 * `[data-app="tower"]`. Components consume these semantic classes only —
 * never a raw hex, never a raw px (ecosystem Prime Directive 3).
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Surfaces — warm-white ground. Never change with the active lane.
        'surface-0': 'var(--surface-0)',
        'surface-1': 'var(--surface-1)',
        'surface-2': 'var(--surface-2)',
        // Ink — Wings navy
        'ink-primary': 'var(--ink-primary)',
        'ink-secondary': 'var(--ink-secondary)',
        // Instrument rules (panels are separated by lines, not shadows)
        line: 'var(--line)',
        // Primary = navy (text + fills); accent-ink is what sits ON a navy fill.
        accent: 'var(--accent)',
        'accent-ink': 'var(--accent-ink)',
        // Gold — the Wings jewel: logo, active lane, emphasis. gold-ink sits ON gold.
        gold: 'var(--gold)',
        'gold-ink': 'var(--gold-ink)',
        positive: 'var(--positive)',
        negative: 'var(--negative)',
        stamp: 'var(--stamp)',
        // Active-lane tint — set by LaneSwitcher; tints stamps/series/chips only.
        'lane-accent': 'var(--lane-accent)',
        // ── macOS material layer (TOWER-REDESIGN P1, ratified 2026-07-22) ──
        'surface-base': 'var(--surface-base)',
        'surface-raised': 'var(--surface-raised)',
        'surface-sunken': 'var(--surface-sunken)',
        'ink-tertiary': 'var(--ink-tertiary)',
        'accent-wings': 'var(--accent-wings)',
        'accent-wings-hover': 'var(--accent-wings-hover)',
        'signal-positive': 'var(--signal-positive)',
        'signal-negative': 'var(--signal-negative)',
        'signal-caution': 'var(--signal-caution)',
        'line-hairline': 'var(--line-hairline)',
      },
      fontFamily: {
        // TOWER's tool voice is Inter, wired through the --font-* tokens
        // (globals.css). Brand artifacts re-point those same tokens to
        // NissanOpti/Flexo/Teko at their own root, so `font-display/ui/mono`
        // resolve to the Wings faces inside a document without any class change.
        // Fallbacks below are inert (the token always resolves first).
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        ui: ['var(--font-ui)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // 1.25 modular scale (Tier-1 skeleton). Named against the CSS vars so
        // components never inline a px size.
        // Mono micro-label (uppercase stamped chips/tags), one step below t0.
        'label': ['var(--type-label)', { lineHeight: '1' }],
        't0': ['var(--type-0)', { lineHeight: '1.4' }],
        't1': ['var(--type-1)', { lineHeight: '1.4' }],
        't2': ['var(--type-2)', { lineHeight: '1.3' }],
        't3': ['var(--type-3)', { lineHeight: '1.2' }],
        't4': ['var(--type-4)', { lineHeight: '1.15' }],
        't5': ['var(--type-5)', { lineHeight: '1.1' }],
      },
      borderRadius: {
        // Legacy control-room radii (kept; `card` stays 4px until the sweep).
        structural: 'var(--radius-structural)',
        card: 'var(--radius-card)',
        // ── macOS material scale (TOWER-REDESIGN P1, ratified 2026-07-22) ──
        control: 'var(--radius-control)',
        'card-lg': 'var(--radius-card-lg)',
        panel: 'var(--radius-panel)',
        dock: 'var(--radius-dock)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        'elevation-1': 'var(--elevation-1)',
        'elevation-2': 'var(--elevation-2)',
        'elevation-3': 'var(--elevation-3)',
        'elevation-4': 'var(--elevation-4)',
      },
      transitionTimingFunction: {
        // Keys are bare; Tailwind prefixes the `ease-` namespace → `ease-spring-snappy`,
        // `ease-exit` (review F4: key 'ease-exit' would have produced `ease-ease-exit`).
        'spring-snappy': 'var(--spring-snappy)',
        'spring-settle': 'var(--spring-settle)',
        'exit': 'var(--ease-exit)',
      },
      spacing: {
        // Operational row heights (DESIGN_SYSTEM density).
        row: '40px',
        'row-compact': '32px',
      },
    },
  },
  plugins: [],
}

export default config
