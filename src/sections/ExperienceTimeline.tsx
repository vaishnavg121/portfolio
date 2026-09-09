"use client";

// No framer-motion imports needed anymore

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
  return (
    <section className="py-32 bg-background border-t border-border overflow-hidden relative" id="about">
      <div className="container mx-auto px-6 md:px-12 max-w-5xl relative z-10">
        <h2 className="text-sm font-mono text-text-muted mb-24 tracking-widest uppercase border-b border-border pb-4">
          Experience / Chapters
        </h2>

        <div className="flex flex-col gap-32 md:gap-40">
          {CHAPTERS.map((chapter, i) => (
            <div key={chapter.num} className="relative group">
              {/* Large Background Number */}
              <div className="absolute -top-16 -left-8 md:-top-24 md:-left-16 text-[120px] md:text-[200px] font-display font-bold text-surface-elevated opacity-50 z-0 leading-none select-none transition-transform duration-700 group-hover:-translate-y-4">
                0{i + 1}
              </div>
              
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                <div className="md:col-span-5 pt-2">
                  <div className="font-mono text-accent text-xs tracking-widest mb-4">
                    {chapter.num}
                  </div>
                  <h3 className="text-3xl md:text-5xl font-display font-medium text-text-primary mb-2 tracking-tight leading-none uppercase">
                    {chapter.title}
                  </h3>
                </div>
                
                <div className="md:col-span-6 md:col-start-7 border-l border-border pl-6">
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
