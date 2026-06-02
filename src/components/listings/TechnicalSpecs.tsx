import type { Listing } from "@/types";

type Row     = { label: string; value: string };
type Section = { title: string; rows: Row[] };

// ── Value helpers (return null when missing so we can filter cleanly) ─────────

function str(v: string | undefined | null): string | null {
  return v && v.trim() ? v.trim() : null;
}
function num(v: number | undefined | null, unit = ""): string | null {
  if (v == null) return null;
  return `${v.toLocaleString("es")}${unit ? " " + unit : ""}`;
}
function bool(v: boolean | undefined | null): string | null {
  if (v === true)  return "Sí";
  if (v === false) return "No";
  return null;
}
function row(label: string, value: string | null): Row | null {
  return value ? { label, value } : null;
}
function section(title: string, candidates: (Row | null)[]): Section | null {
  const rows = candidates.filter((r): r is Row => r !== null);
  return rows.length ? { title, rows } : null;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TechnicalSpecs({ listing }: { listing: Listing }) {
  const d   = listing.details ?? {};
  const eng = d.engine              ?? {};
  const tx  = d.transmission_details ?? {};
  const pto = d.pto                 ?? {};
  const hyd = d.hydraulics          ?? {};
  const rh  = d.rear_hitch          ?? {};
  const fh  = d.front_hitch         ?? {};
  const tir = d.tires               ?? {};
  const dim = d.dimensions          ?? {};
  const elc = d.electrical          ?? {};
  const cab = d.cabin               ?? {};

  // Tire value: prefer the combined "front" field, fall back to left+right pair
  const tireFront = str(tir.front) ?? (tir.front_left || tir.front_right
    ? [tir.front_left, tir.front_right].filter(Boolean).join(" / ")
    : null);
  const tireRear  = str(tir.rear) ?? (tir.rear_left || tir.rear_right
    ? [tir.rear_left, tir.rear_right].filter(Boolean).join(" / ")
    : null);

  const sections: Section[] = [
    section("Motor", [
      row("Fabricante",           str(eng.manufacturer)),
      row("Modelo",               str(eng.model)),
      row("Combustible",          str(eng.fuel_type)),
      row("Cilindrada",           num(eng.displacement_cc, "cc")),
      row("Cilindros",            num(eng.cylinders)),
      row("RPM nominal",          num(eng.rpm_rated, "rpm")),
      row("Par máximo",           num(eng.max_torque_nm, "Nm")),
      row("Norma de emisiones",   str(eng.emissions_standard)),
    ]),
    section("Transmisión", [
      row("Tipo",                 str(listing.transmission ?? tx.type ?? null)),
      row("Marchas adelante",     num(tx.forward_gears)),
      row("Marchas atrás",        num(tx.reverse_gears)),
      row("Tracción",             str(listing.drive_type ?? tx.drive_type ?? null)),
      row("Mando TDF",            str(tx.pto_drive)),
      row("Marcha tortuga",       bool(tx.creeper)),
      row("Dirección reversible", bool(tx.reversible)),
    ]),
    section("Toma de Fuerza (TDF)", [
      row("TDF trasera",          bool(pto.rear_pto)),
      row("RPM TDF trasera",      str(pto.rear_pto_rpm)),
      row("CV TDF trasera",       num(pto.rear_pto_hp, "hp")),
      row("TDF delantera",        bool(pto.front_pto)),
      row("RPM TDF delantera",    str(pto.front_pto_rpm)),
      row("CV TDF delantera",     num(pto.front_pto_hp, "hp")),
    ]),
    section("Hidráulicos", [
      row("Caudal de bomba",           num(hyd.pump_flow_lpm, "L/min")),
      row("Presión máxima",            num(hyd.max_pressure_bar, "bar")),
      row("Distribuidores traseros",   num(hyd.rear_remote_valves)),
      row("Distribuidores delanteros", num(hyd.front_remote_valves)),
      row("ISOBUS",                    bool(hyd.isobus)),
      row("Load Sensing",              bool(hyd.load_sensing)),
      row("Control electrónico",       bool(hyd.electronic_control)),
    ]),
    section("Enganche trasero", [
      row("Categoría 3 puntos",    str(rh.three_point_category)),
      row("Capacidad de elevación", num(rh.lift_capacity_kg, "kg")),
      row("Enganche rápido",        bool(rh.quick_hitch)),
    ]),
    section("Enganche delantero", [
      row("Enganche delantero",     bool(fh.front_hitch)),
      row("Categoría",              str(fh.front_hitch_category)),
      row("Capacidad de elevación", num(fh.front_lift_capacity_kg, "kg")),
    ]),
    section("Neumáticos", [
      row("Delanteros",          tireFront),
      row("Traseros",            tireRear),
      row("Rueda de repuesto",   bool(tir.spare)),
    ]),
    section("Dimensiones y peso", [
      row("Longitud",                  num(dim.length_mm, "mm")),
      row("Anchura",                   num(dim.width_mm, "mm")),
      row("Altura",                    num(dim.height_mm, "mm")),
      row("Peso operativo",            num(dim.operating_weight_kg, "kg")),
      row("Peso máximo admisible",     num(dim.max_allowed_weight_kg, "kg")),
      row("Batalla",                   num(dim.wheelbase_mm, "mm")),
      row("Guardia al suelo",          num(dim.ground_clearance_mm, "mm")),
      row("Radio de giro",             num(dim.turning_radius_m, "m")),
      row("Carga eje delantero",       num(dim.front_axle_load_kg, "kg")),
      row("Carga eje trasero",         num(dim.rear_axle_load_kg, "kg")),
    ]),
    section("Eléctrico", [
      row("Voltaje",             num(elc.voltage_v, "V")),
      row("Alternador",          num(elc.alternator_a, "A")),
      row("Batería",             num(elc.battery_ah, "Ah")),
      row("Telemática",          bool(elc.telematics)),
      row("Sistema telemático",  str(elc.telematics_system)),
    ]),
    section("Cabina y equipamiento", [
      row("Cabina cerrada",            bool(cab.cabin)),
      row("Aire acondicionado",        bool(cab.air_conditioning)),
      row("Calefacción",               bool(cab.heating)),
      row("Asiento suspendido",        bool(cab.suspension_seat)),
      row("Radio",                     bool(cab.radio)),
      row("Preparado cargador",        bool(cab.front_loader_ready)),
      row("Preparado GPS",             bool(cab.gps_ready)),
      row("Techo solar",               bool(cab.sunroof)),
      row("Limpiaparabrisas trasero",  bool(cab.rear_window_wiper)),
    ]),
  ].filter((s): s is Section => s !== null);

  if (sections.length === 0) return null;

  return (
    <div className="mt-10">
      <p
        className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9B9590]"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Ficha técnica completa
      </p>

      <div className="space-y-4">
        {sections.map((sec) => (
          <div key={sec.title} className="overflow-hidden rounded-xl border border-[#E8E4DB]">
            {/* Section header */}
            <div className="bg-[#EEE9E0] px-4 py-2.5">
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C4933F]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {sec.title}
              </p>
            </div>

            {/* Rows */}
            <dl className="divide-y divide-[#E8E4DB]">
              {sec.rows.map((r, i) => (
                <div
                  key={r.label}
                  className={`flex items-center justify-between gap-4 px-4 py-2.5 ${
                    i % 2 === 1 ? "bg-[#FAF8F4]" : "bg-white"
                  }`}
                >
                  <dt
                    className="text-xs text-[#9B9590]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {r.label}
                  </dt>
                  <dd
                    className="text-right text-xs font-medium text-[#1C1A16]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {r.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
