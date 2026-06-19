'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'wings_blueprint_mode'
const BP_CLASS = 'blueprint-mode'

export function BlueprintModeToggle() {
  const [active, setActive] = useState(false)

  useEffect(() => {
    let persisted = false
    try {
      persisted = localStorage.getItem(STORAGE_KEY) === 'true'
    } catch {}
    if (persisted) {
      document.documentElement.classList.add(BP_CLASS)
      setActive(true)
    }
  }, [])

  function toggle() {
    const next = !active
    setActive(next)
    if (next) {
      document.documentElement.classList.add(BP_CLASS)
    } else {
      document.documentElement.classList.remove(BP_CLASS)
    }
    try {
      localStorage.setItem(STORAGE_KEY, String(next))
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      title={active ? 'Salir del plano técnico' : 'Modo plano técnico'}
      aria-pressed={active}
      className="relative flex h-8 w-8 items-center justify-center rounded-none transition-colors duration-150 ease-in-out"
      style={{
        backgroundColor: active ? '#001E50' : '#F8F6F0',
        border: `1px solid ${active ? 'rgba(196,147,63,0.4)' : '#001E50'}`,
      }}
    >
      {/* Cross-fade the two icons on a 150ms ease-in-out, both occupying the same cell */}
      <span
        className="absolute inset-0 flex items-center justify-center transition-opacity duration-150 ease-in-out"
        style={{ opacity: active ? 0 : 1 }}
        aria-hidden={active}
      >
        <GridIcon />
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center transition-opacity duration-150 ease-in-out"
        style={{ opacity: active ? 1 : 0 }}
        aria-hidden={!active}
      >
        <ExitIcon />
      </span>
    </button>
  )
}

function GridIcon() {
  // Technical-drawing grid: ruled lines with registration ticks, not a table of cells.
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="13" height="13" stroke="#001E50" strokeWidth="1" />
      <line x1="6" y1="1.5" x2="6" y2="14.5" stroke="#001E50" strokeWidth="0.75" />
      <line x1="10.5" y1="1.5" x2="10.5" y2="14.5" stroke="#001E50" strokeWidth="0.75" />
      <line x1="1.5" y1="6" x2="14.5" y2="6" stroke="#001E50" strokeWidth="0.75" />
      <line x1="1.5" y1="10.5" x2="14.5" y2="10.5" stroke="#001E50" strokeWidth="0.75" />
      <circle cx="6" cy="6" r="0.9" fill="#001E50" />
    </svg>
  )
}

function ExitIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="3" stroke="#F8F6F0" strokeWidth="1.5" />
      <line x1="8" y1="1" x2="8" y2="3.5" stroke="#F8F6F0" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="12.5" x2="8" y2="15" stroke="#F8F6F0" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="1" y1="8" x2="3.5" y2="8" stroke="#F8F6F0" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12.5" y1="8" x2="15" y2="8" stroke="#F8F6F0" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3.05" y1="3.05" x2="4.82" y2="4.82" stroke="#F8F6F0" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="11.18" y1="11.18" x2="12.95" y2="12.95" stroke="#F8F6F0" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12.95" y1="3.05" x2="11.18" y2="4.82" stroke="#F8F6F0" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="4.82" y1="11.18" x2="3.05" y2="12.95" stroke="#F8F6F0" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
