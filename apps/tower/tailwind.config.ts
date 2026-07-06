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
        // Surfaces — graphite room. Never change with the active lane.
        'surface-0': 'var(--surface-0)',
        'surface-1': 'var(--surface-1)',
        // Ink
        'ink-primary': 'var(--ink-primary)',
        'ink-secondary': 'var(--ink-secondary)',
        // Instrument rules (panels are separated by lines, not shadows)
        line: 'var(--line)',
        // Signal palette — amber + green carry everything, alarm red is spent
        // only on true failures (DESIGN_SYSTEM refusals).
        accent: 'var(--accent)',
        positive: 'var(--positive)',
        negative: 'var(--negative)',
        stamp: 'var(--stamp)',
        // Active-lane tint — set by LaneSwitcher; tints stamps/series/chips only.
        'lane-accent': 'var(--lane-accent)',
      },
      fontFamily: {
        // Shared UI grotesque for labels/nav; tabular mono is the dominant voice.
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
        // 0 structural, ≤2px cards (Prime Directive: no rounded-soft SaaS).
        structural: 'var(--radius-structural)',
        card: 'var(--radius-card)',
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
