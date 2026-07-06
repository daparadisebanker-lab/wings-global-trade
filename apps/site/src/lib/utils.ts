// src/lib/utils.ts
// Shared utilities. No external dependencies (cn is a lightweight clsx).

type ClassValue = string | number | null | false | undefined | ClassValue[]

/** Lightweight className joiner — flattens and filters falsy values. */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = []
  for (const input of inputs) {
    if (!input) continue
    if (Array.isArray(input)) {
      const nested = cn(...input)
      if (nested) out.push(nested)
    } else {
      out.push(String(input))
    }
  }
  return out.join(' ')
}

/** Format a USD amount with thousands separators, no decimals by default. */
export function formatCurrency(value: number, opts?: { decimals?: number }): string {
  const decimals = opts?.decimals ?? 0
  const formatted = new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
  return `$${formatted} USD`
}

/** Format a percentage value, e.g. 18.5 -> "18.5%". */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

/** Convert a string to a URL-safe slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/** Parse a free-form quantity string into a numeric count. Defaults to 1. */
export function parseQuantityNumeric(quantity: string): number {
  const match = quantity.match(/\d[\d.,]*/)
  if (!match) return 1
  const n = parseFloat(match[0].replace(/\./g, '').replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? n : 1
}

/** Build a wa.me deep link. phone may include +/spaces; they are stripped. */
export function buildWhatsAppLink(phone: string, message?: string): string {
  const clean = phone.replace(/[^\d]/g, '')
  const base = `https://wa.me/${clean}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

/** Truncate text to a max length with an ellipsis. */
export function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}
