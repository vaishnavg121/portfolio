"use client";
import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import Image from 'next/image';
import { velociraptorAssets } from '../../data/velociraptorAssets';

export const VelociraptorHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleScroll = (e: CustomEvent<number>) => {
       const prog = e.detail; // 0.0 to 1.0 globally. Act I is 0.0 to 0.4
       
       const localProg = Math.max(0, Math.min(1, prog / 0.4));
       
       const entryOpacity = localProg < 0.2 ? 1 : Math.max(0, 1 - (localProg - 0.2) * 10);
       const weaponOpacity = localProg < 0.4 ? 0 : localProg < 0.7 ? Math.min(1, (localProg - 0.4) * 5) : Math.max(0, 1 - (localProg - 0.7) * 10);
       
       gsap.to(".text-entry", { opacity: entryOpacity, y: -50 * localProg, duration: 0.1, overwrite: "auto" });
       gsap.to(".text-weapon-stats", { opacity: weaponOpacity, y: 50 * (1 - weaponOpacity), duration: 0.1, overwrite: "auto" });
       
       // Static hero fade out when 3D takes over (around 0.05)
       const staticOp = localProg < 0.05 ? 1 : Math.max(0, 1 - (localProg - 0.05) * 20);
       gsap.to(".static-hero", { opacity: staticOp, duration: 0.1, overwrite: "auto" });
    };
    
    window.addEventListener('robotics-master-scroll', handleScroll as EventListener);
    return () => window.removeEventListener('robotics-master-scroll', handleScroll as EventListener);
  }, []);

  return (
    <div ref={containerRef} className="sticky top-0 w-full h-screen flex flex-col justify-center px-6 md:px-12 pointer-events-none z-10">
       
        {/* STATIC FALLBACK HERO - Aligned exactly with 3D canvas */}
        <div className="static-hero absolute inset-0 w-full h-full pointer-events-none -z-10">
            <Image 
               src={velociraptorAssets.renders.hero34} 
               alt="Velociraptor Combat Robot" 
               fill 
               className="object-cover"
               priority
            />
        </div>
        
        {/* ENTRY TEXT */}
        <div className="text-entry absolute top-1/3 left-6 md:left-12 -translate-y-1/2 max-w-2xl">
           <p className="font-mono text-[10px] md:text-xs text-accent tracking-[0.3em] mb-4 uppercase">
              ThriveForce // Combat Robotics <span className="ml-4 text-text-muted">Engineer &bull; Treasurer</span>
           </p>
           <h2 className="font-display text-6xl md:text-8xl font-bold text-[#f5ede3] leading-[0.85] tracking-tighter uppercase">
             Designed<br/>For<br/>Impact.
           </h2>
        </div>
        
        {/* WEAPON STATS - Tied visually to the right side where the weapon swings */}
        <div className="text-weapon-stats absolute top-1/2 right-12 lg:right-32 -translate-y-1/2 text-right opacity-0 flex flex-col items-end">
           {/* Technical Leader Line */}
           <div className="w-32 h-[1px] bg-accent/50 mb-2 relative right-full top-6" />
           <h3 className="font-display text-7xl md:text-8xl text-[#f5ede3] font-medium leading-none tracking-tighter">
             <span className="text-accent">~470</span> J
           </h3>
           <p className="font-mono text-[10px] md:text-xs text-text-muted tracking-[0.2em] mt-2 uppercase">
             Stored Weapon Energy<br/>Design Value
           </p>
        </div>
        
    </div>
  );
};
