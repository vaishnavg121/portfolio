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
    
    const ctx = gsap.context(() => {
        // Powertrain line flows down naturally with scroll
        gsap.fromTo(".powertrain-line", 
            { scaleY: 0 },
            {
                scaleY: 1,
                ease: "none",
                scrollTrigger: {
                    trigger: ".powertrain-section",
                    start: "top center",
                    end: "bottom center",
                    scrub: true
                }
            }
        );

        // Powertrain nodes appear smoothly
        gsap.fromTo(".pt-item", 
            { opacity: 0, x: -20 },
            {
                opacity: 1, x: 0,
                stagger: 0.1,
                ease: "power1.out",
                scrollTrigger: {
                    trigger: ".powertrain-section",
                    start: "top center",
                    end: "center center",
                    scrub: 1
                }
            }
        );

        // Team Transition Rule
        gsap.fromTo(".team-rule",
            { scaleX: 0 },
            {
                scaleX: 1,
                ease: "none",
                scrollTrigger: {
                    trigger: ".transition-section",
                    start: "center bottom",
                    end: "center center",
                    scrub: true
                }
            }
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleFEAHover = (e: React.PointerEvent<HTMLDivElement>, labelId: string) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width/2;
      const y = e.clientY - rect.top - rect.height/2;
      gsap.to(e.currentTarget.querySelector('img'), {
          x: x * 0.02,
          y: y * 0.02,
          duration: 0.5,
          ease: "power2.out",
          overwrite: "auto"
      });
      gsap.to(`.${labelId}`, { opacity: 1, x: e.clientX - rect.left + 20, y: e.clientY - rect.top + 20, duration: 0.2, overwrite: "auto" });
  };

  const handleFEALeave = (e: React.PointerEvent<HTMLDivElement>, labelId: string) => {
      gsap.to(e.currentTarget.querySelector('img'), { x: 0, y: 0, duration: 0.5, ease: "power2.out", overwrite: "auto" });
      gsap.to(`.${labelId}`, { opacity: 0, duration: 0.2, overwrite: "auto" });
  };

  return (
    <section ref={containerRef} className="relative w-full bg-[#030303] text-[#f5ede3] border-b border-white/5 flex flex-col gap-32 pt-24 pb-32">
        
        {/* FEA SECTION 1 - SIDE LOAD */}
        <div className="w-full flex flex-col md:flex-row items-center px-6 lg:px-16">
            <div className="w-full md:w-1/3 mb-12 md:mb-0">
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
            <div 
               className="w-full md:w-2/3 h-[50vh] relative ml-0 md:ml-12 border border-white/5 bg-[#050505] overflow-hidden"
               onPointerMove={(e) => handleFEAHover(e, 'cursor-lbl-1')}
               onPointerLeave={(e) => handleFEALeave(e, 'cursor-lbl-1')}
            >
                <Image src={velociraptorAssets.fea.sideStress} alt="FEA Side" fill className="object-contain p-4 transition-transform duration-1000" />
                <div className="cursor-lbl-1 absolute top-0 left-0 pointer-events-none opacity-0 bg-[#030303]/80 backdrop-blur-sm border border-white/10 px-3 py-1 font-mono text-[9px] text-accent tracking-widest uppercase z-10">FEA / SIDE LOAD</div>
            </div>
        </div>

        {/* FEA SECTION 2 - UPWARD LOAD */}
        <div className="w-full flex flex-col md:flex-row items-center px-6 lg:px-16">
            <div className="w-full md:w-1/3 mb-12 md:mb-0">
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
            <div 
               className="w-full md:w-2/3 h-[50vh] relative ml-0 md:ml-12 border border-white/5 bg-[#050505] overflow-hidden"
               onPointerMove={(e) => handleFEAHover(e, 'cursor-lbl-2')}
               onPointerLeave={(e) => handleFEALeave(e, 'cursor-lbl-2')}
            >
                <Image src={velociraptorAssets.fea.upwardStress} alt="FEA Upward" fill className="object-contain p-4 transition-transform duration-1000" />
                <div className="cursor-lbl-2 absolute top-0 left-0 pointer-events-none opacity-0 bg-[#030303]/80 backdrop-blur-sm border border-white/10 px-3 py-1 font-mono text-[9px] text-accent tracking-widest uppercase z-10">FEA / UPWARD LOAD</div>
            </div>
        </div>

        {/* POWERTRAIN SECTION */}
        <div className="powertrain-section w-full flex flex-col md:flex-row items-center px-6 lg:px-16 mt-16">
            <div className="w-full md:w-1/2 h-[60vh] relative border border-white/5 bg-[#050505] p-8 overflow-hidden">
                <Image src={velociraptorAssets.renders.top} alt="CAD Top" fill className="object-cover opacity-80" />
                <div className="absolute inset-0 flex flex-col justify-around pointer-events-none mix-blend-overlay opacity-20 -rotate-12 scale-150">
                    {["LOW CENTER OF MASS", "WEIGHT EFFICIENCY", "IMPACT RESISTANCE", "SERVICEABILITY", "MODULAR LAYOUT", "SYMMETRICAL DRIVE"].map((w,i) => (
                        <div key={i} className="font-display text-[6rem] text-white whitespace-nowrap uppercase tracking-tighter">{w}</div>
                    ))}
                </div>
            </div>

            <div className="w-full md:w-1/2 flex flex-col justify-center pl-0 md:pl-16 mt-12 md:mt-0 relative">
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
                        <div key={i} className="pt-item relative">
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
        <div className="transition-section w-full flex flex-col items-center justify-center mt-32 px-6">
            <h2 className="font-display text-5xl md:text-7xl lg:text-[9rem] uppercase tracking-tighter text-[#f5ede3] mb-4 text-center">
                ONE MACHINE.
            </h2>
            <h2 className="font-display text-3xl md:text-5xl lg:text-7xl uppercase tracking-tighter text-[#888] mb-12 text-center">
                A MUCH BIGGER TEAM.
            </h2>
            <div className="team-rule w-[80%] md:w-[60%] h-[1px] bg-accent origin-center" />
        </div>

    </section>
  );
};
