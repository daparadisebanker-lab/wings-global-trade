import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { getListingById } from "@data/listings";
import ImageGallery from "@/components/listings/ImageGallery";
import InquiryForm from "@/components/inquiries/InquiryForm";
import { CURRENCY_COOKIE, DEFAULT_CURRENCY, formatPrice } from "@/lib/currencies";
import type {
  ListingDetails, EngineDetails, TransmissionDetails, CabinDetails,
  PtoDetails, HydraulicsDetails, RearHitchDetails, FrontHitchDetails,
  TiresDetails, DimensionsDetails, ElectricalDetails,
} from "@/types";

interface Props { params: { id: string } }

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await getListingById(params.id);
  if (!listing) return {};
  return {
    title: `${listing.year ?? ""} ${listing.brand} ${listing.model} — Euro Global Machinery`.trim(),
    description: `${listing.brand} ${listing.model} ${listing.year ?? ""} — ${listing.horsepower ?? "—"} hp, ${listing.hours_used?.toLocaleString() ?? "—"} horas. Disponible en ${listing.country ?? "—"}. Solicita cotización con precio landed total.`,
  };
}

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1598520106830-8c45c2035460?w=800&q=80";

const COND: Record<string, string> = {
  new: "Nuevo",
  used: "Usado",
  refurbished: "Reacondicionado",
};

// ── Spanish spec label map ────────────────────────────────────────────────────
const S: Record<string, string> = {
  "Max speed": "Velocidad máxima",
  "Warranty": "Garantía",
  "Registration year": "Año de registro",
  "Serial number": "Número de serie",
  "Service history": "Historial de servicio",
  "First owner": "Primer propietario",
  "VAT excluded": "IVA excluido",
  "Manufacturer": "Fabricante",
  "Engine model": "Modelo de motor",
  "Displacement": "Cilindrada",
  "Cylinders": "Cilindros",
  "Emissions standard": "Norma de emisiones",
  "Fuel type": "Tipo de combustible",
  "Rated RPM": "RPM nominal",
  "Max torque": "Par máximo",
  "Transmission type": "Tipo de transmisión",
  "Drive type": "Tipo de tracción",
  "Forward gears": "Marchas adelante",
  "Reverse gears": "Marchas atrás",
  "Creeper (super low gears)": "Rastrero",
  "Reversible driving system": "Conducción reversible",
  "PTO drive": "Accionamiento PTO",
  "Cabin": "Cabina",
  "Air conditioning": "Aire acondicionado",
  "Heating": "Calefacción",
  "Suspension seat": "Asiento suspendido",
  "Radio": "Radio",
  "Front loader ready": "Preparado cargador frontal",
  "GPS ready": "Preparado GPS",
  "Sunroof": "Techo solar",
  "Rear window wiper": "Limpiaparabrisas trasero",
  "Rear PTO": "PTO trasero",
  "Rear PTO RPM": "RPM PTO trasero",
  "Rear PTO power": "Potencia PTO trasero",
  "Front PTO": "PTO delantero",
  "Front PTO RPM": "RPM PTO delantero",
  "Front PTO power": "Potencia PTO delantero",
  "Pump flow": "Caudal de bomba",
  "Max pressure": "Presión máxima",
  "Rear remote valves": "Válvulas remotas traseras",
  "Front remote valves": "Válvulas remotas delanteras",
  "ISOBUS": "ISOBUS",
  "Load sensing": "Sensado de carga",
  "Electronic control": "Control electrónico",
  "Three-point category": "Categoría tres puntos",
  "Lift capacity": "Capacidad de elevación",
  "Quick hitch": "Enganche rápido",
  "Front hitch": "Enganche delantero",
  "Category": "Categoría",
  "Front lift capacity": "Cap. elevación delantera",
  "Front left tire": "Neumático del. izq.",
  "Front right tire": "Neumático del. der.",
  "Rear left tire": "Neumático tras. izq.",
  "Rear right tire": "Neumático tras. der.",
  "Front tire": "Neumático delantero",
  "Rear tire": "Neumático trasero",
  "Spare": "Repuesto",
  "Operating weight": "Peso en servicio",
  "Max allowed weight": "Peso máx. permitido",
  "Front axle load": "Carga eje delantero",
  "Rear axle load": "Carga eje trasero",
  "Wheelbase": "Batalla",
  "Length": "Longitud",
  "Width": "Ancho",
  "Height": "Altura",
  "Ground clearance": "Distancia al suelo",
  "Turning radius": "Radio de giro",
  "Voltage": "Voltaje",
  "Alternator": "Alternador",
  "Battery": "Batería",
  "Telematics": "Telemática",
  "Telematics system": "Sistema telemático",
};

function sp(key: string) { return S[key] ?? key; }

// ── Helper components ─────────────────────────────────────────────────────────

function YesNo({ v }: { v: boolean | undefined }) {
  if (v == null) return <span className="text-[#9B9590]">—</span>;
  return v ? (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#C4933F]/15 text-[#C4933F]" aria-label="sí">
      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l3.5 3.5L13 5" />
      </svg>
    </span>
  ) : (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#E8E4DB] text-[#9B9590]" aria-label="no">
      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4l8 8M12 4l-8 8" />
      </svg>
    </span>
  );
}

type Row = { label: string; value: React.ReactNode };

function SpecGroup({ title, rows }: { title: string; rows: Row[] }) {
  const visible = rows.filter((r) => r.value !== undefined && r.value !== null && r.value !== "");
  if (!visible.length) return null;
  return (
    <div className="border-t border-[#E8E4DB] px-7 py-6 first:border-t-0">
      <h3
        className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C4933F]"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {title}
      </h3>
      <dl className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
        {visible.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between gap-4 border-b border-[#F0EDE8] py-2 last:border-b-0"
          >
            <dt className="text-sm text-[#6B6560]" style={{ fontFamily: "var(--font-body)" }}>
              {r.label}
            </dt>
            <dd className="text-sm font-medium text-[#1C1A16]" style={{ fontFamily: "var(--font-body)" }}>
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function DetailedSpecs({ details }: { details: ListingDetails }) {
  const {
    engine, transmission_details: tr, cabin, pto, rear_hitch, front_hitch,
    hydraulics, tires, dimensions: dim, electrical,
    vat_excluded, max_speed_kmh, warranty, registration_year,
    serial_number, service_history, first_owner,
  } = details;

  return (
    <div className="rounded-2xl border border-[#E8E4DB] bg-white overflow-hidden">
      <div className="border-b border-[#E8E4DB] px-7 py-5">
        <h2 className="text-lg font-semibold text-[#1C1A16]" style={{ fontFamily: "var(--font-display)" }}>
          Especificaciones técnicas
        </h2>
      </div>

      <SpecGroup title="General" rows={[
        { label: sp("Max speed"),        value: max_speed_kmh     ? `${max_speed_kmh} km/h`   : undefined },
        { label: sp("Warranty"),         value: warranty },
        { label: sp("Registration year"),value: registration_year },
        { label: sp("Serial number"),    value: serial_number },
        { label: sp("Service history"),  value: service_history != null ? <YesNo v={service_history} /> : undefined },
        { label: sp("First owner"),      value: first_owner     != null ? <YesNo v={first_owner} />     : undefined },
        { label: sp("VAT excluded"),     value: vat_excluded    != null ? <YesNo v={vat_excluded} />    : undefined },
      ]} />

      {engine && <SpecGroup title="Motor" rows={[
        { label: sp("Manufacturer"),       value: engine.manufacturer },
        { label: sp("Engine model"),       value: engine.model },
        { label: sp("Displacement"),       value: engine.displacement_cc ? `${engine.displacement_cc.toLocaleString()} cc` : undefined },
        { label: sp("Cylinders"),          value: engine.cylinders },
        { label: sp("Emissions standard"), value: engine.emissions_standard },
        { label: sp("Fuel type"),          value: engine.fuel_type },
        { label: sp("Rated RPM"),          value: engine.rpm_rated     ? `${engine.rpm_rated} rpm`    : undefined },
        { label: sp("Max torque"),         value: engine.max_torque_nm ? `${engine.max_torque_nm} Nm` : undefined },
      ]} />}

      {tr && <SpecGroup title="Transmisión" rows={[
        { label: sp("Transmission type"),         value: tr.type },
        { label: sp("Drive type"),                value: tr.drive_type },
        { label: sp("Forward gears"),             value: tr.forward_gears },
        { label: sp("Reverse gears"),             value: tr.reverse_gears },
        { label: sp("Creeper (super low gears)"), value: tr.creeper    != null ? <YesNo v={tr.creeper} />    : undefined },
        { label: sp("Reversible driving system"), value: tr.reversible != null ? <YesNo v={tr.reversible} /> : undefined },
        { label: sp("PTO drive"),                 value: tr.pto_drive },
      ]} />}

      {cabin && <SpecGroup title="Cabina / Plataforma" rows={[
        { label: sp("Cabin"),              value: cabin.cabin              != null ? <YesNo v={cabin.cabin} />              : undefined },
        { label: sp("Air conditioning"),   value: cabin.air_conditioning   != null ? <YesNo v={cabin.air_conditioning} />   : undefined },
        { label: sp("Heating"),            value: cabin.heating            != null ? <YesNo v={cabin.heating} />            : undefined },
        { label: sp("Suspension seat"),    value: cabin.suspension_seat    != null ? <YesNo v={cabin.suspension_seat} />    : undefined },
        { label: sp("Radio"),              value: cabin.radio              != null ? <YesNo v={cabin.radio} />              : undefined },
        { label: sp("Front loader ready"), value: cabin.front_loader_ready != null ? <YesNo v={cabin.front_loader_ready} /> : undefined },
        { label: sp("GPS ready"),          value: cabin.gps_ready          != null ? <YesNo v={cabin.gps_ready} />          : undefined },
        { label: sp("Sunroof"),            value: cabin.sunroof            != null ? <YesNo v={cabin.sunroof} />            : undefined },
        { label: sp("Rear window wiper"),  value: cabin.rear_window_wiper  != null ? <YesNo v={cabin.rear_window_wiper} />  : undefined },
      ]} />}

      {pto && <SpecGroup title="Toma de Fuerza (PTO)" rows={[
        { label: sp("Rear PTO"),        value: pto.rear_pto       != null ? <YesNo v={pto.rear_pto} />  : undefined },
        { label: sp("Rear PTO RPM"),    value: pto.rear_pto_rpm },
        { label: sp("Rear PTO power"),  value: pto.rear_pto_hp    ? `${pto.rear_pto_hp} hp`  : undefined },
        { label: sp("Front PTO"),       value: pto.front_pto      != null ? <YesNo v={pto.front_pto} /> : undefined },
        { label: sp("Front PTO RPM"),   value: pto.front_pto_rpm },
        { label: sp("Front PTO power"), value: pto.front_pto_hp   ? `${pto.front_pto_hp} hp` : undefined },
      ]} />}

      {hydraulics && <SpecGroup title="Hidráulica" rows={[
        { label: sp("Pump flow"),           value: hydraulics.pump_flow_lpm       ? `${hydraulics.pump_flow_lpm} L/min` : undefined },
        { label: sp("Max pressure"),        value: hydraulics.max_pressure_bar    ? `${hydraulics.max_pressure_bar} bar` : undefined },
        { label: sp("Rear remote valves"),  value: hydraulics.rear_remote_valves },
        { label: sp("Front remote valves"), value: hydraulics.front_remote_valves },
        { label: sp("ISOBUS"),              value: hydraulics.isobus           != null ? <YesNo v={hydraulics.isobus} />            : undefined },
        { label: sp("Load sensing"),        value: hydraulics.load_sensing     != null ? <YesNo v={hydraulics.load_sensing} />      : undefined },
        { label: sp("Electronic control"),  value: hydraulics.electronic_control != null ? <YesNo v={hydraulics.electronic_control} /> : undefined },
      ]} />}

      {rear_hitch && <SpecGroup title="Enganche Trasero" rows={[
        { label: sp("Three-point category"), value: rear_hitch.three_point_category },
        { label: sp("Lift capacity"),        value: rear_hitch.lift_capacity_kg ? `${rear_hitch.lift_capacity_kg.toLocaleString()} kg` : undefined },
        { label: sp("Quick hitch"),          value: rear_hitch.quick_hitch != null ? <YesNo v={rear_hitch.quick_hitch} /> : undefined },
      ]} />}

      {front_hitch && <SpecGroup title="Enganche Delantero" rows={[
        { label: sp("Front hitch"),         value: front_hitch.front_hitch              != null ? <YesNo v={front_hitch.front_hitch} /> : undefined },
        { label: sp("Category"),            value: front_hitch.front_hitch_category },
        { label: sp("Front lift capacity"), value: front_hitch.front_lift_capacity_kg ? `${front_hitch.front_lift_capacity_kg.toLocaleString()} kg` : undefined },
      ]} />}

      {tires && <SpecGroup title="Neumáticos" rows={[
        { label: sp("Front left tire"),  value: tires.front_left },
        { label: sp("Front right tire"), value: tires.front_right },
        { label: sp("Rear left tire"),   value: tires.rear_left },
        { label: sp("Rear right tire"),  value: tires.rear_right },
        { label: sp("Front tire"),       value: tires.front },
        { label: sp("Rear tire"),        value: tires.rear },
        { label: sp("Spare"),            value: tires.spare != null ? <YesNo v={tires.spare} /> : undefined },
      ]} />}

      {dim && <SpecGroup title="Pesos y Dimensiones" rows={[
        { label: sp("Operating weight"),   value: dim.operating_weight_kg   ? `${dim.operating_weight_kg.toLocaleString()} kg`   : undefined },
        { label: sp("Max allowed weight"), value: dim.max_allowed_weight_kg ? `${dim.max_allowed_weight_kg.toLocaleString()} kg` : undefined },
        { label: sp("Front axle load"),    value: dim.front_axle_load_kg    ? `${dim.front_axle_load_kg.toLocaleString()} kg`    : undefined },
        { label: sp("Rear axle load"),     value: dim.rear_axle_load_kg     ? `${dim.rear_axle_load_kg.toLocaleString()} kg`     : undefined },
        { label: sp("Wheelbase"),          value: dim.wheelbase_mm          ? `${dim.wheelbase_mm.toLocaleString()} mm`          : undefined },
        { label: sp("Length"),             value: dim.length_mm             ? `${dim.length_mm.toLocaleString()} mm`             : undefined },
        { label: sp("Width"),              value: dim.width_mm              ? `${dim.width_mm.toLocaleString()} mm`              : undefined },
        { label: sp("Height"),             value: dim.height_mm             ? `${dim.height_mm.toLocaleString()} mm`             : undefined },
        { label: sp("Ground clearance"),   value: dim.ground_clearance_mm   ? `${dim.ground_clearance_mm} mm`                   : undefined },
        { label: sp("Turning radius"),     value: dim.turning_radius_m      ? `${dim.turning_radius_m} m`                       : undefined },
      ]} />}

      {electrical && <SpecGroup title="Eléctrico" rows={[
        { label: sp("Voltage"),          value: electrical.voltage_v    ? `${electrical.voltage_v}V`    : undefined },
        { label: sp("Alternator"),       value: electrical.alternator_a ? `${electrical.alternator_a}A` : undefined },
        { label: sp("Battery"),          value: electrical.battery_ah   ? `${electrical.battery_ah} Ah` : undefined },
        { label: sp("Telematics"),       value: electrical.telematics        != null ? <YesNo v={electrical.telematics} /> : undefined },
        { label: sp("Telematics system"),value: electrical.telematics_system },
      ]} />}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function TractorDetailPage({ params }: Props) {
  const cookieStore = await cookies();
  const currency = cookieStore.get(CURRENCY_COOKIE)?.value ?? DEFAULT_CURRENCY;
  const listing  = await getListingById(params.id);
  if (!listing) notFound();

  const condLabel = COND[listing.condition] ?? listing.condition;
  const galleryImages = listing.images?.length ? listing.images : [PLACEHOLDER];
  const listingTitle  = `${listing.year ?? ""} ${listing.brand} ${listing.model}`.trim();
  const d = listing.details;

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "51999000000";
  const waText = encodeURIComponent(
    `Hola, estoy interesado en el ${listingTitle}. ¿Está disponible?`
  );
  const waLink = `https://wa.me/${waNumber}?text=${waText}`;

  const baseSpecs = [
    { label: "Marca",         value: listing.brand },
    { label: "Modelo",        value: listing.model },
    { label: "Año",           value: listing.year },
    { label: "Condición",     value: condLabel },
    { label: "Potencia",      value: listing.horsepower ? `${listing.horsepower} hp` : "—" },
    { label: "Horas de uso",  value: listing.hours_used != null ? `${listing.hours_used.toLocaleString()} hrs` : "—" },
    { label: "Transmisión",   value: listing.transmission ?? "—" },
    { label: "Tracción",      value: listing.drive_type ?? "—" },
    { label: "Ubicación",     value: `${listing.location ?? ""}, ${listing.country ?? ""}`.replace(/^, |, $/, "") },
  ];

  return (
    <div className="min-h-screen bg-[#F8F6F0]">

      {/* ── Navy header ── */}
      <div className="bg-[#001E50]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 py-4 text-xs text-white/40" style={{ fontFamily: "var(--font-body)" }}>
            <Link href="/" className="transition-colors hover:text-white/70">Inicio</Link>
            <span>/</span>
            <Link href="/agricultural" className="transition-colors hover:text-white/70">Maquinaria Agrícola</Link>
            <span>/</span>
            <Link href="/agricultural/tractors" className="transition-colors hover:text-white/70">Tractores</Link>
            <span>/</span>
            <span className="text-white/60">{listing.brand} {listing.model}</span>
          </nav>

          {/* Title row */}
          <div className="flex flex-col gap-4 pb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p
                className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#C4933F]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {listing.brand}
              </p>
              <h1
                className="text-3xl font-semibold text-white sm:text-4xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {listingTitle}
              </h1>
              {listing.location && (
                <p className="mt-2 text-sm text-white/50" style={{ fontFamily: "var(--font-body)" }}>
                  {listing.location}{listing.country ? `, ${listing.country}` : ""}
                </p>
              )}
            </div>
            <div className="text-left sm:text-right">
              <p
                className="text-3xl font-semibold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {formatPrice(listing.price, currency)}
              </p>
              <span
                className="mt-1.5 inline-block rounded-full border border-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/60"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {condLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-10">

          {/* Left — 2 cols */}
          <div className="space-y-6 lg:col-span-2">

            <ImageGallery images={galleryImages} alt={listingTitle} />

            {/* Base specs */}
            <div className="rounded-2xl border border-[#E8E4DB] bg-white p-7">
              <h2
                className="mb-5 text-lg font-semibold text-[#1C1A16]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Ficha técnica
              </h2>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
                {baseSpecs.map((s) => (
                  <div key={s.label}>
                    <dt
                      className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {s.label}
                    </dt>
                    <dd
                      className="mt-1 text-sm font-medium text-[#1C1A16]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Detailed specs */}
            {d && <DetailedSpecs details={d} />}
          </div>

          {/* Right — sidebar */}
          <div className="mt-8 lg:mt-0">
            <div className="sticky top-24 space-y-4">

              {/* Inquiry form */}
              <div className="rounded-2xl border border-[#E8E4DB] bg-white p-6">
                <h2
                  className="mb-1 text-lg font-semibold text-[#1C1A16]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Consultar disponibilidad
                </h2>
                <p
                  className="mb-5 text-xs text-[#9B9590] uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Respuesta en &lt; 24 h
                </p>
                <InquiryForm listingId={listing.id} listingTitle={listingTitle} />
              </div>

              {/* WhatsApp */}
              <div className="rounded-2xl bg-[#001E50] p-6">
                <p
                  className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Respuesta inmediata
                </p>
                <p
                  className="mb-4 text-sm text-white/70 leading-relaxed"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Escríbenos directamente — un asesor responde en minutos.
                </p>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#C4933F] py-3 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#D4A855]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.527 5.845L0 24l6.335-1.502A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.865 0-3.614-.483-5.13-1.33l-.369-.213-3.761.893.952-3.67-.233-.378A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                  Consultar por WhatsApp
                </a>
              </div>

              {/* Trust strip */}
              <div className="rounded-2xl border border-[#E8E4DB] bg-white p-6">
                <p
                  className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  La cotización incluye
                </p>
                <ul className="space-y-2.5">
                  {[
                    "Precio del equipo (FOB Asia)",
                    "Flete marítimo hasta destino",
                    "Aranceles e impuestos de importación",
                    "Entrega hasta tu almacén o campo",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-[#6B6560]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C4933F]" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Back link */}
              <Link
                href="/agricultural/tractors"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-[#E8E4DB] py-3 text-xs font-semibold uppercase tracking-widest text-[#6B6560] transition-colors hover:border-[#C4933F]/40 hover:text-[#C4933F]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                ← Volver a tractores
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Suppress unused import warnings
type _Unused = EngineDetails | TransmissionDetails | CabinDetails | PtoDetails | HydraulicsDetails | RearHitchDetails | FrontHitchDetails | TiresDetails | DimensionsDetails | ElectricalDetails;
