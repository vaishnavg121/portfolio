"use client";

import { useState, useEffect } from "react";

export const GithubActivity = () => {
  // Mock data adapter interface
  const generateMockData = () => {
    const weeks = 52;
    const daysPerWeek = 7;
    const data = [];
    
    for (let w = 0; w < weeks; w++) {
      const week = [];
      for (let d = 0; d < daysPerWeek; d++) {
        // Randomly generate activity leaning towards recent activity
        const isRecent = w > 40;
        const probability = isRecent ? 0.7 : 0.3;
        const count = Math.random() < probability ? Math.floor(Math.random() * 10) : 0;
        week.push({ date: `Week ${w} Day ${d}`, count });
      }
      data.push(week);
    }
    return data;
  };

  const [gridData, setGridData] = useState<{date: string, count: number}[][]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGridData(generateMockData());
  }, []);

  if (gridData.length === 0) return null;

  const getColor = (count: number) => {
    if (count === 0) return "bg-[#1a1a1a]";
    if (count < 3) return "bg-[#331111]";
    if (count < 6) return "bg-[#661a1a]";
    if (count < 9) return "bg-[#992626]";
    return "bg-[#cc3333]"; // accent color
  };

  return (
    <section className="py-24 bg-surface-elevated border-t border-border relative overflow-hidden" id="github">
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12">
          <div>
            <h2 className="text-sm font-mono text-text-muted mb-2 tracking-widest uppercase">
              Development Activity
            </h2>
            <h3 className="text-3xl font-display font-medium text-text-primary">
              System Commits
            </h3>
          </div>
          <div className="text-xs font-mono mt-4 md:mt-0 flex flex-col items-end">
            <span className="bg-accent text-white px-2 py-1 font-bold tracking-widest">[ DEV_PLACEHOLDER ]</span>
            <span className="text-text-muted mt-2">API INTEGRATION PENDING</span>
          </div>
        </div>

        <div className="w-full overflow-x-auto pb-4 custom-scrollbar relative">
          {/* Warning overlay tape */}
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-20">
            <div className="w-[150%] h-8 bg-accent -rotate-2 translate-y-12 flex items-center overflow-hidden">
               <div className="whitespace-nowrap font-mono font-bold text-black text-sm tracking-widest repeating-linear-gradient">
                 MOCK DATA // MOCK DATA // MOCK DATA // MOCK DATA // MOCK DATA // MOCK DATA // MOCK DATA //
               </div>
            </div>
          </div>
          <div className="min-w-[800px] flex gap-1">
            {gridData.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1">
                {week.map((day, dIdx) => (
                  <div
                    key={`${wIdx}-${dIdx}`}
                    className={`w-3 h-3 rounded-[2px] transition-colors duration-300 hover:border hover:border-white ${getColor(day.count)}`}
                    title={`${day.count} contributions on ${day.date}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-6 justify-end text-xs font-mono text-text-muted">
          <span>Less</span>
          <div className="w-3 h-3 bg-[#1a1a1a] rounded-[2px]" />
          <div className="w-3 h-3 bg-[#331111] rounded-[2px]" />
          <div className="w-3 h-3 bg-[#661a1a] rounded-[2px]" />
          <div className="w-3 h-3 bg-[#992626] rounded-[2px]" />
          <div className="w-3 h-3 bg-[#cc3333] rounded-[2px]" />
          <span>More</span>
        </div>
      </div>
    </section>
  );
};
