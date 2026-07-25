import type { Config } from 'tailwindcss'

/**
 * La Escalera Tailwind — every colour, radius, size and easing below resolves to
 * a CSS custom property declared in globals.css. Tier-1 values come from
 * @wings/trade-ui tokens/skeleton.css (frozen, family-wide); the Tier-2
 * semantics are this tool's own. Components consume these names only — never a
 * raw hex, never a raw px (ecosystem Prime Directive 3).
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Tokens are sRGB channel triplets (globals.css) so every colour supports
      // Tailwind's opacity modifier — `border-deck-ink/12` resolves properly and
      // no component ever needs a raw rgba().
      colors: {
        // Deck ground — near-black, so a tile face is the only colour on screen.
        'deck-0': 'rgb(var(--deck-0) / <alpha-value>)',
        'deck-1': 'rgb(var(--deck-1) / <alpha-value>)',
        'deck-2': 'rgb(var(--deck-2) / <alpha-value>)',
        'deck-ink': 'rgb(var(--deck-ink) / <alpha-value>)',
        'deck-ink-dim': 'rgb(var(--deck-ink-dim) / <alpha-value>)',
        // Record ground — warm document white. The muestrario IS a document.
        'sheet-0': 'rgb(var(--sheet-0) / <alpha-value>)',
        'sheet-1': 'rgb(var(--sheet-1) / <alpha-value>)',
        'sheet-ink': 'rgb(var(--sheet-ink) / <alpha-value>)',
        'sheet-ink-dim': 'rgb(var(--sheet-ink-dim) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        'line-strong': 'rgb(var(--line-strong) / <alpha-value>)',
        // Wings navy / gold.
        accent: 'rgb(var(--accent) / <alpha-value>)',
        'accent-ink': 'rgb(var(--accent-ink) / <alpha-value>)',
        gold: 'rgb(var(--gold) / <alpha-value>)',
        'gold-ink': 'rgb(var(--gold-ink) / <alpha-value>)',
        'gold-deep': 'rgb(var(--gold-deep) / <alpha-value>)',
        positive: 'rgb(var(--positive) / <alpha-value>)',
        caution: 'rgb(var(--caution) / <alpha-value>)',
        negative: 'rgb(var(--negative) / <alpha-value>)',
      },
      fontFamily: {
        ui: ['var(--font-ui)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        label: ['var(--type-label)', { lineHeight: '1' }],
        t0: ['var(--type-0)', { lineHeight: '1.45' }],
        t1: ['var(--type-1)', { lineHeight: '1.4' }],
        t2: ['var(--type-2)', { lineHeight: '1.3' }],
        t3: ['var(--type-3)', { lineHeight: '1.2' }],
        t4: ['var(--type-4)', { lineHeight: '1.15' }],
        t5: ['var(--type-5)', { lineHeight: '1.05' }],
      },
      spacing: {
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        5: 'var(--space-5)',
        6: 'var(--space-6)',
        7: 'var(--space-7)',
        8: 'var(--space-8)',
        9: 'var(--space-9)',
        10: 'var(--space-10)',
      },
      borderRadius: {
        control: 'var(--radius-control)',
        card: 'var(--radius-card-lg)',
        panel: 'var(--radius-panel)',
        dock: 'var(--radius-dock)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        'elevation-1': 'var(--elevation-1)',
        'elevation-2': 'var(--elevation-2)',
        'elevation-3': 'var(--elevation-3)',
      },
      transitionTimingFunction: {
        gantry: 'var(--ease-gantry)',
        settle: 'var(--ease-settle)',
        'spring-snappy': 'var(--spring-snappy)',
        'spring-settle': 'var(--spring-settle)',
        exit: 'var(--ease-exit)',
      },
    },
  },
  plugins: [],
}

export default config
