"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useSectionVisibility } from "@/lib/visibility";

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
  const { ref: visibilityRef, isVisible } = useSectionVisibility("300px");

  useGSAP(() => {
    if (!isVisible) return;

    const ctx = gsap.context(() => {
      const chapters = gsap.utils.toArray('.chapter-block') as HTMLElement[];

      chapters.forEach((chap) => {
        const bgNum = chap.querySelector('.bg-num');
        const content = chap.querySelector('.chap-content');

        if (bgNum) {
          gsap.fromTo(bgNum, { y: 150, opacity: 0 }, {
            y: -100,
            opacity: 0.1,
            ease: "none",
            scrollTrigger: {
              trigger: chap,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.5,
            }
          });
        }

        if (content) {
          gsap.fromTo(content,
            { opacity: 0.2 },
            {
              opacity: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: chap,
                start: "top 80%",
                end: "top 30%",
                scrub: true,
              }
            }
          );

          gsap.to(content, {
            opacity: 0.45,
            ease: "power2.in",
            scrollTrigger: {
              trigger: chap,
              start: "bottom 50%",
              end: "bottom 20%",
              scrub: true,
            }
          });
        }
      });

      gsap.fromTo('.exp-timeline-rail-active',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: '.exp-timeline-container',
            start: "top 60%",
            end: "bottom 80%",
            scrub: true,
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, { scope: containerRef, dependencies: [isVisible] });

  return (
    <section className="py-32 bg-background border-t border-border overflow-hidden relative" id="about" ref={(el) => { containerRef.current = el; visibilityRef(el); }}>
      <div className="container mx-auto px-6 md:px-12 max-w-5xl relative z-10">
        <h2 className="text-sm font-mono text-text-muted mb-24 tracking-widest uppercase border-b border-border pb-4 relative z-20">
          Experience / Chapters
        </h2>

        <div className="exp-timeline-container flex flex-col gap-32 md:gap-40 relative md:pr-24">

          <div className="absolute left-6 md:left-[45%] top-0 bottom-0 w-[1px] bg-border/30 z-0 hidden md:block" />
          <div className="exp-timeline-rail-active absolute left-6 md:left-[45%] top-0 bottom-0 w-[1px] bg-accent z-0 hidden md:block origin-top" />

          {CHAPTERS.map((chapter, i) => (
            <div key={chapter.num} className="relative group chapter-block">
              <div className="bg-num absolute -top-16 -left-8 md:-top-24 md:-left-24 text-[120px] md:text-[220px] font-display font-bold text-surface-elevated z-0 leading-none select-none transition-transform duration-700 group-hover:-translate-y-4">
                0{i + 1}
              </div>

              <div className="chap-content relative z-10 grid grid-cols-1 md:grid-cols-[45%_1fr] gap-8 md:gap-0 items-start" data-familiar-avoid>
                <div className="pt-2 md:pr-12 lg:pr-16 max-w-full md:max-w-[480px] lg:max-w-[540px]">
                  <div className="font-mono text-accent text-xs tracking-widest mb-4">
                    {chapter.num}
                  </div>
                  <h3 className="text-3xl md:text-5xl font-display font-medium text-text-primary mb-2 tracking-tight leading-none uppercase">
                    {chapter.title}
                  </h3>
                </div>

                <div className="pt-2 pl-6 border-l border-border md:border-none md:pl-16 lg:pl-20">
                  <div className="text-text-primary font-mono text-xs tracking-wider mb-4 uppercase">
                    {chapter.subtitle}
                  </div>
                  <p className="text-text-muted text-sm md:text-base leading-relaxed max-w-md">
                    {chapter.details}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};