// @wings/trade-ui · LaneStamp — the lane's signature mark (ecosystem §2).
//
// Built on container-marking grammar (ISO 6346 / BIC): the same visual logic that
// marks a real box. The code IS the branding, and it ages like infrastructure
// rather than like marketing.
//
// The structure is IDENTICAL for every lane — only the tokens and the code string
// differ. That is the swap test passed by construction: put another lane's livery
// on this element and it renders that lane's stamp correctly, because nothing here
// is a colour, a size, or a family. Every visual value arrives from
// [data-lane="{slug}"].
//
// Two voices:
//   compact  the bordered plate — WGT/02. Inline, in a row of chips.
//   full     the BIC unit number with its boxed check digit, plus a designation
//            line. For lane headers, the footer colophon and trade documents.
//
// The check digit is COMPUTED from the lane code, never typed. A stamp whose
// digit is decorative is a stamp that lies to anyone who can read one.

import { laneUnitNumber } from '../lib/iso6346'
import { cn } from '../lib/cn'

export interface LaneStampProps {
  /** The ecosystem lane code, e.g. "WGT/02". */
  code: string
  /** Lane name, e.g. "Interiores". Rendered on the designation line of `full`. */
  name?: string
  /**
   * Archetype, e.g. "PROJECT". Stays in the source language — it is data, the
   * same way a unit number is, and translating it would break the ledger.
   */
  archetype?: string
  variant?: 'compact' | 'full'
  className?: string
}

export function LaneStamp({
  code,
  name,
  archetype,
  variant = 'compact',
  className,
}: LaneStampProps) {
  if (variant === 'compact') {
    return (
      <span
        className={cn(
          'lane-stamp inline-flex items-center px-[var(--space-2)] py-[var(--space-1)]',
          'text-[length:var(--lane-type-stamp)] leading-none',
          className,
        )}
      >
        {code}
      </span>
    )
  }

  const { owner, serial, check } = laneUnitNumber(code)
  const designation = [name, archetype].filter(Boolean).join(' · ')

  return (
    <span className={cn('inline-flex flex-col gap-[var(--space-1)]', className)}>
      <span className="flex items-stretch gap-[var(--space-2)]">
        <span className="lane-stamp inline-flex items-center px-[var(--space-2)] py-[var(--space-1)] text-[length:var(--lane-type-stamp)] leading-none">
          {owner} {serial}
        </span>
        {/* The boxed final digit. Square by construction — a check digit cell is
            square on every real container in the world. */}
        <span
          aria-hidden
          className="lane-stamp-check inline-flex w-[var(--space-4)] items-center justify-center text-[length:var(--lane-type-stamp)] leading-none"
        >
          {check}
        </span>
      </span>
      {designation && (
        <span className="text-[length:var(--lane-type-stamp)] uppercase leading-none tracking-[var(--lane-label-tracking)] text-[color:var(--ink-secondary)]">
          {designation}
        </span>
      )}
    </span>
  )
}
