"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, ScanLine } from "lucide-react";
import type { startStudio } from "./studio-runtime";
import { stationDetails, studioBays, studioStationIds, type StudioStationId } from "./studio-plan";
import styles from "./ResearchStudio.module.css";

type Stage = NonNullable<ReturnType<typeof startStudio>>;

export function ResearchStudio() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const controls = useRef<HTMLDivElement>(null);
  const runtime = useRef<Stage | null>(null);
  const touch = useRef<{ id: number; x: number; y: number; rotating: boolean } | null>(null);
  const [ready, setReady] = useState(false);
  const [focused, setFocused] = useState<StudioStationId | null>(null);
  const [hover, setHover] = useState<StudioStationId | null>(null);
  const [phase, setPhase] = useState<{ station: StudioStationId; index: number }>();
  const details = focused ? stationDetails[focused] : null;

  useEffect(() => {
    const surface = canvas.current;
    if (!surface || !window.IntersectionObserver || !window.ResizeObserver) return;
    let seen = false, stopped = false, request = 0, starting = false;
    const reconcile = () => {
      runtime.current?.visible(seen && !document.hidden);
      if (!seen || document.hidden || runtime.current || starting) return;
      starting = true;
      const token = ++request;
      import("./studio-runtime").then(({ startStudio }) => {
        if (stopped || request !== token || !seen) return;
        runtime.current = startStudio(surface, () => setReady(true), (station, index) => setPhase({ station, index }));
        runtime.current?.visible(seen);
      }).catch(() => {
        if (!stopped) setReady(false);
      }).finally(() => {
        if (token === request) starting = false;
      });
    };
    const observe = new IntersectionObserver(([entry]) => {
      seen = entry.isIntersecting;
      reconcile();
    }, { threshold: .03 });
    observe.observe(surface);
    const lose = (event: Event) => {
      event.preventDefault();
      runtime.current?.dispose();
      runtime.current = null;
      setReady(false);
    };
    surface.addEventListener("webglcontextlost", lose);
    surface.addEventListener("webglcontextrestored", reconcile);
    document.addEventListener("visibilitychange", reconcile);
    return () => {
      stopped = true;
      observe.disconnect();
      surface.removeEventListener("webglcontextlost", lose);
      surface.removeEventListener("webglcontextrestored", reconcile);
      document.removeEventListener("visibilitychange", reconcile);
      runtime.current?.dispose();
      runtime.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    runtime.current?.focus(focused);
  }, [focused, ready]);

  function inspect(station: StudioStationId) {
    setFocused(station);
  }

  function reset() {
    setFocused(null);
    setHover(null);
    runtime.current?.highlight(null);
    controls.current?.querySelector<HTMLButtonElement>(`[data-inspect="${focused}"]`)?.focus({ preventScroll: true });
  }

  return (
    <section id="research-studio" className={styles.studio} aria-labelledby="studio-title"
      data-studio-renderer={ready ? "webgl" : "fallback"} data-studio-view={focused ? "focus" : "overview"} data-studio-station={focused ?? undefined}
      onKeyDown={event => { if (event.key === "Escape" && focused) reset(); }}>
      <header className={styles.heading}>
        <div>
          <h2 id="studio-title">The Research Studio</h2>
          <p>Four disciplines, one shared laboratory.</p>
        </div>
        <div ref={controls} className={styles.controls} role="group" aria-label="Inspect a workstation">
          {studioStationIds.map(id => (
            <button key={id} type="button" className={`portfolio-control ${styles.inspect}`} data-inspect={id}
              aria-label={`Inspect ${stationDetails[id].control}`}
              aria-expanded={focused === id} aria-controls={focused === id ? "studio-details" : undefined} onClick={() => inspect(id)}>
              <ScanLine size={14} aria-hidden /><span><span className={styles.inspectPrefix}>Inspect </span>{stationDetails[id].control}</span>
            </button>
          ))}
          {focused && <button type="button" className={`portfolio-control ${styles.inspect}`} onClick={reset}>
            <ArrowLeft size={14} aria-hidden />Overview
          </button>}
        </div>
      </header>
      <div className={styles.stage} data-studio-stage data-hover={hover ?? undefined}>
        {!ready && <div className={styles.fallback}>
          <Image fill unoptimized
            src={`/images/research-studio/${details?.image ?? "overview.webp"}`}
            alt={details?.alt ?? "A four-bay laboratory cutaway with forecasting, agentic retrieval, finance, and robotics workstations"} />
        </div>}
        <canvas ref={canvas} className={styles.canvas} data-studio-canvas aria-hidden
          onPointerMove={event => {
            if (!runtime.current) return;
            if (event.pointerType === "mouse") {
              const bounds = event.currentTarget.getBoundingClientRect();
              runtime.current.lean((event.clientX - bounds.left) / bounds.width * 2 - 1);
              const over = runtime.current.hit(event.clientX, event.clientY);
              runtime.current.highlight(over);
              setHover(value => value === over ? value : over);
            } else {
              const start = touch.current;
              if (start?.id !== event.pointerId) return;
              const dx = event.clientX - start.x, dy = event.clientY - start.y;
              if (Math.abs(dx) > 11 && Math.abs(dx) > Math.abs(dy) * 1.4) start.rotating = true;
              if (start.rotating) runtime.current.lean(Math.max(-.8, Math.min(.8, dx / 135)));
            }
          }}
          onPointerLeave={() => { runtime.current?.lean(0); runtime.current?.highlight(null); setHover(null); }}
          onPointerDown={event => {
            if (event.isPrimary && event.button === 0) touch.current = {
              id: event.pointerId, x: event.clientX, y: event.clientY, rotating: false,
            };
          }}
          onPointerCancel={() => { touch.current = null; runtime.current?.lean(0); }}
          onPointerUp={event => {
            const start = touch.current;
            touch.current = null;
            if (start?.rotating) runtime.current?.lean(0);
            if (!start?.rotating && start?.id === event.pointerId && Math.hypot(event.clientX - start.x, event.clientY - start.y) < 9) {
              const id = runtime.current?.hit(event.clientX, event.clientY);
              if (id) inspect(id);
            }
          }} />
        {details && <aside key={focused} id="studio-details" className={styles.details}>
          <p className={styles.kicker}>Conceptual sequence</p>
          <h3>{details.title}</h3>
          <p>{details.summary}</p>
          {"note" in details && <p className={styles.example}>{details.note}</p>}
          <ol className={styles.phases} aria-label={details.phaseLabel}>
            {details.phases.map((label, index) => (
              <li key={label} aria-current={ready && phase?.station === focused && phase.index === index ? "step" : undefined} data-studio-phase={index}>{label}</li>
            ))}
          </ol>
          <div className={styles.links}>
            {details.projects.map(project => (
              <Link key={project.href} className="portfolio-text-link" href={project.href}>{project.label} <ArrowUpRight size={12} aria-hidden /></Link>
            ))}
          </div>
        </aside>}
      </div>
      <ul className={styles.bays} aria-label="Studio workstations">
        {studioBays.map(bay => (
          <li key={bay.id} data-highlight={bay.id === focused || bay.id === hover ? "" : undefined}>
            <span aria-hidden />{bay.title}
          </li>
        ))}
      </ul>
    </section>
  );
}
