import type { Metadata } from "next";
import Navbar        from "@/components/Navbar";
import HowItWorks    from "@/components/HowItWorks";
import WhyWings      from "@/components/WhyWings";
import Corridors     from "@/components/Corridors";
import FreeZone      from "@/components/FreeZone";
import CostBreakdown from "@/components/CostBreakdown";
import Categories    from "@/components/Categories";
import LeadForm      from "@/components/LeadForm";
import Footer        from "@/components/Footer";

export const metadata: Metadata = {
  title: "Servicios de Importación — Wings Global Trade",
  description:
    "Gestiona tus importaciones desde Asia con precio landed total. Asesoría experta en español, bodegas en zona franca (Tacna y Iquique) y entrega en 6 países de Latinoamérica.",
  openGraph: {
    title: "Servicios de Importación — Wings Global Trade",
    description:
      "Tu import desk para Asia y Latinoamérica. Precio final, logística completa y asesoría en español.",
    locale: "es_ES",
    type: "website",
  },
};

export default function ImportacionPage() {
  return (
    <>
      <Navbar />
      <main>
        <HowItWorks />
        <WhyWings />
        <Corridors />
        <FreeZone />
        <CostBreakdown />
        <Categories />
        <LeadForm />
      </main>
      <Footer />
    </>
  );
}
