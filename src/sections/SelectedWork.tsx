"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight, MoveRight } from "lucide-react";
import { EmberField, FlowLines, GridEffect, BlueprintEffect, SwaNeetiInk, MagneticEffect, usePointer } from "@/components/effects";
import { PROJECT_ASSETS } from "@/lib/assets";
import { useRouter } from "next/navigation";
import { projects as profileProjects } from "@/lib/profile";
import { motion, useTransform, useReducedMotion, AnimatePresence } from "framer-motion";
import { useSectionVisibility } from "@/lib/visibility";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const EFFECTS_MAP: Record<string, React.ElementType> = {
  imdpune: EmberField,
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

function ProjectDetails({ project, onOpen, mobile = false }: {
  project: typeof PROJECTS[number];
  onOpen: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  mobile?: boolean;
}) {
  return (
    <>
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
      }}
      className="flex items-baseline gap-4 mb-4"
    >
      <span className="font-mono text-4xl text-border opacity-50 tracking-tighter">{project.id}</span>
      <div className="font-mono text-accent text-xs tracking-widest uppercase">{project.category}</div>
    </motion.div>

    <motion.h3
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
      }}
      className="mobile-card-title lg:text-6xl font-display font-medium mb-4 lg:mb-6 uppercase tracking-tight leading-none"
    >
      {project.title}
    </motion.h3>

    <motion.p
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
      }}
      className="text-text-muted text-[0.9375rem] lg:text-lg mb-4 lg:mb-8 max-w-sm leading-relaxed border-l border-border pl-4"
    >
      {project.description}
    </motion.p>

    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
      }}
      className="flex flex-wrap gap-2 mb-4 lg:mb-10"
    >
      {project.tags.map(tag => (
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
      className="relative z-40 max-lg:mt-auto"
    >
      <MagneticEffect intensity={0.3}>
        <Link
          href={`/work/${project.slug}`}
          onClick={(e) => onOpen(e)}
          data-cursor="VIEW"
          aria-label={mobile ? "View project: " + project.title : undefined}
          className="flex min-h-11 lg:min-h-0 items-center gap-3 text-xs font-mono uppercase tracking-widest text-text-primary hover:text-accent transition-colors group"
          tabIndex={0}
        >
          <span className="relative pb-1 transform group-hover:translate-x-1 transition-transform duration-300">
            View Project
            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-accent origin-left scale-x-50 group-hover:scale-x-100 transition-transform duration-300" />
          </span>
          <MoveRight className="w-4 h-4 group-hover:translate-x-3 transition-transform duration-300 text-accent" />
        </Link>
      </MagneticEffect>
    </motion.div>
    </>
  );
}

export const SelectedWork = () => {
  const containerRef = useRef<HTMLElement>(null);
  const carousel = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);
  const [highlightedNode, setHighlightedNode] = useState("");
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const { sNX, sNY } = usePointer();
  const { ref: visibilityRef, isVisible } = useSectionVisibility("300px");

  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const layer1X = useTransform(sNX, [-1, 1], [-15, 15]);
  const layer1Y = useTransform(sNY, [-1, 1], [-15, 15]);
  const layer2X = useTransform(sNX, [-1, 1], [-5, 5]);
  const layer2Y = useTransform(sNY, [-1, 1], [-5, 5]);

  const handleProjectClick = (slug: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = (e.target as HTMLElement).closest('.project-card');
    const visual = card?.querySelector('.project-scene');

    if (!card || shouldReduceMotion || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();

    if (visual) {
      gsap.to(visual, { scale: 0.95, opacity: 0, duration: 0.4, ease: "power2.inOut" });
    }

    gsap.to(card, { opacity: 0, x: -20, duration: 0.3, ease: "power2.in" });

    setTimeout(() => {
      router.push(`/work/${slug}`);
    }, 400);
  };

  const goToSlide = (index: number) => {
    const track = carousel.current;
    const target = track?.children[index] as HTMLElement | undefined;
    if (!track || !target) return;
    track.scrollTo({ left: target.offsetLeft, behavior: shouldReduceMotion ? "instant" : "smooth" });
  };

  useGSAP(() => {
    if (!mounted) return;

    const media = gsap.matchMedia();
    media.add("(width < 64rem) and (prefers-reduced-motion: no-preference)", () => {
      Array.from(carousel.current?.children ?? []).forEach((card) => {
        const scene = card.querySelector(".project-scene");
        if (!scene) return;
        gsap.fromTo(scene.querySelectorAll(".arch-node"), { y: 9, opacity: 0.5 }, {
          y: 0, opacity: 1, duration: 0.38, stagger: 0.06,
          clearProps: "transform,opacity",
          scrollTrigger: { trigger: scene, start: "top 88%", once: true },
        });
      });
    }, containerRef);

    media.add("(min-width: 64rem)", () => {
      const projects = gsap.utils.toArray('.project-scene') as HTMLElement[];

      projects.forEach((project, index) => {
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
        } else if (index === 1) {
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
        } else if (index === 2) {
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
        } else {
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
    });

    return () => media.revert();
  }, { scope: containerRef, dependencies: [mounted] });

  return (
    <section className="mobile-section lg:py-32 relative bg-background" id="work" ref={(el) => { containerRef.current = el; visibilityRef(el); }}>
      <div className="mobile-gutter container mx-auto lg:px-12">
        <div className="work-heading lg:contents">
          <h2 className="mobile-section-title lg:text-sm font-mono text-text-muted lg:mb-24 tracking-widest uppercase lg:border-b border-border lg:pb-4">
            Selected Work
          </h2>
          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            <button type="button" aria-label="Previous project" disabled={slide === 0} onClick={() => goToSlide(slide - 1)} className="grid size-11 place-items-center border border-border disabled:opacity-35"><ChevronLeft size={18} /></button>
            <span aria-live="polite" className="font-mono text-xs tabular-nums">{slide + 1} / {PROJECTS.length}</span>
            <button type="button" aria-label="Next project" disabled={slide === PROJECTS.length - 1} onClick={() => goToSlide(slide + 1)} className="grid size-11 place-items-center border border-border disabled:opacity-35"><ChevronRight size={18} /></button>
          </div>
        </div>
        <div className="min-w-0 lg:flex flex-row items-start relative gap-16">

          <div className="hidden lg:block w-full lg:w-5/12 lg:sticky lg:top-32 relative z-40 min-h-[350px]" data-familiar-avoid>
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
                  <ProjectDetails project={PROJECTS[activeIndex]} onOpen={(event) => handleProjectClick(PROJECTS[activeIndex].slug, event)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div ref={carousel} aria-label="Project scenes" className="relative z-20 flex w-full min-w-0 gap-4 max-lg:snap-x max-lg:snap-mandatory max-lg:overflow-x-auto max-lg:overscroll-x-contain lg:w-7/12 lg:flex-col lg:gap-48"
            onScroll={(event) => {
              const { scrollLeft, children } = event.currentTarget;
              const stride = (children[1] as HTMLElement | undefined)?.offsetLeft;
              if (stride) setSlide(Math.round(scrollLeft / stride));
            }}>
            {PROJECTS.map((project, i) => (
              <article key={project.id} className="project-card project-slide min-w-0 max-lg:flex max-lg:basis-full max-lg:shrink-0 max-lg:snap-start max-lg:flex-col max-lg:border max-lg:border-border max-lg:bg-surface" data-project={project.slug}>
              <div className="project-scene relative flex min-h-[16rem] items-center justify-center p-4 lg:min-h-[500px] lg:p-8 border-b lg:border border-border overflow-hidden group bg-[#0a0a0a]" data-cursor="VIEW">

                <div
                  className={`absolute z-0 leading-none select-none pointer-events-none arch-bg-num text-white opacity-[0.04] lg:opacity-0 ${
                    i === 0 ? "top-[-10%] -right-[15%] text-[200px] md:text-[400px] font-thin" :
                    i === 1 ? "bottom-[-15%] -left-[10%] text-[250px] md:text-[350px] font-light" :
                    i === 2 ? "bottom-[-30%] -right-[10%] text-[300px] md:text-[500px] font-medium" :
                    "top-[10%] left-[15%] text-[200px] md:text-[300px] font-bold tracking-widest"
                  }`}
                >
                  0{i + 1}
                </div>

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

                <motion.div
                  className="absolute inset-0 z-10"
                  style={{ x: shouldReduceMotion ? 0 : layer1X, y: shouldReduceMotion ? 0 : layer1Y }}
                >
                  {isVisible && project.EffectComponent && <project.EffectComponent />}
                </motion.div>

                <div className="absolute top-4 right-4 text-[10px] font-mono text-text-muted/60 lg:text-[#333] tracking-widest z-20">
                  SYS_VISUAL // {project.theme.toUpperCase()}
                </div>

                <div className="relative z-20 mt-7 lg:mt-0 w-full max-w-xs flex flex-col gap-1">
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
                            className="flex flex-col group/node transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] max-lg:aria-pressed:z-10 motion-safe:max-lg:aria-pressed:-translate-y-0.5 motion-safe:max-lg:aria-pressed:scale-[1.02]"
                            role="button"
                            tabIndex={0}
                            aria-pressed={highlightedNode === project.slug + "-" + nIdx}
                            onClick={(event) => {
                              const key = project.slug + "-" + nIdx;
                              setHighlightedNode((current) => current === key ? "" : key);
                              window.dispatchEvent(new CustomEvent("companionInteract", { detail: { type: "pipeline-hover", target: event.currentTarget } }));
                            }}
                            onKeyDown={(event) => {
                              if (event.key !== "Enter" && event.key !== " ") return;
                              event.preventDefault();
                              event.currentTarget.click();
                            }}
                            data-highlighted={highlightedNode === project.slug + "-" + nIdx || undefined}
                            onMouseEnter={(e) => window.dispatchEvent(new CustomEvent("companionInteract", { detail: { type: "pipeline-hover", target: e.currentTarget } }))}
                          >
                            <div className="arch-node [[data-highlighted=true]>&]:border-accent [[data-highlighted=true]>&]:bg-[#221313] bg-[#111] border-l-2 border-accent/30 group-hover/node:border-accent text-text-primary min-h-10 lg:min-h-0 px-3 lg:px-4 py-2 lg:py-3 font-mono text-xs shadow-xl tracking-wider flex justify-between items-center transition-all duration-300 group-hover/pipeline:opacity-50 group-hover/node:!opacity-100 group-hover/node:bg-[#151515]">
                              <span>{node}</span>
                              <span className="text-[#444] text-[10px] group-hover/node:text-accent/70 transition-colors">{`0${nIdx + 1}`}</span>
                            </div>
                            {nIdx < project.architecture.length - 1 && (
                              <div className="arch-line w-[1px] h-2.5 lg:h-4 bg-[#333] ml-4 opacity-50 group-hover/node:h-5 group-hover/node:bg-accent/40 transition-all duration-300" />
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="mobile-card-pad flex flex-1 flex-col lg:hidden" data-familiar-avoid>
                <ProjectDetails mobile project={project} onOpen={(event) => handleProjectClick(project.slug, event)} />
              </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
