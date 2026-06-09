const FEATURES = [
  { label: "Cotización con aranceles y entrega final incluidos",      wings: true,      agent: false,      diy: false },
  { label: "Asesoría integral en español",                            wings: true,      agent: "partial",  diy: false },
  { label: "Inspección de carga en fábrica antes del pago final",     wings: true,      agent: false,      diy: false },
  { label: "Almacenaje en zona franca (ZOFRI / ZOFRATACNA)",          wings: true,      agent: false,      diy: false },
  { label: "Consolidación multi-proveedor en un solo despacho",       wings: true,      agent: true,       diy: false },
  { label: "Despacho aduanero coordinado en destino",                 wings: true,      agent: true,       diy: "partial" },
  { label: "Asesor dedicado por WhatsApp en cada etapa",              wings: true,      agent: false,      diy: false },
  { label: "Precio final garantizado antes de decidir comprar",       wings: true,      agent: false,      diy: false },
  { label: "Sin experiencia importadora necesaria",                   wings: true,      agent: false,      diy: false },
];

type Indicator = boolean | "partial";

function Check({ value, highlight }: { value: Indicator; highlight?: boolean }) {
  if (value === true) {
    return (
      <div className="flex items-center justify-center">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${highlight ? "bg-[#C4933F]" : "bg-[#C4933F]/15"}`}>
          <svg width="11" height="11" fill="none" stroke={highlight ? "white" : "#C4933F"} strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
      </div>
    );
  }
  if (value === "partial") {
    return (
      <div className="flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border border-[#6B6560]/40 flex items-center justify-center flex-shrink-0">
          <svg width="11" height="11" fill="none" stroke="#6B6560" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center">
      <svg width="14" height="14" fill="none" stroke="#1C1A16" strokeOpacity={0.2} strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  );
}

export default function WingsWhyWings() {
  return (
    <section className="bg-[#FAFAFA] py-28 md:py-36">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-[#C4933F] text-[10px] font-semibold tracking-[0.12em] uppercase mb-5" style={{ fontFamily: "var(--font-body)" }}>
            Por qué Wings
          </p>
          <h2
            className="text-[#1C1A16] text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight max-w-3xl mx-auto leading-[1.1]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Más que un agente de carga. Un socio de importación.
          </h2>
          <p className="text-[#6B6560] text-lg mt-5 max-w-xl mx-auto" style={{ fontFamily: "var(--font-body)" }}>
            Un agente de carga mueve tu carga. Wings gestiona todo el proceso.
          </p>
        </div>

        {/* Mobile list */}
        <div className="md:hidden bg-white rounded-2xl shadow-[0_2px_24px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E8EAED] bg-[#C4933F]/5">
            <p className="text-[#C4933F] text-xs font-semibold tracking-[0.12em] uppercase" style={{ fontFamily: "var(--font-body)" }}>
              Wings Global Trade — Todo incluido
            </p>
          </div>
          {FEATURES.map((feat, i) => (
            <div key={feat.label} className={`flex items-start gap-4 px-6 py-4 ${i < FEATURES.length - 1 ? "border-b border-[#FAFAFA]" : ""}`}>
              <div className="w-6 h-6 rounded-full bg-[#C4933F] flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="11" height="11" fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <p className="text-[#1C1A16] text-sm leading-snug" style={{ fontFamily: "var(--font-body)" }}>{feat.label}</p>
            </div>
          ))}
        </div>

        {/* Desktop comparison table */}
        <div className="hidden md:block bg-white rounded-2xl shadow-[0_2px_24px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] border-b border-[#E8EAED]">
            <div className="px-8 py-5" />
            <div className="px-4 py-5 text-center border-l border-[#E8EAED] bg-[#C4933F]/5">
              <p className="text-[#C4933F] text-xs font-semibold tracking-[0.12em] uppercase" style={{ fontFamily: "var(--font-body)" }}>Wings</p>
            </div>
            <div className="px-4 py-5 text-center border-l border-[#E8EAED]">
              <p className="text-[#6B6560] text-xs font-medium tracking-[0.1em] uppercase" style={{ fontFamily: "var(--font-body)" }}>Agente de carga</p>
            </div>
            <div className="px-4 py-5 text-center border-l border-[#E8EAED]">
              <p className="text-[#6B6560] text-xs font-medium tracking-[0.1em] uppercase" style={{ fontFamily: "var(--font-body)" }}>DIY</p>
            </div>
          </div>
          {FEATURES.map((feat, i) => (
            <div key={feat.label} className={`grid grid-cols-[2fr_1fr_1fr_1fr] ${i < FEATURES.length - 1 ? "border-b border-[#FAFAFA]" : ""} ${i % 2 === 1 ? "bg-[#F5F5F5]" : ""}`}>
              <div className="px-8 py-4 flex items-center">
                <p className="text-[#1C1A16] text-sm leading-snug" style={{ fontFamily: "var(--font-body)" }}>{feat.label}</p>
              </div>
              <div className="border-l border-[#E8EAED] bg-[#C4933F]/[0.03] flex items-center justify-center py-4">
                <Check value={feat.wings as Indicator} highlight />
              </div>
              <div className="border-l border-[#E8EAED] flex items-center justify-center py-4">
                <Check value={feat.agent as Indicator} />
              </div>
              <div className="border-l border-[#E8EAED] flex items-center justify-center py-4">
                <Check value={feat.diy as Indicator} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-6">
            {[
              { icon: <div className="w-4 h-4 rounded-full bg-[#C4933F] flex items-center justify-center"><svg width="8" height="8" fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg></div>, label: "Incluido" },
              { icon: <div className="w-4 h-4 rounded-full border border-[#6B6560]/40 flex items-center justify-center"><svg width="8" height="8" fill="none" stroke="#6B6560" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg></div>, label: "Parcial" },
              { icon: <svg width="12" height="12" fill="none" stroke="#1C1A16" strokeOpacity={0.25} strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>, label: "No incluido" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                {icon}
                <span className="text-[#6B6560] text-xs" style={{ fontFamily: "var(--font-body)" }}>{label}</span>
              </div>
            ))}
          </div>
          <a
            href="#contacto"
            className="inline-flex items-center gap-2 bg-[#C4933F] hover:bg-[#D4A855] text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors duration-200"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Inicia tu proyecto
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
