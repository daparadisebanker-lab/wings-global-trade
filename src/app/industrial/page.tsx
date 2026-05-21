import type { Metadata } from "next";
import CategoryHubPage from "@/components/listings/CategoryHubPage";
import { CATEGORIES } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Construcción e Industrial — Euro Global Machinery",
  description: "Montacargas, excavadoras, manipuladores telescópicos, grúas, topadoras y equipos industriales desde Asia.",
};

const cat = CATEGORIES.find((c) => c.slug === "industrial")!;

export default function IndustrialPage() {
  return <CategoryHubPage category={cat} />;
}
