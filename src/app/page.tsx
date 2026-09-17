import { EntrySequence } from "@/sections/EntrySequence";
import { Hero } from "@/sections/Hero";
import { SelectedWork } from "@/sections/SelectedWork";
import { SkillsConstellation } from "@/sections/SkillsConstellation";
import { ExperienceTimeline } from "@/sections/ExperienceTimeline";
import { ThriveForceSection } from "@/sections/robotics/ThriveForceSection";
import { GithubActivity } from "@/sections/GithubActivity";
import { EngineeringNotes } from "@/sections/EngineeringNotes";
import { ContactFooter } from "@/sections/ContactFooter";
import { Companion } from "@/components/companion";
import { FloatingNav } from "@/components/ui/FloatingNav";

export default function Home() {
  return (
    <main className="relative bg-background">
      <EntrySequence />
      <Companion />
      <FloatingNav />
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
