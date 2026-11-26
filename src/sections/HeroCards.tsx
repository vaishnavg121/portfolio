"use client";

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from 'framer-motion';

// --- CUSTOM SYMBOLS (25-38% of card area, animated via CSS) ---

const IconWork = () => (
  <svg viewBox="0 0 48 48" className="w-24 h-24 md:w-32 md:h-32 stroke-[1.5] transition-all duration-500">
    <g className="text-[#e8e4dc]/40 group-hover:text-[#e8e4dc]/90 transition-colors duration-500">
      {/* Grid background */}
      <path d="M 12 12 L 36 12 M 12 24 L 36 24 M 12 36 L 36 36 M 12 12 L 12 36 M 24 12 L 24 36 M 36 12 L 36 36" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3" className="opacity-30" />
      {/* Background Frame */}
      <rect x="10" y="14" width="22" height="16" fill="none" stroke="currentColor" className="group-hover:-translate-x-1.5 group-hover:-translate-y-1.5 transition-transform duration-500" />
      {/* Foreground Frame */}
      <rect x="16" y="18" width="22" height="16" fill="none" stroke="currentColor" className="group-hover:translate-x-1.5 group-hover:translate-y-1.5 transition-transform duration-500" />
      {/* Internal Rule */}
      <line x1="20" y1="26" x2="34" y2="26" stroke="currentColor" strokeDasharray="2 2" className="group-hover:translate-x-1.5 group-hover:translate-y-1.5 transition-transform duration-500" />
    </g>
    {/* Crimson Corner Marker */}
    <path d="M 38 18 L 40 18 L 40 20" fill="none" stroke="var(--accent)" strokeWidth="2" className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1.5 group-hover:translate-y-1.5 transition-all duration-500" />
    {/* Tiny Crimson Square */}
    <rect x="14" y="32" width="2" height="2" fill="var(--accent)" className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />
  </svg>
);

const IconKnowledge = () => (
  <svg viewBox="0 0 48 48" className="w-24 h-24 md:w-32 md:h-32 stroke-[1.5] transition-all duration-500">
    <g className="text-[#e8e4dc]/40 group-hover:text-[#e8e4dc]/90 transition-colors duration-500">
      {/* Graph network */}
      <circle cx="24" cy="24" r="16" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" className="opacity-50 group-hover:scale-105 origin-center transition-transform duration-700" />
      {/* Topographic curves */}
      <path d="M 6 36 Q 16 28 26 36 T 46 28" fill="none" stroke="currentColor" />
      <path d="M 4 28 Q 18 16 30 28 T 48 16" fill="none" stroke="currentColor" strokeDasharray="4 2" />
      {/* Nodes */}
      <circle cx="16" cy="24" r="2" fill="currentColor" />
      <circle cx="34" cy="18" r="2" fill="currentColor" />
      <circle cx="26" cy="36" r="2" fill="currentColor" />
      <circle cx="38" cy="30" r="1.5" fill="currentColor" />
      {/* Connecting lines */}
      <line x1="16" y1="24" x2="26" y2="36" stroke="currentColor" strokeWidth="0.5" />
      <line x1="34" y1="18" x2="38" y2="30" stroke="currentColor" strokeWidth="0.5" />
    </g>
    {/* Highlighted route (crimson) */}
    <path d="M 16 24 L 34 18" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="30" strokeDashoffset="30" className="opacity-0 group-hover:opacity-100 group-hover:[stroke-dashoffset:0] transition-all duration-[500ms]" />
    <circle cx="34" cy="18" r="3" fill="none" stroke="var(--accent)" className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200" />
  </svg>
);

const IconThriveForce = () => (
  <svg viewBox="0 0 48 48" className="w-24 h-24 md:w-32 md:h-32 stroke-[1.5] transition-all duration-500">
    <g className="text-[#e8e4dc]/40 group-hover:text-[#e8e4dc]/90 transition-colors duration-500 origin-center group-hover:rotate-45">
      {/* Mechanical Axis / Hub */}
      <circle cx="24" cy="24" r="8" fill="none" stroke="currentColor" />
      <circle cx="24" cy="24" r="4" fill="none" stroke="currentColor" strokeDasharray="1 2" />
      <circle cx="24" cy="24" r="2" fill="currentColor" />
      {/* Weapon Arc */}
      <path d="M 10 24 A 14 14 0 0 1 38 24" fill="none" stroke="currentColor" strokeDasharray="4 4" />
      {/* Crosshairs */}
      <line x1="24" y1="4" x2="24" y2="16" stroke="currentColor" />
      <line x1="24" y1="32" x2="24" y2="44" stroke="currentColor" />
      <line x1="4" y1="24" x2="16" y2="24" stroke="currentColor" />
      <line x1="32" y1="24" x2="44" y2="24" stroke="currentColor" />
    </g>
    {/* Impact Slash (crimson) */}
    <line x1="20" y1="20" x2="20" y2="20" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" className="opacity-0 group-hover:opacity-100 group-hover:[x2:8] group-hover:[y2:8] transition-all duration-[300ms]" />
    <circle cx="8" cy="8" r="1.5" fill="var(--accent)" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200" />
  </svg>
);

const IconContact = () => (
  <svg viewBox="0 0 48 48" className="w-24 h-24 md:w-32 md:h-32 stroke-[1.5] transition-all duration-500">
    <g className="text-[#e8e4dc]/40 group-hover:text-[#e8e4dc]/90 transition-colors duration-500">
      {/* Offset Connection Points */}
      <rect x="12" y="16" width="8" height="8" fill="none" stroke="currentColor" />
      <rect x="28" y="24" width="8" height="8" fill="none" stroke="currentColor" />
      {/* Signal rings */}
      <path d="M 8 12 A 20 20 0 0 1 36 12" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" className="group-hover:-translate-y-2 transition-transform duration-700" />
      {/* Data traces */}
      <polyline points="16,24 16,32 28,32" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
    </g>
    {/* Directional Signal Line (crimson) */}
    <line x1="20" y1="20" x2="20" y2="20" stroke="var(--accent)" strokeWidth="1.5" className="opacity-0 group-hover:opacity-100 group-hover:[x2:28] group-hover:[y2:28] transition-all duration-500" />
    {/* Terminal Pulse */}
    <circle cx="32" cy="28" r="2" fill="var(--accent)" className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200" />
    <rect x="30" y="26" width="4" height="4" fill="none" stroke="var(--accent)" className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-300 scale-150" />
  </svg>
);

const CARDS = [
  { id: 'work', title: 'WORK', subtitle: 'SELECTED PROJECTS', num: '01', Icon: IconWork },
  { id: 'knowledge', title: 'KNOWLEDGE', subtitle: 'SKILLS LANDSCAPE', num: '02', Icon: IconKnowledge },
  { id: 'robotics', title: 'THRIVEFORCE', subtitle: 'ROBOTICS STORY', num: '03', Icon: IconThriveForce },
  { id: 'contact', title: 'CONTACT', subtitle: 'LET’S CONNECT', num: '04', Icon: IconContact }
];

export const HeroCards = () => {
  const containerRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(".hero-card", { y: 7, opacity: 0.84 }, {
        y: 0, opacity: 1, delay: 0.22, duration: 0.43, stagger: 0.055,
        ease: "power3.out", clearProps: "transform,opacity",
      });
    });
    return () => media.revert();
  }, { scope: containerRef });

  return (
    <nav ref={containerRef} className="hero-deck grid w-full grid-cols-2 gap-2.5 sm:grid-cols-4" aria-label="Quick Navigation">
      {CARDS.map(card => (
        <button
          key={card.id}
          type="button"
          className="hero-card group relative flex min-w-0 flex-col justify-between overflow-hidden rounded-sm border p-3 text-left focus-visible:outline-1 focus-visible:outline-accent active:border-accent sm:p-3.5 lg:p-4"
          onClick={() => document.getElementById(card.id)?.scrollIntoView({ behavior: reduced ? "instant" : "smooth" })}
          aria-label={`Scroll to ${card.title}`}
        >
          <span className="font-mono text-[10px] tracking-widest text-accent/80">{card.num}</span>
          <div className="hero-card-symbol pointer-events-none absolute" aria-hidden="true">
            <card.Icon />
          </div>
          <div className="relative mt-auto">
            <div className="mb-1.5 h-px w-5 bg-white/20 group-hover:bg-accent/70" />
            <span className="block font-display text-xs tracking-wide text-text-primary lg:text-[0.935rem]">{card.title}</span>
            <div className="mt-1 flex items-start justify-between gap-1">
              <span className="font-mono text-[9px] leading-snug tracking-wide text-text-muted xl:text-[10px]">{card.subtitle}</span>
              <span aria-hidden="true" className="font-mono text-xs leading-none text-accent">↗</span>
            </div>
          </div>
        </button>
      ))}
    </nav>
  );
};
