"use client";
import { useFadeIn, useStaggerFadeIn } from "@/hooks/useFadeIn";

const CATEGORIES = [
  {
    title: "Electrónica y accesorios",
    detail: "Cables, cargadores, auriculares, accesorios para smartphones, gadgets de consumo.",
    icon: <ElectronicsIcon />,
    origin: "China, Vietnam, Taiwan",
    transit: "35–45 días",
    minVolume: "200 kg",
  },
  {
    title: "Repuestos y accesorios automotrices",
    detail: "Filtros, frenos, llantas, accesorios de interior, herramientas para taller.",
    icon: <AutoIcon />,
    origin: "China, Taiwan",
    transit: "35–45 días",
    minVolume: "500 kg",
  },
  {
    title: "Envases y marca propia",
    detail: "Packaging, etiquetas, bolsas, frascos, cajas y suministros para líneas propias.",
    icon: <PackagingIcon />,
    origin: "China",
    transit: "30–40 días",
    minVolume: "300 kg",
  },
  {
    title: "Artículos para el hogar y retail",
    detail: "Menaje, decoración, textiles, herramientas domésticas, juguetes y artículos de bazar.",
    icon: <HomeIcon />,
    origin: "China, India",
    transit: "35–50 días",
    minVolume: "300 kg",
  },
  {
    title: "Maquinaria industrial liviana",
    detail: "Equipos, herramientas eléctricas, maquinaria de pequeño formato y repuestos.",
    icon: <MachineryIcon />,
    origin: "China, Corea del Sur",
    transit: "40–55 días",
    minVolume: "500 kg",
  },
  {
    title: "Productos promocionales",
    detail: "Artículos de merchandising, ropa corporativa, materiales de punto de venta.",
    icon: <PromoIcon />,
    origin: "China, Bangladesh",
    transit: "35–45 días",
    minVolume: "200 kg",
  },
];

export default function Categories() {
  const headerRef = useFadeIn();
  const gridRef = useStaggerFadeIn(90);
  return (
    <section id="categorias" className="bg-[#001E50] py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div ref={headerRef as any} className="fade-up text-center mb-16">
          <p className="text-[#C4933F] text-sm font-medium tracking-[0.12em] uppercase mb-5" style={{ fontFamily: "var(--font-body)" }}>
            Qué importamos
          </p>
          <h2
            className="text-white text-4xl md:text-5xl lg:text-[64px] font-semibold tracking-tight max-w-3xl mx-auto leading-[1.08]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Categorías de importación prioritarias.
          </h2>
          <p className="text-white/50 text-lg mt-5 max-w-xl mx-auto" style={{ fontFamily: "var(--font-body)" }}>
            Alta demanda regional, cumplimiento manejable y ventaja real de costo landed en zona franca.
          </p>
        </div>

        {/* Grid */}
        <div ref={gridRef as any} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.title}
              className="stagger-item bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 rounded-2xl p-7 flex flex-col transition-colors duration-200 group"
            >
              {/* Icon */}
              <div className="w-11 h-11 rounded-xl bg-[#C4933F]/15 flex items-center justify-center text-[#C4933F] mb-5">
                {cat.icon}
              </div>

              <h3
                className="text-white text-xl font-semibold mb-3 leading-snug tracking-normal"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {cat.title}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed mb-6 flex-1" style={{ fontFamily: "var(--font-body)" }}>{cat.detail}</p>

              {/* Meta */}
              <div className="border-t border-white/8 pt-4 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[#C4933F] text-[10px] font-medium tracking-[0.12em] uppercase mb-1" style={{ fontFamily: "var(--font-body)" }}>Origen</p>
                  <p className="text-white/65 text-xs leading-snug" style={{ fontFamily: "var(--font-body)" }}>{cat.origin}</p>
                </div>
                <div>
                  <p className="text-[#C4933F] text-[10px] font-medium tracking-[0.12em] uppercase mb-1" style={{ fontFamily: "var(--font-body)" }}>Tránsito</p>
                  <p className="text-white/65 text-xs leading-snug" style={{ fontFamily: "var(--font-body)" }}>{cat.transit}</p>
                </div>
                <div>
                  <p className="text-[#C4933F] text-[10px] font-medium tracking-[0.12em] uppercase mb-1" style={{ fontFamily: "var(--font-body)" }}>Mín.</p>
                  <p className="text-white/65 text-xs leading-snug" style={{ fontFamily: "var(--font-body)" }}>{cat.minVolume}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-white/35 text-sm mt-10" style={{ fontFamily: "var(--font-body)" }}>
          ¿Tu producto no está en la lista?{" "}
          <a href="#contacto" className="text-[#C4933F] hover:text-[#D4A855] transition-colors">
            Consúltanos de todos modos →
          </a>
        </p>
      </div>
    </section>
  );
}

function ElectronicsIcon() {
  return (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function AutoIcon() {
  return (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  );
}

function PackagingIcon() {
  return (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function MachineryIcon() {
  return (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
    </svg>
  );
}

function PromoIcon() {
  return (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  );
}
