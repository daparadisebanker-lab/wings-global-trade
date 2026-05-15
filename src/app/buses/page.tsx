import type { Metadata } from "next";
import CategoryHubPage from "@/components/listings/CategoryHubPage";
import { CATEGORIES } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Buses & Coaches for Sale — Euro Global Machinery",
  description: "Browse city buses, intercity coaches, minibuses, and school buses from European and Asian manufacturers.",
};

const cat = CATEGORIES.find((c) => c.slug === "buses")!;

export default function BusesPage() {
  return <CategoryHubPage category={cat} />;
}
