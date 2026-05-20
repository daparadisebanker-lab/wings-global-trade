"use client";

import { useEffect, useRef, RefObject } from "react";

export function useFadeIn(): RefObject<HTMLElement> {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

export function useStaggerFadeIn(delay = 90): RefObject<HTMLElement> {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const items = container.querySelectorAll<HTMLElement>(".stagger-item");
          items.forEach((item, i) => {
            setTimeout(() => item.classList.add("visible"), i * delay);
          });
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [delay]);

  return ref;
}
