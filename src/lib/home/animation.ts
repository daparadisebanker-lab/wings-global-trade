// Shared GSAP / ScrollTrigger setup (WINGS_HOME_SPEC.md §7)
// - ScrollTrigger registered exactly once
// - every scene is created through these factories so the reduced-motion
//   guard applies globally (hard requirement §7.2)

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const DESKTOP = "(min-width: 1024px)";
export const MOBILE = "(max-width: 1023.98px)";

let registered = false;

export function ensureGsap(): { gsap: typeof gsap; ScrollTrigger: typeof ScrollTrigger } {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return { gsap, ScrollTrigger };
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

type SceneBuilder = (api: {
  gsap: typeof gsap;
  ScrollTrigger: typeof ScrollTrigger;
}) => void;

/**
 * Single-context scene factory. Returns a cleanup function.
 * With prefers-reduced-motion the builder never runs, so the page stays in
 * its server-rendered resting state — no pins, no scrubs.
 */
export function createScene(scope: Element | null, build: SceneBuilder): () => void {
  if (prefersReducedMotion()) return () => {};
  const api = ensureGsap();
  const ctx = gsap.context(() => build(api), scope ?? undefined);
  return () => ctx.revert();
}

type ResponsiveSceneBuilder = (api: {
  gsap: typeof gsap;
  ScrollTrigger: typeof ScrollTrigger;
}) => void | (() => void);

/**
 * Breakpoint-aware scene factory built on gsap.matchMedia so triggers are
 * killed and rebuilt on breakpoint change (§7.4). Returns a cleanup function.
 */
export function createResponsiveScene(
  scenes: Partial<Record<string, ResponsiveSceneBuilder>>
): () => void {
  if (prefersReducedMotion()) return () => {};
  const api = ensureGsap();
  const mm = api.gsap.matchMedia();
  for (const [query, build] of Object.entries(scenes)) {
    if (build) mm.add(query, () => build(api));
  }
  return () => mm.revert();
}
