"use client";
import React, { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { velociraptorAssets } from '../../data/velociraptorAssets';

export const ThriveForceWeapon = () => {
  const weaponRef = useRef<HTMLDivElement>(null);
  const arcRef = useRef<SVGSVGElement>(null);

  const handlePointerMove = (e: React.PointerEvent) => {
      if (!weaponRef.current || !arcRef.current) return;
      const rect = weaponRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width/2;
      const y = e.clientY - rect.top - rect.height/2;
      const angle = Math.atan2(y, x) * (180 / Math.PI);
      gsap.to(arcRef.current, { rotation: angle, transformOrigin: "center center", duration: 0.1, ease: "none", overwrite: "auto" });
  };

  return (
    <section className="relative w-full min-h-screen bg-[#030303] text-[#f5ede3] border-b border-white/5 flex flex-col lg:flex-row items-center px-6 lg:px-16 py-24 gap-12 overflow-hidden">
        
        {/* Left Column - Weapon Visual */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative">
            <div 
               ref={weaponRef}
               className="relative w-full max-w-[600px] aspect-square pointer-events-auto cursor-crosshair"
               onPointerMove={handlePointerMove}
            >
                {/* Background Tech Grid */}
                <div className="absolute inset-0 w-full h-full border border-white/5 bg-[#050505] rounded-full opacity-50" />
                
                <Image 
                   src={velociraptorAssets.parts.weaponClose} 
                   alt="Weapon Close Up" 
                   fill 
                   className="object-contain p-8 lg:p-16 mix-blend-screen" 
                />
                
                {/* Interactive SVG Arc */}
                <svg ref={arcRef} className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen opacity-70" viewBox="0 0 800 800">
                    <circle cx="400" cy="400" r="240" fill="none" stroke="#cc3333" strokeWidth="1" strokeDasharray="10 20" opacity="0.3" />
                    <path d="M 640 400 A 240 240 0 0 1 400 640" fill="none" stroke="#f5ede3" strokeWidth="2" opacity="0.6" />
                    <polygon points="395,635 405,640 395,645" fill="#f5ede3" />
                </svg>

                {/* Connection Line to next section */}
                <div className="absolute top-[85%] left-1/2 w-[1px] h-[50vh] bg-accent/20" />
            </div>
        </div>

        {/* Right Column - Typography & Specs */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center text-left">
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
    </section>
  );
};
