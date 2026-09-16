import React from 'react';
import { thriveforceData } from '../../data/thriveforce';

export const ThriveForceTeam = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12 py-32 z-30 relative bg-[#030303]">
       <div className="mb-24 text-center">
          <h2 className="font-display text-5xl md:text-7xl text-[#f5ede3] uppercase tracking-tighter mb-4">
             {thriveforceData.team}
          </h2>
          <div className="font-mono text-xs text-accent tracking-[0.3em] uppercase flex items-center justify-center gap-4">
             {thriveforceData.roles.map((role, i) => (
                <React.Fragment key={role}>
                   <span>{role}</span>
                   {i < thriveforceData.roles.length - 1 && <span className="text-text-muted">•</span>}
                </React.Fragment>
             ))}
          </div>
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-32">
          <div>
             <h3 className="font-mono text-[10px] text-text-muted tracking-widest uppercase mb-8 border-b border-border/30 pb-4">
               Engineering Disciplines
             </h3>
             <ul className="flex flex-col gap-4">
               {thriveforceData.disciplines.map(d => (
                 <li key={d} className="font-display text-2xl text-[#e0e0e0] tracking-tight">{d}</li>
               ))}
             </ul>
          </div>
          <div>
             <h3 className="font-mono text-[10px] text-text-muted tracking-widest uppercase mb-8 border-b border-border/30 pb-4">
               Verified Achievements
             </h3>
             <ul className="flex flex-col gap-6">
               {thriveforceData.achievements.map((a, i) => (
                 <li key={i} className="flex flex-col">
                   <span className="font-display text-xl text-[#e0e0e0] tracking-tight">{a.label}</span>
                   <span className="font-mono text-[9px] text-accent tracking-widest">{a.year}</span>
                 </li>
               ))}
             </ul>
          </div>
       </div>

       <div className="mb-32">
          <h3 className="font-mono text-[10px] text-text-muted tracking-widest uppercase mb-12 text-center border-b border-border/30 pb-4">
            Robot Lineup
          </h3>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
             {thriveforceData.robots.map(r => (
               <div key={r.id} className="flex-1 p-8 border border-border/30 bg-[#050505] flex flex-col items-center text-center">
                  <h4 className="font-display text-3xl text-[#f5ede3] tracking-tight mb-2 uppercase">{r.name}</h4>
                  <span className="font-mono text-xs text-accent tracking-widest mb-6">{r.weightClass}</span>
                  <span className="font-mono text-[10px] text-text-muted tracking-wider uppercase">{r.status}</span>
               </div>
             ))}
          </div>
       </div>
       
       <div className="text-center">
          <h3 className="font-mono text-[10px] text-text-muted tracking-widest uppercase mb-8">
            Verified Sponsors
          </h3>
          <div className="flex flex-wrap justify-center gap-12 font-display text-2xl text-[#888888] tracking-tight uppercase">
             {thriveforceData.sponsors.map(s => (
                <span key={s.name}>{s.name}</span>
             ))}
          </div>
       </div>
    </div>
  );
};
