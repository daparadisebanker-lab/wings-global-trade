const CORRIDORS = [
  {
    hub: "ZOFRI",
    location: "Iquique, Chile",
    badge: "Cono Sur",
    description: "Hub principal para los mercados del Cono Sur y Bolivia. Consolidación regional y despacho multi-destino desde una sola bodega.",
    routes: [
      { dest: "Bolivia",           time: "35–45 días", via: "Arica → La Paz / Santa Cruz" },
      { dest: "Paraguay",          time: "45–55 días", via: "Camión directo desde Iquique" },
      { dest: "Argentina (norte)", time: "40–50 días", via: "Ruta terrestre Cono Sur" },
      { dest: "Uruguay",           time: "50–60 días", via: "Vía Buenos Aires" },
      { dest: "Norte de Chile",    time: "30–40 días", via: "Distribución local" },
    ],
  },
  {
    hub: "ZOFRATACNA",
    location: "Tacna, Perú",
    badge: "Andes",
    description: "Plataforma logística para el mercado peruano y corredores andinos. Procedimientos aduaneros propios para almacenamiento y redistribución.",
    routes: [
      { dest: "Perú (todo el país)",  time: "30–40 días", via: "Red vial nacional" },
      { dest: "Bolivia (ruta andina)", time: "35–45 días", via: "Vía Desaguadero" },
      { dest: "Ecuador",              time: "45–55 días", via: "Carretera Panamericana" },
    ],
  },
];

export default function WingsCorridors() {
  return (
    <section id="corredores" className="bg-[#0D1B2A] py-28 md:py-36">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-[#C4933F] text-[10px] font-semibold tracking-[0.12em] uppercase mb-5" style={{ fontFamily: "var(--font-body)" }}>
            Corredores de importación
          </p>
          <h2
            className="text-white text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight max-w-3xl mx-auto leading-[1.1]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            De fábrica en Asia a tu ciudad, sin sorpresas.
          </h2>
          <p className="text-white/50 text-lg mt-5 max-w-xl mx-auto" style={{ fontFamily: "var(--font-body)" }}>
            Tránsito marítimo Asia → Hub:{" "}
            <span className="text-[#C4933F] font-medium">25–35 días</span>.
            Los tiempos abajo incluyen distribución al destino final.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {CORRIDORS.map((c) => (
            <div
              key={c.hub}
              className="bg-white/[0.05] backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden flex flex-col"
            >
              <div className="p-7 border-b border-white/8">
                <div className="flex items-start justify-between mb-4">
                  <span className="inline-block bg-[#C4933F]/15 text-[#C4933F] text-xs font-semibold tracking-[0.12em] uppercase rounded-full px-3 py-1" style={{ fontFamily: "var(--font-body)" }}>
                    {c.badge}
                  </span>
                </div>
                <h3
                  className="text-white text-2xl font-semibold mb-1 tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {c.hub}
                </h3>
                <p className="text-white/40 text-xs font-mono mb-4">{c.location}</p>
                <p className="text-white/55 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>{c.description}</p>
              </div>

              <div className="flex-1 p-7">
                <p className="text-white/30 text-xs font-medium tracking-[0.15em] uppercase mb-5" style={{ fontFamily: "var(--font-body)" }}>
                  Destinos y tránsito
                </p>
                <div className="space-y-0">
                  {c.routes.map((r, i) => (
                    <div key={r.dest} className={`py-3.5 ${i < c.routes.length - 1 ? "border-b border-white/[0.06]" : ""}`}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-white/85 text-sm font-medium" style={{ fontFamily: "var(--font-body)" }}>{r.dest}</p>
                        <p className="text-[#C4933F] text-xs font-mono">{r.time}</p>
                      </div>
                      <p className="text-white/30 text-xs" style={{ fontFamily: "var(--font-body)" }}>{r.via}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-white/25 text-xs mt-10 max-w-xl mx-auto leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
          Tiempos no incluyen despacho aduanero en destino (3–10 días adicionales). Productos con restricciones especiales pueden requerir tiempo adicional.
        </p>
      </div>
    </section>
  );
}
