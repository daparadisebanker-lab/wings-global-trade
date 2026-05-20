import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import WhyWings from "@/components/WhyWings";
import Corridors from "@/components/Corridors";
import FreeZone from "@/components/FreeZone";
import CostBreakdown from "@/components/CostBreakdown";
import Categories from "@/components/Categories";
import LeadForm from "@/components/LeadForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
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
