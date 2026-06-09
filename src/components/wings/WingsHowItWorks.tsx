"use client";

import { useFadeIn, useStaggerFadeIn } from "@/hooks/useFadeIn";

const STEPS = [
  {
    number: "01",
    title: "Describe tu producto",
    body: "Cuéntanos qué necesitas importar en español. Nuestro equipo hace las preguntas correctas: destino, volumen, certificaciones, urgencia y presupuesto.",
    icon: <ChatIcon />,
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
    icon: <CalculatorIcon />,
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
    icon: <WarehouseIcon />,
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
    icon: <TruckIcon />,
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

export default function WingsHowItWorks() {
  const headerRef = useFadeIn();
  const gridRef   = useStaggerFadeIn(100);

  return (
    <section id="como-funciona" className="bg-[#FAFAFA] py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div ref={headerRef as React.RefObject<HTMLDivElement>} className="fade-up text-center mb-20">
          <p className="text-[#C4933F] text-[10px] font-semibold tracking-[0.12em] uppercase mb-5" style={{ fontFamily: "var(--font-body)" }}>
            El proceso
          </p>
          <h2
            className="text-[#1C1A16] text-4xl md:text-5xl lg:text-[64px] font-semibold tracking-tight max-w-3xl mx-auto leading-[1.08]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            De la idea al almacén, en cuatro pasos.
          </h2>
          <p className="text-[#6B6560] text-lg mt-5 max-w-xl mx-auto leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
            Cada paso tiene un entregable claro — sin esperas sin respuesta ni costos ocultos.
          </p>
        </div>

        <div ref={gridRef as React.RefObject<HTMLDivElement>} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="stagger-item bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.07)] overflow-hidden flex flex-col"
            >
              <div className="p-8 flex-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#C4933F]/10 flex items-center justify-center text-[#C4933F]">
                    {step.icon}
                  </div>
                  <span className="text-[#C4933F] text-xs font-mono tracking-[0.3em] font-medium">
                    {step.number}
                  </span>
                </div>
                <h3
                  className="text-[#1C1A16] text-2xl font-semibold mb-3 leading-snug tracking-normal"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {step.title}
                </h3>
                <p className="text-[#6B6560] text-base leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>{step.body}</p>
              </div>

              <div className="border-t border-[#E8EAED] bg-[#FAFAFA] px-8 py-6">
                <p className="text-[#C4933F] text-xs font-medium tracking-[0.15em] uppercase mb-4" style={{ fontFamily: "var(--font-body)" }}>
                  {step.panel.label}
                </p>
                <ul className="space-y-2.5">
                  {step.panel.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="mt-2 w-1 h-1 rounded-full bg-[#C4933F] flex-shrink-0" />
                      <p className="text-[#1C1A16] text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ChatIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  );
}
function CalculatorIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z" />
    </svg>
  );
}
function WarehouseIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
    </svg>
  );
}
function TruckIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  );
}
