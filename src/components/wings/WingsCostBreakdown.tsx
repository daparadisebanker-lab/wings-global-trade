"use client";

import { useFadeIn, useStaggerFadeIn } from "@/hooks/useFadeIn";

const COST_ITEMS = [
  { n: "01", label: "Precio FOB",                    desc: "El valor de la mercadería en fábrica, antes de cualquier logística.",                                     note: "fábrica en Asia"        },
  { n: "02", label: "Flete marítimo internacional",  desc: "Transporte desde el puerto de origen hasta el hub de zona franca.",                                       note: "Shanghai, Guangzhou…"   },
  { n: "03", label: "Seguro de carga",               desc: "Cobertura durante el trayecto marítimo. Aprox. 0.3–0.5% del valor CIF.",                                  note: "~0.3–0.5% CIF"         },
  { n: "04", label: "Almacenaje en zona franca",     desc: "Recepción, manipulación, inspección y almacenaje en ZOFRI o ZOFRATACNA.",                                 note: "ZOFRI o ZOFRATACNA"    },
  { n: "05", label: "Aranceles e impuestos",         desc: "Depende de la partida HS, el país destino y los acuerdos comerciales vigentes.",                          note: "variable según HS"     },
  { n: "06", label: "Despacho aduanero",             desc: "Honorarios del agente de aduana en destino y gastos de documentación.",                                   note: "en país destino"       },
  { n: "07", label: "Flete interior",                desc: "Transporte desde la aduana o puerto de destino hasta tu bodega o ciudad.",                                note: "hasta tu ciudad"       },
];

export default function WingsCostBreakdown() {
  const headerRef = useFadeIn();
  const itemsRef  = useStaggerFadeIn(60);
  const rightRef  = useFadeIn();

  return (
    <section className="bg-[#F8F6F0] py-28 md:py-36">
      <div className="max-w-7xl mx-auto px-6">
        <div ref={headerRef as React.RefObject<HTMLDivElement>} className="fade-up text-center mb-16">
          <p className="text-[#C4933F] text-[10px] font-semibold tracking-[0.12em] uppercase mb-5" style={{ fontFamily: "var(--font-body)" }}>
            Transparencia de costos
          </p>
          <h2
            className="text-[#1C1A16] text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight max-w-3xl mx-auto leading-[1.1]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Tu cotización cubre los siete componentes del costo real.
          </h2>
          <p className="text-[#6B6560] text-lg mt-5 max-w-xl mx-auto" style={{ fontFamily: "var(--font-body)" }}>
            La mayoría de los agentes solo cotizan el flete. Wings calcula el precio final antes de que decidas comprar.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 items-start">
          {/* Left: cost items */}
          <div ref={itemsRef as React.RefObject<HTMLDivElement>} className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.07)] overflow-hidden">
            {COST_ITEMS.map((item, i) => (
              <div
                key={item.n}
                className={`stagger-item flex gap-5 px-7 py-5 ${i < COST_ITEMS.length - 1 ? "border-b border-[#F8F6F0]" : ""} ${i % 2 === 1 ? "bg-[#FDFCFB]" : ""}`}
              >
                <span className="text-[#C4933F] text-xs font-mono tracking-widest mt-0.5 flex-shrink-0 w-6">
                  {item.n}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <p className="text-[#1C1A16] text-sm font-semibold" style={{ fontFamily: "var(--font-body)" }}>{item.label}</p>
                    <span className="text-[#6B6560] text-xs font-mono flex-shrink-0">{item.note}</span>
                  </div>
                  <p className="text-[#6B6560] text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: sticky callout */}
          <div ref={rightRef as React.RefObject<HTMLDivElement>} className="fade-up lg:sticky lg:top-24 space-y-4">
            <div className="bg-[#0D1B2A] rounded-2xl p-8">
              <p className="text-[#C4933F] text-xs font-medium tracking-[0.12em] uppercase mb-5" style={{ fontFamily: "var(--font-body)" }}>
                La diferencia Wings
              </p>
              <p
                className="text-white text-2xl font-semibold leading-snug mb-5 tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Un agente de carga te da el flete. Wings te da el precio final.
              </p>
              <p className="text-white/50 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                Con Wings, el costo landed completo — aranceles, aduana y entrega — se calcula
                antes de que tomes la decisión de comprar.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.07)] p-7">
              <p className="text-[#1C1A16] text-xs font-semibold tracking-[0.12em] uppercase mb-5" style={{ fontFamily: "var(--font-body)" }}>
                Lo que la mayoría no cotiza
              </p>
              <div className="space-y-3">
                {[
                  "Aranceles e IVA en destino",
                  "Almacenaje en zona franca",
                  "Despacho aduanero local",
                  "Flete interior hasta tu ciudad",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#C4933F]/10 flex items-center justify-center flex-shrink-0">
                      <svg width="10" height="10" fill="none" stroke="#C4933F" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                    </div>
                    <p className="text-[#6B6560] text-sm" style={{ fontFamily: "var(--font-body)" }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[#6B6560] text-xs leading-relaxed px-1" style={{ fontFamily: "var(--font-body)" }}>
              Los porcentajes son estimados para una importación típica desde China. Los valores reales varían según producto, volumen, país destino y condiciones de mercado.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
