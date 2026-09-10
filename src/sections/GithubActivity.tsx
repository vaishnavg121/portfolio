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
    <section className="py-24 md:py-32 bg-[#111111] relative overflow-hidden group/section border-y border-white/[0.03]" id="github">
      <div className="container mx-auto px-4 md:px-8 max-w-[1040px]">
        
        {/* Panel Shell */}
        <div className="relative rounded-[24px] overflow-hidden border border-white/[0.07] bg-[#0c0d0e] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
          
          {/* Decorative Layers */}
          <div className="absolute inset-0 pointer-events-none" style={{
             background: 'radial-gradient(circle at top right, rgba(204,51,51,0.06), transparent 45%)'
          }} />
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.4)]" />
          
          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-6 h-[1px] bg-accent/30 pointer-events-none" />
          <div className="absolute top-0 left-0 w-[1px] h-6 bg-accent/30 pointer-events-none" />
          
          <div className="absolute bottom-0 right-0 w-6 h-[1px] bg-accent/30 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[1px] h-6 bg-accent/30 pointer-events-none" />
          
          <div className="absolute top-6 right-8 text-[9px] font-mono text-text-muted/20 tracking-[0.2em] pointer-events-none">
            [SYS_LOG]
          </div>

          {/* Content Layer */}
          <div className="relative z-10 px-5 py-8 md:px-12 md:py-12">
            
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
              <div className="text-xs font-mono mt-6 md:mt-0 flex flex-col items-start md:items-end border-l md:border-l-0 md:border-r border-accent/20 pl-4 md:pl-0 md:pr-4">
                <span className="text-text-primary">@vaishnavg121</span>
                {calendarData && (
                  <span className="text-accent mt-1 tracking-widest">
                    {calendarData.totalContributions} <span className="text-text-muted">CONTRIBUTIONS</span>
                  </span>
                )}
              </div>
            </div>

            <div className="w-full overflow-x-auto pb-6 custom-scrollbar relative md:[&::-webkit-scrollbar]:hidden" data-anchor="github-calendar-center">
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
                    <div className="absolute left-0 bottom-[-20px] w-4 h-4" data-anchor="github-calendar-start" />
                    <div className="absolute right-0 bottom-[-20px] w-4 h-4" data-anchor="github-calendar-end" />
                    
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
                            // Enforce specific grid row if dates don't align to 7 rows perfectly
                            style={{ marginTop: dIdx === 0 && new Date(day.date).getDay() !== 0 ? `${new Date(day.date).getDay() * (12 + 3)}px` : '0' }}
                            className={`w-[12px] h-[12px] rounded-sm transition-all duration-300 hover:scale-125 hover:z-10 focus:scale-125 focus:z-10 hover:border hover:border-white focus:border-white focus:outline-none cursor-crosshair group/day relative ${getColor(day.level)} ${day.level === 0 ? 'opacity-20 hover:opacity-100' : 'hover:brightness-110 shadow-sm'}`}
                          >
                             <div className="absolute opacity-0 group-hover/day:opacity-100 bg-[#1a1a1a] text-text-primary text-[10px] font-mono p-2 rounded pointer-events-none transform -translate-y-full -translate-x-1/2 left-1/2 -top-2 z-50 whitespace-nowrap transition-opacity border border-white/10 shadow-2xl">
                               <span className="text-accent font-bold">{day.count}</span> count {"//"} {new Date(day.date).toDateString()}
                             </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between border-t border-white/[0.04] pt-6 mt-4">
              <div className="text-[10px] font-mono text-text-muted/40 uppercase tracking-widest flex items-center gap-2">
                365D TRACE <span className="opacity-30">{"///"}</span> <span className="text-text-muted/20">CODE {"//"} BUILD {"//"} ITERATE</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
                <span className="text-[10px] opacity-40">Less</span>
                <div className="flex gap-[2px]">
                  <div className="w-[12px] h-[12px] bg-[#1a1a1a] opacity-20 rounded-sm" />
                  <div className="w-[12px] h-[12px] bg-[#331111] rounded-sm shadow-sm" />
                  <div className="w-[12px] h-[12px] bg-[#661a1a] rounded-sm shadow-sm" />
                  <div className="w-[12px] h-[12px] bg-[#992626] rounded-sm shadow-sm" />
                  <div className="w-[12px] h-[12px] bg-[#cc3333] rounded-sm shadow-sm" />
                </div>
                <span className="text-[10px] opacity-40">More</span>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
};
