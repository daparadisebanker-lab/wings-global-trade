import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Drive Axles for Sale — Euro Global Machinery",
  description: "Browse new and used drive axles from verified dealers across Europe.",
};

export default function AxlesPage() {
  return (
    <ComingSoonCategory
      title="Drive Axle for Sale"
      filterTypes={["Front Axle", "Rear Axle", "Steering Axle"]}
      categorySlug="spare-parts"
      activeSlug="axles"
    />
  );
}
