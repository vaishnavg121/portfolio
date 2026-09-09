"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const CHAPTERS = [
  {
    num: "CH.01",
    title: "BITS PILANI HYDERABAD",
    subtitle: "Computer Science + Finance",
    details: "Focusing on algorithmic thinking, data structures, and financial engineering."
  },
  {
    num: "CH.02",
    title: "THRIVEFORCE",
    subtitle: "Combat Robotics",
    details: "Designing and engineering high-impact combat robots with rigorous physical constraints."
  },
  {
    num: "CH.03",
    title: "IMD PUNE",
    subtitle: "Machine Learning / Weather",
    details: "Applying predictive modeling to meteorological datasets."
  },
  {
    num: "CH.04",
    title: "BHARATIYA ANTARIKSH HACKATHON",
    subtitle: "Space / Geospatial",
    details: "Developing geospatial data processing pipelines."
  },
  {
    num: "CH.05",
    title: "WHAT'S NEXT?",
    subtitle: "Building the future.",
    details: "Always exploring new frontiers in AI, markets, and intelligent systems."
  }
];

export const ExperienceTimeline = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 0.8], ["0%", "100%"]);

  return (
    <section className="py-32 bg-surface" id="about" ref={containerRef}>
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        <h2 className="text-sm font-mono text-text-muted mb-24 tracking-widest uppercase border-b border-border pb-4">
          Experience / Timeline
        </h2>

        <div className="relative pl-8 md:pl-0">
          {/* Timeline Line */}
          <div className="absolute left-[15px] md:left-1/2 top-0 bottom-0 w-[1px] bg-border transform md:-translate-x-1/2">
            <motion.div 
              className="w-full bg-accent origin-top"
              style={{ height: lineHeight }}
            />
          </div>

          <div className="flex flex-col gap-24">
            {CHAPTERS.map((chapter, i) => {
              const isEven = i % 2 === 0;
              return (
                <div key={chapter.num} className={`relative flex flex-col md:flex-row items-start ${isEven ? 'md:flex-row-reverse' : ''}`}>
                  
                  {/* Timeline Dot */}
                  <div className="absolute left-[-17px] md:left-1/2 w-8 h-8 bg-surface border border-accent rounded-full transform md:-translate-x-1/2 flex items-center justify-center z-10 mt-2">
                    <div className="w-2 h-2 bg-accent rounded-full" />
                  </div>

                  <div className={`w-full md:w-1/2 ${isEven ? 'md:pl-16' : 'md:pr-16 text-left md:text-right'} pl-12 md:pl-0`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                      <div className="font-mono text-text-muted text-sm tracking-widest mb-4">
                        {chapter.num}
                      </div>
                      <h3 className="text-3xl md:text-4xl font-display font-medium text-text-primary mb-2 uppercase tracking-tight">
                        {chapter.title}
                      </h3>
                      <div className="text-accent font-mono text-xs uppercase tracking-wider mb-6">
                        {chapter.subtitle}
                      </div>
                      <p className="text-text-muted text-sm md:text-base leading-relaxed">
                        {chapter.details}
                      </p>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
