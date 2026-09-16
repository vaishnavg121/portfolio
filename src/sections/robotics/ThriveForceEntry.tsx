"use client";
import React, { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { velociraptorAssets } from '../../data/velociraptorAssets';

export const ThriveForceEntry = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const robotRef = useRef<HTMLDivElement>(null);
  const crosshairRef = useRef<HTMLDivElement>(null);
  const xrayRef = useRef<HTMLDivElement>(null);

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
    <section ref={containerRef} className="relative w-full bg-[#030303] text-[#f5ede3] border-b border-white/5 flex flex-col">
       
       {/* SECTION 1 - INTRO */}
       <div className="relative w-full h-[80vh] flex items-center px-6 lg:px-16 overflow-hidden">
          {/* Background Technical Grid / Line */}
          <div className="absolute left-6 lg:left-16 top-1/4 bottom-0 w-[1px] bg-accent/20" />
          
          <div className="relative z-10">
             <div className="font-mono text-xs text-text-muted tracking-widest uppercase mb-6 flex gap-4">
                <span>06 / ThriveForce</span>
                <span className="text-accent">Combat Robotics</span>
             </div>
             <h2 className="font-display text-[clamp(64px,8vw,130px)] leading-[0.85] tracking-tighter uppercase text-[#f5ede3] mb-8">
                Designed<br/>For Impact.
             </h2>
             <div className="font-mono text-[10px] tracking-widest uppercase text-[#e0e0e0]">
                Engineer &bull; Treasurer
             </div>
          </div>
       </div>

       {/* SECTION 2 - VELOCIRAPTOR */}
       <div className="relative w-full min-h-screen flex flex-col lg:flex-row items-center px-6 lg:px-16 py-24 gap-12 lg:gap-24">
          
          <div className="w-full lg:w-1/3 flex flex-col">
             <h3 className="font-display text-[clamp(30px,3.5vw,52px)] uppercase tracking-tighter text-[#f5ede3] mb-2">Velociraptor</h3>
             <p className="font-mono text-xs tracking-widest text-accent uppercase mb-12">3 LB / 1.36 KG &bull; Horizontal Undercutter</p>
             
             {/* Technical Annotations */}
             <div className="flex flex-col gap-8">
                 {[
                    "Low Center of Mass", 
                    "Belt-Driven Weapon",
                    "Symmetrical Drivetrain", 
                    "Modular Internal Layout"
                 ].map((text, i) => (
                    <div key={i} className="flex items-center gap-4">
                       <div className="w-12 h-[1px] bg-accent/40" />
                       <span className="font-mono text-[9px] lg:text-[10px] tracking-widest text-text-muted uppercase">
                          {text}
                       </span>
                    </div>
                 ))}
             </div>
          </div>

          <div 
             ref={robotRef}
             className="w-full lg:w-2/3 h-[50vh] lg:h-[70vh] relative border border-white/10 rounded-sm overflow-hidden bg-[#050505] p-8"
             onPointerMove={handlePointerMove}
             onPointerEnter={handlePointerEnter}
             onPointerLeave={handlePointerLeave}
          >
              <div className="absolute bottom-4 right-8 font-mono text-[9px] tracking-widest text-text-muted uppercase z-30">VELOCIRAPTOR / CAD</div>
              
              {/* Image 1: Base Render */}
              <div className="absolute inset-0 w-full h-full">
                  <Image 
                     src={velociraptorAssets.renders.hero34} 
                     alt="Velociraptor" 
                     fill 
                     className="object-contain object-center scale-110" 
                     priority
                  />
              </div>

              {/* X-Ray Mask Layer */}
              <div 
                 ref={xrayRef}
                 className="absolute inset-0 w-full h-full pointer-events-none opacity-0 z-10"
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
       </div>

    </section>
  );
};
