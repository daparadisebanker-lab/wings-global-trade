import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#001E50',
          light: '#0A2560',
          dark: '#001040',
          900: '#000C1F',
          950: '#00070F',
        },
        gold: {
          DEFAULT: '#C4933F',
          hover: '#D4A84F',
          active: '#A6751A',
          muted: 'rgba(196,147,63,0.12)',
          subtle: 'rgba(196,147,63,0.06)',
        },
        'warm-white': '#F8F6F0',
        'chat-user': '#F0EDE6',
        // Phase 2A tokens (additive — per ENRICHED_SPEC §2.1)
        'gold-subtle': 'rgba(196,147,63,0.12)',
        'surface-overlay': 'rgba(0,30,80,0.72)',
        'border-focus': 'rgba(196,147,63,0.40)',
        'navy-light': '#0A2560',
        'navy-dark': '#001040',
        // Legacy flat aliases — preserved for backward compat
        'gold-hover': '#D4A84F',
        'gold-active': '#A6751A',
        'surface-card': '#FFFFFF',
        'surface-card-navy': '#0A2560',
        'surface-chat-user': '#F0EDE6',
        'surface-chat-ai': '#FFFFFF',
        'text-muted': 'rgba(0,30,80,0.45)',
        'text-muted-inverse': 'rgba(248,246,240,0.45)',
        'text-mono': 'rgba(0,30,80,0.65)',
        'border-default': 'rgba(0,30,80,0.10)',
        'surface-card': '#FAF9F6',
        'whatsapp': '#25D366',
        'status-new': '#C4933F',
        'status-contacted': '#2563EB',
        'status-qualified': '#16A34A',
        'status-closed-won': '#15803D',
        'status-closed-lost': '#6B7280',
        'indicator-pending': '#D1D5DB',
        'indicator-minimum': '#F59E0B',
        'indicator-complete': '#16A34A',
        // ── El Pasillo (src/pasillo, /pasillo route group) ──────────────────
        // sRGB channel triplets so `<alpha-value>` works on every one of them,
        // which is what lets the state ladder be opacity on a single ink rather
        // than three greys. There is deliberately no accent here: when the
        // product is colour, the interface is achromatic (apps/site/src/pasillo/pasillo.css).
        'pas-surface': 'rgb(var(--pas-surface) / <alpha-value>)',
        'pas-surface-2': 'rgb(var(--pas-surface-2) / <alpha-value>)',
        'pas-ink': 'rgb(var(--pas-ink) / <alpha-value>)',
        'pas-lane-ground': 'rgb(var(--pas-lane-ground) / <alpha-value>)',
        'pas-lamp-avail': 'rgb(var(--pas-lamp-avail) / <alpha-value>)',
        'pas-lamp-made': 'rgb(var(--pas-lamp-made) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'system-ui', 'sans-serif'],
        'pas-display': ['var(--pas-font-display)', 'system-ui', 'sans-serif'],
        'pas-ui': ['var(--pas-font-ui)', 'system-ui', 'sans-serif'],
        'pas-mono': ['var(--pas-font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Display scale — NissanOpti
        'display-xl': ['clamp(2.25rem,7vw,6.5rem)', { lineHeight: '1.0', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.5rem,5vw,4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.015em' }],
        'display-md': ['clamp(1.875rem,3.5vw,3rem)', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        'display-sm': ['clamp(1.5rem,2.5vw,2.25rem)', { lineHeight: '1.15', letterSpacing: '-0.005em' }],
        // Body scale — Flexo
        'body-lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'body-md': ['1rem', { lineHeight: '1.5', letterSpacing: '0' }],
        'body-sm': ['0.875rem', { lineHeight: '1.45', letterSpacing: '0' }],
        // Label scale — Flexo medium
        'label-lg': ['0.875rem', { lineHeight: '1', letterSpacing: '0.01em' }],
        'label-md': ['0.8125rem', { lineHeight: '1', letterSpacing: '0.01em' }],
        'label-sm': ['0.75rem', { lineHeight: '1', letterSpacing: '0.08em' }],
        // Mono scale — Teko (condensed technical labels; 15px minimum for legibility)
        'mono-lg': ['1.25rem', { lineHeight: '1.3', letterSpacing: '0' }],
        'mono-md': ['1.125rem', { lineHeight: '1.4', letterSpacing: '0' }],
        'mono-sm': ['0.9375rem', { lineHeight: '1.4', letterSpacing: '0' }],
        // El Pasillo — the frozen Tier-1 modular scale, read straight off
        // packages/ui/tokens/skeleton.css. Namespaced so it can never shadow
        // the site's own display/body/label/mono scales above.
        // Below the Tier-1 floor by design — see the note on the tokens in
        // src/pasillo/pasillo.css. Declared once, never written as a literal.
        'pas-label': ['var(--pas-type-label)', { lineHeight: '1' }],
        'pas-micro': ['var(--pas-type-micro)', { lineHeight: '1.35' }],
        'pas-dense': ['var(--pas-type-dense)', { lineHeight: '1.4' }],
        'pas-t0': ['var(--type-0)', { lineHeight: '1.45' }],
        'pas-t1': ['var(--type-1)', { lineHeight: '1.4' }],
        'pas-t2': ['var(--type-2)', { lineHeight: '1.25' }],
        'pas-t3': ['var(--type-3)', { lineHeight: '1.15' }],
        'pas-t4': ['var(--type-4)', { lineHeight: '1.1' }],
      },
      letterSpacing: {
        'widest-2': '0.08em',
        'widest-3': '0.15em',
        'nav': '0.10em',
        'pas-display': 'var(--pas-track-display)',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 24px rgba(0,0,0,0.10), 0 12px 48px rgba(0,0,0,0.08)',
        'card-active': '0 2px 8px rgba(0,0,0,0.08)',
        gold: '0 0 0 1px rgba(196,147,63,0.25), 0 4px 20px rgba(196,147,63,0.12)',
        'nav-hover': '0 0 0 1px rgba(196,147,63,0.2)',
      },
      borderRadius: {
        wings: '2px',
        'wings-card': '2px',
        // Hard record, soft chrome: data surfaces have a hard edge, the
        // surfaces a thumb touches are soft.
        'pas-record': 'var(--pas-radius-record)',
        'pas-chrome': 'var(--pas-radius-chrome)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
        // El Pasillo uses the frozen Tier-1 spacing scale, which diverges from
        // Tailwind's default at 5 and above (24/32/48/64 vs 20/24/28/32). These
        // are namespaced rather than overriding 5–8, which would silently
        // re-space every existing page on the site.
        'pas-5': 'var(--space-5)',
        'pas-6': 'var(--space-6)',
        'pas-7': 'var(--space-7)',
        'pas-8': 'var(--space-8)',
        'pas-row': '64px',
      },
      opacity: {
        // The state ladder — one type size, four levels of importance. Free on
        // a mobile GPU, and a *state* language rather than a layout language.
        'pas-lit': 'var(--pas-lit)',
        'pas-resting': 'var(--pas-resting)',
        'pas-dimmed': 'var(--pas-dimmed)',
      },
      transitionDuration: {
        'pas-light': 'var(--pas-dur-light)',
        'pas-cross': 'var(--pas-dur-cross)',
      },
      transitionTimingFunction: {
        'pas-settle': 'var(--pas-ease-settle)',
        'pas-exit': 'var(--pas-ease-exit)',
      },
    },
  },
  plugins: [],
}

export default config
