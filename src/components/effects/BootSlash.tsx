"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface BootSlashProps {
  onComplete?: () => void;
}

// Precompute deterministic fragments
const FRAGMENTS = Array.from({ length: 24 }).map((_, i) => {
  const px = 100 + (i * 35);
  const py = 900 - (i * 35);
  return {
    key: i,
    px,
    py,
    points: `${px},${py} ${px+5},${py} ${px+3},${py+8}`,
    fill: i % 3 === 0 ? "#fff" : "var(--accent)",
    mobileHidden: i > 11
  };
});

export const BootSlash = ({ onComplete }: BootSlashProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Check reduced motion
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

      if (window.matchMedia("(width < 64rem)").matches) tl.timeScale(1.7);

      // Solid paths
      const core = document.querySelector("#slash-core") as SVGPathElement;
      const coreLength = core ? core.getTotalLength() : 2000;
      gsap.set(core, { strokeDasharray: coreLength, strokeDashoffset: coreLength });

      const solidTraces = gsap.utils.toArray(".slash-trace-solid") as SVGPathElement[];
      solidTraces.forEach((trace) => {
        const len = (trace as SVGPathElement).getTotalLength();
        gsap.set(trace, { strokeDasharray: len, strokeDashoffset: len });
      });

      const inkTrails = gsap.utils.toArray(".slash-ink") as SVGPathElement[];
      inkTrails.forEach((ink) => {
        const len = (ink as SVGPathElement).getTotalLength();
        gsap.set(ink, { strokeDasharray: len, strokeDashoffset: len });
      });

      // Dashed paths
      const dashedTraces = gsap.utils.toArray(".slash-trace-dashed") as SVGPathElement[];
      dashedTraces.forEach((trace) => {
        gsap.set(trace, { strokeDashoffset: 0, opacity: 0 });
      });
      
      const fragments = (gsap.utils.toArray(".slash-fragment") as SVGElement[]).filter(
        (el) => getComputedStyle(el).display !== "none"
      );

      // Energy buildup traces (0 - 90ms)
      tl.to(".slash-trace-build", {
        strokeDashoffset: 0,
        keyframes: { opacity: [0, 1, 0] },
        duration: 0.1,
        stagger: 0.02,
        ease: "power2.inOut",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any, 0);

      // Main core stroke (140 - 260ms)
      tl.to(core, {
        strokeDashoffset: 0,
        duration: 0.25,
        ease: "power4.in",
      }, 0.14);
      
      tl.to(core, {
        opacity: 0,
        duration: 0.1,
        ease: "power2.out",
      }, 0.25);

      // Crimson secondary solid strokes
      solidTraces.forEach((trace, i) => {
        if (trace.classList.contains("slash-trace-build")) return;
        tl.to(trace, {
          strokeDashoffset: 0,
          duration: 0.3,
          ease: "power3.inOut",
        }, 0.16 + (i * 0.02));
        
        tl.to(trace, {
          opacity: 0,
          duration: 0.2,
          ease: "power2.out",
        }, 0.35 + (i * 0.02));
      });

      // Crimson secondary dashed strokes (slide offset)
      dashedTraces.forEach((trace, i) => {
        const len = trace.getTotalLength();
        tl.fromTo(trace, 
          { strokeDashoffset: 0, opacity: 0 },
          { strokeDashoffset: -(len * 0.9), opacity: 0.8, duration: 0.3, ease: "none" }, 
          0.16 + (i * 0.02)
        );
        tl.to(trace, { opacity: 0, duration: 0.2, ease: "power2.out" }, 0.35 + (i * 0.02));
      });

      // Ink trails
      inkTrails.forEach((ink, i) => {
        tl.to(ink, {
          strokeDashoffset: 0,
          duration: 0.35,
          ease: "power3.inOut",
        }, 0.18 + (i * 0.03));
        
        tl.to(ink, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
        }, 0.4);
      });

      // Fragments ballistic
      fragments.forEach((frag, i) => {
        const dirX = i % 2 === 0 ? 1 : -1;
        const dirY = i % 2 === 0 ? -1 : 1;
        const rand = (i * 13) % 100;
        tl.fromTo(frag, 
          { x: 0, y: 0, opacity: 0, scale: 0 },
          {
            x: dirX * (100 + rand),
            y: dirY * (100 + rand),
            keyframes: {
              opacity: [0, 0.8, 0],
              scale: [0, 1.5, 0],
            },
            rotation: rand * 4,
            duration: 0.4 + (rand / 200),
            ease: "power2.out",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any, 0.19 + (i * 0.01)
        );
      });

      // Glow residual
      tl.fromTo("#slash-glow", 
        { opacity: 0 },
        {
          opacity: 0.5,
          duration: 0.15,
          ease: "power2.in"
        }, 0.14
      ).to("#slash-glow", {
        opacity: 0,
        duration: 0.3,
        ease: "power2.out"
      }, 0.29);

    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div ref={containerRef} className="fixed inset-0 w-full h-full pointer-events-none z-[110]" aria-hidden="true">
      <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
        <defs>
          <filter id="slash-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g id="slash-glow" opacity="0">
          <path d="M-100,900 L1100,-100" stroke="var(--accent)" strokeWidth="40" fill="none" filter="url(#slash-glow-filter)" opacity="0.3" />
        </g>

        {/* Energy buildup traces */}
        <path className="slash-trace-solid slash-trace-build" d="M100,850 L150,800" stroke="var(--accent)" strokeWidth="3" fill="none" />
        <path className="slash-trace-solid slash-trace-build" d="M80,880 L140,820" stroke="var(--accent)" strokeWidth="2" fill="none" />
        <path className="slash-trace-solid slash-trace-build" d="M120,900 L180,840" stroke="var(--accent)" strokeWidth="1" fill="none" />

        {/* Ink / Charcoal */}
        <path className="slash-ink" d="M-120,950 Q 500,450 1150,-50" stroke="#111" strokeWidth="60" fill="none" opacity="0.4" />
        <path className="slash-ink" d="M-50,880 Q 500,400 1050,-100" stroke="#1a1a1a" strokeWidth="40" fill="none" opacity="0.6" />
        <path className="slash-ink" d="M-80,920 L 1120,-80" stroke="#0a0a0a" strokeWidth="80" fill="none" opacity="0.3" />

        {/* Crimson Traces */}
        <path className="slash-trace-solid" d="M-100,920 L1100,-80" stroke="var(--accent)" strokeWidth="8" fill="none" opacity="0.8" />
        <path className="slash-trace-dashed hidden md:block" d="M-80,890 L1080,-110" stroke="var(--accent)" strokeWidth="4" fill="none" strokeDasharray="150 50 300 100" />
        <path className="slash-trace-dashed" d="M-120,950 L1120,-50" stroke="#ff4444" strokeWidth="6" fill="none" strokeDasharray="50 150 400 50" />

        {/* Main Core */}
        <path id="slash-core" d="M-100,900 L1100,-100" stroke="#fff" strokeWidth="3" fill="none" filter="url(#slash-glow-filter)" />

        {/* Fragments */}
        <g>
          {FRAGMENTS.map((frag) => (
            <polygon
              key={frag.key}
              className={`slash-fragment ${frag.mobileHidden ? 'hidden md:block' : ''}`}
              points={frag.points}
              fill={frag.fill}
              opacity="0"
              style={{ transformOrigin: `${frag.px}px ${frag.py}px`, transformBox: "fill-box" }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
};

