"use client";

import { MoveRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { ReactivePortrait } from "@/components/portrait/ReactivePortrait";
import { profile, socials } from "@/lib/profile";
import { HeroCards } from "./HeroCards";

export const Hero = () => {
  const reduce = useReducedMotion();

  return (
    <section className="hero-composition relative" id="hero">
      <div className="portfolio-frame hero-frame">
        <div className="hero-editorial">
          <h1 className="hero-name" data-familiar-protect>
            <span>Vaishnav</span> <span>Gadamsetty</span>
          </h1>
          <ReactivePortrait />
          <div className="hero-subtitle-block" data-familiar-protect>
            <p className="hero-introduction text-text-muted">{profile.about}</p>
            <div className="hero-links flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <a href="#work" className="portfolio-control group inline-flex min-h-11 items-center gap-2 px-3.5"
                onClick={(event) => {
                  if (reduce || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  const work = document.getElementById("work");
                  if (!work) return;
                  event.preventDefault();
                  work.scrollIntoView({ behavior: "smooth" });
                  window.history.replaceState(null, "", "#work");
                }}>
                View projects <MoveRight className="size-4 text-accent transition-transform group-hover:translate-x-1" />
              </a>
              <a href={socials.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile"
                className="inline-flex min-h-11 items-center text-text-muted transition-colors hover:text-text-primary">GitHub ↗</a>
              <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" data-familiar-reaction="wave" aria-label="LinkedIn Profile"
                className="inline-flex min-h-11 items-center text-text-muted transition-colors hover:text-text-primary">LinkedIn ↗</a>
            </div>
          </div>
        </div>
        <div className="hero-card-grid" data-familiar-avoid>
          <HeroCards />
        </div>
      </div>
    </section>
  );
};
