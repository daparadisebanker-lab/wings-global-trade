type Props = {
  className?: string;
  /** Rendered height in px; width follows the 5:4 viewBox ratio. */
  size?: number;
};

/**
 * Symbol-only mark (§5): a doubled "wing" chevron derived from the W.
 * Strokes inherit currentColor so theme switching needs no props.
 */
export default function WingsSymbol({ className = "", size = 24 }: Props) {
  return (
    <svg
      viewBox="0 0 30 24"
      width={(size * 30) / 24}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="square"
      className={className}
      aria-hidden="true"
    >
      <path d="M2 3l6 18 7-14 7 14 6-18" />
    </svg>
  );
}
