"use client";

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from 'framer-motion';

const IconWork = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" className="text-white/40 group-hover:text-accent transition-colors duration-300">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="18" height="7" />
  </svg>
);

const IconKnowledge = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" className="text-white/40 group-hover:text-accent transition-colors duration-300">
    <circle cx="12" cy="5" r="2" />
    <circle cx="19" cy="19" r="2" />
    <circle cx="5" cy="19" r="2" />
    <path d="M11 6.5L6 17.5" />
    <path d="M13 6.5L18 17.5" />
    <path d="M7 19H17" />
  </svg>
);

const IconThriveForce = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" className="text-white/40 group-hover:text-accent transition-colors duration-300">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v3" />
    <path d="M12 19v3" />
    <path d="M2 12h3" />
    <path d="M19 12h3" />
    <path d="M4.93 4.93l2.12 2.12" />
    <path d="M16.95 16.95l2.12 2.12" />
    <path d="M4.93 19.07l2.12-2.12" />
    <path d="M16.95 7.05l2.12-2.12" />
  </svg>
);

const IconContact = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" className="text-white/40 group-hover:text-accent transition-colors duration-300">
    <path d="M4 7l8 5 8-5" />
    <rect x="2" y="4" width="20" height="16" />
    <path d="M12 16h.01" />
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

    // We want a more vertical poster-like stack.
    // Base layout: Cards are taller now. They stack behind each other.
    const restingProps = [
      { y: 0, rotate: -2, x: 0 },
      { y: 6, rotate: 1, x: 12 },
      { y: 12, rotate: -1, x: 24 },
      { y: 18, rotate: 2, x: 36 }
    ];

    // Entrance animation
    gsap.set(cards, { opacity: 0, y: 30 });
    cards.forEach((card, i) => {
      gsap.to(card, {
        opacity: 1,
        y: restingProps[i].y,
        x: restingProps[i].x,
        rotate: restingProps[i].rotate,
        duration: 0.6,
        delay: 1.1 + (i * 0.08),
        ease: "power3.out",
        onComplete: () => {
          gsap.set(card, { clearProps: "y" });
          gsap.set(card, { y: restingProps[i].y, x: restingProps[i].x, rotate: restingProps[i].rotate });
        }
      });
    });

    const ctx = gsap.context(() => {
      const container = containerRef.current;
      if (!container) return;

      container.addEventListener('mouseenter', () => {
        // Expand the deck vertically & horizontally on container hover
        cards.forEach((c, i) => {
          gsap.to(c, {
            x: i * 25, 
            y: i * 15,
            rotate: 0,
            duration: 0.4,
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
          
          const icon = c.querySelector('.card-arrow');
          if (icon) gsap.to(icon, { opacity: 0, x: -5, duration: 0.2 });
          
          const highlight = c.querySelector('.card-highlight');
          if (highlight) gsap.to(highlight, { opacity: 0, duration: 0.3 });
        });
      });

      cards.forEach((card, i) => {
        card.addEventListener('mouseenter', () => {
          // Hovered card comes forward and up
          gsap.to(card, {
            y: (i * 15) - 10, // Rise from its expanded position
            scale: 1.03,
            zIndex: 20, // pop to absolute front
            borderColor: "rgba(255,255,255,0.2)",
            duration: 0.3,
            ease: "power2.out"
          });
          
          const arrow = card.querySelector('.card-arrow');
          if (arrow) gsap.to(arrow, { opacity: 1, x: 0, duration: 0.3 });
          
          const highlight = card.querySelector('.card-highlight');
          if (highlight) gsap.to(highlight, { opacity: 1, duration: 0.3 });

          // Siblings move aside
          cards.forEach((sibling, j) => {
            if (i !== j) {
              gsap.to(sibling, {
                x: (j * 25) + (j < i ? -15 : 15),
                y: (j * 15) + (j < i ? -5 : 5),
                scale: 0.98,
                zIndex: CARDS.length - j,
                duration: 0.4,
                ease: "power2.out"
              });
            }
          });
        });

        card.addEventListener('mousedown', () => {
          gsap.to(card, { scale: 0.96, duration: 0.1 });
        });

        card.addEventListener('mouseup', () => {
          gsap.to(card, { scale: 1.03, duration: 0.1 });
          const targetId = CARDS[i].id;
          document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
        });
        
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const targetId = CARDS[i].id;
            document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, { scope: containerRef });

  return (
    <div 
      ref={containerRef} 
      className="relative mt-8 md:mt-12 ml-2 perspective-1000 w-[180px] h-[260px] md:w-[220px] md:h-[320px] z-20"
      aria-label="Quick Navigation"
    >
      {CARDS.map((card, i) => (
        <button
          key={card.id}
          className="hero-card absolute top-0 left-0 w-[160px] h-[220px] md:w-[190px] md:h-[270px] bg-[#050505]/95 backdrop-blur-md border border-white/5 rounded-sm p-4 md:p-6 text-left shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent overflow-hidden group"
          style={{ 
            zIndex: CARDS.length - i,
            transform: shouldReduceMotion ? `translate(${i * 15}px, ${i * 10}px)` : 'none' 
          }}
          aria-label={`Scroll to ${card.title}`}
        >
          {/* Subtle gradient shine / Highlight */}
          <div className="card-highlight absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 pointer-events-none" />
          
          {/* Subtle line accent left */}
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent/0 group-hover:bg-accent/40 transition-colors duration-300" />
          
          <div className="flex justify-between items-start relative z-10 w-full">
            <span className="font-mono text-xs md:text-sm text-accent/80 tracking-widest leading-none">{card.num}</span>
            <div className="card-icon">
              <card.Icon />
            </div>
          </div>
          
          <div className="relative z-10">
            {/* Tiny structural line */}
            <div className="w-6 h-[1px] bg-white/20 mb-3 group-hover:w-10 group-hover:bg-accent/50 transition-all duration-300" />
            
            <div className="font-display text-lg md:text-xl text-white/90 tracking-widest uppercase mb-1">{card.title}</div>
            
            <div className="flex items-center justify-between">
              <div className="font-mono text-[8px] md:text-[9px] text-text-muted tracking-widest uppercase">{card.subtitle}</div>
              <span className="card-arrow font-mono text-[10px] text-accent opacity-0 -translate-x-1 leading-none">&#x2192;</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};
