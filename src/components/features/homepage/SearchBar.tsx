// src/components/features/homepage/SearchBar.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { resolveSearchUrl } from '@/lib/routing'

interface SearchBarProps {
  onNavy?: boolean
}

export function SearchBar({ onNavy = true }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setIsLoading(true)
    router.push(resolveSearchUrl(q))
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={`relative flex items-center border transition-shadow focus-within:shadow-[0_0_0_2px_rgba(196,147,63,0.25)] ${
          onNavy
            ? 'border-warm-white/[0.15] bg-warm-white/[0.05]'
            : 'border-[rgba(0,30,80,0.12)] bg-transparent'
        }`}
      >
        <svg
          viewBox="0 0 20 20"
          className={`ml-4 h-4 w-4 shrink-0 ${onNavy ? 'text-gold/60' : 'text-navy/30'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <circle cx="9" cy="9" r="6" />
          <path d="M14 14l4 4" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busca maquinaria, camiones, equipos industriales..."
          aria-label="Buscar productos o iniciar una importación personalizada"
          className={`w-full bg-transparent py-4 pl-3 pr-2 font-body text-sm outline-none ${
            onNavy
              ? 'text-warm-white placeholder:text-warm-white/30'
              : 'text-navy placeholder:text-navy/25'
          }`}
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`shrink-0 self-stretch border-l px-4 sm:px-6 font-mono text-[11px] uppercase tracking-[0.10em] transition-colors disabled:opacity-50 ${
            onNavy
              ? 'border-warm-white/[0.12] text-warm-white/50 hover:bg-gold hover:border-gold hover:text-navy'
              : 'border-[rgba(0,30,80,0.08)] text-navy/40 hover:bg-gold hover:border-gold hover:text-navy'
          }`}
          aria-label="Buscar"
        >
          <span className="sm:hidden" aria-hidden>→</span>
          <span className="hidden sm:inline">Buscar</span>
        </button>
      </div>
    </form>
  )
}
