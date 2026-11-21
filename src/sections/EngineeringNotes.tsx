"use client";

import { motion } from "framer-motion";
import { InkReveal, PaperNoise } from "@/components/effects";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef, useState, useEffect } from "react";
import { useSectionVisibility } from "@/lib/visibility";

const RULES = [
  {
    num: "RULE 01",
    text: "Never trust an unvalidated model output."
  },
  {
    num: "RULE 02",
    text: "If the evidence doesn't exist, don't invent it."
  },
  {
    num: "RULE 03",
    text: "Fail closed when the cost of being wrong is high."
  }
];

export const EngineeringNotes = () => {
  const containerRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const { ref: visibilityRef, isVisible } = useSectionVisibility("300px");
  useEffect(() => {
    setMounted(true);
  }, []);
  useGSAP(() => {
    if (!mounted || !isVisible || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo('.notes-bg-text',
        { x: -100, opacity: 0 },
        { x: 50, opacity: 0.03, ease: "none", scrollTrigger: { trigger: containerRef.current, start: "top bottom", end: "bottom top", scrub: 1 } }
      );

      gsap.fromTo('.notes-divider-rail',
        { scaleY: 0 },
        { scaleY: 1, duration: 1.5, ease: "power2.out", scrollTrigger: { trigger: containerRef.current, start: "top 70%" } }
      );

      const rules = gsap.utils.toArray('.rule-item') as HTMLElement[];
      gsap.fromTo(rules,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, stagger: 0.2, duration: 0.8, ease: "power2.out", scrollTrigger: { trigger: containerRef.current, start: "top 60%" } }
      );

      const lines = gsap.utils.toArray('.rule-underline') as HTMLElement[];
      gsap.fromTo(lines,
        { width: 0 },
        { width: "100%", stagger: 0.2, delay: 0.4, duration: 0.6, ease: "power3.out", scrollTrigger: { trigger: containerRef.current, start: "top 60%" } }
      );

      gsap.to('.rule-item:not(:last-child)', {
        opacity: 0.2,
        scrollTrigger: { trigger: containerRef.current, start: "bottom 80%", end: "bottom 50%", scrub: true }
      });
    }, containerRef);

    return () => ctx.revert();
  }, { scope: containerRef, dependencies: [mounted, isVisible] });

  return (
    <section id="notes" className="py-16 lg:py-32 bg-background relative flex justify-center overflow-hidden" ref={(el) => { containerRef.current = el; visibilityRef(el); }}>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at center, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="notes-bg-text absolute top-20 left-0 text-[12vw] font-display font-bold text-white whitespace-nowrap opacity-0 pointer-events-none select-none z-0">
        NOTES // OBSERVATIONS
      </div>

      <div className="notes-divider-rail absolute top-0 bottom-0 left-6 md:left-[15%] w-[1px] bg-border origin-top z-0" />

      <InkReveal>
        <motion.div
          initial={{ opacity: 0, rotate: -2, y: 50 }}
          whileInView={{ opacity: 1, rotate: 0, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="w-[calc(100%-2.5rem)] lg:w-[90%] max-w-2xl bg-[#0a0a0a] border border-[#333] shadow-2xl relative px-5 py-8 lg:p-16 overflow-hidden"
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
                  className="rule-item relative group cursor-default opacity-0 motion-reduce:opacity-100"
                  onMouseEnter={(e) => {
                    window.dispatchEvent(new CustomEvent("companionInteract", {
                      detail: { type: "anchor-hover", target: e.currentTarget }
                    }));
                  }}
                >
                  <div className="text-accent font-mono text-xs tracking-widest mb-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    {rule.num}
                  </div>
                  <div className="text-lg md:text-2xl text-text-muted font-light leading-relaxed font-hand relative inline-block">
                    {rule.text}
                    <span className="rule-underline absolute -bottom-1 left-0 w-0 h-[1px] bg-accent/40 transition-all duration-500 ease-out" />
                  </div>
                  <div className="absolute -left-12 top-2 text-[#222] font-mono text-sm opacity-50 hidden md:block">
                    {(idx * 13).toString().padStart(3, '0')}
                  </div>
                  <div data-familiar-anchor className="absolute -right-16 top-1/2 w-4 h-4 pointer-events-none" />
                </div>
              ))}
            </div>

            <div className="mt-9 pt-5 lg:mt-16 lg:pt-8 border-t border-[#333] flex justify-between items-center opacity-40">
              <div className="font-mono text-xs">CLASSIFIED / PERSONAL</div>
              <div className="font-mono text-xs text-accent">VG-121</div>
            </div>
          </div>
        </motion.div>
      </InkReveal>
    </section>
  );
};