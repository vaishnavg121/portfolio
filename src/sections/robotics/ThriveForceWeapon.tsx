"use client";
import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { velociraptorAssets } from '../../data/velociraptorAssets';

export const ThriveForceWeapon = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const weaponRef = useRef<HTMLDivElement>(null);
  const arcRef = useRef<SVGSVGElement>(null);

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
    if (!containerRef.current) return;
    
    const ctx = gsap.context(() => {
        // Master timeline tied directly to scroll progress (scrubbable, fully reversible)
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "+=120%",
            pin: true,
            scrub: 0.5,
          }
        });

        tl.fromTo(".weapon-img-container", { scale: 0.9, x: "10%", y: "10%" }, { scale: 1.1, x: "-5%", y: "-5%", duration: 1 })
          .to(".energy-title", { opacity: 1, x: 0, duration: 0.2 }, 0.2)
          .to(".stat-item", { opacity: 1, x: 0, duration: 0.3, stagger: 0.1 }, 0.4)
          // ------------------------------------------
          // SCRUBBABLE IMPACT (Triggers around 0.8)
          // ------------------------------------------
          // 1. Camera Impulse
          .to(containerRef.current, { x: -8, y: 4, duration: 0.05, ease: "power1.inOut" }, 0.8)
          .to(containerRef.current, { x: 0, y: 0, duration: 0.05, ease: "power1.inOut" }, 0.85)
          // 2. Flash
          .set(".impact-fx", { opacity: 1 }, 0.8)
          .fromTo(".impact-flash", { scale: 0.5, opacity: 1 }, { scale: 2, opacity: 0, duration: 0.2 }, 0.8)
          // 3. Main Streak
          .fromTo(".impact-streak", { strokeDashoffset: 300 }, { strokeDashoffset: 0, duration: 0.15 }, 0.8)
          // 4. Sparks (shoot out and fade)
          .fromTo(".spark-line", { strokeDashoffset: 200 }, { strokeDashoffset: 0, duration: 0.15, stagger: 0.01 }, 0.8)
          .to(".spark-line", { opacity: 0, duration: 0.05 }, 0.95)
          // 5. Typography handoff
          .to(".weapon-stats-group", { opacity: 0.1, duration: 0.2 }, 0.8)
          .fromTo(".engineering-hit-text", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.2 }, 0.85);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handlePointerMove = (e: React.PointerEvent) => {
      if (!weaponRef.current || !arcRef.current) return;
      const rect = weaponRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width/2;
      const y = e.clientY - rect.top - rect.height/2;
      const angle = Math.atan2(y, x) * (180 / Math.PI);
      gsap.to(arcRef.current, { rotation: angle, transformOrigin: "center center", duration: 0.1, ease: "none", overwrite: "auto" });
  };

  return (
    <section ref={containerRef} className="relative w-full h-screen bg-[#030303] text-[#f5ede3] overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center lg:justify-start lg:pl-[10%]">
            
            {/* Weapon Image Container */}
            <div 
               ref={weaponRef}
               className="weapon-img-container relative w-[800px] h-[800px] pointer-events-auto"
               onPointerMove={handlePointerMove}
            >
                <Image 
                   src={velociraptorAssets.parts.weaponClose} 
                   alt="Weapon Close Up" 
                   fill 
                   className="object-contain" 
                />
                
                {/* Interactive SVG Arc */}
                <svg ref={arcRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-50 mix-blend-screen" viewBox="0 0 800 800">
                    <circle cx="400" cy="400" r="180" fill="none" stroke="#cc3333" strokeWidth="1" strokeDasharray="10 20" opacity="0.3" />
                    <path d="M 580 400 A 180 180 0 0 1 400 580" fill="none" stroke="#f5ede3" strokeWidth="2" opacity="0.6" />
                    <polygon points="395,575 405,580 395,585" fill="#f5ede3" />
                </svg>

                {/* Impact FX overlay */}
                <div className="impact-fx absolute inset-0 w-full h-full pointer-events-none opacity-0">
                    <div className="impact-flash absolute left-[65%] top-[70%] w-32 h-32 bg-white rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 mix-blend-screen" />
                    <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 800 800">
                        <line className="impact-streak" x1="100" y1="900" x2="520" y2="560" stroke="#cc3333" strokeWidth="2" strokeDasharray="100" strokeDashoffset="100" />
                        {/* Sparks */}
                        {sparks.map((spark) => (
                            <line 
                               key={spark.id} 
                               className="spark-line"
                               x1="520" y1="560" 
                               x2={spark.x2} y2={spark.y2} 
                               stroke="#f5ede3" 
                               strokeWidth={spark.w} 
                               strokeDasharray={200}
                               strokeDashoffset={200}
                               opacity="0.8" 
                            />
                        ))}
                    </svg>
                </div>
            </div>
        </div>

        {/* TYPOGRAPHY */}
        <div className="weapon-stats-group absolute inset-0 w-full h-full pointer-events-none flex flex-col justify-center px-6 lg:px-24 items-end">
            
            <div className="energy-title opacity-0 translate-x-12 mb-12 text-right">
                <h3 className="font-display text-8xl lg:text-[9rem] leading-none tracking-tighter text-[#f5ede3]">
                    <span className="text-accent">~470</span> J
                </h3>
                <p className="font-mono text-xs tracking-widest text-text-muted uppercase mt-2">
                    Stored Weapon Energy<br/>Repository Design Value
                </p>
            </div>

            <div className="grid grid-cols-2 gap-x-16 gap-y-8 text-right">
                {[
                   { val: "0.297 KG", lbl: "Weapon Mass" },
                   { val: "140.6 MM", lbl: "Diameter" },
                   { val: "15.8 MM", lbl: "Bite" },
                   { val: "EN24", lbl: "Hardened Steel" }
                ].map((stat, i) => (
                    <div key={i} className="stat-item opacity-0 translate-x-8">
                        <div className="font-mono text-xl text-[#e0e0e0]">{stat.val}</div>
                        <div className="font-mono text-[9px] tracking-widest text-text-muted uppercase mt-1">{stat.lbl}</div>
                    </div>
                ))}
            </div>
            
        </div>

        {/* ENGINEERING THE HIT TEXT */}
        <div className="engineering-hit-text absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 translate-y-[30px] z-30 mix-blend-difference">
            <h2 className="font-display text-[8rem] lg:text-[12rem] text-white uppercase tracking-tighter leading-none text-center">
                Engineering<br/>The Hit.
            </h2>
        </div>
    </section>
  );
};
