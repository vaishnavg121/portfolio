import { notFound } from "next/navigation";
import { ImdPuneCaseStudy } from "@/sections/work/ImdPuneCaseStudy";
import { SwaNeetiCaseStudy } from "@/sections/work/SwaNeetiCaseStudy";
import { WindyCaseStudy } from "@/sections/work/WindyCaseStudy";
import { SpenzaCaseStudy } from "@/sections/work/SpenzaCaseStudy";

const caseStudies = {
  imdpune: ImdPuneCaseStudy,
  swaneeti: SwaNeetiCaseStudy,
  windy: WindyCaseStudy,
  spenza: SpenzaCaseStudy,
};

export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!Object.hasOwn(caseStudies,slug)) notFound();
  const CaseStudy = caseStudies[slug as keyof typeof caseStudies];
  return <CaseStudy />;
}
