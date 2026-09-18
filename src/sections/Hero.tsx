"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useReducedMotion, useTransform } from "framer-motion";
import { MoveRight } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { profile, socials } from "@/lib/profile";
import { usePointer, MagneticEffect } from "@/components/effects";
import { useSectionVisibility } from "@/lib/visibility";
import { THEME_ASSETS } from "@/lib/assets";
import { HeroBackground } from "@/components/HeroBackground";
import { HeroCards } from "./HeroCards";

export const Hero = () => {
  const containerRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { sNX, sNY } = usePointer();
  const [mounted, setMounted] = useState(false);
  const { ref: visibilityRef } = useSectionVisibility("200px");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const titleX = useTransform(sNX, [-1, 1], [-10, 10]);
  const titleY = useTransform(sNY, [-1, 1], [-10, 10]);

  const subtitleX = useTransform(sNX, [-1, 1], [-4, 4]);
  const subtitleY = useTransform(sNY, [-1, 1], [-4, 4]);

  const bgX = useTransform(sNX, [-1, 1], [-15, 15]);
  const bgY = useTransform(sNY, [-1, 1], [-15, 15]);

  useGSAP(() => {
    if (shouldReduceMotion) return;

    const ctx = gsap.context(() => {
      gsap.to('.hero-title-block', {
        y: -150,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
        }
      });

      gsap.to('.hero-subtitle-block', {
        y: -80,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        }
      });

      gsap.to('.hero-annotation', {
        y: -250,
        x: 50,
        rotate: 15,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        }
      });

      gsap.to('.hero-links', {
        opacity: 0,
        y: -20,
        pointerEvents: "none",
        ease: "power2.in",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom 70%",
          scrub: true,
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, { scope: containerRef, dependencies: [mounted, shouldReduceMotion] });

  return (
    <motion.section
      ref={(el) => { containerRef.current = el; visibilityRef(el); }}
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-12 md:pt-16"
      id="hero"
      initial={{ x: 0, y: 0 }}
      animate={{ x: (!mounted || shouldReduceMotion) ? 0 : [0, 3, -2, 0], y: (!mounted || shouldReduceMotion) ? 0 : [0, -2, 1, 0] }}
      transition={{ duration: 0.1, delay: (!mounted || shouldReduceMotion) ? 0 : 0.92, ease: "linear" }}
    >
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: `url(${THEME_ASSETS.global.paperGrain})`, backgroundSize: "300px" }} />

      <HeroBackground bgX={bgX} bgY={bgY} mounted={mounted} shouldReduceMotion={shouldReduceMotion} />

      <div className="container mx-auto px-6 md:px-12 z-10 w-full h-full flex flex-col justify-center pb-8 md:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative">

          <motion.div
            className="hero-title-block md:col-span-10 md:col-start-1 relative z-10"
            style={{ x: shouldReduceMotion ? 0 : titleX, y: shouldReduceMotion ? 0 : titleY }}
            data-familiar-avoid
          >
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.2 : 0.4, delay: shouldReduceMotion ? 0.1 : 0.85, ease: "easeOut" }}
              className="mb-4 md:mb-6 font-mono text-[10px] md:text-xs text-text-muted tracking-widest uppercase flex items-center gap-4"
            >
              <span>SYS_INIT</span>
              <div className="h-[1px] w-12 bg-border" />
              <span>{profile.positioning.split(" interested in ")[0]}</span>
            </motion.div>

            <motion.h1
              initial={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)", opacity: 0 }}
              animate={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", opacity: 1 }}
              transition={{ duration: shouldReduceMotion ? 0.2 : 0.4, delay: shouldReduceMotion ? 0.1 : 0.88, ease: [0.11, 0, 0.5, 0] }}
              className="text-[12vw] md:text-[8vw] lg:text-[7rem] font-display font-medium tracking-tighter leading-[0.85] uppercase"
            >
              {profile.shortName}
              <br />
              <span className="text-text-muted">{profile.name.split(" ")[2]}</span>
            </motion.h1>
            <HeroCards />
            <div data-familiar-anchor className="absolute -bottom-16 left-[75%] w-4 h-4 pointer-events-none" />
          </motion.div>

          <motion.div
            className="hero-subtitle-block md:col-span-5 md:col-start-7 lg:col-start-8 mt-4 md:-mt-[24rem] relative z-30"
            style={{ x: shouldReduceMotion ? 0 : subtitleX, y: shouldReduceMotion ? 0 : subtitleY }}
            data-familiar-avoid
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.2 : 0.6, delay: shouldReduceMotion ? 0.15 : 0.91, ease: "easeOut" }}
            >
              <h2 className="text-lg md:text-xl text-text-primary font-light leading-snug mb-3 border-l-2 border-accent pl-5">
                Building at the intersection of <br />
                <span className="italic font-serif">INTELLIGENCE, MARKETS & MACHINES.</span>
              </h2>

              <p className="text-text-muted text-xs md:text-sm leading-relaxed pl-5 mb-6 max-w-sm whitespace-pre-line">
                {profile.about}
              </p>

              <div className="hero-links flex flex-wrap items-center gap-4 text-[10px] md:text-xs font-mono tracking-widest uppercase pl-5 relative z-30">
                <MagneticEffect intensity={0.4}>
                  <button
                    onClick={() => document.getElementById("work")?.scrollIntoView({ behavior: "smooth" })}
                    className="flex items-center gap-2 text-text-primary hover:text-accent transition-colors group"
                    data-cursor="VIEW"
                  >
                    Explore Work
                    <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </MagneticEffect>
                <MagneticEffect intensity={0.2}>
                  <a href={socials.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile" className="text-text-muted hover:text-text-primary transition-colors" data-cursor="VIEW">GitHub ↗</a>
                </MagneticEffect>
                <MagneticEffect intensity={0.2}>
                  <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile" className="text-text-muted hover:text-text-primary transition-colors" data-cursor="VIEW">LinkedIn ↗</a>
                </MagneticEffect>
              </div>
            </motion.div>

            <div className="hero-annotation absolute -top-16 -right-4 md:-right-24 opacity-80 rotate-[8deg]">
              <motion.span
                initial={{ opacity: 0, pathLength: 0 }}
                animate={{ opacity: 1, pathLength: 1 }}
                transition={{ delay: shouldReduceMotion ? 0.2 : 1.1, duration: shouldReduceMotion ? 0.2 : 0.6 }}
                className="text-accent text-xl md:text-2xl font-hand inline-block"
              >
                {`// curiosity usually gets out of hand`}
              </motion.span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};