"use client";
import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import Image from 'next/image';
import { velociraptorAssets } from '../../data/velociraptorAssets';
import { thriveforceData } from '../../data/thriveforce';

export const EngineeringDossier = () => {
  useEffect(() => {
    const handleScroll = (e: CustomEvent<number>) => {
       const prog = e.detail; // 0.0 to 1.0
       
       // Map prog 0.4 -> 1.0 to local 0.0 -> 1.0
       const localProg = Math.max(0, Math.min(1, (prog - 0.4) / 0.6));
       
       // Timings
       // 0.0 - 0.2: Overview
       // 0.2 - 0.5: Weapon & Powertrain
       // 0.5 - 0.9: FEA
       
       const overviewOp = localProg < 0.2 ? Math.min(1, localProg * 10) : Math.max(0, 1 - (localProg - 0.2) * 10);
       const weaponOp = localProg < 0.2 ? 0 : localProg < 0.5 ? Math.min(1, (localProg - 0.2) * 5) : Math.max(0, 1 - (localProg - 0.5) * 5);
       const feaOp = localProg < 0.5 ? 0 : localProg < 0.9 ? Math.min(1, (localProg - 0.5) * 5) : Math.max(0, 1 - (localProg - 0.9) * 10);
       
       gsap.to(".text-overview", { opacity: overviewOp, y: 50 * (1 - overviewOp), duration: 0.1, overwrite: "auto" });
       gsap.to(".text-dossier-weapon", { opacity: weaponOp, y: 50 * (1 - weaponOp), duration: 0.1, overwrite: "auto" });
       gsap.to(".text-dossier-fea", { opacity: feaOp, x: 50 * (1 - feaOp), duration: 0.1, overwrite: "auto" });
    };
    
    window.addEventListener('robotics-master-scroll', handleScroll as EventListener);
    return () => window.removeEventListener('robotics-master-scroll', handleScroll as EventListener);
  }, []);

  const raptor = thriveforceData.robots.find(r => r.id === 'velociraptor');

  return (
    <div className="sticky top-0 w-full h-screen pointer-events-none z-20 px-12">
       
       {/* OVERVIEW */}
       <div className="text-overview absolute top-1/2 right-12 -translate-y-1/2 opacity-0 text-right w-1/3">
           <h3 className="font-display text-4xl text-[#f5ede3] uppercase tracking-tight mb-8">Architecture</h3>
           <ul className="flex flex-col gap-4 font-mono text-[10px] tracking-widest text-text-muted uppercase">
              <li>{raptor?.weightClass} / {raptor?.type}</li>
              <li>LOW CENTER OF MASS</li>
              <li>BELT-DRIVEN WEAPON</li>
              <li>SYMMETRICAL DRIVETRAIN</li>
              <li>MODULAR INTERNAL LAYOUT</li>
           </ul>
       </div>
       
       {/* WEAPON & POWERTRAIN */}
       <div className="text-dossier-weapon absolute top-1/2 left-12 -translate-y-1/2 opacity-0 w-[40%] flex flex-col gap-16">
           <div>
               <h3 className="font-display text-3xl text-[#f5ede3] uppercase tracking-tight mb-6">Weapon Assembly</h3>
               <div className="grid grid-cols-2 gap-y-4 font-mono text-[10px] tracking-widest uppercase">
                  <span className="text-text-muted">ENERGY</span> <span className="text-accent text-right">{raptor?.specs?.energy}</span>
                  <span className="text-text-muted">MASS</span> <span className="text-[#e0e0e0] text-right">{raptor?.specs?.weaponMass}</span>
                  <span className="text-text-muted">DIAMETER</span> <span className="text-[#e0e0e0] text-right">{raptor?.specs?.diameter}</span>
                  <span className="text-text-muted">BITE</span> <span className="text-[#e0e0e0] text-right">{raptor?.specs?.bite}</span>
                  <span className="text-text-muted">MATERIAL</span> <span className="text-[#e0e0e0] text-right">{raptor?.specs?.material}</span>
               </div>
           </div>
           
           <div>
               <h3 className="font-display text-3xl text-[#f5ede3] uppercase tracking-tight mb-6">Powertrain</h3>
               <div className="grid grid-cols-2 gap-y-4 font-mono text-[10px] tracking-widest uppercase">
                  {raptor?.powertrain?.map((pt, i) => (
                    <React.Fragment key={i}>
                       <span className="text-text-muted">{pt.component}</span> <span className="text-[#e0e0e0] text-right">{pt.spec}</span>
                    </React.Fragment>
                  ))}
               </div>
           </div>
       </div>
       
       {/* FEA */}
       <div className="text-dossier-fea absolute inset-0 opacity-0 bg-[#030303]/90 backdrop-blur-md flex items-center justify-between px-12 z-30 pointer-events-auto">
            <div className="w-[35%]">
               <h3 className="font-display text-4xl text-[#f5ede3] uppercase tracking-tight mb-12">FEA Validation</h3>
               
               <div className="space-y-6 mb-12 pb-12 border-b border-border/30">
                 <div>
                   <div className="text-accent font-mono text-xl">2000 N</div>
                   <div className="text-text-muted font-mono text-[10px] tracking-widest uppercase">Side Load Case</div>
                 </div>
                 <div className="flex gap-8">
                   <div>
                     <div className="text-[#e0e0e0] font-mono text-xl">449 MPa</div>
                     <div className="text-text-muted font-mono text-[10px] tracking-widest uppercase">Max Von Mises</div>
                   </div>
                   <div>
                     <div className="text-[#e0e0e0] font-mono text-xl">~1.9</div>
                     <div className="text-text-muted font-mono text-[10px] tracking-widest uppercase">Safety Factor</div>
                   </div>
                 </div>
               </div>
               
               <div className="space-y-6">
                 <div>
                   <div className="text-accent font-mono text-xl">2000 N</div>
                   <div className="text-text-muted font-mono text-[10px] tracking-widest uppercase">Upward Load Case</div>
                 </div>
                 <div className="flex gap-8">
                   <div>
                     <div className="text-[#e0e0e0] font-mono text-xl">208 MPa</div>
                     <div className="text-text-muted font-mono text-[10px] tracking-widest uppercase">Max Von Mises</div>
                   </div>
                   <div>
                     <div className="text-[#e0e0e0] font-mono text-xl">~4.0</div>
                     <div className="text-text-muted font-mono text-[10px] tracking-widest uppercase">Safety Factor</div>
                   </div>
                 </div>
               </div>
            </div>
            
            <div className="w-[60%] h-[80%] relative flex flex-col gap-4 pointer-events-none">
               <div className="relative flex-1 border border-border/30 bg-[#050505]">
                  <Image src={velociraptorAssets.fea.sideStress} alt="FEA Side Stress" fill className="object-contain p-4" />
                  <div className="absolute bottom-4 left-4 font-mono text-[9px] tracking-widest text-text-muted">FIG 1. SIDE IMPACT STRESS</div>
               </div>
               <div className="relative flex-1 border border-border/30 bg-[#050505]">
                  <Image src={velociraptorAssets.fea.upwardStress} alt="FEA Upward Stress" fill className="object-contain p-4" />
                  <div className="absolute bottom-4 left-4 font-mono text-[9px] tracking-widest text-text-muted">FIG 2. UPWARD IMPACT STRESS</div>
               </div>
            </div>
       </div>

    </div>
  );
};
