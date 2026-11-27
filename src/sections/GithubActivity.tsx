"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { fetchGithubContributions } from "@/lib/actions/github";
import { calendarDate, calendarKeyIndex, type GithubCalendarData, type GithubContribution } from "@/lib/github-calendar";
import { socials } from "@/lib/profile";
import "./github-compact.css";

const monthFormat = new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" });
const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" });
const formatCount = (count: number) => count.toLocaleString("en") + (count === 1 ? " contribution" : " contributions");

export function GithubActivity() {
  const [calendar, setCalendar] = useState<GithubCalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<GithubContribution | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const positioned = useRef(false);
  const weeks = useMemo(() => calendar?.grid.filter(week => week.length) ?? [], [calendar]);
  const byDate = useMemo(() => weeks.flat(), [weeks]);
  const indices = useMemo(() => new Map(byDate.map((day, index) => [day.date, index])), [byDate]);
  const lastDate = byDate.at(-1)?.date;
  const firstDate = byDate[0]?.date;

  useEffect(() => {
    let active = true;
    fetchGithubContributions("vaishnavg121").then(
      result => { if (active) setCalendar(result); },
      () => { if (active) setCalendar(null); },
    ).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useLayoutEffect(() => {
    const element = viewport.current;
    if (!element || !lastDate) return;

    const place = () => {
      if (!element.clientWidth || !element.scrollWidth) return false;
      if (!positioned.current) {
        element.scrollLeft = element.scrollWidth - element.clientWidth;
        positioned.current = true;
      }
      element.dataset.calendarReady = "";
      return true;
    };

    if (place()) return;
    const observer = new ResizeObserver(() => { if (place()) observer.disconnect(); });
    observer.observe(element);
    return () => observer.disconnect();
  }, [lastDate]);

  return (
    <section className="github-compact min-w-0" id="github" aria-labelledby="github-title" data-familiar-protect data-familiar-yield>
      <header className="github-compact-head">
        <h2 id="github-title">GitHub contributions</h2>
        <a href={socials.github} className="portfolio-text-link" target="_blank" rel="noopener noreferrer" aria-label="Open GitHub profile">
          <span className="portfolio-link-label">@vaishnavg121</span><ArrowUpRight className="portfolio-link-arrow" aria-hidden="true" />
        </a>
      </header>
      <div className="github-window">
        {calendar && byDate.length > 0 ? (
          <div ref={viewport} className="github-calendar-viewport" role="region"
            aria-label="Contribution calendar. Use arrow keys to move between days." data-anchor="github-calendar-center">
            <div className="github-calendar-grid">
              <span className="github-edge-anchor" data-anchor="github-calendar-start" />
              {weeks.map((week, index) => {
                const day = week[0];
                const date = calendarDate(day.date);
                const month = date.getUTCMonth();
                const previous = weeks[index - 1]?.[0];
                const monthLabel = !previous || month !== calendarDate(previous.date).getUTCMonth() ? monthFormat.format(date) : "";
                return <div className="github-week" key={day.date}>
                  <span className="github-month" aria-hidden="true">{monthLabel}</span>
                  {week.map(item => {
                    const label = dateFormat.format(calendarDate(item.date)) + " · " + formatCount(item.count);
                    return <button key={item.date} type="button" className="github-day" aria-label={label}
                      aria-pressed={detail?.date === item.date} tabIndex={(focused ?? lastDate) === item.date ? 0 : -1}
                      data-github-cell={item.date} data-level={item.level} title={label}
                      style={{ gridRow: calendarDate(item.date).getUTCDay() + 2 }}
                      onFocus={() => setFocused(item.date)}
                      onClick={() => setDetail(current => current?.date === item.date ? null : item)}
                      onMouseEnter={event => window.dispatchEvent(new CustomEvent("companionInteract", {
                        detail: { type: "github-cell-hover", data: item, target: event.currentTarget }
                      }))}
                      onKeyDown={event => {
                        const next = calendarKeyIndex(indices.get(item.date)!, byDate.length, event.key);
                        if (next === null) return;
                        event.preventDefault();
                        viewport.current?.querySelector<HTMLButtonElement>(`[data-github-cell="${byDate[next].date}"]`)?.focus();
                      }} />;
                  })}
                </div>;
              })}
              <span className="github-edge-anchor" data-anchor="github-calendar-end" />
            </div>
          </div>
        ) : <p role="status" className="github-status">{loading ? "Loading activity…" : "Contribution history is temporarily unavailable."}</p>}
      </div>
      <footer className="github-compact-foot">
        <p aria-live="polite">
          {detail ? dateFormat.format(calendarDate(detail.date)) + " · " + formatCount(detail.count)
            : calendar && firstDate && lastDate ? formatCount(calendar.totalContributions) + " · " + calendarDate(firstDate).getUTCFullYear()
              + (calendarDate(firstDate).getUTCFullYear() === calendar.currentYear ? "" : "–" + calendar.currentYear)
              : "Contribution history"}
        </p>
        {lastDate && <button type="button" className="portfolio-control github-latest" aria-label="Show latest contributions"
          onClick={() => viewport.current?.scrollTo({
            left: viewport.current.scrollWidth,
            behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
          })}>Latest</button>}
      </footer>
    </section>
  );
}
