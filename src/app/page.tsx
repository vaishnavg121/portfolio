import { EntrySequence } from "@/sections/EntrySequence";
import { Hero } from "@/sections/Hero";
import { SelectedWork } from "@/sections/SelectedWork";
import { SkillsLandscape } from "@/sections/SkillsLandscape";
import { ExperienceTimeline } from "@/sections/ExperienceTimeline";
import { ThriveForceSection } from "@/sections/robotics/ThriveForceSection";
import { GithubActivity } from "@/sections/GithubActivity";
import { EngineeringNotes } from "@/sections/EngineeringNotes";
import { ContactFooter } from "@/sections/ContactFooter";

export default function Home() {
  return (
    <main className="relative bg-background">
      <EntrySequence />
      <Hero />
      <SelectedWork />
      <SkillsLandscape />
      <ExperienceTimeline />
      <ThriveForceSection />
      <GithubActivity />
      <EngineeringNotes />
      <ContactFooter />
    </main>
  );
}
