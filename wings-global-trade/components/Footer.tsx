export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#001E50] pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="md:col-span-1">
            <a href="#" className="block mb-5">
              {/* stacked logo (wings graphic on top, wordmark below) */}
              <img
                src="/wings-logo1.svg"
                alt="Wings Global Trade"
                className="h-16 w-auto brightness-0 invert"
              />
            </a>
            <p className="text-white/35 text-sm leading-relaxed max-w-[200px]" style={{ fontFamily: "var(--font-body)" }}>
              Importación gestionada desde Asia para empresas en Latinoamérica.
            </p>
          </div>

          {/* Hubs */}
          <div>
            <p className="text-white/30 text-xs font-medium tracking-[0.18em] uppercase mb-5" style={{ fontFamily: "var(--font-body)" }}>
              Hubs operativos
            </p>
            <div className="space-y-3">
              {[
                { name: "Iquique, Chile", zone: "ZOFRI" },
                { name: "Tacna, Perú", zone: "ZOFRATACNA" },
                { name: "Buenaventura / Cartagena", zone: "Colombia" },
              ].map((hub) => (
                <div key={hub.name}>
                  <p className="text-white/55 text-sm" style={{ fontFamily: "var(--font-body)" }}>{hub.name}</p>
                  <p className="text-white/25 text-xs mt-0.5" style={{ fontFamily: "var(--font-body)" }}>{hub.zone}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-white/30 text-xs font-medium tracking-[0.18em] uppercase mb-5" style={{ fontFamily: "var(--font-body)" }}>
              Navegación
            </p>
            <div className="space-y-3">
              {[
                ["Cómo funciona", "#como-funciona"],
                ["Zonas Francas", "#zonas-francas"],
                ["Categorías", "#categorias"],
                ["Inicia tu proyecto", "#contacto"],
              ].map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  className="block text-white/45 hover:text-white text-sm transition-colors duration-200"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Markets */}
          <div>
            <p className="text-white/30 text-xs font-medium tracking-[0.18em] uppercase mb-5" style={{ fontFamily: "var(--font-body)" }}>
              Mercados
            </p>
            <div className="flex flex-wrap gap-2">
              {["Colombia", "Perú", "Bolivia", "Chile", "Paraguay", "Argentina", "Uruguay"].map((m) => (
                <span
                  key={m}
                  className="text-xs bg-white/[0.06] text-white/45 px-2.5 py-1 rounded-full"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/8 pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <p className="text-white/20 text-xs" style={{ fontFamily: "var(--font-body)" }}>
            © {year} Wings Global Trade. Todos los derechos reservados.
          </p>
          <p className="text-white/20 text-xs" style={{ fontFamily: "var(--font-body)" }}>
            Importación gestionada · Asia → Latinoamérica
          </p>
        </div>
      </div>
    </footer>
  );
}
