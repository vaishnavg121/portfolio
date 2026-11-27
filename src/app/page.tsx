import { Hero } from "@/sections/Hero";
import { SelectedWork } from "@/sections/SelectedWork";
import { SkillsConstellation } from "@/sections/SkillsConstellation";
import { ExperienceTimeline } from "@/sections/ExperienceTimeline";
import { ThriveForceSection } from "@/sections/robotics/ThriveForceSection";
import { GithubActivity } from "@/sections/GithubActivity";
import { EngineeringNotes } from "@/sections/EngineeringNotes";
import { ContactFooter } from "@/sections/ContactFooter";

export default function Home() {
  return (
    <main className="portfolio-atmosphere relative">
      <Hero />
      <SelectedWork />
      <SkillsConstellation />
      <ExperienceTimeline />
      <ThriveForceSection />
      <GithubActivity />
      <EngineeringNotes />
      <ContactFooter />
    </main>
  );
}
