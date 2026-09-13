"use client";

import { useRef } from "react";
import Image from "next/image";
// using GSAP instead of framer-motion here
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MoveRight } from "lucide-react";
import { EmberField, FlowLines, GridEffect, BlueprintEffect, SwaNeetiInk, MagneticEffect } from "@/components/effects";
import { PROJECT_ASSETS } from "@/lib/assets";
import { useRouter } from "next/navigation";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const PROJECTS = [
  {
    slug: "alphacouncil",
    id: "01",
    title: "AlphaCouncil",
    category: "FINANCE / AI / SYSTEMS",
    description: "An agentic system for market discovery, risk analysis, and execution reasoning.",
    tags: ["Python", "Agents", "Finance", "LLMs"],
    theme: "red / ember / market-line",
    architecture: ["MARKET", "DISCOVERY", "COMMITTEE", "RISK", "EXECUTION"],
    EffectComponent: EmberField,
    assets: PROJECT_ASSETS["alphacouncil"],
  },
  {
    slug: "swaneeti",
    id: "02",
    title: "Swa.Neeti",
    category: "RAG / AGENTS / REASONING",
    description: "A legal policy retrieval and reasoning engine using structured authorities.",
    tags: ["RAG", "Next.js", "PostgreSQL", "Reasoning"],
    theme: "ink / paper spread",
    architecture: ["QUERY", "RETRIEVAL", "AUTHORITIES", "REASONING", "VALIDATION"],
    EffectComponent: SwaNeetiInk,
    assets: PROJECT_ASSETS["swaneeti"],
  },
  {
    slug: "windy",
    id: "03",
    title: "Windy",
    category: "ML / DATA / AVIATION",
    description: "Predictive aviation wind modelling using historical flight and weather data.",
    tags: ["ML", "Data", "Aviation"],
    theme: "wind / flowing-line motion",
    architecture: ["DATA INGESTION", "FEATURE ENG", "MODEL", "PREDICTION"],
    EffectComponent: FlowLines,
    assets: PROJECT_ASSETS["windy"],
  },
  {
    slug: "spenza",
    id: "04",
    title: "Spenza",
    category: "PRODUCT / FINANCE / SOFTWARE",
    description: "A robust financial tracking and split-management product.",
    tags: ["TypeScript", "React", "PostgreSQL"],
    theme: "clean grid / balance",
    architecture: ["USER", "TRANSACTION", "SPLIT LOGIC", "LEDGER"],
    EffectComponent: GridEffect,
    assets: PROJECT_ASSETS["spenza"],
  },
  {
    slug: "thriveforce",
    id: "05",
    title: "ThriveForce",
    category: "ROBOTICS / CAD / HARDWARE",
    description: "Combat robotics systems engineered for high-impact forces.",
    tags: ["Hardware", "CAD", "C++"],
    theme: "blueprint / structural",
    architecture: ["CHASSIS", "DRIVETRAIN", "WEAPON SYSTEM", "ELECTRONICS"],
    EffectComponent: BlueprintEffect,
    assets: PROJECT_ASSETS["thriveforce"],
  },
];

export const SelectedWork = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleProjectClick = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    const card = (e.target as HTMLElement).closest('.project-card');
    if (!card) {
      router.push(`/work/${slug}`);
      return;
    }
    
    const visual = card.querySelector('.group');
    if (visual) {
      gsap.to(visual, { scale: 0.95, opacity: 0, duration: 0.4, ease: "power2.inOut" });
    }
    gsap.to(card, { opacity: 0, x: -20, duration: 0.3, ease: "power2.in" });

    setTimeout(() => {
      router.push(`/work/${slug}`);
    }, 350);
  };

  useGSAP(() => {
    const projects = gsap.utils.toArray('.project-card') as HTMLElement[];
    
    projects.forEach((project) => {
      // Fade in project content
      gsap.fromTo(project, 
        { opacity: 0, y: 50 },
        {
          opacity: 1, 
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: project,
            start: "top 80%",
            end: "top 50%",
            scrub: false,
          }
        }
      );

      // Animate architecture nodes
      const nodes = project.querySelectorAll('.arch-node');
      const lines = project.querySelectorAll('.arch-line');

      gsap.fromTo(nodes,
        { opacity: 0, scale: 0.8, y: 10 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.15,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: project,
            start: "top 60%",
          }
        }
      );

      gsap.fromTo(lines,
        { height: 0, opacity: 0 },
        {
          height: 20,
          opacity: 1,
          duration: 0.3,
          stagger: 0.15,
          ease: "power1.inOut",
          delay: 0.2,
          scrollTrigger: {
            trigger: project,
            start: "top 60%",
          }
        }
      );
    });
  }, { scope: containerRef });

  return (
    <section className="py-32 relative bg-background" id="work" ref={containerRef}>
      <div className="container mx-auto px-6 md:px-12">
        <h2 className="text-sm font-mono text-text-muted mb-24 tracking-widest uppercase border-b border-border pb-4">
          Selected Work
        </h2>

        <div className="flex flex-col gap-32 md:gap-48">
          {PROJECTS.map((project) => (
            <div key={project.id} className="project-card flex flex-col md:flex-row gap-12 md:gap-16 items-start">
              {/* Info Side */}
              <div className="flex-1 md:w-5/12 md:sticky md:top-32 relative z-20">
                <div className="flex items-baseline gap-4 mb-4">
                  <span className="font-mono text-4xl text-border opacity-50 tracking-tighter">{project.id}</span>
                  <div className="font-mono text-accent text-xs tracking-widest uppercase">{project.category}</div>
                </div>
                
                <h3 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium mb-6 uppercase tracking-tight leading-none">
                  {project.title}
                </h3>
                
                <p className="text-text-muted text-base md:text-lg mb-8 max-w-sm leading-relaxed border-l border-border pl-4">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-12">
                  {project.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-mono border border-[#333] px-2 py-1 text-text-muted uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <MagneticEffect intensity={0.3}>
                  <button 
                    onClick={(e) => handleProjectClick(project.slug, e)}
                    data-cursor="VIEW"
                    className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-text-primary hover:text-accent transition-colors group"
                  >
                    <span className="relative pb-1 transform group-hover:translate-x-1 transition-transform duration-300">
                      View Project
                      <span className="absolute bottom-0 left-0 w-full h-[1px] bg-accent origin-left scale-x-50 group-hover:scale-x-100 transition-transform duration-300" />
                    </span>
                    <MoveRight className="w-4 h-4 group-hover:translate-x-3 transition-transform duration-300 text-accent" />
                  </button>
                </MagneticEffect>
              </div>

              {/* Visual Side */}
              <div className="flex-1 md:w-7/12 w-full bg-[#0a0a0a] min-h-[500px] flex items-center justify-center p-8 border border-border relative overflow-hidden group" data-cursor="VIEW">
                
                {/* Hero Asset Background */}
                {project.assets?.hero && (
                  <div className="absolute inset-0 z-0">
                    <Image 
                      src={project.assets.hero} 
                      alt={`${project.title} Hero`} 
                      fill 
                      className="object-cover opacity-60 mix-blend-luminosity group-hover:opacity-100 transition-opacity duration-700" 
                      onLoad={(e) => { (e.target as HTMLElement).style.opacity = '0.6'; }}
                    />
                  </div>
                )}

                {/* Texture Asset Overlay */}
                {project.assets?.texture && (
                  <div className="absolute inset-0 z-10 pointer-events-none mix-blend-overlay opacity-30">
                    <Image 
                      src={project.assets.texture} 
                      alt="" 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                )}

                {/* Visual Effects (Procedural fallback if no hard assets, or complementary overlay) */}
                <div className="absolute inset-0 z-10">
                  <project.EffectComponent />
                </div>

                <div className="absolute top-4 right-4 text-[10px] font-mono text-[#333] tracking-widest z-20">
                  SYS_VISUAL // {project.theme.toUpperCase()}
                </div>

                {/* Architecture Diagram */}
                <div className="relative z-20 w-full max-w-xs flex flex-col gap-1">
                  {project.assets?.diagram ? (
                    <div className="relative w-full aspect-square">
                      <Image 
                        src={project.assets.diagram} 
                        alt={`${project.title} Architecture`} 
                        fill 
                        className="object-contain drop-shadow-2xl" 
                      />
                    </div>
                  ) : (
                    <>
                      <div className="text-[10px] font-mono text-text-muted mb-4 tracking-widest uppercase flex items-center gap-2">
                        <div className="w-2 h-2 bg-accent" /> System Pipeline
                      </div>
                      <div className="group/pipeline flex flex-col gap-1 pointer-events-auto">
                        {project.architecture.map((node, i) => (
                          <div 
                            key={node} 
                            className="flex flex-col group/node transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02]"
                            onMouseEnter={(e) => window.dispatchEvent(new CustomEvent("companionInteract", { detail: { type: "pipeline-hover", target: e.currentTarget } }))}
                          >
                            <div className="arch-node bg-[#111] border-l-2 border-accent/30 group-hover/node:border-accent text-text-primary px-4 py-3 font-mono text-xs shadow-xl tracking-wider flex justify-between items-center transition-all duration-300 group-hover/pipeline:opacity-50 group-hover/node:!opacity-100 group-hover/node:bg-[#151515]">
                              <span>{node}</span>
                              <span className="text-[#444] text-[10px] group-hover/node:text-accent/70 transition-colors">{`0${i + 1}`}</span>
                            </div>
                            {i < project.architecture.length - 1 && (
                              <div className="arch-line w-[1px] h-4 bg-[#333] ml-4 opacity-50 group-hover/node:h-5 group-hover/node:bg-accent/40 transition-all duration-300" />
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
