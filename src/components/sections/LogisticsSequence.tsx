"use client";

import { useLayoutEffect, useRef } from "react";
import { steps } from "@/lib/home/logistics-steps";
import { createResponsiveScene, DESKTOP, MOBILE } from "@/lib/home/animation";

/**
 * LogisticsSequence (§6.5). Desktop ≥1024px: the section pins (≤100vh of the
 * pinned-scroll budget) and the five step cards translate horizontally with
 * scroll; a 1px oxide rule along the top of the track fills with scrub
 * progress. Mobile: plain vertical list, no pinning, no horizontal scroll;
 * each card's left rule fills as it crosses 50% of the viewport
 * (IntersectionObserver). Triggers are rebuilt across the breakpoint via
 * gsap.matchMedia (§7.4).
 */
export default function LogisticsSequence() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const rule = ruleRef.current;
    if (!section || !track || !rule) return;

    const setActive = (i: number) => {
      section
        .querySelectorAll<HTMLElement>("[data-step-index]")
        .forEach((el, idx) => {
          el.classList.toggle("text-oxide", idx <= i);
          el.classList.toggle("text-steel", idx > i);
        });
    };

    return createResponsiveScene({
      [DESKTOP]: ({ gsap }) => {
        const travel = () => -(track.scrollWidth - window.innerWidth);
        gsap.set(rule, { scaleX: 0, transformOrigin: "left center" });
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=100%",
            pin: true,
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              setActive(Math.round(self.progress * (steps.length - 1)));
            },
          },
        });
        tl.to(track, { x: travel, ease: "none" }, 0).to(
          rule,
          { scaleX: 1, ease: "none" },
          0
        );
      },
      [MOBILE]: ({ gsap }) => {
        const cards = Array.from(
          section.querySelectorAll<HTMLElement>("[data-step-card]")
        );
        const rules = cards.map((c) =>
          c.querySelector<HTMLElement>("[data-step-rule]")
        );
        rules.forEach((r) => r && gsap.set(r, { scaleY: 0, transformOrigin: "top center" }));
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              const i = cards.indexOf(entry.target as HTMLElement);
              const r = rules[i];
              if (r) gsap.to(r, { scaleY: 1, duration: 0.4, ease: "power1.out" });
              setActive(i);
              io.unobserve(entry.target);
            });
          },
          // fires as the card crosses the vertical midpoint of the viewport
          { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
        );
        cards.forEach((c) => io.observe(c));
        return () => io.disconnect();
      },
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      data-theme-section="dark"
      className="wings-wm-dark relative overflow-hidden bg-graphite lg:h-[100svh]"
    >
      {/* progress rule — desktop only */}
      <div
        ref={ruleRef}
        className="absolute left-0 top-0 hidden h-px w-full bg-oxide lg:block"
      />

      <ol
        ref={trackRef}
        className="m-0 flex list-none flex-col gap-16 px-8 py-24 lg:h-full lg:w-max lg:flex-row lg:items-center lg:gap-[7vw] lg:px-[12vw] lg:py-0"
      >
        {steps.map((step, i) => (
          <li
            key={step.index}
            data-step-card
            className="relative max-w-[34rem] flex-shrink-0 pl-6 lg:w-[min(56vw,30rem)] lg:pl-0"
          >
            {/* mobile fill rule */}
            <span
              data-step-rule
              aria-hidden="true"
              className="absolute bottom-0 left-0 top-0 w-px bg-oxide lg:hidden"
            />
            <p
              data-step-index
              className={`m-0 mb-4 tracking-[0.18em] ${i === 0 ? "text-oxide" : "text-steel"}`}
              style={{ fontFamily: "var(--font-data)", fontSize: "var(--type-data)" }}
            >
              {String(step.index).padStart(2, "0")}
            </p>
            <h3
              className="wings-display m-0 mb-4 uppercase text-paper"
              style={{ fontSize: "clamp(24px, 2.4vw, 38px)", lineHeight: 1.12 }}
            >
              {step.label}
            </h3>
            <p
              className="m-0 text-steel"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--type-body)",
                lineHeight: 1.6,
              }}
            >
              {step.detail}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
