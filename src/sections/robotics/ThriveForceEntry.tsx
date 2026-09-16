"use client";
import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { velociraptorAssets } from '../../data/velociraptorAssets';

gsap.registerPlugin(ScrollTrigger);

export const ThriveForceEntry = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const robotRef = useRef<HTMLDivElement>(null);
  const crosshairRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !robotRef.current) return;

    // Scroll sequence
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=150%",
        pin: true,
        scrub: 0.5,
      }
    });

    // Animate text entry -> fade out, then machine intro fades in
    tl.to(".entry-text", { opacity: 0, y: -50, duration: 1 })
      .to(".machine-text", { opacity: 1, y: 0, duration: 1 }, "-=0.5")
      .to(".annotation-line", { scaleX: 1, duration: 0.5, stagger: 0.2 }, "-=0.5")
      .to(".annotation-text", { opacity: 1, x: 0, duration: 0.5, stagger: 0.2 }, "-=0.3")
      // Dissolve solid to wireframe towards the end
      .to(".robot-solid", { opacity: 0, duration: 1.5 }, "+=0.5")
      .to(".robot-wireframe-base", { opacity: 1, duration: 1.5 }, "<")
      // Hide X-ray mask to let full wireframe show
      .to(".robot-xray", { opacity: 0, duration: 0.5 }, "<");

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!robotRef.current) return;
    const rect = robotRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    robotRef.current.style.setProperty('--cursor-x', `${x}px`);
    robotRef.current.style.setProperty('--cursor-y', `${y}px`);

    if (crosshairRef.current) {
        gsap.to(crosshairRef.current, {
            x, y,
            duration: 0.1,
            ease: "power2.out"
        });
    }
  };

  return (
    <section ref={containerRef} className="relative w-full h-screen bg-[#030303] text-[#f5ede3] overflow-hidden border-b border-white/5">
       
       <div 
          ref={robotRef}
          className="absolute inset-0 w-full h-full pointer-events-auto"
          onPointerMove={handlePointerMove}
          onPointerEnter={() => setIsHovering(true)}
          onPointerLeave={() => setIsHovering(false)}
       >
          {/* Base Solid */}
          <div className="robot-solid absolute right-0 top-0 w-full lg:w-[65%] h-full">
              <Image 
                 src={velociraptorAssets.renders.hero34} 
                 alt="Velociraptor Combat Robot" 
                 fill 
                 className="object-cover object-center lg:object-right" 
                 priority
              />
          </div>

          {/* Full Wireframe (fades in on scroll) */}
          <div className="robot-wireframe-base absolute right-0 top-0 w-full lg:w-[65%] h-full opacity-0">
              <Image 
                 src={velociraptorAssets.technical.heroWireframe} 
                 alt="Velociraptor Wireframe" 
                 fill 
                 className="object-cover object-center lg:object-right" 
              />
          </div>

          {/* X-Ray Mask Layer */}
          <div 
             className="robot-xray absolute right-0 top-0 w-full lg:w-[65%] h-full pointer-events-none transition-opacity duration-300"
             style={{
                 opacity: isHovering ? 1 : 0,
                 maskImage: 'radial-gradient(circle 180px at var(--cursor-x, 50%) var(--cursor-y, 50%), black 20%, transparent 80%)',
                 WebkitMaskImage: 'radial-gradient(circle 180px at var(--cursor-x, 50%) var(--cursor-y, 50%), black 20%, transparent 80%)'
             }}
          >
              <Image 
                 src={velociraptorAssets.technical.heroWireframe} 
                 alt="X-ray wireframe" 
                 fill 
                 className="object-cover object-center lg:object-right" 
              />
              {/* Optional technical linework / tint inside x-ray */}
              <div className="absolute inset-0 bg-accent/5 mix-blend-screen" />
          </div>

          {/* Crosshair */}
          <div 
             ref={crosshairRef}
             className="absolute top-0 left-0 w-8 h-8 pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 z-10"
             style={{ opacity: isHovering ? 1 : 0 }}
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
             <h2 className="font-display text-6xl lg:text-[7rem] leading-[0.85] tracking-tighter uppercase text-[#f5ede3]">
                Designed<br/>For Impact.
             </h2>
             <div className="font-mono text-[10px] tracking-widest uppercase mt-8 text-[#e0e0e0]">
                Engineer &bull; Treasurer
             </div>
          </div>

          {/* 02 Machine Intro (Fades in) */}
          <div className="machine-text absolute top-1/3 left-6 lg:left-16 -translate-y-1/2 opacity-0 translate-y-[50px] max-w-md">
             <h3 className="font-display text-5xl lg:text-7xl uppercase tracking-tighter text-[#f5ede3] mb-2">Velociraptor</h3>
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
