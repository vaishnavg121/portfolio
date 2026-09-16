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
      gsap.to(roleRef.current, { '--split-pos': `${clamped}%`, duration: 0.3, ease: "power2.out", overwrite: "auto" });
  };

  const handleRoleLeave = () => {
      if (!roleRef.current) return;
      gsap.to(roleRef.current, { '--split-pos': `50%`, duration: 0.5, ease: "power2.out", overwrite: "auto" });
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
            <div className="w-full h-[1px] bg-accent/30 mb-8" />
            
            <div className="flex flex-col border-t border-white/5">
                {thriveforceData.robots.map((robot, i) => (
                    <div key={i} className="group relative w-full border-b border-white/5 py-6 lg:py-8 px-4 hover:bg-[#080808] transition-colors duration-500 overflow-hidden">
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between transition-transform duration-500 group-hover:translate-x-2">
                            <div className="flex items-center gap-6">
                                <div className="font-mono text-[10px] text-accent tracking-widest uppercase">0{i+1}</div>
                                <h4 className="font-display text-3xl lg:text-5xl uppercase tracking-tighter text-[#e0e0e0] group-hover:text-white transition-colors">
                                    {robot.name}
                                </h4>
                            </div>
                            <div className="mt-4 md:mt-0 text-left md:text-right flex items-center gap-6 md:block">
                                <div className="font-mono text-lg text-[#f5ede3] mb-1">{robot.weightClass}</div>
                                <div className="font-mono text-[9px] tracking-widest text-text-muted uppercase">{robot.status}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* ENGINEER x TREASURER ROLE */}
        <div className="w-full px-6 lg:px-16 mb-24">
            <h3 className="font-mono text-xs tracking-widest text-text-muted uppercase mb-8">My Role</h3>
            
            <div 
                ref={roleRef}
                className="relative w-full h-[300px] border border-white/5 flex select-none bg-[#050505]"
                onPointerMove={handleRolePointerMove}
                onPointerLeave={handleRoleLeave}
            >
                {/* Left side (Engineer) */}
                <div 
                    className="absolute top-0 left-0 h-full flex flex-col items-end justify-center pr-8 lg:pr-16 overflow-hidden border-r border-accent/20 transition-all duration-75"
                    style={{ width: 'var(--split-pos)' }}
                >
                    <h4 className="font-display text-4xl lg:text-6xl text-[#f5ede3] uppercase tracking-tighter mb-6">Engineer</h4>
                    <div className="flex flex-col gap-1 font-mono text-[9px] lg:text-[10px] text-text-muted uppercase tracking-widest text-right">
                        <span>CAD Design</span>
                        <span>Structural Simulation</span>
                        <span>Fabrication & Iteration</span>
                    </div>
                </div>

                {/* Right side (Treasurer) */}
                <div 
                    className="absolute top-0 right-0 h-full flex flex-col items-start justify-center pl-8 lg:pl-16 overflow-hidden transition-all duration-75"
                    style={{ width: 'calc(100% - var(--split-pos))' }}
                >
                    <h4 className="font-display text-4xl lg:text-6xl text-accent uppercase tracking-tighter mb-6">Treasurer</h4>
                    <div className="flex flex-col gap-1 font-mono text-[9px] lg:text-[10px] text-text-muted uppercase tracking-widest">
                        <span>Budgeting</span>
                        <span>Procurement</span>
                        <span>Sponsorship</span>
                    </div>
                </div>
            </div>
        </div>

        {/* MILESTONES, SPONSORS & CLOSE */}
        <div className="w-full px-6 lg:px-16 flex flex-col gap-16">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* Milestones */}
                <div>
                    <h3 className="font-mono text-xs tracking-widest text-text-muted uppercase mb-8">Milestones</h3>
                    <div className="flex flex-col relative pl-4">
                        <div className="absolute left-0 top-2 bottom-2 w-[1px] bg-white/10" />
                        {thriveforceData.achievements.map((ach, i) => (
                            <div key={i} className="relative mb-6 last:mb-0 group">
                                <div className="absolute -left-[18px] top-1 w-1.5 h-1.5 rounded-full bg-accent/50 group-hover:bg-accent transition-all duration-300" />
                                <div className="font-mono text-[9px] text-accent tracking-widest mb-1">{ach.year}</div>
                                <div className="font-mono text-xs uppercase tracking-widest text-[#e0e0e0]">
                                    {ach.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sponsors */}
                <div>
                    <h3 className="font-mono text-xs tracking-widest text-text-muted uppercase mb-8">Supported By</h3>
                    <div className="flex flex-wrap gap-x-8 gap-y-4">
                        {thriveforceData.sponsors.map((sponsor, i) => (
                            <div key={i} className="font-display text-xl lg:text-2xl text-text-muted hover:text-[#f5ede3] uppercase tracking-tight transition-colors duration-300">
                                {sponsor.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CLOSING */}
            <div className="mt-8 pt-16 border-t border-white/5 text-center relative overflow-hidden">
                <div className="absolute inset-0 w-full h-full opacity-[0.02] pointer-events-none mix-blend-screen flex items-center justify-center">
                    <Image src={velociraptorAssets.technical.heroWireframe} alt="Silhouette" fill className="object-cover" />
                </div>
                <h2 className="relative z-10 font-display text-[4rem] lg:text-[6rem] uppercase tracking-tighter text-[#f5ede3] leading-[0.9]">
                    From CAD<br/>To <span className="text-accent">Combat.</span>
                </h2>
                <div className="relative z-10 font-mono text-[9px] tracking-widest text-text-muted uppercase mt-8">
                    ThriveForce &bull; Combat Robotics
                </div>
            </div>

        </div>

    </section>
  );
};
