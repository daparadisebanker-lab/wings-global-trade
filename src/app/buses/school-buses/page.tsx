import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "School Buses for Sale — Euro Global Machinery",
  description: "Browse new and used school buses from verified dealers across Europe.",
};

export default function SchoolBusesPage() {
  return (
    <ComingSoonCategory
      title="School Bus for Sale"
      filterTypes={["Type A", "Type C", "Type D"]}
      categorySlug="buses"
      activeSlug="school-buses"
    />
  );
}
