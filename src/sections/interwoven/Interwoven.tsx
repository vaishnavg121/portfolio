"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { ArrowUpRight, X } from "lucide-react";
import Link from "next/link";
import { knots, matchRibbon, ribbonHeight, ribbonPosition, ribbons, ribbonStories, type RibbonId } from "./ribbon-model";
import { runRibbonCanvas, type RibbonStudy } from "./ribbon-canvas";
import "./interwoven.css";

type IntersectionId = typeof knots[number]["id"];
type Choice = RibbonId | IntersectionId;
const traces = ribbons.map(stream => Array.from({length:65},(_, i) => {
  const t = i / 64;
  return (i === 0 ? "M" : "L") + Math.round(ribbonPosition(t) * 1000) + " " + Math.round(ribbonHeight(stream.heights,t) * 200);
}).join(" "));

function relevant(choice: Choice | null): readonly RibbonId[] {
  if (!choice) return [];
  return knots.find(knot => knot.id === choice)?.streams ?? [choice as RibbonId];
}

export function Interwoven() {
  const [selection, setSelection] = useState<Choice | null>(null);
  const [hover, setHover] = useState<Choice | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const control = useRef({ hot: [] as readonly RibbonId[], mode: "hybrid" as RibbonStudy });
  const renderer = useRef<ReturnType<typeof runRibbonCanvas> | null>(null);
  const highlights = relevant(hover ?? selection);
  const story = selection ? knots.find(knot => knot.id === selection) ?? ribbonStories[selection as RibbonId] : null;

  useEffect(() => {
    if (!canvas.current) return;
    if (process.env.NODE_ENV === "development") {
      const mode = new URLSearchParams(location.search).get("ribbonStudy");
      if (mode === "particles" || mode === "glass") control.current.mode = mode;
    }
    const animation = runRibbonCanvas(canvas.current, () => control.current);
    renderer.current = animation;
    return () => {
      renderer.current = null;
      animation.dispose();
    };
  }, []);

  useEffect(() => {
    control.current.hot = relevant(hover ?? selection);
    renderer.current?.refresh();
  }, [hover, selection]);

  const select = (choice: Choice | null) => setSelection(previous => previous === choice ? null : choice);
  const locate = (event: MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return matchRibbon((event.clientX - bounds.left) / bounds.width, (event.clientY - bounds.top) / bounds.height, .095);
  };

  return <section id="interwoven" className="interwoven min-w-0"
    aria-labelledby="interwoven-title" onKeyDown={event => { if (event.key === "Escape") { setHover(null); setSelection(null); } }}>
    <div className="interwoven-top"><h2 id="interwoven-title">Interwoven Intelligence</h2></div>
    <div className="interwoven-stage" data-familiar-protect data-familiar-yield
      onPointerMove={event => {
        if (event.pointerType !== "mouse" || (event.target as Element).closest("button")) return;
        setHover(locate(event));
      }}
      onPointerLeave={() => setHover(null)}
      onClick={event => {
        if (!(event.target as Element).closest("button")) {
          const nearest = locate(event);
          if (nearest) select(nearest);
        }
      }}>
      <canvas className="interwoven-canvas" ref={canvas} aria-hidden="true" />
      <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="interwoven-fallback" aria-hidden="true">
        {ribbons.map((stream,index) => <g key={stream.id}
          opacity={highlights.length && !highlights.includes(stream.id) ? .32 : 1}
          style={{ color: "var(" + stream.color + ")" }}>
          <path d={traces[index]} stroke="currentColor" strokeWidth="10" fill="none" opacity=".14" />
          <path d={traces[index]} stroke="currentColor" strokeWidth="1.2" fill="none" opacity=".62" />
          <path d={traces[index]} stroke="currentColor" strokeWidth="3" strokeDasharray="1 15" fill="none" opacity=".82" />
        </g>)}
      </svg>
      {knots.map(knot => <button type="button" key={knot.id} className="interwoven-knot"
        style={{ left: ribbonPosition(knot.t) * 100 + "%", top: knot.y * 100 + "%" }}
        data-related={knot.streams.some(stream => highlights.includes(stream)) || undefined}
        aria-label={knot.name} title={knot.name} aria-pressed={selection === knot.id} aria-controls="interwoven-details"
        onClick={() => select(knot.id)} onPointerEnter={event => { if (event.pointerType === "mouse") setHover(knot.id); }}
        onPointerLeave={() => setHover(null)} />)}
    </div>
    <div className="interwoven-controls" role="group" aria-label="Technical disciplines">
      {ribbons.map(stream => <button type="button" key={stream.id}
        style={{ "--ribbon-tone": "var(" + stream.color + ")" } as CSSProperties}
        aria-pressed={selection === stream.id} aria-controls="interwoven-details"
        data-related={highlights.includes(stream.id) || undefined}
        onClick={() => select(stream.id)}
        onPointerEnter={event => { if (event.pointerType === "mouse") setHover(stream.id); }}
        onPointerLeave={() => setHover(null)} onFocus={() => setHover(stream.id)} onBlur={() => setHover(null)}>
        <i aria-hidden="true" />{stream.name}
      </button>)}
    </div>
    <div id="interwoven-details" className="interwoven-details" aria-live="polite" data-open={Boolean(story) || undefined}>
      {story ? <>
        <div><h3>{story.name}</h3><p>{story.text}</p></div>
        <div className="interwoven-links">
          {story.links.map(link => <Link key={link.href} href={link.href} className="portfolio-text-link">
            <span className="portfolio-link-label">{link.label}</span><ArrowUpRight className="portfolio-link-arrow" aria-hidden="true" />
          </Link>)}
        </div>
        <button type="button" className="portfolio-control interwoven-clear" aria-label="Clear intersection"
          onClick={() => { setSelection(null); setHover(null); }}><X size={15} aria-hidden="true" /></button>
      </> : <p>Choose a thread or crossing to see the work it connects.</p>}
    </div>
  </section>;
}
