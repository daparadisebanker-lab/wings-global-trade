"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const WA_URL = "https://wa.me/51958381473";

type Step = 1 | 2 | "done";
type Intent = "catalog" | "import" | "";

interface FormData {
  product: string;
  country: string;
  name: string;
  contact: string;
  company: string;
}

const EMPTY: FormData = { product: "", country: "", name: "", contact: "", company: "" };
const COUNTRIES = [
  "Perú", "Bolivia", "Chile", "Paraguay", "Argentina", "Uruguay",
  "Guatemala", "El Salvador", "Honduras", "Nicaragua", "Costa Rica", "Panamá",
  "Otro",
];

function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export default function CotizarForm() {
  const params = useSearchParams();

  const seedModelo  = params.get("modelo") ?? "";
  const seedMarca   = params.get("marca")  ?? "";
  const seedProduct = [seedMarca, seedModelo].filter(Boolean).join(" ");
  const primaryLocked = Boolean(seedProduct);

  const [step,    setStep]   = useState<Step>(1);
  const [intent,  setIntent] = useState<Intent>(primaryLocked ? "catalog" : "");
  const [form,    setForm]   = useState<FormData>({ ...EMPTY, product: seedProduct });
  const [extras,  setExtras] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]  = useState("");

  function setField(field: keyof FormData, val: string) {
    setForm((p) => ({ ...p, [field]: val }));
    setError("");
  }
  function addExtra()                    { setExtras((p) => [...p, ""]); }
  function setExtra(i: number, v: string){ setExtras((p) => p.map((x, j) => j === i ? v : x)); }
  function removeExtra(i: number)        { setExtras((p) => p.filter((_, j) => j !== i)); }

  const allProducts = [form.product, ...extras.filter(Boolean)].filter(Boolean);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.contact) { setError("Nombre y contacto son requeridos."); return; }
    setLoading(true);
    try {
      const productsLine = allProducts.length > 1
        ? "Productos: " + allProducts.join(" | ")
        : "Producto: "  + form.product;
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre:   form.name,
          empresa:  form.company,
          contacto: form.contact,
          mensaje:  `[${intent === "catalog" ? "Catálogo" : "Importación"}] ${productsLine} — Entrega en ${form.country}`,
        }),
      });
      setStep("done");
    } catch {
      setError("Error de red. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  /* ── DONE ─────────────────────────────────────────────────────────────── */
  if (step === "done") {
    const waText = encodeURIComponent(
      `Hola, acabo de solicitar cotización en wingsglobaltrade.com. ${
        allProducts.length > 1
          ? "Productos: " + allProducts.join(", ")
          : "Producto: " + form.product
      }. País: ${form.country}.`
    );
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-6 py-24">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#C4933F]/10">
            <svg width="28" height="28" fill="none" stroke="#C4933F" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-[#1C1A16]" style={{ fontFamily: "var(--font-display)" }}>
            Cotización recibida
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#6B6560]" style={{ fontFamily: "var(--font-body)" }}>
            Nuestro equipo revisará tu solicitud y te contactará en menos de 24 horas con precio landed total.
          </p>
          {allProducts.length > 1 && (
            <div className="mt-4 rounded-xl border border-[#E8E4DB] bg-white p-4 text-left">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#C4933F]" style={{ fontFamily: "var(--font-body)" }}>
                Productos en tu solicitud
              </p>
              {allProducts.map((p) => (
                <p key={p} className="flex items-center gap-2 text-sm text-[#1C1A16]" style={{ fontFamily: "var(--font-body)" }}>
                  <span className="h-1 w-1 flex-shrink-0 rounded-full bg-[#C4933F]" aria-hidden="true" />
                  {p}
                </p>
              ))}
            </div>
          )}
          <div className="mt-8 space-y-3">
            <a
              href={`${WA_URL}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2.5 rounded-full py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#25D366", fontFamily: "var(--font-body)" }}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Escribir por WhatsApp ahora
            </a>
            <Link
              href="/categories"
              className="block text-center text-sm text-[#9B9590] transition-colors hover:text-[#C4933F]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              ← Explorar el catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── HEADER ───────────────────────────────────────────────────────────── */
  const stepLabel = step === 1
    ? (primaryLocked ? "Confirmar solicitud" : "¿Qué necesitas?")
    : "Tus datos de contacto";

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20 md:pb-0">
      <div className="bg-[#004389] py-10">
        <div className="mx-auto max-w-2xl px-6 lg:px-8">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#C4933F]" style={{ fontFamily: "var(--font-body)" }}>
            Paso {step} de 2
          </p>
          <h1 className="text-3xl font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
            {stepLabel}
          </h1>
          <p className="mt-2 text-sm text-white/40" style={{ fontFamily: "var(--font-body)" }}>
            {step === 1
              ? primaryLocked
                ? "Modelo pre-seleccionado. Agrega más productos si necesitas cotización conjunta."
                : "Cuéntanos qué buscas para prepararte una cotización con precio landed total."
              : "Completa tus datos y te contactamos en menos de 24 horas."}
          </p>
          <div className="mt-6 flex gap-2">
            <div className="h-1 flex-1 rounded-full bg-[#C4933F]" />
            <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${step === 2 ? "bg-[#C4933F]" : "bg-white/15"}`} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-12 lg:px-8">

        {/* ── STEP 1 ──────────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">

            {/* Intent selector — hidden when arriving from a product page */}
            {!primaryLocked && (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#9B9590]" style={{ fontFamily: "var(--font-body)" }}>
                  ¿Qué tipo de cotización necesitas?
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      value: "catalog" as Intent,
                      title: "Modelo del catálogo",
                      desc: "34 tractores y 27 camiones KAMA disponibles. Precio landed confirmado en menos de 24 horas.",
                    },
                    {
                      value: "import" as Intent,
                      title: "Importación a pedido",
                      desc: "¿No está en el catálogo? Lo importamos directamente desde fábrica. Mismo proceso, mismo precio garantizado.",
                    },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setIntent(opt.value)}
                      className={`rounded-2xl border-2 p-5 text-left transition-colors ${
                        intent === opt.value
                          ? "border-[#C4933F] bg-[#C4933F]/5"
                          : "border-[#E8E4DB] bg-white hover:border-[#C4933F]/40"
                      }`}
                    >
                      <p className="text-lg font-semibold text-[#1C1A16]" style={{ fontFamily: "var(--font-display)" }}>
                        {opt.title}
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#6B6560]" style={{ fontFamily: "var(--font-body)" }}>
                        {opt.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Product section — shown when intent chosen OR locked */}
            {(intent || primaryLocked) && (
              <>
                {/* Primary product */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#9B9590]" style={{ fontFamily: "var(--font-body)" }}>
                    {primaryLocked
                      ? "Modelo seleccionado"
                      : intent === "catalog"
                        ? "¿Qué modelo te interesa?"
                        : "¿Qué equipo o maquinaria necesitas?"}
                  </p>

                  {/* Locked chip — primary product from product page */}
                  {primaryLocked ? (
                    <div className="flex items-center gap-3 rounded-xl border border-[#C4933F]/35 bg-[#C4933F]/[0.06] px-4 py-3.5">
                      <span className="flex-shrink-0 text-[#C4933F]">
                        <LockIcon />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-[#1C1A16]" style={{ fontFamily: "var(--font-body)" }}>
                          {form.product}
                        </p>
                      </div>
                      <span
                        className="flex-shrink-0 rounded-full border border-[#C4933F]/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#C4933F]"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        Catálogo
                      </span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={form.product}
                      onChange={(e) => setField("product", e.target.value)}
                      placeholder={
                        intent === "catalog"
                          ? "Ej: New Holland T1004, o tractor 100 hp 4WD"
                          : "Ej: Excavadora 20T, camión volcador, bus escolar..."
                      }
                      className="w-full rounded-xl border border-[#E8E4DB] bg-white px-4 py-3 text-sm text-[#1C1A16] placeholder-[#6B6560]/50 focus:border-[#C4933F] focus:outline-none focus:ring-2 focus:ring-[#C4933F]/10"
                      style={{ fontFamily: "var(--font-body)" }}
                    />
                  )}
                </div>

                {/* Extra products */}
                <div className="space-y-2">
                  {extras.map((val, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => setExtra(i, e.target.value)}
                        placeholder="Otro modelo o descripción"
                        className="flex-1 rounded-xl border border-[#E8E4DB] bg-white px-4 py-3 text-sm text-[#1C1A16] placeholder-[#6B6560]/50 focus:border-[#C4933F] focus:outline-none focus:ring-2 focus:ring-[#C4933F]/10"
                        style={{ fontFamily: "var(--font-body)" }}
                      />
                      <button
                        type="button"
                        onClick={() => removeExtra(i)}
                        aria-label="Eliminar producto"
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[#E8E4DB] bg-white text-[#9B9590] transition-colors hover:border-red-200 hover:text-red-400"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addExtra}
                    className="flex items-center gap-1.5 rounded-full border border-dashed border-[#C4933F]/40 px-4 py-2 text-xs font-semibold text-[#C4933F] transition-colors hover:border-[#C4933F] hover:bg-[#C4933F]/5"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Agregar otro producto
                  </button>
                </div>

                {/* Country */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-[#9B9590]" style={{ fontFamily: "var(--font-body)" }}>
                    País de entrega
                  </label>
                  <select
                    value={form.country}
                    onChange={(e) => setField("country", e.target.value)}
                    className="w-full rounded-xl border border-[#E8E4DB] bg-white px-4 py-3 text-sm text-[#1C1A16] focus:border-[#C4933F] focus:outline-none focus:ring-2 focus:ring-[#C4933F]/10"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    <option value="">Selecciona un país</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!form.product || !form.country}
                  className="w-full rounded-full bg-[#C4933F] py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {allProducts.length > 1
                    ? `Continuar con ${allProducts.length} productos →`
                    : "Continuar →"}
                </button>
              </>
            )}
          </div>
        )}

        {/* ── STEP 2 ──────────────────────────────────────────────────────── */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Summary */}
            <div className="rounded-xl border border-[#E8E4DB] bg-white p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#C4933F]" style={{ fontFamily: "var(--font-body)" }}>
                Resumen de solicitud
              </p>
              <p className="mt-1 text-xs text-[#9B9590]" style={{ fontFamily: "var(--font-body)" }}>
                {intent === "catalog" ? "Modelo del catálogo" : "Importación a pedido"} · Entrega en {form.country}
              </p>
              <div className="mt-3 space-y-1.5">
                {allProducts.map((p, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    {i === 0 && primaryLocked
                      ? <span className="text-[#C4933F]"><LockIcon /></span>
                      : <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#C4933F]" aria-hidden="true" />
                    }
                    <span className="text-sm text-[#1C1A16]" style={{ fontFamily: "var(--font-body)" }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-[#9B9590]" style={{ fontFamily: "var(--font-body)" }}>
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="Juan Pérez"
                  required
                  className="w-full rounded-xl border border-[#E8E4DB] bg-white px-4 py-3 text-sm text-[#1C1A16] placeholder-[#6B6560]/50 focus:border-[#C4933F] focus:outline-none focus:ring-2 focus:ring-[#C4933F]/10"
                  style={{ fontFamily: "var(--font-body)" }}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-[#9B9590]" style={{ fontFamily: "var(--font-body)" }}>
                  Empresa (opcional)
                </label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => setField("company", e.target.value)}
                  placeholder="Agrícola del Valle S.A."
                  className="w-full rounded-xl border border-[#E8E4DB] bg-white px-4 py-3 text-sm text-[#1C1A16] placeholder-[#6B6560]/50 focus:border-[#C4933F] focus:outline-none focus:ring-2 focus:ring-[#C4933F]/10"
                  style={{ fontFamily: "var(--font-body)" }}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-[#9B9590]" style={{ fontFamily: "var(--font-body)" }}>
                WhatsApp o email de contacto
              </label>
              <input
                type="text"
                value={form.contact}
                onChange={(e) => setField("contact", e.target.value)}
                placeholder="+51 958 381 473 o tu@empresa.com"
                required
                className="w-full rounded-xl border border-[#E8E4DB] bg-white px-4 py-3 text-sm text-[#1C1A16] placeholder-[#6B6560]/50 focus:border-[#C4933F] focus:outline-none focus:ring-2 focus:ring-[#C4933F]/10"
                style={{ fontFamily: "var(--font-body)" }}
              />
            </div>

            <div className="rounded-xl bg-[#004389]/5 p-4">
              <ul className="space-y-1.5">
                {[
                  "Respondemos en menos de 24 horas",
                  "Precio landed total: flete + aranceles + entrega incluidos",
                  "Plazo estimado: 45–90 días desde confirmación de orden",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-[#6B6560]" style={{ fontFamily: "var(--font-body)" }}>
                    <div className="h-1 w-1 flex-shrink-0 rounded-full bg-[#C4933F]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {error && (
              <p className="text-sm text-red-500" style={{ fontFamily: "var(--font-body)" }}>{error}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-full border border-[#E8E4DB] bg-white px-6 py-3.5 text-sm font-semibold text-[#6B6560] transition-colors hover:border-[#C4933F] hover:text-[#C4933F]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                ← Atrás
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-full bg-[#C4933F] py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {loading ? "Enviando…" : "Solicitar cotización →"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
