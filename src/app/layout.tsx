import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import MobileBottomBar from "@/components/layout/MobileBottomBar";

export const metadata: Metadata = {
  title: {
    default: "Wings Global Trade | Maquinaria desde Asia para Latinoamérica",
    template: "%s | Wings Global Trade",
  },
  description:
    "34 tractores nuevos de New Holland, John Deere, Massey Ferguson y Kubota — cotizados con flete, aranceles y entrega hasta tu campo en Perú, Bolivia, Chile, Paraguay, Argentina y Uruguay.",
  keywords: ["tractores", "maquinaria agrícola", "importación", "New Holland", "John Deere", "Massey Ferguson", "Kubota", "Perú", "Bolivia", "Chile"],
  openGraph: {
    type: "website",
    locale: "es_419",
    siteName: "Wings Global Trade",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <Footer />
        <WhatsAppButton />
        <MobileBottomBar />
      </body>
    </html>
  );
}
