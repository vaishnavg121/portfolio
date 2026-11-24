"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useTransform } from "framer-motion";
import { MoveRight } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { profile, socials } from "@/lib/profile";
import { usePointer, MagneticEffect } from "@/components/effects";
import { THEME_ASSETS } from "@/lib/assets";
import { HeroBackground } from "@/components/HeroBackground";
import { HeroCards } from "./HeroCards";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const entranceEase = [0.22, 1, 0.36, 1] as const;

export const Hero = () => {
  const containerRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { sNX, sNY } = usePointer();
  const bgX = useTransform(sNX, [-1, 1], [-13, 13]);
  const bgY = useTransform(sNY, [-1, 1], [-9, 9]);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(pointer: fine) and (min-width: 64rem) and (prefers-reduced-motion: no-preference)", () => {
      gsap.to("[data-hero-atmosphere]", {
        y: 58,
        opacity: 0.35,
        ease: "none",
        scrollTrigger: { trigger: containerRef.current, start: "top top", end: "bottom top", scrub: 0.65 },
      });
    }, containerRef);
    return () => media.revert();
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="hero-composition relative isolate overflow-hidden" id="hero">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none opacity-[0.08] mix-blend-overlay" style={{ backgroundImage: `url(${THEME_ASSETS.global.paperGrain})`, backgroundSize: "300px" }} />
      <HeroBackground bgX={bgX} bgY={bgY} shouldReduceMotion={reduceMotion} />

      <div className="portfolio-frame hero-frame relative z-10">
        <div className="hero-title-block min-w-0" data-familiar-avoid>
          <motion.div
            initial={reduceMotion ? false : { opacity: 0.65, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.4, ease: entranceEase }}
            className="hero-signature mb-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-text-muted sm:mb-6 sm:text-xs"
          >
            <span>{profile.positioning}</span>
          </motion.div>
          <h1 className="hero-name font-display font-medium uppercase">
            <span><motion.span
              initial={reduceMotion ? false : { y: "20%", opacity: 0.72 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.64, ease: entranceEase }}
            >{profile.shortName}</motion.span></span>
            <span><motion.span
              className="hero-surname"
              initial={reduceMotion ? false : { y: "24%", opacity: 0.7 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.72, delay: reduceMotion ? 0 : 0.08, ease: entranceEase }}
            >{profile.name.split(" ")[2]}</motion.span></span>
          </h1>
        </div>

        <div className="hero-lower">
          <motion.div
            className="hero-subtitle-block min-w-0"
            initial={reduceMotion ? false : { opacity: 0.78, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.58, delay: reduceMotion ? 0 : 0.14, ease: entranceEase }}
            data-familiar-avoid
          >
            <h2 className="hero-positioning text-lg leading-snug text-text-primary sm:text-xl lg:text-2xl">
              Hi, I’m Vaishnav.
            </h2>
            <p className="hero-introduction whitespace-pre-line text-[0.9375rem] leading-relaxed text-text-muted">{profile.about}</p>

            <div className="hero-links flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono tracking-wide uppercase">
              <MagneticEffect intensity={0.24}>
                <button type="button" onClick={() => document.getElementById("work")?.scrollIntoView({ behavior: reduceMotion ? "instant" : "smooth" })}
                  className="portfolio-control group flex min-h-11 items-center gap-2 px-3.5" data-cursor="VIEW">
                  View projects <MoveRight className="size-4 text-accent transition-transform group-hover:translate-x-1" />
                </button>
              </MagneticEffect>
              <a href={socials.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile" className="inline-flex min-h-11 items-center text-text-muted transition-colors hover:text-text-primary" data-cursor="VIEW">GitHub ↗</a>
              <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" data-familiar-reaction="wave" aria-label="LinkedIn Profile" className="inline-flex min-h-11 items-center text-text-muted transition-colors hover:text-text-primary" data-cursor="VIEW">LinkedIn ↗</a>
            </div>
          </motion.div>

          <div className="hero-card-grid min-w-0" data-familiar-avoid>
            <HeroCards />
          </div>
        </div>
      </div>
    </section>
  );
};
