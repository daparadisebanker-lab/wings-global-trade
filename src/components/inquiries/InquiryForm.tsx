"use client";

import { useState } from "react";

interface Props {
  listingId: string;
  listingTitle: string;
}

const fieldClass =
  "w-full rounded-xl border border-[#E8E4DB] bg-[#FAFAFA] px-3 py-2.5 text-sm text-[#1C1A16] focus:border-[#C4933F] focus:outline-none";

type Status = "idle" | "loading" | "success" | "error";

export default function InquiryForm({ listingId, listingTitle }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: `Hola, quisiera cotizar el ${listingTitle} con precio landed total (flete, aranceles y entrega a mi país). ¿Está disponible?`,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listingId, listing_title: listingTitle, ...form }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl bg-[#004389] p-6 text-center">
        <div className="mb-3 flex justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C4933F]">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <p className="font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
          Consulta enviada
        </p>
        <p className="mt-2 text-sm text-white/60" style={{ fontFamily: "var(--font-body)" }}>
          Te contactamos en menos de 24 horas.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-4 text-xs font-semibold text-[#C4933F] hover:underline underline-offset-2"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Enviar otra consulta
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        name="name" type="text" placeholder="Nombre completo *"
        required value={form.name} onChange={handleChange}
        className={fieldClass} style={{ fontFamily: "var(--font-body)" }}
      />
      <input
        name="phone" type="tel" placeholder="WhatsApp *"
        required value={form.phone} onChange={handleChange}
        className={fieldClass} style={{ fontFamily: "var(--font-body)" }}
      />
      <input
        name="email" type="email" placeholder="Correo electrónico *"
        required value={form.email} onChange={handleChange}
        className={fieldClass} style={{ fontFamily: "var(--font-body)" }}
      />
      <textarea
        name="message" rows={3}
        required value={form.message} onChange={handleChange}
        className={`${fieldClass} resize-none`}
        style={{ fontFamily: "var(--font-body)" }}
      />

      {status === "error" && (
        <p className="text-xs text-red-600" style={{ fontFamily: "var(--font-body)" }}>
          Error al enviar. Intenta de nuevo.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-[#C4933F] py-3 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#D4A855] disabled:opacity-60"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {status === "loading" ? "Enviando…" : "Recibir cotización en 24 h"}
      </button>
    </form>
  );
}
