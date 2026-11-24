"use client";
import React from 'react';
import Image from 'next/image';
import { thriveforceData } from '../../data/thriveforce';
import { velociraptorAssets } from '../../data/velociraptorAssets';

export const ThriveForceTeam = () => {
  return (
    <section className="robot-team chapter-divider relative w-full text-[#f5ede3] pb-14 lg:pb-24">
        
        {/* COMBINED TEAM SPREAD */}
        <div className="portfolio-frame portfolio-chapter border-b border-border">
            <h2 className="chapter-heading mb-4">
                Team ThriveForce
            </h2>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between pt-4 lg:pt-8 mb-7 lg:mb-16">
                <div className="font-mono text-sm tracking-widest text-text-muted uppercase">Combat Robotics</div>
                <div className="font-mono text-xs tracking-widest text-accent uppercase mt-4 lg:mt-0">
                    Design &bull; Simulation &bull; Fabrication
                </div>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-8">
                
                {/* OUR MACHINES (Left) */}
                <div className="w-full lg:w-1/2 flex flex-col">
                    <h3 className="font-mono text-xs tracking-widest text-text-muted uppercase mb-8 pb-4 border-b border-white/10">Our Machines</h3>
                    <div className="flex flex-col border-t border-white/5">
                        {thriveforceData.robots.map((robot, i) => (
                            <div key={i} className="group relative w-full border-b border-border py-5 px-4 hover:bg-[#191214] transition-colors duration-300 overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-0.5 origin-bottom scale-y-0 bg-accent transition-transform duration-300 group-hover:scale-y-100" />
                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between transition-transform duration-500 group-hover:translate-x-2">
                                    <div className="flex items-center gap-6">
                                        <div className="font-mono text-[10px] text-accent tracking-widest uppercase">0{i+1}</div>
                                        <h4 className="font-display text-[clamp(24px,3vw,36px)] uppercase tracking-tighter text-[#e0e0e0] group-hover:text-white transition-colors">
                                            {robot.name}
                                        </h4>
                                    </div>
                                    <div className="mt-4 md:mt-0 text-left md:text-right flex flex-row items-center gap-6 md:flex-col md:items-end md:gap-1">
                                        <div className="font-mono text-lg text-[#f5ede3]">{robot.weightClass}</div>
                                        <div className="font-mono text-[9px] tracking-widest text-text-muted uppercase">{robot.status}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* MY ROLE (Right) */}
                <div className="w-full lg:w-1/2 flex flex-col">
                    <h3 className="font-mono text-xs tracking-widest text-text-muted uppercase mb-8 pb-4 border-b border-white/10">My Role</h3>
                    <div className="flex flex-col relative w-full h-full min-h-[300px] border border-white/5 bg-[#050505] mobile-card-pad lg:p-12 overflow-hidden group">
                        
                        {/* Connecting Line (visual logic linking left and right) */}
                        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-accent/20 transition-all duration-700 group-hover:bg-accent/40" />

                        <div className="flex flex-col lg:flex-row justify-between w-full h-full gap-7 lg:gap-12">
                            
                            {/* Engineer */}
                            <div className="flex flex-col items-start w-full lg:w-1/2 z-10 relative">
                                <h4 className="font-display text-[clamp(28px,3.5vw,42px)] text-[#f5ede3] uppercase tracking-tighter mb-6">Engineer</h4>
                                <div className="flex flex-col gap-2 font-mono text-[9px] lg:text-[10px] text-[#e0e0e0] uppercase tracking-widest">
                                    <span className="flex items-center gap-3"><span className="w-4 h-[1px] bg-accent/40" />CAD Design</span>
                                    <span className="flex items-center gap-3"><span className="w-4 h-[1px] bg-accent/40" />Structural Simulation</span>
                                    <span className="flex items-center gap-3"><span className="w-4 h-[1px] bg-accent/40" />Fabrication</span>
                                    <span className="flex items-center gap-3"><span className="w-4 h-[1px] bg-accent/40" />Robot Design</span>
                                </div>
                            </div>
                            
                            {/* Visual Separator */}
                            <div className="hidden lg:block absolute left-1/2 top-12 bottom-12 w-[1px] bg-white/5" />

                            {/* Treasurer */}
                            <div className="flex flex-col items-start lg:items-end w-full lg:w-1/2 z-10 relative text-left lg:text-right">
                                <h4 className="font-display text-[clamp(28px,3.5vw,42px)] text-accent uppercase tracking-tighter mb-6">Treasurer</h4>
                                <div className="flex flex-col lg:items-end gap-2 font-mono text-[9px] lg:text-[10px] text-[#e0e0e0] uppercase tracking-widest">
                                    <span className="flex items-center lg:flex-row-reverse gap-3"><span className="w-4 h-[1px] bg-accent/40" />Budgeting</span>
                                    <span className="flex items-center lg:flex-row-reverse gap-3"><span className="w-4 h-[1px] bg-accent/40" />Procurement</span>
                                    <span className="flex items-center lg:flex-row-reverse gap-3"><span className="w-4 h-[1px] bg-accent/40" />Sponsorship</span>
                                </div>
                            </div>

                        </div>

                        {/* Faint Wireframe Overlay on Role block */}
                        <div className="absolute right-[-10%] bottom-[-20%] w-[80%] h-[80%] opacity-[0.03] pointer-events-none mix-blend-screen transition-opacity duration-700 group-hover:opacity-[0.05]">
                            <Image src={velociraptorAssets.technical.heroWireframe} alt="Wireframe" fill className="object-contain" />
                        </div>
                    </div>
                </div>

            </div>
        </div>

        {/* ACHIEVEMENTS, SPONSORS & CLOSE */}
        <div className="mobile-gutter w-full lg:px-16 pt-10 lg:pt-16 flex flex-col gap-9 lg:gap-16">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-9 lg:gap-16">
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
            <div className="mt-2 pt-10 lg:mt-8 lg:pt-16 border-t border-white/5 text-center relative overflow-hidden pb-9 lg:pb-16">
                <div className="absolute inset-0 w-full h-full opacity-[0.02] pointer-events-none mix-blend-screen flex items-center justify-center">
                    <Image src={velociraptorAssets.technical.heroWireframe} alt="Silhouette" fill className="object-cover" />
                </div>
                <h2 className="relative z-10 font-display text-[clamp(38px,4.5vw,68px)] uppercase tracking-tighter text-[#f5ede3] leading-[0.9]">
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
