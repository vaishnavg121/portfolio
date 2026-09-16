import React from 'react';
import Image from 'next/image';
import { thriveforceData } from '../../data/thriveforce';
import { velociraptorAssets } from '../../data/velociraptorAssets';

export const ThriveForceTeam = () => {
  return (
    <div className="w-full bg-[#030303] flex flex-col py-32 px-6 md:px-16 z-30 relative">
      <div className="max-w-[1400px] w-full mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 border-b border-white/10 pb-12">
            <div>
                <h2 className="font-display text-6xl md:text-8xl text-[#f5ede3] uppercase tracking-tighter leading-none">
                  Team<br/>ThriveForce
                </h2>
            </div>
            <div className="text-right mt-8 md:mt-0">
                <p className="font-mono text-sm tracking-widest text-text-muted uppercase mb-2">My Roles</p>
                <p className="font-mono text-xl text-accent uppercase tracking-widest">
                  {thriveforceData.roles.join(' · ')}
                </p>
            </div>
        </div>
        
        {/* DISCIPLINES */}
        <div className="flex flex-wrap gap-4 mb-24">
            {thriveforceData.disciplines.map((d, i) => (
                <div key={i} className="px-4 py-2 border border-accent/30 text-accent font-mono text-[10px] uppercase tracking-widest bg-accent/5">
                    {d}
                </div>
            ))}
        </div>

        {/* ROBOT LINEUP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">
            {thriveforceData.robots.map((robot, i) => (
                <div key={i} className="flex flex-col border-t border-white/10 pt-6">
                    <h3 className="font-display text-4xl text-[#f5ede3] uppercase tracking-tight mb-2">{robot.name}</h3>
                    <p className="font-mono text-xs tracking-widest text-text-muted uppercase mb-8">{robot.weightClass}</p>
                    
                    {robot.id === 'velociraptor' ? (
                       <div className="relative aspect-square w-full rounded-sm overflow-hidden bg-black/50 border border-white/5">
                           <Image 
                              src={velociraptorAssets.renders.top} 
                              alt="Velociraptor" 
                              fill 
                              className="object-contain p-4 mix-blend-screen"
                           />
                       </div>
                    ) : (
                       <div className="relative aspect-square w-full rounded-sm overflow-hidden bg-black/20 border border-white/5 flex items-center justify-center">
                           <span className="font-display text-8xl text-white/5 tracking-tighter select-none">
                               {robot.weightClass.split(' ')[0]}
                           </span>
                       </div>
                    )}
                </div>
            ))}
        </div>
        
        {/* SPONSORS & ACHIEVEMENTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
                <h4 className="font-mono text-xs tracking-widest text-text-muted uppercase mb-8">Sponsors</h4>
                <div className="flex flex-wrap gap-12 items-center opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                    {thriveforceData.sponsors.map((sponsor, i) => (
                        <span key={i} className="font-display text-2xl text-[#f5ede3] uppercase tracking-tight">{sponsor.name}</span>
                    ))}
                </div>
            </div>
            
            <div>
                <h4 className="font-mono text-xs tracking-widest text-text-muted uppercase mb-8">Verified Achievements</h4>
                <div className="flex flex-col gap-6">
                    {thriveforceData.achievements.map((ach, i) => (
                        <div key={i} className="flex justify-between items-end border-b border-white/5 pb-4">
                            <span className="font-mono text-sm tracking-widest text-[#e0e0e0] uppercase">{ach.label}</span>
                            <span className="font-mono text-[10px] text-text-muted">{ach.year}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
