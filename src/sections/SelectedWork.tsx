"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MoveRight } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const PROJECTS = [
  {
    id: "01",
    title: "AlphaCouncil",
    category: "FINANCE / AI / SYSTEMS",
    description: "An agentic system for market discovery, risk analysis, and execution reasoning.",
    tags: ["Python", "Agents", "Finance", "LLMs"],
    theme: "red / ember / market-line",
    architecture: ["MARKET", "DISCOVERY", "COMMITTEE", "RISK", "EXECUTION"],
  },
  {
    id: "02",
    title: "Swa.Neeti",
    category: "RAG / AGENTS / REASONING",
    description: "A legal policy retrieval and reasoning engine using structured authorities.",
    tags: ["RAG", "Next.js", "PostgreSQL", "Reasoning"],
    theme: "ink / paper spread",
    architecture: ["QUERY", "RETRIEVAL", "AUTHORITIES", "REASONING", "VALIDATION"],
  },
  {
    id: "03",
    title: "Windy",
    category: "ML / DATA / AVIATION",
    description: "Predictive aviation wind modelling using historical flight and weather data.",
    tags: ["ML", "Data", "Aviation"],
    theme: "wind / flowing-line motion",
    architecture: ["DATA INGESTION", "FEATURE ENG", "MODEL", "PREDICTION"],
  },
  {
    id: "04",
    title: "Spenza",
    category: "PRODUCT / FINANCE / SOFTWARE",
    description: "A robust financial tracking and split-management product.",
    tags: ["TypeScript", "React", "PostgreSQL"],
    theme: "clean grid / balance",
    architecture: ["USER", "TRANSACTION", "SPLIT LOGIC", "LEDGER"],
  },
  {
    id: "05",
    title: "ThriveForce",
    category: "ROBOTICS / CAD / HARDWARE",
    description: "Combat robotics systems engineered for high-impact forces.",
    tags: ["CAD", "Robotics", "Hardware"],
    theme: "blueprint / mechanical line",
    architecture: ["DESIGN", "SIMULATION", "FABRICATION", "ASSEMBLY"],
  }
];

export const SelectedWork = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const projects = gsap.utils.toArray('.project-card') as HTMLElement[];
    
    projects.forEach((project, i) => {
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

        <div className="flex flex-col gap-32">
          {PROJECTS.map((project, index) => (
            <div key={project.id} className="project-card flex flex-col md:flex-row gap-12 md:gap-24 items-start">
              {/* Info Side */}
              <div className="flex-1 md:w-1/2 md:sticky md:top-32">
                <div className="font-mono text-accent text-sm mb-4">{project.id} // {project.category}</div>
                <h3 className="text-4xl md:text-6xl font-display font-medium mb-6">{project.title}</h3>
                <p className="text-text-muted text-lg mb-8 max-w-md leading-relaxed">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-3 mb-12">
                  {project.tags.map(tag => (
                    <span key={tag} className="text-xs font-mono border border-border px-3 py-1 text-text-muted rounded-sm">
                      {tag}
                    </span>
                  ))}
                </div>
                <button 
                  data-cursor="VIEW"
                  className="flex items-center gap-3 text-sm font-mono uppercase tracking-widest text-text-primary hover:text-accent transition-colors group"
                >
                  View Project
                  <MoveRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>

              {/* Visual Side */}
              <div className="flex-1 w-full bg-surface-elevated aspect-[4/5] md:aspect-square flex items-center justify-center p-8 border border-border relative overflow-hidden group" data-cursor="VIEW">
                {/* Abstract Visual Placeholder */}
                <div className="absolute inset-0 opacity-20 transition-opacity group-hover:opacity-40" 
                  style={{
                    background: index % 2 === 0 
                      ? 'radial-gradient(circle at center, var(--accent-soft) 0%, transparent 70%)'
                      : 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%)'
                  }}
                />
                
                {/* Architecture Diagram */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="text-xs font-mono text-text-muted mb-8 tracking-widest uppercase opacity-50">System Architecture</div>
                  {project.architecture.map((node, i) => (
                    <div key={node} className="flex flex-col items-center">
                      <div className="arch-node border border-text-muted text-text-primary px-4 py-2 font-mono text-xs bg-surface shadow-lg tracking-wider">
                        {node}
                      </div>
                      {i < project.architecture.length - 1 && (
                        <div className="arch-line w-[1px] bg-accent my-1 opacity-50" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
