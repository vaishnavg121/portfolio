"use client";
import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

export const VelociraptorHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleScroll = (e: CustomEvent<number>) => {
       const prog = e.detail; // 0.0 to 1.0 globally. Act I is 0.0 to 0.4
       
       // Map prog 0.0 -> 0.4 to local 0.0 -> 1.0
       const localProg = Math.max(0, Math.min(1, prog / 0.4));
       
       // Scene timings (local)
       // ENTRY: 0.0 to 0.3
       // REVEAL: 0.2 to 0.6
       // WEAPON: 0.5 to 0.8
       // IMPACT/FREEZE: 0.8+
       
       const entryOpacity = localProg < 0.2 ? 1 : Math.max(0, 1 - (localProg - 0.2) * 10);
       const revealOpacity = localProg < 0.2 ? 0 : localProg < 0.5 ? Math.min(1, (localProg - 0.2) * 5) : Math.max(0, 1 - (localProg - 0.5) * 5);
       const weaponOpacity = localProg < 0.4 ? 0 : localProg < 0.7 ? Math.min(1, (localProg - 0.4) * 5) : Math.max(0, 1 - (localProg - 0.7) * 10);
       
       gsap.to(".text-entry", { opacity: entryOpacity, y: -50 * localProg, duration: 0.1, overwrite: "auto" });
       gsap.to(".text-reveal", { opacity: revealOpacity, y: 50 * (1 - revealOpacity), duration: 0.1, overwrite: "auto" });
       gsap.to(".text-weapon", { opacity: weaponOpacity, y: 50 * (1 - weaponOpacity), duration: 0.1, overwrite: "auto" });
    };
    
    window.addEventListener('robotics-master-scroll', handleScroll as EventListener);
    return () => window.removeEventListener('robotics-master-scroll', handleScroll as EventListener);
  }, []);

  return (
    <div ref={containerRef} className="sticky top-0 w-full h-screen flex flex-col justify-center px-12 pointer-events-none">
       
        <div className="text-entry absolute top-1/2 left-12 -translate-y-1/2">
           <p className="font-mono text-xs text-accent tracking-[0.3em] mb-4">THRIVEFORCE // COMBAT ROBOTICS</p>
           <h2 className="font-display text-7xl md:text-9xl font-bold text-[#f5ede3] leading-[0.85] tracking-tighter uppercase">
             Designed<br/>For<br/>Impact.
           </h2>
        </div>
        
        <div className="text-reveal absolute bottom-24 right-12 text-right opacity-0">
           <h3 className="font-display text-5xl text-[#f5ede3] uppercase tracking-tight">Velociraptor</h3>
           <p className="font-mono text-xs text-text-muted tracking-widest mt-2">3 LB / UNDERCUTTER / HARDENED EN24</p>
        </div>
        
        <div className="text-weapon absolute top-1/2 right-12 -translate-y-1/2 text-right opacity-0">
           <h3 className="font-display text-8xl text-accent font-medium leading-none tracking-tighter">~470 J</h3>
           <p className="font-mono text-[10px] text-text-muted tracking-[0.2em] mt-4 uppercase">Stored Weapon Energy</p>
        </div>
        
    </div>
  );
};
