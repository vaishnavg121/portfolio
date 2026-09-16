"use client";
import React, { useEffect } from 'react';
import gsap from 'gsap';
import Image from 'next/image';
import { thriveforceData } from '../../data/thriveforce';
import { velociraptorAssets } from '../../data/velociraptorAssets';

export const EngineeringDossier = () => {
  useEffect(() => {
    const handleScroll = (e: CustomEvent<number>) => {
       const prog = e.detail;
       // Act II spans from 0.4 to 1.0.
       const localProg = Math.max(0, Math.min(1, (prog - 0.4) / 0.6));
       
       // Sequence:
       // 0.0 -> 0.3: Overview & Powertrain fade in
       // 0.3 -> 0.7: FEA images slide in
       
       const overviewOp = localProg < 0.1 ? 0 : Math.min(1, (localProg - 0.1) * 5);
       gsap.to(".dossier-overview", { opacity: overviewOp, x: (1 - overviewOp) * 50, duration: 0.1, overwrite: "auto" });

       const feaOp = localProg < 0.4 ? 0 : Math.min(1, (localProg - 0.4) * 4);
       gsap.to(".dossier-fea", { opacity: feaOp, y: (1 - feaOp) * 50, duration: 0.1, overwrite: "auto" });
       
       // Darken background slightly for FEA contrast
       const bgDark = localProg < 0.4 ? 0 : Math.min(0.8, (localProg - 0.4) * 3);
       gsap.to(".dossier-bg", { backgroundColor: `rgba(0,0,0,${bgDark})`, duration: 0.1, overwrite: "auto" });
    };
    
    window.addEventListener('robotics-master-scroll', handleScroll as EventListener);
    return () => window.removeEventListener('robotics-master-scroll', handleScroll as EventListener);
  }, []);

  const raptor = thriveforceData.robots.find(r => r.id === 'velociraptor');

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col z-20">
       <div className="dossier-bg absolute inset-0 w-full h-full pointer-events-none -z-10" />
       
       <div className="relative w-full h-full flex flex-row items-center px-6 md:px-16 pt-32 pb-16">
           
           {/* LEFT COLUMN - OVERVIEW & SPECS */}
           <div className="dossier-overview w-full md:w-5/12 flex flex-col gap-12 opacity-0 pl-4 border-l border-accent/20">
               <div>
                   <h2 className="font-display text-5xl md:text-7xl text-[#f5ede3] uppercase tracking-tight leading-none mb-6">
                     Engineering<br/>Dossier
                   </h2>
                   <div className="flex flex-col gap-3 font-mono text-xs md:text-sm tracking-widest text-[#e0e0e0] uppercase">
                       <p>Mass: 3 LB / 1.36 KG</p>
                       <p>Class: Horizontal Undercutter</p>
                       <p>Chassis: Low Center of Mass</p>
                       <p>Drive: Symmetrical Belt Drive</p>
                       <p>Internals: Modular Layout</p>
                   </div>
               </div>

               <div>
                   <h3 className="font-display text-3xl md:text-4xl text-[#f5ede3] uppercase tracking-tight mb-4">Weapon Assembly</h3>
                   <div className="grid grid-cols-2 gap-y-3 font-mono text-[10px] md:text-xs tracking-widest uppercase">
                      <span className="text-text-muted">ENERGY</span> <span className="text-accent text-left">{raptor?.specs?.energy}</span>
                      <span className="text-text-muted">MASS</span> <span className="text-[#e0e0e0] text-left">{raptor?.specs?.weaponMass}</span>
                      <span className="text-text-muted">DIAMETER</span> <span className="text-[#e0e0e0] text-left">{raptor?.specs?.diameter}</span>
                      <span className="text-text-muted">BITE</span> <span className="text-[#e0e0e0] text-left">{raptor?.specs?.bite}</span>
                      <span className="text-text-muted">MATERIAL</span> <span className="text-[#e0e0e0] text-left">{raptor?.specs?.material}</span>
                   </div>
               </div>
               
               <div>
                   <h3 className="font-display text-3xl md:text-4xl text-[#f5ede3] uppercase tracking-tight mb-4">Powertrain</h3>
                   <div className="grid grid-cols-2 gap-y-3 font-mono text-[10px] md:text-xs tracking-widest uppercase">
                      {raptor?.powertrain?.map((pt, i) => (
                        <React.Fragment key={i}>
                           <span className="text-text-muted">{pt.component}</span> <span className="text-[#e0e0e0] text-left">{pt.spec}</span>
                        </React.Fragment>
                      ))}
                   </div>
               </div>
           </div>

           {/* RIGHT COLUMN - FEA IMAGES */}
           <div className="dossier-fea w-full md:w-7/12 flex flex-col justify-end opacity-0 pl-12 h-full">
               <h3 className="font-display text-4xl text-[#f5ede3] uppercase tracking-tight mb-8 text-right">FEA Validation</h3>
               
               <div className="grid grid-cols-2 gap-6 w-full max-w-2xl ml-auto">
                   <div className="flex flex-col gap-2">
                       <div className="relative aspect-[4/3] w-full rounded-sm overflow-hidden border border-white/10 bg-black">
                           <Image src={velociraptorAssets.fea.sideStress} alt="Side Stress FEA" fill className="object-cover" />
                       </div>
                       <p className="font-mono text-[10px] text-text-muted tracking-widest uppercase text-right">Side Load Case: 449 MPa Max</p>
                   </div>
                   <div className="flex flex-col gap-2">
                       <div className="relative aspect-[4/3] w-full rounded-sm overflow-hidden border border-white/10 bg-black">
                           <Image src={velociraptorAssets.fea.upwardStress} alt="Upward Stress FEA" fill className="object-cover" />
                       </div>
                       <p className="font-mono text-[10px] text-text-muted tracking-widest uppercase text-right">Upward Load Case: 208 MPa Max</p>
                   </div>
                   <div className="flex flex-col gap-2 col-span-2">
                       <div className="relative aspect-[3/1] w-full rounded-sm overflow-hidden border border-white/10 bg-black">
                           <Image src={velociraptorAssets.fea.weaponProperties} alt="Weapon Properties" fill className="object-contain p-4" />
                       </div>
                       <p className="font-mono text-[10px] text-text-muted tracking-widest uppercase text-right">Weapon Material Properties</p>
                   </div>
               </div>
           </div>

       </div>
    </div>
  );
};
