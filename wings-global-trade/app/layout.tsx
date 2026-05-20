import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wings Global Trade — Importación Gestionada desde Asia",
  description:
    "Importa desde Asia con precio final, bodega en zona franca y asesoría experta en español para empresas en Colombia, Perú, Bolivia, Chile, Paraguay, Argentina y Uruguay.",
  openGraph: {
    title: "Wings Global Trade",
    description: "Tu import desk para Asia y Latinoamérica.",
    locale: "es_ES",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
