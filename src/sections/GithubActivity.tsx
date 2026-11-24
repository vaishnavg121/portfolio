"use client";

import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { fetchGithubContributions, GithubCalendarData, GithubContribution } from "@/lib/actions/github";
import { socials } from "@/lib/profile";
import { THEME_ASSETS } from "@/lib/assets";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export const GithubActivity = () => {
  const [calendarData, setCalendarData] = useState<GithubCalendarData | null>(null);
  const [dayDetail, setDayDetail] = useState<GithubContribution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const calendarViewport = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);

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

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".gh-panel", {
        opacity: 0.7, y: 16, duration: 0.58, ease: "power3.out", clearProps: "transform,opacity",
        scrollTrigger: { trigger: containerRef.current, start: "top 84%", once: true },
      });
    }, containerRef);
    return () => media.revert();
  }, { scope: containerRef });

  const getColor = (level: number) => {
    if (level === 0) return "bg-[#1a1a1a]";
    if (level === 1) return "bg-[#414642]";
    if (level === 2) return "bg-[#67706a]";
    if (level === 3) return "bg-[#928d80]";
    return "bg-[#c0aa99]";
  };

  return (
    <section className="portfolio-chapter chapter-divider relative overflow-hidden group/section" id="github" ref={containerRef}>
      <div className="portfolio-frame">

        <div className="gh-panel relative overflow-hidden border border-border bg-surface">

          <div className="absolute inset-0 pointer-events-none opacity-10 mix-blend-overlay" style={{ backgroundImage: `url(${THEME_ASSETS.github.grain})`, backgroundSize: '250px' }} />

          <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-14 lg:py-16">

            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 lg:mb-16">
              <div>
                <div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-3">
                  <h2 className="chapter-heading">
                    GitHub activity
                  </h2>
                  <div className="hidden h-[1px] w-12 bg-white/10 lg:block"></div>
                  <span className="text-[10px] font-mono text-text-muted opacity-50 uppercase tracking-widest">{calendarData?.currentYear || new Date().getFullYear()}</span>
                </div>
                <h3 className="font-mono text-xs uppercase tracking-widest text-text-muted">
                  Contribution calendar
                </h3>
              </div>
              <div className="text-xs font-mono mt-6 md:mt-0 flex flex-col items-start md:items-end border-l md:border-l-0 md:border-r border-border pl-4 md:pl-0 md:pr-4">
                <a
                  href={socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub Profile"
                  className="text-text-primary hover:text-accent transition-colors"
                  data-cursor="VIEW"
                >
                  @vaishnavg121 ↗
                </a>
                {calendarData && (
                  <span className="text-accent mt-1 tracking-widest">
                    {calendarData.totalContributions} <span className="text-text-muted">CONTRIBUTIONS</span>
                  </span>
                )}
              </div>
            </div>

            <div ref={calendarViewport} className="w-full overflow-x-auto pb-4 lg:pb-8 pt-3 lg:pt-4 custom-scrollbar relative md:[&::-webkit-scrollbar]:hidden" tabIndex={0} role="region" aria-label="Contribution calendar, scroll horizontally for more dates" data-anchor="github-calendar-center">
              {isLoading ? (
                <div className="h-[150px] flex items-center justify-center font-mono text-xs text-text-muted tracking-widest">
                  Loading contributions…
                </div>
              ) : !calendarData || calendarData.grid.length === 0 ? (
                <div className="h-[150px] flex items-center justify-center font-mono text-xs text-text-muted tracking-widest">
                  The contribution calendar is unavailable right now.
                </div>
              ) : (
                <div className="min-w-max flex flex-col">

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

                    <div className="flex flex-col gap-[3px] text-[9px] font-mono text-text-muted/50 w-[27px] mr-[3px] pt-[12px]">
                       <div className="h-[12px] flex items-center">MON</div>
                       <div className="h-[12px] flex items-center mt-[27px]">WED</div>
                       <div className="h-[12px] flex items-center mt-[27px]">FRI</div>
                    </div>

                    {calendarData.grid.map((week, wIdx) => (
                      <div key={wIdx} className="flex flex-col gap-[3px] relative">
                        {week.map((day, dIdx) => (
                          <div
                            key={`${wIdx}-${dIdx}`}
                            tabIndex={0}
                            role="button"
                            aria-label={day.date + ", " + day.count + " contributions"}
                            aria-pressed={dayDetail?.date === day.date}
                            onClick={() => setDayDetail((current) => current?.date === day.date ? null : day)}
                            onKeyDown={(event) => {
                              if (event.key !== "Enter" && event.key !== " ") return;
                              event.preventDefault();
                              event.currentTarget.click();
                            }}
                            data-github-cell={day.date}
                            data-level={day.level}
                            data-cursor="INSPECT"
                            onMouseEnter={(e) => {
                              window.dispatchEvent(new CustomEvent("companionInteract", {
                                detail: { type: "github-cell-hover", data: day, target: e.currentTarget }
                              }));
                            }}
                            style={{ marginTop: dIdx === 0 && new Date(day.date).getDay() !== 0 ? `${new Date(day.date).getDay() * (12 + 3)}px` : '0' }}
                            className={`w-[12px] h-[12px] rounded-[1px] transition-all duration-300 aria-pressed:ring aria-pressed:ring-[#e8ddd0] aria-pressed:opacity-100 hover:scale-125 hover:z-10 focus:scale-125 focus:z-10 hover:border hover:border-white focus:border-white focus:outline-none cursor-crosshair group/day relative ${getColor(day.level)} ${day.level === 0 ? 'opacity-20 hover:opacity-100' : 'hover:brightness-110 shadow-sm'}`}
                          >
                             <div data-familiar-avoid className="absolute opacity-0 group-hover/day:opacity-100 bg-[#090a0b] text-text-primary text-[10px] font-mono p-2 rounded pointer-events-none transform -translate-y-full -translate-x-1/2 left-1/2 -top-2 z-50 whitespace-nowrap transition-opacity border border-border shadow-2xl">
                               <span className="text-accent font-bold">{day.count}</span> contributions · {new Date(day.date).toDateString()}
                             </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {calendarData && (
              <div className="mb-3 flex items-center justify-between gap-3 lg:hidden">
              <p aria-live="polite" className="min-h-5 font-mono text-xs text-text-muted">
                {dayDetail ? new Date(dayDetail.date + "T00:00:00").toLocaleDateString(undefined, { dateStyle: "medium" }) + " · " + dayDetail.count + " contributions" : "Swipe for dates · Tap a day for its count"}
              </p>
              <button type="button" onClick={() => {
                const track = calendarViewport.current;
                if (track) track.scrollTo({ left: track.scrollWidth, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
              }} className="portfolio-control min-h-11 shrink-0 px-3 font-mono text-xs">Latest</button>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.04] pt-8 mt-2 relative z-20">
              <div className="text-[9px] font-mono text-text-muted/40 uppercase tracking-widest flex items-center gap-2">
                Past year
              </div>
              <div className="flex items-center gap-2 text-[9px] font-mono text-text-muted">
                <span className="opacity-40">LESS</span>
                <div className="flex gap-[2px]">
                  <div className="w-[12px] h-[12px] bg-[#1a1a1a] opacity-20 rounded-[1px]" />
                  <div className="w-[12px] h-[12px] bg-[#414642] rounded-[1px] shadow-sm" />
                  <div className="w-[12px] h-[12px] bg-[#67706a] rounded-[1px] shadow-sm" />
                  <div className="w-[12px] h-[12px] bg-[#928d80] rounded-[1px] shadow-sm" />
                  <div className="w-[12px] h-[12px] bg-[#c0aa99] rounded-[1px] shadow-sm" />
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
