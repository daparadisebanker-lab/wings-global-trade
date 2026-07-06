import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
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
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'system-ui', 'sans-serif'],
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
      },
      letterSpacing: {
        'widest-2': '0.08em',
        'widest-3': '0.15em',
        'nav': '0.10em',
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
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
}

export default config
