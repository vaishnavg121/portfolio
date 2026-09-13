"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MoveRight } from "lucide-react";
import { THEME_ASSETS } from "@/lib/assets";

export const Hero = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20" 
      id="hero"
      initial={{ x: 0, y: 0 }}
      animate={{ x: shouldReduceMotion ? 0 : [0, 3, -2, 0], y: shouldReduceMotion ? 0 : [0, -2, 1, 0] }}
      transition={{ duration: 0.1, delay: shouldReduceMotion ? 0 : 0.92, ease: "linear" }}
    >
      {/* Global Grain */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: `url(${THEME_ASSETS.global.paperGrain})`, backgroundSize: "300px" }} />
      
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
            transition={{ duration: shouldReduceMotion ? 0 : 3, ease: "easeInOut", delay: shouldReduceMotion ? 0 : 1 }}
          />
          <motion.path
            d="M 10 70 Q 40 20, 60 70 T 90 30"
            fill="transparent"
            stroke="var(--text-muted)"
            strokeWidth="0.1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{ duration: shouldReduceMotion ? 0 : 4, ease: "easeInOut", delay: shouldReduceMotion ? 0 : 1.5 }}
          />
        </svg>
      </div>

      <div className="container mx-auto px-6 md:px-12 z-10 w-full h-full flex flex-col justify-center pb-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative">
          
          {/* Main Title Block */}
          <div className="md:col-span-10 md:col-start-1 relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.2 : 0.4, delay: shouldReduceMotion ? 0.1 : 0.85, ease: "easeOut" }}
              className="mb-4 md:mb-6 font-mono text-[10px] md:text-xs text-text-muted tracking-widest uppercase flex items-center gap-4"
            >
              <span>SYS_INIT</span>
              <div className="h-[1px] w-12 bg-border" />
              <span>CS + Finance @ BITS Pilani</span>
            </motion.div>

            <motion.h1
              initial={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)", opacity: 0 }}
              animate={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", opacity: 1 }}
              transition={{ duration: shouldReduceMotion ? 0.2 : 0.4, delay: shouldReduceMotion ? 0.1 : 0.88, ease: [0.11, 0, 0.5, 0] }}
              className="text-[12vw] md:text-[8vw] lg:text-[7rem] font-display font-medium tracking-tighter leading-[0.85] uppercase"
            >
              Vaishnav
              <br />
              <span className="text-text-muted">Gadamsetty</span>
            </motion.h1>
          </div>

          {/* Subtitle / Description Block */}
          <div className="md:col-span-5 md:col-start-7 lg:col-start-8 mt-12 md:mt-24 relative z-20">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.2 : 0.6, delay: shouldReduceMotion ? 0.15 : 0.91, ease: "easeOut" }}
            >
              <h2 className="text-xl md:text-2xl text-text-primary font-light leading-snug mb-6 border-l-2 border-accent pl-6">
                I build things around <br />
                <span className="italic font-serif">intelligence, markets & machines.</span>
              </h2>

              <p className="text-text-muted text-sm leading-relaxed pl-6 mb-10 max-w-sm">
                I&apos;m interested in AI/ML, finance, RAG & agentic systems, C++, and robotics. 
                Most of my projects begin with something I want to understand and evolve into systems I can experiment with and use.
              </p>

              {/* Links */}
              <div className="flex flex-wrap items-center gap-6 text-xs font-mono tracking-widest uppercase pl-6">
                <button 
                  onClick={() => document.getElementById("work")?.scrollIntoView({ behavior: "smooth" })}
                  className="flex items-center gap-2 text-text-primary hover:text-accent transition-colors group"
                  data-cursor="VIEW"
                >
                  Explore Work 
                  <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <a href="https://github.com/vaishnav" target="_blank" rel="noreferrer" className="text-text-muted hover:text-text-primary transition-colors" data-cursor="VIEW">GitHub</a>
              </div>
            </motion.div>
            
            {/* Hand-written style annotation */}
            <div className="absolute -top-16 -right-4 md:-right-24 opacity-80 rotate-[8deg]">
              <motion.span 
                initial={{ opacity: 0, pathLength: 0 }}
                animate={{ opacity: 1, pathLength: 1 }}
                transition={{ delay: shouldReduceMotion ? 0.2 : 1.1, duration: shouldReduceMotion ? 0.2 : 0.6 }}
                className="text-accent text-xl md:text-2xl font-hand"
              >
                {`// curiosity usually gets out of hand`}
              </motion.span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

