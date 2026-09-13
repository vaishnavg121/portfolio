"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface BootSlashProps {
  onComplete?: () => void;
}

// Precomputed deterministic fragments
const FRAGMENTS = Array.from({ length: 14 }).map((_, i) => {
  const px = 150 + (i * 50); // Spread diagonally
  const py = 850 - (i * 50);
  const dirX = i % 2 === 0 ? 1 : -1;
  const dirY = i % 2 === 0 ? -1 : 1;
  const rand = (i * 13) % 100;
  return {
    key: i,
    px,
    py,
    dirX,
    dirY,
    rand,
    fill: i % 3 === 0 ? "#fff" : "var(--accent)",
    mobileHidden: i > 7
  };
});

export const BootSlash = ({ onComplete }: BootSlashProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (onComplete) onComplete();
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          if (onComplete) onComplete();
        }
      });

      // 1. Initial State Setup
      const core = document.querySelector("#slash-core") as SVGPathElement;
      const coreLength = core ? core.getTotalLength() : 2000;
      gsap.set(core, { strokeDasharray: coreLength, strokeDashoffset: coreLength });

      const inkTrails = gsap.utils.toArray(".slash-ink") as SVGPathElement[];
      inkTrails.forEach((ink) => {
        const len = (ink as SVGPathElement).getTotalLength();
        gsap.set(ink, { strokeDasharray: len, strokeDashoffset: len });
      });

      gsap.set(".slash-trace-dashed", { strokeDashoffset: 0, opacity: 0 });
      gsap.set(".hero-title", { clipPath: "inset(0 100% 0 0)", opacity: 0 });
      gsap.set(".hero-sys-init, .hero-subtitle, .hero-annotation", { opacity: 0, y: 10 });

      // 2. TIMELINE CONSTRUCTION
      tl.addLabel("start", 0);

      // Energy buildup (0 - 60ms)
      tl.to(".slash-trace-build", {
        strokeDashoffset: 0,
        keyframes: { opacity: [0, 1, 0] },
        duration: 0.08,
        stagger: 0.02,
        ease: "power2.inOut",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any, "start");

      tl.addLabel("slashStart", 0.08);

      // Main core crossing (80ms - 260ms) -> 180ms duration
      tl.to(core, {
        strokeDashoffset: 0,
        duration: 0.18,
        ease: "power4.in",
      }, "slashStart");
      
      tl.to(core, {
        opacity: 0,
        duration: 0.1,
        ease: "power2.out",
      }, "slashStart+=0.18");

      // Glow residual
      tl.fromTo("#slash-glow", 
        { opacity: 0 },
        { opacity: 0.5, duration: 0.1, ease: "power2.in" },
        "slashStart"
      ).to("#slash-glow", {
        opacity: 0, duration: 0.2, ease: "power2.out"
      }, "slashStart+=0.1");

      // Center cross is approximately at slashStart + 0.10
      tl.addLabel("centerCross", "slashStart+=0.10");

      // Reveal Hero
      tl.to(".hero-title", {
        clipPath: "inset(0 0% 0 0)",
        opacity: 1,
        duration: 0.3,
        ease: "power3.inOut"
      }, "centerCross");
      
      tl.to(".hero-sys-init", {
        opacity: 1, y: 0, duration: 0.3, ease: "power2.out"
      }, "centerCross-=0.05");

      tl.to(".hero-subtitle", {
        opacity: 1, y: 0, duration: 0.4, ease: "power2.out"
      }, "centerCross+=0.05");

      tl.to(".hero-annotation", {
        opacity: 1, y: 0, duration: 0.4, ease: "power2.out"
      }, "centerCross+=0.15");

      // Fade out the opaque boot overlay (revealing Hero behind it)
      tl.to(".boot-overlay", {
        opacity: 0,
        duration: 0.15,
        ease: "power2.out"
      }, "centerCross-=0.05");
      
      // Micro-impact on Hero container
      tl.to(".hero-container", {
        x: 1.5, duration: 0.05, ease: "power2.out"
      }, "centerCross").to(".hero-container", {
        x: 0, duration: 0.05, ease: "power2.in"
      }, "centerCross+=0.05");

      // Crimson secondary dashed strokes (slide offset)
      tl.addLabel("secondary", "slashStart+=0.04");
      
      const dashedTraces = gsap.utils.toArray(".slash-trace-dashed") as SVGPathElement[];
      dashedTraces.forEach((trace, i) => {
        const len = trace.getTotalLength();
        tl.fromTo(trace, 
          { strokeDashoffset: 0, opacity: 0 },
          { strokeDashoffset: -(len * 0.9), opacity: 0.7, duration: 0.25, ease: "none" }, 
          `secondary+=${i * 0.02}`
        );
        tl.to(trace, { opacity: 0, duration: 0.15, ease: "power2.out" }, `secondary+=${0.2 + (i * 0.02)}`);
      });

      // Ink trails
      inkTrails.forEach((ink, i) => {
        tl.to(ink, {
          strokeDashoffset: 0,
          duration: 0.25,
          ease: "power3.inOut",
        }, `slashStart+=${0.05 + (i * 0.02)}`);
        
        tl.to(ink, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
        }, `slashStart+=${0.25}`);
      });

      // Fragments ballistic
      FRAGMENTS.forEach((frag, i) => {
        // Skip animating hidden fragments on mobile (check display via matchMedia or just animate them blindly since display:none ignores paints, but to be clean we query visibility)
        const element = document.getElementById(`frag-${i}`);
        if (!element || getComputedStyle(element).display === "none") return;
        
        tl.fromTo(element, 
          { x: 0, y: 0, opacity: 0, scale: 0 },
          {
            x: frag.dirX * (80 + frag.rand),
            y: frag.dirY * (80 + frag.rand),
            keyframes: {
              opacity: [0, 0.8, 0],
              scale: [0, 1.2, 0],
            },
            rotation: frag.rand * 3,
            duration: 0.3 + (frag.rand / 300),
            ease: "power2.out",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any, `slashStart+=${0.05 + (i * 0.01)}`
        );
      });

    });

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div ref={containerRef} className="fixed inset-0 w-full h-full pointer-events-none z-[110]" aria-hidden="true">
      <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
        <defs>
          <filter id="slash-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g id="slash-glow" opacity="0">
          {/* Crimson glow/edge path */}
          <path d="M-100,900 L1100,-100" stroke="var(--accent)" strokeWidth="16" fill="none" filter="url(#slash-glow-filter)" opacity="0.6" />
        </g>

        {/* Energy buildup traces (2 paths) */}
        <path className="slash-trace-build" d="M100,850 L150,800" stroke="var(--accent)" strokeWidth="3" fill="none" />
        <path className="slash-trace-build" d="M80,880 L140,820" stroke="var(--accent)" strokeWidth="2" fill="none" />

        {/* Charcoal / ink trailing stroke (1 path) */}
        <path className="slash-ink" d="M-120,950 Q 500,450 1150,-50" stroke="#111" strokeWidth="50" fill="none" opacity="0.5" />

        {/* Irregular crimson secondary dashed trace (1 path) */}
        <path className="slash-trace-dashed" d="M-80,890 L1080,-110" stroke="var(--accent)" strokeWidth="4" fill="none" strokeDasharray="150 50 300 100" />

        {/* Main Core */}
        <path id="slash-core" d="M-100,900 L1100,-100" stroke="#fff" strokeWidth="3" fill="none" filter="url(#slash-glow-filter)" />

        {/* Fragments */}
        <g>
          {FRAGMENTS.map((frag) => (
            <polygon
              key={frag.key}
              id={`frag-${frag.key}`}
              className={`slash-fragment ${frag.mobileHidden ? "hidden md:block" : ""}`}
              points={`${frag.px},${frag.py} ${frag.px+5},${frag.py} ${frag.px+3},${frag.py+8}`}
              fill={frag.fill}
              opacity="0"
              style={{
                transformOrigin: `${frag.px}px ${frag.py}px`,
                transformBox: "fill-box"
              }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
};

