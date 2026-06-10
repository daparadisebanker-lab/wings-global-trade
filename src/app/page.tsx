import type { Metadata } from "next";
import { archivo, inter, plexMono } from "@/lib/home/fonts";
import SiteHeader from "@/components/chrome/SiteHeader";
import FixedBar from "@/components/chrome/FixedBar";
import Hero from "@/components/sections/Hero";
import TransitionBand from "@/components/sections/TransitionBand";
import CategoryWindows from "@/components/sections/CategoryWindows";
import ContainerReveal from "@/components/sections/ContainerReveal";
import LogisticsSequence from "@/components/sections/LogisticsSequence";

export const metadata: Metadata = {
  title: "Wings | Importación de Maquinaria desde Zona Franca — Tacna / Iquique",
  description:
    "Importación de maquinaria agrícola, pesada, industrial, de pesca y minería desde zona franca (ZofraTacna / ZOFRI). De puerto a planta. Solicita tu cotización.",
  alternates: { canonical: "https://wingsglobaltrade.com" },
};

/**
 * Homepage — scroll narrative per WINGS_HOME_SPEC.md.
 * Server component; animation lives inside the client section components.
 * Tokens, fonts and base styles are scoped via [data-page="wings-home"] so
 * the brandbook system on inner pages is untouched.
 */
export default function HomePage() {
  return (
    <div
      data-page="wings-home"
      data-theme="dark"
      className={`${archivo.variable} ${inter.variable} ${plexMono.variable} relative`}
      style={{ paddingBottom: "calc(56px + env(safe-area-inset-bottom))" }}
    >
      <SiteHeader />
      <Hero />
      <TransitionBand />
      <CategoryWindows />
      <ContainerReveal />
      <LogisticsSequence />
      <FixedBar />
    </div>
  );
}
