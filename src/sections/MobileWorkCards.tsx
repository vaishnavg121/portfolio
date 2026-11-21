import Image from "next/image";
import Link from "next/link";
import { MoveRight } from "lucide-react";
import { projects } from "@/lib/profile";

const previews: Record<string, string> = {
  imdpune: "/assets/projects/imd-pune/imd-hero-aviation-weather.png",
  swaneeti: "/assets/projects/swa-neeti/swa-legal-research-loop.png",
  windy: "/assets/projects/windy/windy-weather-intelligence-pipeline.png",
  spenza: "/assets/projects/spenza/spenza-spending-analysis-flow.png",
};

export function MobileWorkCards() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:hidden">
      {projects.map((project) => (
        <article key={project.slug} className="flex min-w-0 flex-col overflow-hidden border border-border bg-surface">
          {previews[project.slug] && (
            <div className="relative aspect-[16/9] border-b border-border bg-[#050505]">
              <Image src={previews[project.slug]} alt="" fill sizes="(min-width: 640px) 45vw, 90vw" className="object-contain" />
            </div>
          )}
          <div className="flex flex-1 flex-col gap-4 p-5">
            <p className="font-mono text-xs uppercase tracking-wider text-[#e55a5a]">{project.category}</p>
            <h3 className="text-[clamp(1.45rem,5vw,2rem)] font-medium uppercase leading-tight tracking-tight">{project.title}</h3>
            <p className="text-base leading-relaxed text-text-muted">{project.description}</p>
            <ul aria-label="Technologies" className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <li key={tag} className="border border-[#333] px-2 py-1 font-mono text-[11px] uppercase text-text-muted">{tag}</li>
              ))}
            </ul>
            <Link href={`/work/${project.slug}`} aria-label={`View project: ${project.title}`}
              className="mt-auto inline-flex min-h-11 w-fit items-center gap-3 font-mono text-sm uppercase tracking-wider">
              View project <MoveRight aria-hidden="true" size={18} className="text-accent" />
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
