import { Hero } from "@/sections/Hero";
import { SelectedWork } from "@/sections/SelectedWork";
import { SkillsConstellation } from "@/sections/SkillsConstellation";
import { ExperienceTimeline } from "@/sections/ExperienceTimeline";
import { ThriveForceSection } from "@/sections/robotics/ThriveForceSection";
import { EngineeringNotes } from "@/sections/EngineeringNotes";
import { ContactFooter } from "@/sections/ContactFooter";
import { ResearchStudio } from "@/sections/research-studio/ResearchStudio";
import "./atmosphere.css";

export default function Home() {
  return (
    <main className="portfolio-atmosphere relative">
      <Hero researchStudio={<ResearchStudio />} />
      <SelectedWork />
      <SkillsConstellation />
      <ExperienceTimeline />
      <ThriveForceSection />
      <EngineeringNotes />
      <ContactFooter />
    </main>
  );
}
