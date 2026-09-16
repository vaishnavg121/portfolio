"use client";
import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { velociraptorAssets } from '../../data/velociraptorAssets';

gsap.registerPlugin(ScrollTrigger);

export const ThriveForceEntry = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const robotRef = useRef<HTMLDivElement>(null);
  const crosshairRef = useRef<HTMLDivElement>(null);
  const xrayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !robotRef.current) return;

    const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "+=120%",
            pin: true,
            scrub: 0.5,
          }
        });

        // 01. Text Transition
        tl.to(".entry-text", { opacity: 0, y: -50, duration: 1 }, 0)
          .to(".machine-text", { opacity: 1, y: 0, duration: 1 }, 0.5)
          .to(".annotation-line", { scaleX: 1, duration: 0.5, stagger: 0.2 }, 0.5)
          .to(".annotation-text", { opacity: 1, x: 0, duration: 0.5, stagger: 0.2 }, 0.7);

        // 02. Camera Sequence (0 to 6)
        // 3/4 Hero -> Frontal -> Top -> Wireframe
        tl.to(".robot-solid-1", { opacity: 0, scale: 1.02, y: -10, duration: 1.5 }, 1.5)
          .fromTo(".robot-solid-2", { opacity: 0, scale: 0.98, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 1.5 }, 1.0)
          
          .to(".robot-solid-2", { opacity: 0, scale: 1.02, y: -10, duration: 1.5 }, 3.5)
          .fromTo(".robot-solid-3", { opacity: 0, scale: 0.98, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 1.5 }, 3.0)
          
          .to(".robot-solid-3", { opacity: 0, duration: 1.5 }, 5.5)
          .fromTo(".robot-wireframe-base", { opacity: 0 }, { opacity: 1, duration: 1.5 }, 5.0)
          .to(xrayRef.current, { opacity: 0, duration: 0.5 }, 5.0);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!robotRef.current) return;
    const rect = robotRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    robotRef.current.style.setProperty('--cursor-x', `${x}px`);
    robotRef.current.style.setProperty('--cursor-y', `${y}px`);

    if (crosshairRef.current) {
        gsap.to(crosshairRef.current, { x, y, duration: 0.1, ease: "power2.out", overwrite: "auto" });
    }
  };

  const handlePointerEnter = () => {
      gsap.to([xrayRef.current, crosshairRef.current], { opacity: 1, duration: 0.3, overwrite: "auto" });
  };

  const handlePointerLeave = () => {
      gsap.to([xrayRef.current, crosshairRef.current], { opacity: 0, duration: 0.3, overwrite: "auto" });
  };

  return (
    <section ref={containerRef} className="relative w-full h-screen bg-[#030303] text-[#f5ede3] overflow-hidden border-b border-white/5">
       
       <div 
          ref={robotRef}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-full lg:w-[65%] h-[80vh] lg:h-[90vh] pointer-events-auto flex items-center justify-center p-4 lg:p-8"
          onPointerMove={handlePointerMove}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
       >
          {/* Stable Technical Frame */}
          <div className="relative w-full h-full border border-white/10 rounded-sm overflow-hidden bg-[#050505]">
              {/* Registration Marks */}
              <div className="absolute top-4 left-4 w-2 h-2 border-t border-l border-white/30" />
              <div className="absolute top-4 right-4 w-2 h-2 border-t border-r border-white/30" />
              <div className="absolute bottom-4 left-4 w-2 h-2 border-b border-l border-white/30" />
              <div className="absolute bottom-4 right-4 w-2 h-2 border-b border-r border-white/30" />
              <div className="absolute bottom-4 right-8 font-mono text-[9px] tracking-widest text-text-muted uppercase">VELOCIRAPTOR / CAD</div>
              
              {/* Image 1: 3/4 Hero */}
              <div className="robot-solid-1 absolute inset-0 w-full h-full">
                  <Image 
                     src={velociraptorAssets.screenshots.hero34} 
                     alt="Velociraptor 3/4" 
                     fill 
                     className="object-contain object-center scale-110" 
                     priority
                  />
              </div>

              {/* Image 2: Frontal */}
              <div className="robot-solid-2 absolute inset-0 w-full h-full opacity-0">
                  <Image 
                     src={velociraptorAssets.screenshots.frontal} 
                     alt="Velociraptor Frontal" 
                     fill 
                     className="object-contain object-center scale-110" 
                  />
              </div>

              {/* Image 3: Top */}
              <div className="robot-solid-3 absolute inset-0 w-full h-full opacity-0">
                  <Image 
                     src={velociraptorAssets.screenshots.top} 
                     alt="Velociraptor Top" 
                     fill 
                     className="object-contain object-center scale-110" 
                  />
              </div>

              {/* Image 4: Wireframe */}
              <div className="robot-wireframe-base absolute inset-0 w-full h-full opacity-0">
                  <Image 
                     src={velociraptorAssets.technical.heroWireframe} 
                     alt="Velociraptor Wireframe" 
                     fill 
                     className="object-contain object-center scale-110" 
                  />
              </div>

              {/* X-Ray Mask Layer */}
              <div 
                 ref={xrayRef}
                 className="robot-xray absolute inset-0 w-full h-full pointer-events-none opacity-0"
                 style={{
                     maskImage: 'radial-gradient(circle 180px at var(--cursor-x, 50%) var(--cursor-y, 50%), black 20%, transparent 80%)',
                     WebkitMaskImage: 'radial-gradient(circle 180px at var(--cursor-x, 50%) var(--cursor-y, 50%), black 20%, transparent 80%)'
                 }}
              >
                  <Image 
                     src={velociraptorAssets.technical.heroWireframe} 
                     alt="X-ray wireframe" 
                     fill 
                     className="object-contain object-center scale-110" 
                  />
                  <div className="absolute inset-0 bg-accent/5 mix-blend-screen" />
              </div>
          </div>

          {/* Crosshair */}
          <div 
             ref={crosshairRef}
             className="absolute top-0 left-0 w-8 h-8 pointer-events-none -translate-x-1/2 -translate-y-1/2 opacity-0 z-20"
          >
             <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-accent/50 -translate-x-1/2" />
             <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-accent/50 -translate-y-1/2" />
             <div className="absolute top-1/2 left-1/2 w-1 h-1 border border-accent -translate-x-1/2 -translate-y-1/2 rounded-full" />
          </div>
       </div>

       {/* TYPOGRAPHY OVERLAYS */}
       <div className="absolute inset-0 w-full h-full pointer-events-none flex flex-col justify-center px-6 lg:px-16 z-20">
          
          {/* 01 Entry Text */}
          <div className="entry-text absolute top-1/3 left-6 lg:left-16 -translate-y-1/2">
             <div className="font-mono text-xs text-text-muted tracking-widest uppercase mb-6 flex gap-4">
                <span>06 / ThriveForce</span>
                <span className="text-accent">Combat Robotics</span>
             </div>
             <h2 className="font-display text-[4rem] lg:text-[7rem] leading-[0.85] tracking-tighter uppercase text-[#f5ede3]">
                Designed<br/>For Impact.
             </h2>
             <div className="font-mono text-[10px] tracking-widest uppercase mt-8 text-[#e0e0e0]">
                Engineer &bull; Treasurer
             </div>
          </div>

          {/* 02 Machine Intro (Fades in) */}
          <div className="machine-text absolute top-1/3 left-6 lg:left-16 -translate-y-1/2 opacity-0 translate-y-[50px] max-w-md">
             <h3 className="font-display text-4xl lg:text-5xl uppercase tracking-tighter text-[#f5ede3] mb-2">Velociraptor</h3>
             <p className="font-mono text-xs tracking-widest text-accent uppercase mb-6">3 LB / 1.36 KG &bull; Horizontal Undercutter</p>
             <p className="font-mono text-[10px] lg:text-xs text-[#e0e0e0] leading-relaxed uppercase tracking-widest">
                Low-center-of-mass combat robot built around a belt-driven horizontal spinner, structural survivability and serviceability.
             </p>

             {/* Technical Annotations */}
             <div className="mt-12 flex flex-col gap-6">
                 {[
                    "Low C.G. Chassis", 
                    "Symmetrical Drivetrain", 
                    "Modular Internal Layout"
                 ].map((text, i) => (
                    <div key={i} className="flex items-center gap-4">
                       <div className="annotation-line w-0 h-[1px] bg-accent/40 origin-left" style={{ width: '40px' }} />
                       <span className="annotation-text opacity-0 -translate-x-2 font-mono text-[9px] tracking-widest text-text-muted uppercase">
                          {text}
                       </span>
                    </div>
                 ))}
             </div>
          </div>

       </div>
    </section>
  );
};
