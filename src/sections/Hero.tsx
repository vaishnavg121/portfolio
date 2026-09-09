"use client";

import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20" id="hero">
      {/* Background Graphic */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full max-w-4xl" preserveAspectRatio="xMidYMid slice">
          <motion.path
            d="M 10 50 Q 30 10, 50 50 T 90 50"
            fill="transparent"
            stroke="var(--accent)"
            strokeWidth="0.2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ duration: 3, ease: "easeInOut", delay: 1 }}
          />
          <motion.path
            d="M 10 70 Q 40 20, 60 70 T 90 30"
            fill="transparent"
            stroke="var(--text-muted)"
            strokeWidth="0.1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{ duration: 4, ease: "easeInOut", delay: 1.5 }}
          />
        </svg>
      </div>

      <div className="container mx-auto px-6 md:px-12 z-10">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
            className="mb-6 font-mono text-xs text-text-muted tracking-widest uppercase"
          >
            CS + Finance @ BITS Pilani, Hyderabad
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4, ease: "easeOut" }}
            className="text-6xl md:text-8xl lg:text-9xl font-display font-medium tracking-tighter leading-[0.9] mb-8"
          >
            VAISHNAV<br />GADAMSETTY
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6, ease: "easeOut" }}
            className="relative"
          >
            <h2 className="text-2xl md:text-4xl text-text-primary font-light leading-tight mb-6 max-w-2xl">
              I build things around <br className="hidden md:block"/>
              <span className="italic font-serif">intelligence, markets & machines.</span>
            </h2>

            <p className="text-text-muted max-w-xl text-sm md:text-base leading-relaxed mb-12">
              I'm interested in AI/ML, finance, RAG & agentic systems, C++, and robotics. 
              Most of my projects begin with something I want to understand and evolve into systems I can experiment with and use.
            </p>

            {/* Hand-written style annotation */}
            <div className="absolute top-0 right-0 md:-right-32 lg:-right-48 hidden md:block opacity-60 rotate-6" style={{ fontFamily: "'Caveat', cursive" }}>
              <motion.span 
                initial={{ opacity: 0, pathLength: 0 }}
                animate={{ opacity: 1, pathLength: 1 }}
                transition={{ delay: 2, duration: 1 }}
                className="text-accent text-lg"
              >
                // curiosity usually gets out of hand
              </motion.span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.8, ease: "easeOut" }}
            className="flex flex-wrap items-center gap-6 text-sm font-mono tracking-wider"
          >
            <button 
              onClick={() => document.getElementById("work")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center gap-2 text-text-primary hover:text-accent transition-colors group"
              data-cursor="VIEW"
            >
              Explore Work 
              <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a href="https://github.com/vaishnav" target="_blank" rel="noreferrer" className="text-text-muted hover:text-text-primary transition-colors" data-cursor="VIEW">GitHub</a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-text-muted hover:text-text-primary transition-colors" data-cursor="VIEW">LinkedIn</a>
            <a href="/resume.pdf" target="_blank" rel="noreferrer" className="text-text-muted hover:text-text-primary transition-colors" data-cursor="VIEW">Resume</a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
