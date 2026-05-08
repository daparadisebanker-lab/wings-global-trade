"use client";

import { useState } from "react";
import type { InquiryPayload } from "@/types";

interface FormLabels {
  name: string;
  email: string;
  phone: string;
  defaultMessage: string;
  sending: string;
  submit: string;
  successTitle: string;
  successBody: string;
  successBtn: string;
  error: string;
}

interface Props {
  listingId: string;
  listingTitle: string;
  labels?: FormLabels;
}

const DEFAULT_LABELS: FormLabels = {
  name: "Full name",
  email: "Email address",
  phone: "Phone number (optional)",
  defaultMessage: "",
  sending: "Sending...",
  submit: "Send Inquiry",
  successTitle: "Message Sent",
  successBody: "The seller will be in touch with you shortly.",
  successBtn: "Send Another Message",
  error: "Something went wrong. Please try again.",
};

type Status = "idle" | "loading" | "success" | "error";

export default function InquiryForm({ listingId, listingTitle, labels }: Props) {
  const l = { ...DEFAULT_LABELS, ...labels };
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: l.defaultMessage || `Hello, I am interested in the ${listingTitle}. Please let me know if it is still available.`,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    const payload: InquiryPayload = {
      listing_id: listingId,
      listing_title: listingTitle,
      ...form,
    };

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to send");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="border border-brown-200 bg-cream-100 p-6 text-center">
        <p className="font-serif text-base font-medium text-brown-900">{l.successTitle}</p>
        <p className="mt-2 text-sm text-brown-600">{l.successBody}</p>
        <button onClick={() => setStatus("idle")} className="btn-secondary mt-5 text-xs">
          {l.successBtn}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        name="name" type="text" placeholder={l.name}
        required value={form.name} onChange={handleChange}
        className="input-field"
      />
      <input
        name="email" type="email" placeholder={l.email}
        required value={form.email} onChange={handleChange}
        className="input-field"
      />
      <input
        name="phone" type="tel" placeholder={l.phone}
        value={form.phone} onChange={handleChange}
        className="input-field"
      />
      <textarea
        name="message" rows={4}
        required value={form.message} onChange={handleChange}
        className="input-field resize-none"
      />

      {status === "error" && (
        <p className="text-xs text-red-700">{l.error}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-primary w-full text-xs uppercase tracking-widest disabled:opacity-60"
      >
        {status === "loading" ? l.sending : l.submit}
      </button>
    </form>
  );
}
