"use client";
import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { velociraptorAssets } from '../../data/velociraptorAssets';

gsap.registerPlugin(ScrollTrigger);

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
    <section ref={containerRef} className="relative w-full bg-[#030303] text-[#f5ede3] border-b border-white/5 flex flex-col gap-9 py-12 lg:gap-16 lg:pt-24 lg:pb-16">
        
        {/* HEADER */}
        <div className="w-full px-5 lg:px-16 mb-4">
            <h2 className="font-display text-[clamp(32px,4vw,58px)] text-white uppercase tracking-tighter">
                Engineering The Hit.
            </h2>
        </div>

        {/* FEA SECTIONS */}
        <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12 px-5 lg:px-16">
            
            {/* SIDE LOAD */}
            <div className="w-full lg:w-1/2 flex flex-col">
                <div 
                   className="w-full h-[clamp(12rem,58vw,22rem)] lg:h-[40vh] relative border border-white/5 bg-[#050505] overflow-hidden mb-6"
                   onPointerMove={(e) => handleFEAHover(e, 'cursor-lbl-1')}
                   onPointerLeave={(e) => handleFEALeave(e, 'cursor-lbl-1')}
                >
                    <Image src={velociraptorAssets.fea.sideStress} alt="FEA Side" fill className="object-contain p-4 transition-transform duration-1000" />
                    <div className="cursor-lbl-1 absolute top-0 left-0 pointer-events-none opacity-0 bg-[#030303]/80 backdrop-blur-sm border border-white/10 px-3 py-1 font-mono text-[9px] text-accent tracking-widest uppercase z-10">SIDE LOAD</div>
                </div>
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                    <div>
                        <div className="text-accent font-mono text-sm mb-1">2000 N</div>
                        <div className="text-text-muted font-mono text-[9px] tracking-widest uppercase">Side Load</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[#e0e0e0] font-mono text-xl mb-1">449 MPa</div>
                        <div className="text-text-muted font-mono text-[9px] tracking-widest uppercase">Max Von Mises</div>
                    </div>
                    <div className="text-right hidden sm:block">
                        <div className="text-[#e0e0e0] font-mono text-xl mb-1">~1.9 FoS</div>
                        <div className="text-text-muted font-mono text-[9px] tracking-widest uppercase">~0.7mm Disp</div>
                    </div>
                </div>
            </div>

            {/* UPWARD LOAD */}
            <div className="w-full lg:w-1/2 flex flex-col">
                <div 
                   className="w-full h-[clamp(12rem,58vw,22rem)] lg:h-[40vh] relative border border-white/5 bg-[#050505] overflow-hidden mb-6"
                   onPointerMove={(e) => handleFEAHover(e, 'cursor-lbl-2')}
                   onPointerLeave={(e) => handleFEALeave(e, 'cursor-lbl-2')}
                >
                    <Image src={velociraptorAssets.fea.upwardStress} alt="FEA Upward" fill className="object-contain p-4 transition-transform duration-1000" />
                    <div className="cursor-lbl-2 absolute top-0 left-0 pointer-events-none opacity-0 bg-[#030303]/80 backdrop-blur-sm border border-white/10 px-3 py-1 font-mono text-[9px] text-accent tracking-widest uppercase z-10">UPWARD LOAD</div>
                </div>
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                    <div>
                        <div className="text-accent font-mono text-sm mb-1">2000 N</div>
                        <div className="text-text-muted font-mono text-[9px] tracking-widest uppercase">Upward Load</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[#e0e0e0] font-mono text-xl mb-1">208 MPa</div>
                        <div className="text-text-muted font-mono text-[9px] tracking-widest uppercase">Max Von Mises</div>
                    </div>
                    <div className="text-right hidden sm:block">
                        <div className="text-[#e0e0e0] font-mono text-xl mb-1">~4.0 FoS</div>
                        <div className="text-text-muted font-mono text-[9px] tracking-widest uppercase">~0.1mm Disp</div>
                    </div>
                </div>
            </div>
            
        </div>

        {/* POWERTRAIN SECTION */}
        <div className="powertrain-section w-full px-5 lg:px-16 mt-8">
            <h3 className="font-display text-[clamp(24px,3vw,42px)] uppercase tracking-tighter text-[#f5ede3] mb-8">
                Power To Weapon.
            </h3>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between relative border border-white/5 bg-[#050505] p-6 lg:p-12">
                {/* Horizontal flow line for desktop, vertical for mobile */}
                <div className="powertrain-line hidden md:block absolute top-1/2 left-12 w-[calc(100%-96px)] h-[1px] bg-accent/30 -translate-y-1/2 origin-left" />
                <div className="powertrain-line md:hidden absolute left-[35px] top-6 w-[1px] h-[calc(100%-48px)] bg-accent/30 origin-top" />
                
                {[
                    { title: "3S 1000mAh", sub: "LiPo" },
                    { title: "Hobbywing", sub: "50A ESC" },
                    { title: "DYS 3530", sub: "1100KV" },
                    { title: "1.7:1", sub: "Increase" },
                    { title: "470 J", sub: "Design Energy" }
                ].map((item, i) => (
                    <div key={i} className="pt-item relative bg-[#050505] z-10 px-4 md:px-6 py-4 md:py-0 w-full md:w-auto text-left md:text-center">
                        <div className="absolute left-0 md:left-1/2 top-1/2 md:-top-4 w-2 h-2 rounded-full bg-accent -translate-y-1/2 md:translate-y-0 md:-translate-x-1/2" />
                        <div className="font-mono text-sm lg:text-base text-[#e0e0e0] uppercase ml-6 md:ml-0 mt-0 md:mt-6">{item.title}</div>
                        <div className="font-mono text-[9px] tracking-widest text-text-muted uppercase ml-6 md:ml-0 mt-1">{item.sub}</div>
                    </div>
                ))}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 border-t border-white/5 pt-8">
                <div className="text-left md:text-center">
                    <div className="text-[#e0e0e0] font-mono text-xl mb-1">0.297 kg</div>
                    <div className="text-text-muted font-mono text-[9px] tracking-widest uppercase">Weapon Mass</div>
                </div>
                <div className="text-left md:text-center">
                    <div className="text-[#e0e0e0] font-mono text-xl mb-1">140.6 mm</div>
                    <div className="text-text-muted font-mono text-[9px] tracking-widest uppercase">Diameter</div>
                </div>
                <div className="text-left md:text-center">
                    <div className="text-[#e0e0e0] font-mono text-xl mb-1">15.8 mm</div>
                    <div className="text-text-muted font-mono text-[9px] tracking-widest uppercase">Bite</div>
                </div>
                <div className="text-left md:text-center">
                    <div className="text-[#e0e0e0] font-mono text-xl mb-1">4.629e-4</div>
                    <div className="text-text-muted font-mono text-[9px] tracking-widest uppercase">Izz (kg·m²)</div>
                </div>
            </div>
        </div>

    </section>
  );
};
