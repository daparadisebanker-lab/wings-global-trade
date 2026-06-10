"use client";

import { useLayoutEffect, useRef } from "react";
import { createScene } from "@/lib/home/animation";

// Tractor faces left (its direction of travel). Wheel geometry in viewBox units:
const VIEWBOX_W = 260;
const REAR = { cx: 190, cy: 100, r: 32 };
const FRONT = { cx: 60, cy: 110, r: 20 };

/**
 * TransitionBand (§6.2). 70vh, harbor→paper horizontal gradient. A line-art
 * tractor scrubs from viewport center to the left edge; wheel rotation is
 * computed from translation distance / wheel circumference, so the wheels
 * physically roll rather than spin decoratively.
 */
export default function TransitionBand() {
  const sectionRef = useRef<HTMLElement>(null);
  const tractorRef = useRef<SVGSVGElement>(null);
  const rearRef = useRef<SVGGElement>(null);
  const frontRef = useRef<SVGGElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const tractor = tractorRef.current;
    const rear = rearRef.current;
    const front = frontRef.current;
    if (!section || !tractor || !rear || !front) return;

    return createScene(section, ({ gsap }) => {
      // Center the tractor via xPercent so GSAP's x remains free for travel.
      gsap.set(tractor, { xPercent: -50 });
      gsap.set([rear, front], { transformOrigin: "50% 50%" });

      // Transform-independent: subtract any current x so refreshes mid-scrub
      // re-derive the same resting-position distance.
      const travel = () => {
        const x = gsap.getProperty(tractor, "x") as number;
        return -(tractor.getBoundingClientRect().left - x);
      };
      const scaleFactor = () => tractor.clientWidth / VIEWBOX_W;
      // Rolling left ⇒ negative rotation, proportional to distance/circumference.
      const roll = (radius: number) => () =>
        (travel() / (2 * Math.PI * radius * scaleFactor())) * 360;

      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "bottom 30%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        .to(tractor, { x: travel, ease: "none" }, 0)
        .to(rear, { rotation: roll(REAR.r), ease: "none" }, 0)
        .to(front, { rotation: roll(FRONT.r), ease: "none" }, 0);
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      data-theme-section="light"
      className="relative h-[70vh] overflow-hidden"
      style={{
        background:
          "linear-gradient(90deg, var(--color-harbor) 0%, var(--color-paper) 100%)",
      }}
    >
      <svg
        ref={tractorRef}
        viewBox={`0 0 ${VIEWBOX_W} 140`}
        className="absolute left-1/2 top-1/2 w-[min(46vw,340px)] -translate-y-1/2 text-ink"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* hood + grille (front, left) */}
        <path d="M30 96 L30 72 Q30 66 36 66 L108 66 L108 96" />
        <path d="M36 78 H46 M36 86 H46" />
        {/* exhaust stack */}
        <path d="M54 66 V44 M50 44 H58" />
        {/* cab */}
        <path d="M108 96 L108 38 L162 38 L172 66 L172 96" />
        <path d="M116 46 L116 90 M116 46 L158 46 L166 66 L116 66" />
        {/* seat + wheel hint inside cab */}
        <path d="M126 78 L138 78 L138 70" />
        {/* rear fender */}
        <path d="M154 98 A38 38 0 0 1 226 98" />
        {/* chassis line */}
        <path d="M80 108 L108 104 L154 100 M30 96 L40 108" />
        {/* rear wheel */}
        <g ref={rearRef}>
          <circle cx={REAR.cx} cy={REAR.cy} r={REAR.r} />
          <circle cx={REAR.cx} cy={REAR.cy} r={6} />
          <path d={`M${REAR.cx - REAR.r + 4} ${REAR.cy} H${REAR.cx + REAR.r - 4}`} />
          <path
            d={`M${REAR.cx - (REAR.r - 4) * 0.5} ${REAR.cy - (REAR.r - 4) * 0.866} L${REAR.cx + (REAR.r - 4) * 0.5} ${REAR.cy + (REAR.r - 4) * 0.866}`}
          />
          <path
            d={`M${REAR.cx + (REAR.r - 4) * 0.5} ${REAR.cy - (REAR.r - 4) * 0.866} L${REAR.cx - (REAR.r - 4) * 0.5} ${REAR.cy + (REAR.r - 4) * 0.866}`}
          />
        </g>
        {/* front wheel */}
        <g ref={frontRef}>
          <circle cx={FRONT.cx} cy={FRONT.cy} r={FRONT.r} />
          <circle cx={FRONT.cx} cy={FRONT.cy} r={4} />
          <path d={`M${FRONT.cx - FRONT.r + 3} ${FRONT.cy} H${FRONT.cx + FRONT.r - 3}`} />
          <path d={`M${FRONT.cx} ${FRONT.cy - FRONT.r + 3} V${FRONT.cy + FRONT.r - 3}`} />
        </g>
      </svg>
    </section>
  );
}
