export default function WingsHero() {
  return (
    <section className="relative min-h-[92vh] bg-[#001E50] flex flex-col items-center justify-center text-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-bg.png"
          alt=""
          className="w-full h-full object-cover object-center"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[#001E50]/75" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#001E50]/20 via-[#001E50]/40 to-[#001E50]/80" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-28 md:py-36">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-10">
          <div className="w-1.5 h-1.5 rounded-full bg-[#C4933F]" />
          <p
            className="text-white/70 text-xs font-medium tracking-[0.12em] uppercase"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Perú · Bolivia · Chile · Paraguay · Argentina · Uruguay
          </p>
        </div>

        <h1
          className="text-white font-semibold text-4xl md:text-5xl lg:text-6xl leading-[1.08] tracking-tight mb-8"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Importa cualquier producto desde Asia. Precio landed total. Sin intermediarios.
        </h1>

        <p
          className="text-white/85 text-lg md:text-xl leading-relaxed mb-12 max-w-2xl mx-auto"
          style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
        >
          Un asesor gestiona el proveedor, el flete, la zona franca y los aranceles — y te entrega un solo número
          firmado antes de que confirmes cualquier compra. Entregamos en 6 países.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="#contacto"
            className="inline-flex items-center justify-center gap-2 bg-[#C4933F] hover:bg-[#D4A855] text-white font-semibold px-8 py-3.5 rounded-full text-sm transition-colors duration-200"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Solicitar cotización landed
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <a
            href="#como-funciona"
            className="inline-flex items-center justify-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white font-medium px-8 py-3.5 rounded-full text-sm transition-colors duration-200"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Cómo funciona
          </a>
        </div>

        <div className="mt-20 pt-12 border-t border-white/8 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {[
            { n: "6",     label: "países atendidos",    sub: "Perú, Bolivia, Chile, Paraguay, Argentina, Uruguay" },
            { n: "2",     label: "hubs zona franca",    sub: "ZOFRI Iquique + ZOFRATACNA Tacna" },
            { n: "24 h",  label: "cotización landed",   sub: "Con aranceles, flete y entrega incluidos" },
            { n: "100%",  label: "en español",          sub: "Asesoría, documentos y soporte" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p
                className="text-[#C4933F] text-4xl md:text-5xl font-bold mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {s.n}
              </p>
              <p className="text-white text-sm font-medium mb-1" style={{ fontFamily: "var(--font-body)" }}>{s.label}</p>
              <p className="text-white/55 text-xs leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#001E50] via-[#001E50]/60 to-transparent pointer-events-none" />
    </section>
  );
}
