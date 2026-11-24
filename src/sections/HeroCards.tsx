"use client";

import React, { useRef } from 'react';
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

const desktopPositions = [
  { y: 20, rotate: -2 },
  { y: 3, rotate: 1 },
  { y: 23, rotate: -1 },
  { y: 10, rotate: 2 },
];

export const HeroCards = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useGSAP(() => {
    if (shouldReduceMotion) return;
    
    const cards = gsap.utils.toArray('.hero-card') as HTMLElement[];
    if (!cards.length) return;

    const mm = gsap.matchMedia();

    mm.add("(width < 64rem)", () => {
      gsap.from(cards, { y: 12, opacity: 0.6, duration: 0.42, stagger: 0.055, ease: "power2.out", clearProps: "transform,opacity" });
    }, containerRef);

    mm.add(
      "(min-width: 64rem)",
      () => {

        gsap.set(cards, { opacity: 0.6 });
        cards.forEach((card, i) => {
          gsap.to(card, {
            opacity: 1,
            x: 0,
            y: desktopPositions[i].y,
            rotate: desktopPositions[i].rotate,
            duration: 0.72,
            delay: 0.16 + i * 0.075,
            ease: "power3.out",
            overwrite: "auto",
          });
        });

        const container = containerRef.current;
        if (!container) return;

        // Container enter/leave handlers
        const onContainerEnter = () => {
          cards.forEach((c, i) => {
            gsap.to(c, {
              x: i * 3,
              y: desktopPositions[i].y + (i % 2 === 0 ? -5 : 5),
              rotate: desktopPositions[i].rotate * 0.5,
              duration: 0.6,
              ease: "power2.out"
            });
          });
        };

        const onContainerLeave = () => {
          cards.forEach((c, i) => {
            gsap.to(c, {
              x: 0,
              y: desktopPositions[i].y,
              rotate: desktopPositions[i].rotate,
              scale: 1,
              zIndex: CARDS.length - i,
              borderColor: "var(--border)",
              duration: 0.6,
              ease: "power2.out"
            });
            
            const arrow = c.querySelector('.card-arrow');
            if (arrow) gsap.to(arrow, { opacity: 0.7, x: 0, duration: 0.2 });
            
            const highlight = c.querySelector('.card-highlight');
            if (highlight) gsap.to(highlight, { opacity: 0, duration: 0.3 });
          });
        };

        container.addEventListener('mouseenter', onContainerEnter);
        container.addEventListener('mouseleave', onContainerLeave);

        // Individual card handlers
        const cardHandlers = cards.map((card, i) => {
          const onEnter = () => {
            gsap.to(card, {
              y: desktopPositions[i].y - 12,
              x: -4,
              rotate: 0,
              scale: 1.05,
              zIndex: 20, 
              borderColor: "var(--accent)",
              duration: 0.4,
              ease: "power3.out"
            });
            
            const arrow = card.querySelector('.card-arrow');
            if (arrow) gsap.to(arrow, { opacity: 1, x: 0, duration: 0.3 });
            
            const highlight = card.querySelector('.card-highlight');
            if (highlight) gsap.to(highlight, { opacity: 1, duration: 0.3 });

            cards.forEach((sibling, j) => {
              if (i !== j) {
                const distance = j - i;
                gsap.to(sibling, {
                  x: distance > 0 ? 9 : -5,
                  y: desktopPositions[j].y + (distance > 0 ? 5 : -5),
                  scale: 0.98,
                  zIndex: CARDS.length - j,
                  borderColor: "var(--border)",
                  duration: 0.4,
                  ease: "power2.out"
                });
              }
            });
          };

          const onDown = () => gsap.to(card, { scale: 0.98, duration: 0.1 });
          const onUp = () => gsap.to(card, { scale: 1.05, duration: 0.1 });

          card.addEventListener('mouseenter', onEnter);
          card.addEventListener('focus', onEnter);
          card.addEventListener('blur', onContainerLeave);
          card.addEventListener('mousedown', onDown);
          card.addEventListener('mouseup', onUp);

          return { card, onEnter, onDown, onUp };
        });

        // Cleanup event listeners for matchMedia
        return () => {
          container.removeEventListener('mouseenter', onContainerEnter);
          container.removeEventListener('mouseleave', onContainerLeave);
          cardHandlers.forEach(({ card, onEnter, onDown, onUp }) => {
            card.removeEventListener('mouseenter', onEnter);
            card.removeEventListener('focus', onEnter);
            card.removeEventListener('blur', onContainerLeave);
            card.removeEventListener('mousedown', onDown);
            card.removeEventListener('mouseup', onUp);
          });
        };
      },
      containerRef
    );

    return () => mm.revert();
  }, { scope: containerRef });

  return (
    <div 
      ref={containerRef} 
      className="hero-deck relative grid w-full grid-cols-2 gap-2.5 sm:grid-cols-4 lg:block perspective-1000"
      aria-label="Quick Navigation"
    >
      {CARDS.map((card, i) => (
        <button
          key={card.id}
          className="hero-card relative h-[8.25rem] min-w-0 border rounded-sm p-3 lg:p-[clamp(0.75rem,1.15vw,1.25rem)] text-left flex flex-col justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent overflow-hidden group active:border-accent motion-safe:active:scale-[0.98]"
          style={{ 
            zIndex: CARDS.length - i,
            "--deck-progress": i / (CARDS.length - 1),
            "--resting-position": `translateY(${desktopPositions[i].y}px) rotate(${desktopPositions[i].rotate}deg)`
          } as React.CSSProperties}
          onClick={() => document.getElementById(card.id)?.scrollIntoView({ behavior: shouldReduceMotion ? "instant" : "smooth" })}
          aria-label={`Scroll to ${card.title}`}
        >
          {/* Highlight overlay */}
          <div className="card-highlight absolute inset-0 bg-gradient-to-br from-white/[0.06] to-transparent opacity-0 max-lg:group-active:opacity-100 max-lg:group-focus-visible:opacity-100 pointer-events-none" />
          
          {/* Subtle line accent left */}
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent/0 group-hover:bg-accent/60 transition-colors duration-500" />
          
          <div className="flex flex-col h-full relative z-10 w-full">
            {/* Top Left: 01 */}
            <span className="font-mono text-xs md:text-sm text-accent/80 tracking-widest leading-none mb-auto">{card.num}</span>
            
            {/* Top/Center: Large Symbol */}
            <div className="absolute inset-x-0 top-2.5 flex items-center justify-center pointer-events-none [&>svg]:size-16 lg:inset-0 lg:mt-3 lg:[&>svg]:size-24 xl:[&>svg]:size-28">
              <card.Icon />
            </div>

            {/* Bottom Content */}
            <div className="mt-auto relative pt-4 -mx-1 px-1 -mb-1 pb-1 rounded-sm">
              <div className="w-6 h-[1px] bg-white/20 mb-1.5 lg:mb-3 group-hover:w-12 group-hover:bg-accent/70 transition-all duration-500" />
              <div className="font-display text-xs lg:text-[clamp(0.76rem,1.12vw,1.05rem)] text-white/90 tracking-wide uppercase mb-0.5 lg:mb-1.5">{card.title}</div>
              <div className="flex items-center justify-between">
                <div className="font-mono text-[9px] lg:text-[10px] text-text-muted tracking-widest uppercase">{card.subtitle}</div>
                <span className="card-arrow font-mono text-[11px] md:text-xs text-accent lg:opacity-70 leading-none">&#x2192;</span>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};
