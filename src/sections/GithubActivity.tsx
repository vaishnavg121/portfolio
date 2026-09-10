"use client";

import { useState, useEffect } from "react";
import { fetchGithubContributions, GithubCalendarData } from "@/lib/actions/github";

export const GithubActivity = () => {
  const [calendarData, setCalendarData] = useState<GithubCalendarData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchGithubContributions("vaishnavg121");
        setCalendarData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const getColor = (level: number) => {
    if (level === 0) return "bg-[#1a1a1a]";
    if (level === 1) return "bg-[#331111]";
    if (level === 2) return "bg-[#661a1a]";
    if (level === 3) return "bg-[#992626]";
    return "bg-[#cc3333]"; // accent color
  };

  return (
    <section className="py-24 md:py-32 bg-[#050505] relative overflow-hidden group/section border-y border-white/[0.02]" id="github">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes atmosphere-breathe {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes ink-drift {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, 3px, 0); }
        }
        .anim-atmosphere { animation: atmosphere-breathe 8s ease-in-out infinite; }
        .anim-ink-drift { animation: ink-drift 12s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .anim-atmosphere, .anim-ink-drift { animation: none !important; }
        }
      `}} />
      <div className="container mx-auto px-4 md:px-8 max-w-[1100px]">
        
        {/* Panel Shell */}
        <div className="relative rounded-[16px] md:rounded-[24px] overflow-hidden border border-white/[0.05] bg-[#090a0b] shadow-[0_32px_100px_rgba(0,0,0,0.5)]">
          
          {/* 1. Atmospheric Gradient & Grain */}
          <div className="absolute inset-0 pointer-events-none anim-atmosphere" style={{
             background: 'radial-gradient(circle at 80% 20%, rgba(204,51,51,0.04), transparent 50%), radial-gradient(circle at 20% 80%, rgba(255,255,255,0.02), transparent 40%)'
          }} />
          <div className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: 'url(/assets/theme/github/github-paper-grain.webp)', backgroundSize: '200px' }} />

          {/* 2. Perimeter Ink Artwork */}
          <div className="absolute inset-0 pointer-events-none opacity-60 md:opacity-90 mix-blend-lighten anim-ink-drift" style={{
             backgroundImage: `
               url('/assets/theme/github/github-ink-left.png'),
               url('/assets/theme/github/github-brush-crescent.png'),
               url('/assets/theme/github/github-ink-right.png'),
               url('/assets/theme/github/github-ink-bottom-right.png'),
               url('/assets/theme/github/github-ink-bottom-left.png')
             `,
             backgroundPosition: 'left bottom, top right, right 10%, right bottom, left bottom',
             backgroundRepeat: 'no-repeat',
             backgroundSize: 'auto 70%, auto 50%, auto 60%, auto 35%, auto 25%'
          }} />

          {/* Vignette Shadow */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.7)]" />

          {/* 3. Crimson Corner Details */}
          <div className="absolute top-5 left-5 w-3 h-[1px] bg-[#cc3333]/60 pointer-events-none" />
          <div className="absolute top-5 left-5 w-[1px] h-3 bg-[#cc3333]/60 pointer-events-none" />
          
          <div className="absolute bottom-5 left-5 w-3 h-[1px] bg-[#cc3333]/60 pointer-events-none" />
          <div className="absolute bottom-5 left-5 w-[1px] h-3 bg-[#cc3333]/60 pointer-events-none" />

          <div className="absolute top-5 right-5 w-3 h-[1px] bg-[#cc3333]/60 pointer-events-none" />
          <div className="absolute top-5 right-5 w-[1px] h-3 bg-[#cc3333]/60 pointer-events-none" />
          
          <div className="absolute bottom-5 right-5 w-3 h-[1px] bg-[#cc3333]/60 pointer-events-none" />
          <div className="absolute bottom-5 right-5 w-[1px] h-3 bg-[#cc3333]/60 pointer-events-none" />

          {/* Microcopy */}
          <div className="hidden md:block absolute top-6 left-1/2 -translate-x-1/2 text-[8px] font-mono text-[#cc3333]/40 tracking-[0.4em] pointer-events-none">
            {"//"} DISCIPLINE COMPOUNDS.
          </div>
          <div className="absolute top-6 right-8 text-[9px] font-mono text-text-muted/20 tracking-[0.2em] pointer-events-none hidden md:block">
            [SYS_LOG]
          </div>

          {/* 4. Left Editorial Rail */}
          <div className="hidden lg:flex absolute left-6 top-1/2 -translate-y-1/2 flex-col items-center gap-10 pointer-events-none opacity-30">
             <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-white to-transparent" />
             <div className="text-[8px] font-mono tracking-[0.5em] rotate-180" style={{ writingMode: 'vertical-rl' }}>
               BUILD {"//"} LEARN {"//"} ITERATE
             </div>
             <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-[#cc3333] to-transparent" />
          </div>

          {/* Content Layer */}
          <div className="relative z-10 px-5 py-10 md:pl-24 md:pr-12 md:py-16">
            
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-sm font-mono text-text-muted tracking-widest uppercase">
                    Development Activity
                  </h2>
                  <div className="h-[1px] w-12 bg-white/10"></div>
                  <span className="text-[10px] font-mono text-text-muted opacity-50 uppercase tracking-widest">Activity_Matrix // {calendarData?.currentYear || new Date().getFullYear()}</span>
                </div>
                <h3 className="text-3xl font-display font-medium text-text-primary">
                  System Commits
                </h3>
              </div>
              <div className="text-xs font-mono mt-6 md:mt-0 flex flex-col items-start md:items-end border-l md:border-l-0 md:border-r border-[#cc3333]/20 pl-4 md:pl-0 md:pr-4">
                <span className="text-text-primary">@vaishnavg121</span>
                {calendarData && (
                  <span className="text-[#cc3333] mt-1 tracking-widest">
                    {calendarData.totalContributions} <span className="text-text-muted">CONTRIBUTIONS</span>
                  </span>
                )}
              </div>
            </div>

            <div className="w-full overflow-x-auto pb-8 pt-4 custom-scrollbar relative md:[&::-webkit-scrollbar]:hidden" data-anchor="github-calendar-center">
              {isLoading ? (
                <div className="h-[150px] flex items-center justify-center font-mono text-xs text-text-muted tracking-widest">
                  [ FETCHING_DATA ]
                </div>
              ) : !calendarData || calendarData.grid.length === 0 ? (
                <div className="h-[150px] flex items-center justify-center font-mono text-xs text-text-muted tracking-widest">
                  [ DATA_UNAVAILABLE // PENDING_TOKEN ]
                </div>
              ) : (
                <div className="min-w-max flex flex-col">
                  
                  {/* Month Labels */}
                  <div className="flex relative text-[10px] font-mono text-text-muted mb-3 h-4 ml-[30px]">
                    {(() => {
                      const m: { label: string, colIndex: number }[] = [];
                      let lastMonth = -1;
                      calendarData.grid.forEach((week, i) => {
                        if (week.length > 0) {
                           const date = new Date(week[0].date);
                           const month = date.getMonth();
                           if (month !== lastMonth) {
                              m.push({ label: date.toLocaleString('default', { month: 'short' }), colIndex: i });
                              lastMonth = month;
                           }
                        }
                      });
                      return m.map((month, idx) => (
                        <div key={idx} className="absolute uppercase" style={{ left: `${month.colIndex * (12 + 3)}px` }}>
                           {month.label}
                        </div>
                      ));
                    })()}
                  </div>

                  <div className="flex gap-[3px] relative">
                    <div className="absolute left-0 bottom-[-30px] w-4 h-4" data-anchor="github-calendar-start" />
                    <div className="absolute right-0 bottom-[-30px] w-4 h-4" data-anchor="github-calendar-end" />
                    
                    {/* Weekday Labels */}
                    <div className="flex flex-col gap-[3px] text-[9px] font-mono text-text-muted/50 w-[27px] mr-[3px] pt-[12px]">
                       <div className="h-[12px] flex items-center">MON</div>
                       <div className="h-[12px] flex items-center mt-[27px]">WED</div>
                       <div className="h-[12px] flex items-center mt-[27px]">FRI</div>
                    </div>

                    {/* Grid */}
                    {calendarData.grid.map((week, wIdx) => (
                      <div key={wIdx} className="flex flex-col gap-[3px] relative">
                        {week.map((day, dIdx) => (
                          <div
                            key={`${wIdx}-${dIdx}`}
                            tabIndex={0}
                            data-github-cell={day.date}
                            data-level={day.level}
                            onMouseEnter={(e) => {
                              window.dispatchEvent(new CustomEvent("companionInteract", { 
                                detail: { type: "github-cell-hover", data: day, target: e.currentTarget }
                              }));
                            }}
                            style={{ marginTop: dIdx === 0 && new Date(day.date).getDay() !== 0 ? `${new Date(day.date).getDay() * (12 + 3)}px` : '0' }}
                            className={`w-[12px] h-[12px] rounded-[1px] transition-all duration-300 hover:scale-125 hover:z-10 focus:scale-125 focus:z-10 hover:border hover:border-white focus:border-white focus:outline-none cursor-crosshair group/day relative ${getColor(day.level)} ${day.level === 0 ? 'opacity-20 hover:opacity-100' : 'hover:brightness-110 shadow-sm'}`}
                          >
                             <div className="absolute opacity-0 group-hover/day:opacity-100 bg-[#090a0b] text-text-primary text-[10px] font-mono p-2 rounded pointer-events-none transform -translate-y-full -translate-x-1/2 left-1/2 -top-2 z-50 whitespace-nowrap transition-opacity border border-[#cc3333]/20 shadow-2xl">
                               <span className="text-[#cc3333] font-bold">{day.count}</span> count {"//"} {new Date(day.date).toDateString()}
                             </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between border-t border-white/[0.04] pt-8 mt-2 relative z-20">
              <div className="text-[9px] font-mono text-text-muted/40 uppercase tracking-widest flex items-center gap-2">
                365D TRACE <span className="opacity-30">{"///"}</span> <span className="text-text-muted/20">CODE {"//"} BUILD {"//"} ITERATE</span>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-mono text-text-muted">
                <span className="opacity-40">LESS</span>
                <div className="flex gap-[2px]">
                  <div className="w-[12px] h-[12px] bg-[#1a1a1a] opacity-20 rounded-[1px]" />
                  <div className="w-[12px] h-[12px] bg-[#331111] rounded-[1px] shadow-sm" />
                  <div className="w-[12px] h-[12px] bg-[#661a1a] rounded-[1px] shadow-sm" />
                  <div className="w-[12px] h-[12px] bg-[#992626] rounded-[1px] shadow-sm" />
                  <div className="w-[12px] h-[12px] bg-[#cc3333] rounded-[1px] shadow-sm" />
                </div>
                <span className="opacity-40">MORE</span>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
};
