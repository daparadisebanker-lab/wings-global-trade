import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "Euro Global | Maquinaria Agrícola desde Asia para Latinoamérica",
    template: "%s | Euro Global",
  },
  description:
    "86 tractores nuevos de YTO, SinoHarvest, John Deere y Massey Ferguson — cotizados con flete, aranceles y entrega hasta tu campo en Colombia, Perú, Bolivia, Chile, Paraguay, Argentina y Uruguay.",
  keywords: ["tractores", "maquinaria agrícola", "importación", "YTO", "SinoHarvest", "John Deere", "Colombia", "Perú", "Bolivia", "Chile"],
  openGraph: {
    type: "website",
    locale: "es_419",
    siteName: "Euro Global",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
