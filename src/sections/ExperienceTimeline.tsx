"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

import { education, experience, extracurricular } from "@/lib/profile";

const CHAPTERS = [
  {
    num: "CH.01",
    title: education.university.name.toUpperCase(),
    subtitle: `${education.university.degree} / ${education.university.minor}`,
    details: `${education.university.timeline} | ${education.university.gpa}`
  },
  {
    num: "CH.02",
    title: extracurricular.team.toUpperCase(),
    subtitle: extracurricular.role,
    details: extracurricular.description
  },
  {
    num: "CH.03",
    title: experience[0].company.toUpperCase(),
    subtitle: experience[0].role,
    details: `${experience[0].timeline} — ${experience[0].description}`
  },
  {
    num: "CH.04",
    title: "PREVIOUS EDUCATION",
    subtitle: "High School & Secondary",
    details: `${education.previous[0].name} (${education.previous[0].score}) | ${education.previous[1].name} (${education.previous[1].score})`
  }
];

export const ExperienceTimeline = () => {
  const containerRef = useRef<HTMLElement>(null);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      for (const chapter of gsap.utils.toArray<HTMLElement>(".chapter-block")) {
        gsap.from(chapter.querySelector(".chap-content"), {
          opacity: 0.64, y: 12, duration: 0.5, ease: "power3.out", clearProps: "transform,opacity",
          scrollTrigger: { trigger: chapter, start: "top 88%", once: true },
        });
      }
    }, containerRef);
    return () => media.revert();
  }, { scope: containerRef });

  return (
    <section className="portfolio-chapter chapter-divider experience-section overflow-hidden relative" id="about" ref={containerRef}>
      <div className="portfolio-frame relative z-10">
        <h2 className="chapter-heading mb-10 relative z-20 lg:mb-16">
          Experience / Chapters
        </h2>

        <div className="exp-timeline-container flex flex-col gap-10 lg:gap-16 relative">
          {CHAPTERS.map(chapter => (
            <article key={chapter.num} className="relative chapter-block">
              <div className="chap-content relative z-10 grid grid-cols-1 lg:grid-cols-[47%_1fr] gap-2 lg:gap-8 items-start" data-familiar-avoid>
                
                <div className="pt-2 lg:pr-20 max-w-full">
                  <div className="font-mono text-accent text-xs tracking-widest mb-2 lg:mb-4">
                    {chapter.num}
                  </div>
                  <h3 className="mobile-card-title lg:text-[clamp(28px,2.8vw,44px)] font-display font-medium text-text-primary mb-2 tracking-tight leading-[1.05] uppercase max-w-full">
                    {chapter.title}
                  </h3>
                </div>

                <div className="pt-1 lg:pt-8">
                  <div className="text-text-primary font-mono text-xs tracking-wider mb-2 lg:mb-4 uppercase">
                    {chapter.subtitle}
                  </div>
                  <p className="text-text-muted text-base leading-relaxed max-w-md">
                    {chapter.details}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
