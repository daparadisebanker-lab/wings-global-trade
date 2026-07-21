/**
 * The Mister constellation mark — a bold "M" of nodes inside a halo scatter.
 * Shared by the dock header and the floating launcher. Dots inherit currentColor
 * for the M; the halo is dimmed. Purely decorative (aria-hidden by default).
 */
export function MisterMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      {/* halo scatter */}
      <g opacity="0.5">
        <circle cx="50" cy="12" r="2.4" />
        <circle cx="72" cy="18" r="2" />
        <circle cx="86" cy="38" r="2.4" />
        <circle cx="88" cy="62" r="2" />
        <circle cx="74" cy="83" r="2.2" />
        <circle cx="50" cy="90" r="2.4" />
        <circle cx="26" cy="83" r="2" />
        <circle cx="12" cy="62" r="2.2" />
        <circle cx="14" cy="38" r="2" />
        <circle cx="28" cy="18" r="2.2" />
      </g>
      {/* bold M */}
      <circle cx="30" cy="68" r="5.4" />
      <circle cx="30" cy="50" r="4.6" />
      <circle cx="30" cy="34" r="5.4" />
      <circle cx="40" cy="44" r="4.4" />
      <circle cx="50" cy="54" r="5.6" />
      <circle cx="60" cy="44" r="4.4" />
      <circle cx="70" cy="34" r="5.4" />
      <circle cx="70" cy="50" r="4.6" />
      <circle cx="70" cy="68" r="5.4" />
    </svg>
  )
}
