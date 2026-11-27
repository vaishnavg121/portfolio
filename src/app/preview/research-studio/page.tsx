import { notFound } from "next/navigation";
import { Hero } from "@/sections/Hero";
import { ResearchStudio } from "@/sections/research-studio/ResearchStudio";
import { SelectedWork } from "@/sections/SelectedWork";
import { SkillsConstellation } from "@/sections/SkillsConstellation";
import { ThriveForceSection } from "@/sections/robotics/ThriveForceSection";
import { ContactFooter } from "@/sections/ContactFooter";
import "../../atmosphere.css";

export const metadata = {
  title: "Research Studio preview | Vaishnav Gadamsetty",
  robots: { index: false, follow: false },
};

export default function ResearchStudioPreview() {
  if (process.env.NODE_ENV !== "development" && process.env.RESEARCH_STUDIO_PREVIEW !== "1") notFound();
  return (
    <main className="portfolio-atmosphere relative">
      <Hero researchStudio={<ResearchStudio />} />
      <SelectedWork />
      <SkillsConstellation />
      <ThriveForceSection />
      <ContactFooter />
    </main>
  );
}
