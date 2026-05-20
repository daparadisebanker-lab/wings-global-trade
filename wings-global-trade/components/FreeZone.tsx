"use client";
import { useFadeIn, useStaggerFadeIn } from "@/hooks/useFadeIn";

const HUBS = [
  {
    city: "Iquique",
    zone: "ZOFRI",
    country: "Chile",
    coordinates: "20°13′S 70°09′W",
    description:
      "Hub estratégico para el Cono Sur. Conecta con Bolivia, Paraguay, Argentina, Uruguay y el norte de Chile en las rutas más eficientes desde Asia.",
    markets: ["Bolivia", "Paraguay", "Argentina", "Uruguay", "Norte de Chile"],
  },
  {
    city: "Tacna",
    zone: "ZOFRATACNA",
    country: "Perú",
    coordinates: "18°00′S 70°14′W",
    description:
      "Plataforma de importación y distribución para Perú y los mercados andinos. Zona franca con procedimientos aduaneros propios para almacenamiento y redistribución.",
    markets: ["Perú", "Bolivia (ruta andina)", "Ecuador"],
  },
];

const BENEFITS = [
  { label: "Consolidación de carga", detail: "Múltiples proveedores en un solo despacho" },
  { label: "Nacionalización diferida", detail: "Decide cuándo y cuánto nacionalizas" },
  { label: "Redistribución regional", detail: "Un hub, múltiples destinos finales" },
  { label: "Inspección previa", detail: "Verificamos antes de que pagues el saldo" },
  { label: "Despacho parcial", detail: "Libera por lotes según tu flujo de caja" },
  { label: "Reempaque y reetiquetado", detail: "Adecuación al mercado destino en zona franca" },
];

export default function FreeZone() {
  const headerRef = useFadeIn();
  const hubsRef = useStaggerFadeIn(120);
  const benefitsRef = useStaggerFadeIn(70);
  return (
    <section id="zonas-francas" className="bg-[#F8F6F0] py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div ref={headerRef as any} className="fade-up text-center mb-16">
          <p className="text-[#C4933F] text-sm font-medium tracking-[0.12em] uppercase mb-5" style={{ fontFamily: "var(--font-body)" }}>
            Infraestructura
          </p>
          <h2
            className="text-[#1C1A16] text-4xl md:text-5xl lg:text-[64px] font-semibold tracking-tight max-w-3xl mx-auto leading-[1.08]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Dos hubs en zona franca. Una ventaja real.
          </h2>
          <p className="text-[#6B6560] text-lg mt-5 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
            Nuestros almacenes en Iquique y Tacna son el activo central que nos permite ofrecer
            costes landed reales, consolidación flexible y despachos controlados.
          </p>
        </div>

        {/* Photo strip — warehouse interior */}
        <div className="relative w-full h-56 md:h-72 rounded-2xl overflow-hidden mb-8">
          <img
            src="/freezone-bg.png"
            alt="Free trade zone warehouse"
            className="w-full h-full object-cover object-center"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#001E50]/60 via-transparent to-[#001E50]/30" />
          <div className="absolute bottom-6 left-8">
            <p className="text-white/50 text-xs font-medium tracking-[0.18em] uppercase" style={{ fontFamily: "var(--font-body)" }}>
              ZOFRI · Iquique, Chile
            </p>
          </div>
        </div>

        {/* Hub cards */}
        <div ref={hubsRef as any} className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {HUBS.map((hub) => (
            <div
              key={hub.city}
              className="stagger-item bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.07)] overflow-hidden"
            >
              {/* Top accent */}
              <div className="h-1 bg-[#C4933F]" />
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-[#C4933F] text-xs font-medium tracking-[0.15em] uppercase mb-1" style={{ fontFamily: "var(--font-body)" }}>
                      {hub.zone} · {hub.country}
                    </p>
                    <h3
                      className="text-[#1C1A16] text-3xl font-semibold tracking-normal"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {hub.city}
                    </h3>
                  </div>
                  <span className="text-[#6B6560] text-xs font-mono bg-[#F8F6F0] px-3 py-1.5 rounded-full">
                    {hub.coordinates}
                  </span>
                </div>

                <p className="text-[#6B6560] text-base leading-relaxed mb-7" style={{ fontFamily: "var(--font-body)" }}>{hub.description}</p>

                <div>
                  <p className="text-[#1C1A16] text-xs font-medium tracking-[0.12em] uppercase mb-3" style={{ fontFamily: "var(--font-body)" }}>
                    Mercados principales
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {hub.markets.map((m) => (
                      <span
                        key={m}
                        className="text-xs bg-[#C4933F]/10 text-[#C4933F] font-medium px-3 py-1.5 rounded-full"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Colombia note */}
        <div className="bg-[#001E50] rounded-2xl p-7 mb-5 flex flex-col md:flex-row md:items-center gap-5">
          <span className="inline-flex items-center bg-[#C4933F]/15 text-[#C4933F] text-xs font-semibold tracking-[0.12em] uppercase rounded-full px-3 py-1.5 self-start md:self-auto flex-shrink-0" style={{ fontFamily: "var(--font-body)" }}>
            Colombia
          </span>
          <p className="text-white/65 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
            Para compradores colombianos, la ruta preferida es el flete directo a{" "}
            <strong className="text-white font-medium">Buenaventura o Cartagena</strong> con
            despacho aduanero nacional. Los hubs de zona franca se usan cuando necesitas
            consolidación multi-país, almacenamiento regional o distribución a varios mercados.
          </p>
        </div>

        {/* Benefits grid */}
        <div ref={benefitsRef as any} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BENEFITS.map((b) => (
            <div
              key={b.label}
              className="stagger-item bg-white rounded-xl shadow-[0_1px_8px_rgba(0,0,0,0.05)] p-5 flex gap-4 items-start"
            >
              <div className="w-8 h-8 rounded-lg bg-[#C4933F]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C4933F]" />
              </div>
              <div>
                <p className="text-[#1C1A16] text-sm font-semibold mb-1" style={{ fontFamily: "var(--font-body)" }}>{b.label}</p>
                <p className="text-[#6B6560] text-xs leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>{b.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
