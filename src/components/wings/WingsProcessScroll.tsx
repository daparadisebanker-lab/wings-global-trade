"use client";

import { useLayoutEffect, useRef } from "react";
import { createResponsiveScene, DESKTOP, MOBILE, ensureGsap } from "@/lib/home/animation";

const STEPS = [
  {
    number: "01",
    title: "Describe tu producto",
    body: "Cuéntanos qué necesitas importar en español. Nuestro equipo hace las preguntas correctas: destino, volumen, certificaciones, urgencia y presupuesto.",
    panel: {
      label: "Analizamos en la consulta inicial",
      items: [
        "Partida arancelaria exacta (código HS)",
        "Restricciones y permisos en el país destino",
        "Certificaciones técnicas del proveedor",
        "Ventana de entrega y presupuesto disponible",
      ],
    },
  },
  {
    number: "02",
    title: "Recibe tu cotización landed",
    body: "Calculamos el coste total hasta tu ciudad — fábrica, flete, zona franca, aranceles, aduana y entrega final — con rango de confianza por corredor.",
    panel: {
      label: "Tu cotización incluye",
      items: [
        "Precio FOB confirmado con el proveedor",
        "Flete marítimo, seguro y zona franca",
        "Aranceles según HS y país destino",
        "Despacho aduanero y flete interior",
      ],
    },
  },
  {
    number: "03",
    title: "Tu carga llega a zona franca",
    body: "Consolidamos, inspeccionamos y almacenamos tu mercadería en Iquique o Tacna antes de la nacionalización. Recibes fotos, pesaje y estado en tiempo real.",
    panel: {
      label: "Opciones en zona franca",
      items: [
        "LCL o FCL según volumen de carga",
        "Inspección fotográfica antes del saldo",
        "Almacenaje hasta 90 días sin cargo",
        "Despacho parcial por lotes",
      ],
    },
  },
  {
    number: "04",
    title: "Entrega en tu país",
    body: "Coordinamos el despacho de aduana y la entrega interior hasta tu ciudad. Un asesor en WhatsApp te acompaña en cada etapa del proceso.",
    panel: {
      label: "Rutas de entrega por mercado",
      items: [
        "Bolivia: Arica → La Paz / Santa Cruz",
        "Perú: distribución nacional desde Tacna",
        "Paraguay, Uruguay y Argentina: ZOFRI",
      ],
    },
  },
];

export default function WingsProcessScroll() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    ensureGsap();

    return createResponsiveScene({
      [DESKTOP]: ({ gsap }) => {
        const rule = section.querySelector<HTMLElement>("[data-progress-rule]")!;
        let currentStep = 0;

        gsap.set(rule, { scaleX: 0, transformOrigin: "left center" });
        gsap.set(section.querySelectorAll("[data-step-panel]"), { opacity: 0, y: 20 });
        gsap.set(section.querySelector("[data-step-panel='0']"), { opacity: 1, y: 0 });
        gsap.set(section.querySelectorAll("[data-nav-item]"), {
          borderLeftColor: "transparent",
          color: "rgba(250,250,250,0.2)",
        });
        gsap.set(section.querySelector("[data-nav-item='0']"), {
          borderLeftColor: "#C4933F",
          color: "#FAFAFA",
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=300%",
            pin: true,
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate(self) {
              const step = Math.min(
                STEPS.length - 1,
                Math.floor(self.progress * STEPS.length)
              );
              if (step === currentStep) return;

              gsap.to(
                section.querySelector(`[data-step-panel="${currentStep}"]`),
                { opacity: 0, y: -16, duration: 0.28, ease: "power2.in", overwrite: true }
              );
              gsap.to(
                section.querySelector(`[data-nav-item="${currentStep}"]`),
                { borderLeftColor: "transparent", color: "rgba(250,250,250,0.2)", duration: 0.2 }
              );

              currentStep = step;

              gsap.fromTo(
                section.querySelector(`[data-step-panel="${currentStep}"]`),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", overwrite: true }
              );
              gsap.to(
                section.querySelector(`[data-nav-item="${currentStep}"]`),
                { borderLeftColor: "#C4933F", color: "#FAFAFA", duration: 0.25 }
              );
            },
          },
        });

        tl.to(rule, { scaleX: 1, ease: "none" }, 0);
      },

      [MOBILE]: ({ gsap }) => {
        const cards = section.querySelectorAll<HTMLElement>("[data-mobile-step]");
        cards.forEach((card) => {
          gsap.set(card, { opacity: 0, y: 28 });
          const io = new IntersectionObserver(
            ([entry]) => {
              if (!entry.isIntersecting) return;
              gsap.to(card, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
              io.disconnect();
            },
            { threshold: 0.2 }
          );
          io.observe(card);
        });
      },
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      id="como-funciona"
      className="relative min-h-[100svh] overflow-hidden bg-[#0C0C0C]"
    >
      {/* Progress ruler — desktop only */}
      <div
        data-progress-rule
        aria-hidden="true"
        className="absolute left-0 top-0 z-20 hidden h-[3px] w-full origin-left bg-[#C4933F] lg:block"
      />

      {/* ── DESKTOP LAYOUT ─────────────────────────────────── */}
      <div className="hidden h-full min-h-[100svh] lg:flex">
        {/* Left nav panel */}
        <aside className="flex w-[280px] flex-shrink-0 flex-col border-r border-white/[0.08] bg-black/30 px-6 py-20 xl:w-[300px]">
          <p
            className="mb-10 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C4933F]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Importación paso a paso
          </p>

          <ul className="m-0 list-none space-y-1 p-0">
            {STEPS.map((step, i) => (
              <li
                key={step.number}
                data-nav-item={i}
                className="cursor-default border-l-[3px] py-3 pl-5 transition-none"
                style={{
                  borderLeftColor: i === 0 ? "#C4933F" : "transparent",
                  color: i === 0 ? "#FAFAFA" : "rgba(250,250,250,0.2)",
                }}
              >
                <span
                  className="block text-[10px] tracking-[0.2em]"
                  style={{ fontFamily: "var(--font-data)" }}
                >
                  {step.number}
                </span>
                <span
                  className="mt-0.5 block text-sm leading-snug"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {step.title}
                </span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Right content panels — absolutely stacked, crossfade via GSAP */}
        <div className="relative flex-1">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              data-step-panel={i}
              className="absolute inset-0 flex items-center px-16 py-20 xl:px-24"
              style={{ opacity: i === 0 ? 1 : 0 }}
            >
              {/* Decorative background number */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 select-none text-[260px] font-bold leading-none text-white/[0.025]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {step.number}
              </span>

              {/* Foreground content */}
              <div className="relative z-10 max-w-2xl">
                <p
                  className="mb-3 text-sm font-medium tracking-[0.2em] text-[#C4933F]"
                  style={{ fontFamily: "var(--font-data)" }}
                >
                  {step.number} / 04
                </p>

                <h2
                  className="mb-6 text-white"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(44px, 5vw, 72px)",
                    lineHeight: 1.08,
                  }}
                >
                  {step.title}
                </h2>

                <p
                  className="mb-10 text-lg leading-relaxed text-white/55"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {step.body}
                </p>

                {/* Detail panel */}
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-8 py-6">
                  <p
                    className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C4933F]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {step.panel.label}
                  </p>
                  <ul className="m-0 list-none space-y-3 p-0">
                    {step.panel.items.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#C4933F]"
                        />
                        <span
                          className="text-sm leading-relaxed text-white/70"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MOBILE LAYOUT ──────────────────────────────────── */}
      <div className="lg:hidden">
        <div className="px-6 pb-16 pt-20">
          <p
            className="mb-8 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C4933F]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Importación paso a paso
          </p>

          <div className="space-y-5">
            {STEPS.map((step, i) => (
              <div
                key={step.number}
                data-mobile-step={i}
                className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04]"
              >
                {/* Card body */}
                <div className="px-6 pb-6 pt-7">
                  <p
                    className="mb-2 text-[10px] tracking-[0.2em] text-[#C4933F]"
                    style={{ fontFamily: "var(--font-data)" }}
                  >
                    {step.number}
                  </p>
                  <h3
                    className="mb-3 text-2xl leading-snug text-white"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-base leading-relaxed text-white/55"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {step.body}
                  </p>
                </div>

                {/* Card footer */}
                <div className="border-t border-white/[0.08] bg-black/20 px-6 py-5">
                  <p
                    className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C4933F]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {step.panel.label}
                  </p>
                  <ul className="m-0 list-none space-y-2.5 p-0">
                    {step.panel.items.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#C4933F]"
                        />
                        <span
                          className="text-sm leading-relaxed text-white/70"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
