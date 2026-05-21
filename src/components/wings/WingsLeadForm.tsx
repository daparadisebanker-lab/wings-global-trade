"use client";

import { useState } from "react";
import { useFadeIn, useStaggerFadeIn } from "@/hooks/useFadeIn";

const WHATSAPP_URL =
  "https://wa.me/51934987440?text=Hola%2C%20acabo%20de%20completar%20el%20formulario%20en%20su%20sitio%20web.%20Me%20gustar%C3%ADa%20hablar%20sobre%20mi%20proyecto%20de%20importaci%C3%B3n.";

type FormData = { nombre: string; empresa: string; contacto: string };
const EMPTY: FormData = { nombre: "", empresa: "", contacto: "" };

export default function WingsLeadForm() {
  const headerRef = useFadeIn();
  const trustRef  = useStaggerFadeIn(110);
  const [form, setForm]           = useState<FormData>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/wings-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al enviar. Intenta de nuevo.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Error de red. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="contacto" className="bg-[#F8F6F0] py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div ref={headerRef as React.RefObject<HTMLDivElement>} className="fade-up text-center mb-16">
          <p className="text-[#C4933F] text-[10px] font-semibold tracking-[0.12em] uppercase mb-5" style={{ fontFamily: "var(--font-body)" }}>
            Empieza ahora
          </p>
          <h2
            className="text-[#1C1A16] text-4xl md:text-5xl lg:text-[64px] font-semibold tracking-tight max-w-3xl mx-auto leading-[1.08]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Inicia tu proyecto de importación.
          </h2>
          <p className="text-[#6B6560] text-lg mt-5 max-w-xl mx-auto" style={{ fontFamily: "var(--font-body)" }}>
            Completa el formulario y nuestro equipo te contactará en menos de 24 horas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8 max-w-6xl mx-auto">
          {/* Trust points */}
          <div ref={trustRef as React.RefObject<HTMLDivElement>} className="flex flex-col gap-5">
            {[
              { label: "Sin costo inicial",           detail: "La primera consulta es completamente gratuita.",                    icon: <GiftIcon />        },
              { label: "Respuesta en menos de 24 h",  detail: "Un asesor real te contacta, no un bot automatizado.",               icon: <ClockIcon />       },
              { label: "Asesoría 100% en español",    detail: "Todo el proceso en tu idioma, sin barreras.",                       icon: <ChatBubbleIcon />  },
            ].map((item) => (
              <div key={item.label} className="stagger-item bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6 flex gap-4 items-start">
                <div className="w-9 h-9 rounded-xl bg-[#C4933F]/10 flex items-center justify-center text-[#C4933F] flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-[#1C1A16] text-sm font-semibold mb-1" style={{ fontFamily: "var(--font-body)" }}>{item.label}</p>
                  <p className="text-[#6B6560] text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-[0_2px_24px_rgba(0,0,0,0.08)] p-8 md:p-10">
            {submitted ? (
              <SuccessState />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3
                  className="text-[#1C1A16] text-2xl font-semibold mb-6 tracking-normal"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Cuéntanos sobre tu proyecto
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Nombre completo"  name="nombre"   type="text"  placeholder="Juan Pérez"                        value={form.nombre}   onChange={handleChange} required />
                  <Field label="Empresa"          name="empresa"  type="text"  placeholder="Distribuidora XYZ S.A."            value={form.empresa}  onChange={handleChange} required />
                </div>
                <Field label="WhatsApp o email de contacto" name="contacto" type="text" placeholder="+57 300 000 0000 o tu@empresa.com" value={form.contacto} onChange={handleChange} required />

                {error && (
                  <p className="text-red-500 text-sm" style={{ fontFamily: "var(--font-body)" }}>{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#C4933F] hover:bg-[#D4A855] disabled:opacity-60 text-white font-semibold py-3.5 rounded-full text-base transition-colors duration-200 mt-2"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {loading ? "Enviando…" : "Enviar solicitud →"}
                </button>

                <p className="text-[#6B6560] text-xs text-center pt-1" style={{ fontFamily: "var(--font-body)" }}>
                  Al enviar, aceptas que nos pongamos en contacto sobre tu proyecto de importación.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function SuccessState() {
  return (
    <div className="text-center py-8">
      <div className="w-14 h-14 rounded-full bg-[#C4933F]/10 flex items-center justify-center mx-auto mb-6">
        <svg width="22" height="22" fill="none" stroke="#C4933F" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <h3 className="text-[#1C1A16] text-2xl font-semibold mb-3 tracking-normal" style={{ fontFamily: "var(--font-display)" }}>
        ¡Solicitud recibida!
      </h3>
      <p className="text-[#6B6560] text-sm mb-10 leading-relaxed max-w-sm mx-auto" style={{ fontFamily: "var(--font-body)" }}>
        Nuestro equipo revisará tu solicitud y te contactará en menos de 24 horas.
      </p>
      <div className="space-y-3 max-w-sm mx-auto">
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-[#C4933F] hover:bg-[#D4A855] text-white font-semibold py-3.5 rounded-full text-sm transition-colors"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <WhatsAppIcon /> Escribir por WhatsApp ahora
        </a>
      </div>
    </div>
  );
}

function Field({
  label, name, type, placeholder, value, onChange, required,
}: {
  label: string; name: string; type: string; placeholder: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required: boolean;
}) {
  return (
    <div>
      <label className="block text-[#1C1A16] text-xs font-semibold tracking-[0.08em] uppercase mb-2" style={{ fontFamily: "var(--font-body)" }}>
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full bg-[#F8F6F0] border border-[#E8E4DB] rounded-xl px-4 py-3 text-sm text-[#1C1A16] placeholder-[#6B6560]/50 focus:outline-none focus:border-[#C4933F] focus:ring-2 focus:ring-[#C4933F]/10 transition-all duration-200"
        style={{ fontFamily: "var(--font-body)" }}
      />
    </div>
  );
}

function GiftIcon() {
  return (
    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
    </svg>
  );
}
function ChatBubbleIcon() {
  return (
    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  );
}
function WhatsAppIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
