import type { Config } from 'tailwindcss'

/**
 * El Pasillo Tailwind — every value resolves to a CSS custom property declared
 * in globals.css. Tokens are sRGB channel triplets so `<alpha-value>` works on
 * all of them, which is what lets the state ladder (lit / resting / dimmed) be
 * expressed as opacity on a single ink rather than as three greys.
 *
 * There is no accent colour in this config. That is the doctrine, not an
 * oversight: all colour on screen belongs to the product.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--surface-2) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        'lane-ground': 'rgb(var(--lane-ground) / <alpha-value>)',
        'lamp-avail': 'rgb(var(--lamp-avail) / <alpha-value>)',
        'lamp-made': 'rgb(var(--lamp-made) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        ui: ['var(--font-ui)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        label: ['var(--type-label)', { lineHeight: '1' }],
        t0: ['var(--type-0)', { lineHeight: '1.45' }],
        t1: ['var(--type-1)', { lineHeight: '1.4' }],
        t2: ['var(--type-2)', { lineHeight: '1.25' }],
        t3: ['var(--type-3)', { lineHeight: '1.15' }],
        t4: ['var(--type-4)', { lineHeight: '1.1' }],
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
        row: '64px',
      },
      borderRadius: {
        record: 'var(--radius-record)',
        chrome: 'var(--radius-chrome)',
      },
      // The state ladder. One type size, four levels of importance — free on a
      // mobile GPU, and a *state* language rather than a layout language.
      opacity: {
        lit: 'var(--lit)',
        resting: 'var(--resting)',
        dimmed: 'var(--dimmed)',
      },
      transitionDuration: {
        light: 'var(--dur-light)',
        cross: 'var(--dur-cross)',
      },
      transitionTimingFunction: {
        settle: 'var(--ease-settle)',
        exit: 'var(--ease-exit)',
      },
    },
  },
  plugins: [],
}

export default config
