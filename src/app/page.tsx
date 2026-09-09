import { EntrySequence } from "@/sections/EntrySequence";
import { Hero } from "@/sections/Hero";
import { SelectedWork } from "@/sections/SelectedWork";
import { SkillsConstellation } from "@/sections/SkillsConstellation";
import { ExperienceTimeline } from "@/sections/ExperienceTimeline";
import { RoboticsShowcase } from "@/sections/RoboticsShowcase";
import { GithubActivity } from "@/sections/GithubActivity";
import { EngineeringNotes } from "@/sections/EngineeringNotes";
import { ContactFooter } from "@/sections/ContactFooter";
import { Companion } from "@/components/Companion";

export default function Home() {
  return (
    <main className="relative bg-background">
      <EntrySequence />
      <Companion />
      <Hero />
      <SelectedWork />
      <SkillsConstellation />
      <ExperienceTimeline />
      <RoboticsShowcase />
      <GithubActivity />
      <EngineeringNotes />
      <ContactFooter />
    </main>
  );
}
