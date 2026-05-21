import type { Metadata } from "next";
import WingsHero         from "@/components/wings/WingsHero";
import WingsHowItWorks   from "@/components/wings/WingsHowItWorks";
import WingsWhyWings     from "@/components/wings/WingsWhyWings";
import WingsCorridors    from "@/components/wings/WingsCorridors";
import WingsFreeZone     from "@/components/wings/WingsFreeZone";
import WingsCostBreakdown from "@/components/wings/WingsCostBreakdown";
import WingsLeadForm     from "@/components/wings/WingsLeadForm";

export const metadata: Metadata = {
  title: "Importación desde Asia — Wings Global Trade",
  description:
    "Importa maquinaria, repuestos y productos desde Asia con precio landed total. Asesoría en español, dos hubs en zona franca y entrega en 6 países de Latinoamérica.",
};

export default function ImportacionPage() {
  return (
    <main>
      <WingsHero />
      <WingsHowItWorks />
      <WingsWhyWings />
      <WingsCorridors />
      <WingsFreeZone />
      <WingsCostBreakdown />
      <WingsLeadForm />
    </main>
  );
}
