"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
// using GSAP instead of framer-motion here
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MoveRight } from "lucide-react";
import { EmberField, FlowLines, GridEffect, BlueprintEffect, SwaNeetiInk, MagneticEffect, usePointer } from "@/components/effects";
import { PROJECT_ASSETS } from "@/lib/assets";
import { useRouter } from "next/navigation";
import { projects as profileProjects } from "@/lib/profile";
import { motion, useTransform, useReducedMotion, AnimatePresence } from "framer-motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const EFFECTS_MAP: Record<string, React.ElementType> = {
  alphacouncil: EmberField,
  swaneeti: SwaNeetiInk,
  windy: FlowLines,
  spenza: GridEffect,
  thriveforce: BlueprintEffect,
};

const PROJECTS = profileProjects.map((p) => ({
  ...p,
  EffectComponent: EFFECTS_MAP[p.slug],
  assets: PROJECT_ASSETS[p.slug as keyof typeof PROJECT_ASSETS],
}));

export const SelectedWork = () => {
  const containerRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const { sNX, sNY } = usePointer();

  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Motion values
  const layer1X = useTransform(sNX, [-1, 1], [-15, 15]);
  const layer1Y = useTransform(sNY, [-1, 1], [-15, 15]);
  const layer2X = useTransform(sNX, [-1, 1], [-5, 5]);
  const layer2Y = useTransform(sNY, [-1, 1], [-5, 5]);

  const handleProjectClick = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    const card = (e.target as HTMLElement).closest('.project-card');
    const visual = card?.querySelector('.group');
    
    if (!card) {
      router.push(`/work/${slug}`);
      return;
    }

    if (visual) {
      gsap.to(visual, { scale: 0.95, opacity: 0, duration: 0.4, ease: "power2.inOut" });
    }
    
    gsap.to(card, { opacity: 0, x: -20, duration: 0.3, ease: "power2.in" });
    
    setTimeout(() => {
      router.push(`/work/${slug}`);
    }, 400);
  };

  useGSAP(() => {
    if (!mounted) return;
    const projects = gsap.utils.toArray('.project-scene') as HTMLElement[];
    
    projects.forEach((project, index) => {
      // Update active functional UI based on scroll position
      ScrollTrigger.create({
        trigger: project,
        start: "top 55%",
        end: "bottom 55%",
        onEnter: () => setActiveIndex(index),
        onEnterBack: () => setActiveIndex(index),
      });

      const visual = project.querySelector('.group');
      const bgNum = project.querySelector('.arch-bg-num');
      const nodes = project.querySelectorAll('.arch-node');
      const lines = project.querySelectorAll('.arch-line');

      // AlphaCouncil (0)
      if (index === 0) {
        if (visual) {
          gsap.fromTo(visual, 
            { clipPath: "inset(20% 40% 20% 0%)", scale: 0.95, y: 50 },
            { clipPath: "inset(0% 0% 0% 0%)", scale: 1, y: 0, duration: 1.4, ease: "power3.out", scrollTrigger: { trigger: project, start: "top 85%", end: "top 40%", scrub: false } }
          );
          gsap.to(visual, { y: -80, ease: "none", scrollTrigger: { trigger: project, start: "top bottom", end: "bottom top", scrub: 1 } });
        }
        if (bgNum) {
          gsap.fromTo(bgNum,
            { x: 150, y: -100, opacity: 0.08 },
            { x: -100, y: 50, ease: "none", scrollTrigger: { trigger: project, start: "top bottom", end: "bottom top", scrub: 1.5 } }
          );
        }
      } 
      // Swa.Neeti (1)
      else if (index === 1) {
        if (visual) {
          gsap.fromTo(visual, 
            { clipPath: "inset(0% 20% 40% 20%)", y: 30 },
            { clipPath: "inset(0% 0% 0% 0%)", y: -120, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: project, start: "top 80%", end: "bottom top", scrub: 1 } }
          );
        }
        if (bgNum) {
          gsap.fromTo(bgNum,
            { x: -250, y: 300, opacity: 0.05, rotation: -5 },
            { x: 50, y: -50, rotation: 0, ease: "none", scrollTrigger: { trigger: project, start: "top bottom", end: "bottom top", scrub: 2.0 } }
          );
        }
      }
      // Windy (2)
      else if (index === 2) {
        if (visual) {
          gsap.fromTo(visual, 
            { clipPath: "circle(20% at 50% 50%)", scale: 1.05 },
            { clipPath: "circle(100% at 50% 50%)", scale: 1, duration: 1.5, ease: "power2.inOut", scrollTrigger: { trigger: project, start: "top 85%", end: "top 40%", scrub: false } }
          );
          gsap.to(visual, { y: -80, ease: "none", scrollTrigger: { trigger: project, start: "top bottom", end: "bottom top", scrub: 1.2 } });
        }
        if (bgNum) {
          gsap.fromTo(bgNum,
            { x: 50, y: 250, scale: 1.2, opacity: 0.025 },
            { x: -50, y: -150, scale: 1.4, ease: "none", scrollTrigger: { trigger: project, start: "top bottom", end: "bottom top", scrub: 2.5 } }
          );
        }
      }
      // Spenza (3)
      else {
        if (visual) {
          gsap.fromTo(visual, 
            { clipPath: "polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)" },
            { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 1, ease: "power4.inOut", scrollTrigger: { trigger: project, start: "top 80%", end: "top 50%", scrub: false } }
          );
          gsap.to(visual, { y: -150, ease: "none", scrollTrigger: { trigger: project, start: "top bottom", end: "bottom top", scrub: 0.8 } });
        }
        if (bgNum) {
          gsap.fromTo(bgNum,
            { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", scale: 0.8, y: -200, opacity: 0.05 },
            { clipPath: "polygon(0 0, 100% 0, 100% 30%, 0 30%)", scale: 1, y: 150, ease: "power1.inOut", scrollTrigger: { trigger: project, start: "top bottom", end: "bottom top", scrub: 1.8 } }
          );
        }
      }

      // Architecture Nodes
      if (nodes.length > 0) {
        gsap.fromTo(nodes,
          { opacity: 0, scale: 0.8, y: 10 },
          { opacity: 1, scale: 1, y: 0, duration: 0.5, stagger: 0.15, ease: "back.out(1.7)", scrollTrigger: { trigger: project, start: "top 60%" } }
        );
      }
      if (lines.length > 0) {
        gsap.fromTo(lines,
          { height: 0, opacity: 0 },
          { height: 20, opacity: 1, duration: 0.3, stagger: 0.15, ease: "power1.inOut", delay: 0.2, scrollTrigger: { trigger: project, start: "top 60%" } }
        );
      }
    });
  }, { scope: containerRef, dependencies: [mounted] });

  return (
    <section className="py-32 relative bg-background" id="work" ref={containerRef}>
      <div className="container mx-auto px-6 md:px-12">
        <h2 className="text-sm font-mono text-text-muted mb-24 tracking-widest uppercase border-b border-border pb-4">
          Selected Work
        </h2>

        <div className="flex flex-col md:flex-row items-start relative gap-12 md:gap-16">
          
          {/* Shared Functional Info Column (Sticky) */}
          <div className="w-full md:w-5/12 md:sticky md:top-32 relative z-40 min-h-[350px]" data-familiar-avoid>
            <AnimatePresence mode="wait">
              {mounted && (
                <motion.div
                  key={activeIndex}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
                    exit: { opacity: 0, transition: { duration: 0.2 } }
                  }}
                  className="flex flex-col w-full"
                >
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                    }}
                    className="flex items-baseline gap-4 mb-4"
                  >
                    <span className="font-mono text-4xl text-border opacity-50 tracking-tighter">{PROJECTS[activeIndex].id}</span>
                    <div className="font-mono text-accent text-xs tracking-widest uppercase">{PROJECTS[activeIndex].category}</div>
                  </motion.div>
                  
                  <motion.h3 
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                    }}
                    className="text-4xl md:text-5xl lg:text-6xl font-display font-medium mb-6 uppercase tracking-tight leading-none"
                  >
                    {PROJECTS[activeIndex].title}
                  </motion.h3>
                  
                  <motion.p 
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                    }}
                    className="text-text-muted text-base md:text-lg mb-8 max-w-sm leading-relaxed border-l border-border pl-4"
                  >
                    {PROJECTS[activeIndex].description}
                  </motion.p>
                  
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                    }}
                    className="flex flex-wrap gap-2 mb-10"
                  >
                    {PROJECTS[activeIndex].tags.map(tag => (
                      <span key={tag} className="text-[10px] font-mono border border-[#333] px-2 py-1 text-text-muted uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </motion.div>
                  
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                    }}
                    className="relative z-40"
                  >
                    <MagneticEffect intensity={0.3}>
                      <button 
                        onClick={(e) => handleProjectClick(PROJECTS[activeIndex].slug, e)}
                        data-cursor="VIEW"
                        className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-text-primary hover:text-accent transition-colors group"
                        tabIndex={0}
                      >
                        <span className="relative pb-1 transform group-hover:translate-x-1 transition-transform duration-300">
                          View Project
                          <span className="absolute bottom-0 left-0 w-full h-[1px] bg-accent origin-left scale-x-50 group-hover:scale-x-100 transition-transform duration-300" />
                        </span>
                        <MoveRight className="w-4 h-4 group-hover:translate-x-3 transition-transform duration-300 text-accent" />
                      </button>
                    </MagneticEffect>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Scrolling Visual Scenes Column */}
          <div className="w-full md:w-7/12 flex flex-col gap-32 md:gap-48 relative z-20">
            {PROJECTS.map((project, i) => (
              <div key={project.id} className="project-scene relative min-h-[500px] flex items-center justify-center p-8 border border-border overflow-hidden group bg-[#0a0a0a]" data-cursor="VIEW">
                
                {/* Large Background Number */}
                <div 
                  className={`absolute z-0 leading-none select-none pointer-events-none arch-bg-num text-white ${
                    i === 0 ? "top-[-10%] -right-[15%] text-[200px] md:text-[400px] font-thin" :
                    i === 1 ? "bottom-[-15%] -left-[10%] text-[250px] md:text-[350px] font-light" :
                    i === 2 ? "bottom-[-30%] -right-[10%] text-[300px] md:text-[500px] font-medium" :
                    "top-[10%] left-[15%] text-[200px] md:text-[300px] font-bold tracking-widest"
                  }`}
                  style={{ opacity: 0 }}
                >
                  0{i + 1}
                </div>

                {/* Hero Asset Background */}
                {project.assets?.hero && (
                  <motion.div 
                    className="absolute inset-0 z-0"
                    style={{ x: shouldReduceMotion ? 0 : layer1X, y: shouldReduceMotion ? 0 : layer1Y }}
                  >
                    <Image 
                      src={project.assets.hero} 
                      alt={`${project.title} Hero`} 
                      fill 
                      className="object-cover opacity-60 mix-blend-luminosity group-hover:opacity-100 transition-opacity duration-700" 
                      onLoad={(e) => { (e.target as HTMLElement).style.opacity = '0.6'; }}
                    />
                  </motion.div>
                )}

                {/* Texture Asset Overlay */}
                {project.assets?.texture && (
                  <motion.div 
                    className="absolute inset-0 z-10 pointer-events-none mix-blend-overlay opacity-30"
                    style={{ x: shouldReduceMotion ? 0 : layer2X, y: shouldReduceMotion ? 0 : layer2Y }}
                  >
                    <Image 
                      src={project.assets.texture} 
                      alt="" 
                      fill 
                      className="object-cover" 
                    />
                  </motion.div>
                )}

                {/* Visual Effects */}
                <motion.div 
                  className="absolute inset-0 z-10"
                  style={{ x: shouldReduceMotion ? 0 : layer1X, y: shouldReduceMotion ? 0 : layer1Y }}
                >
                  <project.EffectComponent />
                </motion.div>

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
                        {project.architecture.map((node, nIdx) => (
                          <div 
                            key={node} 
                            className="flex flex-col group/node transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02]"
                            onMouseEnter={(e) => window.dispatchEvent(new CustomEvent("companionInteract", { detail: { type: "pipeline-hover", target: e.currentTarget } }))}
                          >
                            <div className="arch-node bg-[#111] border-l-2 border-accent/30 group-hover/node:border-accent text-text-primary px-4 py-3 font-mono text-xs shadow-xl tracking-wider flex justify-between items-center transition-all duration-300 group-hover/pipeline:opacity-50 group-hover/node:!opacity-100 group-hover/node:bg-[#151515]">
                              <span>{node}</span>
                              <span className="text-[#444] text-[10px] group-hover/node:text-accent/70 transition-colors">{`0${nIdx + 1}`}</span>
                            </div>
                            {nIdx < project.architecture.length - 1 && (
                              <div className="arch-line w-[1px] h-4 bg-[#333] ml-4 opacity-50 group-hover/node:h-5 group-hover/node:bg-accent/40 transition-all duration-300" />
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
