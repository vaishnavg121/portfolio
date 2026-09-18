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
      
      const ctx = gsap.context(() => {
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
            .fromTo(".impact-flash", { scale: 0.5, opacity: 1 }, { scale: 2.5, opacity: 0, duration: 0.2 }, 0)
            .fromTo(".impact-streak", { strokeDashoffset: 300 }, { strokeDashoffset: 0, duration: 0.15 }, 0)
            .fromTo(".spark-line", { strokeDashoffset: 200 }, { strokeDashoffset: 0, duration: 0.15, stagger: 0.01 }, 0)
            .to(".spark-line", { opacity: 0, duration: 0.05 }, 0.2)
            
            // 2. Materials disappear, wireframe dominates
            .to(".robot-solid", { opacity: 0, duration: 0.4 }, 0.3)
            .fromTo(".robot-wireframe", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.3);
            
      }, transitionRef);
      
      return () => ctx.revert();
  }, []);

  const handlePointerMove = (e: React.PointerEvent) => {
    // Only update CSS variables on the container to avoid React state lag
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

       {/* SECTION 2 - MACHINE & WEAPON FLOW */}
       <div className="relative w-full flex flex-col lg:flex-row px-6 lg:px-16">
          
          {/* Left Column - Scrolling Text */}
          <div className="w-full lg:w-1/3 flex flex-col pt-24 pb-32">
             
             {/* Velociraptor Specs */}
             <div className="min-h-screen flex flex-col justify-center">
                 <h3 className="font-display text-[clamp(30px,3.5vw,52px)] uppercase tracking-tighter text-[#f5ede3] mb-2">Velociraptor</h3>
                 <p className="font-mono text-xs tracking-widest text-accent uppercase mb-12">3 LB / 1.36 KG &bull; Horizontal Undercutter</p>
                 <div className="flex flex-col gap-8">
                     {["Low Center of Mass", "Belt-Driven Weapon", "Symmetrical Drivetrain", "Modular Internal Layout"].map((text, i) => (
                        <div key={i} className="flex items-center gap-4">
                           <div className="w-12 h-[1px] bg-accent/40" />
                           <span className="font-mono text-[9px] lg:text-[10px] tracking-widest text-text-muted uppercase">{text}</span>
                        </div>
                     ))}
                 </div>
             </div>

             {/* Weapon Specs (Trigger for Transition) */}
             <div ref={transitionRef} className="min-h-screen flex flex-col justify-center text-left relative">
                 <div className="absolute -left-6 lg:-left-16 top-0 bottom-0 w-[1px] bg-accent/20 origin-top" />
                 
                 <div className="mb-16">
                     <h3 className="font-display text-[clamp(38px,4.5vw,68px)] leading-none tracking-tighter text-[#f5ede3] mb-4">
                         <span className="text-accent">~470</span> J
                     </h3>
                     <p className="font-mono text-xs tracking-widest text-text-muted uppercase">
                         Stored Weapon Energy<br/>Repository Design Value
                     </p>
                 </div>
                 <div className="grid grid-cols-2 gap-x-12 gap-y-12">
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
          <div className="w-full lg:w-2/3 relative h-[50vh] lg:h-auto">
              <div className="lg:sticky top-0 h-[50vh] lg:h-screen w-full flex flex-col justify-center p-8">
                  
                  <div 
                     ref={robotRef}
                     className="relative w-full h-[80%] border border-white/5 rounded-sm overflow-hidden bg-[#020202] flex flex-col items-center justify-center pointer-events-auto"
                     onPointerMove={handlePointerMove}
                     onPointerEnter={handlePointerEnter}
                     onPointerLeave={handlePointerLeave}
                  >
                      {/* Grid / Tech Background */}
                      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                      
                      <div className="absolute top-4 left-6 font-mono text-[9px] tracking-widest text-text-muted uppercase z-30">VELOCIRAPTOR / CAD</div>
                      <div className="absolute top-4 right-6 font-mono text-[9px] tracking-widest text-text-muted uppercase z-30">03/TF</div>
                      <div className="absolute bottom-4 left-6 font-mono text-[9px] tracking-widest text-text-muted uppercase z-30">3 LB UNDERCUTTER &middot; ENGINEERED SYSTEM</div>
                      <div className="absolute bottom-4 right-6 font-mono text-[9px] tracking-widest text-text-muted uppercase z-30">VERIFIED</div>

                      {/* SVG Filter for Red Wireframe Effect */}
                      <svg className="hidden">
                          <filter id="red-wireframe" colorInterpolationFilters="sRGB">
                              {/* Edge detection */}
                              <feConvolveMatrix order="3" preserveAlpha="true" kernelMatrix="-1 -1 -1  -1 8 -1  -1 -1 -1" />
                              {/* Colorize to pure red */}
                              <feColorMatrix type="matrix" values="
                                1 1 1 0 0
                                0 0 0 0 0
                                0 0 0 0 0
                                0 0 0 1 0" />
                          </filter>
                      </svg>
                      
                      {/* Container for the robot, keeping it contained to ~70-80% of the box */}
                      <div className="relative w-[85%] h-[75%] mx-auto my-auto z-10" data-familiar-protect data-familiar-reaction="inspect">
                          
                          {/* Wireframe (Base Layer, revealed when solid fades) */}
                          <div className="robot-wireframe absolute inset-0 w-full h-full opacity-0" style={{ filter: 'url(#red-wireframe)' }}>
                              <Image src={velociraptorAssets.renders.hero34} alt="Velociraptor Wireframe" fill className="object-contain object-center drop-shadow-[0_0_8px_rgba(204,51,51,0.4)]" />
                          </div>

                          {/* Solid Render */}
                          <div className="robot-solid absolute inset-0 w-full h-full">
                              <Image src={velociraptorAssets.renders.hero34} alt="Velociraptor" fill className="object-contain object-center" priority />
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
                              <div className="absolute inset-0" style={{ filter: 'url(#red-wireframe)' }}>
                                  <Image src={velociraptorAssets.renders.hero34} alt="X-ray wireframe" fill className="object-contain object-center" />
                              </div>
                              <div className="absolute inset-0 bg-accent/5 mix-blend-screen" />
                          </div>
                      </div>

                      {/* Impact FX overlay (positioned over weapon) */}
                      <div className="impact-fx absolute inset-0 w-full h-full pointer-events-none opacity-0 z-20">
                          <div className="impact-flash absolute left-[30%] top-[70%] w-32 h-32 bg-white rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 mix-blend-screen" />
                          <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 800 800">
                              <line className="impact-streak" x1="50" y1="700" x2="250" y2="560" stroke="#cc3333" strokeWidth="2" strokeDasharray="100" strokeDashoffset="100" />
                              {sparks.map((spark) => (
                                  <line 
                                     key={spark.id} 
                                     className="spark-line"
                                     x1="250" y1="560" 
                                     x2={spark.x2 - 270} y2={spark.y2} // Adjust coords to match hero34 weapon position
                                     stroke="#f5ede3" 
                                     strokeWidth={spark.w} 
                                     strokeDasharray={200}
                                     strokeDashoffset={200}
                                     opacity="0.8" 
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

              </div>
          </div>

       </div>
    </section>
  );
};
