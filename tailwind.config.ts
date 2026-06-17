import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#001E50', light: '#002266', dark: '#001040' },
        gold: {
          DEFAULT: '#C4933F',
          hover: '#B8842E',
          active: '#A6751A',
          subtle: 'rgba(196,147,63,0.12)',
        },
        'warm-white': '#F8F6F0',
        'chat-user': '#F0EDE6',
        // New Phase 2A tokens (additive — per ENRICHED_SPEC §2.1)
        'gold-subtle': 'rgba(196,147,63,0.12)',
        'surface-overlay': 'rgba(0,30,80,0.72)',
        'border-focus': 'rgba(196,147,63,0.40)',
        'navy-light': '#002266',
        'navy-dark': '#001040',
        // Legacy flat aliases — preserved for backward compat
        'gold-hover': '#B8842E',
        'gold-active': '#A6751A',
        'surface-card': '#FFFFFF',
        'surface-card-navy': '#002266',
        'surface-chat-user': '#F0EDE6',
        'surface-chat-ai': '#FFFFFF',
        'text-muted': '#6B7280',
        'text-muted-inverse': '#94A3B8',
        'text-mono': '#374151',
        'border-default': '#E5E7EB',
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
        mono: ['var(--font-mono)', 'Courier New', 'monospace'],
      },
      fontSize: {
        // Display scale — Cormorant Garamond (per ENRICHED_SPEC §2.2)
        'display-xl': ['clamp(3rem,5vw,5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.25rem,4vw,3.75rem)', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
        'display-md': ['clamp(1.875rem,3vw,2.5rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'display-sm': ['clamp(1.5rem,2.5vw,2rem)', { lineHeight: '1.2', letterSpacing: '0' }],
        // Body scale — Flexo
        'body-lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'body-md': ['1rem', { lineHeight: '1.5', letterSpacing: '0' }],
        'body-sm': ['0.875rem', { lineHeight: '1.45', letterSpacing: '0' }],
        // Label scale — Flexo medium
        'label-lg': ['0.875rem', { lineHeight: '1', letterSpacing: '0.01em' }],
        'label-md': ['0.8125rem', { lineHeight: '1', letterSpacing: '0.01em' }],
        'label-sm': ['0.75rem', { lineHeight: '1', letterSpacing: '0.08em' }],
        // Mono scale — DM Mono
        'mono-lg': ['1rem', { lineHeight: '1.3', letterSpacing: '0' }],
        'mono-md': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0' }],
        'mono-sm': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0' }],
      },
      letterSpacing: {
        'widest-2': '0.08em',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,32,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,32,0.10)',
      },
      borderRadius: {
        wings: '2px',
        'wings-card': '4px',
      },
    },
  },
  plugins: [],
}

export default config
