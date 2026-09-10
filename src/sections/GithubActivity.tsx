"use client";

import { useState, useEffect } from "react";
import { fetchGithubContributions, GithubContribution } from "@/lib/actions/github";

export const GithubActivity = () => {
  const [gridData, setGridData] = useState<GithubContribution[][]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchGithubContributions("vaishnavg121");
        setGridData(data);
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
            <span className="text-text-muted">@vaishnavg121</span>
          </div>
        </div>

        <div className="w-full overflow-x-auto pb-4 custom-scrollbar relative">
          {isLoading ? (
            <div className="h-24 flex items-center justify-center font-mono text-xs text-text-muted tracking-widest">
              [ FETCHING_DATA ]
            </div>
          ) : gridData.length === 0 ? (
            <div className="h-24 flex items-center justify-center font-mono text-xs text-text-muted tracking-widest">
              [ DATA_UNAVAILABLE // PENDING_TOKEN ]
            </div>
          ) : (
            <div className="min-w-[800px] flex gap-1">
              {gridData.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1 relative group">
                  {week.map((day, dIdx) => (
                    <div
                      key={`${wIdx}-${dIdx}`}
                      tabIndex={0}
                      data-github-cell={day.date}
                      data-level={day.level}
                      onMouseEnter={() => {
                        window.dispatchEvent(new CustomEvent("companionInteract", { 
                          detail: { type: "inspect-github-cell", data: day }
                        }));
                      }}
                      className={`w-3 h-3 rounded-[2px] transition-colors duration-300 hover:border hover:border-white focus:border-white focus:outline-none cursor-crosshair ${getColor(day.level)}`}
                    >
                       <div className="absolute opacity-0 group-hover:opacity-100 bg-[#111] text-[#fff] text-[10px] font-mono p-2 rounded pointer-events-none transform -translate-y-8 -translate-x-1/2 z-50 whitespace-nowrap">
                         {day.count} contributions on {new Date(day.date).toDateString()}
                       </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
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
