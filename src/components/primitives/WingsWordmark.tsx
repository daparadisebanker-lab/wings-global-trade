import type { HTMLAttributes } from "react";

const LETTERS = ["W", "I", "N", "G", "S"] as const;

type Props = HTMLAttributes<HTMLSpanElement>;

/**
 * Single source of truth for the WINGS wordmark (§5).
 * Letters are individual spans so the hero can stagger them and the FLIP
 * handoff can pixel-match the same letterform geometry in the header.
 */
export default function WingsWordmark({ className = "", ...rest }: Props) {
  return (
    <span
      className={`wings-display inline-flex select-none uppercase leading-none tracking-[0.06em] ${className}`}
      {...rest}
    >
      <span className="sr-only">WINGS</span>
      {LETTERS.map((letter, i) => (
        <span key={i} aria-hidden="true" data-wm-letter className="inline-block">
          {letter}
        </span>
      ))}
    </span>
  );
}
