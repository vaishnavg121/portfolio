"use client";

import { AtmosphereFilaments } from "@/components/AtmosphereFilaments";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { ArrowRightToLine, ArrowUpRight, GitCommitHorizontal, X } from "lucide-react";
import { fetchGithubContributions } from "@/lib/actions/github";
import {
  calendarDate, calendarKeyIndex, contributionAnchor, contributionColumns, contributionFit, contributionMonthOffset, contributionMonths,
  type GithubCalendarData,
} from "@/lib/github-calendar";
import { socials } from "@/lib/profile";
import type { createContributionSculpture } from "./github-sculpture";
import "./github-compact.css";

const monthFormat = new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" });
const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" });
const formatCount = (count: number) => count.toLocaleString("en") + (count === 1 ? " contribution" : " contributions");
type Sculpture = NonNullable<ReturnType<typeof createContributionSculpture>>;

function ContributionCalendar({ calendar }: { calendar: GithubCalendarData }) {
  const weeks = useMemo(() => calendar.grid.filter(week => week.length), [calendar]);
  const columns = useMemo(() => contributionColumns(weeks), [weeks]);
  const last = columns.length - 1;
  const [focused, setFocused] = useState<number | null>(null);
  const [selected, setSelected] = useState(-1);
  const [hovered, setHovered] = useState(-1);
  const [keyboard, setKeyboard] = useState(-1);
  const [flat, setFlat] = useState(false);
  const [inspecting, setInspecting] = useState(false);
  const [canInspect, setCanInspect] = useState(false);
  const [ready, setReady] = useState(false);
  const [modeAvailable, setModeAvailable] = useState(false);
  const [lastDetail, setLastDetail] = useState(-1);
  const viewport = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const tooltip = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const scene = useRef<Sculpture | null>(null);
  const contact = useRef<{ id: number; x: number; y: number; index: number } | null>(null);
  const lean = useRef({ x: 0, y: 0 });
  const entered = useRef(false);
  const sculpted = ready && !flat;
  const hot = hovered < 0 ? keyboard : hovered;
  const detail = selected >= 0 ? selected : hot;
  if (detail >= 0 && detail !== lastDetail) setLastDetail(detail);
  const displayed = detail < 0 ? lastDetail : detail;
  const item = columns[displayed]?.day;
  const pinned = selected >= 0 && selected === detail;
  const firstYear = calendarDate(columns[0].day.date).getUTCFullYear();
  const lastYear = calendarDate(columns[last].day.date).getUTCFullYear();

  useLayoutEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const place = (initial = false) => {
      if (!element.clientWidth) return;
      const fit = contributionFit(element.clientWidth,weeks.length,inspecting);
      element.style.setProperty("--gh-unit",fit.pitch+"px");
      element.style.setProperty("--gh-height",fit.height+"px");
      element.style.setProperty("--gh-width",fit.boardWidth+"px");
      element.dataset.calendarReady = "";
      setCanInspect(contributionFit(element.clientWidth,weeks.length,false).pitch < 13.5);
      if (initial) element.scrollLeft = inspecting ? element.scrollWidth : 0;
    };
    place(true);
    const observer = new ResizeObserver(() => place());
    observer.observe(element);
    return () => observer.disconnect();
  }, [inspecting,weeks.length]);

  useLayoutEffect(() => {
    const board = viewport.current;
    if (!board) return;
    const labels = Array.from(board.querySelectorAll<HTMLElement>(".github-month"));
    const grid = board.querySelector(".github-calendar-grid");
    let active = true;
    const fit = () => {
      if (!active) return;
      let next = board.scrollWidth;
      // Later labels take precedence over an opening partial month in the same week.
      for (let index = labels.length - 1; index >= 0; index--) {
        const label = labels[index];
        const left = label.offsetLeft;
        const fits = left + label.offsetWidth <= next;
        label.toggleAttribute("data-month-collides", !fits);
        if (fits) next = left - 7;
      }
    };
    fit();
    const resize = new ResizeObserver(fit);
    resize.observe(board);
    if (grid) resize.observe(grid);
    document.fonts?.ready.then(fit);
    return () => { active = false; resize.disconnect(); };
  }, [weeks, sculpted]);

  useEffect(() => {
    const surface = canvas.current;
    const board = viewport.current;
    if (flat || !surface || !board || !window.IntersectionObserver || !window.ResizeObserver) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let seen = false, canceled = false, version = 0, loading = false, failed = false;

    function stop() {
      version++;
      loading = false;
      scene.current?.dispose();
      scene.current = null;
    }

    function reconcile() {
      const visible = seen && !document.hidden;
      scene.current?.setVisible(visible);
      if (!visible || loading || scene.current || failed) return;
      loading = true;
      const request = version;
      import("./github-sculpture").then(({ createContributionSculpture }) => {
        if (canceled || request !== version) return;
        scene.current = createContributionSculpture({
          canvas: surface!, columns, weekCount: weeks.length, reduced: reduced.matches, animateEntrance: !entered.current,
          ready: rendered => {
            if (canceled || request !== version) return;
            setReady(rendered);
            if (rendered) {
              entered.current = true;
              setModeAvailable(true);
            }
            if (!rendered) {
              failed = true;
              setModeAvailable(false);
              stop();
            }
          },
        });
        if (!scene.current) {
          failed = true;
          setModeAvailable(false);
          return;
        }
        scene.current.resize();
        scene.current.setVisible(seen && !document.hidden);
      }).catch(() => {
        if (canceled || request !== version) return;
        failed = true;
        setModeAvailable(false);
      }).finally(() => {
        if (request === version) loading = false;
      });
    }

    function reset() {
      setReady(false);
      stop();
      failed = false;
      reconcile();
    }

    function contextLost(event: Event) {
      event.preventDefault();
      setReady(false);
      stop();
      failed = true;
    }

    const intersection = new IntersectionObserver(([entry]) => {
      seen = entry.isIntersecting;
      reconcile();
    });
    intersection.observe(board);
    const resize = new ResizeObserver(() => scene.current?.resize());
    resize.observe(surface);
    document.addEventListener("visibilitychange", reconcile);
    reduced.addEventListener("change", reset);
    surface.addEventListener("webglcontextlost", contextLost);
    surface.addEventListener("webglcontextrestored", reset);
    return () => {
      canceled = true;
      intersection.disconnect();
      resize.disconnect();
      document.removeEventListener("visibilitychange", reconcile);
      reduced.removeEventListener("change", reset);
      surface.removeEventListener("webglcontextlost", contextLost);
      surface.removeEventListener("webglcontextrestored", reset);
      stop();
    };
  }, [columns, flat, weeks.length]);

  useEffect(() => {
    if (sculpted) scene.current?.emphasize(hot, selected, lean.current.x, lean.current.y);
  }, [hot, selected, sculpted]);

  useLayoutEffect(() => {
    const element = viewport.current, tip = tooltip.current;
    const marker = buttons.current[detail];
    if (!element || !tip || !marker) return;
    const position = () => {
      const visible = element.getBoundingClientRect();
      const target = marker.getBoundingClientRect();
      const anchor = target.left + target.width / 2 - visible.left;
      const half = tip.offsetWidth / 2;
      const left = Math.max(2, 8 - visible.left) + half;
      const right = Math.min(visible.width - 2, innerWidth - visible.left - 8) - half;
      const clamped = Math.max(left, Math.min(right, anchor));
      tip.dataset.positioned = anchor >= 0 && anchor <= visible.width && target.bottom >= 0 && target.top <= innerHeight
        ? "visible" : "outside";
      tip.style.left = clamped - half + "px";
      tip.style.top = Math.max(8 - visible.top, Math.min(-5, target.top - visible.top - tip.offsetHeight - 9)) + "px";
      tip.style.setProperty("--tooltip-notch", Math.max(11, Math.min(tip.offsetWidth - 11, half + anchor - clamped)) + "px");
    };
    position();
    element.addEventListener("scroll", position, { passive: true });
    window.addEventListener("scroll", position, { passive: true });
    const resize = new ResizeObserver(position);
    resize.observe(element);
    return () => {
      element.removeEventListener("scroll", position);
      window.removeEventListener("scroll", position);
      resize.disconnect();
    };
  }, [detail, pinned, sculpted]);

  useEffect(() => {
    if (selected < 0 && hovered < 0 && keyboard < 0) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setSelected(-1);
      setHovered(-1);
      setKeyboard(-1);
    };
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, [selected, hovered, keyboard]);

  function pointerIndex(event: PointerEvent<HTMLCanvasElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    return scene.current?.hit(event.clientX - bounds.left, event.clientY - bounds.top, event.pointerType !== "mouse") ?? -1;
  }

  const companion = useCallback((index: number) => {
    const target = buttons.current[index];
    if (target) window.dispatchEvent(new CustomEvent("companionInteract", {
      detail: { type: "github-cell-hover", data: columns[index].day, target },
    }));
  }, [columns]);

  function clearHover() {
    lean.current = { x: 0, y: 0 };
    setHovered(-1);
    scene.current?.emphasize(keyboard, selected);
  }

  const toggle = useCallback((index: number) => {
    setSelected(current => current === index ? -1 : index);
  }, []);

  const focusDay = useCallback((index: number) => {
    const element = viewport.current, marker = buttons.current[index];
    if (!element || !marker) return;
    marker.focus({ preventScroll: true });
    const left = marker.offsetLeft - marker.offsetWidth / 2;
    const right = left + marker.offsetWidth;
    if (left < element.scrollLeft) element.scrollLeft = left - 10;
    else if (right > element.scrollLeft + element.clientWidth) element.scrollLeft = right - element.clientWidth + 10;
  }, []);

  const dayButtons = useMemo(() => columns.map((column, index) => {
    const label = dateFormat.format(calendarDate(column.day.date)) + " · " + formatCount(column.day.count);
    const point = contributionAnchor(column);
    return <button ref={node => { buttons.current[index] = node; }} key={column.day.date} type="button" className="github-day"
      data-github-cell={column.day.date} data-count={column.day.count} data-level={column.day.level}
      aria-label={label} aria-pressed={selected === index} tabIndex={(focused ?? last) === index ? 0 : -1}
      style={{ "--week": column.x, "--day": column.z, "--anchor-x": point.x, "--anchor-y": point.y } as CSSProperties}
      onFocus={event => {
        setFocused(index);
        if (event.currentTarget.matches(":focus-visible")) setKeyboard(index);
      }}
      onBlur={() => setKeyboard(-1)}
      onClick={() => toggle(index)}
      onMouseEnter={() => {
        if (!sculpted) {
          setHovered(index);
          companion(index);
        }
      }}
      onMouseLeave={() => { if (!sculpted) setHovered(-1); }}
      onKeyDown={event => {
        const next = calendarKeyIndex(index, columns.length, event.key);
        if (next === null) return;
        event.preventDefault();
        focusDay(next);
      }} />;
  }), [columns, companion, focusDay, focused, last, sculpted, selected, toggle]);

  const monthLabels = useMemo(() => contributionMonths(weeks).map(({ date, week }) => (
    <span className="github-month" key={date} data-month-date={date} style={{ "--week": week } as CSSProperties}
      aria-hidden="true">{monthFormat.format(calendarDate(date))}</span>
  )), [weeks]);

  return (
    <>
      <div className="github-window">
        <p className="sr-only" id="github-description">
          Weeks run from oldest on the left to newest on the right. Column heights use a square-root scale. Use the arrow keys to
          move between days. Use Enter or Space to select a day and Escape to dismiss its details.
        </p>
        <div ref={viewport} className="github-calendar-viewport" role="region" aria-label="Contribution calendar"
          aria-describedby="github-description" data-anchor="github-calendar-center" data-inspecting={inspecting || undefined}>
          <div className="github-calendar-grid" data-sculpted={sculpted ? "" : undefined}
            style={{ "--gh-month-offset": contributionMonthOffset } as CSSProperties}>
            <span className="github-edge-anchor" data-anchor="github-calendar-start" />
            <canvas ref={canvas} className="github-canvas" aria-hidden="true" data-github-sculpture
              onPointerMove={event => {
                if (!sculpted || event.pointerType !== "mouse") return;
                const index = pointerIndex(event);
                const bounds = viewport.current!.getBoundingClientRect();
                lean.current = {
                  x: (event.clientX - bounds.left) / bounds.width * 2 - 1,
                  y: (event.clientY - bounds.top) / bounds.height * 2 - 1,
                };
                if (index !== hovered) {
                  setHovered(index);
                  if (index >= 0) companion(index);
                }
                scene.current?.emphasize(index < 0 ? keyboard : index, selected, lean.current.x, lean.current.y);
              }}
              onPointerLeave={event => {
                if (event.pointerType === "mouse") {
                  contact.current = null;
                  scene.current?.press(-1);
                }
                clearHover();
              }}
              onPointerDown={event => {
                if (!event.isPrimary || event.button !== 0) return;
                const index = pointerIndex(event);
                contact.current = { id: event.pointerId, x: event.clientX, y: event.clientY, index };
                scene.current?.press(index);
              }}
              onPointerCancel={() => {
                contact.current = null;
                scene.current?.press(-1);
              }}
              onPointerUp={event => {
                const press = contact.current;
                contact.current = null;
                scene.current?.press(-1);
                if (!press || press.id !== event.pointerId || Math.hypot(press.x - event.clientX, press.y - event.clientY) > 9) return;
                const index = press.index;
                setKeyboard(-1);
                setHovered(-1);
                if (index < 0) setSelected(-1);
                else toggle(index);
              }} />
            {monthLabels}
            {dayButtons}
            <span className="github-edge-anchor" data-anchor="github-calendar-end" />
          </div>
        </div>
        {item && <div ref={tooltip} className="github-tooltip" role={pinned ? "group" : "tooltip"}
          aria-label={pinned ? "Contribution details" : undefined} aria-hidden={detail < 0 ? true : undefined}
          data-github-tooltip data-open={detail >= 0 ? "" : undefined} data-pinned={pinned ? "" : undefined}>
          <div>
            <time dateTime={item.date}>{dateFormat.format(calendarDate(item.date))}</time>
            <strong>{formatCount(item.count)}</strong>
          </div>
          {pinned && <button type="button" className="tactile-quiet" aria-label="Dismiss contribution details"
            onClick={() => { setSelected(-1); setHovered(-1); setKeyboard(-1); }}><X size={13} /></button>}
        </div>}
      </div>
      <footer className="github-compact-foot">
        <p><strong>{calendar.totalContributions.toLocaleString("en")}</strong>{" "}
          {calendar.totalContributions === 1 ? "contribution" : "contributions"}
          <span className="github-range">{firstYear}{firstYear === lastYear ? "" : "–" + lastYear}</span></p>
        <span className="sr-only" aria-live="polite">
          {selected >= 0 ? dateFormat.format(calendarDate(columns[selected].day.date)) + " · " + formatCount(columns[selected].day.count) : ""}
        </span>
        <div className="github-actions">
          {modeAvailable && <div className="github-mode" role="group" aria-label="Contribution calendar view">
            <button type="button" className="tactile-quiet" aria-label="Show 2D contribution calendar"
              aria-pressed={flat} onClick={() => { if (!flat) { setReady(false); setFlat(true); clearHover(); } }}>2D</button>
            <button type="button" className="tactile-quiet" aria-label="Show 3D contribution sculpture"
              aria-pressed={!flat} onClick={() => { if (flat) { setFlat(false); clearHover(); } }}>3D</button>
          </div>}
          {(canInspect || inspecting) && <button type="button" className="github-latest tactile-quiet" aria-pressed={inspecting}
            onClick={() => { setInspecting(value=>!value); setSelected(-1); clearHover(); }}>{inspecting ? "Full year" : "Inspect dates"}</button>}
          {inspecting && <button type="button" className="github-latest tactile-quiet" aria-label="Show latest contributions"
            onClick={() => viewport.current?.scrollTo({
              left: viewport.current.scrollWidth, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
            })}>Latest <ArrowRightToLine aria-hidden="true" size={12} /></button>}
        </div>
      </footer>
    </>
  );
}

export function GithubActivity() {
  const [calendar, setCalendar] = useState<GithubCalendarData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchGithubContributions("vaishnavg121").then(
      result => { if (active) setCalendar(result); },
      () => { if (active) setCalendar(null); },
    ).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <section className="github-compact min-w-0 relative isolate" id="github" aria-labelledby="github-title" data-familiar-protect data-familiar-yield>
      <AtmosphereFilaments zone="github" />
      <header className="github-compact-head">
        <h2 id="github-title"><GitCommitHorizontal aria-hidden="true" size={14} /> GitHub activity</h2>
        <a href={socials.github} className="portfolio-text-link" target="_blank" rel="noopener noreferrer" aria-label="Open GitHub profile">
          <span className="portfolio-link-label">@vaishnavg121</span><ArrowUpRight className="portfolio-link-arrow" aria-hidden="true" />
        </a>
      </header>
      {calendar && calendar.grid.some(week => week.length) ? <ContributionCalendar calendar={calendar} />
        : <div className="github-window"><p role="status" className="github-status">
          {loading ? "Loading activity…" : "Contribution history is temporarily unavailable."}
        </p></div>}
    </section>
  );
}
