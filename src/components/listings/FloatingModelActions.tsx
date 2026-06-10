"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ensureGsap, prefersReducedMotion } from "@/lib/home/animation";

const SESSION_KEY = "wings_product_cta_taught";
const CIRCLE = 52;

type Props = {
  waLink: string;
  cotizarHref: string;
};

export default function FloatingModelActions({ waLink, cotizarHref }: Props) {
  const waContRef  = useRef<HTMLDivElement>(null);
  const cotContRef = useRef<HTMLDivElement>(null);
  const waTxtRef   = useRef<HTMLSpanElement>(null);
  const cotTxtRef  = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wa     = waContRef.current;
    const cot    = cotContRef.current;
    const waTxt  = waTxtRef.current;
    const cotTxt = cotTxtRef.current;
    if (!wa || !cot || !waTxt || !cotTxt) return;

    let alreadyTaught = false;
    try { alreadyTaught = sessionStorage.getItem(SESSION_KEY) === "1"; } catch {}

    if (alreadyTaught || prefersReducedMotion()) return;

    const { gsap } = ensureGsap();

    // Measure actual rendered text widths (elements are opacity:0 but layout is active).
    const waExpandW  = CIRCLE + waTxt.scrollWidth  + 36;
    const cotExpandW = CIRCLE + cotTxt.scrollWidth + 36;

    const tl = gsap.timeline({
      delay: 1.1,
      onComplete: () => {
        try { sessionStorage.setItem(SESSION_KEY, "1"); } catch {}
      },
    });

    // ── Expand ─────────────────────────────────────────────
    tl.to(wa,     { maxWidth: waExpandW,  duration: 0.42, ease: "power2.out" })
      .to(cot,    { maxWidth: cotExpandW, duration: 0.42, ease: "power2.out" }, "<0.07")
      .to(waTxt,  { opacity: 1, duration: 0.22, ease: "power1.out" }, "-=0.22")
      .to(cotTxt, { opacity: 1, duration: 0.22, ease: "power1.out" }, "<");

    // ── Hold ───────────────────────────────────────────────
    tl.to({}, { duration: 2.1 });

    // ── Contract ───────────────────────────────────────────
    tl.to([waTxt, cotTxt], { opacity: 0, duration: 0.16, ease: "power1.in" })
      .to(wa,  { maxWidth: CIRCLE, duration: 0.36, ease: "power2.in" }, "-=0.04")
      .to(cot, { maxWidth: CIRCLE, duration: 0.36, ease: "power2.in" }, "<0.05");

    return () => { tl.kill(); };
  }, []);

  const iconRing = `flex h-[${CIRCLE}px] w-[${CIRCLE}px] flex-shrink-0 items-center justify-center`;

  return (
    <div
      className="fixed right-5 z-50 flex flex-col items-end gap-3 md:hidden"
      style={{ bottom: "calc(28px + env(safe-area-inset-bottom))" }}
      aria-label="Acciones del modelo"
    >
      {/* ── Gold — Cotizar este modelo ────────────────────── */}
      <div
        ref={cotContRef}
        className="overflow-hidden rounded-full"
        style={{
          maxWidth: CIRCLE,
          height: CIRCLE,
          backgroundColor: "#C4933F",
          boxShadow: "0 4px 18px rgba(196,147,63,0.45), 0 2px 6px rgba(0,0,0,0.18)",
        }}
      >
        <Link
          href={cotizarHref}
          aria-label="Cotizar este modelo"
          className="flex items-center justify-end"
          style={{ height: CIRCLE, minWidth: 260 }}
        >
          <span
            ref={cotTxtRef}
            className="pointer-events-none whitespace-nowrap pl-5 pr-1 text-[13px] font-semibold text-white"
            style={{ fontFamily: "var(--font-body)", opacity: 0 }}
          >
            Cotizar este modelo
          </span>
          <span className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center">
            <svg
              width="19" height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 12h6M9 16h4" />
            </svg>
          </span>
        </Link>
      </div>

      {/* ── Green — Conversar por WhatsApp ────────────────── */}
      <div
        ref={waContRef}
        className="overflow-hidden rounded-full"
        style={{
          maxWidth: CIRCLE,
          height: CIRCLE,
          backgroundColor: "#25D366",
          boxShadow: "0 4px 18px rgba(37,211,102,0.40), 0 2px 6px rgba(0,0,0,0.14)",
        }}
      >
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Conversar sobre este modelo por WhatsApp"
          className="flex items-center justify-end"
          style={{ height: CIRCLE, minWidth: 300 }}
        >
          <span
            ref={waTxtRef}
            className="pointer-events-none whitespace-nowrap pl-5 pr-1 text-[13px] font-semibold text-white"
            style={{ fontFamily: "var(--font-body)", opacity: 0 }}
          >
            Conversar sobre este modelo
          </span>
          <span className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </span>
        </a>
      </div>
    </div>
  );
}
