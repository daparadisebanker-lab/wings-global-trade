import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLSpanElement> & {
  /** Rendered height — px number or any CSS length (e.g. a clamp()). */
  height?: number | string;
  /** "white" recolors the navy lockup for dark surfaces. */
  tone?: "navy" | "white";
};

/**
 * The real Wings Global Trade logo lockup (/wings-logo-complete.svg, navy
 * single-fill). Replaces the typed Archivo wordmark everywhere on the
 * homepage so the mark on screen is the company's actual mark. Wrapped in a
 * span so GSAP FLIP handoffs can transform/measure the same node shape used
 * by the header target.
 */
export default function WingsLogo({
  height = 32,
  tone = "white",
  className = "",
  ...rest
}: Props) {
  return (
    <span className={`inline-flex select-none ${className}`} {...rest}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/wings-logo-complete.svg"
        alt="Wings Global Trade"
        height={typeof height === "number" ? height : undefined}
        style={{ height, width: "auto" }}
        className={tone === "white" ? "brightness-0 invert" : ""}
        draggable={false}
      />
    </span>
  );
}
