"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight, MoveRight } from "lucide-react";
import { EmberField, FlowLines, GridEffect, BlueprintEffect, SwaNeetiInk, MagneticEffect, usePointer } from "@/components/effects";
import { PROJECT_ASSETS } from "@/lib/assets";
import { projects as profileProjects } from "@/lib/profile";
import { AnimatePresence, motion, useReducedMotion, useTransform } from "framer-motion";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const effects: Record<string, React.ElementType> = {
  imdpune: EmberField,
  swaneeti: SwaNeetiInk,
  windy: FlowLines,
  spenza: GridEffect,
  thriveforce: BlueprintEffect,
};

const PROJECTS = profileProjects.map((project) => ({
  ...project,
  Effect: effects[project.slug],
  assets: PROJECT_ASSETS[project.slug],
}));

type Project = (typeof PROJECTS)[number];

function ProjectDetails({ project }: { project: Project }) {
  return (
    <>
      <div className="project-meta mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs uppercase tracking-wide">
        <span className="project-index text-text-muted">{project.id}</span>
        <span className="text-accent">{project.category}</span>
      </div>
      <h3 className="project-title mb-3 font-display font-medium uppercase lg:mb-5">{project.title}</h3>
      <p className="project-description mb-4 max-w-[44ch] text-[0.9375rem] leading-relaxed text-text-muted lg:mb-6 lg:text-base">{project.description}</p>
      <div className="flex flex-wrap gap-1.5 lg:mb-6">
        {project.tags.map((tag) => (
          <span key={tag} className="project-tag inline-flex min-h-6 items-center px-2 py-1 font-mono text-[10px] uppercase tracking-wide">{tag}</span>
        ))}
      </div>
    </>
  );
}

function ProjectAction({ project }: { project: Project }) {
  return (
    <MagneticEffect intensity={0.24}>
      <Link href={`/work/${project.slug}`} data-cursor="VIEW" aria-label={"View project: " + project.title}
        className="project-action portfolio-control group inline-flex min-h-11 items-center gap-3 px-3.5 font-mono text-xs uppercase tracking-wide">
        Read case study <MoveRight className="size-4 text-accent transition-transform group-hover:translate-x-1" />
      </Link>
    </MagneticEffect>
  );
}

export const SelectedWork = () => {
  const section = useRef<HTMLElement>(null);
  const carousel = useRef<HTMLDivElement>(null);
  const slideStride = useRef(0);
  const currentSlide = useRef(0);
  const [slide, setSlide] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleScenes, setVisibleScenes] = useState<Set<string>>(new Set());
  const [highlightedNode, setHighlightedNode] = useState("");
  const reduceMotion = useReducedMotion();
  const { sNX, sNY } = usePointer();
  const layerX = useTransform(sNX, [-1, 1], [-9, 9]);
  const layerY = useTransform(sNY, [-1, 1], [-6, 6]);
  const activeProject = PROJECTS[activeIndex];

  useEffect(() => {
    const track = carousel.current;
    if (!track) return;
    const scenes = new IntersectionObserver((entries) => {
      setVisibleScenes((previous) => {
        const next = new Set(previous);
        for (const { target, isIntersecting } of entries) {
          const slug = (target as HTMLElement).dataset.project;
          if (!slug) continue;
          if (isIntersecting) next.add(slug);
          else next.delete(slug);
        }
        return next;
      });
    }, { rootMargin: "100px 0px", threshold: 0.2 });
    for (const card of track.children) scenes.observe(card);

    const updateStride = () => {
      const stride = (track.children[1] as HTMLElement | undefined)?.offsetLeft ?? 0;
      if (!stride || stride === slideStride.current) return;
      slideStride.current = stride;
      track.scrollTo({ left: stride * currentSlide.current, behavior: "instant" });
    };
    const resize = new ResizeObserver(updateStride);
    resize.observe(track);
    updateStride();
    return () => { scenes.disconnect(); resize.disconnect(); };
  }, []);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add({ desktop: "(width >= 64rem)", motion: "(prefers-reduced-motion: no-preference)" }, (context) => {
      const { desktop, motion: animate } = context.conditions ?? {};
      const cards = carousel.current ? Array.from(carousel.current.children) : [];
      cards.forEach((card, index) => {
        if (desktop) {
          ScrollTrigger.create({
            trigger: card,
            start: "top 62%",
            end: "bottom 50%",
            onEnter: () => setActiveIndex(index),
            onEnterBack: () => setActiveIndex(index),
          });
        }
        if (desktop && animate) {
          const nodes = card.querySelectorAll(".arch-node");
          gsap.fromTo(nodes, { opacity: 0.64, y: 10 }, {
            opacity: 1, y: 0, duration: 0.48, stagger: 0.065, ease: "power3.out", clearProps: "transform,opacity",
            scrollTrigger: { trigger: card, start: "top 78%", once: true },
          });
        }
      });
    }, section);
    return () => media.revert();
  }, { scope: section });

  const goToSlide = (index: number) => {
    const track = carousel.current;
    if (!track) return;
    track.scrollTo({ left: index * slideStride.current, behavior: reduceMotion ? "instant" : "smooth" });
  };

  return (
    <section className="portfolio-chapter chapter-divider relative" id="work" ref={section}>
      <div className="portfolio-frame">
        <header className="project-heading">
          <h2 className="chapter-heading">Selected Work</h2>
          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            <button type="button" aria-label="Previous project" disabled={slide === 0} onClick={() => goToSlide(slide - 1)} className="portfolio-control grid size-11 place-items-center disabled:opacity-35"><ChevronLeft size={17} /></button>
            <span aria-live="polite" className="font-mono text-xs tabular-nums">{slide + 1} / {PROJECTS.length}</span>
            <button type="button" aria-label="Next project" disabled={slide === PROJECTS.length - 1} onClick={() => goToSlide(slide + 1)} className="portfolio-control grid size-11 place-items-center disabled:opacity-35"><ChevronRight size={17} /></button>
          </div>
        </header>
        <div className="project-editorial min-w-0">
          <aside className="project-sticky hidden lg:block" data-familiar-avoid>
            <AnimatePresence initial={false} mode="wait">
              <motion.div key={activeIndex}
                initial={reduceMotion ? false : { opacity: 0.65, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0.45, y: -5, transition: { duration: 0.13 } }}
                transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}>
                <ProjectDetails project={activeProject} />
                <ProjectAction project={activeProject} />
              </motion.div>
            </AnimatePresence>
          </aside>

          <div ref={carousel} aria-label="Project scenes" className="project-track relative flex min-w-0 max-lg:snap-x max-lg:snap-mandatory max-lg:overflow-x-auto max-lg:overscroll-x-contain lg:flex-col"
            onScroll={(event) => {
              if (!slideStride.current) return;
              const next = Math.round(event.currentTarget.scrollLeft / slideStride.current);
              if (currentSlide.current !== next) {
                currentSlide.current = next;
                setSlide(next);
              }
            }}>
            {PROJECTS.map((project) => {
              const visible = visibleScenes.has(project.slug);
              return (
                <article key={project.id} className="project-card project-slide isolate min-w-0 max-lg:flex max-lg:basis-full max-lg:shrink-0 max-lg:snap-start max-lg:flex-col"
                  data-project={project.slug} data-in-view={visible || undefined}>
                  <div className="project-details mobile-card-pad relative z-20 lg:hidden" data-familiar-avoid>
                    <ProjectDetails project={project} />
                  </div>
                  <div className="project-scene relative flex min-w-0 items-center justify-center overflow-hidden" data-cursor="VIEW">
                    <span aria-hidden="true" className="project-scene-number">{project.id}</span>
                    {project.assets?.hero && (
                      <motion.div className="pointer-events-none absolute inset-0" style={{ x: reduceMotion ? 0 : layerX, y: reduceMotion ? 0 : layerY }}>
                        <Image src={project.assets.hero} alt="" fill sizes="(width < 64rem) 90vw, 55vw" className="object-cover opacity-60 mix-blend-luminosity" />
                      </motion.div>
                    )}
                    {project.assets?.texture && (
                      <div className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-25">
                        <Image src={project.assets.texture} alt="" fill sizes="(width < 64rem) 90vw, 55vw" className="object-cover" />
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                      {visible && project.Effect && <project.Effect />}
                    </div>
                    <div className="project-scene-theme font-mono text-[9px] tracking-wide">{project.year} · {project.status}</div>
                    <div className="project-pipeline relative z-10 w-full max-w-sm">
                      {project.assets?.diagram ? (
                        <div className="relative aspect-square w-full">
                          <Image src={project.assets.diagram} alt={project.title + " architecture"} fill sizes="(width < 64rem) 90vw, 24rem" className="object-contain" />
                        </div>
                      ) : (
                        <>
                          <p className="mb-3 flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                            <span className="size-1.5 bg-accent" /> How it works
                          </p>
                          <div className="flex flex-col">
                            {project.architecture.map((node, index) => {
                              const key = project.slug + "-" + index;
                              const highlighted = highlightedNode === key;
                              const reactToNode = (target: HTMLButtonElement) => window.dispatchEvent(new CustomEvent("companionInteract", { detail: { type: "pipeline-hover", target } }));
                              return (
                                <button type="button" key={node} aria-pressed={highlighted} data-highlighted={highlighted || undefined}
                                  className="project-node group/node flex flex-col text-left"
                                  onClick={(event) => { setHighlightedNode((current) => current === key ? "" : key); reactToNode(event.currentTarget); }}
                                  onMouseEnter={(event) => reactToNode(event.currentTarget)}>
                                  <span className="arch-node flex w-full items-center justify-between gap-3 font-mono text-xs">
                                    <span>{node}</span>
                                    <span aria-hidden="true" className="text-[10px] text-text-muted">{String(index + 1).padStart(2, "0")}</span>
                                  </span>
                                  {index < project.architecture.length - 1 && <span aria-hidden="true" className="arch-line" />}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="project-card-action mobile-card-pad lg:hidden">
                    <ProjectAction project={project} />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
