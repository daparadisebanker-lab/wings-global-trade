import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";

export type ScrollTriggerConfig = {
  trigger: Element | string;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  pin?: boolean | Element | string;
  onUpdate?: (self: ScrollTriggerType) => void;
  onEnter?: () => void;
  animation?: gsap.core.Timeline | gsap.core.Tween;
  markers?: boolean;
};

/**
 * Factory that wraps ScrollTrigger.create with shared defaults.
 * Returns null if prefers-reduced-motion is active OR if running server-side.
 */
export function createScrollTrigger(
  ScrollTrigger: typeof ScrollTriggerType,
  config: ScrollTriggerConfig
): ScrollTriggerType | null {
  if (typeof window === "undefined") return null;

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (prefersReduced) return null;

  return ScrollTrigger.create({
    ...config,
  });
}
