"use client";

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from 'framer-motion';

// --- CUSTOM SYMBOLS (25-38% of card area, animated via CSS) ---

const IconWork = () => (
  <svg viewBox="0 0 48 48" className="w-20 h-20 md:w-28 md:h-28 stroke-[1.5] transition-all duration-300">
    <g className="text-[#e8e4dc]/40 group-hover:text-[#e8e4dc]/90 transition-colors duration-300">
      {/* Background Frame */}
      <rect x="8" y="12" width="24" height="18" fill="none" stroke="currentColor" className="group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
      {/* Foreground Frame */}
      <rect x="16" y="18" width="24" height="18" fill="none" stroke="currentColor" className="group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-300" />
      {/* Internal Rule */}
      <line x1="20" y1="26" x2="36" y2="26" stroke="currentColor" strokeDasharray="2 2" className="group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-300" />
    </g>
    {/* Crimson Corner Marker */}
    <path d="M 38 18 L 40 18 L 40 20" fill="none" stroke="var(--accent)" strokeWidth="2" className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:translate-y-1 transition-all duration-300" />
  </svg>
);

const IconKnowledge = () => (
  <svg viewBox="0 0 48 48" className="w-20 h-20 md:w-28 md:h-28 stroke-[1.5] transition-all duration-300">
    <g className="text-[#e8e4dc]/40 group-hover:text-[#e8e4dc]/90 transition-colors duration-300">
      {/* Topographic curves */}
      <path d="M 6 36 Q 16 28 26 36 T 46 28" fill="none" stroke="currentColor" />
      <path d="M 4 28 Q 18 16 30 28 T 48 16" fill="none" stroke="currentColor" strokeDasharray="4 2" />
      {/* Nodes */}
      <circle cx="16" cy="24" r="2" fill="currentColor" />
      <circle cx="34" cy="18" r="2" fill="currentColor" />
      <circle cx="26" cy="36" r="2" fill="currentColor" />
    </g>
    {/* Highlighted route (crimson) */}
    <path d="M 16 24 L 34 18" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="30" strokeDashoffset="30" className="opacity-0 group-hover:opacity-100 group-hover:[stroke-dashoffset:0] transition-all duration-[300ms]" />
  </svg>
);

const IconThriveForce = () => (
  <svg viewBox="0 0 48 48" className="w-20 h-20 md:w-28 md:h-28 stroke-[1.5] transition-all duration-300">
    <g className="text-[#e8e4dc]/40 group-hover:text-[#e8e4dc]/90 transition-colors duration-300 origin-center group-hover:rotate-12">
      {/* Mechanical Axis / Hub */}
      <circle cx="24" cy="24" r="6" fill="none" stroke="currentColor" />
      <circle cx="24" cy="24" r="2" fill="currentColor" />
      {/* Weapon Arc */}
      <path d="M 12 24 A 12 12 0 0 1 36 24" fill="none" stroke="currentColor" strokeDasharray="4 4" />
      <line x1="24" y1="8" x2="24" y2="18" stroke="currentColor" />
      <line x1="24" y1="30" x2="24" y2="40" stroke="currentColor" />
    </g>
    {/* Impact Slash (crimson) */}
    <line x1="16" y1="16" x2="16" y2="16" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" className="opacity-0 group-hover:opacity-100 group-hover:[x2:10] group-hover:[y2:10] transition-all duration-[200ms]" />
  </svg>
);

const IconContact = () => (
  <svg viewBox="0 0 48 48" className="w-20 h-20 md:w-28 md:h-28 stroke-[1.5] transition-all duration-300">
    <g className="text-[#e8e4dc]/40 group-hover:text-[#e8e4dc]/90 transition-colors duration-300">
      {/* Offset Connection Points */}
      <rect x="12" y="16" width="6" height="6" fill="none" stroke="currentColor" />
      <rect x="30" y="26" width="6" height="6" fill="none" stroke="currentColor" />
    </g>
    {/* Directional Signal Line (crimson) */}
    <line x1="18" y1="19" x2="18" y2="19" stroke="var(--accent)" strokeWidth="1.5" className="opacity-0 group-hover:opacity-100 group-hover:[x2:30] group-hover:[y2:29] transition-all duration-300" />
    {/* Terminal Pulse */}
    <circle cx="33" cy="29" r="1" fill="var(--accent)" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100" />
  </svg>
);

const CARDS = [
  { id: 'work', title: 'WORK', subtitle: 'SELECTED PROJECTS', num: '01', Icon: IconWork },
  { id: 'knowledge', title: 'KNOWLEDGE', subtitle: 'SKILLS LANDSCAPE', num: '02', Icon: IconKnowledge },
  { id: 'robotics', title: 'THRIVEFORCE', subtitle: 'ROBOTICS STORY', num: '03', Icon: IconThriveForce },
  { id: 'contact', title: 'CONTACT', subtitle: 'LET’S CONNECT', num: '04', Icon: IconContact }
];

export const HeroCards = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useGSAP(() => {
    if (shouldReduceMotion) return;
    
    const cards = gsap.utils.toArray('.hero-card') as HTMLElement[];
    if (!cards.length) return;

    // A more open, asymmetric, stepped arrangement so they are 75-90% visible.
    // 01    02
    //    03    04
    // We use a wider x/y spread to take up more of the hero space,
    // while keeping max X under ~315px to protect the Ink Familiar at left-80 (320px).
    const restingProps = [
      { x: 0, y: 0, rotate: -2 },
      { x: 110, y: 30, rotate: 1.5 },
      { x: 20, y: 150, rotate: -1 },
      { x: 130, y: 180, rotate: 2 }
    ];

    gsap.set(cards, { opacity: 0, y: "+=30" });
    cards.forEach((card, i) => {
      gsap.to(card, {
        opacity: 1,
        x: restingProps[i].x,
        y: restingProps[i].y,
        rotate: restingProps[i].rotate,
        duration: 0.8,
        delay: 1.1 + (i * 0.1),
        ease: "power3.out",
        onComplete: () => {
          gsap.set(card, { clearProps: "y" });
          gsap.set(card, { x: restingProps[i].x, y: restingProps[i].y, rotate: restingProps[i].rotate });
        }
      });
    });

    const ctx = gsap.context(() => {
      const container = containerRef.current;
      if (!container) return;

      container.addEventListener('mouseenter', () => {
        // Subtle additional displacement on hover (8-15px)
        cards.forEach((c, i) => {
          gsap.to(c, {
            x: restingProps[i].x + (i % 2 === 0 ? -8 : 12), 
            y: restingProps[i].y + (i < 2 ? -5 : 8),
            rotate: 0,
            duration: 0.5,
            ease: "power2.out"
          });
        });
      });

      container.addEventListener('mouseleave', () => {
        // Return to resting state
        cards.forEach((c, i) => {
          gsap.to(c, {
            x: restingProps[i].x,
            y: restingProps[i].y,
            rotate: restingProps[i].rotate,
            scale: 1,
            zIndex: CARDS.length - i,
            borderColor: "rgba(255,255,255,0.05)",
            duration: 0.5,
            ease: "power2.out"
          });
          
          const arrow = c.querySelector('.card-arrow');
          if (arrow) gsap.to(arrow, { opacity: 0, x: -5, duration: 0.2 });
          
          const highlight = c.querySelector('.card-highlight');
          if (highlight) gsap.to(highlight, { opacity: 0, duration: 0.3 });
        });
      });

      cards.forEach((card, i) => {
        card.addEventListener('mouseenter', () => {
          // Hovered card pops
          gsap.to(card, {
            y: "-=8", // subtle rise
            scale: 1.02,
            zIndex: 20, 
            borderColor: "rgba(255,255,255,0.2)",
            duration: 0.3,
            ease: "power2.out"
          });
          
          const arrow = card.querySelector('.card-arrow');
          if (arrow) gsap.to(arrow, { opacity: 1, x: 0, duration: 0.3 });
          
          const highlight = card.querySelector('.card-highlight');
          if (highlight) gsap.to(highlight, { opacity: 1, duration: 0.3 });

          // Siblings move away very slightly
          cards.forEach((sibling, j) => {
            if (i !== j) {
              gsap.to(sibling, {
                x: restingProps[j].x + (j % 2 === 0 ? -12 : 15),
                y: restingProps[j].y + (j < 2 ? -8 : 10),
                scale: 0.98,
                zIndex: CARDS.length - j,
                duration: 0.4,
                ease: "power2.out"
              });
            }
          });
        });

        card.addEventListener('mousedown', () => gsap.to(card, { scale: 0.96, duration: 0.1 }));
        card.addEventListener('mouseup', () => {
          gsap.to(card, { scale: 1.02, duration: 0.1 });
          document.getElementById(CARDS[i].id)?.scrollIntoView({ behavior: 'smooth' });
        });
        
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            document.getElementById(CARDS[i].id)?.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, { scope: containerRef });

  return (
    <div 
      ref={containerRef} 
      // The container is sized to encapsulate the new wider distributed spread
      className="relative mt-8 md:mt-12 ml-2 perspective-1000 w-[380px] h-[400px] z-20"
      aria-label="Quick Navigation"
    >
      {CARDS.map((card, i) => (
        <button
          key={card.id}
          className="hero-card absolute top-0 left-0 w-[150px] h-[200px] md:w-[170px] md:h-[230px] bg-[#050505]/95 backdrop-blur-md border border-white/5 rounded-sm p-4 md:p-5 text-left shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent overflow-hidden group"
          style={{ 
            zIndex: CARDS.length - i,
            transform: shouldReduceMotion ? `translate(${i * 140}px, ${(i%2) * 40}px)` : 'none' 
          }}
          aria-label={`Scroll to ${card.title}`}
        >
          {/* Highlight overlay */}
          <div className="card-highlight absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 pointer-events-none" />
          
          {/* Subtle line accent left */}
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent/0 group-hover:bg-accent/40 transition-colors duration-300" />
          
          <div className="flex flex-col h-full relative z-10 w-full">
            {/* Top Left: 01 */}
            <span className="font-mono text-[10px] md:text-xs text-accent/80 tracking-widest leading-none mb-auto">{card.num}</span>
            
            {/* Top/Center: Large Symbol */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-2">
              <card.Icon />
            </div>

            {/* Bottom Content */}
            <div className="mt-auto relative">
              <div className="w-6 h-[1px] bg-white/20 mb-3 group-hover:w-10 group-hover:bg-accent/50 transition-all duration-300" />
              <div className="font-display text-sm md:text-base text-white/90 tracking-widest uppercase mb-1">{card.title}</div>
              <div className="flex items-center justify-between">
                <div className="font-mono text-[8px] md:text-[9px] text-text-muted tracking-widest uppercase">{card.subtitle}</div>
                <span className="card-arrow font-mono text-[10px] text-accent opacity-0 -translate-x-1 leading-none">&#x2192;</span>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};
