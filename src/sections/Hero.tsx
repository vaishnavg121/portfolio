"use client";

import { motion, useReducedMotion, useTransform } from "framer-motion";
import type { ReactNode } from "react";
import { ArrowUpRight, MoveRight } from "lucide-react";
import Link from "next/link";
import { profile, socials } from "@/lib/profile";
import { usePointer, MagneticEffect } from "@/components/effects";
import { HeroBackground } from "@/components/HeroBackground";
import { DotPortrait } from "@/components/portrait/DotPortrait";
import { HeroCards } from "./HeroCards";
import { GithubActivity } from "./GithubActivity";
import { Interwoven } from "./interwoven/Interwoven";

const ease = [0.22, 1, 0.36, 1] as const;

export const Hero = ({ researchStudio }: { researchStudio?: ReactNode }) => {
  const reduced = useReducedMotion();
  const pointer = usePointer();
  const bgX = useTransform(pointer.sNX, [-1, 1], [-10, 10]);
  const bgY = useTransform(pointer.sNY, [-1, 1], [-7, 7]);

  return (
    <section className="hero-composition relative isolate overflow-hidden" id="hero">
      <HeroBackground bgX={bgX} bgY={bgY} reduced={reduced} />

      <div className="portfolio-frame hero-frame relative z-10">
        <div className="hero-title-block min-w-0">
          <p className="hero-signature font-mono uppercase text-text-muted">
            <span aria-hidden="true" />
            {profile.positioning.split(" interested in ")[0]}
          </p>
          <h1 className="hero-name font-display font-medium uppercase">
            <span><motion.span
              initial={reduced ? false : { y: 8, opacity: 0.82 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: reduced ? 0 : 0.48, ease }}
            >{profile.shortName}</motion.span></span>
            <span><motion.span
              className="hero-surname"
              initial={reduced ? false : { y: 9, opacity: 0.82 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: reduced ? 0 : 0.52, delay: reduced ? 0 : 0.04, ease }}
            >{profile.name.split(" ")[2]}</motion.span></span>
          </h1>
        </div>

        <div className="hero-portrait-stage">
          <DotPortrait />
        </div>

        <motion.div
          className="hero-subtitle-block min-w-0"
          initial={reduced ? false : { opacity: 0.86, y: 7 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.46, delay: reduced ? 0 : 0.12, ease }}
        >
          <h2 className="hero-positioning text-lg leading-snug text-text-primary lg:text-2xl">
            Building at the intersection of <br />
            <span className="italic font-serif">INTELLIGENCE, MARKETS & MACHINES.</span>
          </h2>
          <div className="hero-introduction text-[0.9375rem] text-text-muted">
            {profile.about.split(/\n\s*\n/).map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          </div>

          <div className="hero-actions">
            <div className="hero-links flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs uppercase tracking-wide">
              <MagneticEffect intensity={0.08}>
                <Link href="#work" className="portfolio-text-link font-medium text-text-primary" data-cursor="VIEW">
                  <span className="portfolio-link-label">Explore Work</span>
                  <MoveRight className="portfolio-link-arrow" aria-hidden="true" />
                </Link>
              </MagneticEffect>
              <a href={socials.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile" className="portfolio-text-link text-text-muted" data-cursor="VIEW">
                <span className="portfolio-link-label">GitHub</span><ArrowUpRight className="portfolio-link-arrow" aria-hidden="true" />
              </a>
              <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" data-familiar-reaction="wave" aria-label="LinkedIn Profile" className="portfolio-text-link text-text-muted" data-cursor="VIEW">
                <span className="portfolio-link-label">LinkedIn</span><ArrowUpRight className="portfolio-link-arrow" aria-hidden="true" />
              </a>
            </div>
            <p className="hero-annotation font-hand text-xl text-accent md:text-2xl">{"// curiosity usually gets out of hand"}</p>
          </div>
          <GithubActivity />
        </motion.div>

        {researchStudio ?? <Interwoven />}

        <div className="hero-deck-stage">
          <HeroCards />
        </div>
      </div>
    </section>
  );
};
