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
  const xrayRef = useRef<HTMLDivElement>(null);
  const pointerFrame = useRef(0);
  const [inspecting, setInspecting] = useState(false);
  const transitionRef = useRef<HTMLDivElement>(null);
  
  // DETERMINISTIC SPARKS (No Math.random() for hydration safety)
  const sparks = [
      { id: 1, x2: 605, y2: 432, w: 1.5, length: 153 },
      { id: 2, x2: 654, y2: 489, w: 0.8, length: 151 },
      { id: 3, x2: 578, y2: 456, w: 1.2, length: 119 },
      { id: 4, x2: 668, y2: 501, w: 2.0, length: 159 },
      { id: 5, x2: 593, y2: 524, w: 1.1, length: 81 },
      { id: 6, x2: 627, y2: 415, w: 0.9, length: 180 },
      { id: 7, x2: 541, y2: 472, w: 1.7, length: 90 },
      { id: 8, x2: 650, y2: 442, w: 1.0, length: 175 }
  ];

  useEffect(() => {
      if (!transitionRef.current) return;
      
      const media = gsap.matchMedia();
      media.add("(min-width: 64rem) and (prefers-reduced-motion: no-preference)", () => {
          // The transition scrub timeline
          const tl = gsap.timeline({
              scrollTrigger: {
                  trigger: transitionRef.current,
                  start: "top 60%", // Start when weapon stats come up
                  end: "bottom 80%", // End before weapon stats leave
                  scrub: 0.5
              }
          });
          
          // 1. Weapon Focus / Impact Flash
          tl.set(".impact-fx", { opacity: 1 }, 0)
            .fromTo(".impact-flash", { scale: 0.8, opacity: 0.4 }, { scale: 1.45, opacity: 0, duration: 0.25 }, 0)
            .fromTo(".impact-streak", { strokeDashoffset: 300 }, { strokeDashoffset: 0, duration: 0.15 }, 0)
            .fromTo(".spark-line", { strokeDashoffset: 200 }, { strokeDashoffset: 0, duration: 0.15, stagger: 0.01 }, 0)
            .to(".spark-line", { opacity: 0, duration: 0.05 }, 0.2)
            
            // 2. Materials disappear, wireframe dominates
            .to(".robot-solid", { opacity: 0, duration: 0.4 }, 0.3)
            .fromTo(".robot-wireframe", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.3);
            
      }, containerRef);
      
      media.add("(width < 64rem) and (prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(".robot-wireframe", { opacity: 0.65 }, {
              opacity: 0, duration: 0.85, ease: "power2.out",
              scrollTrigger: { trigger: robotRef.current, start: "top 85%", once: true },
          });
          gsap.from(".robot-solid", {
              opacity: 0.4, duration: 0.85, ease: "power2.out",
              scrollTrigger: { trigger: robotRef.current, start: "top 85%", once: true },
          });
      }, containerRef);
      return () => {
        cancelAnimationFrame(pointerFrame.current);
        media.revert();
      };
  }, []);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!robotRef.current || (e.pointerType === "touch" && !inspecting)) return;
    cancelAnimationFrame(pointerFrame.current);
    const { clientX, clientY } = e;
    pointerFrame.current = requestAnimationFrame(() => {
      const frame = robotRef.current?.getBoundingClientRect();
      const mask = xrayRef.current?.getBoundingClientRect();
      if (!frame || !mask) return;
      xrayRef.current?.style.setProperty("--cursor-x", `${clientX - mask.left}px`);
      xrayRef.current?.style.setProperty("--cursor-y", `${clientY - mask.top}px`);
      gsap.set(crosshairRef.current, { x: clientX - frame.left, y: clientY - frame.top });
    });
  };

  const handlePointerEnter = (e: React.PointerEvent) => {
      if (e.pointerType === "touch") return;
      gsap.to([xrayRef.current, crosshairRef.current], { opacity: 1, duration: 0.3, overwrite: "auto" });
  };

  const handlePointerLeave = (e: React.PointerEvent) => {
      if (e.pointerType === "touch") return;
      gsap.to([xrayRef.current, crosshairRef.current], { opacity: 0, duration: 0.3, overwrite: "auto" });
  };

  return (
    <section ref={containerRef} className="relative w-full bg-background text-text-primary border-b border-white/5 flex flex-col">
       
       {/* SECTION 1 - INTRO */}
       <div className="robot-title portfolio-frame relative">
          <div className="relative z-10">
             <div className="font-mono text-xs text-text-muted tracking-widest uppercase mb-6 flex flex-wrap gap-x-4 gap-y-2">
                <span>Student robotics</span>
                <span className="text-accent">Combat Robotics</span>
             </div>
             <h2 className="robot-chapter-name text-text-primary mb-5">
                Team ThriveForce
             </h2>
             <div className="font-mono text-[10px] tracking-widest uppercase text-[#e0e0e0]">
                I help with design and fabrication, and serve as treasurer.
             </div>
          </div>
       </div>

       {/* SECTION 2 - MACHINE & WEAPON FLOW */}
       <div className="robot-story portfolio-frame relative flex flex-col lg:flex-row">
          
          {/* Left Column - Scrolling Text */}
          <div className="robot-story-text w-full lg:w-1/3 flex flex-col">
             
             {/* Velociraptor Specs */}
             <div className="robot-story-intro flex flex-col justify-center">
                 <h3 className="font-display text-[clamp(30px,3.5vw,52px)] uppercase tracking-tighter text-[#f5ede3] mb-2">Velociraptor</h3>
                 <p className="font-mono text-xs tracking-widest text-accent uppercase mb-6">3 LB / 1.36 KG &bull; Horizontal Undercutter</p>
                 <div className="grid grid-cols-2 gap-3 lg:flex lg:flex-col lg:gap-5">
                     {["Low Center of Mass", "Belt-Driven Weapon", "Symmetrical Drivetrain", "Modular Internal Layout"].map((text, i) => (
                        <div key={i} className="flex items-center gap-4">
                           <div className="w-4 shrink-0 lg:w-12 h-[1px] bg-accent/40" />
                           <span className="font-mono text-[9px] lg:text-[10px] tracking-widest text-text-muted uppercase">{text}</span>
                        </div>
                     ))}
                 </div>
             </div>

             {/* Weapon Specs (Trigger for Transition) */}
             <div ref={transitionRef} className="robot-story-specs flex flex-col justify-center text-left relative">
                 
                 <div className="mb-6 lg:mb-16">
                     <h3 className="font-display text-[clamp(38px,4.5vw,68px)] leading-none tracking-tighter text-[#f5ede3] mb-4">
                         <span className="text-accent">~470</span> J
                     </h3>
                     <p className="font-mono text-xs tracking-widest text-text-muted uppercase">
                         Stored Weapon Energy<br/>Design estimate from the project files
                     </p>
                 </div>
                 <div className="grid grid-cols-2 gap-5 lg:gap-12">
                     {[
                        { val: "0.297 KG", lbl: "Weapon Mass" },
                        { val: "140.6 MM", lbl: "Diameter" },
                        { val: "15.8 MM", lbl: "Bite" },
                        { val: "EN24", lbl: "Hardened Steel" }
                     ].map((stat, i) => (
                         <div key={i} className="stat-item relative pl-4">
                             <div className="absolute left-0 top-1 w-1 h-1 bg-accent/50 rounded-full" />
                             <div className="font-mono text-xl text-[#e0e0e0]">{stat.val}</div>
                             <div className="font-mono text-[9px] tracking-widest text-text-muted uppercase mt-1">{stat.lbl}</div>
                         </div>
                     ))}
                 </div>
             </div>

          </div>

          {/* Right Column - Sticky Visual */}
          <div className="robot-story-visual w-full lg:w-2/3 relative">
              <div className="robot-sticky w-full flex flex-col">
                  
                  <div 
                     ref={robotRef}
                     className="robot-cad relative w-full overflow-hidden flex flex-col items-center justify-center pointer-events-auto"
                     onPointerMove={handlePointerMove}
                     onPointerEnter={handlePointerEnter}
                     onPointerLeave={handlePointerLeave}
                  >
                      {/* Grid / Tech Background */}
                      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                      
                      <div className="absolute top-4 left-3 lg:left-6 font-mono text-[9px] tracking-widest text-text-muted uppercase z-30">Velociraptor CAD</div>
                      <div className="absolute top-4 right-3 lg:right-6 font-mono text-[9px] tracking-widest text-text-muted uppercase z-30">Rendered view</div>
                      <div className="absolute bottom-4 left-3 lg:left-6 font-mono text-[9px] tracking-widest text-text-muted uppercase z-30 max-lg:max-w-[62%]">3 lb undercutter</div>
                      <div className="absolute bottom-4 right-3 lg:right-6 font-mono text-[9px] tracking-widest text-text-muted uppercase z-30">Built</div>

                      {/* SVG Filter for Red Wireframe Effect */}
                      <svg className="hidden">
                          <filter id="cad-wireframe" colorInterpolationFilters="sRGB">
                              {/* Edge detection */}
                              <feConvolveMatrix order="3" preserveAlpha="true" kernelMatrix="-1 -1 -1  -1 8 -1  -1 -1 -1" />
                              {/* Colorize to pure red */}
                              <feColorMatrix type="matrix" values="
                                0.30 0.43 0.13 0 0
                                0.28 0.40 0.12 0 0
                                0.25 0.36 0.11 0 0
                                0 0 0 1 0" />
                          </filter>
                      </svg>
                      
                      {/* Container for the robot, keeping it contained to ~70-80% of the box */}
                      <div className="relative w-[85%] h-[75%] mx-auto my-auto z-10" data-familiar-protect data-familiar-reaction="inspect">
                          
                          {/* Wireframe (Base Layer, revealed when solid fades) */}
                          <div className="robot-wireframe absolute inset-0 w-full h-full opacity-0" style={{ filter: 'url(#cad-wireframe)' }}>
                              <Image src={velociraptorAssets.renders.hero34} alt="" fill sizes="(width < 64rem) 85vw, 54vw" className="object-contain object-center drop-shadow-[0_0_8px_rgba(185,157,141,0.24)]" />
                          </div>

                          {/* Solid Render */}
                          <div className="robot-solid absolute inset-0 w-full h-full">
                              <Image src={velociraptorAssets.renders.hero34} alt="Velociraptor" fill sizes="(width < 64rem) 85vw, 54vw" className="object-contain object-center" />
                          </div>

                          {/* X-Ray Mask Layer */}
                          <div 
                             ref={xrayRef}
                             className={"absolute inset-0 w-full h-full pointer-events-none z-10 " + (inspecting ? "opacity-100 lg:opacity-0" : "opacity-0")}
                             style={{
                                 maskImage: 'radial-gradient(circle 180px at var(--cursor-x, 50%) var(--cursor-y, 50%), black 20%, transparent 80%)',
                                 WebkitMaskImage: 'radial-gradient(circle 180px at var(--cursor-x, 50%) var(--cursor-y, 50%), black 20%, transparent 80%)'
                             }}
                          >
                              <div className="absolute inset-0" style={{ filter: 'url(#cad-wireframe)' }}>
                                  <Image src={velociraptorAssets.renders.hero34} alt="" fill sizes="(width < 64rem) 85vw, 54vw" className="object-contain object-center" />
                              </div>
                              <div className="absolute inset-0 bg-accent/5 mix-blend-screen" />
                          </div>
                      </div>

                      {/* Impact FX overlay (positioned over weapon) */}
                      <div className="impact-fx absolute inset-0 w-full h-full pointer-events-none opacity-0 z-20">
                          <div className="impact-flash absolute left-[30%] top-[70%] size-32 rounded-full bg-[radial-gradient(circle,#9b817626,transparent_68%)] -translate-x-1/2 -translate-y-1/2" />
                          <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 800 800">
                              <line className="impact-streak" x1="50" y1="700" x2="250" y2="560" stroke="var(--accent)" strokeWidth="2" strokeDasharray="100" strokeDashoffset="100" />
                              {sparks.map((spark) => (
                                  <line 
                                     key={spark.id} 
                                     className="spark-line"
                                     x1="250" y1="560" 
                                     x2={spark.x2 - 270} y2={spark.y2} // Adjust coords to match hero34 weapon position
                                     stroke="#ac9b8c"
                                     strokeWidth={spark.w} 
                                     strokeDasharray={200}
                                     strokeDashoffset={200}
                                     opacity="0.52"
                                  />
                              ))}
                          </svg>
                      </div>

                      {/* Crosshair */}
                      <div ref={crosshairRef} className="absolute top-0 left-0 w-8 h-8 pointer-events-none -translate-x-1/2 -translate-y-1/2 opacity-0 z-20">
                         <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-accent/50 -translate-x-1/2" />
                         <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-accent/50 -translate-y-1/2" />
                         <div className="absolute top-1/2 left-1/2 w-1 h-1 border border-accent -translate-x-1/2 -translate-y-1/2 rounded-full" />
                      </div>
                  </div>
                  <button type="button" aria-pressed={inspecting} onClick={() => setInspecting(!inspecting)}
                      className="portfolio-control mt-3 inline-flex min-h-11 w-fit items-center px-4 font-mono text-xs tracking-wider lg:hidden">
                    {inspecting ? "Close wireframe inspection" : "Inspect wireframe"}
                  </button>
              </div>
          </div>

       </div>
    </section>
  );
};
