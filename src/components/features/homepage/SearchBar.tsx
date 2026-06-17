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
        className={`flex items-center gap-3 rounded-full border px-5 py-3 transition-shadow focus-within:shadow-[0_0_0_3px_rgba(196,147,63,0.25)] ${
          onNavy
            ? 'border-[rgba(248,246,240,0.2)] bg-white/[0.06]'
            : 'border-border-default bg-white'
        }`}
      >
        <svg
          viewBox="0 0 20 20"
          className={`h-5 w-5 shrink-0 ${onNavy ? 'text-gold' : 'text-text-muted'}`}
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
          className={`w-full bg-transparent font-body text-base outline-none ${
            onNavy ? 'text-warm-white placeholder:text-[#94A3B8]' : 'text-navy placeholder:text-[#9CA3AF]'
          }`}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="shrink-0 rounded-full bg-gold px-5 py-1.5 font-body text-sm font-medium text-navy transition-colors hover:bg-gold-hover disabled:opacity-50"
        >
          Buscar
        </button>
      </div>
    </form>
  )
}
