import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Motor Graders for Sale — Euro Global Machinery",
  description: "Browse new and used motor graders from verified dealers across Europe.",
};

export default function MotorGradersPage() {
  return (
    <ComingSoonCategory
      title="Motor Grader for Sale"
      filterTypes={["12ft Blade", "14ft Blade", "16ft Blade"]}
      categorySlug="industrial"
      activeSlug="motor-graders"
    />
  );
}
