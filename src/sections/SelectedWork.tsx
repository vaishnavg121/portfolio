"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight, MoveRight } from "lucide-react";
import { MagneticEffect } from "@/components/effects";
import { ProjectMotion } from "./work/ProjectMotion";
import { projects as PROJECTS } from "@/lib/profile";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const editorialQuery = "(min-width: 64rem)";
const subscribeEditorial = (change: () => void) => {
  const media = window.matchMedia(editorialQuery);
  media.addEventListener("change", change);
  return () => media.removeEventListener("change", change);
};
const editorialSnapshot = () => window.matchMedia(editorialQuery).matches;
const serverEditorial = () => false;

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
    <MagneticEffect intensity={0.08}>
      <Link href={`/work/${project.slug}`} data-cursor="VIEW" aria-label={"View project: " + project.title}
        className="project-action portfolio-text-link font-mono text-xs uppercase tracking-wide">
        <span className="portfolio-link-label">View Project</span>
        <MoveRight className="portfolio-link-arrow" aria-hidden="true" />
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
  const reduceMotion = useReducedMotion();
  const editorial = useSyncExternalStore(subscribeEditorial, editorialSnapshot, serverEditorial);
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
    media.add(editorialQuery, () => {
      const cards = carousel.current ? Array.from(carousel.current.children) : [];
      cards.forEach((card, index) => {
        ScrollTrigger.create({
          trigger: card,
          start: "top 62%",
          end: "bottom 50%",
          onEnter: () => setActiveIndex(index),
          onEnterBack: () => setActiveIndex(index),
        });
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
            {PROJECTS.map((project, index) => {
              const visible = visibleScenes.has(project.slug);
              return (
                <article key={project.id} className="project-card project-slide isolate min-w-0 max-lg:flex max-lg:basis-full max-lg:shrink-0 max-lg:snap-start max-lg:flex-col"
                  data-project={project.slug} data-in-view={visible || undefined}>
                  <div className="project-details mobile-card-pad relative z-20 lg:hidden" data-familiar-avoid>
                    <ProjectDetails project={project} />
                  </div>
                  <div className="project-scene min-w-0" data-familiar-protect data-familiar-yield>
                    <ProjectMotion slug={project.slug} active={visible && index === (editorial ? activeIndex : slide)} reduced={Boolean(reduceMotion)} />
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
