import type { Metadata } from "next";
import CategoryHubPage from "@/components/listings/CategoryHubPage";
import { CATEGORIES } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Construction & Industrial Machinery — Euro Global Machinery",
  description: "Browse forklifts, telehandlers, excavators, wheel loaders, bulldozers, cranes, and more.",
};

const cat = CATEGORIES.find((c) => c.slug === "industrial")!;

export default function IndustrialPage() {
  return <CategoryHubPage category={cat} />;
}
