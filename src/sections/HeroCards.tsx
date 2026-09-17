"use client";

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from 'framer-motion';

const CARDS = [
  { id: 'work', title: 'WORK', subtitle: 'SELECTED PROJECTS', num: '01' },
  { id: 'knowledge', title: 'KNOWLEDGE', subtitle: 'SYSTEM LANDSCAPE', num: '02' },
  { id: 'robotics', title: 'THRIVEFORCE', subtitle: 'HARDWARE & CAD', num: '03' },
  { id: 'contact', title: 'CONTACT', subtitle: 'GET IN TOUCH', num: '04' }
];

export const HeroCards = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useGSAP(() => {
    if (shouldReduceMotion) return;
    
    const cards = gsap.utils.toArray('.hero-card') as HTMLElement[];
    if (!cards.length) return;

    // Resting state composition
    const restingProps = [
      { y: 0, rotate: -2, x: 0 },
      { y: 0, rotate: 1, x: 12 },
      { y: 0, rotate: -1, x: 24 },
      { y: 0, rotate: 2, x: 36 }
    ];

    // Entrance animation
    gsap.set(cards, { opacity: 0, y: 15 });
    cards.forEach((card, i) => {
      gsap.to(card, {
        opacity: 1,
        y: restingProps[i].y,
        x: restingProps[i].x,
        rotate: restingProps[i].rotate,
        duration: 0.4,
        delay: 1.1 + (i * 0.05),
        ease: "power2.out",
        onComplete: () => {
          gsap.set(card, { clearProps: "y" }); // clear initial entrance offset for cleaner hover math
          // Re-apply resting props cleanly
          gsap.set(card, { y: restingProps[i].y, x: restingProps[i].x, rotate: restingProps[i].rotate });
        }
      });
    });

    const ctx = gsap.context(() => {
      const container = containerRef.current;
      if (!container) return;

      container.addEventListener('mouseenter', () => {
        // Expand the deck slightly on container hover
        cards.forEach((c, i) => {
          gsap.to(c, {
            x: i * 20, // separate them more
            rotate: 0,
            duration: 0.3,
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
            zIndex: cards.length - i,
            borderWidth: "1px",
            borderColor: "rgba(255,255,255,0.05)",
            duration: 0.4,
            ease: "power2.out"
          });
          
          const icon = c.querySelector('.card-icon');
          if (icon) gsap.to(icon, { opacity: 0, duration: 0.2 });
        });
      });

      cards.forEach((card, i) => {
        card.addEventListener('mouseenter', () => {
          // Hovered card comes forward
          gsap.to(card, {
            y: -8,
            scale: 1.02,
            zIndex: 10, // pop to front
            borderColor: "rgba(255,255,255,0.2)",
            duration: 0.2,
            ease: "power2.out"
          });
          
          const icon = card.querySelector('.card-icon');
          if (icon) gsap.to(icon, { opacity: 1, duration: 0.2 });

          // Siblings move aside
          cards.forEach((sibling, j) => {
            if (i !== j) {
              gsap.to(sibling, {
                x: (j * 20) + (j < i ? -10 : 10), // move left if before, right if after
                scale: 0.98,
                zIndex: cards.length - j,
                duration: 0.3,
                ease: "power2.out"
              });
            }
          });
        });

        card.addEventListener('mousedown', () => {
          gsap.to(card, { scale: 0.95, duration: 0.1 });
        });

        card.addEventListener('mouseup', () => {
          gsap.to(card, { scale: 1.02, duration: 0.1 });
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
      className="relative h-24 mt-8 ml-2 perspective-1000 w-64"
      aria-label="Quick Navigation"
    >
      {CARDS.map((card, i) => (
        <button
          key={card.id}
          className="hero-card absolute top-0 left-0 w-48 h-20 bg-[#080808]/90 backdrop-blur-sm border border-white/5 rounded-sm p-4 text-left shadow-[0_4px_24px_rgba(0,0,0,0.4)] flex flex-col justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent overflow-hidden group"
          style={{ 
            zIndex: CARDS.length - i,
            transform: shouldReduceMotion ? `translateX(${i * 20}px)` : 'none' 
          }}
          aria-label={`Scroll to ${card.title}`}
        >
          {/* Subtle gradient shine */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
          
          <div className="flex justify-between items-start relative z-10 w-full">
            <span className="font-mono text-[9px] text-accent/80 tracking-widest leading-none">{card.num}</span>
            <span className="card-icon font-mono text-[9px] text-accent opacity-0 transition-opacity leading-none">&#x2198;</span>
          </div>
          
          <div className="relative z-10">
            <div className="font-display text-sm text-white/90 tracking-widest uppercase mb-0.5">{card.title}</div>
            <div className="font-mono text-[8px] text-text-muted tracking-widest uppercase">{card.subtitle}</div>
          </div>
        </button>
      ))}
    </div>
  );
};
