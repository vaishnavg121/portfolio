"use client";
import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { thriveforceData } from '../../data/thriveforce';
import { velociraptorAssets } from '../../data/velociraptorAssets';

export const ThriveForceTeam = () => {
  const roleRef = useRef<HTMLDivElement>(null);
  
  // For the split role interaction
  const handleRolePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!roleRef.current) return;
      const rect = roleRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = (x / rect.width) * 100;
      // Clamp between 45% and 55%
      const clamped = Math.max(45, Math.min(55, pct));
      gsap.to(roleRef.current, { '--split-pos': `${clamped}%`, duration: 0.3, ease: "power2.out" });
  };

  const handleRoleLeave = () => {
      if (!roleRef.current) return;
      gsap.to(roleRef.current, { '--split-pos': `50%`, duration: 0.5, ease: "power2.out" });
  };

  useEffect(() => {
      if (roleRef.current) {
          roleRef.current.style.setProperty('--split-pos', '50%');
      }
  }, []);

  return (
    <section className="relative w-full bg-[#030303] text-[#f5ede3] border-b border-white/5 pb-32">
        
        {/* 07 - TEAM INTRO */}
        <div className="w-full px-6 lg:px-16 pt-32 pb-24">
            <h2 className="font-display text-[6rem] lg:text-[10rem] uppercase tracking-tighter leading-none mb-4">
                Team<br/>ThriveForce
            </h2>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between border-t border-white/10 pt-8 mt-8">
                <div className="font-mono text-sm tracking-widest text-text-muted uppercase">Combat Robotics</div>
                <div className="font-mono text-xs tracking-widest text-accent uppercase mt-4 lg:mt-0">
                    Design &bull; Simulation &bull; Fabrication
                </div>
            </div>
        </div>

        {/* 08 - OUR ROBOTS */}
        <div className="w-full flex flex-col mb-48">
            <div className="px-6 lg:px-16 mb-12">
                <h3 className="font-mono text-xs tracking-widest text-text-muted uppercase">08 / Robot Lineup</h3>
            </div>
            {thriveforceData.robots.map((robot, i) => (
                <div 
                   key={robot.id} 
                   className="robot-strip group relative w-full border-t border-white/5 py-12 px-6 lg:px-16 hover:bg-[#080808] transition-colors duration-500 overflow-hidden"
                >
                   {/* Hover Image Reveal */}
                   {robot.id === 'velociraptor' && (
                       <div className="absolute inset-0 w-full h-full pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity duration-700">
                           <Image src={velociraptorAssets.renders.top} alt="Velociraptor Top" fill className="object-cover" />
                       </div>
                   )}
                   
                   <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between transition-transform duration-500 group-hover:translate-x-4">
                       <div>
                           <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-4">0{i+1}</div>
                           <h4 className="font-display text-5xl lg:text-7xl uppercase tracking-tighter text-[#e0e0e0] group-hover:text-white transition-colors">
                               {robot.name}
                           </h4>
                       </div>
                       
                       <div className="mt-8 lg:mt-0 text-left lg:text-right">
                           <div className="font-mono text-xl text-[#f5ede3] mb-2">{robot.weightClass}</div>
                           <div className="font-mono text-[9px] tracking-widest text-text-muted uppercase">{robot.status}</div>
                       </div>
                   </div>

                   {/* Weight scale visual */}
                   <div className="relative z-10 mt-12 w-full h-[1px] bg-white/5 overflow-hidden">
                       <div 
                          className="h-full bg-accent/50 group-hover:bg-accent transition-all duration-700 origin-left"
                          style={{ width: i === 0 ? '20%' : i === 1 ? '50%' : '100%' }}
                       />
                   </div>
                </div>
            ))}
            <div className="border-t border-white/5" />
        </div>

        {/* 09 - MY ROLE */}
        <div className="w-full px-6 lg:px-16 mb-48">
            <div className="mb-12">
                <h3 className="font-mono text-xs tracking-widest text-text-muted uppercase">09 / My Role</h3>
            </div>
            
            <div 
                ref={roleRef}
                className="relative w-full h-[500px] border border-white/5 flex select-none"
                onPointerMove={handleRolePointerMove}
                onPointerLeave={handleRoleLeave}
            >
                {/* Left side */}
                <div 
                    className="absolute top-0 left-0 h-full flex flex-col items-end justify-center pr-12 lg:pr-24 overflow-hidden border-r border-accent/20 transition-all duration-75"
                    style={{ width: 'var(--split-pos)' }}
                >
                    <h4 className="font-display text-6xl lg:text-8xl text-[#f5ede3] uppercase tracking-tighter mb-8">Engineer</h4>
                    <div className="flex flex-col gap-2 font-mono text-[10px] lg:text-xs text-text-muted uppercase tracking-widest text-right">
                        <span>CAD Design</span>
                        <span>Structural Simulation</span>
                        <span>Fabrication</span>
                        <span>Robot Design</span>
                        <span>Build Iteration</span>
                    </div>
                </div>

                {/* Right side */}
                <div 
                    className="absolute top-0 right-0 h-full flex flex-col items-start justify-center pl-12 lg:pl-24 overflow-hidden transition-all duration-75"
                    style={{ width: 'calc(100% - var(--split-pos))' }}
                >
                    <h4 className="font-display text-6xl lg:text-8xl text-accent uppercase tracking-tighter mb-8">Treasurer</h4>
                    <div className="flex flex-col gap-2 font-mono text-[10px] lg:text-xs text-text-muted uppercase tracking-widest">
                        <span>Budgeting</span>
                        <span>Procurement</span>
                        <span>Sponsorship</span>
                        <span>Team Resources</span>
                    </div>
                </div>
            </div>
        </div>

        {/* 10 & 11 - ACHIEVEMENTS AND SPONSORS */}
        <div className="w-full px-6 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-24 mb-48">
            {/* Achievements */}
            <div>
                <h3 className="font-mono text-xs tracking-widest text-text-muted uppercase mb-16">10 / Milestones</h3>
                <div className="flex flex-col relative">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-[3px] top-2 bottom-2 w-[1px] bg-white/10" />
                    
                    {thriveforceData.achievements.map((ach, i) => (
                        <div key={i} className="relative pl-12 mb-12 last:mb-0 group">
                            {/* Node */}
                            <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-accent/50 group-hover:bg-accent group-hover:scale-150 transition-all duration-300" />
                            <div className="font-mono text-[10px] text-accent tracking-widest mb-2">{ach.year}</div>
                            <div className="font-mono text-sm uppercase tracking-widest text-[#e0e0e0] border-b border-white/5 pb-4 group-hover:border-accent/30 transition-colors">
                                {ach.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sponsors */}
            <div>
                <h3 className="font-mono text-xs tracking-widest text-text-muted uppercase mb-16">11 / Supported By</h3>
                <div className="flex flex-col gap-8">
                    <div className="w-full h-[1px] bg-white/10" />
                    <div className="flex flex-wrap gap-x-12 gap-y-8 items-center justify-between px-4">
                        {thriveforceData.sponsors.map((sponsor, i) => (
                            <div key={i} className="group relative cursor-default">
                                <span className="font-display text-3xl lg:text-4xl text-text-muted group-hover:text-[#f5ede3] uppercase tracking-tight transition-colors duration-300">
                                    {sponsor.name}
                                </span>
                                <div className="absolute -bottom-2 left-0 w-0 h-[1px] bg-accent group-hover:w-full transition-all duration-500" />
                            </div>
                        ))}
                    </div>
                    <div className="w-full h-[1px] bg-white/10" />
                </div>
            </div>
        </div>

        {/* 12 - CLOSING */}
        <div className="w-full h-screen relative flex flex-col items-center justify-center overflow-hidden">
            {/* Faint Background Silhouette */}
            <div className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none mix-blend-screen flex items-center justify-center scale-110">
                <Image src={velociraptorAssets.technical.heroWireframe} alt="Silhouette" fill className="object-cover" />
            </div>

            <div className="relative z-10 text-center">
                <h2 className="font-display text-[5rem] lg:text-[8rem] uppercase tracking-tighter text-[#f5ede3] leading-[0.9]">
                    Design.<br/>Simulate.<br/>Build.<br/><span className="text-accent">Iterate.</span>
                </h2>
                <div className="font-mono text-[10px] tracking-widest text-text-muted uppercase mt-12">
                    ThriveForce &bull; Combat Robotics
                </div>
            </div>
        </div>

    </section>
  );
};
