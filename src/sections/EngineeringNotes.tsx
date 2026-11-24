"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { InkReveal, PaperNoise } from "@/components/effects";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const RULES = [
  {
    num: "Weather data",
    project: "/work/imdpune",
    text: "At IMD Pune, gaps and inconsistent timestamps took as much attention as the forecast models."
  },
  {
    num: "Legal research",
    project: "/work/swaneeti",
    text: "In Swa.Neeti, I keep evidence about what happened separate from the sources that establish the law."
  },
  {
    num: "Money",
    project: "/work/spenza",
    text: "In Spenza, I store money in minor units so that splitting an expense keeps every last paisa accounted for."
  }
];

export const EngineeringNotes = () => {
  const containerRef = useRef<HTMLElement>(null);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const timing = { trigger: containerRef.current, start: "top 79%", once: true };
      gsap.from(".rule-item", {
        opacity: 0.58, y: 10, stagger: 0.13, duration: 0.56, ease: "power2.out",
        clearProps: "transform,opacity", scrollTrigger: timing,
      });
      gsap.fromTo(".rule-underline", { scaleX: 0 }, {
        scaleX: 1, stagger: 0.13, delay: 0.18, duration: 0.58, ease: "power3.out", scrollTrigger: timing,
      });
    }, containerRef);
    return () => media.revert();
  }, { scope: containerRef });

  return (
    <section id="notes" className="notes-section portfolio-chapter chapter-divider relative flex justify-center overflow-hidden" ref={containerRef}>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at center, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="notes-bg-text absolute top-20 left-0 text-[12vw] font-display font-bold text-white whitespace-nowrap opacity-0 pointer-events-none select-none z-0">
        NOTES // OBSERVATIONS
      </div>

      <div className="notes-divider-rail absolute top-0 bottom-0 left-6 md:left-[15%] w-[1px] bg-border origin-top z-0" />

      <InkReveal>
        <motion.div
          initial={{ opacity: 0.78, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.54, ease: "easeOut" }}
          className="notes-page lg:w-[90%] max-w-2xl border shadow-2xl relative mobile-card-pad lg:p-16 overflow-hidden"
          style={{
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255,255,255,0.05) inset"
          }}
        >
          <PaperNoise />

          <div className="absolute left-0 top-0 bottom-0 w-3 lg:w-8 border-r border-[#222] bg-[#050505] z-10" />

          <div
            className="absolute -top-10 -right-10 w-48 h-48 opacity-20 pointer-events-none rotate-[15deg]"
            style={{
              backgroundImage: `url('/assets/theme/global/notebook-ink-frame.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'top right',
              mixBlendMode: 'lighten'
            }}
          />

          <div className="ml-2 lg:ml-8 relative z-20" data-familiar-avoid>
            <h2 className="text-xl md:text-2xl font-serif italic text-text-primary mb-7 lg:mb-12 border-b border-[#333] pb-4 tracking-wide relative">
              Engineering Notes
              <div data-familiar-anchor className="absolute right-0 top-0 w-4 h-4 pointer-events-none" />
            </h2>

            <div className="flex flex-col gap-7 lg:gap-12">
              {RULES.map((rule, idx) => (
                <div
                  key={idx}
                  className="rule-item relative group cursor-default"
                  onMouseEnter={(e) => {
                    window.dispatchEvent(new CustomEvent("companionInteract", {
                      detail: { type: "anchor-hover", target: e.currentTarget }
                    }));
                  }}
                >
                  <div className="text-accent font-mono text-xs tracking-widest mb-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Link href={rule.project} className="inline-flex min-h-11 items-center gap-2 hover:text-text-primary">{rule.num} <span aria-hidden="true">↗</span></Link>
                  </div>
                  <div className="text-xl md:text-3xl text-text-primary font-light leading-relaxed font-hand relative inline-block">
                    {rule.text}
                    <span className="rule-underline absolute -bottom-1 left-0 w-full h-px origin-left bg-accent/35" />
                  </div>
                  <div className="absolute -left-12 top-2 text-[#222] font-mono text-sm opacity-50 hidden md:block">
                    {(idx * 13).toString().padStart(3, '0')}
                  </div>
                  <div data-familiar-anchor className="absolute -right-16 top-1/2 w-4 h-4 pointer-events-none" />
                </div>
              ))}
            </div>

            <div className="mt-9 pt-5 lg:mt-16 lg:pt-8 border-t border-[#333] flex justify-between items-center opacity-40">
              <div className="font-mono text-xs">Notes from the projects</div>
            </div>
          </div>
        </motion.div>
      </InkReveal>
    </section>
  );
};
