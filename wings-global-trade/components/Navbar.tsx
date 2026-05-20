"use client";

import { useState } from "react";

const WHATSAPP_URL =
  "https://wa.me/51934987440?text=Hola%2C%20me%20interesa%20importar%20desde%20Asia%20con%20Wings%20Global%20Trade.";

const NAV_LINKS = [
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Zonas Francas", href: "#zonas-francas" },
  { label: "Categorías", href: "#categorias" },
  { label: "Contacto", href: "#contacto" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#001E50]/70 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Logo />

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="text-white/65 hover:text-white text-sm font-medium transition-colors duration-200"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {label}
            </a>
          ))}
        </nav>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-2 bg-[#C4933F] hover:bg-[#D4A855] text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors duration-200"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <WhatsAppIcon />
          Hablar con un asesor
        </a>

        <button
          className="md:hidden text-white/80 p-1"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          {open ? <XIcon /> : <MenuIcon />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[#001E50]/95 backdrop-blur-2xl px-6 py-6 flex flex-col gap-5">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="text-white/75 text-sm font-medium py-1"
              style={{ fontFamily: "var(--font-body)" }}
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#C4933F] text-white text-sm font-semibold px-5 py-3 rounded-full mt-1"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <WhatsAppIcon />
            Hablar con un asesor
          </a>
        </div>
      )}
    </header>
  );
}

function Logo() {
  return (
    <a href="#" className="flex items-center">
      {/* horizontal layout logo (wings mark + wordmark side by side) */}
      <img
        src="/wings-logo2.svg"
        alt="Wings Global Trade"
        className="h-9 w-auto brightness-0 invert"
      />
    </a>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
