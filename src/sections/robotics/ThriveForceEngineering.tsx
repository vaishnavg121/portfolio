"use client";
import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { velociraptorAssets } from '../../data/velociraptorAssets';

export const ThriveForceEngineering = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Normal scroll flow for FEA and Powertrain, with a pinned FEA image area
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=300%",
        pin: true,
        scrub: true,
      }
    });

    // FEA 1 (Side Load) -> FEA 2 (Upward Load)
    tl.to(".fea-1", { opacity: 0, y: -20, duration: 1 }, 1)
      .to(".fea-2", { opacity: 1, y: 0, duration: 1 }, 1)
      .to(".text-fea-1", { opacity: 0, x: -20, duration: 0.5 }, 0.8)
      .to(".text-fea-2", { opacity: 1, x: 0, duration: 0.5 }, 1.2);
      
    // FEA -> Powertrain transition
    tl.to(".fea-section", { opacity: 0, scale: 0.95, duration: 1 }, 3)
      .to(".powertrain-section", { opacity: 1, scale: 1, duration: 1 }, 3.5)
      // Line draws down through powertrain
      .fromTo(".powertrain-line", { scaleY: 0 }, { scaleY: 1, duration: 2, ease: "none" }, 3.5)
      .to(".pt-item", { opacity: 1, x: 0, stagger: 0.3, duration: 0.5 }, 3.8);

    // Transition out
    tl.to(".powertrain-section", { opacity: 0, scale: 0.9, duration: 1 }, 7)
      .to(".one-machine-text", { opacity: 1, scale: 1, duration: 0.5 }, 7.5)
      .to(".one-machine-text", { opacity: 0, duration: 0.5 }, 8.5)
      .to(".bigger-team-text", { opacity: 1, duration: 0.5 }, 8.8)
      .to(".team-rule", { scaleX: 1, duration: 1 }, 9);

    return () => {
        tl.kill();
        ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  const handleFEAHover = (e: React.PointerEvent<HTMLDivElement>, labelId: string) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width/2;
      const y = e.clientY - rect.top - rect.height/2;
      gsap.to(e.currentTarget, {
          x: x * 0.02,
          y: y * 0.02,
          duration: 0.5,
          ease: "power2.out"
      });
      gsap.to(`.${labelId}`, { opacity: 1, x: e.clientX - rect.left + 20, y: e.clientY - rect.top + 20, duration: 0.2 });
  };

  const handleFEALeave = (e: React.PointerEvent<HTMLDivElement>, labelId: string) => {
      gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.5, ease: "power2.out" });
      gsap.to(`.${labelId}`, { opacity: 0, duration: 0.2 });
  };

  return (
    <section ref={containerRef} className="relative w-full h-screen bg-[#030303] text-[#f5ede3] overflow-hidden border-b border-white/5">
        
        {/* FEA SECTION */}
        <div className="fea-section absolute inset-0 w-full h-full flex flex-col md:flex-row items-center px-6 lg:px-16">
            
            {/* FEA TEXT */}
            <div className="w-full md:w-1/3 relative h-[300px] flex items-center">
                {/* FEA 1 */}
                <div className="text-fea-1 absolute left-0 w-full">
                    <h3 className="font-mono text-sm tracking-widest text-text-muted uppercase mb-8 border-b border-white/10 pb-4">Side Load Case</h3>
                    <div className="text-accent font-mono text-xl mb-1">2000 N</div>
                    <div className="text-text-muted font-mono text-[10px] tracking-widest uppercase mb-8">Static Load Case</div>
                    
                    <div className="text-[#e0e0e0] font-mono text-3xl mb-1">449 MPa</div>
                    <div className="text-text-muted font-mono text-[10px] tracking-widest uppercase mb-6">Max Von Mises</div>
                    
                    <div className="flex gap-12">
                        <div>
                            <div className="text-[#e0e0e0] font-mono text-xl mb-1">~1.9</div>
                            <div className="text-text-muted font-mono text-[10px] tracking-widest uppercase">Estimated FoS</div>
                        </div>
                        <div>
                            <div className="text-[#e0e0e0] font-mono text-xl mb-1">~0.7 MM</div>
                            <div className="text-text-muted font-mono text-[10px] tracking-widest uppercase">Max Displacement</div>
                        </div>
                    </div>
                </div>

                {/* FEA 2 */}
                <div className="text-fea-2 absolute left-0 w-full opacity-0 translate-x-[20px]">
                    <h3 className="font-mono text-sm tracking-widest text-text-muted uppercase mb-8 border-b border-white/10 pb-4">Upward Load Case</h3>
                    <div className="text-accent font-mono text-xl mb-1">2000 N</div>
                    <div className="text-text-muted font-mono text-[10px] tracking-widest uppercase mb-8">Static Load Case</div>
                    
                    <div className="text-[#e0e0e0] font-mono text-3xl mb-1">208 MPa</div>
                    <div className="text-text-muted font-mono text-[10px] tracking-widest uppercase mb-6">Max Von Mises</div>
                    
                    <div className="flex gap-12">
                        <div>
                            <div className="text-[#e0e0e0] font-mono text-xl mb-1">~4.0</div>
                            <div className="text-text-muted font-mono text-[10px] tracking-widest uppercase">Estimated FoS</div>
                        </div>
                        <div>
                            <div className="text-[#e0e0e0] font-mono text-xl mb-1">~0.1 MM</div>
                            <div className="text-text-muted font-mono text-[10px] tracking-widest uppercase">Max Displacement</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FEA IMAGES */}
            <div className="w-full md:w-2/3 h-[60%] lg:h-[80%] relative ml-0 md:ml-12 border border-white/5 bg-[#050505]">
                <div 
                   className="fea-1 absolute inset-0 w-full h-full p-4"
                   onPointerMove={(e) => handleFEAHover(e, 'cursor-lbl-1')}
                   onPointerLeave={(e) => handleFEALeave(e, 'cursor-lbl-1')}
                >
                    <Image src={velociraptorAssets.fea.sideStress} alt="FEA Side" fill className="object-contain" />
                    <div className="cursor-lbl-1 absolute top-0 left-0 pointer-events-none opacity-0 bg-[#030303]/80 backdrop-blur-sm border border-white/10 px-3 py-1 font-mono text-[9px] text-accent tracking-widest uppercase">FEA / SIDE LOAD</div>
                </div>
                
                <div 
                   className="fea-2 absolute inset-0 w-full h-full p-4 opacity-0 translate-y-[20px]"
                   onPointerMove={(e) => handleFEAHover(e, 'cursor-lbl-2')}
                   onPointerLeave={(e) => handleFEALeave(e, 'cursor-lbl-2')}
                >
                    <Image src={velociraptorAssets.fea.upwardStress} alt="FEA Upward" fill className="object-contain" />
                    <div className="cursor-lbl-2 absolute top-0 left-0 pointer-events-none opacity-0 bg-[#030303]/80 backdrop-blur-sm border border-white/10 px-3 py-1 font-mono text-[9px] text-accent tracking-widest uppercase">FEA / UPWARD LOAD</div>
                </div>
            </div>
        </div>

        {/* POWERTRAIN SECTION */}
        <div className="powertrain-section absolute inset-0 w-full h-full flex flex-col md:flex-row items-center px-6 lg:px-16 opacity-0 scale-105 pointer-events-none">
            <div className="w-full md:w-1/2 h-[80%] relative border border-white/5 bg-[#050505] p-8 overflow-hidden">
                <Image src={velociraptorAssets.renders.top} alt="CAD Top" fill className="object-cover opacity-80" />
                
                {/* Scrolling Background Words */}
                <div className="absolute inset-0 flex flex-col justify-around pointer-events-none mix-blend-overlay opacity-30 -rotate-12 scale-150">
                    {["LOW CENTER OF MASS", "WEIGHT EFFICIENCY", "IMPACT RESISTANCE", "SERVICEABILITY", "MODULAR LAYOUT", "SYMMETRICAL DRIVE"].map((w,i) => (
                        <div key={i} className="font-display text-[6rem] text-white whitespace-nowrap uppercase tracking-tighter">{w}</div>
                    ))}
                </div>
            </div>

            <div className="w-full md:w-1/2 h-[80%] flex flex-col justify-center pl-16 relative">
                <h3 className="font-display text-5xl lg:text-7xl uppercase tracking-tighter text-[#f5ede3] mb-16">
                    Power<br/>To<br/>Weapon.
                </h3>

                <div className="relative pl-8 flex flex-col gap-8">
                    {/* The crimson flow line */}
                    <div className="powertrain-line absolute left-0 top-2 w-[2px] h-[calc(100%-24px)] bg-accent origin-top" />
                    
                    {[
                        { title: "SCORPION", sub: "3S · 1000mAh" },
                        { title: "HOBBYWING", sub: "50A ESC" },
                        { title: "DYS 3530", sub: "1100KV" },
                        { title: "1.7:1", sub: "SPEED INCREASE" },
                        { title: "UNDERCUTTER", sub: "WEAPON" }
                    ].map((item, i) => (
                        <div key={i} className="pt-item opacity-0 translate-x-8 relative">
                            {/* Node dot */}
                            <div className="absolute -left-[37px] top-2 w-3 h-3 rounded-full bg-[#030303] border-2 border-accent" />
                            <div className="font-mono text-xl text-[#e0e0e0] uppercase">{item.title}</div>
                            <div className="font-mono text-[9px] tracking-widest text-text-muted uppercase mt-1">{item.sub}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* TRANSITION TO TEAM */}
        <div className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center z-30">
            <h2 className="one-machine-text opacity-0 scale-95 font-display text-7xl lg:text-[10rem] uppercase tracking-tighter text-[#f5ede3]">
                ONE MACHINE.
            </h2>
            <div className="bigger-team-text absolute inset-0 flex flex-col items-center justify-center opacity-0">
                <h2 className="font-display text-5xl lg:text-7xl uppercase tracking-tighter text-[#f5ede3] mb-8">
                    A MUCH BIGGER TEAM.
                </h2>
                <div className="team-rule w-[80%] h-[1px] bg-accent origin-center scale-x-0" />
            </div>
        </div>

    </section>
  );
};
