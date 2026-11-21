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

    const media = gsap.matchMedia();
    media.add("(min-width: 64rem)", () => {
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
    });

    return () => media.revert();
  }, { scope: containerRef, dependencies: [mounted, shouldReduceMotion] });

  return (
    <motion.section
      ref={(el) => { containerRef.current = el; visibilityRef(el); }}
      className="relative flex items-center justify-center overflow-hidden pt-14 pb-14 lg:min-h-[100svh] lg:pt-16 lg:pb-0"
      id="hero"
      initial={{ x: 0, y: 0 }}
      animate={{ x: (!mounted || shouldReduceMotion) ? 0 : [0, 3, -2, 0], y: (!mounted || shouldReduceMotion) ? 0 : [0, -2, 1, 0] }}
      transition={{ duration: 0.1, delay: (!mounted || shouldReduceMotion) ? 0 : 0.92, ease: "linear" }}
    >
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: `url(${THEME_ASSETS.global.paperGrain})`, backgroundSize: "300px" }} />

      <HeroBackground bgX={bgX} bgY={bgY} mounted={mounted} shouldReduceMotion={shouldReduceMotion} />

      <div className="container mx-auto px-5 sm:px-8 lg:px-12 z-10 w-full h-full flex flex-col justify-center lg:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-6 relative">

          <motion.div
            className="hero-title-block min-w-0 lg:col-span-10 lg:col-start-1 relative z-10"
            style={{ x: shouldReduceMotion ? 0 : titleX, y: shouldReduceMotion ? 0 : titleY }}
            data-familiar-avoid
          >
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.2 : 0.4, delay: shouldReduceMotion ? 0.1 : 0.85, ease: "easeOut" }}
              className="mb-5 lg:mb-6 font-mono text-[11px] lg:text-xs text-text-muted tracking-widest uppercase flex items-center gap-3 lg:gap-4"
            >
              <span>SYS_INIT</span>
              <div className="h-[1px] w-5 lg:w-12 shrink-0 bg-border" />
              <span>{profile.positioning.split(" interested in ")[0]}</span>
            </motion.div>

            <motion.h1
              initial={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)", opacity: 0 }}
              animate={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", opacity: 1 }}
              transition={{ duration: shouldReduceMotion ? 0.2 : 0.4, delay: shouldReduceMotion ? 0.1 : 0.88, ease: [0.11, 0, 0.5, 0] }}
              className="text-[clamp(2.25rem,11.5vw,5.5rem)] lg:text-[7rem] font-display font-medium tracking-tighter leading-[0.92] lg:leading-[0.85] uppercase max-lg:[overflow-wrap:anywhere]"
            >
              {profile.shortName}
              <br />
              <span className="text-text-muted">{profile.name.split(" ")[2]}</span>
            </motion.h1>
            <HeroCards />
            <div data-familiar-anchor className="absolute -bottom-16 left-[75%] w-4 h-4 pointer-events-none" />
          </motion.div>

          <motion.div
            className="hero-subtitle-block min-w-0 lg:col-span-5 lg:col-start-8 lg:-mt-[24rem] relative z-30"
            style={{ x: shouldReduceMotion ? 0 : subtitleX, y: shouldReduceMotion ? 0 : subtitleY }}
            data-familiar-avoid
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.2 : 0.6, delay: shouldReduceMotion ? 0.15 : 0.91, ease: "easeOut" }}
            >
              <h2 className="text-lg sm:text-xl text-text-primary font-light leading-snug mb-3 border-l-2 border-accent pl-4 lg:pl-5">
                Building at the intersection of <br />
                <span className="italic font-serif">INTELLIGENCE, MARKETS & MACHINES.</span>
              </h2>

              <p className="text-text-muted text-base lg:text-sm leading-relaxed pl-4 lg:pl-5 mb-3 lg:mb-6 max-w-xl lg:max-w-sm whitespace-pre-line">
                {profile.about}
              </p>

              <div className="hero-links flex flex-wrap items-center gap-x-4 gap-y-1 lg:gap-4 text-xs font-mono tracking-widest uppercase pl-4 lg:pl-5 relative z-30">
                <MagneticEffect intensity={0.4}>
                  <button
                    onClick={() => document.getElementById("work")?.scrollIntoView({ behavior: shouldReduceMotion ? "instant" : "smooth" })}
                    className="flex min-h-11 lg:min-h-0 items-center gap-2 text-text-primary hover:text-accent transition-colors group"
                    data-cursor="VIEW"
                  >
                    Explore Work
                    <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </MagneticEffect>
                <MagneticEffect intensity={0.2}>
                  <a href={socials.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile" className="min-h-11 max-lg:inline-flex items-center lg:min-h-0 text-text-muted hover:text-text-primary transition-colors" data-cursor="VIEW">GitHub ↗</a>
                </MagneticEffect>
                <MagneticEffect intensity={0.2}>
                  <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" data-familiar-reaction="wave" aria-label="LinkedIn Profile" className="min-h-11 max-lg:inline-flex items-center lg:min-h-0 text-text-muted hover:text-text-primary transition-colors" data-cursor="VIEW">LinkedIn ↗</a>
                </MagneticEffect>
              </div>
            </motion.div>

            <div className="hero-annotation mt-6 pl-4 lg:mt-0 lg:pl-0 lg:absolute lg:-top-16 lg:-right-24 opacity-80 lg:rotate-[8deg]">
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
